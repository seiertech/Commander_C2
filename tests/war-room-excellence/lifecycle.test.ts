/**
 * Unit Tests — War Room Lifecycle Engine
 *
 * Feature: war-room-communication-excellence (WRCEP-1.0)
 * Tests: Valid transitions, invalid transitions rejected, actor enforcement
 */

import { describe, it, expect } from 'vitest';
import {
  transitionWarRoom,
  isWarRoomTransitionAllowed,
  getWarRoomNextStatuses,
} from '../../packages/rules/war-room-lifecycle';
import { seedWarRooms } from '../../packages/contracts/src/fixtures/seed-war-rooms';
import type { WarRoomStatus } from '../../packages/contracts/src/entities/war-room';
import { WAR_ROOM_STATUSES } from '../../packages/contracts/src/entities/war-room';

describe('War Room Lifecycle Engine', () => {
  describe('isWarRoomTransitionAllowed', () => {
    it('allows activated → monitoring', () => {
      expect(isWarRoomTransitionAllowed('activated', 'monitoring')).toBe(true);
    });

    it('allows monitoring → winding_down', () => {
      expect(isWarRoomTransitionAllowed('monitoring', 'winding_down')).toBe(true);
    });

    it('allows winding_down → closed', () => {
      expect(isWarRoomTransitionAllowed('winding_down', 'closed')).toBe(true);
    });

    it('rejects reverse transition monitoring → activated', () => {
      expect(isWarRoomTransitionAllowed('monitoring', 'activated')).toBe(false);
    });

    it('rejects skip transition activated → winding_down', () => {
      expect(isWarRoomTransitionAllowed('activated', 'winding_down')).toBe(false);
    });

    it('rejects skip transition activated → closed', () => {
      expect(isWarRoomTransitionAllowed('activated', 'closed')).toBe(false);
    });

    it('rejects reverse transition closed → activated', () => {
      expect(isWarRoomTransitionAllowed('closed', 'activated')).toBe(false);
    });

    it('rejects self-transition', () => {
      expect(isWarRoomTransitionAllowed('activated', 'activated')).toBe(false);
    });
  });

  describe('getWarRoomNextStatuses', () => {
    it('activated can go to monitoring', () => {
      expect(getWarRoomNextStatuses('activated')).toEqual(['monitoring']);
    });

    it('monitoring can go to winding_down', () => {
      expect(getWarRoomNextStatuses('monitoring')).toEqual(['winding_down']);
    });

    it('winding_down can go to closed', () => {
      expect(getWarRoomNextStatuses('winding_down')).toEqual(['closed']);
    });

    it('closed has no next states', () => {
      expect(getWarRoomNextStatuses('closed')).toEqual([]);
    });
  });

  describe('transitionWarRoom', () => {
    const activatedWarRoom = seedWarRooms[0]; // status: 'activated'
    const monitoringWarRoom = seedWarRooms[1]; // status: 'monitoring'
    const timestamp = '2026-02-01T12:00:00.000Z';

    it('succeeds: activated → monitoring by senior_owner', () => {
      const result = transitionWarRoom(activatedWarRoom, 'monitoring', 'senior_owner', 'Threat contained', timestamp);
      expect(result.success).toBe(true);
      expect(result.warRoom).not.toBeNull();
      expect(result.warRoom!.status).toBe('monitoring');
      expect(result.warRoom!.updated_at).toBe(timestamp);
    });

    it('succeeds: monitoring → winding_down by senior_owner', () => {
      const result = transitionWarRoom(monitoringWarRoom, 'winding_down', 'senior_owner', 'Resolution confirmed', timestamp);
      expect(result.success).toBe(true);
      expect(result.warRoom!.status).toBe('winding_down');
    });

    it('succeeds: transition by system actor', () => {
      const result = transitionWarRoom(activatedWarRoom, 'monitoring', 'system', 'Auto-transition', timestamp);
      expect(result.success).toBe(true);
      expect(result.warRoom!.status).toBe('monitoring');
    });

    it('rejects: invalid target status', () => {
      const result = transitionWarRoom(activatedWarRoom, 'invalid' as WarRoomStatus, 'senior_owner', 'Test', timestamp);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid target status');
    });

    it('rejects: transition not allowed (skip)', () => {
      const result = transitionWarRoom(activatedWarRoom, 'closed', 'senior_owner', 'Skip', timestamp);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('rejects: reverse transition', () => {
      const result = transitionWarRoom(monitoringWarRoom, 'activated', 'senior_owner', 'Revert', timestamp);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('rejects: analyst cannot transition', () => {
      const result = transitionWarRoom(activatedWarRoom, 'monitoring', 'analyst', 'Analyst transition', timestamp);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not permitted');
    });

    it('rejects: coordinator cannot transition', () => {
      const result = transitionWarRoom(activatedWarRoom, 'monitoring', 'coordinator', 'Coord transition', timestamp);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not permitted');
    });

    it('rejects: observer cannot transition', () => {
      const result = transitionWarRoom(activatedWarRoom, 'monitoring', 'observer', 'Observer transition', timestamp);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not permitted');
    });
  });
});
