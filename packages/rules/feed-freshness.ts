/**
 * Feed Freshness Evaluator — Pure Function (C4)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 2.4
 *
 * Maps elapsed time since lastSuccessfulSync relative to refreshCadenceMinutes
 * to one of: fresh | aging | stale | expired.
 * Pure, total function of (lastSuccessfulSync, refreshCadenceMinutes, now).
 * null lastSuccessfulSync → expired.
 */

import type { SourceFreshnessState } from '../contracts/src/entities/intelligence-common';

/**
 * Evaluate the freshness state of a feed source.
 *
 * Thresholds (relative to refreshCadenceMinutes):
 * - fresh:   elapsed <= 1x cadence
 * - aging:   elapsed <= 2x cadence
 * - stale:   elapsed <= 4x cadence
 * - expired: elapsed > 4x cadence OR lastSuccessfulSync is null
 */
export function evaluateFreshness(
  lastSuccessfulSync: string | null,
  refreshCadenceMinutes: number,
  now: string,
): SourceFreshnessState {
  if (lastSuccessfulSync === null) {
    return 'expired';
  }

  const lastSync = new Date(lastSuccessfulSync).getTime();
  const currentTime = new Date(now).getTime();
  const elapsedMinutes = (currentTime - lastSync) / (1000 * 60);

  if (elapsedMinutes <= refreshCadenceMinutes) {
    return 'fresh';
  }
  if (elapsedMinutes <= refreshCadenceMinutes * 2) {
    return 'aging';
  }
  if (elapsedMinutes <= refreshCadenceMinutes * 4) {
    return 'stale';
  }
  return 'expired';
}
