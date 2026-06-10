/**
 * Finding Entity — Commander C2 Canonical Model
 *
 * Source: Spec #34 Drift and Rule Engine
 *
 * A Finding is the canonical output of the rule-execution engine: a time-bound,
 * confidence-weighted observation that a drift/detection rule matched against a
 * tenant context. Findings carry a deduplication key, an affected-entity
 * reference, proposed (non-executing) actions, and a system-owned lifecycle.
 *
 * Doctrine:
 * - Findings are system-emitted. Commander does not write SOC detections; it
 *   evaluates drift rules over canonical signal and records Findings (SOC
 *   boundary, Assertion 8).
 * - proposedActions are recommendations only — they are not executed by the
 *   engine (AI/automation grounding; Assertion 11 verdict semantics preserved).
 *
 * Domain: D-04 (Drift & Rule Engine)
 * Use Cases: UC-169 (execute rules → emit findings), UC-170 (suppress/dedupe),
 *            UC-173 (manage finding lifecycle)
 * Route: /platform/rules
 */

import type { CommonFields } from './common';

// ─── Finding Status (system-owned lifecycle) ─────────────────────────────────

export const FINDING_STATUSES = [
  'new',
  'acknowledged',
  'suppressed',
  'resolved',
  'false_positive',
] as const;
export type FindingStatus = typeof FINDING_STATUSES[number];

// ─── Affected Entity Type ────────────────────────────────────────────────────

export const AFFECTED_ENTITY_TYPES = [
  'asset',
  'identity',
  'control',
  'vulnerability',
  'exposure',
  'connector',
  'tenant',
] as const;
export type AffectedEntityType = typeof AFFECTED_ENTITY_TYPES[number];

// ─── Proposed Action (recommendation only — never auto-executed) ─────────────

export const PROPOSED_ACTION_TYPES = [
  'create-case',
  'enrich-case',
  'notify',
  'raise-priority',
  'open-investigation',
  'request-verdict',
  'recommend-remediation',
] as const;
export type ProposedActionType = typeof PROPOSED_ACTION_TYPES[number];

export interface ProposedAction {
  /** Unique action identifier within the finding */
  actionId: string;
  /** What the action proposes (recommendation, not executed by the engine) */
  actionType: ProposedActionType;
  /** Human-readable description of the proposed action */
  description: string;
  /** Whether the action is eligible for automation (subject to approval chain) */
  automated: boolean;
  /** Optional reference to the entity the action targets */
  targetRef?: string;
}

// ─── Finding Entity ──────────────────────────────────────────────────────────

export interface Finding extends CommonFields {
  entityType: 'finding';
  /** Unique finding identifier */
  findingId: string;
  /** Reference to the rule (RuleDefinition) that produced this finding */
  ruleRef: string;
  /** Tenant this finding belongs to (tenant-scoped, v1.3 Req 7) */
  tenantId: string;
  /** Severity when matched (1–5) */
  severity: number;
  /** Confidence in the match (0–100) */
  confidence: number;
  /** Deduplication key — identical keys collapse to a single active finding */
  dedupeKey: string;
  /** Kind of entity affected by the finding */
  affectedEntityType: AffectedEntityType;
  /** Canonical reference to the affected entity */
  affectedEntityRef: string;
  /** Recommended actions (never executed by the engine) */
  proposedActions: ProposedAction[];
  /** System-owned lifecycle status */
  status: FindingStatus;
  /** When the finding was detected */
  detectedAt: string;
  /** When the finding was resolved (if resolved) */
  resolvedAt?: string;
  /** Reason recorded when the finding was suppressed */
  suppressionReason?: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface FindingValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Finding entity for structural correctness.
 */
export function validateFinding(finding: Finding): FindingValidation {
  const errors: string[] = [];

  if (!finding.id || finding.id.trim() === '') {
    errors.push('id: required');
  }
  if (!finding.tenant || !finding.tenant.tenantId || finding.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!finding.findingId || finding.findingId.trim() === '') {
    errors.push('findingId: required');
  }
  if (!finding.ruleRef || finding.ruleRef.trim() === '') {
    errors.push('ruleRef: required');
  }
  if (!finding.tenantId || finding.tenantId.trim() === '') {
    errors.push('tenantId: required');
  }
  if (typeof finding.severity !== 'number' || finding.severity < 1 || finding.severity > 5) {
    errors.push('severity: must be a number between 1 and 5');
  }
  if (typeof finding.confidence !== 'number' || finding.confidence < 0 || finding.confidence > 100) {
    errors.push('confidence: must be a number between 0 and 100');
  }
  if (!finding.dedupeKey || finding.dedupeKey.trim() === '') {
    errors.push('dedupeKey: required');
  }
  if (!AFFECTED_ENTITY_TYPES.includes(finding.affectedEntityType)) {
    errors.push(`affectedEntityType: must be one of: ${AFFECTED_ENTITY_TYPES.join(', ')}`);
  }
  if (!finding.affectedEntityRef || finding.affectedEntityRef.trim() === '') {
    errors.push('affectedEntityRef: required');
  }
  if (!Array.isArray(finding.proposedActions)) {
    errors.push('proposedActions: must be an array');
  } else {
    for (const action of finding.proposedActions) {
      if (!action.actionId || action.actionId.trim() === '') {
        errors.push('proposedActions[].actionId: required');
      }
      if (!PROPOSED_ACTION_TYPES.includes(action.actionType)) {
        errors.push(`proposedActions[].actionType: must be one of: ${PROPOSED_ACTION_TYPES.join(', ')}`);
      }
      if (typeof action.automated !== 'boolean') {
        errors.push('proposedActions[].automated: must be a boolean');
      }
    }
  }
  if (!FINDING_STATUSES.includes(finding.status)) {
    errors.push(`status: must be one of: ${FINDING_STATUSES.join(', ')}`);
  }
  if (!finding.detectedAt || finding.detectedAt.trim() === '') {
    errors.push('detectedAt: required');
  }
  if (finding.status === 'suppressed' && (!finding.suppressionReason || finding.suppressionReason.trim() === '')) {
    errors.push('suppressionReason: required when status is "suppressed"');
  }

  return { valid: errors.length === 0, errors };
}
