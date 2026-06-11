import { describe, it, expect } from 'vitest';
import {
  calculateSlaState,
  detectBreach,
  generateNotifications,
  calculateEscalation,
  evaluateSla,
} from '../../packages/contracts/src/engines/case-sla-engine';
import type {
  CaseSlaState,
  SlaEvaluationRequest,
  SlaNotification,
  SlaEscalation,
} from '../../packages/contracts/src/engines/case-sla-engine';
import { seedStrategies } from '../../packages/contracts/src/fixtures/seed-strategies';
import type { StrategyPolicy } from '../../packages/contracts/src/entities/strategy';

/**
 * Unit 10: Case SLA Engine Tests
 *
 * Validates:
 * - SLA state calculation for each priority level
 * - Breach detection (before and after target)
 * - Notification generation at each threshold (75%, 90%, 100%, 150%)
 * - Escalation level calculation post-breach
 * - Full evaluateSla flow with seed strategies
 * - Error handling when strategy is missing
 * - Proof that values come from strategy (modify strategy → different result)
 * - Edge cases: exactly at boundary, just before/after breach
 */

// ─── Test Fixtures ───────────────────────────────────────────────────────────

const BASE_TIME = '2026-01-20T00:00:00.000Z';

function hoursAfter(base: string, hours: number): string {
  const d = new Date(base);
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return d.toISOString();
}

/** Seed SLA profiles from strategy:
 * P0-Critical: responseHours=4, escalationCadenceMinutes=30
 * P1-High: responseHours=24, escalationCadenceMinutes=120
 * P2-Medium: responseHours=48, escalationCadenceMinutes=480
 * P3-Standard: responseHours=168, escalationCadenceMinutes=1440
 * P4 falls back to P3-Standard
 */

const escalationPath = ['Team Lead', 'SOM', 'CISO'];

function makeRequest(
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4',
  elapsedHours: number,
): SlaEvaluationRequest {
  return {
    case_id: `case-${priority}-test`,
    priority,
    case_type: 'vulnerability',
    created_at: BASE_TIME,
    current_time: hoursAfter(BASE_TIME, elapsedHours),
  };
}

// ─── SLA State Calculation Tests ─────────────────────────────────────────────

describe('calculateSlaState — SLA state for each priority level', () => {
  it('calculates correct target for P0 (4 hours from strategy)', () => {
    const state = calculateSlaState(makeRequest('P0', 2), seedStrategies);
    expect(state.target_resolution_hours).toBe(4);
    expect(state.escalation_cadence_minutes).toBe(30);
    expect(state.priority).toBe('P0');
    expect(state.case_id).toBe('case-P0-test');
  });

  it('calculates correct target for P1 (24 hours from strategy)', () => {
    const state = calculateSlaState(makeRequest('P1', 12), seedStrategies);
    expect(state.target_resolution_hours).toBe(24);
    expect(state.escalation_cadence_minutes).toBe(120);
  });

  it('calculates correct target for P2 (48 hours from strategy)', () => {
    const state = calculateSlaState(makeRequest('P2', 24), seedStrategies);
    expect(state.target_resolution_hours).toBe(48);
    expect(state.escalation_cadence_minutes).toBe(480);
  });

  it('calculates correct target for P3 (168 hours from strategy)', () => {
    const state = calculateSlaState(makeRequest('P3', 84), seedStrategies);
    expect(state.target_resolution_hours).toBe(168);
    expect(state.escalation_cadence_minutes).toBe(1440);
  });

  it('calculates correct target for P4 (falls back to P3-Standard: 168 hours)', () => {
    const state = calculateSlaState(makeRequest('P4', 84), seedStrategies);
    expect(state.target_resolution_hours).toBe(168);
    expect(state.escalation_cadence_minutes).toBe(1440);
  });

  it('calculates elapsed hours correctly', () => {
    const state = calculateSlaState(makeRequest('P1', 12), seedStrategies);
    expect(state.elapsedHours).toBeCloseTo(12, 5);
  });

  it('calculates remaining hours correctly (before breach)', () => {
    const state = calculateSlaState(makeRequest('P1', 12), seedStrategies);
    // target=24, elapsed=12, remaining=12
    expect(state.remainingHours).toBeCloseTo(12, 5);
  });

  it('remaining hours is 0 when breached', () => {
    const state = calculateSlaState(makeRequest('P0', 6), seedStrategies);
    // target=4, elapsed=6, remaining=0
    expect(state.remainingHours).toBe(0);
  });

  it('calculates percentage used correctly', () => {
    const state = calculateSlaState(makeRequest('P1', 12), seedStrategies);
    // 12/24 * 100 = 50%
    expect(state.percentageUsed).toBeCloseTo(50, 5);
  });

  it('percentage can exceed 100 when breached', () => {
    const state = calculateSlaState(makeRequest('P0', 6), seedStrategies);
    // 6/4 * 100 = 150%
    expect(state.percentageUsed).toBeCloseTo(150, 5);
  });

  it('throws error when SLA strategy is missing', () => {
    const noSlaStrategies = seedStrategies.filter(
      (s) => s.surface_type !== 'sla',
    );
    expect(() => calculateSlaState(makeRequest('P0', 2), noSlaStrategies)).toThrow(
      'STRATEGY GAP',
    );
  });
});

// ─── Breach Detection Tests ──────────────────────────────────────────────────

describe('detectBreach — SLA breach detection', () => {
  it('returns false when elapsed < target (not breached)', () => {
    const state = calculateSlaState(makeRequest('P0', 3), seedStrategies);
    expect(detectBreach(state)).toBe(false);
    expect(state.breached).toBe(false);
    expect(state.breachedAt).toBeNull();
  });

  it('returns true when elapsed >= target (breached)', () => {
    const state = calculateSlaState(makeRequest('P0', 5), seedStrategies);
    expect(detectBreach(state)).toBe(true);
    expect(state.breached).toBe(true);
    expect(state.breachedAt).not.toBeNull();
  });

  it('returns true exactly at target boundary', () => {
    const state = calculateSlaState(makeRequest('P0', 4), seedStrategies);
    expect(detectBreach(state)).toBe(true);
    expect(state.breached).toBe(true);
  });

  it('returns false just before target boundary', () => {
    const state = calculateSlaState(makeRequest('P0', 3.99), seedStrategies);
    expect(detectBreach(state)).toBe(false);
    expect(state.breached).toBe(false);
  });

  it('sets breachedAt to the exact breach time', () => {
    const state = calculateSlaState(makeRequest('P0', 6), seedStrategies);
    // P0 target = 4h, so breach at BASE_TIME + 4h
    const expectedBreachTime = hoursAfter(BASE_TIME, 4);
    expect(state.breachedAt).toBe(expectedBreachTime);
  });
});

// ─── Notification Generation Tests ───────────────────────────────────────────

describe('generateNotifications — threshold-based notifications', () => {
  it('generates no notifications below 75%', () => {
    const state = calculateSlaState(makeRequest('P1', 12), seedStrategies);
    // 12/24 = 50%
    const notifications = generateNotifications(state);
    expect(notifications).toHaveLength(0);
  });

  it('generates warning at 75% threshold', () => {
    const state = calculateSlaState(makeRequest('P1', 18), seedStrategies);
    // 18/24 = 75%
    const notifications = generateNotifications(state);
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('warning');
    expect(notifications[0].message).toContain('75%');
    expect(notifications[0].case_id).toBe('case-P1-test');
  });

  it('generates warning at 90% threshold (approaching breach)', () => {
    const state = calculateSlaState(makeRequest('P1', 21.6), seedStrategies);
    // 21.6/24 = 90%
    const notifications = generateNotifications(state);
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('warning');
    expect(notifications[0].message).toContain('approaching');
  });

  it('generates breach notification at 100%', () => {
    const state = calculateSlaState(makeRequest('P1', 24), seedStrategies);
    // 24/24 = 100%
    const notifications = generateNotifications(state);
    expect(notifications.some((n) => n.type === 'breach')).toBe(true);
    const breach = notifications.find((n) => n.type === 'breach')!;
    expect(breach.message).toContain('BREACH');
    expect(breach.message).toContain('24h');
  });

  it('generates critical-breach notification at 150%+', () => {
    const state = calculateSlaState(makeRequest('P1', 36), seedStrategies);
    // 36/24 = 150%
    const notifications = generateNotifications(state);
    expect(notifications.some((n) => n.type === 'critical-breach')).toBe(true);
    const critical = notifications.find((n) => n.type === 'critical-breach')!;
    expect(critical.message).toContain('CRITICAL');
  });

  it('generates both breach and critical-breach at 150%+', () => {
    const state = calculateSlaState(makeRequest('P1', 36), seedStrategies);
    // 36/24 = 150% → both breach and critical-breach
    const notifications = generateNotifications(state);
    const types = notifications.map((n) => n.type);
    expect(types).toContain('breach');
    expect(types).toContain('critical-breach');
  });

  it('does not generate warning notifications when breached (100%+)', () => {
    const state = calculateSlaState(makeRequest('P1', 24), seedStrategies);
    const notifications = generateNotifications(state);
    // At 100%, only breach notification — no warning
    const warnings = notifications.filter((n) => n.type === 'warning');
    expect(warnings).toHaveLength(0);
  });

  it('includes percentageUsed in notification', () => {
    const state = calculateSlaState(makeRequest('P1', 18), seedStrategies);
    const notifications = generateNotifications(state);
    expect(notifications[0].percentageUsed).toBeCloseTo(75, 0);
  });
});

// ─── Escalation Calculation Tests ────────────────────────────────────────────

describe('calculateEscalation — post-breach escalation levels', () => {
  it('returns null when SLA is not breached', () => {
    const state = calculateSlaState(makeRequest('P0', 2), seedStrategies);
    const escalation = calculateEscalation(state, escalationPath, 30);
    expect(escalation).toBeNull();
  });

  it('returns level 0 immediately after breach (Team Lead)', () => {
    // P0: target=4h, cadence=30min. At 4.25h → 0.25h over → level 0
    const state = calculateSlaState(makeRequest('P0', 4.25), seedStrategies);
    const escalation = calculateEscalation(state, escalationPath, 30);
    expect(escalation).not.toBeNull();
    expect(escalation!.escalation_level).toBe(0);
    expect(escalation!.currentEscalatee).toBe('Team Lead');
  });

  it('returns level 1 after one cadence period (SOM)', () => {
    // P0: target=4h, cadence=30min. At 4.5h → 0.5h over → level 1
    const state = calculateSlaState(makeRequest('P0', 4.5), seedStrategies);
    const escalation = calculateEscalation(state, escalationPath, 30);
    expect(escalation).not.toBeNull();
    expect(escalation!.escalation_level).toBe(1);
    expect(escalation!.currentEscalatee).toBe('SOM');
  });

  it('returns level 2 after two cadence periods (CISO)', () => {
    // P0: target=4h, cadence=30min. At 5h → 1h over → level 2
    const state = calculateSlaState(makeRequest('P0', 5), seedStrategies);
    const escalation = calculateEscalation(state, escalationPath, 30);
    expect(escalation).not.toBeNull();
    expect(escalation!.escalation_level).toBe(2);
    expect(escalation!.currentEscalatee).toBe('CISO');
  });

  it('clamps to last escalation path entry for high levels', () => {
    // P0: target=4h, cadence=30min. At 10h → 6h over → level 12 → clamped to CISO
    const state = calculateSlaState(makeRequest('P0', 10), seedStrategies);
    const escalation = calculateEscalation(state, escalationPath, 30);
    expect(escalation).not.toBeNull();
    expect(escalation!.escalation_level).toBe(12);
    expect(escalation!.currentEscalatee).toBe('CISO');
  });

  it('returns null when escalation path is empty', () => {
    const state = calculateSlaState(makeRequest('P0', 5), seedStrategies);
    const escalation = calculateEscalation(state, [], 30);
    expect(escalation).toBeNull();
  });

  it('includes reason with breach details', () => {
    const state = calculateSlaState(makeRequest('P0', 5), seedStrategies);
    const escalation = calculateEscalation(state, escalationPath, 30);
    expect(escalation!.reason).toContain('SLA breached');
    expect(escalation!.reason).toContain('30min');
  });

  it('uses escalation cadence from strategy for P1 (120 min)', () => {
    // P1: target=24h, cadence=120min (2h). At 26h → 2h over → level 1
    const state = calculateSlaState(makeRequest('P1', 26), seedStrategies);
    const escalation = calculateEscalation(state, escalationPath, 120);
    expect(escalation!.escalation_level).toBe(1);
    expect(escalation!.currentEscalatee).toBe('SOM');
  });

  it('includes full escalation path in result', () => {
    const state = calculateSlaState(makeRequest('P0', 5), seedStrategies);
    const escalation = calculateEscalation(state, escalationPath, 30);
    expect(escalation!.escalation_path).toEqual(['Team Lead', 'SOM', 'CISO']);
  });
});

// ─── Full evaluateSla Flow Tests ─────────────────────────────────────────────

describe('evaluateSla — full flow with seed strategies', () => {
  it('returns successful result with all fields for non-breached case', () => {
    const request = makeRequest('P1', 12);
    const result = evaluateSla(request, seedStrategies);

    expect(result.success).toBe(true);
    expect(result.slaState).not.toBeNull();
    expect(result.slaState!.breached).toBe(false);
    expect(result.notifications).toHaveLength(0);
    expect(result.escalation).toBeNull();
    expect(result.source_policy).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it('returns breach notification and escalation for breached case', () => {
    // P0: target=4h, at 5h → breached, 1h over, cadence=30min → level 2
    const request = makeRequest('P0', 5);
    const result = evaluateSla(request, seedStrategies);

    expect(result.success).toBe(true);
    expect(result.slaState!.breached).toBe(true);
    expect(result.notifications.length).toBeGreaterThan(0);
    expect(result.notifications.some((n) => n.type === 'breach')).toBe(true);
    expect(result.escalation).not.toBeNull();
    expect(result.escalation!.escalation_level).toBe(2);
    expect(result.escalation!.currentEscalatee).toBe('CISO');
  });

  it('returns warning notifications at 75% usage', () => {
    // P1: target=24h, at 18h → 75%
    const request = makeRequest('P1', 18);
    const result = evaluateSla(request, seedStrategies);

    expect(result.success).toBe(true);
    expect(result.slaState!.breached).toBe(false);
    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0].type).toBe('warning');
    expect(result.escalation).toBeNull();
  });

  it('includes source policy reference from SLA strategy', () => {
    const request = makeRequest('P1', 12);
    const result = evaluateSla(request, seedStrategies);

    const slaPolicy = seedStrategies.find(
      (s) => s.surface_type === 'sla' && s.status === 'active',
    )!;
    expect(result.source_policy!.id).toBe(slaPolicy.id);
    expect(result.source_policy!.version).toBe(slaPolicy.policy_version);
  });

  it('extracts escalation path from routing strategy', () => {
    // P0: target=4h, at 4.5h → breached, 0.5h over, cadence=30min → level 1 → SOM
    const request = makeRequest('P0', 4.5);
    const result = evaluateSla(request, seedStrategies);

    expect(result.escalation).not.toBeNull();
    expect(result.escalation!.escalation_path).toEqual(['Team Lead', 'SOM', 'CISO']);
    expect(result.escalation!.currentEscalatee).toBe('SOM');
  });
});

// ─── Error Handling Tests ────────────────────────────────────────────────────

describe('evaluateSla — error handling when strategy is missing', () => {
  it('returns error when no strategies provided', () => {
    const request = makeRequest('P0', 2);
    const result = evaluateSla(request, []);

    expect(result.success).toBe(false);
    expect(result.slaState).toBeNull();
    expect(result.notifications).toHaveLength(0);
    expect(result.escalation).toBeNull();
    expect(result.error).toContain('STRATEGY GAP');
  });

  it('returns error when SLA strategy is missing', () => {
    const noSla = seedStrategies.filter((s) => s.surface_type !== 'sla');
    const request = makeRequest('P0', 2);
    const result = evaluateSla(request, noSla);

    expect(result.success).toBe(false);
    expect(result.error).toContain('No active SLA strategy');
  });

  it('returns error when SLA strategy has no profiles', () => {
    const emptyProfiles: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'sla') {
        return { ...s, configuration: { profiles: [] } };
      }
      return s;
    });
    const request = makeRequest('P0', 2);
    const result = evaluateSla(request, emptyProfiles);

    expect(result.success).toBe(false);
    expect(result.error).toContain('no profiles');
  });

  it('returns error when SLA strategy is inactive', () => {
    const inactiveSla: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'sla') {
        return { ...s, status: 'superseded' as const };
      }
      return s;
    });
    const request = makeRequest('P0', 2);
    const result = evaluateSla(request, inactiveSla);

    expect(result.success).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
  });

  it('still works without routing strategy (no escalation path)', () => {
    const noRouting = seedStrategies.filter((s) => s.surface_type !== 'routing');
    // P0: target=4h, at 5h → breached but no escalation path
    const request = makeRequest('P0', 5);
    const result = evaluateSla(request, noRouting);

    expect(result.success).toBe(true);
    expect(result.slaState!.breached).toBe(true);
    expect(result.escalation).toBeNull(); // No escalation path available
  });
});

// ─── Strategy-Driven Proof Tests ─────────────────────────────────────────────

describe('evaluateSla — proof that values come from strategy', () => {
  it('changing SLA profile hours changes target resolution', () => {
    const modifiedStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'sla') {
        return {
          ...s,
          configuration: {
            profiles: [
              { name: 'P0-Critical', response_hours: 2, escalation_cadence_minutes: 15 },
              { name: 'P1-High', response_hours: 12, escalation_cadence_minutes: 60 },
              { name: 'P2-Medium', response_hours: 24, escalation_cadence_minutes: 240 },
              { name: 'P3-Standard', response_hours: 72, escalation_cadence_minutes: 720 },
            ],
          },
        };
      }
      return s;
    });

    const request = makeRequest('P0', 3);

    // With seed strategy: target=4h, at 3h → not breached
    const resultSeed = evaluateSla(request, seedStrategies);
    expect(resultSeed.slaState!.target_resolution_hours).toBe(4);
    expect(resultSeed.slaState!.breached).toBe(false);

    // With modified strategy: target=2h, at 3h → breached!
    const resultModified = evaluateSla(request, modifiedStrategies);
    expect(resultModified.slaState!.target_resolution_hours).toBe(2);
    expect(resultModified.slaState!.breached).toBe(true);
  });

  it('changing escalation cadence changes escalation level', () => {
    const modifiedStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'sla') {
        return {
          ...s,
          configuration: {
            profiles: [
              { name: 'P0-Critical', response_hours: 4, escalation_cadence_minutes: 60 },
              { name: 'P1-High', response_hours: 24, escalation_cadence_minutes: 120 },
              { name: 'P2-Medium', response_hours: 48, escalation_cadence_minutes: 480 },
              { name: 'P3-Standard', response_hours: 168, escalation_cadence_minutes: 1440 },
            ],
          },
        };
      }
      return s;
    });

    // P0: target=4h, at 5h → 1h over
    const request = makeRequest('P0', 5);

    // Seed cadence=30min → 1h/0.5h = level 2
    const resultSeed = evaluateSla(request, seedStrategies);
    expect(resultSeed.escalation!.escalation_level).toBe(2);

    // Modified cadence=60min → 1h/1h = level 1
    const resultModified = evaluateSla(request, modifiedStrategies);
    expect(resultModified.escalation!.escalation_level).toBe(1);
  });

  it('changing escalation path changes escalatee', () => {
    const modifiedStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'routing') {
        return {
          ...s,
          configuration: {
            ...s.configuration,
            escalation_path: ['Analyst', 'Manager', 'VP Security', 'CTO'],
          },
        };
      }
      return s;
    });

    // P0: target=4h, at 5h → 1h over, cadence=30min → level 2
    const request = makeRequest('P0', 5);

    const resultSeed = evaluateSla(request, seedStrategies);
    expect(resultSeed.escalation!.currentEscalatee).toBe('CISO');

    const resultModified = evaluateSla(request, modifiedStrategies);
    expect(resultModified.escalation!.currentEscalatee).toBe('VP Security');
  });

  it('only active SLA strategies are consumed', () => {
    const inactiveStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'sla') {
        return { ...s, status: 'superseded' as const };
      }
      return s;
    });

    const request = makeRequest('P0', 2);
    const result = evaluateSla(request, inactiveStrategies);
    expect(result.success).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
  });
});

// ─── Edge Cases ──────────────────────────────────────────────────────────────

describe('Edge cases — boundary conditions', () => {
  it('exactly at 75% threshold generates warning', () => {
    // P1: target=24h, 75% = 18h exactly
    const state = calculateSlaState(makeRequest('P1', 18), seedStrategies);
    expect(state.percentageUsed).toBeCloseTo(75, 5);
    const notifications = generateNotifications(state);
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('warning');
  });

  it('just below 75% generates no notification', () => {
    // P1: target=24h, 74.9% = 17.976h
    const state = calculateSlaState(makeRequest('P1', 17.976), seedStrategies);
    expect(state.percentageUsed).toBeLessThan(75);
    const notifications = generateNotifications(state);
    expect(notifications).toHaveLength(0);
  });

  it('exactly at 90% threshold generates approaching-breach warning', () => {
    // P1: target=24h, 90% = 21.6h
    const state = calculateSlaState(makeRequest('P1', 21.6), seedStrategies);
    expect(state.percentageUsed).toBeCloseTo(90, 5);
    const notifications = generateNotifications(state);
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('warning');
    expect(notifications[0].message).toContain('approaching');
  });

  it('exactly at 100% threshold generates breach notification', () => {
    // P1: target=24h, 100% = 24h
    const state = calculateSlaState(makeRequest('P1', 24), seedStrategies);
    expect(state.percentageUsed).toBeCloseTo(100, 5);
    const notifications = generateNotifications(state);
    expect(notifications.some((n) => n.type === 'breach')).toBe(true);
  });

  it('exactly at 150% threshold generates critical-breach', () => {
    // P1: target=24h, 150% = 36h
    const state = calculateSlaState(makeRequest('P1', 36), seedStrategies);
    expect(state.percentageUsed).toBeCloseTo(150, 5);
    const notifications = generateNotifications(state);
    expect(notifications.some((n) => n.type === 'critical-breach')).toBe(true);
  });

  it('zero elapsed time produces 0% used', () => {
    const state = calculateSlaState(makeRequest('P1', 0), seedStrategies);
    expect(state.percentageUsed).toBe(0);
    expect(state.elapsedHours).toBe(0);
    expect(state.remainingHours).toBe(24);
    expect(state.breached).toBe(false);
  });

  it('very large elapsed time still works correctly', () => {
    // P0: target=4h, at 1000h → 25000% used
    const state = calculateSlaState(makeRequest('P0', 1000), seedStrategies);
    expect(state.percentageUsed).toBeCloseTo(25000, 0);
    expect(state.breached).toBe(true);
    expect(state.remainingHours).toBe(0);
  });
});
