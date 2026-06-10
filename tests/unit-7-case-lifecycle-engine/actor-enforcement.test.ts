import { describe, it, expect } from 'vitest';
import {
  executeTransition,
  ALLOWED_TRANSITIONS,
  LIFECYCLE_ACTORS,
} from '../../packages/contracts/src/entities/case-lifecycle';
import type { LifecycleActor, TransitionRequest } from '../../packages/contracts/src/entities/case-lifecycle';
import type { CaseStatus } from '../../packages/contracts/src/entities/case';

/**
 * Unit 7: Actor Enforcement Tests
 *
 * Validates:
 * - Each transition only accepts its permitted actors
 * - Invalid actors are rejected with clear error messages
 * - Per-transition actor validation is enforced
 * - No actor can perform transitions outside its permitted set
 */

function makeRequest(from: CaseStatus, to: CaseStatus, actor: string): TransitionRequest {
  return {
    transition: { from, to },
    actor: actor as LifecycleActor,
    reason: `Actor enforcement test: ${actor}`,
    auditEventRef: `audit-actor-${actor}`,
  };
}

describe('Actor Enforcement — invalid actors rejected', () => {
  it('rejects manual-user actor', () => {
    const result = executeTransition('case-001', 'detected', makeRequest('detected', 'bound', 'manual-user'));
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid actor');
  });

  it('rejects admin actor', () => {
    const result = executeTransition('case-001', 'detected', makeRequest('detected', 'bound', 'admin'));
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid actor');
  });

  it('rejects empty string actor', () => {
    const result = executeTransition('case-001', 'detected', makeRequest('detected', 'bound', ''));
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid actor');
  });

  it('rejects analyst actor', () => {
    const result = executeTransition('case-001', 'detected', makeRequest('detected', 'bound', 'analyst'));
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid actor');
  });
});

describe('Actor Enforcement — per-transition actor validation', () => {
  it('detected → bound: only binding-engine permitted', () => {
    // binding-engine succeeds
    const success = executeTransition('case-001', 'detected', makeRequest('detected', 'bound', 'binding-engine'));
    expect(success.success).toBe(true);

    // system is rejected for this transition
    const fail = executeTransition('case-001', 'detected', makeRequest('detected', 'bound', 'system'));
    expect(fail.success).toBe(false);
    expect(fail.error).toContain('not permitted');
    expect(fail.error).toContain('binding-engine');
  });

  it('bound → routed: only routing-engine permitted', () => {
    const success = executeTransition('case-001', 'bound', makeRequest('bound', 'routed', 'routing-engine'));
    expect(success.success).toBe(true);

    const fail = executeTransition('case-001', 'bound', makeRequest('bound', 'routed', 'system'));
    expect(fail.success).toBe(false);
    expect(fail.error).toContain('not permitted');
  });

  it('routed → prioritised: only prioritisation-engine permitted', () => {
    const success = executeTransition('case-001', 'routed', makeRequest('routed', 'prioritised', 'prioritisation-engine'));
    expect(success.success).toBe(true);

    const fail = executeTransition('case-001', 'routed', makeRequest('routed', 'prioritised', 'routing-engine'));
    expect(fail.success).toBe(false);
    expect(fail.error).toContain('not permitted');
  });

  it('prioritised → action_decomposed: only system permitted', () => {
    const success = executeTransition('case-001', 'prioritised', makeRequest('prioritised', 'action_decomposed', 'system'));
    expect(success.success).toBe(true);

    const fail = executeTransition('case-001', 'prioritised', makeRequest('prioritised', 'action_decomposed', 'binding-engine'));
    expect(fail.success).toBe(false);
    expect(fail.error).toContain('not permitted');
  });

  it('pending_validation → validation_running: only validation-engine permitted', () => {
    const success = executeTransition('case-001', 'pending_validation', makeRequest('pending_validation', 'validation_running', 'validation-engine'));
    expect(success.success).toBe(true);

    const fail = executeTransition('case-001', 'pending_validation', makeRequest('pending_validation', 'validation_running', 'system'));
    expect(fail.success).toBe(false);
    expect(fail.error).toContain('not permitted');
  });

  it('validated_pass → pending_closure_gates: only closure-engine permitted', () => {
    const success = executeTransition('case-001', 'validated_pass', makeRequest('validated_pass', 'pending_closure_gates', 'closure-engine'));
    expect(success.success).toBe(true);

    const fail = executeTransition('case-001', 'validated_pass', makeRequest('validated_pass', 'pending_closure_gates', 'validation-engine'));
    expect(fail.success).toBe(false);
    expect(fail.error).toContain('not permitted');
  });

  it('pending_closure_gates → closed_by_system: only closure-engine permitted', () => {
    const success = executeTransition('case-001', 'pending_closure_gates', makeRequest('pending_closure_gates', 'closed_by_system', 'closure-engine'));
    expect(success.success).toBe(true);

    const fail = executeTransition('case-001', 'pending_closure_gates', makeRequest('pending_closure_gates', 'closed_by_system', 'system'));
    expect(fail.success).toBe(false);
    expect(fail.error).toContain('not permitted');
  });

  it('closed_by_system → reopened_by_system: only reopening-engine permitted', () => {
    const success = executeTransition('case-001', 'closed_by_system', makeRequest('closed_by_system', 'reopened_by_system', 'reopening-engine'));
    expect(success.success).toBe(true);

    const fail = executeTransition('case-001', 'closed_by_system', makeRequest('closed_by_system', 'reopened_by_system', 'system'));
    expect(fail.success).toBe(false);
    expect(fail.error).toContain('not permitted');
  });
});

describe('Actor Enforcement — comprehensive actor/transition matrix', () => {
  it('each transition rejects all non-permitted valid actors', () => {
    for (const transition of ALLOWED_TRANSITIONS) {
      const nonPermitted = LIFECYCLE_ACTORS.filter(
        (a) => !transition.permittedActors.includes(a)
      );

      for (const actor of nonPermitted) {
        const result = executeTransition(
          'case-matrix',
          transition.from,
          makeRequest(transition.from, transition.to, actor),
        );
        expect(result.success).toBe(false);
        expect(result.error).toContain('not permitted');
      }
    }
  });
});
