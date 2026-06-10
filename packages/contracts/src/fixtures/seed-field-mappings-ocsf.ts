/**
 * Seed StandardsFieldMapping — OCSF 1.3.0 — Commander C2 Fixtures
 *
 * ~50 field-by-field evidence records proving adherence to OCSF 1.3.0
 * across Signal, FindingEvent, RemediationEvent, and IntelligenceAssessment.
 *
 * Standards adherence:
 *   - OCSF field names EXACT per 1.3.0 specification
 *   - type_uid = class_uid * 100 + activity_id
 *   - commander_ prefix on ALL extension fields
 */

import type { StandardsFieldMapping } from '../entities/standards-field-mapping';
import { validateStandardsFieldMapping } from '../entities/standards-field-mapping';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

// ─── Helper ──────────────────────────────────────────────────────────────────

const now = '2026-06-10T00:00:00.000Z';
const ocsfDeclarationId = seedId('standards-declaration', 1); // OCSF declaration
const natoDeclarationId = seedId('standards-declaration', 10); // NATO/Admiralty declaration
const mitreDeclarationId = seedId('standards-declaration', 7); // MITRE ATT&CK declaration

// Start sequence after TOGAF/Zachman mappings (18 used)
let mappingSeq = 18;

function makeMapping(overrides: Partial<StandardsFieldMapping>): StandardsFieldMapping {
  mappingSeq++;
  const id = seedId('standards-field-mapping', mappingSeq);
  return {
    id,
    entityType: 'standards-field-mapping',
    tenant: SEED_TENANT,
    createdAt: now,
    updatedAt: now,
    source: SEED_SOURCE,
    mappingId: id,
    declarationId: ocsfDeclarationId,
    entityName: '',
    entityFile: '',
    commanderFieldName: '',
    commanderFieldType: '',
    commanderFieldPath: '',
    standardFieldName: '',
    standardFieldPath: '',
    standardFieldType: '',
    standardDefinition: '',
    standardRequirement: 'required',
    conformanceType: 'exact',
    justification: null,
    derivationFormula: null,
    ...overrides,
  } as StandardsFieldMapping;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNAL ENTITY — OCSF base_event required + recommended fields
// ═══════════════════════════════════════════════════════════════════════════════

const SIGNAL_OCSF_MAPPINGS: StandardsFieldMapping[] = [
  // ─── Required fields ───────────────────────────────────────────────
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'activity_id',
    commanderFieldType: 'number',
    commanderFieldPath: 'Signal.activity_id',
    standardFieldName: 'activity_id',
    standardFieldPath: 'base_event.activity_id',
    standardFieldType: 'Integer',
    standardDefinition: 'The normalized identifier of the activity that triggered the event',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'category_uid',
    commanderFieldType: '2',
    commanderFieldPath: 'Signal.category_uid',
    standardFieldName: 'category_uid',
    standardFieldPath: 'base_event.category_uid',
    standardFieldType: 'Integer',
    standardDefinition: 'The category unique identifier of the event',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'class_uid',
    commanderFieldType: '2004',
    commanderFieldPath: 'Signal.class_uid',
    standardFieldName: 'class_uid',
    standardFieldPath: 'base_event.class_uid',
    standardFieldType: 'Integer',
    standardDefinition: 'The unique identifier of a class. Class defines the event structure',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'severity_id',
    commanderFieldType: 'OcsfSeverityId',
    commanderFieldPath: 'Signal.severity_id',
    standardFieldName: 'severity_id',
    standardFieldPath: 'base_event.severity_id',
    standardFieldType: 'Integer',
    standardDefinition: 'The normalized identifier of the event severity (0=Unknown through 6=Fatal)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'time',
    commanderFieldType: 'string',
    commanderFieldPath: 'Signal.time',
    standardFieldName: 'time',
    standardFieldPath: 'base_event.time',
    standardFieldType: 'Timestamp',
    standardDefinition: 'The normalized event occurrence time (RFC 3339)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'type_uid',
    commanderFieldType: 'number',
    commanderFieldPath: 'Signal.type_uid',
    standardFieldName: 'type_uid',
    standardFieldPath: 'base_event.type_uid',
    standardFieldType: 'Integer',
    standardDefinition: 'The event type ID. Calculated as class_uid * 100 + activity_id',
    standardRequirement: 'required',
    conformanceType: 'exact',
    derivationFormula: 'type_uid = class_uid * 100 + activity_id',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'metadata',
    commanderFieldType: 'OcsfMetadata',
    commanderFieldPath: 'Signal.metadata',
    standardFieldName: 'metadata',
    standardFieldPath: 'base_event.metadata',
    standardFieldType: 'Metadata',
    standardDefinition: 'The event metadata describing the event producer and schema version',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),

  // ─── Recommended fields ────────────────────────────────────────────
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'message',
    commanderFieldType: 'string | undefined',
    commanderFieldPath: 'Signal.message',
    standardFieldName: 'message',
    standardFieldPath: 'base_event.message',
    standardFieldType: 'String',
    standardDefinition: 'The description of the event as defined by the event source',
    standardRequirement: 'recommended',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'observables',
    commanderFieldType: 'OcsfObservable[] | undefined',
    commanderFieldPath: 'Signal.observables',
    standardFieldName: 'observables',
    standardFieldPath: 'base_event.observables',
    standardFieldType: 'Observable[]',
    standardDefinition: 'The observables associated with the event',
    standardRequirement: 'recommended',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'status_id',
    commanderFieldType: 'OcsfStatusId | undefined',
    commanderFieldPath: 'Signal.status_id',
    standardFieldName: 'status_id',
    standardFieldPath: 'base_event.status_id',
    standardFieldType: 'Integer',
    standardDefinition: 'The normalized identifier of the event status',
    standardRequirement: 'recommended',
    conformanceType: 'exact',
  }),

  // ─── Optional fields ───────────────────────────────────────────────
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'severity',
    commanderFieldType: 'string | undefined',
    commanderFieldPath: 'Signal.severity',
    standardFieldName: 'severity',
    standardFieldPath: 'base_event.severity',
    standardFieldType: 'String',
    standardDefinition: 'The event severity, normalized to the caption of severity_id',
    standardRequirement: 'optional',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'enrichments',
    commanderFieldType: 'OcsfEnrichment[] | undefined',
    commanderFieldPath: 'Signal.enrichments',
    standardFieldName: 'enrichments',
    standardFieldPath: 'base_event.enrichments',
    standardFieldType: 'Enrichment[]',
    standardDefinition: 'The additional information from an external data source',
    standardRequirement: 'optional',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'raw_data',
    commanderFieldType: 'string | undefined',
    commanderFieldPath: 'Signal.raw_data',
    standardFieldName: 'raw_data',
    standardFieldPath: 'base_event.raw_data',
    standardFieldType: 'String',
    standardDefinition: 'The raw event data as received from the source',
    standardRequirement: 'optional',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'duration',
    commanderFieldType: 'number | undefined',
    commanderFieldPath: 'Signal.duration',
    standardFieldName: 'duration',
    standardFieldPath: 'base_event.duration',
    standardFieldType: 'Integer',
    standardDefinition: 'The event duration in milliseconds',
    standardRequirement: 'optional',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'start_time',
    commanderFieldType: 'string | undefined',
    commanderFieldPath: 'Signal.start_time',
    standardFieldName: 'start_time',
    standardFieldPath: 'base_event.start_time',
    standardFieldType: 'Timestamp',
    standardDefinition: 'The start time of the event (RFC 3339)',
    standardRequirement: 'optional',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'end_time',
    commanderFieldType: 'string | undefined',
    commanderFieldPath: 'Signal.end_time',
    standardFieldName: 'end_time',
    standardFieldPath: 'base_event.end_time',
    standardFieldType: 'Timestamp',
    standardDefinition: 'The end time of the event (RFC 3339)',
    standardRequirement: 'optional',
    conformanceType: 'exact',
  }),

  // ─── Commander extensions (commander_ prefix) ──────────────────────
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'commander_tenant_id',
    commanderFieldType: 'string',
    commanderFieldPath: 'Signal.commander_tenant_id',
    standardFieldName: 'N/A (Commander extension)',
    standardFieldPath: 'commander_.tenant_id',
    standardFieldType: 'String',
    standardDefinition: 'Commander platform tenant identifier — extension field',
    standardRequirement: 'required',
    conformanceType: 'extension',
    justification: 'Multi-tenant isolation requires tenant context on every event; namespaced with commander_ prefix per OCSF extension rules',
  }),
  makeMapping({
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'commander_affected_node_ids',
    commanderFieldType: 'string[]',
    commanderFieldPath: 'Signal.commander_affected_node_ids',
    standardFieldName: 'N/A (Commander extension)',
    standardFieldPath: 'commander_.affected_node_ids',
    standardFieldType: 'String[]',
    standardDefinition: 'Topology node IDs affected by this signal — extension field',
    standardRequirement: 'optional',
    conformanceType: 'extension',
    justification: 'Topology binding for graph-based impact analysis; namespaced with commander_ prefix',
  }),
];

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNAL ENTITY — NATO/Admiralty field mappings
// ═══════════════════════════════════════════════════════════════════════════════

const SIGNAL_NATO_MAPPINGS: StandardsFieldMapping[] = [
  makeMapping({
    declarationId: natoDeclarationId,
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'source_reliability',
    commanderFieldType: 'NatoSourceReliability',
    commanderFieldPath: 'Signal.source_reliability',
    standardFieldName: 'Source Reliability',
    standardFieldPath: 'STANAG_2022.Source_Reliability',
    standardFieldType: 'Character (A-F)',
    standardDefinition: 'Reliability rating of the information source: A (Completely Reliable) through F (Cannot Be Judged)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    declarationId: natoDeclarationId,
    entityName: 'Signal',
    entityFile: 'signal.ts',
    commanderFieldName: 'information_credibility',
    commanderFieldType: 'NatoInformationCredibility',
    commanderFieldPath: 'Signal.information_credibility',
    standardFieldName: 'Information Credibility',
    standardFieldPath: 'STANAG_2022.Information_Credibility',
    standardFieldType: 'Integer (1-6)',
    standardDefinition: 'Credibility rating of the information: 1 (Confirmed) through 6 (Cannot Be Judged)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
];

// ═══════════════════════════════════════════════════════════════════════════════
// FINDING EVENT — OCSF Security Finding fields
// ═══════════════════════════════════════════════════════════════════════════════

const FINDING_OCSF_MAPPINGS: StandardsFieldMapping[] = [
  makeMapping({
    entityName: 'FindingEvent',
    entityFile: 'finding-event.ts',
    commanderFieldName: 'class_uid',
    commanderFieldType: '2001',
    commanderFieldPath: 'FindingEvent.class_uid',
    standardFieldName: 'class_uid',
    standardFieldPath: 'security_finding.class_uid',
    standardFieldType: 'Integer',
    standardDefinition: 'Security Finding class identifier (2001)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'FindingEvent',
    entityFile: 'finding-event.ts',
    commanderFieldName: 'activity_id',
    commanderFieldType: 'number',
    commanderFieldPath: 'FindingEvent.activity_id',
    standardFieldName: 'activity_id',
    standardFieldPath: 'security_finding.activity_id',
    standardFieldType: 'Integer',
    standardDefinition: 'The finding activity: 1=Create, 2=Update, 3=Close, 99=Other',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'FindingEvent',
    entityFile: 'finding-event.ts',
    commanderFieldName: 'type_uid',
    commanderFieldType: 'number',
    commanderFieldPath: 'FindingEvent.type_uid',
    standardFieldName: 'type_uid',
    standardFieldPath: 'security_finding.type_uid',
    standardFieldType: 'Integer',
    standardDefinition: 'Event type UID = class_uid * 100 + activity_id',
    standardRequirement: 'required',
    conformanceType: 'exact',
    derivationFormula: 'type_uid = 2001 * 100 + activity_id',
  }),
  makeMapping({
    entityName: 'FindingEvent',
    entityFile: 'finding-event.ts',
    commanderFieldName: 'severity_id',
    commanderFieldType: 'OcsfSeverityId',
    commanderFieldPath: 'FindingEvent.severity_id',
    standardFieldName: 'severity_id',
    standardFieldPath: 'security_finding.severity_id',
    standardFieldType: 'Integer',
    standardDefinition: 'Finding severity (0=Unknown through 6=Fatal)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'FindingEvent',
    entityFile: 'finding-event.ts',
    commanderFieldName: 'title',
    commanderFieldType: 'string',
    commanderFieldPath: 'FindingEvent.title',
    standardFieldName: 'finding.title',
    standardFieldPath: 'security_finding.finding.title',
    standardFieldType: 'String',
    standardDefinition: 'The title of the reported finding',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'FindingEvent',
    entityFile: 'finding-event.ts',
    commanderFieldName: 'confidence_id',
    commanderFieldType: 'number',
    commanderFieldPath: 'FindingEvent.confidence_id',
    standardFieldName: 'confidence_id',
    standardFieldPath: 'security_finding.confidence_id',
    standardFieldType: 'Integer',
    standardDefinition: 'The confidence, normalized to the ID of the finding confidence',
    standardRequirement: 'recommended',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'FindingEvent',
    entityFile: 'finding-event.ts',
    commanderFieldName: 'state',
    commanderFieldType: 'FindingState',
    commanderFieldPath: 'FindingEvent.state',
    standardFieldName: 'state_id',
    standardFieldPath: 'security_finding.state_id',
    standardFieldType: 'Integer',
    standardDefinition: 'The state of the finding (New, In Progress, Resolved, Suppressed)',
    standardRequirement: 'recommended',
    conformanceType: 'semantic_match',
    justification: 'Commander uses string enum aligned to OCSF state_id values for developer ergonomics',
  }),
];

// ─── Finding — MITRE ATT&CK mappings ────────────────────────────────────────

const FINDING_MITRE_MAPPINGS: StandardsFieldMapping[] = [
  makeMapping({
    declarationId: mitreDeclarationId,
    entityName: 'FindingEvent',
    entityFile: 'finding-event.ts',
    commanderFieldName: 'attack_references',
    commanderFieldType: 'MitreAttackReference[]',
    commanderFieldPath: 'FindingEvent.attack_references',
    standardFieldName: 'attacks',
    standardFieldPath: 'MITRE_ATT&CK.Technique_Reference',
    standardFieldType: 'Attack[]',
    standardDefinition: 'MITRE ATT&CK tactic/technique/sub-technique references',
    standardRequirement: 'recommended',
    conformanceType: 'exact',
  }),
  makeMapping({
    declarationId: mitreDeclarationId,
    entityName: 'FindingEvent',
    entityFile: 'finding-event.ts',
    commanderFieldName: 'attack_references[].tactic_id',
    commanderFieldType: 'string',
    commanderFieldPath: 'FindingEvent.attack_references[].tactic_id',
    standardFieldName: 'tactic.external_id',
    standardFieldPath: 'MITRE_ATT&CK.Tactic.external_id',
    standardFieldType: 'String',
    standardDefinition: 'MITRE ATT&CK tactic external ID (e.g. TA0001)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    declarationId: mitreDeclarationId,
    entityName: 'FindingEvent',
    entityFile: 'finding-event.ts',
    commanderFieldName: 'attack_references[].technique_id',
    commanderFieldType: 'string',
    commanderFieldPath: 'FindingEvent.attack_references[].technique_id',
    standardFieldName: 'technique.external_id',
    standardFieldPath: 'MITRE_ATT&CK.Technique.external_id',
    standardFieldType: 'String',
    standardDefinition: 'MITRE ATT&CK technique external ID (e.g. T1566)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    declarationId: mitreDeclarationId,
    entityName: 'FindingEvent',
    entityFile: 'finding-event.ts',
    commanderFieldName: 'attack_references[].sub_technique_id',
    commanderFieldType: 'string | null',
    commanderFieldPath: 'FindingEvent.attack_references[].sub_technique_id',
    standardFieldName: 'sub_technique.external_id',
    standardFieldPath: 'MITRE_ATT&CK.Sub_Technique.external_id',
    standardFieldType: 'String | null',
    standardDefinition: 'MITRE ATT&CK sub-technique external ID (e.g. T1566.001)',
    standardRequirement: 'optional',
    conformanceType: 'exact',
  }),
];

// ═══════════════════════════════════════════════════════════════════════════════
// REMEDIATION EVENT — OCSF Remediation Activity fields
// ═══════════════════════════════════════════════════════════════════════════════

const REMEDIATION_OCSF_MAPPINGS: StandardsFieldMapping[] = [
  makeMapping({
    entityName: 'RemediationEvent',
    entityFile: 'remediation-event.ts',
    commanderFieldName: 'class_uid',
    commanderFieldType: '2002',
    commanderFieldPath: 'RemediationEvent.class_uid',
    standardFieldName: 'class_uid',
    standardFieldPath: 'remediation_activity.class_uid',
    standardFieldType: 'Integer',
    standardDefinition: 'Remediation Activity class identifier (2002)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'RemediationEvent',
    entityFile: 'remediation-event.ts',
    commanderFieldName: 'activity_id',
    commanderFieldType: 'number',
    commanderFieldPath: 'RemediationEvent.activity_id',
    standardFieldName: 'activity_id',
    standardFieldPath: 'remediation_activity.activity_id',
    standardFieldType: 'Integer',
    standardDefinition: 'The remediation activity type',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'RemediationEvent',
    entityFile: 'remediation-event.ts',
    commanderFieldName: 'type_uid',
    commanderFieldType: 'number',
    commanderFieldPath: 'RemediationEvent.type_uid',
    standardFieldName: 'type_uid',
    standardFieldPath: 'remediation_activity.type_uid',
    standardFieldType: 'Integer',
    standardDefinition: 'Event type UID = class_uid * 100 + activity_id',
    standardRequirement: 'required',
    conformanceType: 'exact',
    derivationFormula: 'type_uid = 2002 * 100 + activity_id',
  }),
  makeMapping({
    entityName: 'RemediationEvent',
    entityFile: 'remediation-event.ts',
    commanderFieldName: 'severity_id',
    commanderFieldType: 'OcsfSeverityId',
    commanderFieldPath: 'RemediationEvent.severity_id',
    standardFieldName: 'severity_id',
    standardFieldPath: 'remediation_activity.severity_id',
    standardFieldType: 'Integer',
    standardDefinition: 'Remediation severity (inherited from finding)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'RemediationEvent',
    entityFile: 'remediation-event.ts',
    commanderFieldName: 'commander_ooda_response_ms',
    commanderFieldType: 'number | null',
    commanderFieldPath: 'RemediationEvent.commander_ooda_response_ms',
    standardFieldName: 'N/A (Commander extension)',
    standardFieldPath: 'commander_.ooda_response_ms',
    standardFieldType: 'Integer | null',
    standardDefinition: 'OODA loop response time: finding detection to remediation start (ms)',
    standardRequirement: 'optional',
    conformanceType: 'extension',
    justification: 'OODA tempo metric for approval/response leaderboard; namespaced with commander_ prefix',
  }),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INTELLIGENCE ASSESSMENT — OCSF Incident Finding fields
// ═══════════════════════════════════════════════════════════════════════════════

const ASSESSMENT_OCSF_MAPPINGS: StandardsFieldMapping[] = [
  makeMapping({
    entityName: 'IntelligenceAssessment',
    entityFile: 'intelligence-assessment.ts',
    commanderFieldName: 'class_uid',
    commanderFieldType: '2005',
    commanderFieldPath: 'IntelligenceAssessment.class_uid',
    standardFieldName: 'class_uid',
    standardFieldPath: 'incident_finding.class_uid',
    standardFieldType: 'Integer',
    standardDefinition: 'Incident Finding class identifier (2005)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'IntelligenceAssessment',
    entityFile: 'intelligence-assessment.ts',
    commanderFieldName: 'activity_id',
    commanderFieldType: 'number',
    commanderFieldPath: 'IntelligenceAssessment.activity_id',
    standardFieldName: 'activity_id',
    standardFieldPath: 'incident_finding.activity_id',
    standardFieldType: 'Integer',
    standardDefinition: 'The incident finding activity type',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'IntelligenceAssessment',
    entityFile: 'intelligence-assessment.ts',
    commanderFieldName: 'type_uid',
    commanderFieldType: 'number',
    commanderFieldPath: 'IntelligenceAssessment.type_uid',
    standardFieldName: 'type_uid',
    standardFieldPath: 'incident_finding.type_uid',
    standardFieldType: 'Integer',
    standardDefinition: 'Event type UID = class_uid * 100 + activity_id',
    standardRequirement: 'required',
    conformanceType: 'exact',
    derivationFormula: 'type_uid = 2005 * 100 + activity_id',
  }),
  makeMapping({
    entityName: 'IntelligenceAssessment',
    entityFile: 'intelligence-assessment.ts',
    commanderFieldName: 'severity_id',
    commanderFieldType: 'OcsfSeverityId',
    commanderFieldPath: 'IntelligenceAssessment.severity_id',
    standardFieldName: 'severity_id',
    standardFieldPath: 'incident_finding.severity_id',
    standardFieldType: 'Integer',
    standardDefinition: 'Assessment severity (0=Unknown through 6=Fatal)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'IntelligenceAssessment',
    entityFile: 'intelligence-assessment.ts',
    commanderFieldName: 'title',
    commanderFieldType: 'string',
    commanderFieldPath: 'IntelligenceAssessment.title',
    standardFieldName: 'finding.title',
    standardFieldPath: 'incident_finding.finding.title',
    standardFieldType: 'String',
    standardDefinition: 'The title of the incident finding',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    entityName: 'IntelligenceAssessment',
    entityFile: 'intelligence-assessment.ts',
    commanderFieldName: 'summary',
    commanderFieldType: 'string',
    commanderFieldPath: 'IntelligenceAssessment.summary',
    standardFieldName: 'finding.desc',
    standardFieldPath: 'incident_finding.finding.desc',
    standardFieldType: 'String',
    standardDefinition: 'Description/summary of the incident finding',
    standardRequirement: 'recommended',
    conformanceType: 'semantic_match',
    justification: 'Commander uses summary as executive-level description aligned to OCSF finding.desc',
  }),
  makeMapping({
    entityName: 'IntelligenceAssessment',
    entityFile: 'intelligence-assessment.ts',
    commanderFieldName: 'commander_ai_assisted',
    commanderFieldType: 'boolean',
    commanderFieldPath: 'IntelligenceAssessment.commander_ai_assisted',
    standardFieldName: 'N/A (Commander extension)',
    standardFieldPath: 'commander_.ai_assisted',
    standardFieldType: 'Boolean',
    standardDefinition: 'Whether AI contributed to generating this assessment',
    standardRequirement: 'required',
    conformanceType: 'extension',
    justification: 'AI transparency requirement; namespaced with commander_ prefix per OCSF extension rules',
  }),
  makeMapping({
    entityName: 'IntelligenceAssessment',
    entityFile: 'intelligence-assessment.ts',
    commanderFieldName: 'commander_ai_confidence',
    commanderFieldType: 'number | null',
    commanderFieldPath: 'IntelligenceAssessment.commander_ai_confidence',
    standardFieldName: 'N/A (Commander extension)',
    standardFieldPath: 'commander_.ai_confidence',
    standardFieldType: 'Float | null',
    standardDefinition: 'AI confidence score for the assessment (0-1)',
    standardRequirement: 'optional',
    conformanceType: 'extension',
    justification: 'AI confidence tracking for governance; namespaced with commander_ prefix',
  }),
];

// ─── Assessment — NATO/Admiralty mappings ────────────────────────────────────

const ASSESSMENT_NATO_MAPPINGS: StandardsFieldMapping[] = [
  makeMapping({
    declarationId: natoDeclarationId,
    entityName: 'IntelligenceAssessment',
    entityFile: 'intelligence-assessment.ts',
    commanderFieldName: 'source_reliability',
    commanderFieldType: 'NatoSourceReliability',
    commanderFieldPath: 'IntelligenceAssessment.source_reliability',
    standardFieldName: 'Source Reliability',
    standardFieldPath: 'STANAG_2022.Source_Reliability',
    standardFieldType: 'Character (A-F)',
    standardDefinition: 'Aggregated reliability of intelligence sources: A (Completely Reliable) through F (Cannot Be Judged)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    declarationId: natoDeclarationId,
    entityName: 'IntelligenceAssessment',
    entityFile: 'intelligence-assessment.ts',
    commanderFieldName: 'information_credibility',
    commanderFieldType: 'NatoInformationCredibility',
    commanderFieldPath: 'IntelligenceAssessment.information_credibility',
    standardFieldName: 'Information Credibility',
    standardFieldPath: 'STANAG_2022.Information_Credibility',
    standardFieldType: 'Integer (1-6)',
    standardDefinition: 'Aggregated credibility of the intelligence: 1 (Confirmed) through 6 (Cannot Be Judged)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CONSOLIDATED EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const SEED_FIELD_MAPPINGS_OCSF_SIGNAL: StandardsFieldMapping[] = [
  ...SIGNAL_OCSF_MAPPINGS,
  ...SIGNAL_NATO_MAPPINGS,
];

export const SEED_FIELD_MAPPINGS_OCSF_FINDING: StandardsFieldMapping[] = [
  ...FINDING_OCSF_MAPPINGS,
  ...FINDING_MITRE_MAPPINGS,
];

export const SEED_FIELD_MAPPINGS_OCSF_REMEDIATION: StandardsFieldMapping[] = [
  ...REMEDIATION_OCSF_MAPPINGS,
];

export const SEED_FIELD_MAPPINGS_OCSF_ASSESSMENT: StandardsFieldMapping[] = [
  ...ASSESSMENT_OCSF_MAPPINGS,
  ...ASSESSMENT_NATO_MAPPINGS,
];

export const SEED_FIELD_MAPPINGS_OCSF_ALL: StandardsFieldMapping[] = [
  ...SEED_FIELD_MAPPINGS_OCSF_SIGNAL,
  ...SEED_FIELD_MAPPINGS_OCSF_FINDING,
  ...SEED_FIELD_MAPPINGS_OCSF_REMEDIATION,
  ...SEED_FIELD_MAPPINGS_OCSF_ASSESSMENT,
];

// ─── Validation Gate ─────────────────────────────────────────────────────────

export function validateAllOcsfMappings(): { index: number; errors: string[] }[] {
  const failures: { index: number; errors: string[] }[] = [];
  SEED_FIELD_MAPPINGS_OCSF_ALL.forEach((mapping, index) => {
    const result = validateStandardsFieldMapping(mapping);
    if (!result.valid) {
      failures.push({ index, errors: result.errors });
    }
  });
  return failures;
}
