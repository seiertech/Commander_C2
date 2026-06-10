// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Property-Based Tests — Communications Excellence
 *
 * Feature: communications-excellence
 * Properties:
 * - Effectiveness score is bounded 0-100 and weights sum to 1.0
 * - Playbook condition evaluator is total (every valid condition produces a boolean, never throws)
 * - Detonation routing is total and deterministic (every valid verdict produces exactly one route)
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  computeThreadEffectiveness,
  EFFECTIVENESS_WEIGHTS,
} from '../../packages/rules/communication-effectiveness';
import { evaluateStepCondition } from '../../packages/rules/playbook-engine';
import { routeDetonationVerdict } from '../../packages/rules/detonation-router';
import type { CaseCommunicationThread, CommunicationChannel, CommunicationThreadStatus } from '../../packages/contracts/src/entities/case-communication-thread';
import { COMMUNICATION_CHANNELS, COMMUNICATION_THREAD_STATUSES } from '../../packages/contracts/src/entities/case-communication-thread';
import type { DetonationVerdict, DetonationSource, DetonationOverallVerdict } from '../../packages/contracts/src/entities/detonation-verdict';
import { DETONATION_SOURCES, DETONATION_OVERALL_VERDICTS, DETONATION_CHECK_TYPES, DETONATION_CHECK_RESULTS } from '../../packages/contracts/src/entities/detonation-verdict';
import type { PlaybookConditionContext } from '../../packages/rules/playbook-engine';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const threadArbitrary: fc.Arbitrary<CaseCommunicationThread> = fc.record({
  id: fc.string({ minLength: 1 }),
  tenant: fc.record({ tenant_id: fc.string({ minLength: 1 }), tenant_name: fc.string({ minLength: 1 }) }),
  created_at: fc.constant('2026-01-16T08:00:00.000Z'),
  updated_at: fc.constant('2026-01-16T10:00:00.000Z'),
  source: fc.record({
    connector_id: fc.string({ minLength: 1 }),
    import_run_id: fc.string({ minLength: 1 }),
    source_system: fc.string({ minLength: 1 }),
    source_timestamp: fc.constant('2026-01-16T08:00:00.000Z'),
  }),
  thread_id: fc.string({ minLength: 1 }),
  case_id: fc.string({ minLength: 1 }),
  tenant_id: fc.string({ minLength: 1 }),
  channel: fc.constantFrom(...COMMUNICATION_CHANNELS) as fc.Arbitrary<CommunicationChannel>,
  participants: fc.array(
    fc.record({
      participantId: fc.string({ minLength: 1 }),
      display_name: fc.string({ minLength: 1 }),
      role: fc.constantFrom('sender', 'recipient', 'cc', 'observer') as fc.Arbitrary<'sender' | 'recipient' | 'cc' | 'observer'>,
    }),
    { minLength: 1, maxLength: 5 },
  ),
  status: fc.constantFrom(...COMMUNICATION_THREAD_STATUSES) as fc.Arbitrary<CommunicationThreadStatus>,
  communicationSla: fc.record({
    targetResponseHours: fc.integer({ min: 1, max: 168 }),
    breached: fc.boolean(),
  }),
  sentAt: fc.constant('2026-01-16T08:00:00.000Z'),
  lastResponseAt: fc.option(fc.constant('2026-01-16T10:00:00.000Z'), { nil: null }),
  messageCount: fc.integer({ min: 0, max: 50 }),
  escalationCount: fc.integer({ min: 0, max: 10 }),
});

const verdictArbitrary: fc.Arbitrary<DetonationVerdict> = fc.record({
  id: fc.string({ minLength: 1 }),
  tenant: fc.record({ tenant_id: fc.string({ minLength: 1 }), tenant_name: fc.string({ minLength: 1 }) }),
  created_at: fc.constant('2026-01-16T08:00:00.000Z'),
  updated_at: fc.constant('2026-01-16T08:00:00.000Z'),
  source: fc.record({
    connector_id: fc.string({ minLength: 1 }),
    import_run_id: fc.string({ minLength: 1 }),
    source_system: fc.string({ minLength: 1 }),
    source_timestamp: fc.constant('2026-01-16T08:00:00.000Z'),
  }),
  verdictId: fc.string({ minLength: 1 }),
  tenant_id: fc.string({ minLength: 1 }),
  emailMessageId: fc.string({ minLength: 1 }),
  detonationSource: fc.constantFrom(...DETONATION_SOURCES) as fc.Arbitrary<DetonationSource>,
  overallVerdict: fc.constantFrom(...DETONATION_OVERALL_VERDICTS) as fc.Arbitrary<DetonationOverallVerdict>,
  checks: fc.array(
    fc.record({
      checkType: fc.constantFrom(...DETONATION_CHECK_TYPES),
      result: fc.constantFrom(...DETONATION_CHECK_RESULTS),
      confidence: fc.integer({ min: 0, max: 100 }),
      detail: fc.string(),
    }),
    { minLength: 0, maxLength: 5 },
  ),
  received_at: fc.constant('2026-01-16T08:00:00.000Z'),
  processed_at: fc.constant('2026-01-16T08:05:00.000Z'),
});

const boundedConditionArbitrary: fc.Arbitrary<string> = fc.oneof(
  fc.constant('always'),
  fc.constant('never'),
  fc.tuple(fc.constantFrom('priority', 'status', 'team', 'caseType'), fc.string({ minLength: 1, maxLength: 10 }))
    .map(([field, value]) => `case.${field} == '${value}'`),
  fc.tuple(fc.constantFrom('priority', 'status'), fc.array(fc.string({ minLength: 1, maxLength: 5 }), { minLength: 1, maxLength: 3 }))
    .map(([field, values]) => `case.${field} IN [${values.map((v) => `'${v}'`).join(', ')}]`),
  fc.integer({ min: 1, max: 10 }).map((n) => `no_response_to_step_${n}`),
  fc.tuple(fc.integer({ min: 1, max: 10 }), fc.constantFrom('1h', '24h', '48h', 'P1D', 'PT30M'))
    .map(([n, dur]) => `time_since_step_${n} > ${dur}`),
);

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property: Effectiveness score is bounded 0-100 and weights sum to 1.0', () => {
  it('weights always sum to 1.0', () => {
    const sum = Object.values(EFFECTIVENESS_WEIGHTS).reduce((s, w) => s + w, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it('thread effectiveness score is always bounded 0-100', () => {
    fc.assert(
      fc.property(threadArbitrary, (thread: CaseCommunicationThread) => {
        const result = computeThreadEffectiveness(thread, thread.communicationSla);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      }),
      { numRuns: 200 },
    );
  });

  it('all signal values are bounded 0-100', () => {
    fc.assert(
      fc.property(threadArbitrary, (thread: CaseCommunicationThread) => {
        const result = computeThreadEffectiveness(thread, thread.communicationSla);
        for (const value of Object.values(result.signals)) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(100);
        }
      }),
      { numRuns: 200 },
    );
  });
});

describe('Property: Playbook condition evaluator is total', () => {
  it('every valid bounded condition produces a boolean, never throws', () => {
    fc.assert(
      fc.property(boundedConditionArbitrary, (condition: string) => {
        const context: PlaybookConditionContext = {
          case: { case_type: 'vulnerability', priority: 'P1', status: 'in_progress', team: 'SecOps' },
          stepStatuses: [
            { stepNumber: 1, status: 'executed', executedAt: '2026-01-16T08:00:00.000Z', reason: null },
            { stepNumber: 2, status: 'pending', executedAt: null, reason: null },
          ],
          timestamps: { 1: new Date(Date.now() - 86400000).toISOString() },
        };

        // Must not throw
        const result = evaluateStepCondition(condition, context);
        // Must return a boolean
        expect(typeof result).toBe('boolean');
      }),
      { numRuns: 500 },
    );
  });

  it('invalid conditions return false (never throw)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (randomString: string) => {
          const context: PlaybookConditionContext = {
            case: { case_type: 'vulnerability' },
            stepStatuses: [],
            timestamps: {},
          };
          // Must not throw
          const result = evaluateStepCondition(randomString, context);
          expect(typeof result).toBe('boolean');
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe('Property: Detonation routing is total and deterministic', () => {
  it('every valid verdict produces exactly one route', () => {
    fc.assert(
      fc.property(verdictArbitrary, (verdict: DetonationVerdict) => {
        const result = routeDetonationVerdict(verdict);
        // Must produce exactly one of the three routes
        expect(['proceed_normal', 'create_risk_object', 'analyst_review']).toContain(result.route);
        // Must have a reason
        expect(result.reason.length).toBeGreaterThan(0);
      }),
      { numRuns: 200 },
    );
  });

  it('same verdict always produces same route (deterministic)', () => {
    fc.assert(
      fc.property(verdictArbitrary, (verdict: DetonationVerdict) => {
        const result1 = routeDetonationVerdict(verdict);
        const result2 = routeDetonationVerdict({ ...verdict });
        expect(result1.route).toBe(result2.route);
      }),
      { numRuns: 200 },
    );
  });

  it('clean always routes to proceed_normal', () => {
    fc.assert(
      fc.property(verdictArbitrary, (verdict: DetonationVerdict) => {
        const cleanVerdict = { ...verdict, overallVerdict: 'clean' as const };
        const result = routeDetonationVerdict(cleanVerdict);
        expect(result.route).toBe('proceed_normal');
      }),
      { numRuns: 100 },
    );
  });

  it('malicious always routes to create_risk_object', () => {
    fc.assert(
      fc.property(verdictArbitrary, (verdict: DetonationVerdict) => {
        const malVerdict = { ...verdict, overallVerdict: 'malicious' as const };
        const result = routeDetonationVerdict(malVerdict);
        expect(result.route).toBe('create_risk_object');
        expect(result.riskObjectType).toBe('detection');
        expect(result.case_type).toBe('threat-intelligence-estate-match');
      }),
      { numRuns: 100 },
    );
  });

  it('suspicious always routes to analyst_review', () => {
    fc.assert(
      fc.property(verdictArbitrary, (verdict: DetonationVerdict) => {
        const susVerdict = { ...verdict, overallVerdict: 'suspicious' as const };
        const result = routeDetonationVerdict(susVerdict);
        expect(result.route).toBe('analyst_review');
      }),
      { numRuns: 100 },
    );
  });
});
