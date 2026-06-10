import { describe, it, expect } from 'vitest';
import {
  VALIDATION_STATES,
  VALIDATION_TRIGGER_TYPES,
  VALIDATION_TRANSITIONS,
  isValidationTransitionAllowed,
  getNextValidationStates,
  executeValidationTransition,
  checkEvidenceFreshness,
  checkWindowExpiry,
  shouldTriggerRevalidation,
  evaluateValidation,
} from '../../packages/contracts/src/engines/case-validation-engine';
import type {
  ValidationState,
  ValidationTriggerType,
  EvidenceRecord,
  CaseValidationState,
  ValidationEvaluationRequest,
} from '../../packages/contracts/src/engines/case-validation-engine';
import { seedStrategies } from '../../packages/contracts/src/fixtures/seed-strategies';
import type { StrategyPolicy } from '../../packages/contracts/src/entities/strategy';

/**
 * Unit 11: Case Validation Engine Tests
 *
 * Validates:
 * - All 11 validation states exist
 * - All allowed transitions succeed
 * - Disallowed transitions rejected
 * - Evidence freshness checking (fresh vs stale)
 * - Window expiry detection
 * - Revalidation trigger logic
 * - Full evaluateValidation flow with seed strategies
 * - Error handling when strategy is missing
 * - Proof that values come from strategy
 * - All 11 trigger types recognized
 */

// ─── Test Fixtures ───────────────────────────────────────────────────────────

const BASE_TIME = '2026-01-20T00:00:00.000Z';

function hoursAfter(base: string, hours: number): string {
  const d = new Date(base);
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return d.toISOString();
}

function makeEvidenceRecord(
  id: string,
  triggerType: ValidationTriggerType,
  receivedAt: string,
): EvidenceRecord {
  return {
    id,
    triggerType,
    receivedAt,
    fresh: true,
    sourceConnectorId: `connector-${id}`,
  };
}

function makeCaseValidationState(
  overrides: Partial<CaseValidationState> = {},
): CaseValidationState {
  return {
    caseId: 'case-test-001',
    currentState: 'not_started',
    enteredStateAt: BASE_TIME,
    evidenceRecords: [],
    windowExpiresAt: null,
    lastFreshnessCheck: null,
    revalidationRequired: false,
    ...overrides,
  };
}

function makeEvaluationRequest(
  overrides: Partial<ValidationEvaluationRequest> = {},
): ValidationEvaluationRequest {
  return {
    caseId: 'case-test-001',
    currentState: 'validation_running',
    enteredStateAt: BASE_TIME,
    evidenceRecords: [],
    currentTime: hoursAfter(BASE_TIME, 12),
    ...overrides,
  };
}

// ─── Validation States Tests ─────────────────────────────────────────────────

describe('VALIDATION_STATES — all 11 validation states exist', () => {
  it('contains exactly 11 states', () => {
    expect(VALIDATION_STATES).toHaveLength(11);
  });

  it('includes not_started', () => {
    expect(VALIDATION_STATES).toContain('not_started');
  });

  it('includes evidence_requested', () => {
    expect(VALIDATION_STATES).toContain('evidence_requested');
  });

  it('includes evidence_received', () => {
    expect(VALIDATION_STATES).toContain('evidence_received');
  });

  it('includes validation_running', () => {
    expect(VALIDATION_STATES).toContain('validation_running');
  });

  it('includes validated_fixed', () => {
    expect(VALIDATION_STATES).toContain('validated_fixed');
  });

  it('includes validated_compensated', () => {
    expect(VALIDATION_STATES).toContain('validated_compensated');
  });

  it('includes validated_not_fixed', () => {
    expect(VALIDATION_STATES).toContain('validated_not_fixed');
  });

  it('includes validation_inconclusive', () => {
    expect(VALIDATION_STATES).toContain('validation_inconclusive');
  });

  it('includes validation_blocked', () => {
    expect(VALIDATION_STATES).toContain('validation_blocked');
  });

  it('includes validation_expired', () => {
    expect(VALIDATION_STATES).toContain('validation_expired');
  });

  it('includes revalidation_required', () => {
    expect(VALIDATION_STATES).toContain('revalidation_required');
  });
});

// ─── Validation Trigger Types Tests ──────────────────────────────────────────

describe('VALIDATION_TRIGGER_TYPES — all 11 trigger types recognized', () => {
  it('contains exactly 11 trigger types', () => {
    expect(VALIDATION_TRIGGER_TYPES).toHaveLength(11);
  });

  const expectedTriggers: ValidationTriggerType[] = [
    'source_refresh',
    'connector_delta',
    'owner_evidence',
    'push_execution',
    'bas_result',
    'siem_soar_deployment',
    'control_state_change',
    'scanner_refresh',
    'identity_graph_change',
    'architecture_graph_change',
    'communication_evidence',
  ];

  expectedTriggers.forEach((trigger) => {
    it(`includes ${trigger}`, () => {
      expect(VALIDATION_TRIGGER_TYPES).toContain(trigger);
    });
  });
});

// ─── Allowed Transitions Tests ───────────────────────────────────────────────

describe('isValidationTransitionAllowed — allowed transitions succeed', () => {
  it('allows not_started → evidence_requested', () => {
    expect(isValidationTransitionAllowed('not_started', 'evidence_requested')).toBe(true);
  });

  it('allows evidence_requested → evidence_received', () => {
    expect(isValidationTransitionAllowed('evidence_requested', 'evidence_received')).toBe(true);
  });

  it('allows evidence_received → validation_running', () => {
    expect(isValidationTransitionAllowed('evidence_received', 'validation_running')).toBe(true);
  });

  it('allows validation_running → validated_fixed', () => {
    expect(isValidationTransitionAllowed('validation_running', 'validated_fixed')).toBe(true);
  });

  it('allows validation_running → validated_compensated', () => {
    expect(isValidationTransitionAllowed('validation_running', 'validated_compensated')).toBe(true);
  });

  it('allows validation_running → validated_not_fixed', () => {
    expect(isValidationTransitionAllowed('validation_running', 'validated_not_fixed')).toBe(true);
  });

  it('allows validation_running → validation_inconclusive', () => {
    expect(isValidationTransitionAllowed('validation_running', 'validation_inconclusive')).toBe(true);
  });

  it('allows validation_running → validation_blocked', () => {
    expect(isValidationTransitionAllowed('validation_running', 'validation_blocked')).toBe(true);
  });

  it('allows validation_running → validation_expired', () => {
    expect(isValidationTransitionAllowed('validation_running', 'validation_expired')).toBe(true);
  });

  it('allows validated_not_fixed → revalidation_required', () => {
    expect(isValidationTransitionAllowed('validated_not_fixed', 'revalidation_required')).toBe(true);
  });

  it('allows validation_inconclusive → revalidation_required', () => {
    expect(isValidationTransitionAllowed('validation_inconclusive', 'revalidation_required')).toBe(true);
  });

  it('allows validation_blocked → revalidation_required', () => {
    expect(isValidationTransitionAllowed('validation_blocked', 'revalidation_required')).toBe(true);
  });

  it('allows validation_expired → revalidation_required', () => {
    expect(isValidationTransitionAllowed('validation_expired', 'revalidation_required')).toBe(true);
  });

  it('allows revalidation_required → evidence_requested', () => {
    expect(isValidationTransitionAllowed('revalidation_required', 'evidence_requested')).toBe(true);
  });
});

// ─── Disallowed Transitions Tests ────────────────────────────────────────────

describe('isValidationTransitionAllowed — disallowed transitions rejected', () => {
  it('rejects not_started → validation_running (must go through evidence_requested)', () => {
    expect(isValidationTransitionAllowed('not_started', 'validation_running')).toBe(false);
  });

  it('rejects not_started → validated_fixed (cannot skip lifecycle)', () => {
    expect(isValidationTransitionAllowed('not_started', 'validated_fixed')).toBe(false);
  });

  it('rejects validated_fixed → not_started (terminal state cannot go back)', () => {
    expect(isValidationTransitionAllowed('validated_fixed', 'not_started')).toBe(false);
  });

  it('rejects validated_compensated → revalidation_required (success states do not revalidate)', () => {
    expect(isValidationTransitionAllowed('validated_compensated', 'revalidation_required')).toBe(false);
  });

  it('rejects evidence_received → validated_fixed (must go through validation_running)', () => {
    expect(isValidationTransitionAllowed('evidence_received', 'validated_fixed')).toBe(false);
  });

  it('rejects validation_running → not_started (cannot go backwards)', () => {
    expect(isValidationTransitionAllowed('validation_running', 'not_started')).toBe(false);
  });

  it('rejects revalidation_required → validated_fixed (must restart lifecycle)', () => {
    expect(isValidationTransitionAllowed('revalidation_required', 'validated_fixed')).toBe(false);
  });
});

// ─── getNextValidationStates Tests ───────────────────────────────────────────

describe('getNextValidationStates — reachable states from each state', () => {
  it('from not_started can reach evidence_requested', () => {
    const next = getNextValidationStates('not_started');
    expect(next).toContain('evidence_requested');
    expect(next).toHaveLength(1);
  });

  it('from evidence_requested can reach evidence_received', () => {
    const next = getNextValidationStates('evidence_requested');
    expect(next).toContain('evidence_received');
    expect(next).toHaveLength(1);
  });

  it('from evidence_received can reach validation_running', () => {
    const next = getNextValidationStates('evidence_received');
    expect(next).toContain('validation_running');
    expect(next).toHaveLength(1);
  });

  it('from validation_running can reach 6 outcome states', () => {
    const next = getNextValidationStates('validation_running');
    expect(next).toContain('validated_fixed');
    expect(next).toContain('validated_compensated');
    expect(next).toContain('validated_not_fixed');
    expect(next).toContain('validation_inconclusive');
    expect(next).toContain('validation_blocked');
    expect(next).toContain('validation_expired');
    expect(next).toHaveLength(6);
  });

  it('from validated_fixed has no next states (terminal)', () => {
    const next = getNextValidationStates('validated_fixed');
    expect(next).toHaveLength(0);
  });

  it('from validated_compensated has no next states (terminal)', () => {
    const next = getNextValidationStates('validated_compensated');
    expect(next).toHaveLength(0);
  });

  it('from revalidation_required can reach evidence_requested', () => {
    const next = getNextValidationStates('revalidation_required');
    expect(next).toContain('evidence_requested');
    expect(next).toHaveLength(1);
  });
});

// ─── executeValidationTransition Tests ───────────────────────────────────────

describe('executeValidationTransition — state machine execution', () => {
  it('succeeds for valid transition with correct trigger', () => {
    const state = makeCaseValidationState({ currentState: 'not_started' });
    const result = executeValidationTransition(state, 'evidence_requested', 'source_refresh');
    expect(result.success).toBe(true);
    expect(result.newState).not.toBeNull();
    expect(result.newState!.currentState).toBe('evidence_requested');
    expect(result.transition).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it('fails for invalid transition', () => {
    const state = makeCaseValidationState({ currentState: 'not_started' });
    const result = executeValidationTransition(state, 'validated_fixed', 'system');
    expect(result.success).toBe(false);
    expect(result.newState).toBeNull();
    expect(result.error).toContain('not allowed');
  });

  it('fails for valid transition with wrong trigger type', () => {
    const state = makeCaseValidationState({ currentState: 'evidence_received' });
    // evidence_received → validation_running requires 'system' trigger
    const result = executeValidationTransition(state, 'validation_running', 'source_refresh');
    expect(result.success).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('sets revalidationRequired flag when transitioning to revalidation_required', () => {
    const state = makeCaseValidationState({ currentState: 'validated_not_fixed' });
    const result = executeValidationTransition(state, 'revalidation_required', 'system');
    expect(result.success).toBe(true);
    expect(result.newState!.revalidationRequired).toBe(true);
  });

  it('preserves caseId and evidence records on transition', () => {
    const evidence = [makeEvidenceRecord('ev-1', 'source_refresh', BASE_TIME)];
    const state = makeCaseValidationState({
      currentState: 'not_started',
      caseId: 'case-xyz',
      evidenceRecords: evidence,
    });
    const result = executeValidationTransition(state, 'evidence_requested', 'connector_delta');
    expect(result.newState!.caseId).toBe('case-xyz');
    expect(result.newState!.evidenceRecords).toEqual(evidence);
  });

  it('allows all 11 trigger types for not_started → evidence_requested', () => {
    VALIDATION_TRIGGER_TYPES.forEach((trigger) => {
      const state = makeCaseValidationState({ currentState: 'not_started' });
      const result = executeValidationTransition(state, 'evidence_requested', trigger);
      expect(result.success).toBe(true);
    });
  });
});

// ─── Evidence Freshness Tests ────────────────────────────────────────────────

describe('checkEvidenceFreshness — fresh vs stale evidence', () => {
  it('marks all records fresh when within freshness window', () => {
    // Seed strategy: freshnessHours = 24
    const records = [
      makeEvidenceRecord('ev-1', 'source_refresh', hoursAfter(BASE_TIME, 10)),
      makeEvidenceRecord('ev-2', 'connector_delta', hoursAfter(BASE_TIME, 15)),
    ];
    const currentTime = hoursAfter(BASE_TIME, 20); // 10h and 5h old
    const result = checkEvidenceFreshness(records, 24, currentTime);
    expect(result.allFresh).toBe(true);
    expect(result.staleRecords).toHaveLength(0);
  });

  it('marks records stale when beyond freshness window', () => {
    const records = [
      makeEvidenceRecord('ev-1', 'source_refresh', BASE_TIME), // 30h old
      makeEvidenceRecord('ev-2', 'connector_delta', hoursAfter(BASE_TIME, 20)), // 10h old
    ];
    const currentTime = hoursAfter(BASE_TIME, 30);
    const result = checkEvidenceFreshness(records, 24, currentTime);
    expect(result.allFresh).toBe(false);
    expect(result.staleRecords).toHaveLength(1);
    expect(result.staleRecords[0].id).toBe('ev-1');
  });

  it('marks all records stale when all beyond freshness window', () => {
    const records = [
      makeEvidenceRecord('ev-1', 'source_refresh', BASE_TIME), // 50h old
      makeEvidenceRecord('ev-2', 'connector_delta', hoursAfter(BASE_TIME, 5)), // 45h old
    ];
    const currentTime = hoursAfter(BASE_TIME, 50);
    const result = checkEvidenceFreshness(records, 24, currentTime);
    expect(result.allFresh).toBe(false);
    expect(result.staleRecords).toHaveLength(2);
  });

  it('returns allFresh true for empty records', () => {
    const result = checkEvidenceFreshness([], 24, BASE_TIME);
    expect(result.allFresh).toBe(true);
    expect(result.staleRecords).toHaveLength(0);
  });

  it('exactly at freshness boundary is stale', () => {
    const records = [
      makeEvidenceRecord('ev-1', 'source_refresh', BASE_TIME), // exactly 24h old
    ];
    const currentTime = hoursAfter(BASE_TIME, 24);
    const result = checkEvidenceFreshness(records, 24, currentTime);
    expect(result.allFresh).toBe(false);
    expect(result.staleRecords).toHaveLength(1);
  });

  it('just before freshness boundary is fresh', () => {
    const records = [
      makeEvidenceRecord('ev-1', 'source_refresh', BASE_TIME), // 23.99h old
    ];
    const currentTime = hoursAfter(BASE_TIME, 23.99);
    const result = checkEvidenceFreshness(records, 24, currentTime);
    expect(result.allFresh).toBe(true);
    expect(result.staleRecords).toHaveLength(0);
  });
});

// ─── Window Expiry Tests ─────────────────────────────────────────────────────

describe('checkWindowExpiry — validation window expiry detection', () => {
  it('window not expired when within window hours', () => {
    // Seed strategy: windowHours = 72
    const result = checkWindowExpiry(BASE_TIME, 72, hoursAfter(BASE_TIME, 48));
    expect(result.expired).toBe(false);
    expect(result.hoursRemaining).toBeCloseTo(24, 5);
  });

  it('window expired when beyond window hours', () => {
    const result = checkWindowExpiry(BASE_TIME, 72, hoursAfter(BASE_TIME, 80));
    expect(result.expired).toBe(true);
    expect(result.hoursRemaining).toBe(0);
  });

  it('window expired exactly at boundary', () => {
    const result = checkWindowExpiry(BASE_TIME, 72, hoursAfter(BASE_TIME, 72));
    expect(result.expired).toBe(true);
    expect(result.hoursRemaining).toBe(0);
  });

  it('window not expired just before boundary', () => {
    const result = checkWindowExpiry(BASE_TIME, 72, hoursAfter(BASE_TIME, 71.99));
    expect(result.expired).toBe(false);
    expect(result.hoursRemaining).toBeCloseTo(0.01, 2);
  });

  it('full window remaining at start', () => {
    const result = checkWindowExpiry(BASE_TIME, 72, BASE_TIME);
    expect(result.expired).toBe(false);
    expect(result.hoursRemaining).toBeCloseTo(72, 5);
  });

  it('uses strategy-driven window hours (not hardcoded)', () => {
    // With 24h window
    const result24 = checkWindowExpiry(BASE_TIME, 24, hoursAfter(BASE_TIME, 25));
    expect(result24.expired).toBe(true);

    // With 168h window — same elapsed time is not expired
    const result168 = checkWindowExpiry(BASE_TIME, 168, hoursAfter(BASE_TIME, 25));
    expect(result168.expired).toBe(false);
    expect(result168.hoursRemaining).toBeCloseTo(143, 5);
  });
});

// ─── Revalidation Trigger Tests ──────────────────────────────────────────────

describe('shouldTriggerRevalidation — revalidation trigger logic', () => {
  it('returns true when in validated_not_fixed and evidence is stale', () => {
    const state = makeCaseValidationState({
      currentState: 'validated_not_fixed',
      enteredStateAt: BASE_TIME,
      evidenceRecords: [
        makeEvidenceRecord('ev-1', 'source_refresh', BASE_TIME), // 30h old
      ],
    });
    // freshnessHours = 24 from seed strategy, evidence is 30h old
    const result = shouldTriggerRevalidation(state, seedStrategies, hoursAfter(BASE_TIME, 30));
    expect(result).toBe(true);
  });

  it('returns true when in validation_expired and window exceeded', () => {
    const state = makeCaseValidationState({
      currentState: 'validation_expired',
      enteredStateAt: BASE_TIME,
    });
    // windowHours = 72 from seed strategy, 80h elapsed
    const result = shouldTriggerRevalidation(state, seedStrategies, hoursAfter(BASE_TIME, 80));
    expect(result).toBe(true);
  });

  it('returns true when in validation_inconclusive and evidence stale', () => {
    const state = makeCaseValidationState({
      currentState: 'validation_inconclusive',
      enteredStateAt: BASE_TIME,
      evidenceRecords: [
        makeEvidenceRecord('ev-1', 'bas_result', BASE_TIME),
      ],
    });
    const result = shouldTriggerRevalidation(state, seedStrategies, hoursAfter(BASE_TIME, 30));
    expect(result).toBe(true);
  });

  it('returns true when in validation_blocked and window exceeded', () => {
    const state = makeCaseValidationState({
      currentState: 'validation_blocked',
      enteredStateAt: BASE_TIME,
    });
    const result = shouldTriggerRevalidation(state, seedStrategies, hoursAfter(BASE_TIME, 80));
    expect(result).toBe(true);
  });

  it('returns false when in validated_fixed (terminal success state)', () => {
    const state = makeCaseValidationState({
      currentState: 'validated_fixed',
      enteredStateAt: BASE_TIME,
    });
    const result = shouldTriggerRevalidation(state, seedStrategies, hoursAfter(BASE_TIME, 100));
    expect(result).toBe(false);
  });

  it('returns false when in not_started', () => {
    const state = makeCaseValidationState({
      currentState: 'not_started',
      enteredStateAt: BASE_TIME,
    });
    const result = shouldTriggerRevalidation(state, seedStrategies, hoursAfter(BASE_TIME, 100));
    expect(result).toBe(false);
  });

  it('returns false when strategy is missing', () => {
    const state = makeCaseValidationState({
      currentState: 'validated_not_fixed',
      enteredStateAt: BASE_TIME,
    });
    const result = shouldTriggerRevalidation(state, [], hoursAfter(BASE_TIME, 100));
    expect(result).toBe(false);
  });

  it('returns false when evidence is still fresh', () => {
    const state = makeCaseValidationState({
      currentState: 'validated_not_fixed',
      enteredStateAt: BASE_TIME,
      evidenceRecords: [
        makeEvidenceRecord('ev-1', 'source_refresh', hoursAfter(BASE_TIME, 10)),
      ],
    });
    // Evidence is 2h old, freshness window is 24h, window is 72h (only 12h elapsed)
    const result = shouldTriggerRevalidation(state, seedStrategies, hoursAfter(BASE_TIME, 12));
    expect(result).toBe(false);
  });
});

// ─── Full evaluateValidation Flow Tests ──────────────────────────────────────

describe('evaluateValidation — full flow with seed strategies', () => {
  it('returns successful result with window state for validation_running within window', () => {
    const request = makeEvaluationRequest({
      currentState: 'validation_running',
      enteredStateAt: BASE_TIME,
      currentTime: hoursAfter(BASE_TIME, 12), // 12h into 72h window
    });
    const result = evaluateValidation(request, seedStrategies);

    expect(result.success).toBe(true);
    expect(result.windowState).not.toBeNull();
    expect(result.windowState!.withinWindow).toBe(true);
    expect(result.newState).toBeNull(); // No transition needed
    expect(result.transition).toBeNull();
    expect(result.error).toBeNull();
  });

  it('transitions validation_running → validation_expired when window exceeded', () => {
    const request = makeEvaluationRequest({
      currentState: 'validation_running',
      enteredStateAt: BASE_TIME,
      currentTime: hoursAfter(BASE_TIME, 80), // 80h > 72h window
    });
    const result = evaluateValidation(request, seedStrategies);

    expect(result.success).toBe(true);
    expect(result.newState).toBe('validation_expired');
    expect(result.transition).not.toBeNull();
    expect(result.transition!.from).toBe('validation_running');
    expect(result.transition!.to).toBe('validation_expired');
    expect(result.transition!.trigger).toBe('expiry');
    expect(result.revalidationRequired).toBe(true);
  });

  it('transitions validated_not_fixed → revalidation_required when evidence stale', () => {
    const request = makeEvaluationRequest({
      currentState: 'validated_not_fixed',
      enteredStateAt: BASE_TIME,
      evidenceRecords: [
        makeEvidenceRecord('ev-1', 'source_refresh', BASE_TIME), // 30h old
      ],
      currentTime: hoursAfter(BASE_TIME, 30), // evidence is 30h old > 24h freshness
    });
    const result = evaluateValidation(request, seedStrategies);

    expect(result.success).toBe(true);
    expect(result.newState).toBe('revalidation_required');
    expect(result.transition!.from).toBe('validated_not_fixed');
    expect(result.transition!.to).toBe('revalidation_required');
    expect(result.revalidationRequired).toBe(true);
  });

  it('no transition when validated_not_fixed and evidence still fresh', () => {
    const request = makeEvaluationRequest({
      currentState: 'validated_not_fixed',
      enteredStateAt: BASE_TIME,
      evidenceRecords: [
        makeEvidenceRecord('ev-1', 'source_refresh', hoursAfter(BASE_TIME, 8)), // 4h old
      ],
      currentTime: hoursAfter(BASE_TIME, 12),
    });
    const result = evaluateValidation(request, seedStrategies);

    expect(result.success).toBe(true);
    expect(result.newState).toBeNull();
    expect(result.transition).toBeNull();
    expect(result.revalidationRequired).toBe(false);
  });

  it('detects refresh due based on refreshCadenceHours from strategy', () => {
    // Seed strategy: refreshCadenceHours = 12
    const request = makeEvaluationRequest({
      currentState: 'validation_running',
      enteredStateAt: BASE_TIME,
      evidenceRecords: [
        makeEvidenceRecord('ev-1', 'source_refresh', BASE_TIME), // 15h old
      ],
      currentTime: hoursAfter(BASE_TIME, 15), // 15h since last evidence > 12h cadence
    });
    const result = evaluateValidation(request, seedStrategies);

    expect(result.success).toBe(true);
    expect(result.windowState!.refreshDue).toBe(true);
  });

  it('refresh not due when within cadence', () => {
    const request = makeEvaluationRequest({
      currentState: 'validation_running',
      enteredStateAt: BASE_TIME,
      evidenceRecords: [
        makeEvidenceRecord('ev-1', 'source_refresh', hoursAfter(BASE_TIME, 5)), // 5h old
      ],
      currentTime: hoursAfter(BASE_TIME, 10), // 5h since last evidence < 12h cadence
    });
    const result = evaluateValidation(request, seedStrategies);

    expect(result.success).toBe(true);
    expect(result.windowState!.refreshDue).toBe(false);
  });

  it('includes rationale in result', () => {
    const request = makeEvaluationRequest({
      currentState: 'validation_running',
      enteredStateAt: BASE_TIME,
      currentTime: hoursAfter(BASE_TIME, 12),
    });
    const result = evaluateValidation(request, seedStrategies);
    expect(result.rationale).toBeTruthy();
    expect(result.rationale.length).toBeGreaterThan(0);
  });
});

// ─── Error Handling Tests ────────────────────────────────────────────────────

describe('evaluateValidation — error handling when strategy is missing', () => {
  it('returns error when no strategies provided', () => {
    const request = makeEvaluationRequest();
    const result = evaluateValidation(request, []);

    expect(result.success).toBe(false);
    expect(result.newState).toBeNull();
    expect(result.windowState).toBeNull();
    expect(result.error).toContain('STRATEGY GAP');
  });

  it('returns error when validation-window strategy is missing', () => {
    const noValidationWindow = seedStrategies.filter(
      (s) => s.surfaceType !== 'validation-window',
    );
    const request = makeEvaluationRequest();
    const result = evaluateValidation(request, noValidationWindow);

    expect(result.success).toBe(false);
    expect(result.error).toContain('No active validation-window strategy');
  });

  it('returns error when validation-window strategy is inactive', () => {
    const inactiveStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surfaceType === 'validation-window') {
        return { ...s, status: 'superseded' as const };
      }
      return s;
    });
    const request = makeEvaluationRequest();
    const result = evaluateValidation(request, inactiveStrategies);

    expect(result.success).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
  });

  it('returns error when validation-window strategy has no windowHours', () => {
    const noWindowHours: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surfaceType === 'validation-window') {
        return { ...s, configuration: { freshnessHours: 24, refreshCadenceHours: 12 } };
      }
      return s;
    });
    const request = makeEvaluationRequest();
    const result = evaluateValidation(request, noWindowHours);

    expect(result.success).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
  });
});

// ─── Strategy-Driven Proof Tests ─────────────────────────────────────────────

describe('evaluateValidation — proof that values come from strategy', () => {
  it('changing windowHours changes expiry detection', () => {
    const request = makeEvaluationRequest({
      currentState: 'validation_running',
      enteredStateAt: BASE_TIME,
      currentTime: hoursAfter(BASE_TIME, 50), // 50h elapsed
    });

    // Seed strategy: windowHours=72 → 50h is within window
    const resultSeed = evaluateValidation(request, seedStrategies);
    expect(resultSeed.success).toBe(true);
    expect(resultSeed.windowState!.withinWindow).toBe(true);
    expect(resultSeed.newState).toBeNull();

    // Modified strategy: windowHours=48 → 50h exceeds window
    const modifiedStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surfaceType === 'validation-window') {
        return { ...s, configuration: { windowHours: 48, freshnessHours: 24, refreshCadenceHours: 12 } };
      }
      return s;
    });
    const resultModified = evaluateValidation(request, modifiedStrategies);
    expect(resultModified.success).toBe(true);
    expect(resultModified.windowState!.withinWindow).toBe(false);
    expect(resultModified.newState).toBe('validation_expired');
  });

  it('changing freshnessHours changes evidence freshness detection', () => {
    const request = makeEvaluationRequest({
      currentState: 'validated_not_fixed',
      enteredStateAt: BASE_TIME,
      evidenceRecords: [
        makeEvidenceRecord('ev-1', 'source_refresh', hoursAfter(BASE_TIME, 5)), // 15h old
      ],
      currentTime: hoursAfter(BASE_TIME, 20),
    });

    // Seed strategy: freshnessHours=24 → 15h old evidence is fresh
    const resultSeed = evaluateValidation(request, seedStrategies);
    expect(resultSeed.success).toBe(true);
    expect(resultSeed.windowState!.evidenceFresh).toBe(true);
    expect(resultSeed.newState).toBeNull();

    // Modified strategy: freshnessHours=12 → 15h old evidence is stale
    const modifiedStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surfaceType === 'validation-window') {
        return { ...s, configuration: { windowHours: 72, freshnessHours: 12, refreshCadenceHours: 12 } };
      }
      return s;
    });
    const resultModified = evaluateValidation(request, modifiedStrategies);
    expect(resultModified.success).toBe(true);
    expect(resultModified.windowState!.evidenceFresh).toBe(false);
    expect(resultModified.newState).toBe('revalidation_required');
  });

  it('changing refreshCadenceHours changes refresh due detection', () => {
    const request = makeEvaluationRequest({
      currentState: 'validation_running',
      enteredStateAt: BASE_TIME,
      evidenceRecords: [
        makeEvidenceRecord('ev-1', 'source_refresh', hoursAfter(BASE_TIME, 2)), // 8h old
      ],
      currentTime: hoursAfter(BASE_TIME, 10),
    });

    // Seed strategy: refreshCadenceHours=12 → 8h since evidence, not due
    const resultSeed = evaluateValidation(request, seedStrategies);
    expect(resultSeed.windowState!.refreshDue).toBe(false);

    // Modified strategy: refreshCadenceHours=6 → 8h since evidence, due
    const modifiedStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surfaceType === 'validation-window') {
        return { ...s, configuration: { windowHours: 72, freshnessHours: 24, refreshCadenceHours: 6 } };
      }
      return s;
    });
    const resultModified = evaluateValidation(request, modifiedStrategies);
    expect(resultModified.windowState!.refreshDue).toBe(true);
  });

  it('only active validation-window strategies are consumed', () => {
    const inactiveStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surfaceType === 'validation-window') {
        return { ...s, status: 'superseded' as const };
      }
      return s;
    });
    const request = makeEvaluationRequest();
    const result = evaluateValidation(request, inactiveStrategies);
    expect(result.success).toBe(false);
    expect(result.error).toContain('STRATEGY GAP');
  });
});
