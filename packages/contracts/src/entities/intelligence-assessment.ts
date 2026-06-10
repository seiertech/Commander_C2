/**
 * Intelligence Assessment Entity — Commander C2
 *
 * Governed by: OCSF 1.3.0 + NATO/Admiralty Code + MITRE ATT&CK
 * OCSF Class: Incident Finding (class_uid: 2005)
 *
 * Purpose: A synthesised intelligence product combining multiple findings,
 * threat context, and ATT&CK mapping into an actionable assessment.
 * This is the highest-level analytical output in Commander's event model.
 *
 * Standards adherence:
 *   - OCSF field names EXACT per 1.3.0
 *   - NATO/Admiralty: source_reliability (A-F), information_credibility (1-6)
 *   - MITRE ATT&CK: full tactic/technique/sub-technique references
 *   - commander_ prefix on ALL extension fields
 */

import type { CommonFields } from './common';
import type {
  OcsfBaseEvent,
  OcsfSeverityId,
  NatoSourceReliability,
  NatoInformationCredibility,
  CommanderEventExtensions,
} from './ocsf-types';
import type { MitreAttackReference } from './finding-event';
import { computeTypeUid } from './ocsf-types';

// ─── Assessment Status ───────────────────────────────────────────────────────

export type AssessmentStatus = 'draft' | 'reviewed' | 'published' | 'superseded' | 'retracted';

// ─── Threat Level ────────────────────────────────────────────────────────────

export type ThreatLevel = 'negligible' | 'low' | 'moderate' | 'substantial' | 'severe' | 'critical';

// ─── Intelligence Assessment Entity ──────────────────────────────────────────

export interface IntelligenceAssessment extends CommonFields, OcsfBaseEvent, CommanderEventExtensions {
  entityType: 'intelligence-assessment';

  /** Unique assessment identifier */
  assessmentId: string;

  // ─── OCSF class identification (Incident Finding = 2005) ───────────
  /** Fixed: 2005 (Incident Finding) */
  class_uid: 2005;
  /** OCSF category: Findings = 2 */
  category_uid: 2;

  // ─── Assessment content ────────────────────────────────────────────
  /** Assessment title */
  title: string;
  /** Executive summary */
  summary: string;
  /** Detailed analysis */
  analysis: string;
  /** Assessment status */
  assessment_status: AssessmentStatus;
  /** Overall threat level */
  threat_level: ThreatLevel;

  // ─── NATO/Admiralty grading ────────────────────────────────────────
  /** Aggregated source reliability across all inputs */
  source_reliability: NatoSourceReliability;
  /** Aggregated information credibility */
  information_credibility: NatoInformationCredibility;

  // ─── Source findings ───────────────────────────────────────────────
  /** Finding event IDs that inform this assessment */
  source_finding_ids: string[];
  /** Signal IDs (transitive, for traceability) */
  source_signal_ids: string[];
  /** Total evidence items considered */
  evidence_count: number;

  // ─── MITRE ATT&CK ─────────────────────────────────────────────────
  /** All ATT&CK TTPs identified in this assessment */
  attack_references: MitreAttackReference[];
  /** Campaign or threat actor attribution (if known) */
  threat_actor: string | null;
  /** Campaign name (if attributed) */
  campaign: string | null;

  // ─── Impact & scope ────────────────────────────────────────────────
  /** Affected systems/resources */
  affected_resources: string[];
  /** Affected topology node IDs */
  commander_affected_node_ids: string[];
  /** Business impact statement */
  business_impact: string;

  // ─── Recommendations ───────────────────────────────────────────────
  /** Ordered list of recommended actions */
  recommendations: string[];
  /** Linked remediation event IDs (already initiated) */
  commander_remediation_event_ids: string[];

  // ─── Authorship ────────────────────────────────────────────────────
  /** Who authored this assessment */
  authored_by: string;
  /** Review approver */
  reviewed_by: string | null;
  /** Publication timestamp */
  published_at: string | null;

  // ─── Commander AI context ──────────────────────────────────────────
  /** Whether AI assisted in generating this assessment */
  commander_ai_assisted: boolean;
  /** AI confidence in the assessment (0-1) */
  commander_ai_confidence: number | null;
  /** AI model used (internal reference only) */
  commander_ai_model: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface IntelligenceAssessmentValidation {
  valid: boolean;
  errors: string[];
}

const ASSESSMENT_STATUSES: AssessmentStatus[] = ['draft', 'reviewed', 'published', 'superseded', 'retracted'];
const THREAT_LEVELS: ThreatLevel[] = ['negligible', 'low', 'moderate', 'substantial', 'severe', 'critical'];
const NATO_RELIABILITY: NatoSourceReliability[] = ['A', 'B', 'C', 'D', 'E', 'F'];
const NATO_CREDIBILITY: NatoInformationCredibility[] = [1, 2, 3, 4, 5, 6];

export function validateIntelligenceAssessment(a: IntelligenceAssessment): IntelligenceAssessmentValidation {
  const errors: string[] = [];

  // Common
  if (!a.id || a.id.trim() === '') errors.push('id: required');
  if (!a.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!a.assessmentId || a.assessmentId.trim() === '') errors.push('assessmentId: required');

  // OCSF required
  if (typeof a.activity_id !== 'number') errors.push('activity_id: required (number)');
  if (a.category_uid !== 2) errors.push('category_uid: must be 2 (Findings)');
  if (a.class_uid !== 2005) errors.push('class_uid: must be 2005 (Incident Finding)');
  if (![0, 1, 2, 3, 4, 5, 6].includes(a.severity_id)) errors.push('severity_id: must be 0-6');
  if (!a.time || a.time.trim() === '') errors.push('time: required');
  if (!a.metadata) errors.push('metadata: required');

  // type_uid
  const expectedTypeUid = computeTypeUid(a.class_uid, a.activity_id);
  if (a.type_uid !== expectedTypeUid) {
    errors.push(`type_uid: must equal class_uid * 100 + activity_id (expected ${expectedTypeUid}, got ${a.type_uid})`);
  }

  // Assessment-specific
  if (!a.title || a.title.trim() === '') errors.push('title: required');
  if (!a.summary || a.summary.trim() === '') errors.push('summary: required');
  if (!a.analysis || a.analysis.trim() === '') errors.push('analysis: required');
  if (!ASSESSMENT_STATUSES.includes(a.assessment_status)) {
    errors.push('assessment_status: must be draft | reviewed | published | superseded | retracted');
  }
  if (!THREAT_LEVELS.includes(a.threat_level)) {
    errors.push('threat_level: must be negligible | low | moderate | substantial | severe | critical');
  }

  // NATO/Admiralty
  if (!NATO_RELIABILITY.includes(a.source_reliability)) {
    errors.push('source_reliability: must be A-F');
  }
  if (!NATO_CREDIBILITY.includes(a.information_credibility)) {
    errors.push('information_credibility: must be 1-6');
  }

  // Evidence
  if (!Array.isArray(a.source_finding_ids) || a.source_finding_ids.length === 0) {
    errors.push('source_finding_ids: must be non-empty array');
  }
  if (!Array.isArray(a.source_signal_ids)) errors.push('source_signal_ids: must be array');
  if (typeof a.evidence_count !== 'number' || a.evidence_count < 1) errors.push('evidence_count: must be >= 1');

  // MITRE ATT&CK
  if (!Array.isArray(a.attack_references)) errors.push('attack_references: must be array');

  // Impact
  if (!Array.isArray(a.affected_resources)) errors.push('affected_resources: must be array');
  if (!Array.isArray(a.commander_affected_node_ids)) errors.push('commander_affected_node_ids: must be array');
  if (!a.business_impact || a.business_impact.trim() === '') errors.push('business_impact: required');

  // Recommendations
  if (!Array.isArray(a.recommendations) || a.recommendations.length === 0) {
    errors.push('recommendations: must be non-empty array');
  }

  // Authorship
  if (!a.authored_by || a.authored_by.trim() === '') errors.push('authored_by: required');

  // Commander extensions
  if (!a.commander_tenant_id || a.commander_tenant_id.trim() === '') {
    errors.push('commander_tenant_id: required');
  }
  if (typeof a.commander_ai_assisted !== 'boolean') errors.push('commander_ai_assisted: must be boolean');

  return { valid: errors.length === 0, errors };
}
