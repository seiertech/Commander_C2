/**
 * Property-Based Tests — War Room Communication Excellence
 *
 * Feature: war-room-communication-excellence (WRCEP-1.0)
 * Properties:
 * - Lifecycle transitions are total — every valid (status, newStatus) pair produces either success or a specific rejection reason
 * - Cadence computation is monotonic — moving to a less-urgent War Room state never produces a shorter cadence interval
 * - Stalling detection is monotonic — more elapsed time never reduces stalling severity
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  transitionWarRoom,
  WAR_ROOM_TRANSITIONS,
} from '../../packages/rules/war-room-lifecycle';
import {
  computeNextUpdateTime,
  detectStalling,
} from '../../packages/rules/war-room-cadence';
import type { WarRoom, WarRoomStatus, WarRoomMemberRole } from '../../packages/contracts/src/entities/war-room';
import { WAR_ROOM_STATUSES, WAR_ROOM_MEMBER_ROLES } from '../../packages/contracts/src/entities/war-room';
import { seedWarRooms } from '../../packages/contracts/src/fixtures/seed-war-rooms';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const warRoomStatusArb = fc.constantFrom(...WAR_ROOM_STATUSES) as fc.Arbitrary<WarRoomStatus>;
const memberRoleArb = fc.constantFrom(...WAR_ROOM_MEMBER_ROLES, 'system') as fc.Arbitrary<WarRoomMemberRole | 'system'>;
const timestampArb = fc.constant('2026-02-01T12:00:00.000Z');

function makeWarRoomWithStatus(status: WarRoomStatus): WarRoom {
  return {
    ...seedWarRooms[0],
    status,
  };
}

// ─── Property 1: Lifecycle transitions are total ─────────────────────────────
// Every valid (status, newStatus) pair produces either success or a specific rejection reason

describe('Property: Lifecycle transitions are total', () => {
  it('every (status, newStatus, actorRole) triple produces a definite result (success or error)', () => {
    fc.assert(
      fc.property(
        warRoomStatusArb,
        warRoomStatusArb,
        memberRoleArb,
        (fromStatus, toStatus, actorRole) => {
          const warRoom = makeWarRoomWithStatus(fromStatus);
          const result = transitionWarRoom(warRoom, toStatus, actorRole, 'Property test', '2026-02-01T12:00:00.000Z');

          // Must always produce a definite result
          expect(typeof result.success).toBe('boolean');

          if (result.success) {
            // On success: warRoom must be non-null with the new status
            expect(result.warRoom).not.toBeNull();
            expect(result.warRoom!.status).toBe(toStatus);
            expect(result.error).toBeUndefined();
          } else {
            // On failure: must have a non-empty error message
            expect(result.warRoom).toBeNull();
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error!.length).toBeGreaterThan(0);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it('all defined transitions succeed with senior_owner actor', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...WAR_ROOM_TRANSITIONS),
        timestampArb,
        (transition, ts) => {
          const warRoom = makeWarRoomWithStatus(transition.from);
          const result = transitionWarRoom(warRoom, transition.to, 'senior_owner', 'Valid transition', ts);
          expect(result.success).toBe(true);
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ─── Property 2: Cadence computation is monotonic ────────────────────────────
// Moving to a less-urgent War Room state never produces a shorter cadence interval

describe('Property: Cadence computation is monotonic', () => {
  it('cadence interval never decreases when transitioning to less-urgent state', () => {
    // State urgency order: activated > monitoring > winding_down > closed
    const stateOrder: WarRoomStatus[] = ['activated', 'monitoring', 'winding_down', 'closed'];

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),   // activatedCadence
        fc.integer({ min: 1, max: 480 }),   // monitoringCadence  
        fc.integer({ min: 1, max: 1440 }),  // windingDownCadence
        fc.integer({ min: 1, max: 480 }),   // execCadence
        (activated, monitoring, windingDown, exec) => {
          // CONSTRAINT: cadence values must be non-decreasing for the property to hold
          // This is the expected configuration: activated <= monitoring <= windingDown
          const sortedMonitoring = Math.max(activated, monitoring);
          const sortedWindingDown = Math.max(sortedMonitoring, windingDown);

          const warRoomBase: WarRoom = {
            ...seedWarRooms[0],
            communication_cadence: {
              activatedCadenceMinutes: activated,
              monitoringCadenceMinutes: sortedMonitoring,
              windingDownCadenceMinutes: sortedWindingDown,
              execUpdateCadenceMinutes: exec,
            },
          };

          const lastUpdate = '2026-02-01T08:00:00.000Z';
          const now = '2026-02-01T08:10:00.000Z';

          // Compute cadence for each state
          const cadences = stateOrder.map((status) => {
            const wr = { ...warRoomBase, status };
            return computeNextUpdateTime(wr, lastUpdate, now).cadenceMinutes;
          });

          // Property: cadences should be non-decreasing (except for closed which is 0)
          // activated <= monitoring <= winding_down
          for (let i = 0; i < cadences.length - 2; i++) {
            expect(cadences[i]).toBeLessThanOrEqual(cadences[i + 1]);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 3: Stalling detection is monotonic ─────────────────────────────
// More elapsed time never reduces stalling severity

describe('Property: Stalling detection is monotonic', () => {
  it('increasing elapsed time never reduces stalling or escalation flags', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1440 }), // threshold minutes
        fc.integer({ min: 0, max: 720 }),   // elapsed1 minutes
        fc.integer({ min: 0, max: 720 }),   // elapsed2 minutes (additional time)
        (threshold, elapsed1, additionalMinutes) => {
          const elapsed2 = elapsed1 + additionalMinutes; // elapsed2 >= elapsed1
          const warRoom = seedWarRooms[0]; // activated

          const baseTime = new Date('2026-02-01T08:00:00.000Z').getTime();
          const lastAction = '2026-02-01T08:00:00.000Z';
          const now1 = new Date(baseTime + elapsed1 * 60 * 1000).toISOString();
          const now2 = new Date(baseTime + elapsed2 * 60 * 1000).toISOString();

          const result1 = detectStalling(warRoom, lastAction, now1, threshold);
          const result2 = detectStalling(warRoom, lastAction, now2, threshold);

          // Monotonicity: minutesSinceLastAction never decreases
          expect(result2.minutesSinceLastAction).toBeGreaterThanOrEqual(result1.minutesSinceLastAction);

          // Monotonicity: if stalling at t1, still stalling at t2 (t2 >= t1)
          if (result1.stalling) {
            expect(result2.stalling).toBe(true);
          }

          // Monotonicity: if shouldEscalate at t1, still shouldEscalate at t2
          if (result1.shouldEscalate) {
            expect(result2.shouldEscalate).toBe(true);
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});
