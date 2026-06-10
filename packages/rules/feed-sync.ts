/**
 * Feed Sync State Transition — Pure Function (C5)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 2.2, 2.3, 2.5
 *
 * Pure reducer: given current schedule state and a sync result,
 * returns the next schedule state.
 * No live sync is performed — models state transition only.
 */

import type { FeedFailureState } from '../contracts/src/entities/platform-intelligence-source';

export interface FeedScheduleState {
  lastSuccessfulSync: string | null;
  nextScheduledSync: string | null;
  failureState: FeedFailureState | null;
  refreshCadenceMinutes: number;
}

export interface SyncSuccess {
  type: 'success';
  syncTimestamp: string;
}

export interface SyncFailure {
  type: 'failure';
  failureTimestamp: string;
  errorClass: string;
}

export type SyncResult = SyncSuccess | SyncFailure;

/**
 * Apply a sync result to the current feed schedule state.
 *
 * On success:
 * - Set lastSuccessfulSync to syncTimestamp
 * - Compute nextScheduledSync = syncTimestamp + cadence
 * - Clear failureState
 *
 * On failure:
 * - Record failure timestamp, error class
 * - Increment consecutive failure count (monotonic)
 * - Do not change lastSuccessfulSync or nextScheduledSync
 */
export function applySyncResult(
  current: FeedScheduleState,
  result: SyncResult,
): FeedScheduleState {
  if (result.type === 'success') {
    const syncTime = new Date(result.syncTimestamp).getTime();
    const nextSync = new Date(syncTime + current.refreshCadenceMinutes * 60 * 1000).toISOString();

    return {
      ...current,
      lastSuccessfulSync: result.syncTimestamp,
      nextScheduledSync: nextSync,
      failureState: null,
    };
  }

  // Failure case
  const previousFailures = current.failureState?.consecutiveFailures ?? 0;

  return {
    ...current,
    failureState: {
      failedAt: result.failureTimestamp,
      errorClass: result.errorClass,
      consecutiveFailures: previousFailures + 1,
    },
  };
}
