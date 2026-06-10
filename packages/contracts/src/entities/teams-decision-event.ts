/**
 * Teams Decision Event — Commander C2 Canonical Entity
 *
 * Communications Excellence Phase 1 data-layer.
 * Represents a decision request/response cycle through Microsoft Teams.
 *
 * Constraints:
 * - Teams decisions flow through Commander: Teams posts request → human responds
 *   → Commander validates actor authority → Commander executes transition
 * - Teams bot NEVER directly mutates case state
 * - No live Teams bot (Phase 1)
 * - validatedByCommander and executedByCommander track Commander's authority gate
 */

import type { CommonFields } from './common';

// ─── Teams Decision Event Types ──────────────────────────────────────────────

export const TEAMS_REQUEST_TYPES = [
  'approval',
  'validation_confirmation',
  'action_override',
  'resource_assignment',
  'escalation',
] as const;
export type TeamsRequestType = typeof TEAMS_REQUEST_TYPES[number];

export const TEAMS_DECISIONS = [
  'approved',
  'denied',
  'delegated',
  'confirmed',
  'disputed',
  'need_more_time',
] as const;
export type TeamsDecision = typeof TEAMS_DECISIONS[number];

// ─── Teams Decision Event Entity ─────────────────────────────────────────────

export interface TeamsDecisionEvent extends CommonFields {
  /** Event identifier */
  event_id: string;
  /** Tenant scope */
  tenant_id: string;
  /** Case this decision relates to */
  case_id: string;
  /** Type of request posted to Teams */
  requestType: TeamsRequestType;
  /** Reference to the posted Adaptive Card */
  cardId: string;
  /** When the request was posted */
  requested_at: string;
  /** When the response was received (null if pending) */
  respondedAt: string | null;
  /** Who responded (null if pending) */
  respondedBy: string | null;
  /** Decision made (null if pending) */
  decision: TeamsDecision | null;
  /** Whether Commander validated the actor's authority */
  validatedByCommander: boolean;
  /** Whether Commander executed the resulting action */
  executedByCommander: boolean;
  /** Reference to the audit event recording this decision */
  auditEventRef: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface TeamsDecisionEventValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a TeamsDecisionEvent for structural correctness.
 */
export function validateTeamsDecisionEvent(
  event: TeamsDecisionEvent,
): TeamsDecisionEventValidation {
  const errors: string[] = [];

  if (!event.id || event.id.trim() === '') {
    errors.push('id: required');
  }
  if (!event.tenant || !event.tenant.tenant_id || event.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }
  if (!event.event_id || event.event_id.trim() === '') {
    errors.push('event_id: required');
  }
  if (!event.tenant_id || event.tenant_id.trim() === '') {
    errors.push('tenant_id: required');
  }
  if (!event.case_id || event.case_id.trim() === '') {
    errors.push('case_id: required');
  }
  if (!event.requestType || !TEAMS_REQUEST_TYPES.includes(event.requestType)) {
    errors.push(`requestType: must be one of: ${TEAMS_REQUEST_TYPES.join(', ')}`);
  }
  if (!event.cardId || event.cardId.trim() === '') {
    errors.push('cardId: required');
  }
  if (!event.requested_at || event.requested_at.trim() === '') {
    errors.push('requested_at: required');
  }
  if (event.decision !== null && !TEAMS_DECISIONS.includes(event.decision)) {
    errors.push(`decision: must be one of: ${TEAMS_DECISIONS.join(', ')} or null`);
  }
  if (typeof event.validatedByCommander !== 'boolean') {
    errors.push('validatedByCommander: must be a boolean');
  }
  if (typeof event.executedByCommander !== 'boolean') {
    errors.push('executedByCommander: must be a boolean');
  }
  if (!event.auditEventRef || event.auditEventRef.trim() === '') {
    errors.push('auditEventRef: required');
  }

  return { valid: errors.length === 0, errors };
}
