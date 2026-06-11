/**
 * Decision Record Entity — Commander C2 Canonical Model
 *
 * Source: Spec #36 Rule/Model/Decision Governance Surface
 *
 * A DecisionRecord captures any system decision with full rationale: what was
 * decided, by whom (system or analyst), what inputs drove it, and what action
 * resulted. This is the canonical explainability artefact for governance audit.
 *
 * Domain: D-04 (Drift & Rule Engine)
 * Use Cases: UC-175 (explain decision), UC-178 (decision audit per case)
 * Route: /governance/decisions
 */

import type { CommonFields } from './common';

// ─── Decision Type ───────────────────────────────────────────────────────────

export const DECISION_TYPES = [
  'rule_hit',
  'engine_output',
  'ai_recommendation',
  'strategy_application',
  'suppression',
  'escalation',
] as const;
export type DecisionType = typeof DECISION_TYPES[number];

// ─── Decision Factor ─────────────────────────────────────────────────────────

export interface DecisionFactor {
  /** Name of the factor */
  factorName: string;
  /** Value of the factor at decision time */
  factorValue: string;
  /** Relative weight of this factor in the decision (0–1) */
  weight: number;
  /** Source that provided this factor */
  source: string;
}

// ─── Decision Record Entity ──────────────────────────────────────────────────

export interface DecisionRecord extends CommonFields {
  entity_type: 'decision-record';
  /** Unique decision record identifier */
  recordId: string;
  /** Case this decision relates to */
  case_ref: string;
  /** Rule that triggered this decision (optional) */
  rule_ref?: string;
  /** Engine that produced this decision (optional) */
  engine_ref?: string;
  /** Type of decision */
  decision_type: DecisionType;
  /** Human-readable rationale */
  rationale: string;
  /** Input factors that drove the decision */
  inputFactors: DecisionFactor[];
  /** Resulting action */
  outputAction: string;
  /** Confidence in the decision (0–100) */
  confidence: number;
  /** When the decision was made */
  decided_at: string;
  /** Who made the decision */
  decided_by: 'system' | 'analyst';
  /** Whether this decision was subsequently overridden */
  overridden: boolean;
  /** Reason for override (required when overridden) */
  override_reason?: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface DecisionRecordValidation {
  valid: boolean;
  errors: string[];
}

export function validateDecisionRecord(record: DecisionRecord): DecisionRecordValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') errors.push('id: required');
  if (!record.tenant || !record.tenant.tenant_id) errors.push('tenant.tenant_id: required');
  if (!record.recordId || record.recordId.trim() === '') errors.push('recordId: required');
  if (!record.case_ref || record.case_ref.trim() === '') errors.push('case_ref: required');
  if (!DECISION_TYPES.includes(record.decision_type)) {
    errors.push(`decision_type: must be one of: ${DECISION_TYPES.join(', ')}`);
  }
  if (!record.rationale || record.rationale.trim() === '') errors.push('rationale: required');
  if (!Array.isArray(record.inputFactors)) {
    errors.push('inputFactors: must be an array');
  } else {
    for (const f of record.inputFactors) {
      if (!f.factorName || f.factorName.trim() === '') errors.push('inputFactors[].factorName: required');
      if (typeof f.weight !== 'number' || f.weight < 0 || f.weight > 1) errors.push('inputFactors[].weight: must be 0–1');
    }
  }
  if (!record.outputAction || record.outputAction.trim() === '') errors.push('outputAction: required');
  if (typeof record.confidence !== 'number' || record.confidence < 0 || record.confidence > 100) {
    errors.push('confidence: must be 0–100');
  }
  if (!record.decided_at || record.decided_at.trim() === '') errors.push('decided_at: required');
  if (record.decided_by !== 'system' && record.decided_by !== 'analyst') errors.push('decided_by: must be system or analyst');
  if (record.overridden && (!record.override_reason || record.override_reason.trim() === '')) {
    errors.push('override_reason: required when overridden');
  }

  return { valid: errors.length === 0, errors };
}
