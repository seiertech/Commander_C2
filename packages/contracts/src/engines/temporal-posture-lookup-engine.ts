/**
 * Temporal Posture Lookup Engine — Commander C2 (Spec 39)
 *
 * Source: Spec #39 Pre-Warned/Protected/Novel Classification
 *         DEC-spec39-dual-model
 *
 * Provides point-in-time posture lookup to determine an entity's classification
 * state at case-open time or any historical moment. Evaluates PRE_WARNED,
 * PROTECTED, NOVEL conditions and handles inverse-discovery pauses.
 *
 * Pure functions — no I/O.
 *
 * Domain: D-13 (Pre-Warned Classification)
 * Use Cases: UC-186 (classify), UC-187 (historical lookup), UC-190 (inverse pause)
 */

import type { PostureSnapshot, AttackClassification } from '../entities/attack-classification-audit';
import type { InverseDiscoveryEvent } from '../entities/inverse-discovery-event';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PostureRecord {
  entity_ref: string;
  snapshot_at: string;
  snapshot: PostureSnapshot;
}

export interface PauseResult {
  paused: boolean;
  reason: string;
  inverseEventRef: string;
}

export interface PriorityAdjustment {
  classification: AttackClassification;
  adjustment: number;
  reason: string;
}

export interface ClassificationUpdate {
  entity_ref: string;
  previousClassification: AttackClassification | null;
  newClassification: AttackClassification;
  reason: string;
  inversePaused: boolean;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Look up the posture snapshot closest to (but not after) a given timestamp.
 */
export function lookupPostureAtTime(entity_ref: string, timestamp: string, records: PostureRecord[]): PostureSnapshot | null {
  const ts = new Date(timestamp).getTime();
  const matching = records
    .filter((r) => r.entity_ref === entityRef && new Date(r.snapshot_at).getTime() <= ts)
    .sort((a, b) => new Date(b.snapshot_at).getTime() - new Date(a.snapshot_at).getTime());

  return matching[0]?.snapshot ?? null;
}

/**
 * Evaluate whether a snapshot indicates PRE_WARNED (known weaknesses, partial coverage).
 */
export function evaluatePreWarned(snapshot: PostureSnapshot): boolean {
  return (
    snapshot.drift_state === 'drifted' ||
    snapshot.openRiskObjects > 0 ||
    snapshot.control_adherence < 70
  );
}

/**
 * Evaluate whether a snapshot indicates PROTECTED (no drift, full coverage, strong adherence).
 */
export function evaluateProtected(snapshot: PostureSnapshot): boolean {
  return (
    snapshot.drift_state === 'compliant' &&
    snapshot.coverage_percent >= 80 &&
    snapshot.control_adherence >= 80 &&
    snapshot.openRiskObjects === 0
  );
}

/**
 * Evaluate whether a snapshot indicates NOVEL (unknown estate, no posture data).
 */
export function evaluateNovel(snapshot: PostureSnapshot): boolean {
  return (
    snapshot.drift_state === 'unknown' &&
    snapshot.coverage_percent === 0
  );
}

/**
 * Classify an entity based on its posture snapshot.
 */
export function classifyFromSnapshot(snapshot: PostureSnapshot): AttackClassification {
  if (evaluateNovel(snapshot)) return 'NOVEL';
  if (evaluateProtected(snapshot)) return 'PROTECTED';
  return 'PRE_WARNED';
}

/**
 * Pause classification when an inverse discovery event indicates the entity
 * cannot be resolved.
 */
export function pauseOnInverseFailure(entity_ref: string, inverseEvent: InverseDiscoveryEvent): PauseResult {
  const shouldPause = inverseEvent.lookupResult === 'unresolved' && !inverseEvent.resolved_at;
  return {
    paused: shouldPause,
    reason: shouldPause
      ? `Inverse discovery event ${inverseEvent.event_id}: entity lookup unresolved (${inverseEvent.rootCause ?? 'unknown'}). Classification paused until resolution.`
      : 'Inverse event resolved — no pause required.',
    inverseEventRef: inverseEvent.event_id,
  };
}
