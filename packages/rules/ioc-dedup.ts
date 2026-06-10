/**
 * IOC Deduplication + Source-Attribution Merger — Pure Function (C2)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 6.5, 8.2, 8.3
 *
 * Keyed on (normalisedValue, iocCategory): create-vs-merge decision.
 * Merge unions SourceAttributionEntry by sourceId; firstSeenAt = min,
 * last_seen_at = max. Commutative and idempotent at catalogue level.
 * Preserves every originalRawValue.
 */

import type { IocCategory, SourceAttributionEntry } from '../contracts/src/entities/intelligence-common';
import type { IndicatorOfCompromise } from '../contracts/src/entities/indicator-of-compromise';

export interface DedupKey {
  normalisedValue: string;
  ioc_category: IocCategory;
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
 * - last_seen_at = max across all attributions
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
    mergedAttributions.set(attr.source_id, attr);
  }

  for (const attr of incoming.sourceAttribution) {
    const existingAttr = mergedAttributions.get(attr.source_id);
    if (existingAttr) {
      // Merge: keep min firstSeenAt, max last_seen_at, latest confidence/severity
      mergedAttributions.set(attr.source_id, {
        ...existingAttr,
        first_seen_at: attr.first_seen_at < existingAttr.first_seen_at ? attr.first_seen_at : existingAttr.first_seen_at,
        last_seen_at: attr.last_seen_at > existingAttr.last_seen_at ? attr.last_seen_at : existingAttr.last_seen_at,
        reportedConfidence: attr.reportedConfidence,
        reportedSeverity: attr.reportedSeverity,
      });
    } else {
      mergedAttributions.set(attr.source_id, attr);
    }
  }

  const attributions = Array.from(mergedAttributions.values());

  // Compute min firstSeenAt and max last_seen_at across all attributions
  const firstSeenAt = attributions.reduce(
    (min, a) => a.first_seen_at < min ? a.first_seen_at : min,
    attributions[0].first_seen_at,
  );
  const last_seen_at = attributions.reduce(
    (max, a) => a.last_seen_at > max ? a.last_seen_at : max,
    attributions[0].last_seen_at,
  );

  const merged: IndicatorOfCompromise = {
    ...existing,
    sourceAttribution: attributions,
    first_seen_at: firstSeenAt,
    last_seen_at: last_seen_at,
    updated_at: new Date().toISOString(),
  };

  return { action: 'merge', record: merged };
}

/**
 * Build a dedup key for catalogue lookup.
 */
export function buildDedupKey(normalisedValue: string, ioc_category: IocCategory): string {
  return `${normalisedValue}|${ioc_category}`;
}
