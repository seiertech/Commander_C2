/**
 * Finding Event Entity — Commander C2
 *
 * Governed by: OCSF 1.3.0 Security Finding (class_uid: 2001)
 * Purpose: Represents a confirmed security finding after signal correlation
 * and enrichment. Findings are promoted from Signals that pass triage.
 *
 * Standards adherence:
 *   - OCSF field names EXACT per 1.3.0 Security Finding class
 *   - type_uid = class_uid * 100 + activity_id
 *   - MITRE ATT&CK TTP references exact
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
import { computeTypeUid } from './ocsf-types';

// ─── Finding State ───────────────────────────────────────────────────────────

export type FindingState = 'new' | 'in_progress' | 'resolved' | 'suppressed';

// ─── MITRE ATT&CK Reference ─────────────────────────────────────────────────

export interface MitreAttackReference {
  /** Tactic name (e.g. "Initial Access") */
  tactic: string;
  /** Tactic ID (e.g. "TA0001") */
  tactic_id: string;
  /** Technique name (e.g. "Phishing") */
  technique: string;
  /** Technique ID (e.g. "T1566") */
  technique_id: string;
  /** Sub-technique name (null if none) */
  sub_technique: string | null;
  /** Sub-technique ID (e.g. "T1566.001") */
  sub_technique_id: string | null;
}

// ─── Finding Event Entity ────────────────────────────────────────────────────

export interface FindingEvent extends CommonFields, OcsfBaseEvent, CommanderEventExtensions {
  entityType: 'finding-event';

  /** Unique finding identifier */
  findingId: string;

  // ─── OCSF class identification (Security Finding = 2001) ───────────
  /** Fixed: 2001 (Security Finding) */
  class_uid: 2001;
  /** OCSF category: Findings = 2 */
  category_uid: 2;

  // ─── Finding details ───────────────────────────────────────────────
  /** Finding title */
  title: string;
  /** Detailed description */
  description: string;
  /** Current state */
  state: FindingState;
  /** Confidence percentage (0-100) */
  confidence_id: number;

  // ─── Source signals ────────────────────────────────────────────────
  /** Signal IDs that contributed to this finding */
  source_signal_ids: string[];
  /** Count of correlated signals */
  signal_count: number;

  // ─── MITRE ATT&CK ─────────────────────────────────────────────────
  /** MITRE ATT&CK TTP references */
  attack_references: MitreAttackReference[];

  // ─── NATO/Admiralty grading ────────────────────────────────────────
  /** Aggregated source reliability from contributing signals */
  source_reliability: NatoSourceReliability;
  /** Aggregated information credibility */
  information_credibility: NatoInformationCredibility;

  // ─── Impact & scope ────────────────────────────────────────────────
  /** Affected asset/resource identifiers */
  affected_resources: string[];
  /** Affected topology node IDs */
  commander_affected_node_ids: string[];

  // ─── Remediation ───────────────────────────────────────────────────
  /** Recommended remediation actions */
  remediation_recommendations: string[];
  /** Linked remediation event ID (null if not yet remediated) */
  commander_remediation_event_id: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface FindingEventValidation {
  valid: boolean;
  errors: string[];
}

const FINDING_STATES: FindingState[] = ['new', 'in_progress', 'resolved', 'suppressed'];
const NATO_RELIABILITY: NatoSourceReliability[] = ['A', 'B', 'C', 'D', 'E', 'F'];
const NATO_CREDIBILITY: NatoInformationCredibility[] = [1, 2, 3, 4, 5, 6];

export function validateFindingEvent(f: FindingEvent): FindingEventValidation {
  const errors: string[] = [];

  // Common
  if (!f.id || f.id.trim() === '') errors.push('id: required');
  if (!f.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!f.findingId || f.findingId.trim() === '') errors.push('findingId: required');

  // OCSF required
  if (typeof f.activity_id !== 'number') errors.push('activity_id: required (number)');
  if (f.category_uid !== 2) errors.push('category_uid: must be 2 (Findings)');
  if (f.class_uid !== 2001) errors.push('class_uid: must be 2001 (Security Finding)');
  if (![0, 1, 2, 3, 4, 5, 6].includes(f.severity_id)) errors.push('severity_id: must be 0-6');
  if (!f.time || f.time.trim() === '') errors.push('time: required');
  if (!f.metadata) errors.push('metadata: required');

  // type_uid
  const expectedTypeUid = computeTypeUid(f.class_uid, f.activity_id);
  if (f.type_uid !== expectedTypeUid) {
    errors.push(`type_uid: must equal class_uid * 100 + activity_id (expected ${expectedTypeUid}, got ${f.type_uid})`);
  }

  // Finding-specific
  if (!f.title || f.title.trim() === '') errors.push('title: required');
  if (!f.description || f.description.trim() === '') errors.push('description: required');
  if (!FINDING_STATES.includes(f.state)) errors.push('state: must be new | in_progress | resolved | suppressed');
  if (typeof f.confidence_id !== 'number' || f.confidence_id < 0 || f.confidence_id > 100) {
    errors.push('confidence_id: must be 0-100');
  }
  if (!Array.isArray(f.source_signal_ids) || f.source_signal_ids.length === 0) {
    errors.push('source_signal_ids: must be non-empty array');
  }
  if (typeof f.signal_count !== 'number' || f.signal_count < 1) errors.push('signal_count: must be >= 1');

  // MITRE ATT&CK
  if (!Array.isArray(f.attack_references)) errors.push('attack_references: must be array');

  // NATO/Admiralty
  if (!NATO_RELIABILITY.includes(f.source_reliability)) {
    errors.push('source_reliability: must be A-F');
  }
  if (!NATO_CREDIBILITY.includes(f.information_credibility)) {
    errors.push('information_credibility: must be 1-6');
  }

  // Commander extensions
  if (!f.commander_tenant_id || f.commander_tenant_id.trim() === '') {
    errors.push('commander_tenant_id: required');
  }
  if (!Array.isArray(f.affected_resources)) errors.push('affected_resources: must be array');
  if (!Array.isArray(f.commander_affected_node_ids)) errors.push('commander_affected_node_ids: must be array');

  return { valid: errors.length === 0, errors };
}
