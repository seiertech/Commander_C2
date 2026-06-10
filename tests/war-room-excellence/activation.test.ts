// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Unit Tests — War Room Activation Engine
 *
 * Feature: war-room-communication-excellence (WRCEP-1.0)
 * Tests: P0 condition detection, non-P0 rejection, system-rule vs senior-decision, sequence enforcement
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateActivationCondition,
  createWarRoom,
  bindCaseToWarRoom,
} from '../../packages/rules/war-room-activation';
import type { Case } from '../../packages/contracts/src/entities/case';
import { SEED_TENANT, SEED_SOURCE } from '../../packages/contracts/src/fixtures/seed-tenant';

// ─── Test Case Factory ───────────────────────────────────────────────────────

function makeCase(overrides: Partial<Case> = {}): Case {
  return {
    id: 'case-test-001',
    entity_type: 'case',
    tenant: SEED_TENANT,
    created_at: '2026-02-01T08:00:00.000Z',
    updated_at: '2026-02-01T08:00:00.000Z',
    source: SEED_SOURCE,
    case_ref: 'CASE-TEST-001',
    case_type: 'vulnerability',
    title: 'Critical vulnerability on external server',
    status: 'prioritised',
    priority: 'P0',
    owner: 'analyst-001',
    team: 'Security Operations',
    sla: { target_resolution_hours: 4, breached: false },
    surface_attribution: 'external_attack_surface',
    related_entities: [],
    auditTrailRef: 'audit-case-test-001',
    routingRationale: 'Auto-routed by routing engine',
    ...overrides,
  } as Case;
}

describe('War Room Activation Engine', () => {
  describe('evaluateActivationCondition — sequence enforcement', () => {
    it('rejects activation for case in detected state (pre-prioritisation)', () => {
      const caseData = makeCase({ status: 'detected' });
      const result = evaluateActivationCondition(caseData);
      expect(result.shouldActivate).toBe(false);
      expect(result.reason).toContain('not reached prioritisation');
    });

    it('rejects activation for case in bound state (pre-prioritisation)', () => {
      const caseData = makeCase({ status: 'bound' });
      const result = evaluateActivationCondition(caseData);
      expect(result.shouldActivate).toBe(false);
      expect(result.reason).toContain('not reached prioritisation');
    });

    it('rejects activation for case in routed state (pre-prioritisation)', () => {
      const caseData = makeCase({ status: 'routed' });
      const result = evaluateActivationCondition(caseData);
      expect(result.shouldActivate).toBe(false);
      expect(result.reason).toContain('not reached prioritisation');
    });
  });

  describe('evaluateActivationCondition — priority check', () => {
    it('rejects activation for P1 priority case', () => {
      const caseData = makeCase({ priority: 'P1' });
      const result = evaluateActivationCondition(caseData);
      expect(result.shouldActivate).toBe(false);
      expect(result.reason).toContain('requires P0');
    });

    it('rejects activation for P2 priority case', () => {
      const caseData = makeCase({ priority: 'P2' });
      const result = evaluateActivationCondition(caseData);
      expect(result.shouldActivate).toBe(false);
      expect(result.reason).toContain('requires P0');
    });

    it('rejects activation for P3 priority case', () => {
      const caseData = makeCase({ priority: 'P3' });
      const result = evaluateActivationCondition(caseData);
      expect(result.shouldActivate).toBe(false);
    });
  });

  describe('evaluateActivationCondition — system_rule: KEV + CVSS + external', () => {
    it('activates when P0 + KEV + CVSS ≥ 9.5 + external-facing', () => {
      const caseData = makeCase();
      const result = evaluateActivationCondition(caseData, {
        priority: 'P0',
        kevListed: true,
        cvss_score: 10.0,
        externalFacing: true,
      });
      expect(result.shouldActivate).toBe(true);
      expect(result.activation_source).toBe('system_rule');
      expect(result.reason).toContain('KEV');
      expect(result.reason).toContain('CVSS');
    });

    it('activates at exact boundary: CVSS 9.5', () => {
      const caseData = makeCase();
      const result = evaluateActivationCondition(caseData, {
        priority: 'P0',
        kevListed: true,
        cvss_score: 9.5,
        externalFacing: true,
      });
      expect(result.shouldActivate).toBe(true);
      expect(result.activation_source).toBe('system_rule');
    });

    it('does NOT activate with CVSS 9.4 (below threshold)', () => {
      const caseData = makeCase();
      const result = evaluateActivationCondition(caseData, {
        priority: 'P0',
        kevListed: true,
        cvss_score: 9.4,
        externalFacing: true,
      });
      expect(result.shouldActivate).toBe(false);
    });

    it('does NOT activate without KEV', () => {
      const caseData = makeCase();
      const result = evaluateActivationCondition(caseData, {
        priority: 'P0',
        kevListed: false,
        cvss_score: 10.0,
        externalFacing: true,
      });
      expect(result.shouldActivate).toBe(false);
    });

    it('does NOT activate without external-facing', () => {
      const caseData = makeCase();
      const result = evaluateActivationCondition(caseData, {
        priority: 'P0',
        kevListed: true,
        cvss_score: 10.0,
        externalFacing: false,
      });
      expect(result.shouldActivate).toBe(false);
    });
  });

  describe('evaluateActivationCondition — system_rule: active exploitation', () => {
    it('activates when P0 + active exploitation', () => {
      const caseData = makeCase();
      const result = evaluateActivationCondition(caseData, {
        priority: 'P0',
        activeExploitation: true,
      });
      expect(result.shouldActivate).toBe(true);
      expect(result.activation_source).toBe('system_rule');
      expect(result.reason).toContain('active exploitation');
    });
  });

  describe('evaluateActivationCondition — senior_decision fallback', () => {
    it('returns senior_decision when P0 but no system rule matches', () => {
      const caseData = makeCase();
      const result = evaluateActivationCondition(caseData, {
        priority: 'P0',
        kevListed: false,
        activeExploitation: false,
      });
      expect(result.shouldActivate).toBe(false);
      expect(result.activation_source).toBe('senior_decision');
      expect(result.reason).toContain('Senior decision required');
    });
  });

  describe('evaluateActivationCondition — post-prioritisation states', () => {
    it('allows activation for case in action_decomposed state', () => {
      const caseData = makeCase({ status: 'action_decomposed' });
      const result = evaluateActivationCondition(caseData, {
        priority: 'P0',
        activeExploitation: true,
      });
      expect(result.shouldActivate).toBe(true);
    });

    it('allows activation for case in in_progress state', () => {
      const caseData = makeCase({ status: 'in_progress' });
      const result = evaluateActivationCondition(caseData, {
        priority: 'P0',
        activeExploitation: true,
      });
      expect(result.shouldActivate).toBe(true);
    });
  });

  describe('createWarRoom', () => {
    it('creates a War Room with correct structure', () => {
      const caseData = makeCase();
      const activationResult = {
        shouldActivate: true,
        reason: 'System rule: test',
        activation_source: 'system_rule' as const,
      };
      const warRoom = createWarRoom(activationResult, caseData, 'senior-001', '2026-02-01T08:00:00.000Z');

      expect(warRoom.entity_type).toBe('war-room');
      expect(warRoom.status).toBe('activated');
      expect(warRoom.activation_source).toBe('system_rule');
      expect(warRoom.boundCaseIds).toContain(caseData.id);
      expect(warRoom.seniorOwnerId).toBe('senior-001');
      expect(warRoom.membership).toHaveLength(1);
      expect(warRoom.membership[0].role).toBe('senior_owner');
      expect(warRoom.aiOrientationState).toBe('active');
      expect(warRoom.closeOutReportRef).toBeNull();
    });
  });

  describe('bindCaseToWarRoom', () => {
    it('adds a new case to boundCaseIds', () => {
      const caseData = makeCase();
      const activationResult = {
        shouldActivate: true,
        reason: 'Test',
        activation_source: 'system_rule' as const,
      };
      const warRoom = createWarRoom(activationResult, caseData, 'senior-001', '2026-02-01T08:00:00.000Z');
      const updated = bindCaseToWarRoom(warRoom, 'case-new-002');

      expect(updated.boundCaseIds).toContain('case-new-002');
      expect(updated.boundCaseIds).toHaveLength(2);
    });

    it('is idempotent — does not duplicate existing case', () => {
      const caseData = makeCase();
      const activationResult = {
        shouldActivate: true,
        reason: 'Test',
        activation_source: 'system_rule' as const,
      };
      const warRoom = createWarRoom(activationResult, caseData, 'senior-001', '2026-02-01T08:00:00.000Z');
      const updated = bindCaseToWarRoom(warRoom, caseData.id);

      expect(updated.boundCaseIds).toHaveLength(1);
      expect(updated).toBe(warRoom); // Same reference — no mutation
    });
  });
});
