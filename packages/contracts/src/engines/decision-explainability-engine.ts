/**
 * Decision Explainability Engine — Commander C2 (Spec 36)
 *
 * Source: Spec #36 Rule/Model/Decision Governance Surface
 *
 * Provides full traceability for any system decision: which rules fired, which
 * engines contributed, what factors weighted the outcome, and a human-readable
 * rationale rendering.
 *
 * Pure functions over DecisionRecord data — no I/O.
 *
 * Domain: D-04 (Drift & Rule Engine)
 * Use Cases: UC-175 (explain decision), UC-178 (decision audit per case)
 */

import type { DecisionRecord, DecisionFactor } from '../entities/decision-record';

// ─── Output Types ────────────────────────────────────────────────────────────

export interface RuleHit {
  rule_ref: string;
  decision_ref: string;
  confidence: number;
  decided_at: string;
  outputAction: string;
}

export interface EngineOutput {
  engine_ref: string;
  decision_ref: string;
  confidence: number;
  decided_at: string;
  outputAction: string;
  rationale: string;
}

export interface HumanReadableExplanation {
  summary: string;
  factors: Array<{ name: string; value: string; weight: number; contribution: string }>;
  confidence: number;
  decided_by: string;
  overridden: boolean;
  override_reason?: string;
}

export interface DecisionExplanation {
  case_ref: string;
  totalDecisions: number;
  decisions: DecisionRecord[];
  ruleHits: RuleHit[];
  engineOutputs: EngineOutput[];
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Explain all decisions associated with a case.
 */
export function explainDecision(case_ref: string, allRecords: DecisionRecord[]): DecisionExplanation {
  const decisions = allRecords.filter((r) => r.case_ref === caseRef);
  return {
    case_ref,
    totalDecisions: decisions.length,
    decisions,
    ruleHits: traceRuleHits(caseRef, allRecords),
    engineOutputs: traceEngineOutputs(caseRef, allRecords),
  };
}

/**
 * Extract rule-hit decisions for a case.
 */
export function traceRuleHits(case_ref: string, allRecords: DecisionRecord[]): RuleHit[] {
  return allRecords
    .filter((r) => r.case_ref === caseRef && r.decision_type === 'rule_hit' && r.rule_ref)
    .map((r) => ({
      rule_ref: r.rule_ref!,
      decision_ref: r.recordId,
      confidence: r.confidence,
      decided_at: r.decided_at,
      outputAction: r.outputAction,
    }));
}

/**
 * Extract engine-output decisions for a case.
 */
export function traceEngineOutputs(case_ref: string, allRecords: DecisionRecord[]): EngineOutput[] {
  return allRecords
    .filter((r) => r.case_ref === caseRef && r.decision_type === 'engine_output' && r.engine_ref)
    .map((r) => ({
      engine_ref: r.engine_ref!,
      decision_ref: r.recordId,
      confidence: r.confidence,
      decided_at: r.decided_at,
      outputAction: r.outputAction,
      rationale: r.rationale,
    }));
}

/**
 * Render a decision into a human-readable explanation object.
 */
export function renderRationale(decision: DecisionRecord): HumanReadableExplanation {
  const factors = decision.inputFactors.map((f: DecisionFactor) => ({
    name: f.factorName,
    value: f.factorValue,
    weight: f.weight,
    contribution: `${(f.weight * 100).toFixed(0)}% from ${f.source}`,
  }));

  return {
    summary: decision.rationale,
    factors,
    confidence: decision.confidence,
    decided_by: decision.decided_by,
    overridden: decision.overridden,
    override_reason: decision.override_reason,
  };
}
