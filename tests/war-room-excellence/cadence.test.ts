// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Unit Tests — War Room Communication Cadence Engine
 *
 * Feature: war-room-communication-excellence (WRCEP-1.0)
 * Tests: Next update computation per state, stalling detection, structured update generation
 */

import { describe, it, expect } from 'vitest';
import {
  computeNextUpdateTime,
  getCadenceForStatus,
  detectStalling,
  generateStructuredUpdate,
} from '../../packages/rules/war-room-cadence';
import { seedWarRooms } from '../../packages/contracts/src/fixtures/seed-war-rooms';

describe('War Room Cadence Engine', () => {
  describe('getCadenceForStatus', () => {
    it('returns activatedCadenceMinutes for activated status', () => {
      const warRoom = seedWarRooms[0]; // activated
      expect(getCadenceForStatus(warRoom)).toBe(30);
    });

    it('returns monitoringCadenceMinutes for monitoring status', () => {
      const warRoom = seedWarRooms[1]; // monitoring
      expect(getCadenceForStatus(warRoom)).toBe(60);
    });

    it('returns 0 for closed status', () => {
      const warRoom = seedWarRooms[2]; // closed
      expect(getCadenceForStatus(warRoom)).toBe(0);
    });
  });

  describe('computeNextUpdateTime', () => {
    it('computes next update based on activated cadence', () => {
      const warRoom = seedWarRooms[0]; // activated, 30min cadence
      const lastUpdate = '2026-02-01T08:00:00.000Z';
      const now = '2026-02-01T08:15:00.000Z';
      const result = computeNextUpdateTime(warRoom, lastUpdate, now);

      expect(result.cadenceMinutes).toBe(30);
      // 08:00 + 30min = 08:30
      expect(result.nextUpdate).toBe('2026-02-01T08:30:00.000Z');
    });

    it('computes next update based on monitoring cadence', () => {
      const warRoom = seedWarRooms[1]; // monitoring, 60min cadence
      const lastUpdate = '2026-01-26T10:00:00.000Z';
      const now = '2026-01-26T10:30:00.000Z';
      const result = computeNextUpdateTime(warRoom, lastUpdate, now);

      expect(result.cadenceMinutes).toBe(60);
      // 10:00 + 60min = 11:00
      expect(result.nextUpdate).toBe('2026-01-26T11:00:00.000Z');
    });

    it('returns cadenceMinutes 0 for closed War Room', () => {
      const warRoom = seedWarRooms[2]; // closed
      const lastUpdate = '2026-01-12T18:00:00.000Z';
      const now = '2026-01-13T08:00:00.000Z';
      const result = computeNextUpdateTime(warRoom, lastUpdate, now);

      expect(result.cadenceMinutes).toBe(0);
    });
  });

  describe('detectStalling', () => {
    it('detects stalling when minutes exceed threshold', () => {
      const warRoom = seedWarRooms[0]; // activated
      const lastAction = '2026-02-01T08:00:00.000Z';
      const now = '2026-02-01T09:00:00.000Z'; // 60 minutes later
      const result = detectStalling(warRoom, lastAction, now, 45);

      expect(result.stalling).toBe(true);
      expect(result.minutesSinceLastAction).toBe(60);
    });

    it('does not detect stalling when within threshold', () => {
      const warRoom = seedWarRooms[0]; // activated
      const lastAction = '2026-02-01T08:00:00.000Z';
      const now = '2026-02-01T08:30:00.000Z'; // 30 minutes later
      const result = detectStalling(warRoom, lastAction, now, 45);

      expect(result.stalling).toBe(false);
      expect(result.minutesSinceLastAction).toBe(30);
    });

    it('escalates when stalling in activated state', () => {
      const warRoom = seedWarRooms[0]; // activated
      const lastAction = '2026-02-01T08:00:00.000Z';
      const now = '2026-02-01T09:00:00.000Z'; // 60 min, threshold 45
      const result = detectStalling(warRoom, lastAction, now, 45);

      expect(result.shouldEscalate).toBe(true);
    });

    it('escalates when stalling duration exceeds 2x threshold', () => {
      const warRoom = seedWarRooms[1]; // monitoring
      const lastAction = '2026-01-26T08:00:00.000Z';
      const now = '2026-01-26T10:30:00.000Z'; // 150 min, threshold 60
      const result = detectStalling(warRoom, lastAction, now, 60);

      expect(result.stalling).toBe(true);
      expect(result.shouldEscalate).toBe(true);
      expect(result.minutesSinceLastAction).toBe(150);
    });

    it('does not escalate for monitoring state within 2x threshold', () => {
      const warRoom = seedWarRooms[1]; // monitoring
      const lastAction = '2026-01-26T08:00:00.000Z';
      const now = '2026-01-26T09:05:00.000Z'; // 65 min, threshold 60
      const result = detectStalling(warRoom, lastAction, now, 60);

      expect(result.stalling).toBe(true);
      expect(result.shouldEscalate).toBe(false); // only 65min, not 2x (120)
    });
  });

  describe('generateStructuredUpdate', () => {
    it('generates update with correct structure', () => {
      const warRoom = seedWarRooms[0]; // activated
      const cases = [
        { case_id: 'case-001', case_ref: 'CASE-001', status: 'in_progress', priority: 'P0' },
      ];
      const recentActions = [
        { action_id: 'act-001', description: 'Patched server', completed_at: '2026-02-01T09:00:00.000Z', actor: 'analyst-001' },
      ];
      const result = generateStructuredUpdate(warRoom, cases, recentActions);

      expect(result.war_room_ref).toBe(warRoom.war_room_ref);
      expect(result.status).toBe('activated');
      expect(result.boundCaseCount).toBe(warRoom.boundCaseIds.length);
      expect(result.sinceLastUpdate).toHaveLength(1);
      expect(result.sinceLastUpdate[0].description).toBe('Patched server');
      expect(result.aiConfidenceLevel).toBeDefined();
    });

    it('returns LOW confidence when no cases', () => {
      const warRoom = seedWarRooms[0];
      const result = generateStructuredUpdate(warRoom, [], []);
      expect(result.aiConfidenceLevel).toBe('LOW');
    });

    it('returns HIGH confidence with sufficient data', () => {
      const warRoom = seedWarRooms[0];
      const cases = [
        { case_id: 'case-001', case_ref: 'CASE-001', status: 'in_progress', priority: 'P0' },
      ];
      const recentActions = [
        { action_id: 'act-001', description: 'Action 1', completed_at: '2026-02-01T09:00:00.000Z', actor: 'analyst-001' },
        { action_id: 'act-002', description: 'Action 2', completed_at: '2026-02-01T09:10:00.000Z', actor: 'analyst-001' },
        { action_id: 'act-003', description: 'Action 3', completed_at: '2026-02-01T09:20:00.000Z', actor: 'analyst-001' },
      ];
      const result = generateStructuredUpdate(warRoom, cases, recentActions);
      expect(result.aiConfidenceLevel).toBe('HIGH');
    });
  });
});
