/**
 * Signal Entity — Commander C2
 *
 * Governed by: OCSF 1.3.0 base_event + NATO/Admiralty Code
 * OCSF Class: Detection Finding (class_uid: 2004)
 *
 * Purpose: The normalised, enriched event that enters Commander's pipeline.
 * Every raw event from any connector is transformed into a Signal.
 * Signals are the atomic unit of Commander's event model.
 *
 * Standards adherence:
 *   - OCSF field names EXACT (activity_id, category_uid, class_uid, severity_id, time, type_uid, metadata)
 *   - type_uid = class_uid * 100 + activity_id
 *   - NATO/Admiralty: source_reliability (A-F), information_credibility (1-6)
 *   - commander_ prefix on ALL extension fields
 */

import type { CommonFields } from './common';
import type {
  OcsfBaseEvent,
  OcsfSeverityId,
  OcsfCategoryUid,
  OcsfStatusId,
  NatoSourceReliability,
  NatoInformationCredibility,
  CommanderEventExtensions,
} from './ocsf-types';
import { computeTypeUid } from './ocsf-types';

// ─── Signal Status ───────────────────────────────────────────────────────────

export type SignalStatus = 'new' | 'triaged' | 'investigating' | 'resolved' | 'false_positive' | 'suppressed';

// ─── Signal Entity ───────────────────────────────────────────────────────────

export interface Signal extends CommonFields, OcsfBaseEvent, CommanderEventExtensions {
  entityType: 'signal';

  /** Unique signal identifier */
  signalId: string;

  // ─── OCSF class identification (Detection Finding = 2004) ──────────
  /** Fixed: 2004 (Detection Finding) */
  class_uid: 2004;
  /** OCSF category: Findings = 2 */
  category_uid: 2;

  // ─── NATO/Admiralty grading ────────────────────────────────────────
  /** Source reliability grade (A-F) per STANAG 2022 */
  source_reliability: NatoSourceReliability;
  /** Information credibility grade (1-6) per AJP-2.1 */
  information_credibility: NatoInformationCredibility;

  // ─── Signal-specific fields ────────────────────────────────────────
  /** Signal workflow status */
  signal_status: SignalStatus;
  /** Connector that produced this signal */
  connector_id: string;
  /** Source system name */
  source_system: string;
  /** Detection rule or logic that triggered */
  detection_rule: string | null;
  /** Confidence score from detection (0-100) */
  confidence_score: number;

  // ─── Topology binding ──────────────────────────────────────────────
  /** Affected topology node IDs */
  commander_affected_node_ids: string[];
  /** Affected topology edge IDs */
  commander_affected_edge_ids: string[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface SignalValidation {
  valid: boolean;
  errors: string[];
}

const SIGNAL_STATUSES: SignalStatus[] = ['new', 'triaged', 'investigating', 'resolved', 'false_positive', 'suppressed'];
const NATO_RELIABILITY: NatoSourceReliability[] = ['A', 'B', 'C', 'D', 'E', 'F'];
const NATO_CREDIBILITY: NatoInformationCredibility[] = [1, 2, 3, 4, 5, 6];

export function validateSignal(s: Signal): SignalValidation {
  const errors: string[] = [];

  // Common fields
  if (!s.id || s.id.trim() === '') errors.push('id: required');
  if (!s.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!s.signalId || s.signalId.trim() === '') errors.push('signalId: required');

  // OCSF required fields
  if (typeof s.activity_id !== 'number') errors.push('activity_id: required (number)');
  if (s.category_uid !== 2) errors.push('category_uid: must be 2 (Findings)');
  if (s.class_uid !== 2004) errors.push('class_uid: must be 2004 (Detection Finding)');
  if (![0, 1, 2, 3, 4, 5, 6].includes(s.severity_id)) errors.push('severity_id: must be 0-6');
  if (!s.time || s.time.trim() === '') errors.push('time: required');
  if (!s.metadata) errors.push('metadata: required');

  // type_uid computation check
  const expectedTypeUid = computeTypeUid(s.class_uid, s.activity_id);
  if (s.type_uid !== expectedTypeUid) {
    errors.push(`type_uid: must equal class_uid * 100 + activity_id (expected ${expectedTypeUid}, got ${s.type_uid})`);
  }

  // NATO/Admiralty
  if (!NATO_RELIABILITY.includes(s.source_reliability)) {
    errors.push('source_reliability: must be A | B | C | D | E | F');
  }
  if (!NATO_CREDIBILITY.includes(s.information_credibility)) {
    errors.push('information_credibility: must be 1 | 2 | 3 | 4 | 5 | 6');
  }

  // Signal-specific
  if (!SIGNAL_STATUSES.includes(s.signal_status)) {
    errors.push('signal_status: must be new | triaged | investigating | resolved | false_positive | suppressed');
  }
  if (!s.connector_id || s.connector_id.trim() === '') errors.push('connector_id: required');
  if (!s.source_system || s.source_system.trim() === '') errors.push('source_system: required');
  if (typeof s.confidence_score !== 'number' || s.confidence_score < 0 || s.confidence_score > 100) {
    errors.push('confidence_score: must be 0-100');
  }

  // Commander extensions
  if (!s.commander_tenant_id || s.commander_tenant_id.trim() === '') {
    errors.push('commander_tenant_id: required');
  }
  if (!Array.isArray(s.commander_affected_node_ids)) errors.push('commander_affected_node_ids: must be array');
  if (!Array.isArray(s.commander_affected_edge_ids)) errors.push('commander_affected_edge_ids: must be array');

  return { valid: errors.length === 0, errors };
}
