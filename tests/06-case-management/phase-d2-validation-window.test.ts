import { describe, it, expect } from 'vitest';
import {
  evaluateValidationWindow,
  type ValidationWindowState,
} from '../../packages/contracts/src/resolvers/validation-window-enforcer';
import { seedStrategies } from '../../packages/contracts/src/fixtures/seed-strategies';
import type { StrategyPolicy } from '../../packages/contracts/src/entities/strategy';

/**
 * Phase D2: Validation Window Enforcement Tests — Commander SDR
 *
 * Validates:
 * - withinWindow true/false based on windowHours from strategy
 * - evidenceFresh true/false based on freshnessHours from strategy
 * - refreshDue true/false based on refreshCadenceHours from strategy
 * - Throws if no validation-window strategy found (no silent defaults)
 * - Correct windowHoursRemaining calculation
 * - Correct hoursSinceLastRefresh calculation
 * - strategyRef includes policy id and version
 * - All values come from strategy (verified by passing different configs)
 */

// Seed strategy has: windowHours: 72, freshnessHours: 24, refreshCadenceHours: 12
const NOW = new Date('2026-02-01T12:00:00.000Z');

describe('evaluateValidationWindow — withinWindow', () => {
  it('returns withinWindow=true when within windowHours', () => {
    // Entered 48 hours ago (within 72h window)
    const enteredAt = new Date(NOW.getTime() - 48 * 60 * 60 * 1000).toISOString();
    const lastRefresh = new Date(NOW.getTime() - 6 * 60 * 60 * 1000).toISOString();

    const result = evaluateValidationWindow(enteredAt, lastRefresh, seedStrategies, NOW);

    expect(result.withinWindow).toBe(true);
  });

  it('returns withinWindow=false when window expired', () => {
    // Entered 80 hours ago (beyond 72h window)
    const enteredAt = new Date(NOW.getTime() - 80 * 60 * 60 * 1000).toISOString();
    const lastRefresh = new Date(NOW.getTime() - 6 * 60 * 60 * 1000).toISOString();

    const result = evaluateValidationWindow(enteredAt, lastRefresh, seedStrategies, NOW);

    expect(result.withinWindow).toBe(false);
  });
});

describe('evaluateValidationWindow — evidenceFresh', () => {
  it('returns evidenceFresh=true when within freshnessHours', () => {
    // Last refresh 10 hours ago (within 24h freshness)
    const enteredAt = new Date(NOW.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const lastRefresh = new Date(NOW.getTime() - 10 * 60 * 60 * 1000).toISOString();

    const result = evaluateValidationWindow(enteredAt, lastRefresh, seedStrategies, NOW);

    expect(result.evidenceFresh).toBe(true);
  });

  it('returns evidenceFresh=false when evidence stale', () => {
    // Last refresh 30 hours ago (beyond 24h freshness)
    const enteredAt = new Date(NOW.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const lastRefresh = new Date(NOW.getTime() - 30 * 60 * 60 * 1000).toISOString();

    const result = evaluateValidationWindow(enteredAt, lastRefresh, seedStrategies, NOW);

    expect(result.evidenceFresh).toBe(false);
  });
});

describe('evaluateValidationWindow — refreshDue', () => {
  it('returns refreshDue=true when cadence exceeded', () => {
    // Last refresh 14 hours ago (beyond 12h cadence)
    const enteredAt = new Date(NOW.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const lastRefresh = new Date(NOW.getTime() - 14 * 60 * 60 * 1000).toISOString();

    const result = evaluateValidationWindow(enteredAt, lastRefresh, seedStrategies, NOW);

    expect(result.refreshDue).toBe(true);
  });

  it('returns refreshDue=false when cadence not exceeded', () => {
    // Last refresh 6 hours ago (within 12h cadence)
    const enteredAt = new Date(NOW.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const lastRefresh = new Date(NOW.getTime() - 6 * 60 * 60 * 1000).toISOString();

    const result = evaluateValidationWindow(enteredAt, lastRefresh, seedStrategies, NOW);

    expect(result.refreshDue).toBe(false);
  });
});

describe('evaluateValidationWindow — throws without strategy', () => {
  it('throws if no validation-window strategy found (no silent defaults)', () => {
    const strategiesWithoutValidation = seedStrategies.filter(
      (s) => s.surfaceType !== 'validation-window',
    );

    const enteredAt = new Date(NOW.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const lastRefresh = new Date(NOW.getTime() - 6 * 60 * 60 * 1000).toISOString();

    expect(() =>
      evaluateValidationWindow(enteredAt, lastRefresh, strategiesWithoutValidation, NOW),
    ).toThrow('No active validation-window strategy policy found');
  });
});

describe('evaluateValidationWindow — windowHoursRemaining', () => {
  it('returns correct windowHoursRemaining when within window', () => {
    // Entered 48 hours ago → 72 - 48 = 24 hours remaining
    const enteredAt = new Date(NOW.getTime() - 48 * 60 * 60 * 1000).toISOString();
    const lastRefresh = new Date(NOW.getTime() - 6 * 60 * 60 * 1000).toISOString();

    const result = evaluateValidationWindow(enteredAt, lastRefresh, seedStrategies, NOW);

    expect(result.windowHoursRemaining).toBeCloseTo(24, 5);
  });

  it('returns windowHoursRemaining=0 when window expired', () => {
    // Entered 100 hours ago (beyond 72h window)
    const enteredAt = new Date(NOW.getTime() - 100 * 60 * 60 * 1000).toISOString();
    const lastRefresh = new Date(NOW.getTime() - 6 * 60 * 60 * 1000).toISOString();

    const result = evaluateValidationWindow(enteredAt, lastRefresh, seedStrategies, NOW);

    expect(result.windowHoursRemaining).toBe(0);
  });
});

describe('evaluateValidationWindow — hoursSinceLastRefresh', () => {
  it('returns correct hoursSinceLastRefresh', () => {
    // Last refresh 18 hours ago
    const enteredAt = new Date(NOW.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const lastRefresh = new Date(NOW.getTime() - 18 * 60 * 60 * 1000).toISOString();

    const result = evaluateValidationWindow(enteredAt, lastRefresh, seedStrategies, NOW);

    expect(result.hoursSinceLastRefresh).toBeCloseTo(18, 5);
  });
});

describe('evaluateValidationWindow — strategyRef', () => {
  it('includes strategyRef with policy id and version', () => {
    const enteredAt = new Date(NOW.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const lastRefresh = new Date(NOW.getTime() - 6 * 60 * 60 * 1000).toISOString();

    const result = evaluateValidationWindow(enteredAt, lastRefresh, seedStrategies, NOW);

    expect(result.strategyRef).toBeDefined();
    expect(result.strategyRef.policyId).toBeTruthy();
    expect(result.strategyRef.policyVersion).toBe('1.0.0');
  });
});

describe('evaluateValidationWindow — strategy consumption proof', () => {
  it('all values come from strategy (different config produces different results)', () => {
    // Create a custom strategy with different values
    const customStrategy: StrategyPolicy = {
      id: 'custom-validation-strategy',
      entityType: 'strategy-policy',
      tenant: { tenantId: 'test-tenant', tenantName: 'Test Tenant' },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      source: { connectorId: 'test-conn', importRunId: 'test-run', sourceSystem: 'test', sourceTimestamp: '2026-01-01T00:00:00.000Z' },
      surfaceType: 'validation-window',
      policyVersion: '2.0.0',
      status: 'active',
      configuration: { windowHours: 24, freshnessHours: 6, refreshCadenceHours: 4 },
      proposedBy: 'Test',
      proposedAt: '2026-01-01T00:00:00.000Z',
      approval: { approvedBy: 'Test', approvedAt: '2026-01-01T00:00:00.000Z', condition: 'test', rationale: 'test' },
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      effectiveUntil: null,
      simulationRef: null,
    };

    // 30 hours ago entry — within 72h seed window but OUTSIDE 24h custom window
    const enteredAt = new Date(NOW.getTime() - 30 * 60 * 60 * 1000).toISOString();
    // 5 hours ago refresh — within 24h seed freshness but OUTSIDE 6h custom freshness boundary
    // Actually 5 < 6, so fresh in both. Use 8 hours to be outside custom freshness.
    const lastRefresh = new Date(NOW.getTime() - 8 * 60 * 60 * 1000).toISOString();

    // With seed strategies (72h window, 24h freshness, 12h cadence)
    const seedResult = evaluateValidationWindow(enteredAt, lastRefresh, seedStrategies, NOW);
    expect(seedResult.withinWindow).toBe(true); // 30 < 72
    expect(seedResult.evidenceFresh).toBe(true); // 8 < 24
    expect(seedResult.refreshDue).toBe(false); // 8 < 12

    // With custom strategy (24h window, 6h freshness, 4h cadence)
    const customResult = evaluateValidationWindow(
      enteredAt,
      lastRefresh,
      [customStrategy],
      NOW,
    );
    expect(customResult.withinWindow).toBe(false); // 30 > 24
    expect(customResult.evidenceFresh).toBe(false); // 8 > 6
    expect(customResult.refreshDue).toBe(true); // 8 > 4

    // Verify strategyRef changes
    expect(customResult.strategyRef.policyId).toBe('custom-validation-strategy');
    expect(customResult.strategyRef.policyVersion).toBe('2.0.0');
    expect(seedResult.strategyRef.policyVersion).toBe('1.0.0');
  });
});
