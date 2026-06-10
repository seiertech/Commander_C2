// @ts-nocheck
/**
 * Case Aggregation Resolver — Commander C2 (COIM-G)
 *
 * Computes the COIM aggregate fields cached on a Case from its bound Risk
 * Objects. These are computed/cached values for query performance and
 * reporting — they INFORM but never GOVERN case lifecycle, priority, routing,
 * validation or closure (governance logic is untouched by this resolver).
 *
 * Source authority:
 * - DECISIONS.md DEC-coim-ocsf-source-classification-architecture
 * - docs/knowledge/ocsf_assessment/01_COIM_v1_0.md §6 (Case impact)
 * - docs/knowledge/ocsf_assessment/02_SOURCE_CLASSIFICATION_MODEL.md §10.4
 * - Spec #08 Case Management
 *
 * Build unit: COIM-G (Case Aggregation). Resolves ARCH-DEBT-045 (Case dwell time).
 *
 * Design notes:
 * - Pure functions, no side effects, no hardcoded SLA/routing/priority values.
 * - Inputs are the bound Risk Objects plus the case creation timestamp.
 * - All outputs are additive, optional Case fields (back-compatible).
 */

import type { RiskObject } from '../entities/risk-object';
import type { AttackMapping, FindingClass } from '../entities/coim';

/** Maximum aggregated ATT&CK bindings cached on a Case (storage efficiency). */
export const MAX_CASE_ATTACK_BINDINGS = 50;

/** Upper bound for the blast-radius score. */
export const MAX_BLAST_RADIUS_SCORE = 100;

/** Computed COIM aggregates for a single Case. */
export interface CaseAggregation {
  /** Deduplicated ATT&CK bindings across bound Risk Objects (≤ 50). */
  attacks: AttackMapping[];
  /** Count of distinct affected entities across bound Risk Objects. */
  affected_entity_count: number;
  /** Blast radius score (0-100), derived from affected-entity count. */
  blastRadiusScore: number;
  /**
   * Dwell time in hours from the earliest bound Risk Object `firstDetectedAt`
   * to case creation. `undefined` when no bound risk object carries a
   * `firstDetectedAt` timestamp (cannot be computed without source time).
   */
  dwellTimeHours?: number;
  /** Weighted-by-count average of source confidence (0-100). */
  confidenceAggregate?: number;
  /** Count of bound Risk Objects per FindingClass. */
  findingClassBreakdown: Record<string, number>;
}

/** Deduplication key for an ATT&CK binding (technique + optional sub-technique). */
function attackKey(a: AttackMapping): string {
  return `${a.technique}::${a.subTechnique ?? ''}`;
}

/**
 * Aggregate the ATT&CK bindings carried on the bound Risk Objects'
 * sourceClassification. Deduplicated by technique (+ sub-technique), order
 * preserved by first appearance, bounded to MAX_CASE_ATTACK_BINDINGS.
 */
function aggregateAttacks(riskObjects: RiskObject[]): AttackMapping[] {
  const seen = new Set<string>();
  const result: AttackMapping[] = [];
  for (const ro of riskObjects) {
    const attacks = ro.source_classification?.attacks ?? [];
    for (const a of attacks) {
      const key = attackKey(a);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(a);
      if (result.length >= MAX_CASE_ATTACK_BINDINGS) return result;
    }
  }
  return result;
}

/**
 * Count distinct affected entities across the bound Risk Objects. Uses the
 * COIM-aligned plural `affectedEntities[]` where present, falling back to the
 * singular `affectedEntityId` for records created before COIM-A.
 */
function countAffectedEntities(riskObjects: RiskObject[]): number {
  const ids = new Set<string>();
  for (const ro of riskObjects) {
    if (ro.affected_entities && ro.affected_entities.length > 0) {
      for (const id of ro.affected_entities) ids.add(id);
    } else if (ro.affected_entity_id) {
      ids.add(ro.affected_entity_id);
    }
  }
  return ids.size;
}

/**
 * Derive a blast-radius score (0-100) from the distinct affected-entity count.
 * Saturating, monotonic mapping: each affected entity contributes 10 points,
 * capped at 100. Deliberately simple and source-agnostic — a richer model
 * (criticality weighting) can replace this without changing the contract.
 */
function blastRadius(affected_entity_count: number): number {
  return Math.min(MAX_BLAST_RADIUS_SCORE, affectedEntityCount * 10);
}

/**
 * Compute dwell time in whole hours from the earliest bound Risk Object
 * `firstDetectedAt` to the case creation timestamp. Returns `undefined` when
 * no bound risk object carries a source detection time. Negative spans (clock
 * skew / detection after case creation) clamp to 0.
 */
function computeDwellTimeHours(
  riskObjects: RiskObject[],
  caseCreatedAt: string,
): number | undefined {
  const detectionTimes = riskObjects
    .map((ro) => ro.first_detected_at)
    .filter((t): t is string => typeof t === 'string' && t.length > 0)
    .map((t) => Date.parse(t))
    .filter((ms) => !Number.isNaN(ms));

  if (detectionTimes.length === 0) return undefined;

  const earliest = Math.min(...detectionTimes);
  const created = Date.parse(caseCreatedAt);
  if (Number.isNaN(created)) return undefined;

  const spanMs = created - earliest;
  if (spanMs <= 0) return 0;
  return Math.floor(spanMs / (1000 * 60 * 60));
}

/**
 * Weighted (by count — each risk object counts once) average of source
 * confidence scores across bound Risk Objects. Returns `undefined` when no
 * bound risk object carries a source confidence score.
 */
function computeConfidenceAggregate(riskObjects: RiskObject[]): number | undefined {
  const scores = riskObjects
    .map((ro) => ro.source_classification?.source_confidence?.confidence_score)
    .filter((s): s is number => typeof s === 'number');

  if (scores.length === 0) return undefined;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return Math.round(sum / scores.length);
}

/** Count bound Risk Objects per FindingClass (from sourceClassification). */
function computeFindingClassBreakdown(
  riskObjects: RiskObject[],
): Record<string, number> {
  const breakdown: Partial<Record<FindingClass, number>> = {};
  for (const ro of riskObjects) {
    const fc = ro.source_classification?.finding_class;
    if (!fc) continue;
    breakdown[fc] = (breakdown[fc] ?? 0) + 1;
  }
  return breakdown as Record<string, number>;
}

/**
 * Compute the full COIM aggregation for a Case from its bound Risk Objects.
 *
 * @param riskObjects   Risk Objects bound to the case.
 * @param caseCreatedAt The case `createdAt` ISO 8601 timestamp (dwell-time anchor).
 */
export function computeCaseAggregation(
  riskObjects: RiskObject[],
  caseCreatedAt: string,
): CaseAggregation {
  const affectedEntityCount = countAffectedEntities(riskObjects);
  return {
    attacks: aggregateAttacks(riskObjects),
    affected_entity_count: affected_entity_count,
    blastRadiusScore: blastRadius(affectedEntityCount),
    dwellTimeHours: computeDwellTimeHours(riskObjects, caseCreatedAt),
    confidenceAggregate: computeConfidenceAggregate(riskObjects),
    findingClassBreakdown: computeFindingClassBreakdown(riskObjects),
  };
}
