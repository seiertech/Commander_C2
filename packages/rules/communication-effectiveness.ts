// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Communication Effectiveness Scorer — Commander C2
 *
 * Communications Excellence Phase 1.
 * Pure functions for computing communication thread and case effectiveness.
 *
 * Weights: responseTime 0.25, resolutionSpeed 0.20, escalationRate 0.15,
 *          stakeholderEngagement 0.15, intentAlignment 0.15, channelEfficiency 0.10
 *
 * Roll-up ready: per-team, per-case-type, per-mailbox aggregation shape.
 * No I/O. No side effects.
 */

import type { CaseCommunicationThread, CommunicationSla } from '../contracts/src/entities/case-communication-thread';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Signal weights for effectiveness computation */
export const EFFECTIVENESS_WEIGHTS = {
  responseTime: 0.25,
  resolutionSpeed: 0.20,
  escalationRate: 0.15,
  stakeholderEngagement: 0.15,
  intentAlignment: 0.15,
  channelEfficiency: 0.10,
} as const;

/** Individual signal scores */
export interface EffectivenessSignals {
  /** How quickly responses are received (0-100) */
  responseTime: number;
  /** How quickly threads reach resolution (0-100) */
  resolutionSpeed: number;
  /** Lower escalation = higher score (0-100) */
  escalationRate: number;
  /** Active stakeholder participation (0-100) */
  stakeholderEngagement: number;
  /** Communication aligned with intent/purpose (0-100) */
  intentAlignment: number;
  /** Right channel for the communication type (0-100) */
  channelEfficiency: number;
}

/** Thread effectiveness result */
export interface ThreadEffectivenessResult {
  /** Weighted effectiveness score 0-100 */
  score: number;
  /** Individual signal scores */
  signals: EffectivenessSignals;
}

/** Case-level effectiveness result */
export interface CaseEffectivenessResult {
  /** Overall case effectiveness score 0-100 */
  overallScore: number;
  /** Individual thread scores */
  threadScores: Array<{ threadId: string; score: number }>;
  /** Worst-performing thread */
  worstPerforming: { threadId: string; score: number } | null;
}

/** Aggregation bucket for roll-up metrics */
export interface EffectivenessAggregation {
  /** Grouping key (team name, case type, or mailbox) */
  groupKey: string;
  /** Average effectiveness across group */
  averageScore: number;
  /** Thread count in this group */
  threadCount: number;
  /** Worst score in group */
  worstScore: number;
  /** Best score in group */
  bestScore: number;
}

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Compute effectiveness for a single communication thread.
 *
 * @param thread - The communication thread to evaluate
 * @param communicationSla - SLA configuration for response targets
 * @returns ThreadEffectivenessResult with score and signals
 */
export function computeThreadEffectiveness(
  thread: CaseCommunicationThread,
  communicationSla: CommunicationSla,
): ThreadEffectivenessResult {
  const signals = computeSignals(thread, communicationSla);
  const score = computeWeightedScore(signals);

  return { score, signals };
}

/**
 * Compute case-level effectiveness across all communication threads.
 *
 * @param threads - All threads bound to the case
 * @returns CaseEffectivenessResult with overall and per-thread scores
 */
export function computeCaseEffectiveness(
  threads: CaseCommunicationThread[],
): CaseEffectivenessResult {
  if (threads.length === 0) {
    return { overallScore: 100, threadScores: [], worstPerforming: null };
  }

  const threadScores = threads.map((thread) => {
    const result = computeThreadEffectiveness(thread, thread.communicationSla);
    return { threadId: thread.threadId, score: result.score };
  });

  const overallScore = Math.round(
    threadScores.reduce((sum, ts) => sum + ts.score, 0) / threadScores.length,
  );

  const worstPerforming = threadScores.reduce(
    (worst, current) => (current.score < worst.score ? current : worst),
    threadScores[0],
  );

  return { overallScore, threadScores, worstPerforming };
}

/**
 * Aggregate effectiveness scores for roll-up reporting.
 *
 * @param items - Array of { groupKey, score } pairs
 * @returns Aggregation buckets grouped by key
 */
export function aggregateEffectiveness(
  items: Array<{ groupKey: string; score: number }>,
): EffectivenessAggregation[] {
  const groups = new Map<string, number[]>();

  for (const item of items) {
    const scores = groups.get(item.groupKey) ?? [];
    scores.push(item.score);
    groups.set(item.groupKey, scores);
  }

  const aggregations: EffectivenessAggregation[] = [];
  for (const [groupKey, scores] of groups) {
    aggregations.push({
      groupKey,
      averageScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
      threadCount: scores.length,
      worstScore: Math.min(...scores),
      bestScore: Math.max(...scores),
    });
  }

  return aggregations;
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function computeSignals(
  thread: CaseCommunicationThread,
  sla: CommunicationSla,
): EffectivenessSignals {
  return {
    responseTime: computeResponseTimeSignal(thread, sla),
    resolutionSpeed: computeResolutionSpeedSignal(thread),
    escalationRate: computeEscalationRateSignal(thread),
    stakeholderEngagement: computeStakeholderEngagementSignal(thread),
    intentAlignment: computeIntentAlignmentSignal(thread),
    channelEfficiency: computeChannelEfficiencySignal(thread),
  };
}

function computeWeightedScore(signals: EffectivenessSignals): number {
  const raw =
    signals.responseTime * EFFECTIVENESS_WEIGHTS.responseTime +
    signals.resolutionSpeed * EFFECTIVENESS_WEIGHTS.resolutionSpeed +
    signals.escalationRate * EFFECTIVENESS_WEIGHTS.escalationRate +
    signals.stakeholderEngagement * EFFECTIVENESS_WEIGHTS.stakeholderEngagement +
    signals.intentAlignment * EFFECTIVENESS_WEIGHTS.intentAlignment +
    signals.channelEfficiency * EFFECTIVENESS_WEIGHTS.channelEfficiency;

  return clamp(Math.round(raw), 0, 100);
}

function computeResponseTimeSignal(thread: CaseCommunicationThread, sla: CommunicationSla): number {
  // If no response yet, check if SLA breached
  if (!thread.lastResponseAt) {
    return thread.communicationSla.breached ? 0 : 50;
  }

  const sentTime = new Date(thread.sentAt).getTime();
  const responseTime = new Date(thread.lastResponseAt).getTime();
  const responseHours = (responseTime - sentTime) / (1000 * 60 * 60);
  const targetHours = sla.targetResponseHours;

  if (responseHours <= 0) return 100;
  if (responseHours <= targetHours * 0.5) return 100;
  if (responseHours <= targetHours) return 80;
  if (responseHours <= targetHours * 1.5) return 50;
  if (responseHours <= targetHours * 2) return 25;
  return 0;
}

function computeResolutionSpeedSignal(thread: CaseCommunicationThread): number {
  // Closed threads with low message count = efficient resolution
  if (thread.status === 'closed') {
    if (thread.messageCount <= 3) return 100;
    if (thread.messageCount <= 5) return 80;
    if (thread.messageCount <= 10) return 60;
    return 40;
  }
  // Still open — partial credit based on status
  if (thread.status === 'responded') return 70;
  if (thread.status === 'awaiting_response') return 50;
  if (thread.status === 'stale') return 20;
  if (thread.status === 'escalated') return 30;
  return 50;
}

function computeEscalationRateSignal(thread: CaseCommunicationThread): number {
  // 0 escalations = 100, each escalation reduces by 30
  return clamp(100 - thread.escalationCount * 30, 0, 100);
}

function computeStakeholderEngagementSignal(thread: CaseCommunicationThread): number {
  // More participants engaged and messages = higher engagement
  const participantScore = Math.min(thread.participants.length * 25, 100);
  const messageScore = Math.min(thread.messageCount * 15, 100);
  return clamp(Math.round((participantScore + messageScore) / 2), 0, 100);
}

function computeIntentAlignmentSignal(thread: CaseCommunicationThread): number {
  // Threads that reached responded/closed aligned with communication intent
  if (thread.status === 'closed') return 100;
  if (thread.status === 'responded') return 90;
  if (thread.status === 'awaiting_response') return 70;
  if (thread.status === 'initiated') return 60;
  if (thread.status === 'escalated') return 40;
  if (thread.status === 'stale') return 20;
  return 50;
}

function computeChannelEfficiencySignal(thread: CaseCommunicationThread): number {
  // Teams = fast for approvals (high efficiency)
  // Email = standard communication
  // War room = heavy collaboration (appropriate for complex cases)
  if (thread.channel === 'teams') return 90;
  if (thread.channel === 'email') return 75;
  if (thread.channel === 'war_room') return 70;
  return 50;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
