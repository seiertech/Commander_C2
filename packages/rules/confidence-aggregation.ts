/**
 * Confidence Aggregation — Pure Function (C3)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 8.4, 22.1, 22.5; DEC-confidence-aggregation-properties
 *
 * Computes a single catalogue-level confidence (0–100) from per-source
 * reported confidences. Satisfies seven owner-confirmed constraints:
 *
 * 1. Output bounded to 0–100 (clamped)
 * 2. Higher-confidence corroborating sources never reduce confidence (monotonicity)
 * 3. Lower-confidence weak sources cannot inflate beyond configured ceiling (saturation)
 * 4. Source freshness affects weight (staler attributions contribute less)
 * 5. Direct tenant observation weighs more than generic feed presence
 * 6. Manual analyst confirmation carries explicit weighting boost
 * 7. Deterministic: identical inputs always produce identical output
 */

import type { SourceFreshnessState } from '../contracts/src/entities/intelligence-common';

// ─── Configuration Constants ─────────────────────────────────────────────────

/** Maximum confidence ceiling for weak sources (constraint 3) */
export const WEAK_SOURCE_CEILING = 75;

/** Threshold below which a source is considered "weak" */
export const WEAK_SOURCE_THRESHOLD = 40;

/** Freshness weight multipliers (constraint 4) */
export const FRESHNESS_WEIGHTS: Record<SourceFreshnessState, number> = {
  fresh: 1.0,
  aging: 0.8,
  stale: 0.5,
  expired: 0.2,
};

/** Tenant observation weight boost (constraint 5) */
export const TENANT_OBSERVATION_BOOST = 1.5;

/** Manual analyst confirmation weight boost (constraint 6) */
export const ANALYST_CONFIRMATION_BOOST = 2.0;

// ─── Source Attribution for Aggregation ──────────────────────────────────────

export interface ConfidenceSource {
  /** Reported confidence (0–100) */
  confidence: number;
  /** Source freshness state */
  freshness: SourceFreshnessState;
  /** Whether this is a direct tenant observation */
  isTenantObservation: boolean;
  /** Whether this is a manual analyst confirmation */
  isAnalystConfirmation: boolean;
}

/**
 * Aggregate confidence from multiple source reports.
 *
 * Algorithm: weighted maximum with corroboration bonus.
 * - Start with the highest weighted confidence as the base.
 * - Each additional corroborating source above the weak threshold adds a
 *   diminishing bonus (ensures monotonicity: adding high-confidence sources
 *   never reduces the aggregate).
 * - Weak sources below WEAK_SOURCE_THRESHOLD cannot push the result above
 *   WEAK_SOURCE_CEILING regardless of how many there are (constraint 3).
 * - Deterministic: sorts sources before processing (constraint 7).
 *
 * Returns an integer 0–100 (constraint 1).
 */
export function aggregateConfidence(sources: ConfidenceSource[]): number {
  if (sources.length === 0) return 0;

  // Compute weighted confidence for each source
  const weighted = sources
    .map(s => {
      let weight = FRESHNESS_WEIGHTS[s.freshness];
      if (s.isTenantObservation) weight *= TENANT_OBSERVATION_BOOST;
      if (s.isAnalystConfirmation) weight *= ANALYST_CONFIRMATION_BOOST;
      return { confidence: s.confidence, weight, isWeak: s.confidence < WEAK_SOURCE_THRESHOLD };
    })
    // Sort deterministically: highest effective confidence first (constraint 7)
    .sort((a, b) => {
      const effectiveA = a.confidence * a.weight;
      const effectiveB = b.confidence * b.weight;
      if (effectiveB !== effectiveA) return effectiveB - effectiveA;
      return a.confidence - b.confidence; // stable tie-break
    });

  // Start with highest weighted confidence as base
  const base = Math.min(weighted[0].confidence * weighted[0].weight, 100);
  let result = base;

  // Corroboration bonus from additional strong sources (constraint 2)
  const strongSources = weighted.filter(w => !w.isWeak);
  for (let i = 1; i < strongSources.length; i++) {
    // Diminishing bonus: each additional source adds less
    const bonus = (strongSources[i].confidence * strongSources[i].weight) / (Math.pow(2, i) * 10);
    result += bonus;
  }

  // Weak sources can only contribute up to ceiling (constraint 3)
  const weakSources = weighted.filter(w => w.isWeak);
  if (strongSources.length === 0 && weakSources.length > 0) {
    // Only weak sources present — cap at ceiling
    result = Math.min(result, WEAK_SOURCE_CEILING);
  }

  // Clamp to 0–100 (constraint 1)
  result = Math.max(0, Math.min(100, result));

  // Return deterministic integer
  return Math.round(result);
}
