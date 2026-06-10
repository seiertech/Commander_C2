/**
 * Case Transition Audit Entity — Commander SDR Canonical Model
 *
 * Source: Spec #06 Domain Requirements Req 6
 *
 * Structured audit trail for case lifecycle state transitions.
 * Extends the generic audit-event pattern with case-specific transition
 * metadata: from/to states, triggering actor, gates passed, and rationale.
 *
 * Constraints:
 * - Immutable once recorded (audit integrity)
 * - System-owned transitions only (Doctrine Assertion 1 — closed-loop)
 * - Every 12-state transition must produce one record
 */

import type { CommonFields } from './common';
import type { AuditActor } from './audit-event';
import type { CaseStatus } from './case';

// ─── Transition Trigger ──────────────────────────────────────────────────────

export const TRANSITION_TRIGGERS = ['engine', 'rule', 'strategy', 'escalation'] as const;
export type TransitionTrigger = typeof TRANSITION_TRIGGERS[number];

// ─── Case Transition Audit Entity ────────────────────────────────────────────

export interface CaseTransitionAudit extends CommonFields {
  entityType: 'case-transition-audit';
  /** Case being transitioned */
  caseRef: string;
  /** Source lifecycle state */
  fromState: CaseStatus;
  /** Target lifecycle state */
  toState: CaseStatus;
  /** Who/what triggered the transition */
  actor: AuditActor;
  /** Machine-readable rationale */
  reason: string;
  /** What triggered this transition */
  triggeredBy: TransitionTrigger;
  /** Gates that were verified before allowing transition */
  gatesPassed: string[];
  /** When the transition occurred */
  transitionedAt: string;
  /** Immutable audit record flag */
  immutable: true;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface CaseTransitionAuditValidation {
  valid: boolean;
  errors: string[];
}

export function validateCaseTransitionAudit(record: CaseTransitionAudit): CaseTransitionAuditValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') errors.push('id: required');
  if (!record.tenant || !record.tenant.tenantId) errors.push('tenant.tenantId: required');
  if (!record.caseRef || record.caseRef.trim() === '') errors.push('caseRef: required');
  if (!record.fromState) errors.push('fromState: required');
  if (!record.toState) errors.push('toState: required');
  if (!record.actor || !record.actor.type) errors.push('actor: required');
  if (!record.reason || record.reason.trim() === '') errors.push('reason: required');
  if (!record.triggeredBy || !TRANSITION_TRIGGERS.includes(record.triggeredBy)) errors.push(`triggeredBy: must be one of: ${TRANSITION_TRIGGERS.join(', ')}`);
  if (!Array.isArray(record.gatesPassed)) errors.push('gatesPassed: must be an array');
  if (!record.transitionedAt || record.transitionedAt.trim() === '') errors.push('transitionedAt: required');
  if (record.immutable !== true) errors.push('immutable: must be true');

  return { valid: errors.length === 0, errors };
}
