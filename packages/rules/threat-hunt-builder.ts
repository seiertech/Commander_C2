/**
 * Threat Hunt Record Builder
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 14.1, 14.2, 14.3, 14.4
 *
 * Pure constructor with status lifecycle.
 * match_found/escalated emit case-link/enrichment bindings (no lifecycle bypass).
 */

import type { ThreatHuntRecord } from '../contracts/src/entities/threat-hunt-record';
import type { ThreatHuntStatus } from '../contracts/src/entities/intelligence-common';
import { THREAT_HUNT_STATUSES } from '../contracts/src/entities/intelligence-common';

/** Valid status transitions for threat hunts */
const HUNT_TRANSITIONS: Record<ThreatHuntStatus, ThreatHuntStatus[]> = {
  proposed: ['queued'],
  queued: ['running'],
  running: ['completed', 'no_match', 'match_found'],
  completed: ['escalated'],
  no_match: [],
  match_found: ['escalated'],
  escalated: [],
};

export interface BuildHuntInput {
  id: string;
  tenantId: string;
  triggeringIocId: string;
  triggeringMatchId: string;
  huntType: string;
  huntScope: string;
  assignedTo: string;
  proposedAt: string;
}

/**
 * Build a new Threat Hunt Record in 'proposed' state (Req 14.1).
 */
export function buildThreatHuntRecord(input: BuildHuntInput): ThreatHuntRecord {
  return {
    id: input.id,
    tenant: { tenantId: input.tenantId, tenantName: `Tenant ${input.tenantId}` },
    createdAt: input.proposedAt,
    updatedAt: input.proposedAt,
    source: {
      connectorId: 'threat-hunt-builder',
      importRunId: `hunt-run-${input.id}`,
      sourceSystem: 'intelligence-hunt',
      sourceTimestamp: input.proposedAt,
    },
    tenantId: input.tenantId,
    triggeringIocId: input.triggeringIocId,
    triggeringMatchId: input.triggeringMatchId,
    huntType: input.huntType,
    huntScope: input.huntScope,
    status: 'proposed',
    assignedTo: input.assignedTo,
    proposedAt: input.proposedAt,
    startedAt: null,
    completedAt: null,
    findingsRef: '',
  };
}

/**
 * Transition a threat hunt to a new status.
 * Returns the updated record or an error if the transition is invalid.
 */
export function transitionHuntStatus(
  hunt: ThreatHuntRecord,
  newStatus: ThreatHuntStatus,
  timestamp: string,
): { success: boolean; record: ThreatHuntRecord; error?: string } {
  if (!THREAT_HUNT_STATUSES.includes(newStatus)) {
    return { success: false, record: hunt, error: `Invalid status: ${newStatus}` };
  }

  const allowed = HUNT_TRANSITIONS[hunt.status];
  if (!allowed.includes(newStatus)) {
    return { success: false, record: hunt, error: `Cannot transition from ${hunt.status} to ${newStatus}` };
  }

  const updated: ThreatHuntRecord = { ...hunt, status: newStatus, updatedAt: timestamp };

  if (newStatus === 'running') {
    updated.startedAt = timestamp;
  }
  if (['completed', 'no_match', 'match_found'].includes(newStatus)) {
    updated.completedAt = timestamp;
  }

  return { success: true, record: updated };
}
