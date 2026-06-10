/**
 * War Room AI Orientation Contract — Commander C2
 *
 * Source: WRCEP-1.0 War Room Communication Excellence Proposal (Phase 1)
 *
 * Pure functions for generating AI orientation briefings in War Room context.
 * System actor name: 'war-room-ai-engine' (NOT commander-ai-triage)
 *
 * Constraints:
 * - AI outputs are recommendations requiring approval — never auto-execute
 * - Confidence labels based on source count (HIGH/MEDIUM/LOW)
 * - All delivery modelled as intent/status (Phase 1)
 * - No live integrations
 */

import type { WarRoom } from '../contracts/src/entities/war-room';

// ─── System Actor ────────────────────────────────────────────────────────────

export const WAR_ROOM_AI_ACTOR = 'war-room-ai-engine' as const;

// ─── Confidence Labelling ────────────────────────────────────────────────────

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Derive confidence level from source count.
 * - HIGH: 3+ independent sources
 * - MEDIUM: 2 sources
 * - LOW: 1 or 0 sources
 */
export function deriveConfidence(sourceCount: number): ConfidenceLevel {
  if (sourceCount >= 3) return 'HIGH';
  if (sourceCount >= 2) return 'MEDIUM';
  return 'LOW';
}

// ─── Input Shapes ────────────────────────────────────────────────────────────

export interface OrientationCaseSummary {
  caseId: string;
  caseRef: string;
  status: string;
  priority: string;
  title: string;
  caseType: string;
}

export interface OrientationRiskObject {
  id: string;
  type: string;
  title: string;
  severity: string;
  affectedEntities: string[];
}

export interface OrientationIntelligence {
  kevListed?: boolean;
  epssScore?: number;
  cvssScore?: number;
  attackVector?: string;
  exploitMaturity?: string;
  automatable?: boolean;
  sourceCount: number;
}

export interface OrientationPrioritySignal {
  priority: string;
  urgencyLevel: string;
  score: number;
}

// ─── Orientation Briefing Value Object ───────────────────────────────────────

export interface ExploitAnalysis {
  technique: string;
  maturity: string;
  kev: boolean;
  epss: number;
  automatable: boolean;
  attackVector: string;
}

export interface BlastRadius {
  directlyAffected: number;
  lateralReach: number;
  identityExposure: number;
  dataAtRisk: number;
  score: number;
}

export interface RecommendedAction {
  description: string;
  priority: string;
  requiresApproval: boolean;
}

export interface UncertaintyGap {
  area: string;
  description: string;
  confidence: ConfidenceLevel;
  sourceCount: number;
}

export interface OrientationBriefing {
  whatHappened: string;
  exploitAnalysis: ExploitAnalysis;
  blastRadius: BlastRadius;
  actionsTaken: string[];
  pendingActions: string[];
  recommendedActions: RecommendedAction[];
  uncertaintyGaps: UncertaintyGap[];
  generatedAt: string;
  version: number;
}

// ─── Briefing Generation ─────────────────────────────────────────────────────

/**
 * Generate an AI orientation briefing for a War Room.
 *
 * All recommended actions are labelled as recommendations requiring approval.
 * Confidence levels are derived from source counts.
 *
 * @param warRoom - Current War Room state
 * @param cases - Bound cases
 * @param riskObjects - Associated risk objects
 * @param intelligence - Optional intelligence context
 * @param prioritySignal - Optional priority signal
 */
export function generateOrientationBriefing(
  warRoom: WarRoom,
  cases: OrientationCaseSummary[],
  riskObjects: OrientationRiskObject[],
  intelligence?: OrientationIntelligence,
  prioritySignal?: OrientationPrioritySignal,
): OrientationBriefing {
  // Summarise what happened
  const caseDescriptions = cases.map((c) => `${c.caseRef} (${c.caseType}, ${c.priority})`);
  const whatHappened = `War Room '${warRoom.warRoomRef}' activated for ${cases.length} case(s): ${caseDescriptions.join(', ')}. Activation reason: ${warRoom.activationReason}`;

  // Exploit analysis
  const exploitAnalysis: ExploitAnalysis = {
    technique: riskObjects.length > 0 ? riskObjects[0].type : 'unknown',
    maturity: intelligence?.exploitMaturity ?? 'unknown',
    kev: intelligence?.kevListed ?? false,
    epss: intelligence?.epssScore ?? 0,
    automatable: intelligence?.automatable ?? false,
    attackVector: intelligence?.attackVector ?? 'unknown',
  };

  // Blast radius
  const allAffected = riskObjects.flatMap((r) => r.affectedEntities);
  const uniqueAffected = [...new Set(allAffected)];
  const blastRadius: BlastRadius = {
    directlyAffected: uniqueAffected.length,
    lateralReach: Math.min(uniqueAffected.length * 2, 100), // Estimate
    identityExposure: riskObjects.filter((r) => r.type === 'identity').length,
    dataAtRisk: riskObjects.filter((r) => r.severity === 'critical').length,
    score: Math.min(uniqueAffected.length * 10, 100),
  };

  // Recommended actions (all require approval)
  const recommendedActions: RecommendedAction[] = [];
  if (intelligence?.kevListed) {
    recommendedActions.push({
      description: 'Prioritise patching for KEV-listed vulnerability',
      priority: 'P0',
      requiresApproval: true,
    });
  }
  if (intelligence?.automatable) {
    recommendedActions.push({
      description: 'Assess automated exploitation risk and implement compensating controls',
      priority: 'P0',
      requiresApproval: true,
    });
  }
  if (blastRadius.score >= 50) {
    recommendedActions.push({
      description: 'Initiate containment for high blast radius incident',
      priority: 'P0',
      requiresApproval: true,
    });
  }

  // Uncertainty gaps
  const uncertaintyGaps: UncertaintyGap[] = [];
  const sourceCount = intelligence?.sourceCount ?? 0;
  if (sourceCount < 3) {
    uncertaintyGaps.push({
      area: 'Intelligence coverage',
      description: `Only ${sourceCount} intelligence source(s) available. Assessment confidence limited.`,
      confidence: deriveConfidence(sourceCount),
      sourceCount,
    });
  }
  if (!intelligence?.exploitMaturity || intelligence.exploitMaturity === 'unknown') {
    uncertaintyGaps.push({
      area: 'Exploit maturity',
      description: 'Exploit maturity not confirmed. May be higher than assessed.',
      confidence: 'LOW',
      sourceCount: 0,
    });
  }

  return {
    whatHappened,
    exploitAnalysis,
    blastRadius,
    actionsTaken: [],
    pendingActions: cases.filter((c) => c.status === 'in_progress').map((c) => `Case ${c.caseRef}: in progress`),
    recommendedActions,
    uncertaintyGaps,
    generatedAt: new Date().toISOString(),
    version: 1,
  };
}

// ─── Incremental Update ──────────────────────────────────────────────────────

export interface OrientationEvent {
  type: 'action_completed' | 'new_intelligence' | 'case_status_change' | 'escalation';
  description: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

/**
 * Update an existing briefing based on a new event (immutable).
 *
 * @param existingBriefing - Current briefing state
 * @param event - New event to incorporate
 */
export function updateBriefingOnEvent(
  existingBriefing: OrientationBriefing,
  event: OrientationEvent,
): OrientationBriefing {
  const updated: OrientationBriefing = {
    ...existingBriefing,
    version: existingBriefing.version + 1,
    generatedAt: event.timestamp,
  };

  switch (event.type) {
    case 'action_completed':
      updated.actionsTaken = [...existingBriefing.actionsTaken, event.description];
      updated.pendingActions = existingBriefing.pendingActions.filter((a) => a !== event.description);
      break;
    case 'new_intelligence':
      // Reduce uncertainty gaps if new intelligence arrives
      updated.uncertaintyGaps = existingBriefing.uncertaintyGaps.map((gap) => {
        if (gap.area === 'Intelligence coverage') {
          const newSourceCount = gap.sourceCount + 1;
          return {
            ...gap,
            sourceCount: newSourceCount,
            confidence: deriveConfidence(newSourceCount),
            description: `${newSourceCount} intelligence source(s) available.`,
          };
        }
        return gap;
      });
      break;
    case 'case_status_change':
      updated.pendingActions = [...existingBriefing.pendingActions, event.description];
      break;
    case 'escalation':
      updated.recommendedActions = [
        ...existingBriefing.recommendedActions,
        { description: event.description, priority: 'P0', requiresApproval: true },
      ];
      break;
  }

  return updated;
}
