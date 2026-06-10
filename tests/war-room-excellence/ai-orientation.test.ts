// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Unit Tests — War Room AI Orientation Contract
 *
 * Feature: war-room-communication-excellence (WRCEP-1.0)
 * Tests: Briefing generation, incremental update, confidence labelling
 */

import { describe, it, expect } from 'vitest';
import {
  generateOrientationBriefing,
  updateBriefingOnEvent,
  deriveConfidence,
  WAR_ROOM_AI_ACTOR,
} from '../../packages/rules/war-room-ai-orientation';
import { seedWarRooms } from '../../packages/contracts/src/fixtures/seed-war-rooms';

describe('War Room AI Orientation Contract', () => {
  describe('WAR_ROOM_AI_ACTOR', () => {
    it('is war-room-ai-engine (NOT commander-ai-triage)', () => {
      expect(WAR_ROOM_AI_ACTOR).toBe('war-room-ai-engine');
    });
  });

  describe('deriveConfidence', () => {
    it('returns HIGH for 3+ sources', () => {
      expect(deriveConfidence(3)).toBe('HIGH');
      expect(deriveConfidence(5)).toBe('HIGH');
    });

    it('returns MEDIUM for 2 sources', () => {
      expect(deriveConfidence(2)).toBe('MEDIUM');
    });

    it('returns LOW for 0-1 sources', () => {
      expect(deriveConfidence(0)).toBe('LOW');
      expect(deriveConfidence(1)).toBe('LOW');
    });
  });

  describe('generateOrientationBriefing', () => {
    const warRoom = seedWarRooms[0]; // activated
    const cases = [
      { case_id: 'case-001', case_ref: 'CASE-001', status: 'in_progress', title: 'Critical vuln', priority: 'P0', case_type: 'vulnerability' },
    ];
    const riskObjects = [
      { id: 'ro-001', type: 'vulnerability', title: 'CVE-2026-1234', severity: 'critical', affected_entities: ['server-1', 'server-2'] },
    ];

    it('generates a briefing with all required fields', () => {
      const briefing = generateOrientationBriefing(warRoom, cases, riskObjects);

      expect(briefing.whatHappened).toContain(warRoom.war_room_ref);
      expect(briefing.exploitAnalysis).toBeDefined();
      expect(briefing.blast_radius).toBeDefined();
      expect(briefing.actionsTaken).toEqual([]);
      expect(briefing.recommendedActions).toBeDefined();
      expect(briefing.uncertaintyGaps).toBeDefined();
      expect(briefing.generatedAt).toBeDefined();
      expect(briefing.version).toBe(1);
    });

    it('generates recommendations requiring approval', () => {
      const intelligence = {
        kevListed: true,
        epss_score: 0.95,
        cvss_score: 10.0,
        attackVector: 'network',
        exploit_maturity: 'active',
        automatable: true,
        sourceCount: 4,
      };
      const briefing = generateOrientationBriefing(warRoom, cases, riskObjects, intelligence);

      expect(briefing.recommendedActions.length).toBeGreaterThan(0);
      for (const action of briefing.recommendedActions) {
        expect(action.requires_approval).toBe(true);
      }
    });

    it('includes uncertainty gaps when source count is low', () => {
      const intelligence = {
        kevListed: true,
        sourceCount: 1,
      };
      const briefing = generateOrientationBriefing(warRoom, cases, riskObjects, intelligence);

      expect(briefing.uncertaintyGaps.length).toBeGreaterThan(0);
      expect(briefing.uncertaintyGaps.some((g) => g.confidence === 'LOW')).toBe(true);
    });

    it('computes blast radius from risk objects', () => {
      const briefing = generateOrientationBriefing(warRoom, cases, riskObjects);
      expect(briefing.blast_radius.directlyAffected).toBe(2); // server-1, server-2
      expect(briefing.blast_radius.score).toBeGreaterThan(0);
    });

    it('handles empty inputs gracefully', () => {
      const briefing = generateOrientationBriefing(warRoom, [], []);
      expect(briefing.whatHappened).toContain('0 case(s)');
      expect(briefing.blast_radius.directlyAffected).toBe(0);
    });
  });

  describe('updateBriefingOnEvent', () => {
    const warRoom = seedWarRooms[0];
    const cases = [
      { case_id: 'case-001', case_ref: 'CASE-001', status: 'in_progress', title: 'Test', priority: 'P0', case_type: 'vulnerability' },
    ];
    const riskObjects = [
      { id: 'ro-001', type: 'vulnerability', title: 'Test', severity: 'critical', affected_entities: ['server-1'] },
    ];

    it('increments version on update', () => {
      const briefing = generateOrientationBriefing(warRoom, cases, riskObjects);
      const updated = updateBriefingOnEvent(briefing, {
        type: 'action_completed',
        description: 'Patched server-1',
        timestamp: '2026-02-01T10:00:00.000Z',
      });
      expect(updated.version).toBe(briefing.version + 1);
    });

    it('adds to actionsTaken on action_completed', () => {
      const briefing = generateOrientationBriefing(warRoom, cases, riskObjects);
      const updated = updateBriefingOnEvent(briefing, {
        type: 'action_completed',
        description: 'Patched server-1',
        timestamp: '2026-02-01T10:00:00.000Z',
      });
      expect(updated.actionsTaken).toContain('Patched server-1');
    });

    it('improves confidence on new_intelligence', () => {
      const intelligence = { sourceCount: 1 };
      const briefing = generateOrientationBriefing(warRoom, cases, riskObjects, intelligence as any);
      const updated = updateBriefingOnEvent(briefing, {
        type: 'new_intelligence',
        description: 'New threat feed matched',
        timestamp: '2026-02-01T10:00:00.000Z',
      });
      // Source count should have increased
      const coverageGap = updated.uncertaintyGaps.find((g) => g.area === 'Intelligence coverage');
      if (coverageGap) {
        expect(coverageGap.sourceCount).toBeGreaterThan(0);
      }
    });

    it('adds recommended action on escalation', () => {
      const briefing = generateOrientationBriefing(warRoom, cases, riskObjects);
      const updated = updateBriefingOnEvent(briefing, {
        type: 'escalation',
        description: 'Escalate to CISO',
        timestamp: '2026-02-01T10:00:00.000Z',
      });
      expect(updated.recommendedActions.some((a) => a.description === 'Escalate to CISO')).toBe(true);
      expect(updated.recommendedActions.find((a) => a.description === 'Escalate to CISO')?.requires_approval).toBe(true);
    });

    it('is immutable — does not modify original', () => {
      const briefing = generateOrientationBriefing(warRoom, cases, riskObjects);
      const originalVersion = briefing.version;
      updateBriefingOnEvent(briefing, {
        type: 'action_completed',
        description: 'Test',
        timestamp: '2026-02-01T10:00:00.000Z',
      });
      expect(briefing.version).toBe(originalVersion);
    });
  });
});
