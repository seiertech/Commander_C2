import { describe, it, expect } from 'vitest';
import {
  ALLOWED_TRANSITIONS,
  isTransitionAllowed,
  executeTransition,
} from '../../packages/contracts/src/entities/case-lifecycle';
import type { CaseStatus } from '../../packages/contracts/src/entities/case';
import type { LifecycleActor } from '../../packages/contracts/src/entities/case-lifecycle';

/**
 * Unit 7: System-Owned Enforcement Tests
 *
 * Validates Doctrinal Assertion 1:
 * - NO manual case creation (no transition TO 'detected' exists)
 * - NO manual closure (no direct path from early states to closed_by_system)
 * - NO manual reopening (only reopening-engine can reopen)
 * - NO manual status edit (only system-owned actors can transition)
 * - All transitions are system-owned (no human/manual actors)
 */

describe('System-Owned Enforcement — no manual creation', () => {
  it('no transition TO detected exists (manual creation impossible)', () => {
    const transitionsToDetected = ALLOWED_TRANSITIONS.filter((t) => t.to === 'detected');
    expect(transitionsToDetected).toHaveLength(0);
  });

  it('detected is only reachable as initial state', () => {
    // The only way to be in 'detected' is as the initial state of a new case
    // No transition leads to 'detected'
    const allToStates = ALLOWED_TRANSITIONS.map((t) => t.to);
    expect(allToStates).not.toContain('detected');
  });
});

describe('System-Owned Enforcement — no manual closure', () => {
  it('no direct transition from detected to closed_by_system', () => {
    expect(isTransitionAllowed('detected', 'closed_by_system')).toBe(false);
  });

  it('no direct transition from bound to closed_by_system', () => {
    expect(isTransitionAllowed('bound', 'closed_by_system')).toBe(false);
  });

  it('no direct transition from routed to closed_by_system', () => {
    expect(isTransitionAllowed('routed', 'closed_by_system')).toBe(false);
  });

  it('no direct transition from in_progress to closed_by_system', () => {
    expect(isTransitionAllowed('in_progress', 'closed_by_system')).toBe(false);
  });

  it('closure only possible from pending_closure_gates', () => {
    const closureTransitions = ALLOWED_TRANSITIONS.filter((t) => t.to === 'closed_by_system');
    expect(closureTransitions).toHaveLength(1);
    expect(closureTransitions[0].from).toBe('pending_closure_gates');
  });

  it('closure requires closure-engine actor', () => {
    const closureTransition = ALLOWED_TRANSITIONS.find((t) => t.to === 'closed_by_system');
    expect(closureTransition!.permittedActors).toEqual(['closure-engine']);
  });
});

describe('System-Owned Enforcement — no manual reopening', () => {
  it('reopening only possible from closed_by_system', () => {
    const reopenTransitions = ALLOWED_TRANSITIONS.filter((t) => t.to === 'reopened_by_system');
    expect(reopenTransitions).toHaveLength(1);
    expect(reopenTransitions[0].from).toBe('closed_by_system');
  });

  it('reopening requires reopening-engine actor', () => {
    const reopenTransition = ALLOWED_TRANSITIONS.find((t) => t.to === 'reopened_by_system');
    expect(reopenTransition!.permittedActors).toEqual(['reopening-engine']);
  });

  it('system actor cannot reopen a case', () => {
    const result = executeTransition(
      'case-001',
      'closed_by_system',
      {
        transition: { from: 'closed_by_system', to: 'reopened_by_system' },
        actor: 'system' as LifecycleActor,
        reason: 'Manual reopen attempt',
        auditEventRef: 'audit-manual-reopen',
      },
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain('not permitted');
  });
});

describe('System-Owned Enforcement — no manual status edit', () => {
  it('no skip transitions exist (must follow sequential path)', () => {
    // Verify no transition skips states (e.g., detected → in_progress)
    expect(isTransitionAllowed('detected', 'in_progress')).toBe(false);
    expect(isTransitionAllowed('detected', 'routed')).toBe(false);
    expect(isTransitionAllowed('detected', 'prioritised')).toBe(false);
    expect(isTransitionAllowed('bound', 'in_progress')).toBe(false);
    expect(isTransitionAllowed('routed', 'in_progress')).toBe(false);
  });

  it('cannot jump backward (except validated_fail → in_progress, reopened → in_progress, and in_progress → prioritised reassessment)', () => {
    // Backward transitions exist for:
    // validated_fail → in_progress (remediation loop)
    // reopened_by_system → in_progress (reopen loop)
    // in_progress → prioritised (priority reassessment loop — CMEP-1.0)
    const backwardTransitions = ALLOWED_TRANSITIONS.filter((t) => {
      const states: CaseStatus[] = [
        'detected', 'bound', 'routed', 'prioritised', 'action_decomposed',
        'in_progress', 'pending_validation', 'validation_running',
        'validated_pass', 'validated_fail', 'pending_closure_gates',
        'closed_by_system', 'reopened_by_system',
      ];
      const fromIdx = states.indexOf(t.from);
      const toIdx = states.indexOf(t.to);
      return toIdx < fromIdx;
    });

    expect(backwardTransitions).toHaveLength(3);
    const backwardPairs = backwardTransitions.map((t) => `${t.from}→${t.to}`);
    expect(backwardPairs).toContain('validated_fail→in_progress');
    expect(backwardPairs).toContain('reopened_by_system→in_progress');
    expect(backwardPairs).toContain('in_progress→prioritised');
  });
});

describe('System-Owned Enforcement — all actors are system-owned', () => {
  it('no human/manual actor exists in LIFECYCLE_ACTORS', () => {
    const humanActors = ['user', 'admin', 'analyst', 'manual', 'operator', 'human'];
    for (const transition of ALLOWED_TRANSITIONS) {
      for (const actor of transition.permittedActors) {
        expect(humanActors).not.toContain(actor);
      }
    }
  });

  it('all permitted actors end with -engine or are system', () => {
    for (const transition of ALLOWED_TRANSITIONS) {
      for (const actor of transition.permittedActors) {
        expect(actor === 'system' || actor.endsWith('-engine')).toBe(true);
      }
    }
  });
});

describe('System-Owned Enforcement — from-state mismatch rejection', () => {
  it('rejects when request.transition.from does not match currentStatus', () => {
    const result = executeTransition('case-001', 'detected', {
      transition: { from: 'bound', to: 'routed' },
      actor: 'routing-engine',
      reason: 'Mismatch test',
      auditEventRef: 'audit-mismatch',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('does not match current status');
    expect(result.previousStatus).toBe('detected');
  });
});

describe('System-Owned Enforcement — disallowed transitions rejected', () => {
  it('rejects detected → closed_by_system', () => {
    const result = executeTransition('case-001', 'detected', {
      transition: { from: 'detected', to: 'closed_by_system' as CaseStatus },
      actor: 'closure-engine',
      reason: 'Direct closure attempt',
      auditEventRef: 'audit-direct-close',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('rejects in_progress → closed_by_system', () => {
    const result = executeTransition('case-001', 'in_progress', {
      transition: { from: 'in_progress', to: 'closed_by_system' as CaseStatus },
      actor: 'closure-engine',
      reason: 'Direct closure attempt',
      auditEventRef: 'audit-direct-close',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('not allowed');
  });
});
