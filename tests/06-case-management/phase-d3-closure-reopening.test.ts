import { describe, it, expect } from 'vitest';
import {
  evaluateClosureGates,
  type GateEvaluationInput,
  type ClosureGateResult,
} from '../../packages/contracts/src/resolvers/closure-gate-enforcer';
import {
  evaluateReopeningTriggers,
  type ReopeningConditions,
  type ReopeningTriggerResult,
} from '../../packages/contracts/src/resolvers/reopening-trigger-enforcer';
import { seedStrategies } from '../../packages/contracts/src/fixtures/seed-strategies';
import type { StrategyPolicy } from '../../packages/contracts/src/entities/strategy';

/**
 * Phase D3: Closure Gate & Reopening Trigger Enforcement Tests — Commander C2
 *
 * Validates:
 * - Closure gates: all pass, individual failures, multiple failures, throws without strategy
 * - Reopening triggers: no fires, individual fires, multiple fires, throws without strategy
 * - Strategy consumption proof: different configs produce different results
 * - strategyRef included in all results for audit traceability
 */

// ─── Closure Gate Tests ──────────────────────────────────────────────────────

describe('evaluateClosureGates — all gates pass', () => {
  it('returns allGatesPass=true when all conditions are met', () => {
    const input: GateEvaluationInput = {
      remediationVerified: true,
      validationPassed: true,
      hasActiveDrift: false,
      slaBreached: false,
    };

    const result = evaluateClosureGates(input, seedStrategies);

    expect(result.allGatesPass).toBe(true);
    expect(result.gateResults).toHaveLength(4);
    expect(result.gateResults.every((g) => g.passed)).toBe(true);
  });
});

describe('evaluateClosureGates — single gate fails (remediation not verified)', () => {
  it('returns allGatesPass=false when remediation is not verified', () => {
    const input: GateEvaluationInput = {
      remediationVerified: false,
      validationPassed: true,
      hasActiveDrift: false,
      slaBreached: false,
    };

    const result = evaluateClosureGates(input, seedStrategies);

    expect(result.allGatesPass).toBe(false);
    const failedGate = result.gateResults.find((g) => g.gate === 'remediation-verified');
    expect(failedGate).toBeDefined();
    expect(failedGate!.passed).toBe(false);
    expect(failedGate!.reason).toContain('not been verified');
  });
});

describe('evaluateClosureGates — single gate fails (validation not passed)', () => {
  it('returns allGatesPass=false when validation has not passed', () => {
    const input: GateEvaluationInput = {
      remediationVerified: true,
      validationPassed: false,
      hasActiveDrift: false,
      slaBreached: false,
    };

    const result = evaluateClosureGates(input, seedStrategies);

    expect(result.allGatesPass).toBe(false);
    const failedGate = result.gateResults.find((g) => g.gate === 'validation-passed');
    expect(failedGate).toBeDefined();
    expect(failedGate!.passed).toBe(false);
    expect(failedGate!.reason).toContain('not passed');
  });
});

describe('evaluateClosureGates — single gate fails (active drift)', () => {
  it('returns allGatesPass=false when active drift is present', () => {
    const input: GateEvaluationInput = {
      remediationVerified: true,
      validationPassed: true,
      hasActiveDrift: true,
      slaBreached: false,
    };

    const result = evaluateClosureGates(input, seedStrategies);

    expect(result.allGatesPass).toBe(false);
    const failedGate = result.gateResults.find((g) => g.gate === 'no-active-drift');
    expect(failedGate).toBeDefined();
    expect(failedGate!.passed).toBe(false);
    expect(failedGate!.reason).toContain('Active drift detected');
  });
});

describe('evaluateClosureGates — single gate fails (SLA breached)', () => {
  it('returns allGatesPass=false when SLA is breached', () => {
    const input: GateEvaluationInput = {
      remediationVerified: true,
      validationPassed: true,
      hasActiveDrift: false,
      slaBreached: true,
    };

    const result = evaluateClosureGates(input, seedStrategies);

    expect(result.allGatesPass).toBe(false);
    const failedGate = result.gateResults.find((g) => g.gate === 'sla-not-breached');
    expect(failedGate).toBeDefined();
    expect(failedGate!.passed).toBe(false);
    expect(failedGate!.reason).toContain('SLA has been breached');
  });
});

describe('evaluateClosureGates — multiple gates fail', () => {
  it('returns allGatesPass=false with all failed gates listed', () => {
    const input: GateEvaluationInput = {
      remediationVerified: false,
      validationPassed: false,
      hasActiveDrift: true,
      slaBreached: true,
    };

    const result = evaluateClosureGates(input, seedStrategies);

    expect(result.allGatesPass).toBe(false);
    const failedGates = result.gateResults.filter((g) => !g.passed);
    expect(failedGates).toHaveLength(4);
  });
});

describe('evaluateClosureGates — throws without strategy', () => {
  it('throws if no closure-gate strategy found (no silent defaults)', () => {
    const strategiesWithoutClosure = seedStrategies.filter(
      (s) => s.surfaceType !== 'closure-gate',
    );

    const input: GateEvaluationInput = {
      remediationVerified: true,
      validationPassed: true,
      hasActiveDrift: false,
      slaBreached: false,
    };

    expect(() =>
      evaluateClosureGates(input, strategiesWithoutClosure),
    ).toThrow('No active closure-gate strategy policy found');
  });
});

describe('evaluateClosureGates — strategyRef', () => {
  it('includes strategyRef with policy id and version', () => {
    const input: GateEvaluationInput = {
      remediationVerified: true,
      validationPassed: true,
      hasActiveDrift: false,
      slaBreached: false,
    };

    const result = evaluateClosureGates(input, seedStrategies);

    expect(result.strategyRef).toBeDefined();
    expect(result.strategyRef.policyId).toBeTruthy();
    expect(result.strategyRef.policyVersion).toBe('1.0.0');
  });
});

describe('evaluateClosureGates — strategy consumption proof', () => {
  it('different gates config produces different evaluation', () => {
    const customStrategy: StrategyPolicy = {
      id: 'custom-closure-gate-strategy',
      entityType: 'strategy-policy',
      tenant: { tenantId: 'test-tenant', tenantName: 'Test Tenant' },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      source: { connectorId: 'test-conn', importRunId: 'test-run', sourceSystem: 'test', sourceTimestamp: '2026-01-01T00:00:00.000Z' },
      surfaceType: 'closure-gate',
      policyVersion: '2.0.0',
      status: 'active',
      configuration: {
        // Only two gates — remediation-verified and sla-not-breached
        gates: ['remediation-verified', 'sla-not-breached'],
      },
      proposedBy: 'Test',
      proposedAt: '2026-01-01T00:00:00.000Z',
      approval: { approvedBy: 'Test', approvedAt: '2026-01-01T00:00:00.000Z', condition: 'test', rationale: 'test' },
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      effectiveUntil: null,
      simulationRef: null,
    };

    // Input where validation-passed and no-active-drift would fail
    const input: GateEvaluationInput = {
      remediationVerified: true,
      validationPassed: false,
      hasActiveDrift: true,
      slaBreached: false,
    };

    // With seed strategies (4 gates) — should fail because validation-passed and no-active-drift fail
    const seedResult = evaluateClosureGates(input, seedStrategies);
    expect(seedResult.allGatesPass).toBe(false);
    expect(seedResult.gateResults).toHaveLength(4);

    // With custom strategy (2 gates) — should pass because only remediation-verified and sla-not-breached are checked
    const customResult = evaluateClosureGates(input, [customStrategy]);
    expect(customResult.allGatesPass).toBe(true);
    expect(customResult.gateResults).toHaveLength(2);

    // Verify strategyRef changes
    expect(customResult.strategyRef.policyId).toBe('custom-closure-gate-strategy');
    expect(customResult.strategyRef.policyVersion).toBe('2.0.0');
    expect(seedResult.strategyRef.policyVersion).toBe('1.0.0');
  });
});

// ─── Reopening Trigger Tests ─────────────────────────────────────────────────

describe('evaluateReopeningTriggers — no triggers fire', () => {
  it('returns shouldReopen=false when no conditions are met', () => {
    const conditions: ReopeningConditions = {
      newDriftDetected: false,
      validationFailed: false,
      slaBreachPostClosure: false,
      relatedP0Escalation: false,
    };

    const result = evaluateReopeningTriggers(conditions, seedStrategies);

    expect(result.shouldReopen).toBe(false);
    expect(result.firedTriggers).toHaveLength(0);
  });
});

describe('evaluateReopeningTriggers — single trigger fires (new drift)', () => {
  it('returns shouldReopen=true when new drift is detected', () => {
    const conditions: ReopeningConditions = {
      newDriftDetected: true,
      validationFailed: false,
      slaBreachPostClosure: false,
      relatedP0Escalation: false,
    };

    const result = evaluateReopeningTriggers(conditions, seedStrategies);

    expect(result.shouldReopen).toBe(true);
    expect(result.firedTriggers).toHaveLength(1);
    expect(result.firedTriggers[0].trigger).toBe('new-drift-detected');
    expect(result.firedTriggers[0].reason).toContain('drift detected');
  });
});

describe('evaluateReopeningTriggers — single trigger fires (validation failed)', () => {
  it('returns shouldReopen=true when validation has failed', () => {
    const conditions: ReopeningConditions = {
      newDriftDetected: false,
      validationFailed: true,
      slaBreachPostClosure: false,
      relatedP0Escalation: false,
    };

    const result = evaluateReopeningTriggers(conditions, seedStrategies);

    expect(result.shouldReopen).toBe(true);
    expect(result.firedTriggers).toHaveLength(1);
    expect(result.firedTriggers[0].trigger).toBe('validation-failed');
    expect(result.firedTriggers[0].reason).toContain('Validation failed');
  });
});

describe('evaluateReopeningTriggers — single trigger fires (SLA breach post-closure)', () => {
  it('returns shouldReopen=true when SLA is breached post-closure', () => {
    const conditions: ReopeningConditions = {
      newDriftDetected: false,
      validationFailed: false,
      slaBreachPostClosure: true,
      relatedP0Escalation: false,
    };

    const result = evaluateReopeningTriggers(conditions, seedStrategies);

    expect(result.shouldReopen).toBe(true);
    expect(result.firedTriggers).toHaveLength(1);
    expect(result.firedTriggers[0].trigger).toBe('sla-breach-post-closure');
    expect(result.firedTriggers[0].reason).toContain('SLA breached post-closure');
  });
});

describe('evaluateReopeningTriggers — single trigger fires (related P0 escalation)', () => {
  it('returns shouldReopen=true when related P0 escalation exists', () => {
    const conditions: ReopeningConditions = {
      newDriftDetected: false,
      validationFailed: false,
      slaBreachPostClosure: false,
      relatedP0Escalation: true,
    };

    const result = evaluateReopeningTriggers(conditions, seedStrategies);

    expect(result.shouldReopen).toBe(true);
    expect(result.firedTriggers).toHaveLength(1);
    expect(result.firedTriggers[0].trigger).toBe('related-p0-escalation');
    expect(result.firedTriggers[0].reason).toContain('P0 escalation');
  });
});

describe('evaluateReopeningTriggers — multiple triggers fire', () => {
  it('returns shouldReopen=true with all fired triggers listed', () => {
    const conditions: ReopeningConditions = {
      newDriftDetected: true,
      validationFailed: true,
      slaBreachPostClosure: true,
      relatedP0Escalation: true,
    };

    const result = evaluateReopeningTriggers(conditions, seedStrategies);

    expect(result.shouldReopen).toBe(true);
    expect(result.firedTriggers).toHaveLength(4);
    const triggerNames = result.firedTriggers.map((t) => t.trigger);
    expect(triggerNames).toContain('new-drift-detected');
    expect(triggerNames).toContain('validation-failed');
    expect(triggerNames).toContain('sla-breach-post-closure');
    expect(triggerNames).toContain('related-p0-escalation');
  });
});

describe('evaluateReopeningTriggers — throws without strategy', () => {
  it('throws if no reopening-trigger strategy found (no silent defaults)', () => {
    const strategiesWithoutReopening = seedStrategies.filter(
      (s) => s.surfaceType !== 'reopening-trigger',
    );

    const conditions: ReopeningConditions = {
      newDriftDetected: true,
      validationFailed: false,
      slaBreachPostClosure: false,
      relatedP0Escalation: false,
    };

    expect(() =>
      evaluateReopeningTriggers(conditions, strategiesWithoutReopening),
    ).toThrow('No active reopening-trigger strategy policy found');
  });
});

describe('evaluateReopeningTriggers — strategyRef', () => {
  it('includes strategyRef with policy id and version', () => {
    const conditions: ReopeningConditions = {
      newDriftDetected: false,
      validationFailed: false,
      slaBreachPostClosure: false,
      relatedP0Escalation: false,
    };

    const result = evaluateReopeningTriggers(conditions, seedStrategies);

    expect(result.strategyRef).toBeDefined();
    expect(result.strategyRef.policyId).toBeTruthy();
    expect(result.strategyRef.policyVersion).toBe('1.0.0');
  });
});

describe('evaluateReopeningTriggers — strategy consumption proof', () => {
  it('different triggers config produces different evaluation', () => {
    const customStrategy: StrategyPolicy = {
      id: 'custom-reopening-trigger-strategy',
      entityType: 'strategy-policy',
      tenant: { tenantId: 'test-tenant', tenantName: 'Test Tenant' },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      source: { connectorId: 'test-conn', importRunId: 'test-run', sourceSystem: 'test', sourceTimestamp: '2026-01-01T00:00:00.000Z' },
      surfaceType: 'reopening-trigger',
      policyVersion: '2.0.0',
      status: 'active',
      configuration: {
        // Only one trigger — related-p0-escalation
        triggers: ['related-p0-escalation'],
      },
      proposedBy: 'Test',
      proposedAt: '2026-01-01T00:00:00.000Z',
      approval: { approvedBy: 'Test', approvedAt: '2026-01-01T00:00:00.000Z', condition: 'test', rationale: 'test' },
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      effectiveUntil: null,
      simulationRef: null,
    };

    // Conditions where new-drift-detected fires but related-p0-escalation does not
    const conditions: ReopeningConditions = {
      newDriftDetected: true,
      validationFailed: true,
      slaBreachPostClosure: false,
      relatedP0Escalation: false,
    };

    // With seed strategies (4 triggers) — should reopen because new-drift-detected and validation-failed fire
    const seedResult = evaluateReopeningTriggers(conditions, seedStrategies);
    expect(seedResult.shouldReopen).toBe(true);
    expect(seedResult.firedTriggers).toHaveLength(2);

    // With custom strategy (1 trigger: related-p0-escalation) — should NOT reopen
    const customResult = evaluateReopeningTriggers(conditions, [customStrategy]);
    expect(customResult.shouldReopen).toBe(false);
    expect(customResult.firedTriggers).toHaveLength(0);

    // Verify strategyRef changes
    expect(customResult.strategyRef.policyId).toBe('custom-reopening-trigger-strategy');
    expect(customResult.strategyRef.policyVersion).toBe('2.0.0');
    expect(seedResult.strategyRef.policyVersion).toBe('1.0.0');
  });
});
