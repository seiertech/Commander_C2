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
  entityRef: string;
  snapshotAt: string;
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
  entityRef: string;
  previousClassification: AttackClassification | null;
  newClassification: AttackClassification;
  reason: string;
  inversePaused: boolean;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Look up the posture snapshot closest to (but not after) a given timestamp.
 */
export function lookupPostureAtTime(entityRef: string, timestamp: string, records: PostureRecord[]): PostureSnapshot | null {
  const ts = new Date(timestamp).getTime();
  const matching = records
    .filter((r) => r.entityRef === entityRef && new Date(r.snapshotAt).getTime() <= ts)
    .sort((a, b) => new Date(b.snapshotAt).getTime() - new Date(a.snapshotAt).getTime());

  return matching[0]?.snapshot ?? null;
}

/**
 * Evaluate whether a snapshot indicates PRE_WARNED (known weaknesses, partial coverage).
 */
export function evaluatePreWarned(snapshot: PostureSnapshot): boolean {
  return (
    snapshot.driftState === 'drifted' ||
    snapshot.openRiskObjects > 0 ||
    snapshot.controlAdherence < 70
  );
}

/**
 * Evaluate whether a snapshot indicates PROTECTED (no drift, full coverage, strong adherence).
 */
export function evaluateProtected(snapshot: PostureSnapshot): boolean {
  return (
    snapshot.driftState === 'compliant' &&
    snapshot.coveragePercent >= 80 &&
    snapshot.controlAdherence >= 80 &&
    snapshot.openRiskObjects === 0
  );
}

/**
 * Evaluate whether a snapshot indicates NOVEL (unknown estate, no posture data).
 */
export function evaluateNovel(snapshot: PostureSnapshot): boolean {
  return (
    snapshot.driftState === 'unknown' &&
    snapshot.coveragePercent === 0
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
export function pauseOnInverseFailure(entityRef: string, inverseEvent: InverseDiscoveryEvent): PauseResult {
  const shouldPause = inverseEvent.lookupResult === 'unresolved' && !inverseEvent.resolvedAt;
  return {
    paused: shouldPause,
    reason: shouldPause
      ? `Inverse discovery event ${inverseEvent.eventId}: entity lookup unresolved (${inverseEvent.rootCause ?? 'unknown'}). Classification paused until resolution.`
      : 'Inverse event resolved — no pause required.',
    inverseEventRef: inverseEvent.eventId,
  };
}
