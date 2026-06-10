// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  ALLOWED_TRANSITIONS,
  isTransitionAllowed,
  executeTransition,
  appendTransitionRecord,
  getCurrentStatusFromHistory,
  LIFECYCLE_ACTORS,
} from '../../packages/contracts/src/entities/case-lifecycle';
import type {
  TransitionRequest,
  TransitionResult,
  CaseTransitionRecord,
  CaseLifecycleHistory,
  LifecycleActor,
} from '../../packages/contracts/src/entities/case-lifecycle';
import type { CaseStatus } from '../../packages/contracts/src/entities/case';

/**
 * Phase D1: Lifecycle Transition Engine Tests — Commander C2
 * Updated for 12-state closed-loop lifecycle (Unit 7).
 *
 * Validates:
 * - executeTransition succeeds for all 14 allowed transitions
 * - executeTransition rejects invalid actors
 * - executeTransition rejects disallowed transitions
 * - executeTransition rejects from-state mismatch
 * - TransitionResult shape correctness
 * - appendTransitionRecord immutability
 * - getCurrentStatusFromHistory logic
 * - Full lifecycle walk and reopening path
 * - Manual creation/closure paths are impossible
 */

function makeRequest(from: CaseStatus, to: CaseStatus, actor: LifecycleActor = 'system'): TransitionRequest {
  return {
    transition: { from, to },
    actor,
    reason: `Test transition from ${from} to ${to}`,
    auditEventRef: `audit-ref-${from}-${to}`,
  };
}

describe('executeTransition — allowed transitions (12-state)', () => {
  it.each([
    ['detected', 'bound', 'binding-engine'],
    ['bound', 'routed', 'routing-engine'],
    ['routed', 'prioritised', 'prioritisation-engine'],
    ['prioritised', 'action_decomposed', 'system'],
    ['action_decomposed', 'in_progress', 'system'],
    ['in_progress', 'pending_validation', 'system'],
    ['pending_validation', 'validation_running', 'validation-engine'],
    ['validation_running', 'validated_pass', 'validation-engine'],
    ['validation_running', 'validated_fail', 'validation-engine'],
    ['validated_pass', 'pending_closure_gates', 'closure-engine'],
    ['validated_fail', 'in_progress', 'system'],
    ['pending_closure_gates', 'closed_by_system', 'closure-engine'],
    ['closed_by_system', 'reopened_by_system', 'reopening-engine'],
    ['reopened_by_system', 'in_progress', 'system'],
  ] as [CaseStatus, CaseStatus, LifecycleActor][])('succeeds for %s → %s (actor: %s)', (from, to, actor) => {
    const request = makeRequest(from, to, actor);
    const result = executeTransition('case-001', from, request);

    expect(result.success).toBe(true);
    expect(result.newStatus).toBe(to);
    expect(result.previousStatus).toBe(from);
    expect(result.auditEvent).not.toBeNull();
    expect(result.error).toBeNull();
  });
});

describe('executeTransition — actor validation (12-state)', () => {
  it('rejects invalid actor (manual-user)', () => {
    const request = makeRequest('detected', 'bound', 'manual-user' as LifecycleActor);
    const result = executeTransition('case-001', 'detected', request);

    expect(result.success).toBe(false);
    expect(result.newStatus).toBeNull();
    expect(result.previousStatus).toBe('detected');
    expect(result.auditEvent).toBeNull();
    expect(result.error).toContain('Invalid actor');
  });

  it('rejects invalid actor (admin)', () => {
    const request = makeRequest('detected', 'bound', 'admin' as LifecycleActor);
    const result = executeTransition('case-001', 'detected', request);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid actor');
  });

  it('rejects wrong actor for specific transition', () => {
    // system cannot perform detected → bound (only binding-engine can)
    const request = makeRequest('detected', 'bound', 'system');
    const result = executeTransition('case-001', 'detected', request);

    expect(result.success).toBe(false);
    expect(result.error).toContain('not permitted');
  });

  it('accepts binding-engine for detected → bound', () => {
    const request = makeRequest('detected', 'bound', 'binding-engine');
    const result = executeTransition('case-001', 'detected', request);
    expect(result.success).toBe(true);
  });

  it('accepts routing-engine for bound → routed', () => {
    const request = makeRequest('bound', 'routed', 'routing-engine');
    const result = executeTransition('case-001', 'bound', request);
    expect(result.success).toBe(true);
  });
});

describe('executeTransition — disallowed transitions (12-state)', () => {
  it('rejects detected → closed_by_system (no direct closure)', () => {
    const request = makeRequest('detected', 'closed_by_system' as CaseStatus, 'closure-engine');
    const result = executeTransition('case-001', 'detected', request);

    expect(result.success).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('rejects in_progress → closed_by_system (no direct closure)', () => {
    const request = makeRequest('in_progress', 'closed_by_system' as CaseStatus, 'closure-engine');
    const result = executeTransition('case-001', 'in_progress', request);

    expect(result.success).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('rejects closed_by_system → detected (must go through reopened)', () => {
    const request = makeRequest('closed_by_system', 'detected' as CaseStatus, 'system');
    const result = executeTransition('case-001', 'closed_by_system', request);

    expect(result.success).toBe(false);
    expect(result.error).toContain('not allowed');
  });
});

describe('executeTransition — from-state mismatch (12-state)', () => {
  it('rejects when request.transition.from does not match currentStatus', () => {
    const request = makeRequest('bound', 'routed', 'routing-engine');
    // currentStatus is 'detected' but request says from is 'bound'
    const result = executeTransition('case-001', 'detected', request);

    expect(result.success).toBe(false);
    expect(result.error).toContain('does not match current status');
    expect(result.previousStatus).toBe('detected');
  });
});

describe('executeTransition — TransitionResult shape (12-state)', () => {
  it('returns correct shape on success', () => {
    const request = makeRequest('detected', 'bound', 'binding-engine');
    const result: TransitionResult = executeTransition('case-001', 'detected', request);

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('newStatus', 'bound');
    expect(result).toHaveProperty('previousStatus', 'detected');
    expect(result).toHaveProperty('error', null);
    expect(result.auditEvent).toBeDefined();
    expect(result.auditEvent!.case_id).toBe('case-001');
    expect(result.auditEvent!.from).toBe('detected');
    expect(result.auditEvent!.to).toBe('bound');
    expect(result.auditEvent!.actor).toBe('binding-engine');
    expect(result.auditEvent!.reason).toBeTruthy();
    expect(result.auditEvent!.auditEventRef).toBeTruthy();
    expect(result.auditEvent!.timestamp).toBeTruthy();
    expect(result.auditEvent!.id).toBeTruthy();
  });

  it('returns correct shape on failure', () => {
    const request = makeRequest('detected', 'closed_by_system' as CaseStatus, 'closure-engine');
    const result: TransitionResult = executeTransition('case-001', 'detected', request);

    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('newStatus', null);
    expect(result).toHaveProperty('previousStatus', 'detected');
    expect(result).toHaveProperty('auditEvent', null);
    expect(result.error).toBeTruthy();
  });
});

describe('appendTransitionRecord (12-state)', () => {
  it('adds a record to history immutably', () => {
    const history: CaseLifecycleHistory = { case_id: 'case-001', records: [] };
    const record: CaseTransitionRecord = {
      id: 'txn-001',
      case_id: 'case-001',
      from: 'detected',
      to: 'bound',
      actor: 'binding-engine',
      reason: 'Test',
      auditEventRef: 'audit-001',
      timestamp: '2026-01-18T10:00:00.000Z',
    };

    const updated = appendTransitionRecord(history, record);

    expect(updated.records).toHaveLength(1);
    expect(updated.records[0]).toEqual(record);
    // Original is unchanged (immutable)
    expect(history.records).toHaveLength(0);
  });

  it('appends to existing records', () => {
    const existing: CaseTransitionRecord = {
      id: 'txn-001',
      case_id: 'case-001',
      from: 'detected',
      to: 'bound',
      actor: 'binding-engine',
      reason: 'First',
      auditEventRef: 'audit-001',
      timestamp: '2026-01-18T10:00:00.000Z',
    };
    const history: CaseLifecycleHistory = { case_id: 'case-001', records: [existing] };
    const newRecord: CaseTransitionRecord = {
      id: 'txn-002',
      case_id: 'case-001',
      from: 'bound',
      to: 'routed',
      actor: 'routing-engine',
      reason: 'Second',
      auditEventRef: 'audit-002',
      timestamp: '2026-01-18T11:00:00.000Z',
    };

    const updated = appendTransitionRecord(history, newRecord);

    expect(updated.records).toHaveLength(2);
    expect(updated.records[0]).toEqual(existing);
    expect(updated.records[1]).toEqual(newRecord);
  });
});

describe('getCurrentStatusFromHistory (12-state)', () => {
  it('returns detected for empty history', () => {
    const history: CaseLifecycleHistory = { case_id: 'case-001', records: [] };
    expect(getCurrentStatusFromHistory(history)).toBe('detected');
  });

  it('returns last transition to-state', () => {
    const history: CaseLifecycleHistory = {
      case_id: 'case-001',
      records: [
        {
          id: 'txn-001',
          case_id: 'case-001',
          from: 'detected',
          to: 'bound',
          actor: 'binding-engine',
          reason: 'Start',
          auditEventRef: 'audit-001',
          timestamp: '2026-01-18T10:00:00.000Z',
        },
        {
          id: 'txn-002',
          case_id: 'case-001',
          from: 'bound',
          to: 'routed',
          actor: 'routing-engine',
          reason: 'Route',
          auditEventRef: 'audit-002',
          timestamp: '2026-01-18T11:00:00.000Z',
        },
      ],
    };
    expect(getCurrentStatusFromHistory(history)).toBe('routed');
  });
});

describe('Full lifecycle walk (12-state)', () => {
  it('detected → ... → closed_by_system (happy path)', () => {
    const caseId = 'case-lifecycle-walk';
    let history: CaseLifecycleHistory = { case_id, records: [] };
    let status: CaseStatus = 'detected';

    const steps: [CaseStatus, CaseStatus, LifecycleActor][] = [
      ['detected', 'bound', 'binding-engine'],
      ['bound', 'routed', 'routing-engine'],
      ['routed', 'prioritised', 'prioritisation-engine'],
      ['prioritised', 'action_decomposed', 'system'],
      ['action_decomposed', 'in_progress', 'system'],
      ['in_progress', 'pending_validation', 'system'],
      ['pending_validation', 'validation_running', 'validation-engine'],
      ['validation_running', 'validated_pass', 'validation-engine'],
      ['validated_pass', 'pending_closure_gates', 'closure-engine'],
      ['pending_closure_gates', 'closed_by_system', 'closure-engine'],
    ];

    for (const [from, to, actor] of steps) {
      const request = makeRequest(from, to, actor);
      const result = executeTransition(caseId, status, request);
      expect(result.success).toBe(true);
      expect(result.newStatus).toBe(to);
      history = appendTransitionRecord(history, result.auditEvent!);
      status = result.newStatus!;
    }

    expect(getCurrentStatusFromHistory(history)).toBe('closed_by_system');
    expect(history.records).toHaveLength(10);
  });

  it('reopening: closed_by_system → reopened_by_system → in_progress', () => {
    const caseId = 'case-reopen';
    let history: CaseLifecycleHistory = { case_id, records: [] };
    let status: CaseStatus = 'closed_by_system';

    const steps: [CaseStatus, CaseStatus, LifecycleActor][] = [
      ['closed_by_system', 'reopened_by_system', 'reopening-engine'],
      ['reopened_by_system', 'in_progress', 'system'],
    ];

    for (const [from, to, actor] of steps) {
      const request = makeRequest(from, to, actor);
      const result = executeTransition(caseId, status, request);
      expect(result.success).toBe(true);
      history = appendTransitionRecord(history, result.auditEvent!);
      status = result.newStatus!;
    }

    expect(getCurrentStatusFromHistory(history)).toBe('in_progress');
  });
});

describe('Doctrinal enforcement — no manual paths (12-state)', () => {
  it('no transition TO detected exists (manual creation impossible)', () => {
    const transitionsToDetected = ALLOWED_TRANSITIONS.filter((t) => t.to === 'detected');
    expect(transitionsToDetected).toHaveLength(0);
  });

  it('no direct transition from detected to closed_by_system (manual closure impossible)', () => {
    expect(isTransitionAllowed('detected', 'closed_by_system')).toBe(false);
  });

  it('no direct transition from in_progress to closed_by_system (manual closure impossible)', () => {
    expect(isTransitionAllowed('in_progress', 'closed_by_system')).toBe(false);
  });
});
