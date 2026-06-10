import { describe, it, expect } from 'vitest';
import {
  ALLOWED_TRANSITIONS,
  isTransitionAllowed,
  getNextStates,
  getPermittedActors,
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
 * Unit 7: 12-State Lifecycle Transition Tests
 *
 * Validates:
 * - All 14 allowed transitions succeed with correct actors
 * - Transition graph completeness (12 states, 14 edges)
 * - getNextStates returns correct successors
 * - getPermittedActors returns correct actor sets
 * - Full lifecycle walk (happy path)
 * - Remediation loop (validated_fail → in_progress)
 * - Reopening path (closed_by_system → reopened_by_system → in_progress)
 * - appendTransitionRecord immutability
 * - getCurrentStatusFromHistory returns 'detected' for empty history
 */

function makeRequest(from: CaseStatus, to: CaseStatus, actor: LifecycleActor): TransitionRequest {
  return {
    transition: { from, to },
    actor,
    reason: `Test transition from ${from} to ${to}`,
    auditEventRef: `audit-ref-${from}-${to}`,
  };
}

describe('12-State Lifecycle — ALLOWED_TRANSITIONS structure', () => {
  it('has exactly 15 transitions', () => {
    expect(ALLOWED_TRANSITIONS).toHaveLength(15);
  });

  it('covers all 12 states as source (from) at least once except terminal validated_pass/validated_fail which have outgoing edges', () => {
    const fromStates = new Set(ALLOWED_TRANSITIONS.map((t) => t.from));
    // All states except validated_pass and validated_fail have outgoing edges
    // Actually validated_pass → pending_closure_gates and validated_fail → in_progress
    // So all 12 states except... let's check which have no outgoing
    const allStates: CaseStatus[] = [
      'detected', 'bound', 'routed', 'prioritised', 'action_decomposed',
      'in_progress', 'pending_validation', 'validation_running',
      'validated_pass', 'validated_fail', 'pending_closure_gates',
      'closed_by_system', 'reopened_by_system',
    ];
    // reopened_by_system has outgoing to in_progress
    // The only state with no outgoing is... none actually, all have outgoing except
    // Let's just verify all states appear as 'from' except none
    const statesWithNoOutgoing = allStates.filter((s) => !fromStates.has(s));
    // validated_pass and validated_fail both have outgoing edges
    // The only states with no outgoing should be none in a closed loop
    // Actually: closed_by_system → reopened_by_system, reopened_by_system → in_progress
    // So all states have outgoing edges. Let's verify.
    expect(statesWithNoOutgoing).toHaveLength(0);
  });

  it('every transition has at least one permitted actor', () => {
    for (const t of ALLOWED_TRANSITIONS) {
      expect(t.permittedActors.length).toBeGreaterThan(0);
    }
  });
});

describe('12-State Lifecycle — executeTransition succeeds for all allowed transitions', () => {
  const transitionCases: [CaseStatus, CaseStatus, LifecycleActor][] = [
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
  ];

  it.each(transitionCases)('succeeds for %s → %s (actor: %s)', (from, to, actor) => {
    const request = makeRequest(from, to, actor);
    const result = executeTransition('case-001', from, request);

    expect(result.success).toBe(true);
    expect(result.newStatus).toBe(to);
    expect(result.previousStatus).toBe(from);
    expect(result.auditEvent).not.toBeNull();
    expect(result.error).toBeNull();
  });
});

describe('12-State Lifecycle — isTransitionAllowed', () => {
  it('returns true for all allowed transitions', () => {
    for (const t of ALLOWED_TRANSITIONS) {
      expect(isTransitionAllowed(t.from, t.to)).toBe(true);
    }
  });

  it('returns false for disallowed transitions', () => {
    expect(isTransitionAllowed('detected', 'in_progress')).toBe(false);
    expect(isTransitionAllowed('detected', 'closed_by_system')).toBe(false);
    expect(isTransitionAllowed('in_progress', 'closed_by_system')).toBe(false);
    expect(isTransitionAllowed('bound', 'closed_by_system')).toBe(false);
  });
});

describe('12-State Lifecycle — getNextStates', () => {
  it('detected → [bound]', () => {
    expect(getNextStates('detected')).toEqual(['bound']);
  });

  it('validation_running → [validated_pass, validated_fail]', () => {
    const next = getNextStates('validation_running');
    expect(next).toContain('validated_pass');
    expect(next).toContain('validated_fail');
    expect(next).toHaveLength(2);
  });

  it('in_progress → [pending_validation, prioritised]', () => {
    expect(getNextStates('in_progress')).toEqual(['pending_validation', 'prioritised']);
  });
});

describe('12-State Lifecycle — getPermittedActors', () => {
  it('detected → bound requires binding-engine', () => {
    expect(getPermittedActors('detected', 'bound')).toEqual(['binding-engine']);
  });

  it('bound → routed requires routing-engine', () => {
    expect(getPermittedActors('bound', 'routed')).toEqual(['routing-engine']);
  });

  it('returns empty array for disallowed transition', () => {
    expect(getPermittedActors('detected', 'closed_by_system')).toEqual([]);
  });
});

describe('12-State Lifecycle — full lifecycle walk (happy path)', () => {
  it('detected → ... → closed_by_system', () => {
    const caseId = 'case-full-walk';
    let history: CaseLifecycleHistory = { caseId, records: [] };
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
});

describe('12-State Lifecycle — remediation loop', () => {
  it('validated_fail → in_progress (remediation) → pending_validation → validation_running → validated_pass', () => {
    const caseId = 'case-remediation';
    let status: CaseStatus = 'validated_fail';

    // Remediation loop back to in_progress
    let result = executeTransition(caseId, status, makeRequest('validated_fail', 'in_progress', 'system'));
    expect(result.success).toBe(true);
    status = result.newStatus!;

    // Continue through validation again
    result = executeTransition(caseId, status, makeRequest('in_progress', 'pending_validation', 'system'));
    expect(result.success).toBe(true);
    status = result.newStatus!;

    result = executeTransition(caseId, status, makeRequest('pending_validation', 'validation_running', 'validation-engine'));
    expect(result.success).toBe(true);
    status = result.newStatus!;

    result = executeTransition(caseId, status, makeRequest('validation_running', 'validated_pass', 'validation-engine'));
    expect(result.success).toBe(true);
    expect(result.newStatus).toBe('validated_pass');
  });
});

describe('12-State Lifecycle — reopening path', () => {
  it('closed_by_system → reopened_by_system → in_progress', () => {
    const caseId = 'case-reopen';
    let status: CaseStatus = 'closed_by_system';

    let result = executeTransition(caseId, status, makeRequest('closed_by_system', 'reopened_by_system', 'reopening-engine'));
    expect(result.success).toBe(true);
    status = result.newStatus!;

    result = executeTransition(caseId, status, makeRequest('reopened_by_system', 'in_progress', 'system'));
    expect(result.success).toBe(true);
    expect(result.newStatus).toBe('in_progress');
  });
});

describe('12-State Lifecycle — appendTransitionRecord immutability', () => {
  it('does not mutate original history', () => {
    const history: CaseLifecycleHistory = { caseId: 'case-001', records: [] };
    const record: CaseTransitionRecord = {
      id: 'txn-001',
      caseId: 'case-001',
      from: 'detected',
      to: 'bound',
      actor: 'binding-engine',
      reason: 'Test',
      auditEventRef: 'audit-001',
      timestamp: '2026-01-18T10:00:00.000Z',
    };

    const updated = appendTransitionRecord(history, record);
    expect(updated.records).toHaveLength(1);
    expect(history.records).toHaveLength(0);
  });
});

describe('12-State Lifecycle — getCurrentStatusFromHistory', () => {
  it('returns detected for empty history', () => {
    const history: CaseLifecycleHistory = { caseId: 'case-001', records: [] };
    expect(getCurrentStatusFromHistory(history)).toBe('detected');
  });

  it('returns last transition to-state', () => {
    const history: CaseLifecycleHistory = {
      caseId: 'case-001',
      records: [
        {
          id: 'txn-001',
          caseId: 'case-001',
          from: 'detected',
          to: 'bound',
          actor: 'binding-engine',
          reason: 'Bind',
          auditEventRef: 'audit-001',
          timestamp: '2026-01-18T10:00:00.000Z',
        },
        {
          id: 'txn-002',
          caseId: 'case-001',
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

describe('12-State Lifecycle — LIFECYCLE_ACTORS', () => {
  it('contains all 15 actors', () => {
    expect(LIFECYCLE_ACTORS).toHaveLength(15);
    expect(LIFECYCLE_ACTORS).toContain('system');
    expect(LIFECYCLE_ACTORS).toContain('routing-engine');
    expect(LIFECYCLE_ACTORS).toContain('binding-engine');
    expect(LIFECYCLE_ACTORS).toContain('prioritisation-engine');
    expect(LIFECYCLE_ACTORS).toContain('validation-engine');
    expect(LIFECYCLE_ACTORS).toContain('closure-engine');
    expect(LIFECYCLE_ACTORS).toContain('reopening-engine');
    expect(LIFECYCLE_ACTORS).toContain('reassessment-engine');
    expect(LIFECYCLE_ACTORS).toContain('correlation-engine');
    expect(LIFECYCLE_ACTORS).toContain('enrichment-engine');
    expect(LIFECYCLE_ACTORS).toContain('effectiveness-engine');
    expect(LIFECYCLE_ACTORS).toContain('war-room-activation-engine');
    expect(LIFECYCLE_ACTORS).toContain('war-room-communication-engine');
    expect(LIFECYCLE_ACTORS).toContain('close-out-engine');
    expect(LIFECYCLE_ACTORS).toContain('war-room-ai-engine');
  });
});
