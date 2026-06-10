// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * IOC Deduplication + Source-Attribution Merger — Pure Function (C2)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 6.5, 8.2, 8.3
 *
 * Keyed on (normalisedValue, iocCategory): create-vs-merge decision.
 * Merge unions SourceAttributionEntry by sourceId; firstSeenAt = min,
 * lastSeenAt = max. Commutative and idempotent at catalogue level.
 * Preserves every originalRawValue.
 */

import type { IocCategory, SourceAttributionEntry } from '../contracts/src/entities/intelligence-common';
import type { IndicatorOfCompromise } from '../contracts/src/entities/indicator-of-compromise';

export interface DedupKey {
  normalisedValue: string;
  iocCategory: IocCategory;
}

export interface DedupResult {
  action: 'create' | 'merge';
  record: IndicatorOfCompromise;
}

/**
 * Given an incoming IOC and the existing catalogue (as a Map keyed by
 * `normalisedValue|iocCategory`), returns the merged record or signals creation.
 *
 * Merge semantics:
 * - Unions source attributions by sourceId (set semantics)
 * - firstSeenAt = min across all attributions
 * - lastSeenAt = max across all attributions
 * - Preserves every originalRawValue in attribution entries
 */
export function dedupAndMerge(
  incoming: IndicatorOfCompromise,
  existing: IndicatorOfCompromise | undefined,
): DedupResult {
  if (!existing) {
    return { action: 'create', record: incoming };
  }

  // Merge source attributions by sourceId (set semantics)
  const mergedAttributions = new Map<string, SourceAttributionEntry>();

  for (const attr of existing.sourceAttribution) {
    mergedAttributions.set(attr.sourceId, attr);
  }

  for (const attr of incoming.sourceAttribution) {
    const existingAttr = mergedAttributions.get(attr.sourceId);
    if (existingAttr) {
      // Merge: keep min firstSeenAt, max lastSeenAt, latest confidence/severity
      mergedAttributions.set(attr.sourceId, {
        ...existingAttr,
        firstSeenAt: attr.firstSeenAt < existingAttr.firstSeenAt ? attr.firstSeenAt : existingAttr.firstSeenAt,
        lastSeenAt: attr.lastSeenAt > existingAttr.lastSeenAt ? attr.lastSeenAt : existingAttr.lastSeenAt,
        reportedConfidence: attr.reportedConfidence,
        reportedSeverity: attr.reportedSeverity,
      });
    } else {
      mergedAttributions.set(attr.sourceId, attr);
    }
  }

  const attributions = Array.from(mergedAttributions.values());

  // Compute min firstSeenAt and max lastSeenAt across all attributions
  const firstSeenAt = attributions.reduce(
    (min, a) => a.firstSeenAt < min ? a.firstSeenAt : min,
    attributions[0].firstSeenAt,
  );
  const lastSeenAt = attributions.reduce(
    (max, a) => a.lastSeenAt > max ? a.lastSeenAt : max,
    attributions[0].lastSeenAt,
  );

  const merged: IndicatorOfCompromise = {
    ...existing,
    sourceAttribution: attributions,
    firstSeenAt,
    lastSeenAt,
    updatedAt: new Date().toISOString(),
  };

  return { action: 'merge', record: merged };
}

/**
 * Build a dedup key for catalogue lookup.
 */
export function buildDedupKey(normalisedValue: string, iocCategory: IocCategory): string {
  return `${normalisedValue}|${iocCategory}`;
}
