import { describe, it, expect } from 'vitest';
import { resolveSla } from '../../packages/contracts/src/resolvers/case-sla-calculator';
import { resolveRouting } from '../../packages/contracts/src/resolvers/case-router';
import { resolvePriority } from '../../packages/contracts/src/resolvers/case-prioritiser';
import { resolveValidationWindow } from '../../packages/contracts/src/resolvers/case-validation-evaluator';
import { resolveClosureGates } from '../../packages/contracts/src/resolvers/case-closure-evaluator';
import { resolveReopeningTriggers } from '../../packages/contracts/src/resolvers/case-reopening-evaluator';
import { resolveAllStrategies } from '../../packages/contracts/src/resolvers/case-strategy-resolver';
import { seedStrategies } from '../../packages/contracts/src/fixtures/seed-strategies';
import { seedCases } from '../../packages/contracts/src/fixtures/seed-cases';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');

/**
 * Phase B — Strategy Resolver Tests
 *
 * Validates:
 * - Each resolver reads from Spec 43 strategy surfaces (no hardcoded values)
 * - Resolvers return 'unresolved' when strategy data is missing
 * - 3 seed cases resolve through each of the 6 strategy paths
 * - P0 cases use Prioritisation Weight Strategy (not hardcoded P0 rule)
 * - SLA windows differ between priorities per SLA Strategy configuration
 * - No manual override paths in any resolver
 */

describe('SLA Resolver', () => {
  it('resolves SLA for P0 case from strategy (not hardcoded)', () => {
    const p0Case = seedCases.find((c) => c.priority === 'P0')!;
    const result = resolveSla(p0Case, seedStrategies);
    expect(result.status).toBe('resolved');
    expect(result.response_hours).toBe(4);
    expect(result.source_policy).not.toBeNull();
  });

  it('resolves SLA for P1 case from strategy', () => {
    const p1Case = seedCases.find((c) => c.priority === 'P1')!;
    const result = resolveSla(p1Case, seedStrategies);
    expect(result.status).toBe('resolved');
    expect(result.response_hours).toBe(24);
  });

  it('resolves SLA for P2 case from strategy', () => {
    const p2Case = seedCases.find((c) => c.priority === 'P2')!;
    const result = resolveSla(p2Case, seedStrategies);
    expect(result.status).toBe('resolved');
    expect(result.response_hours).toBe(48);
  });

  it('SLA windows differ between priorities (strategy-driven)', () => {
    const p0 = resolveSla({ priority: 'P0', case_type: 'drift' }, seedStrategies);
    const p2 = resolveSla({ priority: 'P2', case_type: 'drift' }, seedStrategies);
    expect(p0.response_hours).not.toBe(p2.response_hours);
  });

  it('returns unresolved when no SLA strategy exists', () => {
    const result = resolveSla({ priority: 'P1', case_type: 'drift' }, []);
    expect(result.status).toBe('unresolved');
    expect(result.response_hours).toBeNull();
  });
});

describe('Routing Resolver', () => {
  it('resolves routing for vulnerability-drift case', () => {
    const result = resolveRouting({ case_type: 'vulnerability-drift' }, seedStrategies);
    expect(result.status).toBe('resolved');
    expect(result.team).toBe('Security Operations');
  });

  it('resolves routing for configuration-drift case', () => {
    const result = resolveRouting({ case_type: 'configuration-drift' }, seedStrategies);
    expect(result.status).toBe('resolved');
    expect(result.team).toBe('Platform Engineering');
  });

  it('returns unresolved for unknown case type', () => {
    const result = resolveRouting({ case_type: 'nonexistent-case-type' as any }, seedStrategies);
    expect(result.status).toBe('unresolved');
    expect(result.team).toBeNull();
  });

  it('returns unresolved when no routing strategy exists', () => {
    const result = resolveRouting({ case_type: 'drift' }, []);
    expect(result.status).toBe('unresolved');
  });
});

describe('Prioritisation Resolver', () => {
  it('resolves prioritisation weights from strategy (not hardcoded)', () => {
    const result = resolvePriority(seedStrategies);
    expect(result.status).toBe('resolved');
    expect(result.weights).not.toBeNull();
    expect(result.weights!.severity).toBe(0.2);
  });

  it('weights sum to approximately 1.0', () => {
    const result = resolvePriority(seedStrategies);
    const sum = Object.values(result.weights!).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 2);
  });

  it('returns unresolved when no prioritisation strategy exists', () => {
    const result = resolvePriority([]);
    expect(result.status).toBe('unresolved');
    expect(result.weights).toBeNull();
  });
});

describe('Validation Window Resolver', () => {
  it('resolves validation window from strategy', () => {
    const result = resolveValidationWindow(seedStrategies);
    expect(result.status).toBe('resolved');
    expect(result.window_hours).toBe(72);
    expect(result.freshnessHours).toBe(24);
  });

  it('returns unresolved when no validation strategy exists', () => {
    const result = resolveValidationWindow([]);
    expect(result.status).toBe('unresolved');
  });
});

describe('Closure Gate Resolver', () => {
  it('resolves closure gates from strategy', () => {
    const result = resolveClosureGates(seedStrategies);
    expect(result.status).toBe('resolved');
    expect(result.gates).toContain('remediation-verified');
    expect(result.gates).toContain('validation-passed');
    expect(result.gates!.length).toBe(4);
  });

  it('returns unresolved when no closure gate strategy exists', () => {
    const result = resolveClosureGates([]);
    expect(result.status).toBe('unresolved');
  });
});

describe('Reopening Trigger Resolver', () => {
  it('resolves reopening triggers from strategy', () => {
    const result = resolveReopeningTriggers(seedStrategies);
    expect(result.status).toBe('resolved');
    expect(result.triggers).toContain('new-drift-detected');
    expect(result.triggers!.length).toBe(4);
  });

  it('returns unresolved when no reopening strategy exists', () => {
    const result = resolveReopeningTriggers([]);
    expect(result.status).toBe('unresolved');
  });
});

describe('Full Strategy Resolution (all 6 surfaces)', () => {
  it('resolves all 6 strategies for seed case 1 (P0 external-attack-correlation)', () => {
    const c = seedCases[0];
    const result = resolveAllStrategies(c, seedStrategies);
    expect(result.sla.status).toBe('resolved');
    expect(result.routing.status).toBe('resolved');
    expect(result.priority.status).toBe('resolved');
    expect(result.validation.status).toBe('resolved');
    expect(result.closure_gates.status).toBe('resolved');
    expect(result.reopening.status).toBe('resolved');
  });

  it('resolves all 6 strategies for seed case 3 (P1 vulnerability-drift)', () => {
    const c = seedCases[2];
    const result = resolveAllStrategies(c, seedStrategies);
    expect(result.sla.status).toBe('resolved');
    expect(result.sla.response_hours).toBe(24); // P1 SLA from strategy
    expect(result.priority.status).toBe('resolved');
    expect(result.validation.status).toBe('resolved');
    expect(result.closure_gates.status).toBe('resolved');
    expect(result.reopening.status).toBe('resolved');
  });
});

describe('No Hardcoded Values (Doctrinal Constraint #9)', () => {
  const resolverFiles = [
    'packages/contracts/src/resolvers/case-sla-calculator.ts',
    'packages/contracts/src/resolvers/case-router.ts',
    'packages/contracts/src/resolvers/case-prioritiser.ts',
    'packages/contracts/src/resolvers/case-validation-evaluator.ts',
    'packages/contracts/src/resolvers/case-closure-evaluator.ts',
    'packages/contracts/src/resolvers/case-reopening-evaluator.ts',
  ];

  for (const file of resolverFiles) {
    it(`${file} does not hardcode SLA hours`, () => {
      const content = readFileSync(resolve(ROOT, file), 'utf-8');
      // Should not contain literal hour values like "= 4" or "= 24" or "= 48"
      // The only numbers should be in comments or type annotations
      expect(content).not.toMatch(/responseHours\s*[:=]\s*\d+/);
    });
  }
});

describe('No Manual Override Paths (Doctrinal Constraint #1)', () => {
  const resolverFiles = [
    'packages/contracts/src/resolvers/case-sla-calculator.ts',
    'packages/contracts/src/resolvers/case-router.ts',
    'packages/contracts/src/resolvers/case-prioritiser.ts',
    'packages/contracts/src/resolvers/case-validation-evaluator.ts',
    'packages/contracts/src/resolvers/case-closure-evaluator.ts',
    'packages/contracts/src/resolvers/case-reopening-evaluator.ts',
  ];

  for (const file of resolverFiles) {
    it(`${file} does not contain manual override logic`, () => {
      const content = readFileSync(resolve(ROOT, file), 'utf-8');
      expect(content).not.toContain('manualOverride');
      expect(content).not.toContain('manual_override');
      expect(content).not.toContain('bypassStrategy');
    });
  }
});
