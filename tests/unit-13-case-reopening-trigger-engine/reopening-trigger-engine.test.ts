import { describe, it, expect } from 'vitest';
import {
  REOPENING_TRIGGER_TYPES,
  evaluateTrigger,
  evaluateAllTriggers,
  extractReopeningTriggerConfig,
  evaluateReopeningReadiness,
  isManualReopeningBlocked,
} from '../../packages/contracts/src/engines/case-reopening-trigger-engine';
import type {
  ReopeningTriggerType,
  ReopeningTriggerInput,
  TriggerResult,
  CaseReopeningTriggerState,
  ReopeningTriggerEvaluationRequest,
  ReopeningTriggerEvaluationResult,
} from '../../packages/contracts/src/engines/case-reopening-trigger-engine';
import { seedStrategies } from '../../packages/contracts/src/fixtures/seed-strategies';
import type { StrategyPolicy } from '../../packages/contracts/src/entities/strategy';

/**
 * Unit 13: Case Reopening Trigger Engine Tests
 *
 * Validates:
 * - All 14 trigger types exist
 * - Each trigger evaluates correctly (fires/does not fire)
 * - Only configured triggers are evaluated
 * - Non-configured triggers are skipped
 * - Any single trigger firing → reopening required
 * - No triggers firing → reopening not required
 * - Full evaluateReopeningReadiness flow with seed strategies
 * - Error handling when strategy is missing
 * - System-owned reopening enforcement (manual reopening always blocked)
 * - Proof that trigger configuration comes from strategy
 * - Trigger status tracking per case
 */

// ─── Test Fixtures ───────────────────────────────────────────────────────────

const BASE_TIME = '2026-01-20T00:00:00.000Z';

function makeAllFiringInput(): ReopeningTriggerInput {
  return {
    riskConditionReappeared: true,
    severityOrExploitabilityChanged: true,
    kevCvssEpssChanged: true,
    validationExpiredOrFailed: true,
    compensatingControlDegraded: true,
    affectedScopeExpanded: true,
    blastRadiusExpanded: true,
    missionImpactIncreased: true,
    routingOwnerRejected: true,
    communicationInboundEvidence: true,
    connectorFreshnessDropped: true,
    toolCoverageDegraded: true,
    suppressionExceptionExpired: true,
    strategyThresholdRequalified: true,
  };
}

function makeNoFiringInput(): ReopeningTriggerInput {
  return {
    riskConditionReappeared: false,
    severityOrExploitabilityChanged: false,
    kevCvssEpssChanged: false,
    validationExpiredOrFailed: false,
    compensatingControlDegraded: false,
    affectedScopeExpanded: false,
    blastRadiusExpanded: false,
    missionImpactIncreased: false,
    routingOwnerRejected: false,
    communicationInboundEvidence: false,
    connectorFreshnessDropped: false,
    toolCoverageDegraded: false,
    suppressionExceptionExpired: false,
    strategyThresholdRequalified: false,
  };
}

function makeEvaluationRequest(
  overrides: Partial<ReopeningTriggerEvaluationRequest> = {},
): ReopeningTriggerEvaluationRequest {
  return {
    case_id: 'case-test-001',
    triggerInput: makeNoFiringInput(),
    current_time: BASE_TIME,
    ...overrides,
  };
}

/**
 * Create a custom reopening-trigger strategy with specific triggers configured.
 */
function makeReopeningTriggerStrategy(triggers: string[]): StrategyPolicy[] {
  return seedStrategies.map((s) => {
    if (s.surface_type === 'reopening-trigger') {
      return { ...s, configuration: { triggers } };
    }
    return s;
  });
}

// ─── All 14 Trigger Types Exist ──────────────────────────────────────────────

describe('REOPENING_TRIGGER_TYPES — all 14 reopening trigger types exist', () => {
  it('contains exactly 14 trigger types', () => {
    expect(REOPENING_TRIGGER_TYPES).toHaveLength(14);
  });

  const expectedTriggers: ReopeningTriggerType[] = [
    'risk_condition_reappears',
    'severity_exploitability_change',
    'kev_cvss_epss_change',
    'validation_expires_or_fails',
    'compensating_control_degrades',
    'affected_scope_expands',
    'blast_radius_expands',
    'mission_impact_increases',
    'routing_owner_rejects',
    'communication_inbound_evidence',
    'connector_freshness_drops',
    'tool_coverage_degrades',
    'suppression_exception_expires',
    'strategy_threshold_requalifies',
  ];

  expectedTriggers.forEach((trigger) => {
    it(`includes ${trigger}`, () => {
      expect(REOPENING_TRIGGER_TYPES).toContain(trigger);
    });
  });
});

// ─── Each Trigger Evaluates Correctly (Fires/Does Not Fire) ──────────────────

describe('evaluateTrigger — each trigger evaluates correctly', () => {
  const triggerToInputField: Record<ReopeningTriggerType, keyof ReopeningTriggerInput> = {
    risk_condition_reappears: 'riskConditionReappeared',
    severity_exploitability_change: 'severityOrExploitabilityChanged',
    kev_cvss_epss_change: 'kevCvssEpssChanged',
    validation_expires_or_fails: 'validationExpiredOrFailed',
    compensating_control_degrades: 'compensatingControlDegraded',
    affected_scope_expands: 'affectedScopeExpanded',
    blast_radius_expands: 'blastRadiusExpanded',
    mission_impact_increases: 'missionImpactIncreased',
    routing_owner_rejects: 'routingOwnerRejected',
    communication_inbound_evidence: 'communicationInboundEvidence',
    connector_freshness_drops: 'connectorFreshnessDropped',
    tool_coverage_degrades: 'toolCoverageDegraded',
    suppression_exception_expires: 'suppressionExceptionExpired',
    strategy_threshold_requalifies: 'strategyThresholdRequalified',
  };

  REOPENING_TRIGGER_TYPES.forEach((trigger) => {
    describe(`trigger: ${trigger}`, () => {
      it('returns fired=true when input condition is true', () => {
        const input = makeNoFiringInput();
        const field = triggerToInputField[trigger];
        (input as unknown as Record<string, boolean>)[field] = true;
        const result = evaluateTrigger(trigger, input, BASE_TIME);
        expect(result.fired).toBe(true);
        expect(result.trigger).toBe(trigger);
        expect(result.evaluated_at).toBe(BASE_TIME);
        expect(result.reason).toBeTruthy();
      });

      it('returns fired=false when input condition is false', () => {
        const input = makeNoFiringInput();
        const result = evaluateTrigger(trigger, input, BASE_TIME);
        expect(result.fired).toBe(false);
        expect(result.trigger).toBe(trigger);
        expect(result.evaluated_at).toBe(BASE_TIME);
        expect(result.reason).toBeTruthy();
      });
    });
  });
});

// ─── Only Configured Triggers Are Evaluated ──────────────────────────────────

describe('evaluateAllTriggers — only configured triggers are evaluated', () => {
  it('evaluates only configured triggers', () => {
    const configuredTriggers: ReopeningTriggerType[] = [
      'risk_condition_reappears',
      'validation_expires_or_fails',
    ];
    const input = makeAllFiringInput();
    const state = evaluateAllTriggers(configuredTriggers, input, BASE_TIME);

    const configuredResults = state.triggerResults.filter(
      (r) => !r.reason.includes('not configured'),
    );
    expect(configuredResults).toHaveLength(2);
    expect(configuredResults.every((r) => configuredTriggers.includes(r.trigger))).toBe(true);
  });

  it('marks non-configured triggers as not configured', () => {
    const configuredTriggers: ReopeningTriggerType[] = ['risk_condition_reappears'];
    const input = makeNoFiringInput();
    const state = evaluateAllTriggers(configuredTriggers, input, BASE_TIME);

    const notConfigured = state.triggerResults.filter(
      (r) => r.reason.includes('not configured'),
    );
    expect(notConfigured).toHaveLength(13); // 14 total - 1 configured = 13
    notConfigured.forEach((r) => {
      expect(r.fired).toBe(false);
      expect(r.reason).toContain('not configured');
    });
  });

  it('returns all 14 trigger results regardless of configuration', () => {
    const configuredTriggers: ReopeningTriggerType[] = [
      'blast_radius_expands',
      'tool_coverage_degrades',
    ];
    const input = makeNoFiringInput();
    const state = evaluateAllTriggers(configuredTriggers, input, BASE_TIME);

    expect(state.triggerResults).toHaveLength(14);
  });

  it('evaluates all 14 triggers when all are configured', () => {
    const input = makeNoFiringInput();
    const state = evaluateAllTriggers(REOPENING_TRIGGER_TYPES, input, BASE_TIME);

    const notConfigured = state.triggerResults.filter(
      (r) => r.reason.includes('not configured'),
    );
    expect(notConfigured).toHaveLength(0);
  });
});

// ─── Any Single Trigger Firing → Reopening Required ──────────────────────────

describe('evaluateAllTriggers — any single trigger firing requires reopening', () => {
  it('requires reopening when a single configured trigger fires', () => {
    const configuredTriggers: ReopeningTriggerType[] = [
      'risk_condition_reappears',
      'severity_exploitability_change',
      'validation_expires_or_fails',
      'blast_radius_expands',
    ];
    const input = makeNoFiringInput();
    input.blastRadiusExpanded = true; // Only one trigger fires
    const state = evaluateAllTriggers(configuredTriggers, input, BASE_TIME);

    expect(state.anyTriggerFired).toBe(true);
    expect(state.reopeningRequired).toBe(true);

    const firedTriggers = state.triggerResults.filter((r) => r.fired);
    expect(firedTriggers).toHaveLength(1);
    expect(firedTriggers[0].trigger).toBe('blast_radius_expands');
  });

  it('requires reopening when multiple configured triggers fire', () => {
    const configuredTriggers: ReopeningTriggerType[] = REOPENING_TRIGGER_TYPES;
    const input = makeAllFiringInput();
    const state = evaluateAllTriggers(configuredTriggers, input, BASE_TIME);

    expect(state.anyTriggerFired).toBe(true);
    expect(state.reopeningRequired).toBe(true);

    const firedTriggers = state.triggerResults.filter((r) => r.fired);
    expect(firedTriggers).toHaveLength(14);
  });

  it('does not require reopening when non-configured triggers would fire', () => {
    // Only risk_condition_reappears is configured, but it does not fire
    const configuredTriggers: ReopeningTriggerType[] = ['risk_condition_reappears'];
    const input = makeAllFiringInput();
    input.riskConditionReappeared = false; // The configured trigger does NOT fire
    const state = evaluateAllTriggers(configuredTriggers, input, BASE_TIME);

    // Even though all other conditions are true, they are not configured
    expect(state.anyTriggerFired).toBe(false);
    expect(state.reopeningRequired).toBe(false);
  });
});

// ─── No Triggers Firing → Reopening Not Required ─────────────────────────────

describe('evaluateAllTriggers — no triggers firing means reopening not required', () => {
  it('does not require reopening when no configured triggers fire', () => {
    const configuredTriggers: ReopeningTriggerType[] = [
      'risk_condition_reappears',
      'severity_exploitability_change',
      'kev_cvss_epss_change',
      'validation_expires_or_fails',
    ];
    const input = makeNoFiringInput();
    const state = evaluateAllTriggers(configuredTriggers, input, BASE_TIME);

    expect(state.anyTriggerFired).toBe(false);
    expect(state.reopeningRequired).toBe(false);
  });

  it('does not require reopening with all triggers configured but none firing', () => {
    const input = makeNoFiringInput();
    const state = evaluateAllTriggers(REOPENING_TRIGGER_TYPES, input, BASE_TIME);

    expect(state.anyTriggerFired).toBe(false);
    expect(state.reopeningRequired).toBe(false);
  });
});

// ─── Full evaluateReopeningReadiness Flow ────────────────────────────────────

describe('evaluateReopeningReadiness — full flow with strategies', () => {
  it('returns successful result when no configured triggers fire', () => {
    const strategies = makeReopeningTriggerStrategy([
      'risk_condition_reappears',
      'validation_expires_or_fails',
      'blast_radius_expands',
    ]);
    const request = makeEvaluationRequest();
    const result = evaluateReopeningReadiness(request, strategies);

    expect(result.success).toBe(true);
    expect(result.reopeningRequired).toBe(false);
    expect(result.triggerState).not.toBeNull();
    expect(result.triggerState!.case_id).toBe('case-test-001');
    expect(result.firedTriggers).toHaveLength(0);
    expect(result.rationale).toContain('not required');
    expect(result.source_policy).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it('returns reopening-required result when a configured trigger fires', () => {
    const strategies = makeReopeningTriggerStrategy([
      'risk_condition_reappears',
      'validation_expires_or_fails',
    ]);
    const input = makeNoFiringInput();
    input.validationExpiredOrFailed = true;
    const request = makeEvaluationRequest({ triggerInput: input });
    const result = evaluateReopeningReadiness(request, strategies);

    expect(result.success).toBe(true);
    expect(result.reopeningRequired).toBe(true);
    expect(result.firedTriggers).toHaveLength(1);
    expect(result.firedTriggers[0].trigger).toBe('validation_expires_or_fails');
    expect(result.rationale).toContain('fired');
    expect(result.rationale).toContain('required');
  });

  it('includes source policy reference in result', () => {
    const strategies = makeReopeningTriggerStrategy(['risk_condition_reappears']);
    const request = makeEvaluationRequest();
    const result = evaluateReopeningReadiness(request, strategies);

    expect(result.source_policy).not.toBeNull();
    expect(result.source_policy!.id).toBeTruthy();
    expect(result.source_policy!.version).toBe('1.0.0');
  });

  it('tracks trigger state per case', () => {
    const strategies = makeReopeningTriggerStrategy([
      'risk_condition_reappears',
      'connector_freshness_drops',
      'suppression_exception_expires',
    ]);
    const request = makeEvaluationRequest({ case_id: 'case-xyz-123' });
    const result = evaluateReopeningReadiness(request, strategies);

    expect(result.triggerState!.case_id).toBe('case-xyz-123');
    expect(result.triggerState!.configuredTriggers).toEqual([
      'risk_condition_reappears',
      'connector_freshness_drops',
      'suppression_exception_expires',
    ]);
    expect(result.triggerState!.evaluated_at).toBe(BASE_TIME);
  });
});

// ─── Error Handling When Strategy Is Missing ─────────────────────────────────

describe('evaluateReopeningReadiness — error handling when strategy is missing', () => {
  it('returns error when no strategies provided', () => {
    const request = makeEvaluationRequest();
    const result = evaluateReopeningReadiness(request, []);

    expect(result.success).toBe(false);
    expect(result.triggerState).toBeNull();
    expect(result.reopeningRequired).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
    expect(result.source_policy).toBeNull();
  });

  it('returns error when reopening-trigger strategy is missing', () => {
    const noReopeningTrigger = seedStrategies.filter(
      (s) => s.surface_type !== 'reopening-trigger',
    );
    const request = makeEvaluationRequest();
    const result = evaluateReopeningReadiness(request, noReopeningTrigger);

    expect(result.success).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
  });

  it('returns error when reopening-trigger strategy is inactive', () => {
    const inactiveStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'reopening-trigger') {
        return { ...s, status: 'superseded' as const };
      }
      return s;
    });
    const request = makeEvaluationRequest();
    const result = evaluateReopeningReadiness(request, inactiveStrategies);

    expect(result.success).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
  });

  it('returns error when reopening-trigger strategy has empty triggers array', () => {
    const emptyTriggers: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'reopening-trigger') {
        return { ...s, configuration: { triggers: [] } };
      }
      return s;
    });
    const request = makeEvaluationRequest();
    const result = evaluateReopeningReadiness(request, emptyTriggers);

    expect(result.success).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
  });
});

// ─── System-Owned Reopening Enforcement ──────────────────────────────────────

describe('isManualReopeningBlocked — system-owned reopening enforcement', () => {
  it('always returns true (manual reopening is always blocked)', () => {
    expect(isManualReopeningBlocked()).toBe(true);
  });

  it('return type is literal true', () => {
    const result: true = isManualReopeningBlocked();
    expect(result).toBe(true);
  });
});

// ─── Proof That Trigger Configuration Comes From Strategy ────────────────────

describe('extractReopeningTriggerConfig — trigger configuration from strategy', () => {
  it('extracts triggers from active reopening-trigger strategy', () => {
    const config = extractReopeningTriggerConfig(seedStrategies);
    // Seed strategy has legacy trigger names that won't match the 14 new types
    // so it returns null (no valid triggers after filtering)
    // This proves configuration comes from strategy — invalid names are filtered out
    expect(config).toBeNull();
  });

  it('extracts valid triggers from a properly configured strategy', () => {
    const strategies = makeReopeningTriggerStrategy([
      'risk_condition_reappears',
      'blast_radius_expands',
      'tool_coverage_degrades',
    ]);
    const config = extractReopeningTriggerConfig(strategies);
    expect(config).not.toBeNull();
    expect(config!.triggers).toHaveLength(3);
    expect(config!.policy).toBeDefined();
    expect(config!.policy.surface_type).toBe('reopening-trigger');
  });

  it('returns null when no reopening-trigger strategy exists', () => {
    const noReopeningTrigger = seedStrategies.filter(
      (s) => s.surface_type !== 'reopening-trigger',
    );
    const config = extractReopeningTriggerConfig(noReopeningTrigger);
    expect(config).toBeNull();
  });

  it('returns null when strategy has no triggers configured', () => {
    const emptyTriggers: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'reopening-trigger') {
        return { ...s, configuration: { triggers: [] } };
      }
      return s;
    });
    const config = extractReopeningTriggerConfig(emptyTriggers);
    expect(config).toBeNull();
  });

  it('changing strategy triggers changes which triggers are evaluated', () => {
    // Strategy with 2 triggers
    const twoTriggerStrategies = makeReopeningTriggerStrategy([
      'risk_condition_reappears',
      'blast_radius_expands',
    ]);
    const request = makeEvaluationRequest();
    const result2 = evaluateReopeningReadiness(request, twoTriggerStrategies);
    expect(result2.triggerState!.configuredTriggers).toHaveLength(2);

    // Strategy with 5 triggers
    const fiveTriggerStrategies = makeReopeningTriggerStrategy([
      'risk_condition_reappears',
      'blast_radius_expands',
      'tool_coverage_degrades',
      'connector_freshness_drops',
      'mission_impact_increases',
    ]);
    const result5 = evaluateReopeningReadiness(request, fiveTriggerStrategies);
    expect(result5.triggerState!.configuredTriggers).toHaveLength(5);
  });

  it('filters out invalid trigger names from strategy', () => {
    const invalidTriggerStrategies = makeReopeningTriggerStrategy([
      'risk_condition_reappears',
      'invalid_trigger_name',
      'blast_radius_expands',
    ]);
    const config = extractReopeningTriggerConfig(invalidTriggerStrategies);
    expect(config).not.toBeNull();
    expect(config!.triggers).toHaveLength(2);
    expect(config!.triggers).toContain('risk_condition_reappears');
    expect(config!.triggers).toContain('blast_radius_expands');
    expect(config!.triggers).not.toContain('invalid_trigger_name');
  });
});

// ─── Trigger Status Tracking Per Case ────────────────────────────────────────

describe('evaluateReopeningReadiness — trigger status tracking per case', () => {
  it('tracks different case IDs independently', () => {
    const strategies = makeReopeningTriggerStrategy([
      'risk_condition_reappears',
      'blast_radius_expands',
    ]);

    const request1 = makeEvaluationRequest({ case_id: 'case-001' });
    const result1 = evaluateReopeningReadiness(request1, strategies);

    const request2 = makeEvaluationRequest({ case_id: 'case-002' });
    const result2 = evaluateReopeningReadiness(request2, strategies);

    expect(result1.triggerState!.case_id).toBe('case-001');
    expect(result2.triggerState!.case_id).toBe('case-002');
  });

  it('records evaluatedAt timestamp in trigger state', () => {
    const strategies = makeReopeningTriggerStrategy(['risk_condition_reappears']);
    const customTime = '2026-03-15T14:30:00.000Z';
    const request = makeEvaluationRequest({ current_time: customTime });
    const result = evaluateReopeningReadiness(request, strategies);

    expect(result.triggerState!.evaluated_at).toBe(customTime);
    result.triggerState!.triggerResults.forEach((r) => {
      expect(r.evaluated_at).toBe(customTime);
    });
  });

  it('records all trigger results including not configured', () => {
    const strategies = makeReopeningTriggerStrategy(['risk_condition_reappears']);
    const request = makeEvaluationRequest();
    const result = evaluateReopeningReadiness(request, strategies);

    expect(result.triggerState!.triggerResults).toHaveLength(14);

    const configured = result.triggerState!.triggerResults.filter(
      (r) => !r.reason.includes('not configured'),
    );
    expect(configured).toHaveLength(1);
    expect(configured[0].trigger).toBe('risk_condition_reappears');
    expect(configured[0].fired).toBe(false);
  });

  it('provides per-trigger reason for audit trail', () => {
    const strategies = makeReopeningTriggerStrategy([
      'risk_condition_reappears',
      'blast_radius_expands',
    ]);
    const input = makeNoFiringInput();
    input.blastRadiusExpanded = true;
    const request = makeEvaluationRequest({ triggerInput: input });
    const result = evaluateReopeningReadiness(request, strategies);

    const blastResult = result.triggerState!.triggerResults.find(
      (r) => r.trigger === 'blast_radius_expands',
    );
    expect(blastResult).toBeDefined();
    expect(blastResult!.fired).toBe(true);
    expect(blastResult!.reason).toContain('expanded');

    const riskResult = result.triggerState!.triggerResults.find(
      (r) => r.trigger === 'risk_condition_reappears',
    );
    expect(riskResult).toBeDefined();
    expect(riskResult!.fired).toBe(false);
    expect(riskResult!.reason).toContain('not reappeared');
  });
});
