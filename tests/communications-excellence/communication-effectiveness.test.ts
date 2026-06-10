/**
 * Unit Tests — Communication Effectiveness Scorer
 *
 * Feature: communications-excellence
 * Tests: signal computation, weight application, roll-up
 */

import { describe, it, expect } from 'vitest';
import {
  computeThreadEffectiveness,
  computeCaseEffectiveness,
  aggregateEffectiveness,
  EFFECTIVENESS_WEIGHTS,
} from '../../packages/rules/communication-effectiveness';
import { seedCommunicationThreads } from '../../packages/contracts/src/fixtures/seed-communication-threads';

describe('Communication Effectiveness — Weight Validation', () => {
  it('weights sum to 1.0', () => {
    const sum = Object.values(EFFECTIVENESS_WEIGHTS).reduce((s, w) => s + w, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

describe('Communication Effectiveness — Thread Scoring', () => {
  it('computes thread effectiveness for a responded email thread', () => {
    const thread = seedCommunicationThreads[0]; // responded, no escalation
    const result = computeThreadEffectiveness(thread, thread.communicationSla);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.signals.responseTime).toBeGreaterThan(0);
    expect(result.signals.escalationRate).toBe(100); // no escalations
  });

  it('computes lower effectiveness for stale thread with escalation', () => {
    const staleThread = seedCommunicationThreads[2]; // stale, 1 escalation
    const result = computeThreadEffectiveness(staleThread, staleThread.communicationSla);
    const respondedThread = seedCommunicationThreads[0];
    const respondedResult = computeThreadEffectiveness(respondedThread, respondedThread.communicationSla);
    expect(result.score).toBeLessThan(respondedResult.score);
  });

  it('computes high effectiveness for closed thread', () => {
    const closedThread = seedCommunicationThreads[3]; // closed teams thread
    const result = computeThreadEffectiveness(closedThread, closedThread.communicationSla);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.signals.intentAlignment).toBe(100);
  });

  it('all signals are bounded 0-100', () => {
    for (const thread of seedCommunicationThreads) {
      const result = computeThreadEffectiveness(thread, thread.communicationSla);
      for (const [, value] of Object.entries(result.signals)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('Communication Effectiveness — Case-Level', () => {
  it('computes case effectiveness across multiple threads', () => {
    const result = computeCaseEffectiveness(seedCommunicationThreads);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.threadScores.length).toBe(seedCommunicationThreads.length);
    expect(result.worstPerforming).not.toBeNull();
  });

  it('returns 100 for empty thread array', () => {
    const result = computeCaseEffectiveness([]);
    expect(result.overallScore).toBe(100);
    expect(result.threadScores.length).toBe(0);
    expect(result.worstPerforming).toBeNull();
  });

  it('identifies worst performing thread', () => {
    const result = computeCaseEffectiveness(seedCommunicationThreads);
    const minScore = Math.min(...result.threadScores.map((t) => t.score));
    expect(result.worstPerforming!.score).toBe(minScore);
  });
});

describe('Communication Effectiveness — Aggregation', () => {
  it('aggregates scores by group key', () => {
    const items = [
      { groupKey: 'Security Operations', score: 80 },
      { groupKey: 'Security Operations', score: 60 },
      { groupKey: 'Platform Engineering', score: 90 },
    ];
    const result = aggregateEffectiveness(items);
    expect(result.length).toBe(2);
    const secOps = result.find((a) => a.groupKey === 'Security Operations')!;
    expect(secOps.averageScore).toBe(70);
    expect(secOps.threadCount).toBe(2);
    expect(secOps.worstScore).toBe(60);
    expect(secOps.bestScore).toBe(80);
  });
});
