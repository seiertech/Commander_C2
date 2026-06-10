/**
 * Priority Reassessment Engine — Commander C2 CMEP-1.0
 *
 * Periodic reassessment actor logic: re-evaluates priority weights,
 * triggers reprioritisation if computed priority differs from current.
 *
 * Uses the existing `in_progress → prioritised` transition with
 * `prioritisation-engine` as the permitted actor.
 *
 * Cadence from operational-tempo strategy.
 * Pure function. No I/O.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** Priority level (matches Case.priority) */
export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

/** Priority thresholds from threshold strategy */
export interface PriorityThresholds {
  p0: number;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
}

/** Default priority thresholds */
export const DEFAULT_PRIORITY_THRESHOLDS: PriorityThresholds = {
  p0: 95,
  p1: 80,
  p2: 60,
  p3: 40,
  p4: 0,
};

/** Input for priority reassessment */
export interface ReassessmentInput {
  /** Case identifier */
  case_id: string;
  /** Current case priority */
  currentPriority: PriorityLevel;
  /** Current composite priority score */
  currentScore: number;
  /** Newly computed composite priority score */
  newScore: number;
  /** Priority thresholds from threshold strategy */
  thresholds: PriorityThresholds;
}

/** Result of priority reassessment */
export interface ReassessmentResult {
  /** Whether reprioritisation is needed */
  reprioritisationNeeded: boolean;
  /** Current priority */
  currentPriority: PriorityLevel;
  /** Computed new priority (may be same as current) */
  computedPriority: PriorityLevel;
  /** Score delta (new - current) */
  scoreDelta: number;
  /** Rationale for the decision */
  rationale: string;
}

// ─── Core Function ───────────────────────────────────────────────────────────

/**
 * Evaluate whether a case needs reprioritisation based on new signal data.
 *
 * @param input - Reassessment input with current and new scores
 * @returns ReassessmentResult indicating whether transition is needed
 */
export function evaluateReassessment(input: ReassessmentInput): ReassessmentResult {
  const computedPriority = scoreToPriority(input.newScore, input.thresholds);
  const scoreDelta = input.newScore - input.currentScore;
  const reprioritisationNeeded = computedPriority !== input.currentPriority;

  let rationale: string;
  if (reprioritisationNeeded) {
    rationale = `Priority change detected: ${input.currentPriority} → ${computedPriority} (score ${input.currentScore} → ${input.newScore}, delta ${scoreDelta >= 0 ? '+' : ''}${scoreDelta})`;
  } else {
    rationale = `No priority change: remains ${input.currentPriority} (score ${input.currentScore} → ${input.newScore}, delta ${scoreDelta >= 0 ? '+' : ''}${scoreDelta})`;
  }

  return {
    reprioritisationNeeded,
    currentPriority: input.currentPriority,
    computedPriority,
    scoreDelta,
    rationale,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert a composite score to a priority level using thresholds.
 */
export function scoreToPriority(score: number, thresholds: PriorityThresholds): PriorityLevel {
  if (score >= thresholds.p0) return 'P0';
  if (score >= thresholds.p1) return 'P1';
  if (score >= thresholds.p2) return 'P2';
  if (score >= thresholds.p3) return 'P3';
  return 'P4';
}
