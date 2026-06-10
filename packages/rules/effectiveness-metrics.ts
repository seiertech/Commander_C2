/**
 * Effectiveness Metrics Engine — Commander C2 CMEP-1.0
 *
 * Computes operational effectiveness metrics:
 * - MTTR (Mean Time To Resolve)
 * - SLA adherence rate
 * - Reopen rate
 * - Noise ratio
 * - Mean dwell time
 * - Routing accuracy
 *
 * Generates ooda-tempo-degradation case trigger when thresholds breached.
 * Targets from effectiveness-targets strategy.
 * Pure function. No I/O.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** Effectiveness targets from strategy */
export interface EffectivenessTargets {
  /** Target MTTR hours by priority */
  mttrTargetHours: Record<string, number>;
  /** SLA adherence rate target (percentage) */
  slaAdherenceTarget: number;
  /** Maximum acceptable reopen rate (percentage) */
  maxReopenRate: number;
  /** Maximum acceptable noise ratio (percentage) */
  maxNoiseRatio: number;
  /** Maximum mean dwell time hours */
  maxMeanDwellTimeHours: number;
  /** Routing accuracy target (percentage) */
  routingAccuracyTarget: number;
  /** OODA tempo degradation threshold */
  oodaDegradationThreshold: number;
}

/** Default effectiveness targets */
export const DEFAULT_EFFECTIVENESS_TARGETS: EffectivenessTargets = {
  mttrTargetHours: { P0: 4, P1: 24, P2: 72, P3: 168, P4: 336 },
  slaAdherenceTarget: 95,
  maxReopenRate: 10,
  maxNoiseRatio: 15,
  maxMeanDwellTimeHours: 48,
  routingAccuracyTarget: 90,
  oodaDegradationThreshold: 0.7,
};

/** Case resolution record for metric computation */
export interface CaseResolutionRecord {
  case_id: string;
  priority: string;
  /** Hours from case creation to closure */
  resolutionHours: number;
  /** Whether SLA was breached */
  slaBreached: boolean;
  /** Whether the case was reopened after closure */
  reopened: boolean;
  /** Whether the case was determined to be noise (false positive) */
  isNoise: boolean;
  /** Dwell time hours (detection to case creation) */
  dwellTimeHours: number;
  /** Whether the initial routing was correct */
  routingCorrect: boolean;
}

/** Computed effectiveness metrics */
export interface EffectivenessMetrics {
  /** Mean time to resolve (overall, in hours) */
  mttrHours: number;
  /** MTTR by priority level */
  mttrByPriority: Record<string, number>;
  /** SLA adherence rate (percentage 0–100) */
  slaAdherenceRate: number;
  /** Reopen rate (percentage 0–100) */
  reopenRate: number;
  /** Noise ratio (percentage 0–100) */
  noiseRatio: number;
  /** Mean dwell time (hours) */
  meanDwellTimeHours: number;
  /** Routing accuracy (percentage 0–100) */
  routingAccuracy: number;
  /** Total cases analysed */
  totalCases: number;
}

/** Threshold breach — a metric that exceeds its target */
export interface ThresholdBreach {
  metric: string;
  currentValue: number;
  targetValue: number;
  severity: 'warning' | 'critical';
}

/** Effectiveness evaluation result */
export interface EffectivenessResult {
  /** Computed metrics */
  metrics: EffectivenessMetrics;
  /** Breached thresholds */
  breaches: ThresholdBreach[];
  /** Whether OODA tempo degradation case should be triggered */
  oodaDegradationTrigger: boolean;
  /** Overall effectiveness score (0–1, lower = degraded) */
  overallScore: number;
}

// ─── Core Function ───────────────────────────────────────────────────────────

/**
 * Compute effectiveness metrics from case resolution records.
 *
 * @param records - Array of case resolution records
 * @param targets - Effectiveness targets from strategy
 * @returns EffectivenessResult with metrics, breaches, and OODA trigger
 */
export function computeEffectivenessMetrics(
  records: CaseResolutionRecord[],
  targets: EffectivenessTargets = DEFAULT_EFFECTIVENESS_TARGETS,
): EffectivenessResult {
  if (records.length === 0) {
    return {
      metrics: emptyMetrics(),
      breaches: [],
      oodaDegradationTrigger: false,
      overallScore: 1.0,
    };
  }

  const metrics = calculateMetrics(records);
  const breaches = detectBreaches(metrics, targets);
  const overallScore = calculateOverallScore(metrics, targets);
  const oodaDegradationTrigger = overallScore < targets.oodaDegradationThreshold;

  return {
    metrics,
    breaches,
    oodaDegradationTrigger,
    overallScore,
  };
}

// ─── Calculation Functions ───────────────────────────────────────────────────

function calculateMetrics(records: CaseResolutionRecord[]): EffectivenessMetrics {
  const totalCases = records.length;

  // MTTR overall
  const totalResolutionHours = records.reduce((sum, r) => sum + r.resolutionHours, 0);
  const mttrHours = totalResolutionHours / totalCases;

  // MTTR by priority
  const mttrByPriority: Record<string, number> = {};
  const priorityGroups = new Map<string, number[]>();
  for (const record of records) {
    const hours = priorityGroups.get(record.priority) ?? [];
    hours.push(record.resolutionHours);
    priorityGroups.set(record.priority, hours);
  }
  for (const [priority, hours] of priorityGroups) {
    mttrByPriority[priority] = hours.reduce((sum, h) => sum + h, 0) / hours.length;
  }

  // SLA adherence rate
  const slaCompliant = records.filter((r) => !r.slaBreached).length;
  const slaAdherenceRate = (slaCompliant / totalCases) * 100;

  // Reopen rate
  const reopened = records.filter((r) => r.reopened).length;
  const reopenRate = (reopened / totalCases) * 100;

  // Noise ratio
  const noisy = records.filter((r) => r.isNoise).length;
  const noiseRatio = (noisy / totalCases) * 100;

  // Mean dwell time
  const totalDwell = records.reduce((sum, r) => sum + r.dwellTimeHours, 0);
  const meanDwellTimeHours = totalDwell / totalCases;

  // Routing accuracy
  const correctlyRouted = records.filter((r) => r.routingCorrect).length;
  const routingAccuracy = (correctlyRouted / totalCases) * 100;

  return {
    mttrHours,
    mttrByPriority,
    slaAdherenceRate,
    reopenRate,
    noiseRatio,
    meanDwellTimeHours,
    routingAccuracy,
    totalCases,
  };
}

function detectBreaches(
  metrics: EffectivenessMetrics,
  targets: EffectivenessTargets,
): ThresholdBreach[] {
  const breaches: ThresholdBreach[] = [];

  // SLA adherence
  if (metrics.slaAdherenceRate < targets.slaAdherenceTarget) {
    breaches.push({
      metric: 'slaAdherenceRate',
      currentValue: metrics.slaAdherenceRate,
      targetValue: targets.slaAdherenceTarget,
      severity: metrics.slaAdherenceRate < targets.slaAdherenceTarget - 10 ? 'critical' : 'warning',
    });
  }

  // Reopen rate
  if (metrics.reopenRate > targets.maxReopenRate) {
    breaches.push({
      metric: 'reopenRate',
      currentValue: metrics.reopenRate,
      targetValue: targets.maxReopenRate,
      severity: metrics.reopenRate > targets.maxReopenRate * 2 ? 'critical' : 'warning',
    });
  }

  // Noise ratio
  if (metrics.noiseRatio > targets.maxNoiseRatio) {
    breaches.push({
      metric: 'noiseRatio',
      currentValue: metrics.noiseRatio,
      targetValue: targets.maxNoiseRatio,
      severity: metrics.noiseRatio > targets.maxNoiseRatio * 2 ? 'critical' : 'warning',
    });
  }

  // Mean dwell time
  if (metrics.meanDwellTimeHours > targets.maxMeanDwellTimeHours) {
    breaches.push({
      metric: 'meanDwellTimeHours',
      currentValue: metrics.meanDwellTimeHours,
      targetValue: targets.maxMeanDwellTimeHours,
      severity: metrics.meanDwellTimeHours > targets.maxMeanDwellTimeHours * 2 ? 'critical' : 'warning',
    });
  }

  // Routing accuracy
  if (metrics.routingAccuracy < targets.routingAccuracyTarget) {
    breaches.push({
      metric: 'routingAccuracy',
      currentValue: metrics.routingAccuracy,
      targetValue: targets.routingAccuracyTarget,
      severity: metrics.routingAccuracy < targets.routingAccuracyTarget - 15 ? 'critical' : 'warning',
    });
  }

  return breaches;
}

function calculateOverallScore(
  metrics: EffectivenessMetrics,
  targets: EffectivenessTargets,
): number {
  // Weighted score: each metric contributes equally
  const scores: number[] = [];

  // SLA adherence (higher = better)
  scores.push(Math.min(metrics.slaAdherenceRate / targets.slaAdherenceTarget, 1.0));

  // Reopen rate (lower = better)
  scores.push(metrics.reopenRate <= targets.maxReopenRate ? 1.0 : Math.max(0, 1 - (metrics.reopenRate - targets.maxReopenRate) / 50));

  // Noise ratio (lower = better)
  scores.push(metrics.noiseRatio <= targets.maxNoiseRatio ? 1.0 : Math.max(0, 1 - (metrics.noiseRatio - targets.maxNoiseRatio) / 50));

  // Mean dwell time (lower = better)
  scores.push(metrics.meanDwellTimeHours <= targets.maxMeanDwellTimeHours ? 1.0 : Math.max(0, 1 - (metrics.meanDwellTimeHours - targets.maxMeanDwellTimeHours) / 100));

  // Routing accuracy (higher = better)
  scores.push(Math.min(metrics.routingAccuracy / targets.routingAccuracyTarget, 1.0));

  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

function emptyMetrics(): EffectivenessMetrics {
  return {
    mttrHours: 0,
    mttrByPriority: {},
    slaAdherenceRate: 100,
    reopenRate: 0,
    noiseRatio: 0,
    meanDwellTimeHours: 0,
    routingAccuracy: 100,
    totalCases: 0,
  };
}
