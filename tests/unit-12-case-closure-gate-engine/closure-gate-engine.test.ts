// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
import { describe, it, expect } from 'vitest';
import {
  CLOSURE_GATE_TYPES,
  evaluateGate,
  evaluateAllGates,
  extractClosureGateConfig,
  evaluateClosureReadiness,
  isManualClosureBlocked,
} from '../../packages/contracts/src/engines/case-closure-gate-engine';
import type {
  ClosureGateType,
  GateInput,
  GateResult,
  CaseClosureGateState,
  ClosureGateEvaluationRequest,
  ClosureGateEvaluationResult,
} from '../../packages/contracts/src/engines/case-closure-gate-engine';
import { seedStrategies } from '../../packages/contracts/src/fixtures/seed-strategies';
import type { StrategyPolicy } from '../../packages/contracts/src/entities/strategy';

/**
 * Unit 12: Case Closure Gate Engine Tests
 *
 * Validates:
 * - All 12 gate types exist
 * - Each gate evaluates correctly (pass/fail)
 * - Only configured gates are evaluated
 * - Non-configured gates are skipped
 * - All gates must pass for closure to be permitted
 * - Single gate failure blocks closure
 * - Full evaluateClosureReadiness flow with seed strategies
 * - Error handling when strategy is missing
 * - System-owned closure enforcement (manual closure always blocked)
 * - Proof that gate configuration comes from strategy
 * - Gate status tracking per case
 */

// ─── Test Fixtures ───────────────────────────────────────────────────────────

const BASE_TIME = '2026-01-20T00:00:00.000Z';

function makeAllPassingInput(): GateInput {
  return {
    technicalValidationPassed: true,
    allSubActionsComplete: true,
    communicationSent: true,
    externalNotifierAcknowledged: true,
    sirAcknowledged: true,
    slaResidualPhaseComplete: true,
    exceptionsExpired: true,
    evidenceFresh: true,
    approvalGranted: true,
    auditComplete: true,
    missionImpactAssessed: true,
    fusionMapRefreshed: true,
  };
}

function makeAllFailingInput(): GateInput {
  return {
    technicalValidationPassed: false,
    allSubActionsComplete: false,
    communicationSent: false,
    externalNotifierAcknowledged: false,
    sirAcknowledged: false,
    slaResidualPhaseComplete: false,
    exceptionsExpired: false,
    evidenceFresh: false,
    approvalGranted: false,
    auditComplete: false,
    missionImpactAssessed: false,
    fusionMapRefreshed: false,
  };
}

function makeEvaluationRequest(
  overrides: Partial<ClosureGateEvaluationRequest> = {},
): ClosureGateEvaluationRequest {
  return {
    case_id: 'case-test-001',
    gateInput: makeAllPassingInput(),
    currentTime: BASE_TIME,
    ...overrides,
  };
}

/**
 * Create a custom closure-gate strategy with specific gates configured.
 */
function makeClosureGateStrategy(gates: string[]): StrategyPolicy[] {
  return seedStrategies.map((s) => {
    if (s.surface_type === 'closure-gate') {
      return { ...s, configuration: { gates } };
    }
    return s;
  });
}

// ─── All 12 Gate Types Exist ─────────────────────────────────────────────────

describe('CLOSURE_GATE_TYPES — all 12 closure gate types exist', () => {
  it('contains exactly 12 gate types', () => {
    expect(CLOSURE_GATE_TYPES).toHaveLength(12);
  });

  const expectedGates: ClosureGateType[] = [
    'technical_validation',
    'sub_action_completion',
    'communication',
    'external_notifier',
    'sir_acknowledgement',
    'sla_residual_phase',
    'exception_suppression_expiry',
    'evidence_freshness',
    'approval',
    'audit_completeness',
    'mission_impact',
    'fusion_map_state_refresh',
  ];

  expectedGates.forEach((gate) => {
    it(`includes ${gate}`, () => {
      expect(CLOSURE_GATE_TYPES).toContain(gate);
    });
  });
});

// ─── Each Gate Evaluates Correctly (Pass/Fail) ───────────────────────────────

describe('evaluateGate — each gate evaluates correctly', () => {
  const gateToInputField: Record<ClosureGateType, keyof GateInput> = {
    technical_validation: 'technicalValidationPassed',
    sub_action_completion: 'allSubActionsComplete',
    communication: 'communicationSent',
    external_notifier: 'externalNotifierAcknowledged',
    sir_acknowledgement: 'sirAcknowledged',
    sla_residual_phase: 'slaResidualPhaseComplete',
    exception_suppression_expiry: 'exceptionsExpired',
    evidence_freshness: 'evidenceFresh',
    approval: 'approvalGranted',
    audit_completeness: 'auditComplete',
    mission_impact: 'missionImpactAssessed',
    fusion_map_state_refresh: 'fusionMapRefreshed',
  };

  CLOSURE_GATE_TYPES.forEach((gate) => {
    describe(`gate: ${gate}`, () => {
      it('returns passed when input condition is true', () => {
        const input = makeAllPassingInput();
        const result = evaluateGate(gate, input, BASE_TIME);
        expect(result.status).toBe('passed');
        expect(result.gate).toBe(gate);
        expect(result.evaluated_at).toBe(BASE_TIME);
        expect(result.reason).toBeTruthy();
      });

      it('returns failed when input condition is false', () => {
        const input = makeAllPassingInput();
        const field = gateToInputField[gate];
        (input as unknown as Record<string, boolean>)[field] = false;
        const result = evaluateGate(gate, input, BASE_TIME);
        expect(result.status).toBe('failed');
        expect(result.gate).toBe(gate);
        expect(result.evaluated_at).toBe(BASE_TIME);
        expect(result.reason).toBeTruthy();
      });
    });
  });
});

// ─── Only Configured Gates Are Evaluated ─────────────────────────────────────

describe('evaluateAllGates — only configured gates are evaluated', () => {
  it('evaluates only configured gates', () => {
    const configuredGates: ClosureGateType[] = ['technical_validation', 'approval'];
    const input = makeAllPassingInput();
    const state = evaluateAllGates(configuredGates, input, BASE_TIME);

    const configuredResults = state.gateResults.filter((r) => r.status !== 'not_configured');
    expect(configuredResults).toHaveLength(2);
    expect(configuredResults.every((r) => configuredGates.includes(r.gate))).toBe(true);
  });

  it('marks non-configured gates as not_configured', () => {
    const configuredGates: ClosureGateType[] = ['technical_validation'];
    const input = makeAllPassingInput();
    const state = evaluateAllGates(configuredGates, input, BASE_TIME);

    const notConfigured = state.gateResults.filter((r) => r.status === 'not_configured');
    expect(notConfigured).toHaveLength(11); // 12 total - 1 configured = 11
    notConfigured.forEach((r) => {
      expect(r.reason).toContain('not configured');
    });
  });

  it('returns all 12 gate results regardless of configuration', () => {
    const configuredGates: ClosureGateType[] = ['approval', 'audit_completeness'];
    const input = makeAllPassingInput();
    const state = evaluateAllGates(configuredGates, input, BASE_TIME);

    expect(state.gateResults).toHaveLength(12);
  });

  it('evaluates all 12 gates when all are configured', () => {
    const input = makeAllPassingInput();
    const state = evaluateAllGates(CLOSURE_GATE_TYPES, input, BASE_TIME);

    const notConfigured = state.gateResults.filter((r) => r.status === 'not_configured');
    expect(notConfigured).toHaveLength(0);
  });
});

// ─── All Gates Must Pass for Closure ─────────────────────────────────────────

describe('evaluateAllGates — all gates must pass for closure to be permitted', () => {
  it('permits closure when all configured gates pass', () => {
    const configuredGates: ClosureGateType[] = [
      'technical_validation',
      'sub_action_completion',
      'communication',
      'approval',
    ];
    const input = makeAllPassingInput();
    const state = evaluateAllGates(configuredGates, input, BASE_TIME);

    expect(state.allGatesPass).toBe(true);
    expect(state.closurePermitted).toBe(true);
  });

  it('blocks closure when any configured gate fails', () => {
    const configuredGates: ClosureGateType[] = [
      'technical_validation',
      'approval',
    ];
    const input = makeAllPassingInput();
    input.approvalGranted = false;
    const state = evaluateAllGates(configuredGates, input, BASE_TIME);

    expect(state.allGatesPass).toBe(false);
    expect(state.closurePermitted).toBe(false);
  });

  it('permits closure when non-configured gates would fail', () => {
    // Only technical_validation is configured and passes
    const configuredGates: ClosureGateType[] = ['technical_validation'];
    const input = makeAllFailingInput();
    input.technicalValidationPassed = true; // Only the configured gate passes
    const state = evaluateAllGates(configuredGates, input, BASE_TIME);

    expect(state.allGatesPass).toBe(true);
    expect(state.closurePermitted).toBe(true);
  });
});

// ─── Single Gate Failure Blocks Closure ──────────────────────────────────────

describe('evaluateAllGates — single gate failure blocks closure', () => {
  it('single failure among many configured gates blocks closure', () => {
    const configuredGates: ClosureGateType[] = [
      'technical_validation',
      'sub_action_completion',
      'communication',
      'external_notifier',
      'approval',
      'audit_completeness',
    ];
    const input = makeAllPassingInput();
    input.communicationSent = false; // Only one gate fails
    const state = evaluateAllGates(configuredGates, input, BASE_TIME);

    expect(state.allGatesPass).toBe(false);
    expect(state.closurePermitted).toBe(false);

    const failedGates = state.gateResults.filter((r) => r.status === 'failed');
    expect(failedGates).toHaveLength(1);
    expect(failedGates[0].gate).toBe('communication');
  });

  it('multiple failures all block closure', () => {
    const configuredGates: ClosureGateType[] = CLOSURE_GATE_TYPES;
    const input = makeAllFailingInput();
    const state = evaluateAllGates(configuredGates, input, BASE_TIME);

    expect(state.allGatesPass).toBe(false);
    expect(state.closurePermitted).toBe(false);

    const failedGates = state.gateResults.filter((r) => r.status === 'failed');
    expect(failedGates).toHaveLength(12);
  });
});

// ─── Full evaluateClosureReadiness Flow ──────────────────────────────────────

describe('evaluateClosureReadiness — full flow with seed strategies', () => {
  it('returns successful result when all seed-configured gates pass', () => {
    // Seed strategy configures: remediation-verified, validation-passed, no-active-drift, sla-not-breached
    // These are legacy gate names from the old enforcer — the new engine uses ClosureGateType names
    // The seed strategy gates won't match the new 12 gate types, so we use a custom strategy
    const strategies = makeClosureGateStrategy([
      'technical_validation',
      'sub_action_completion',
      'approval',
    ]);
    const request = makeEvaluationRequest();
    const result = evaluateClosureReadiness(request, strategies);

    expect(result.success).toBe(true);
    expect(result.closurePermitted).toBe(true);
    expect(result.closureGateState).not.toBeNull();
    expect(result.closureGateState!.case_id).toBe('case-test-001');
    expect(result.failedGates).toHaveLength(0);
    expect(result.rationale).toContain('passed');
    expect(result.sourcePolicy).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it('returns blocked result when a configured gate fails', () => {
    const strategies = makeClosureGateStrategy([
      'technical_validation',
      'approval',
    ]);
    const input = makeAllPassingInput();
    input.approvalGranted = false;
    const request = makeEvaluationRequest({ gateInput: input });
    const result = evaluateClosureReadiness(request, strategies);

    expect(result.success).toBe(true);
    expect(result.closurePermitted).toBe(false);
    expect(result.failedGates).toHaveLength(1);
    expect(result.failedGates[0].gate).toBe('approval');
    expect(result.rationale).toContain('failed');
    expect(result.rationale).toContain('blocked');
  });

  it('includes source policy reference in result', () => {
    const strategies = makeClosureGateStrategy(['technical_validation']);
    const request = makeEvaluationRequest();
    const result = evaluateClosureReadiness(request, strategies);

    expect(result.sourcePolicy).not.toBeNull();
    expect(result.sourcePolicy!.id).toBeTruthy();
    expect(result.sourcePolicy!.version).toBe('1.0.0');
  });

  it('tracks gate state per case', () => {
    const strategies = makeClosureGateStrategy([
      'technical_validation',
      'evidence_freshness',
      'mission_impact',
    ]);
    const request = makeEvaluationRequest({ case_id: 'case-xyz-123' });
    const result = evaluateClosureReadiness(request, strategies);

    expect(result.closureGateState!.case_id).toBe('case-xyz-123');
    expect(result.closureGateState!.configuredGates).toEqual([
      'technical_validation',
      'evidence_freshness',
      'mission_impact',
    ]);
    expect(result.closureGateState!.evaluated_at).toBe(BASE_TIME);
  });
});

// ─── Error Handling When Strategy Is Missing ─────────────────────────────────

describe('evaluateClosureReadiness — error handling when strategy is missing', () => {
  it('returns error when no strategies provided', () => {
    const request = makeEvaluationRequest();
    const result = evaluateClosureReadiness(request, []);

    expect(result.success).toBe(false);
    expect(result.closureGateState).toBeNull();
    expect(result.closurePermitted).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
    expect(result.sourcePolicy).toBeNull();
  });

  it('returns error when closure-gate strategy is missing', () => {
    const noClosureGate = seedStrategies.filter(
      (s) => s.surface_type !== 'closure-gate',
    );
    const request = makeEvaluationRequest();
    const result = evaluateClosureReadiness(request, noClosureGate);

    expect(result.success).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
  });

  it('returns error when closure-gate strategy is inactive', () => {
    const inactiveStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'closure-gate') {
        return { ...s, status: 'superseded' as const };
      }
      return s;
    });
    const request = makeEvaluationRequest();
    const result = evaluateClosureReadiness(request, inactiveStrategies);

    expect(result.success).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
  });

  it('returns error when closure-gate strategy has empty gates array', () => {
    const emptyGates: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'closure-gate') {
        return { ...s, configuration: { gates: [] } };
      }
      return s;
    });
    const request = makeEvaluationRequest();
    const result = evaluateClosureReadiness(request, emptyGates);

    expect(result.success).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
  });
});

// ─── System-Owned Closure Enforcement ────────────────────────────────────────

describe('isManualClosureBlocked — system-owned closure enforcement', () => {
  it('always returns true (manual closure is always blocked)', () => {
    expect(isManualClosureBlocked()).toBe(true);
  });

  it('return type is literal true', () => {
    const result: true = isManualClosureBlocked();
    expect(result).toBe(true);
  });
});

// ─── Proof That Gate Configuration Comes From Strategy ───────────────────────

describe('extractClosureGateConfig — gate configuration from strategy', () => {
  it('extracts gates from active closure-gate strategy', () => {
    const config = extractClosureGateConfig(seedStrategies);
    expect(config).not.toBeNull();
    expect(config!.gates).toBeDefined();
    expect(config!.policy).toBeDefined();
    expect(config!.policy.surface_type).toBe('closure-gate');
  });

  it('returns null when no closure-gate strategy exists', () => {
    const noClosureGate = seedStrategies.filter(
      (s) => s.surface_type !== 'closure-gate',
    );
    const config = extractClosureGateConfig(noClosureGate);
    expect(config).toBeNull();
  });

  it('returns null when strategy has no gates configured', () => {
    const emptyGates: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'closure-gate') {
        return { ...s, configuration: { gates: [] } };
      }
      return s;
    });
    const config = extractClosureGateConfig(emptyGates);
    expect(config).toBeNull();
  });

  it('changing strategy gates changes which gates are evaluated', () => {
    // Strategy with 2 gates
    const twoGateStrategies = makeClosureGateStrategy([
      'technical_validation',
      'approval',
    ]);
    const request = makeEvaluationRequest();
    const result2 = evaluateClosureReadiness(request, twoGateStrategies);
    expect(result2.closureGateState!.configuredGates).toHaveLength(2);

    // Strategy with 5 gates
    const fiveGateStrategies = makeClosureGateStrategy([
      'technical_validation',
      'approval',
      'audit_completeness',
      'evidence_freshness',
      'mission_impact',
    ]);
    const result5 = evaluateClosureReadiness(request, fiveGateStrategies);
    expect(result5.closureGateState!.configuredGates).toHaveLength(5);
  });

  it('filters out invalid gate names from strategy', () => {
    const invalidGateStrategies = makeClosureGateStrategy([
      'technical_validation',
      'invalid_gate_name',
      'approval',
    ]);
    const config = extractClosureGateConfig(invalidGateStrategies);
    expect(config).not.toBeNull();
    expect(config!.gates).toHaveLength(2);
    expect(config!.gates).toContain('technical_validation');
    expect(config!.gates).toContain('approval');
    expect(config!.gates).not.toContain('invalid_gate_name');
  });
});

// ─── Gate Status Tracking Per Case ───────────────────────────────────────────

describe('evaluateClosureReadiness — gate status tracking per case', () => {
  it('tracks different case IDs independently', () => {
    const strategies = makeClosureGateStrategy(['technical_validation', 'approval']);

    const request1 = makeEvaluationRequest({ case_id: 'case-001' });
    const result1 = evaluateClosureReadiness(request1, strategies);

    const request2 = makeEvaluationRequest({ case_id: 'case-002' });
    const result2 = evaluateClosureReadiness(request2, strategies);

    expect(result1.closureGateState!.case_id).toBe('case-001');
    expect(result2.closureGateState!.case_id).toBe('case-002');
  });

  it('records evaluatedAt timestamp in gate state', () => {
    const strategies = makeClosureGateStrategy(['technical_validation']);
    const customTime = '2026-03-15T14:30:00.000Z';
    const request = makeEvaluationRequest({ currentTime: customTime });
    const result = evaluateClosureReadiness(request, strategies);

    expect(result.closureGateState!.evaluated_at).toBe(customTime);
    result.closureGateState!.gateResults.forEach((r) => {
      expect(r.evaluated_at).toBe(customTime);
    });
  });

  it('records all gate results including not_configured', () => {
    const strategies = makeClosureGateStrategy(['technical_validation']);
    const request = makeEvaluationRequest();
    const result = evaluateClosureReadiness(request, strategies);

    expect(result.closureGateState!.gateResults).toHaveLength(12);

    const configured = result.closureGateState!.gateResults.filter(
      (r) => r.status !== 'not_configured',
    );
    expect(configured).toHaveLength(1);
    expect(configured[0].gate).toBe('technical_validation');
    expect(configured[0].status).toBe('passed');
  });

  it('provides per-gate reason for audit trail', () => {
    const strategies = makeClosureGateStrategy([
      'technical_validation',
      'approval',
    ]);
    const input = makeAllPassingInput();
    input.approvalGranted = false;
    const request = makeEvaluationRequest({ gateInput: input });
    const result = evaluateClosureReadiness(request, strategies);

    const approvalResult = result.closureGateState!.gateResults.find(
      (r) => r.gate === 'approval',
    );
    expect(approvalResult).toBeDefined();
    expect(approvalResult!.status).toBe('failed');
    expect(approvalResult!.reason).toContain('not been granted');

    const techResult = result.closureGateState!.gateResults.find(
      (r) => r.gate === 'technical_validation',
    );
    expect(techResult).toBeDefined();
    expect(techResult!.status).toBe('passed');
    expect(techResult!.reason).toContain('passed');
  });
});
