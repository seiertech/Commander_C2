/**
 * Verdict Pattern Case Entity — Commander C2 Canonical Model
 *
 * Source: Spec #41 Internal Risk Investigation Sub-Lifecycle
 *
 * A VerdictPatternCase tracks the lifecycle of surfacing a verdict pattern to
 * a customer for investigation. Commander SURFACES — it does not INVESTIGATE
 * (SOC boundary, Assertion 8). The lifecycle phases are:
 *   surface → triage → routing → customer_investigation → outcome → closure
 *
 * Domain: D-07 (Identity Intelligence)
 * Use Cases: UC-192 (surface), UC-193 (triage), UC-194 (route),
 *            UC-195 (hand off), UC-196 (record outcome), UC-197 (jurisdiction),
 *            UC-198 (audit access-of-access), UC-199 (enforce boundary)
 * Route: /identity/internal-risk
 */

import type { CommonFields } from './common';

// ─── Pattern Type ────────────────────────────────────────────────────────────

export const PATTERN_TYPES = [
  'access_anomaly',
  'privilege_misuse',
  'data_exfiltration',
  'policy_violation',
  'behavioural_deviation',
] as const;
export type PatternType = typeof PATTERN_TYPES[number];

// ─── Phase (lifecycle state machine) ─────────────────────────────────────────

export const VERDICT_PATTERN_PHASES = [
  'surface',
  'triage',
  'routing',
  'customer_investigation',
  'outcome',
  'closure',
] as const;
export type VerdictPatternPhase = typeof VERDICT_PATTERN_PHASES[number];

// ─── Outcome Category ────────────────────────────────────────────────────────

export const OUTCOME_CATEGORIES = [
  'no_issue',
  'issue_addressed',
  'ongoing_concern',
  'privileged_outcome',
] as const;
export type OutcomeCategory = typeof OUTCOME_CATEGORIES[number];

// ─── Evidence Grade ──────────────────────────────────────────────────────────

export const EVIDENCE_GRADES = ['intelligence', 'investigation'] as const;
export type EvidenceGrade = typeof EVIDENCE_GRADES[number];

// ─── Verdict Pattern Case Entity ─────────────────────────────────────────────

export interface VerdictPatternCase extends CommonFields {
  entityType: 'verdict-pattern-case';
  /** Unique pattern identifier */
  patternId: string;
  /** Identity reference exhibiting the pattern */
  identityRef: string;
  /** Type of behavioural pattern */
  patternType: PatternType;
  /** Severity (1–5) */
  severity: number;
  /** Verdict dispositions from source tools */
  dispositions: string[];
  /** Current lifecycle phase */
  phase: VerdictPatternPhase;
  /** When the pattern was surfaced */
  surfacedAt: string;
  /** When triage was completed */
  triagedAt?: string;
  /** When routing was completed */
  routedAt?: string;
  /** When handoff to customer occurred */
  handedOffAt?: string;
  /** When the customer recorded the outcome */
  outcomeRecordedAt?: string;
  /** When the case was closed */
  closedAt?: string;
  /** Outcome category (null until recorded) */
  outcomeCategory: OutcomeCategory | null;
  /** Who the investigation was handed off to */
  handoffRecipient?: string;
  /** Evidence grade boundary */
  evidenceGrade: EvidenceGrade;
  /** Jurisdiction reference (optional) */
  jurisdictionRef?: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface VerdictPatternCaseValidation {
  valid: boolean;
  errors: string[];
}

export function validateVerdictPatternCase(c: VerdictPatternCase): VerdictPatternCaseValidation {
  const errors: string[] = [];

  if (!c.id || c.id.trim() === '') errors.push('id: required');
  if (!c.tenant || !c.tenant.tenantId) errors.push('tenant.tenantId: required');
  if (!c.patternId || c.patternId.trim() === '') errors.push('patternId: required');
  if (!c.identityRef || c.identityRef.trim() === '') errors.push('identityRef: required');
  if (!PATTERN_TYPES.includes(c.patternType)) {
    errors.push(`patternType: must be one of: ${PATTERN_TYPES.join(', ')}`);
  }
  if (typeof c.severity !== 'number' || c.severity < 1 || c.severity > 5) errors.push('severity: must be 1–5');
  if (!Array.isArray(c.dispositions)) errors.push('dispositions: must be an array');
  if (!VERDICT_PATTERN_PHASES.includes(c.phase)) {
    errors.push(`phase: must be one of: ${VERDICT_PATTERN_PHASES.join(', ')}`);
  }
  if (!c.surfacedAt || c.surfacedAt.trim() === '') errors.push('surfacedAt: required');
  if (!EVIDENCE_GRADES.includes(c.evidenceGrade)) {
    errors.push(`evidenceGrade: must be one of: ${EVIDENCE_GRADES.join(', ')}`);
  }
  if (c.outcomeCategory !== null && !OUTCOME_CATEGORIES.includes(c.outcomeCategory)) {
    errors.push(`outcomeCategory: must be one of: ${OUTCOME_CATEGORIES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
