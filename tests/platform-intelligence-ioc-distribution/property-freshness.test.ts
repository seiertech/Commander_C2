/**
 * Property-Based Tests — Feed Freshness and Sync
 *
 * Feature: platform-intelligence-ioc-distribution, Property 6: Feed freshness mapping is total and monotonic
 * Validates: Requirements 2.4
 *
 * Feature: platform-intelligence-ioc-distribution, Property 7: Feed schedule state transition is correct
 * Validates: Requirements 2.2, 2.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { evaluateFreshness } from '../../packages/rules/feed-freshness';
import { applySyncResult } from '../../packages/rules/feed-sync';
import { SOURCE_FRESHNESS_STATES } from '../../packages/contracts/src/entities/intelligence-common';
import type { FeedScheduleState, SyncResult } from '../../packages/rules/feed-sync';

describe('Property 6: Feed freshness mapping is total and monotonic', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 6: Feed freshness mapping is total and monotonic
  it('always returns a valid freshness state for any inputs', () => {
    fc.assert(
      fc.property(
        fc.option(fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()), { nil: null }),
        fc.integer({ min: 1, max: 10080 }), // 1 min to 1 week
        fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()),
        (lastSync, cadence, now) => {
          const result = evaluateFreshness(lastSync, cadence, now);
          expect(SOURCE_FRESHNESS_STATES).toContain(result);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('null lastSuccessfulSync always returns expired', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10080 }),
        fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()),
        (cadence, now) => {
          expect(evaluateFreshness(null, cadence, now)).toBe('expired');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('freshness is monotonically non-improving as time passes', () => {
    const stateOrder = ['fresh', 'aging', 'stale', 'expired'];
    fc.assert(
      fc.property(
        fc.integer({ min: 1704067200000, max: 1717200000000 }).map(ts => new Date(ts).toISOString()),
        fc.integer({ min: 60, max: 1440 }),
        fc.integer({ min: 0, max: 5000 }),
        fc.integer({ min: 1, max: 5000 }),
        (lastSync, cadence, elapsedMin1, additionalMin) => {
          const now1 = new Date(new Date(lastSync).getTime() + elapsedMin1 * 60000).toISOString();
          const now2 = new Date(new Date(lastSync).getTime() + (elapsedMin1 + additionalMin) * 60000).toISOString();

          const state1 = evaluateFreshness(lastSync, cadence, now1);
          const state2 = evaluateFreshness(lastSync, cadence, now2);

          // state2 should be same or worse (higher index) than state1
          expect(stateOrder.indexOf(state2)).toBeGreaterThanOrEqual(stateOrder.indexOf(state1));
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe('Property 7: Feed schedule state transition is correct', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 7: Feed schedule state transition is correct
  it('success clears failureState and sets lastSuccessfulSync', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1440 }),
        fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()),
        (cadence, syncTimestamp) => {
          const state: FeedScheduleState = {
            lastSuccessfulSync: null,
            nextScheduledSync: null,
            failureState: { failedAt: '2024-01-01T00:00:00Z', errorClass: 'timeout', consecutiveFailures: 3 },
            refreshCadenceMinutes: cadence,
          };
          const result = applySyncResult(state, { type: 'success', syncTimestamp });
          expect(result.failureState).toBeNull();
          expect(result.lastSuccessfulSync).toBe(syncTimestamp);
          expect(result.nextScheduledSync).not.toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('failure increments consecutive failure count monotonically', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1440 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()),
        (cadence, prevFailures, timestamp) => {
          const state: FeedScheduleState = {
            lastSuccessfulSync: '2024-01-01T00:00:00Z',
            nextScheduledSync: '2024-01-01T01:00:00Z',
            failureState: prevFailures > 0 ? { failedAt: '2024-01-01T00:00:00Z', errorClass: 'err', consecutiveFailures: prevFailures } : null,
            refreshCadenceMinutes: cadence,
          };
          const result = applySyncResult(state, { type: 'failure', failureTimestamp: timestamp, errorClass: 'timeout' });
          expect(result.failureState!.consecutiveFailures).toBe(prevFailures + 1);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('nextScheduledSync = lastSuccessfulSync + cadence on success', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1440 }),
        fc.integer({ min: 1577836800000, max: 1717200000000 }).map(ts => new Date(ts).toISOString()),
        (cadence, syncTimestamp) => {
          const state: FeedScheduleState = {
            lastSuccessfulSync: null,
            nextScheduledSync: null,
            failureState: null,
            refreshCadenceMinutes: cadence,
          };
          const result = applySyncResult(state, { type: 'success', syncTimestamp });
          const expected = new Date(new Date(syncTimestamp).getTime() + cadence * 60 * 1000).toISOString();
          expect(result.nextScheduledSync).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });
});
