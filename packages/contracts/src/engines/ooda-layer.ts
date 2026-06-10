/**
 * OODA Layer — Commander SDR Programme-Level OODA Tempo (Unit 15)
 *
 * Source: Spec #58 Security OODA Loop (binding)
 * Also: Spec #67 OODA Phase Dashboards
 *
 * The OODA Layer runs continuous programme-level OODA loops at the security
 * programme level. It sits above the Intelligence Layer (Unit 14) and consumes
 * both the Estate Intelligence Picture and Case Layer state.
 *
 * Unit 15 Deliverables:
 * 1. Four OODA phases with health metrics (Observe, Orient, Decide, Act)
 * 2. Phase health aggregate scores (0-100)
 * 3. Phase degradation detection (health below threshold)
 * 4. Phase degradation case creation (ooda_phase_degradation risk object)
 * 5. Command Tempo Dashboard model (cross-phase operational tempo)
 *
 * Doctrinal Assertions:
 * - Spec #58: OODA phases must preserve source evidence, operating context,
 *   decision constraints and validation feedback.
 * - Spec #58: Commander must NOT flatten OODA into a static dashboard.
 * - The four phases are continuous loops, not sequential waterfall steps.
 *
 * Architecture: pure functions; no side effects; no hardcoded thresholds
 * (sensitivity parameters caller-supplied from Strategy Layer policies).
 */

import type { EstateIntelligencePicture } from './intelligence-layer';

// ─── OODA Phase Model (Spec #58 §3) ──────────────────────────────────────────

/** The four OODA phases. Always four — continuous loop, not sequential. */
export type OodaPhase = 'observe' | 'orient' | 'decide' | 'act';

/** Canonical phase ordering for iteration. */
export const OODA_PHASES: OodaPhase[] = ['observe', 'orient', 'decide', 'act'];

/** Human-readable phase labels (Spec #58 §3 headings). */
export const OODA_PHASE_LABELS: Record<OodaPhase, string> = {
  observe: 'Observe',
  orient: 'Orient',
  decide: 'Decide',
  act: 'Act',
};

// ─── Phase Health Metrics (Spec #58 §3.1–§3.4) ───────────────────────────────

/** Observe phase health inputs (§3.1). */
export interface ObservePhaseMetrics {
  /** Fraction of connectors in active state (0-1). */
  connectorHealthRatio: number;
  /** Fraction of signals received within freshness window (0-1). */
  signalFreshnessRatio: number;
  /** Fraction of estate entities with at least one active signal source (0-1). */
  coverageCompletenessRatio: number;
}

/** Orient phase health inputs (§3.2). */
export interface OrientPhaseMetrics {
  /** Fraction of intelligence streams producing output (0-1). */
  streamHealthRatio: number;
  /** Fraction of cross-stream correlations completing within window (0-1). */
  correlationCompletenessRatio: number;
  /** Average threat relevance score across scored threats (0-100). */
  avgThreatRelevance: number;
}

/** Decide phase health inputs (§3.3). */
export interface DecidePhaseMetrics {
  /** Fraction of cases routed within SLA (0-1). */
  routingHealthRatio: number;
  /** Fraction of cases where prioritisation matched outcome (0-1). */
  prioritisationAccuracyRatio: number;
  /** Fraction of strategy policies currently active vs expired (0-1). */
  strategyEffectivenessRatio: number;
}

/** Act phase health inputs (§3.4). */
export interface ActPhaseMetrics {
  /** Actions completed per hour (throughput). */
  executionThroughput: number;
  /** Target throughput for comparison (from strategy). */
  targetThroughput: number;
  /** Average hours from action assignment to completion. */
  executionLatencyHours: number;
  /** Target latency hours (from strategy). */
  targetLatencyHours: number;
  /** Fraction of actions succeeding on first attempt (0-1). */
  successRateRatio: number;
  /** Count of actions pending validation. */
  validationPendingCount: number;
  /** Count of failed actions not yet re-attempted. */
  failedActionCount: number;
  /** Average hours from validated_pass to closed_by_system (0+). */
  closureTempoHours: number;
  /** Target closure tempo hours (from strategy). */
  targetClosureTempoHours: number;
}

// ─── Phase Health Score Calculation ───────────────────────────────────────────

/** Health score result for a single OODA phase (0-100 with band). */
export interface PhaseHealthScore {
  phase: OodaPhase;
  label: string;
  /** Aggregate health score (0-100). */
  score: number;
  /** Band derived from score. */
  band: 'green' | 'amber' | 'red';
}

/** Band thresholds (caller-supplied from strategy — no hardcoded defaults). */
export interface HealthThresholds {
  /** Score at or above which band is green. */
  greenMin: number;
  /** Score at or above which band is amber (below greenMin). */
  amberMin: number;
  /** Below amberMin → red. */
}

function toBand(score: number, thresholds: HealthThresholds): 'green' | 'amber' | 'red' {
  if (score >= thresholds.greenMin) return 'green';
  if (score >= thresholds.amberMin) return 'amber';
  return 'red';
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Calculate Observe phase health (§3.1).
 * Weighted: connector health 40%, signal freshness 35%, coverage 25%.
 */
export function calculateObserveHealth(
  metrics: ObservePhaseMetrics,
  thresholds: HealthThresholds,
): PhaseHealthScore {
  const score = clamp(
    metrics.connectorHealthRatio * 40 +
    metrics.signalFreshnessRatio * 35 +
    metrics.coverageCompletenessRatio * 25,
  );
  return { phase: 'observe', label: OODA_PHASE_LABELS.observe, score, band: toBand(score, thresholds) };
}

/**
 * Calculate Orient phase health (§3.2).
 * Weighted: stream health 40%, correlation completeness 35%, threat relevance 25%.
 */
export function calculateOrientHealth(
  metrics: OrientPhaseMetrics,
  thresholds: HealthThresholds,
): PhaseHealthScore {
  const score = clamp(
    metrics.streamHealthRatio * 40 +
    metrics.correlationCompletenessRatio * 35 +
    (metrics.avgThreatRelevance / 100) * 25,
  );
  return { phase: 'orient', label: OODA_PHASE_LABELS.orient, score, band: toBand(score, thresholds) };
}

/**
 * Calculate Decide phase health (§3.3).
 * Weighted: routing health 35%, prioritisation accuracy 35%, strategy effectiveness 30%.
 */
export function calculateDecideHealth(
  metrics: DecidePhaseMetrics,
  thresholds: HealthThresholds,
): PhaseHealthScore {
  const score = clamp(
    metrics.routingHealthRatio * 35 +
    metrics.prioritisationAccuracyRatio * 35 +
    metrics.strategyEffectivenessRatio * 30,
  );
  return { phase: 'decide', label: OODA_PHASE_LABELS.decide, score, band: toBand(score, thresholds) };
}

/**
 * Calculate Act phase health (§3.4).
 * Components: throughput ratio, latency ratio, success rate, closure tempo ratio.
 * Each 25% weight.
 */
export function calculateActHealth(
  metrics: ActPhaseMetrics,
  thresholds: HealthThresholds,
): PhaseHealthScore {
  const throughputRatio = metrics.targetThroughput > 0
    ? Math.min(1, metrics.executionThroughput / metrics.targetThroughput)
    : 1;
  const latencyRatio = metrics.targetLatencyHours > 0
    ? Math.min(1, metrics.targetLatencyHours / Math.max(0.01, metrics.executionLatencyHours))
    : 1;
  const closureRatio = metrics.targetClosureTempoHours > 0
    ? Math.min(1, metrics.targetClosureTempoHours / Math.max(0.01, metrics.closureTempoHours))
    : 1;

  const score = clamp(
    throughputRatio * 25 +
    latencyRatio * 25 +
    metrics.successRateRatio * 25 +
    closureRatio * 25,
  );
  return { phase: 'act', label: OODA_PHASE_LABELS.act, score, band: toBand(score, thresholds) };
}

// ─── Phase Degradation Detection (Spec #58 §4) ───────────────────────────────

/** Degradation detection result for a single phase. */
export interface PhaseDegradation {
  phase: OodaPhase;
  degraded: boolean;
  healthScore: number;
  /** The threshold below which the phase is considered degraded. */
  degradationThreshold: number;
  rationale: string;
}

/**
 * Detect whether a phase is degraded (health below threshold).
 * The threshold is caller-supplied (from Strategy Layer policy — no hardcoded value).
 */
export function detectPhaseDegradation(
  healthScore: PhaseHealthScore,
  degradationThreshold: number,
): PhaseDegradation {
  const degraded = healthScore.score < degradationThreshold;
  return {
    phase: healthScore.phase,
    degraded,
    healthScore: healthScore.score,
    degradationThreshold,
    rationale: degraded
      ? `${healthScore.label} phase health (${healthScore.score}) below degradation threshold (${degradationThreshold}). Phase degraded.`
      : `${healthScore.label} phase health (${healthScore.score}) at or above degradation threshold (${degradationThreshold}). Phase healthy.`,
  };
}

// ─── Phase Degradation Case Creation (Spec #58 §5) ───────────────────────────

/** Request to create an ooda_phase_degradation risk object. */
export interface DegradationCaseRequest {
  phase: OodaPhase;
  healthScore: number;
  degradationThreshold: number;
  affectedEntityId: string;
  owner: string;
  tenantId: string;
}

/** The risk-object-shaped output for case creation (matches RiskObjectType 'ooda_phase_degradation'). */
export interface DegradationRiskObjectTemplate {
  type: 'ooda_phase_degradation';
  affectedEntityId: string;
  affectedEntityType: 'case' | 'programme';
  justification: string;
  owner: string;
  treatmentState: 'open';
  expiryOrReviewTrigger: string;
}

/**
 * Produce an ooda_phase_degradation risk object template when a phase degrades.
 * The caller is responsible for persisting and binding it via the Case Layer.
 * This function only shapes the template — pure, no side effects.
 */
export function createDegradationRiskObject(
  request: DegradationCaseRequest,
): DegradationRiskObjectTemplate {
  return {
    type: 'ooda_phase_degradation',
    affectedEntityId: request.affectedEntityId,
    affectedEntityType: 'programme',
    justification: `OODA ${OODA_PHASE_LABELS[request.phase]} phase health degraded to ${request.healthScore} (threshold: ${request.degradationThreshold}). Phase requires remediation.`,
    owner: request.owner,
    treatmentState: 'open',
    expiryOrReviewTrigger: `Review when ${OODA_PHASE_LABELS[request.phase]} phase health returns above ${request.degradationThreshold} threshold.`,
  };
}

// ─── Command Tempo Dashboard Model (Spec #67) ────────────────────────────────

/** Cross-phase operational tempo snapshot. */
export interface CommandTempo {
  /** Per-phase health scores (always all four, canonical order). */
  phases: PhaseHealthScore[];
  /** Overall programme tempo score (average of phase scores). */
  overallScore: number;
  /** Overall band. */
  overallBand: 'green' | 'amber' | 'red';
  /** Phases currently degraded. */
  degradedPhases: OodaPhase[];
  /** Snapshot timestamp. */
  snapshotAt: string;
}

/**
 * Compose the Command Tempo dashboard model from individual phase health scores.
 * Always emits all four phases in canonical order (never partial — the tempo view
 * must reflect the full loop per Spec #58 doctrine).
 */
export function composeCommandTempo(
  phases: PhaseHealthScore[],
  thresholds: HealthThresholds,
  degradationThreshold: number,
  snapshotAt: string,
): CommandTempo {
  // Ensure all 4 phases present (defensive — caller should provide all 4)
  const ordered = OODA_PHASES.map(
    (p) => phases.find((ph) => ph.phase === p) ?? { phase: p, label: OODA_PHASE_LABELS[p], score: 0, band: 'red' as const },
  );

  const overallScore = clamp(ordered.reduce((sum, p) => sum + p.score, 0) / 4);
  const overallBand = toBand(overallScore, thresholds);
  const degradedPhases = ordered.filter((p) => p.score < degradationThreshold).map((p) => p.phase);

  return {
    phases: ordered,
    overallScore,
    overallBand,
    degradedPhases,
    snapshotAt,
  };
}
