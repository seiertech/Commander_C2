/**
 * Multi-Factor Routing Engine — Commander C2 CMEP-1.0
 *
 * Scored routing: specialism × w1 + workloadAvailability × w2 +
 * assetOwnership × w3 + rankWeighting × w4.
 *
 * Weights from routing strategy policy. Pure function.
 * Top scorer is selected. Escalation triggered if no analyst exceeds threshold.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** Routing weights from strategy policy */
export interface RoutingWeights {
  specialism: number;
  workloadAvailability: number;
  assetOwnership: number;
  rankWeighting: number;
}

/** Default routing weights */
export const DEFAULT_ROUTING_WEIGHTS: RoutingWeights = {
  specialism: 0.4,
  workloadAvailability: 0.25,
  assetOwnership: 0.2,
  rankWeighting: 0.15,
};

/** Analyst candidate for routing */
export interface RoutingCandidate {
  /** Analyst identifier */
  analystId: string;
  /** Specialism match score (0–100): does the analyst specialise in this case type? */
  specialismScore: number;
  /** Workload availability score (0–100): capacity remaining */
  workloadAvailabilityScore: number;
  /** Asset ownership score (0–100): does the analyst own the affected assets? */
  assetOwnershipScore: number;
  /** Rank weighting score (0–100): derived from analyst rank */
  rankWeightingScore: number;
}

/** Routing decision result */
export interface RoutingDecision {
  /** Selected analyst (null if escalation triggered) */
  selectedAnalystId: string | null;
  /** All candidates with computed scores (sorted descending) */
  scoredCandidates: ScoredCandidate[];
  /** Whether escalation was triggered */
  escalationTriggered: boolean;
  /** Reason for escalation (if triggered) */
  escalationReason: string | null;
}

/** Candidate with computed composite score */
export interface ScoredCandidate {
  analystId: string;
  compositeScore: number;
  breakdown: {
    specialism: number;
    workloadAvailability: number;
    assetOwnership: number;
    rankWeighting: number;
  };
}

// ─── Core Function ───────────────────────────────────────────────────────────

/**
 * Score and rank routing candidates, selecting the top scorer.
 *
 * @param candidates - Array of analyst routing candidates
 * @param weights - Routing weights from strategy policy
 * @param escalationThreshold - Minimum score to avoid escalation (0–100)
 * @returns RoutingDecision with selected analyst or escalation
 */
export function computeRoutingDecision(
  candidates: RoutingCandidate[],
  weights: RoutingWeights = DEFAULT_ROUTING_WEIGHTS,
  escalationThreshold: number = 30,
): RoutingDecision {
  if (candidates.length === 0) {
    return {
      selectedAnalystId: null,
      scoredCandidates: [],
      escalationTriggered: true,
      escalationReason: 'No candidates available for routing',
    };
  }

  const scoredCandidates: ScoredCandidate[] = candidates.map((candidate) => {
    const breakdown = {
      specialism: candidate.specialismScore * weights.specialism,
      workloadAvailability: candidate.workloadAvailabilityScore * weights.workloadAvailability,
      assetOwnership: candidate.assetOwnershipScore * weights.assetOwnership,
      rankWeighting: candidate.rankWeightingScore * weights.rankWeighting,
    };

    const compositeScore =
      breakdown.specialism +
      breakdown.workloadAvailability +
      breakdown.assetOwnership +
      breakdown.rankWeighting;

    return {
      analystId: candidate.analystId,
      compositeScore,
      breakdown,
    };
  });

  // Sort descending by composite score
  scoredCandidates.sort((a, b) => b.compositeScore - a.compositeScore);

  const topScorer = scoredCandidates[0];

  // Check escalation threshold
  if (topScorer.compositeScore < escalationThreshold) {
    return {
      selectedAnalystId: null,
      scoredCandidates,
      escalationTriggered: true,
      escalationReason: `Top scorer (${topScorer.analystId}) scored ${topScorer.compositeScore.toFixed(1)} below threshold ${escalationThreshold}`,
    };
  }

  return {
    selectedAnalystId: topScorer.analystId,
    scoredCandidates,
    escalationTriggered: false,
    escalationReason: null,
  };
}
