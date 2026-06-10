/**
 * Intelligence_Assessment — Commander C2 Thesis Layer 3: Event & Intelligence
 *
 * Governed by: Thesis §7 — Event & Intelligence Layer
 * Purpose: NATO/Admiralty intelligence grading. Attaches confidence to uncertain
 * or OSINT-derived signals. Prevents all signals from being treated as equally trustworthy.
 *
 * Standard: NATO/Admiralty (source reliability A-F, information credibility 1-6)
 * Naming: snake_case (thesis-literal)
 */

// ─── Source Reliability (NATO/Admiralty A-F) ──────────────────────────────────

export const SOURCE_RELIABILITY_GRADES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export type SourceReliabilityGrade = typeof SOURCE_RELIABILITY_GRADES[number];

// A = Completely reliable
// B = Usually reliable
// C = Fairly reliable
// D = Not usually reliable
// E = Unreliable
// F = Reliability cannot be judged

// ─── Information Credibility (NATO/Admiralty 1-6) ────────────────────────────

export const INFORMATION_CREDIBILITY_GRADES = [1, 2, 3, 4, 5, 6] as const;
export type InformationCredibilityGrade = typeof INFORMATION_CREDIBILITY_GRADES[number];

// 1 = Confirmed by other sources
// 2 = Probably true
// 3 = Possibly true
// 4 = Doubtful
// 5 = Improbable
// 6 = Truth cannot be judged

// ─── Intelligence_Assessment Entity ──────────────────────────────────────────

export interface IntelligenceAssessment {
  /** Unique identifier */
  intelligence_assessment_id: string;
  /** Signal being graded */
  signal_id: string;
  /** Source reliability grade (A-F) */
  source_reliability: SourceReliabilityGrade;
  /** Information credibility grade (1-6) */
  information_credibility: InformationCredibilityGrade;
  /** Combined rating (e.g. "B2", "A1", "C4") */
  combined_rating: string;
  /** Analyst notes on grading rationale */
  analytic_note: string | null;
  /** Who performed the grading */
  graded_by: string;
  /** When grading was performed (ISO 8601) */
  graded_time: string;
  /** Governing standard */
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface IntelligenceAssessmentValidation {
  valid: boolean;
  errors: string[];
}

export function validate_intelligence_assessment(a: IntelligenceAssessment): IntelligenceAssessmentValidation {
  const errors: string[] = [];

  if (!a.intelligence_assessment_id || a.intelligence_assessment_id.trim() === '') errors.push('intelligence_assessment_id: required');
  if (!a.signal_id || a.signal_id.trim() === '') errors.push('signal_id: required');
  if (!(SOURCE_RELIABILITY_GRADES as readonly string[]).includes(a.source_reliability)) {
    errors.push('source_reliability: must be A | B | C | D | E | F');
  }
  if (!(INFORMATION_CREDIBILITY_GRADES as readonly number[]).includes(a.information_credibility)) {
    errors.push('information_credibility: must be 1 | 2 | 3 | 4 | 5 | 6');
  }
  if (!a.combined_rating || a.combined_rating.trim() === '') errors.push('combined_rating: required');
  if (!a.graded_by || a.graded_by.trim() === '') errors.push('graded_by: required');
  if (!a.graded_time || a.graded_time.trim() === '') errors.push('graded_time: required');
  if (!a.standard_marker || a.standard_marker.trim() === '') errors.push('standard_marker: required');

  return { valid: errors.length === 0, errors };
}
