/**
 * Strategy Layer Runtime Surface Tests — Unit 6
 *
 * Source: Spec #32 Strategy Layer Runtime Surface Specification
 * Tests: policy authoring, approval, versioning, simulation, consumption by case lifecycle
 */

import { describe, it, expect } from 'vitest';
import {
  VALID_POLICY_TRANSITIONS,
  isValidPolicyTransition,
  transitionPolicyStatus,
  validateApproval,
  canActivate,
  isValidSemver,
  compareSemver,
  validateVersionIncrement,
  isPolicyEffective,
  findEffectivePolicy,
  simulatePolicy,
  findPoliciesToSupersede,
} from '../../packages/contracts/src/resolvers/strategy-policy-lifecycle';
import { resolveAllStrategies } from '../../packages/contracts/src/resolvers/case-strategy-resolver';
import { seedStrategies } from '../../packages/contracts/src/fixtures/seed-strategies';
import { seedCases } from '../../packages/contracts/src/fixtures/seed-cases';
import type { StrategyPolicy } from '../../packages/contracts/src/entities/strategy';

describe('Policy Authoring State Machine (Spec #32)', () => {
  it('draft can transition to pending-approval or rejected', () => {
    expect(VALID_POLICY_TRANSITIONS['draft']).toEqual(['pending-approval', 'rejected']);
  });

  it('pending-approval can transition to approved or rejected', () => {
    expect(VALID_POLICY_TRANSITIONS['pending-approval']).toEqual(['approved', 'rejected']);
  });

  it('approved can transition to active or rejected', () => {
    expect(VALID_POLICY_TRANSITIONS['approved']).toEqual(['active', 'rejected']);
  });

  it('active can only transition to superseded', () => {
    expect(VALID_POLICY_TRANSITIONS['active']).toEqual(['superseded']);
  });

  it('superseded is terminal', () => {
    expect(VALID_POLICY_TRANSITIONS['superseded']).toEqual([]);
  });

  it('rejected can transition back to draft (rework)', () => {
    expect(VALID_POLICY_TRANSITIONS['rejected']).toEqual(['draft']);
  });

  it('transitionPolicyStatus throws on invalid transition', () => {
    expect(() => transitionPolicyStatus({ id: 'test', status: 'draft' }, 'active')).toThrow('Invalid policy status transition');
  });

  it('transitionPolicyStatus returns new status on valid transition', () => {
    expect(transitionPolicyStatus({ id: 'test', status: 'draft' }, 'pending-approval')).toBe('pending-approval');
  });
});

describe('Approval Workflow (Spec #32)', () => {
  it('validates complete approval record', () => {
    const result = validateApproval({
      approvedBy: 'CISO',
      approvedAt: '2026-01-15T10:00:00Z',
      condition: 'none',
      rationale: 'Reviewed and approved for production use.',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects null approval', () => {
    const result = validateApproval(null);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('No approval record');
  });

  it('rejects approval without rationale', () => {
    const result = validateApproval({
      approvedBy: 'CISO',
      approvedAt: '2026-01-15T10:00:00Z',
      condition: 'none',
      rationale: '',
    });
    expect(result.valid).toBe(false);
  });

  it('canActivate returns false for non-approved policy', () => {
    const policy = { ...seedStrategies[0], status: 'draft' as const };
    const result = canActivate(policy);
    expect(result.allowed).toBe(false);
  });

  it('canActivate returns true for approved policy with valid approval', () => {
    const policy: StrategyPolicy = {
      ...seedStrategies[0],
      status: 'approved',
      approval: { approvedBy: 'CISO', approvedAt: '2026-01-15T10:00:00Z', condition: 'none', rationale: 'Approved.' },
    };
    const result = canActivate(policy);
    expect(result.allowed).toBe(true);
  });
});

describe('Semantic Versioning (Spec #32)', () => {
  it('validates correct semver', () => {
    expect(isValidSemver('1.0.0')).toBe(true);
    expect(isValidSemver('2.1.3')).toBe(true);
    expect(isValidSemver('10.20.30')).toBe(true);
  });

  it('rejects invalid semver', () => {
    expect(isValidSemver('1.0')).toBe(false);
    expect(isValidSemver('v1.0.0')).toBe(false);
    expect(isValidSemver('abc')).toBe(false);
  });

  it('compareSemver orders correctly', () => {
    expect(compareSemver('2.0.0', '1.0.0')).toBe(1);
    expect(compareSemver('1.0.0', '2.0.0')).toBe(-1);
    expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
    expect(compareSemver('1.1.0', '1.0.9')).toBe(1);
  });

  it('validateVersionIncrement rejects downgrade', () => {
    const result = validateVersionIncrement('2.0.0', '1.0.0');
    expect(result.valid).toBe(false);
  });

  it('validateVersionIncrement accepts upgrade', () => {
    const result = validateVersionIncrement('1.0.0', '2.0.0');
    expect(result.valid).toBe(true);
  });

  it('validateVersionIncrement accepts first version (no current)', () => {
    const result = validateVersionIncrement(null, '1.0.0');
    expect(result.valid).toBe(true);
  });
});

describe('Effective Date Range Enforcement (Spec #32)', () => {
  it('active policy with no date constraints is effective', () => {
    const policy: StrategyPolicy = { ...seedStrategies[0], status: 'active', effectiveFrom: null, effectiveUntil: null };
    expect(isPolicyEffective(policy)).toBe(true);
  });

  it('non-active policy is never effective', () => {
    const policy: StrategyPolicy = { ...seedStrategies[0], status: 'draft' };
    expect(isPolicyEffective(policy)).toBe(false);
  });

  it('policy not yet effective (future effectiveFrom)', () => {
    const policy: StrategyPolicy = { ...seedStrategies[0], status: 'active', effectiveFrom: '2099-01-01T00:00:00Z', effectiveUntil: null };
    expect(isPolicyEffective(policy)).toBe(false);
  });

  it('policy expired (past effectiveUntil)', () => {
    const policy: StrategyPolicy = { ...seedStrategies[0], status: 'active', effectiveFrom: '2020-01-01T00:00:00Z', effectiveUntil: '2020-12-31T23:59:59Z' };
    expect(isPolicyEffective(policy)).toBe(false);
  });

  it('findEffectivePolicy returns active policy for surface type', () => {
    const result = findEffectivePolicy(seedStrategies, 'sla');
    expect(result).not.toBeNull();
    expect(result!.surfaceType).toBe('sla');
    expect(result!.status).toBe('active');
  });

  it('findEffectivePolicy returns null for missing surface type', () => {
    const result = findEffectivePolicy(seedStrategies, 'nonexistent');
    expect(result).toBeNull();
  });
});

describe('Simulation Framework (Spec #32)', () => {
  it('simulation passes for approved policy', () => {
    const policy: StrategyPolicy = { ...seedStrategies[0], status: 'approved' };
    const result = simulatePolicy(policy, 10);
    expect(result.outcome).toBe('pass');
    expect(result.affectedCaseCount).toBe(10);
  });

  it('simulation fails for non-approved policy', () => {
    const policy: StrategyPolicy = { ...seedStrategies[0], status: 'draft' };
    const result = simulatePolicy(policy, 10);
    expect(result.outcome).toBe('fail');
    expect(result.details).toContain('Cannot simulate');
  });
});

describe('Policy Supersession (Spec #32)', () => {
  it('finds active policies to supersede when new version activates', () => {
    const newPolicy: StrategyPolicy = { ...seedStrategies[0], id: 'new-policy', status: 'active' };
    const toSupersede = findPoliciesToSupersede(seedStrategies, newPolicy);
    // The original sla policy (seedStrategies[0]) should be in the list
    expect(toSupersede).toContain(seedStrategies[0].id);
  });
});

describe('Case Lifecycle Consumption (no hardcoded values)', () => {
  it('resolveAllStrategies resolves all 6 surfaces from strategy policies', () => {
    const result = resolveAllStrategies(seedCases[0], seedStrategies);
    expect(result.sla.status).toBe('resolved');
    expect(result.routing.status).toBe('resolved');
    expect(result.priority.status).toBe('resolved');
    expect(result.validation.status).toBe('resolved');
    expect(result.closureGates.status).toBe('resolved');
    expect(result.reopening.status).toBe('resolved');
  });

  it('resolveAllStrategies returns unresolved when no active policies', () => {
    const result = resolveAllStrategies(seedCases[0], []);
    expect(result.sla.status).toBe('unresolved');
    expect(result.routing.status).toBe('unresolved');
  });

  it('SLA resolution comes from strategy, not hardcoded', () => {
    const result = resolveAllStrategies(seedCases[0], seedStrategies);
    expect(result.sla.sourcePolicy).not.toBeNull();
    expect(result.sla.sourcePolicy!.id).toContain('strategy');
  });

  it('routing resolution comes from strategy, not hardcoded', () => {
    const result = resolveAllStrategies(seedCases[0], seedStrategies);
    expect(result.routing.sourcePolicy).not.toBeNull();
  });
});
