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
  ruleRef: string;
  decisionRef: string;
  confidence: number;
  decidedAt: string;
  outputAction: string;
}

export interface EngineOutput {
  engineRef: string;
  decisionRef: string;
  confidence: number;
  decidedAt: string;
  outputAction: string;
  rationale: string;
}

export interface HumanReadableExplanation {
  summary: string;
  factors: Array<{ name: string; value: string; weight: number; contribution: string }>;
  confidence: number;
  decidedBy: string;
  overridden: boolean;
  overrideReason?: string;
}

export interface DecisionExplanation {
  caseRef: string;
  totalDecisions: number;
  decisions: DecisionRecord[];
  ruleHits: RuleHit[];
  engineOutputs: EngineOutput[];
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Explain all decisions associated with a case.
 */
export function explainDecision(caseRef: string, allRecords: DecisionRecord[]): DecisionExplanation {
  const decisions = allRecords.filter((r) => r.caseRef === caseRef);
  return {
    caseRef,
    totalDecisions: decisions.length,
    decisions,
    ruleHits: traceRuleHits(caseRef, allRecords),
    engineOutputs: traceEngineOutputs(caseRef, allRecords),
  };
}

/**
 * Extract rule-hit decisions for a case.
 */
export function traceRuleHits(caseRef: string, allRecords: DecisionRecord[]): RuleHit[] {
  return allRecords
    .filter((r) => r.caseRef === caseRef && r.decisionType === 'rule_hit' && r.ruleRef)
    .map((r) => ({
      ruleRef: r.ruleRef!,
      decisionRef: r.recordId,
      confidence: r.confidence,
      decidedAt: r.decidedAt,
      outputAction: r.outputAction,
    }));
}

/**
 * Extract engine-output decisions for a case.
 */
export function traceEngineOutputs(caseRef: string, allRecords: DecisionRecord[]): EngineOutput[] {
  return allRecords
    .filter((r) => r.caseRef === caseRef && r.decisionType === 'engine_output' && r.engineRef)
    .map((r) => ({
      engineRef: r.engineRef!,
      decisionRef: r.recordId,
      confidence: r.confidence,
      decidedAt: r.decidedAt,
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
    decidedBy: decision.decidedBy,
    overridden: decision.overridden,
    overrideReason: decision.overrideReason,
  };
}
