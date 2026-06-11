import { describe, it, expect } from 'vitest';
import {
  OODA_PHASES,
  OODA_PHASE_LABELS,
  calculateObserveHealth,
  calculateOrientHealth,
  calculateDecideHealth,
  calculateActHealth,
  detectPhaseDegradation,
  createDegradationRiskObject,
  composeCommandTempo,
} from '../../packages/contracts/src/engines/ooda-layer';
import type {
  OodaPhase,
  ObservePhaseMetrics,
  OrientPhaseMetrics,
  DecidePhaseMetrics,
  ActPhaseMetrics,
  HealthThresholds,
  PhaseHealthScore,
  DegradationCaseRequest,
} from '../../packages/contracts/src/engines/ooda-layer';

/**
 * Unit 15: OODA Layer — Programme-Level OODA Tempo
 *
 * Source: Spec #58 Security OODA Loop (binding); Spec #67 OODA Phase Dashboards
 *
 * Validates:
 * 1. Four OODA phases are exactly four (continuous loop)
 * 2. Phase health metric calculation for each phase
 * 3. Phase degradation detection
 * 4. Degradation risk-object template creation
 * 5. Command Tempo dashboard model composition
 * 6. No hardcoded thresholds (all caller-supplied)
 */

const thresholds: HealthThresholds = { greenMin: 80, amberMin: 60 };

// ─── 1. Four OODA Phases ──────────────────────────────────────────────────────

describe('Unit 15 — OODA Phase Model', () => {
  it('enumerates exactly 4 phases', () => {
    expect(OODA_PHASES).toHaveLength(4);
  });

  it('phases are observe, orient, decide, act (canonical order)', () => {
    expect(OODA_PHASES).toEqual(['observe', 'orient', 'decide', 'act']);
  });

  it('each phase has a label', () => {
    for (const phase of OODA_PHASES) {
      expect(OODA_PHASE_LABELS[phase]).toBeTruthy();
    }
  });
});

// ─── 2a. Observe Phase Health (§3.1) ──────────────────────────────────────────

describe('Unit 15 — Observe Phase Health', () => {
  it('calculates 100 when all metrics perfect', () => {
    const r = calculateObserveHealth(
      { connectorHealthRatio: 1, signalFreshnessRatio: 1, coverageCompletenessRatio: 1 },
      thresholds,
    );
    expect(r.score).toBe(100);
    expect(r.band).toBe('green');
    expect(r.phase).toBe('observe');
  });

  it('calculates 0 when all metrics zero', () => {
    const r = calculateObserveHealth(
      { connectorHealthRatio: 0, signalFreshnessRatio: 0, coverageCompletenessRatio: 0 },
      thresholds,
    );
    expect(r.score).toBe(0);
    expect(r.band).toBe('red');
  });

  it('weights correctly (40/35/25)', () => {
    const r = calculateObserveHealth(
      { connectorHealthRatio: 1, signalFreshnessRatio: 0, coverageCompletenessRatio: 0 },
      thresholds,
    );
    expect(r.score).toBe(40);
  });

  it('assigns amber band at 60-79', () => {
    const r = calculateObserveHealth(
      { connectorHealthRatio: 0.8, signalFreshnessRatio: 0.6, coverageCompletenessRatio: 0.6 },
      thresholds,
    );
    expect(r.band).toBe('amber');
  });
});

// ─── 2b. Orient Phase Health (§3.2) ──────────────────────────────────────────

describe('Unit 15 — Orient Phase Health', () => {
  it('calculates 100 when all metrics perfect', () => {
    const r = calculateOrientHealth(
      { streamHealthRatio: 1, correlationCompletenessRatio: 1, avgThreatRelevance: 100 },
      thresholds,
    );
    expect(r.score).toBe(100);
    expect(r.phase).toBe('orient');
  });

  it('threat relevance at 50/100 contributes 12.5 to score', () => {
    const r = calculateOrientHealth(
      { streamHealthRatio: 0, correlationCompletenessRatio: 0, avgThreatRelevance: 50 },
      thresholds,
    );
    expect(r.score).toBe(13); // round(12.5)
  });
});

// ─── 2c. Decide Phase Health (§3.3) ──────────────────────────────────────────

describe('Unit 15 — Decide Phase Health', () => {
  it('calculates 100 when all metrics perfect', () => {
    const r = calculateDecideHealth(
      { routingHealthRatio: 1, prioritisationAccuracyRatio: 1, strategyEffectivenessRatio: 1 },
      thresholds,
    );
    expect(r.score).toBe(100);
    expect(r.phase).toBe('decide');
  });

  it('weights correctly (35/35/30)', () => {
    const r = calculateDecideHealth(
      { routingHealthRatio: 1, prioritisationAccuracyRatio: 0, strategyEffectivenessRatio: 0 },
      thresholds,
    );
    expect(r.score).toBe(35);
  });
});

// ─── 2d. Act Phase Health (§3.4) ─────────────────────────────────────────────

describe('Unit 15 — Act Phase Health', () => {
  it('calculates 100 when all metrics meet or exceed targets', () => {
    const r = calculateActHealth(
      {
        executionThroughput: 10,
        targetThroughput: 10,
        executionLatencyHours: 2,
        targetLatencyHours: 4,
        successRateRatio: 1,
        validationPendingCount: 0,
        failedActionCount: 0,
        closureTempoHours: 1,
        targetClosureTempoHours: 2,
      },
      thresholds,
    );
    expect(r.score).toBe(100);
    expect(r.phase).toBe('act');
  });

  it('latency exceeding target degrades score', () => {
    const r = calculateActHealth(
      {
        executionThroughput: 10,
        targetThroughput: 10,
        executionLatencyHours: 8,
        targetLatencyHours: 4,
        successRateRatio: 1,
        validationPendingCount: 0,
        failedActionCount: 0,
        closureTempoHours: 2,
        targetClosureTempoHours: 2,
      },
      thresholds,
    );
    expect(r.score).toBeLessThan(100);
  });

  it('handles zero targets gracefully (ratio defaults to 1)', () => {
    const r = calculateActHealth(
      {
        executionThroughput: 5,
        targetThroughput: 0,
        executionLatencyHours: 2,
        targetLatencyHours: 0,
        successRateRatio: 1,
        validationPendingCount: 0,
        failedActionCount: 0,
        closureTempoHours: 1,
        targetClosureTempoHours: 0,
      },
      thresholds,
    );
    expect(r.score).toBe(100);
  });
});

// ─── 3. Phase Degradation Detection ──────────────────────────────────────────

describe('Unit 15 — Phase Degradation Detection', () => {
  it('flags degradation when score below threshold', () => {
    const health: PhaseHealthScore = { phase: 'observe', label: 'Observe', score: 50, band: 'red' };
    const r = detectPhaseDegradation(health, 60);
    expect(r.degraded).toBe(true);
    expect(r.rationale).toContain('below');
  });

  it('no degradation when score at threshold', () => {
    const health: PhaseHealthScore = { phase: 'orient', label: 'Orient', score: 60, band: 'amber' };
    const r = detectPhaseDegradation(health, 60);
    expect(r.degraded).toBe(false);
  });

  it('no degradation when score above threshold', () => {
    const health: PhaseHealthScore = { phase: 'decide', label: 'Decide', score: 90, band: 'green' };
    const r = detectPhaseDegradation(health, 60);
    expect(r.degraded).toBe(false);
  });

  it('threshold is caller-supplied (no hardcoded value)', () => {
    const health: PhaseHealthScore = { phase: 'act', label: 'Act', score: 70, band: 'amber' };
    expect(detectPhaseDegradation(health, 60).degraded).toBe(false);
    expect(detectPhaseDegradation(health, 80).degraded).toBe(true);
  });
});

// ─── 4. Degradation Risk Object Creation ─────────────────────────────────────

describe('Unit 15 — Degradation Risk Object Template', () => {
  const request: DegradationCaseRequest = {
    phase: 'observe',
    healthScore: 45,
    degradationThreshold: 60,
    affected_entity_id: 'programme-001',
    owner: 'Security Operations Manager',
    tenant_id: 'tenant-001',
  };

  it('creates ooda_phase_degradation type', () => {
    const r = createDegradationRiskObject(request);
    expect(r.type).toBe('ooda_phase_degradation');
  });

  it('sets treatment state to open', () => {
    const r = createDegradationRiskObject(request);
    expect(r.treatment_state).toBe('open');
  });

  it('justification includes phase name and score', () => {
    const r = createDegradationRiskObject(request);
    expect(r.justification).toContain('Observe');
    expect(r.justification).toContain('45');
    expect(r.justification).toContain('60');
  });

  it('expiry trigger references the phase and threshold', () => {
    const r = createDegradationRiskObject(request);
    expect(r.expiry_or_review_trigger).toContain('Observe');
    expect(r.expiry_or_review_trigger).toContain('60');
  });

  it('affected entity type is programme', () => {
    const r = createDegradationRiskObject(request);
    expect(r.affected_entity_type).toBe('programme');
  });
});

// ─── 5. Command Tempo Dashboard ──────────────────────────────────────────────

describe('Unit 15 — Command Tempo Dashboard', () => {
  const phases: PhaseHealthScore[] = [
    { phase: 'observe', label: 'Observe', score: 90, band: 'green' },
    { phase: 'orient', label: 'Orient', score: 85, band: 'green' },
    { phase: 'decide', label: 'Decide', score: 70, band: 'amber' },
    { phase: 'act', label: 'Act', score: 55, band: 'red' },
  ];

  it('always emits all 4 phases in canonical order', () => {
    const r = composeCommandTempo(phases, thresholds, 60, '2026-01-18T08:00:00.000Z');
    expect(r.phases).toHaveLength(4);
    expect(r.phases.map((p) => p.phase)).toEqual(['observe', 'orient', 'decide', 'act']);
  });

  it('calculates overall score as average of phase scores', () => {
    const r = composeCommandTempo(phases, thresholds, 60, '2026-01-18T08:00:00.000Z');
    expect(r.overallScore).toBe(75); // (90+85+70+55)/4 = 75
  });

  it('identifies degraded phases', () => {
    const r = composeCommandTempo(phases, thresholds, 60, '2026-01-18T08:00:00.000Z');
    expect(r.degradedPhases).toEqual(['act']);
  });

  it('applies band to overall score', () => {
    const r = composeCommandTempo(phases, thresholds, 60, '2026-01-18T08:00:00.000Z');
    expect(r.overallBand).toBe('amber'); // 75 is amber (60-79)
  });

  it('records snapshot timestamp', () => {
    const r = composeCommandTempo(phases, thresholds, 60, '2026-01-18T08:00:00.000Z');
    expect(r.snapshot_at).toBe('2026-01-18T08:00:00.000Z');
  });

  it('handles missing phases defensively (fills with score 0/red)', () => {
    const partial: PhaseHealthScore[] = [
      { phase: 'observe', label: 'Observe', score: 80, band: 'green' },
    ];
    const r = composeCommandTempo(partial, thresholds, 60, '2026-01-18T08:00:00.000Z');
    expect(r.phases).toHaveLength(4);
    expect(r.phases.find((p) => p.phase === 'orient')?.score).toBe(0);
  });

  it('no degraded phases when all healthy', () => {
    const allGreen: PhaseHealthScore[] = OODA_PHASES.map((p) => ({
      phase: p,
      label: OODA_PHASE_LABELS[p],
      score: 95,
      band: 'green' as const,
    }));
    const r = composeCommandTempo(allGreen, thresholds, 60, '2026-01-18T08:00:00.000Z');
    expect(r.degradedPhases).toEqual([]);
    expect(r.overallBand).toBe('green');
  });
});
