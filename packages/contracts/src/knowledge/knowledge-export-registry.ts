/**
 * Knowledge Export Registry — Commander SDR
 *
 * Source: Spec #13 Commander AI Architecture & Grounding Rules §5 (Grounding Rules)
 * Baseline: docs/99_source_archive/baseline_v2_6_2/docs/02_child_specs/13_Commander_AI_Architecture_and_Grounding_Rules.md
 *
 * Purpose:
 * Central, infrastructure-neutral registry that declares which canonical entities
 * are eligible for future knowledge export and how export metadata is derived.
 *
 * This module:
 * - Does NOT modify any canonical entity shape
 * - Does NOT store metadata on records
 * - Does NOT introduce AWS, RAG, vector, embedding, or S3 concepts
 * - Declares eligibility and derivation rules only
 * - Is dormant until a future export service consumes it
 *
 * Future flow (Phase 2+):
 *   Commander canonical data record
 *   → Export service reads entity
 *   → Applies derivation rules from this registry
 *   → Generates retrieval-ready artifact with metadata tags
 *   → Downstream consumers (Bedrock KB, search, etc.) use metadata for filtering
 */

// ─── Knowledge Classification ────────────────────────────────────────────────

/**
 * Data classification for knowledge export purposes.
 * Aligns with Commander data classification model (MTS §11.1).
 * Infrastructure-neutral — no AWS/vendor coupling.
 */
export type KnowledgeClassification =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED';

export const KNOWLEDGE_CLASSIFICATIONS: KnowledgeClassification[] = [
  'PUBLIC',
  'INTERNAL',
  'CONFIDENTIAL',
  'RESTRICTED',
];

// ─── Knowledge Sensitivity ───────────────────────────────────────────────────

/**
 * Sensitivity level for knowledge export filtering.
 * Determines retrieval eligibility based on context/role.
 * Infrastructure-neutral — no AWS/vendor coupling.
 */
export type KnowledgeSensitivity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export const KNOWLEDGE_SENSITIVITIES: KnowledgeSensitivity[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

// ─── Eligible Entity Types ───────────────────────────────────────────────────

/**
 * Entity types eligible for future knowledge export.
 * These entities are knowledge-bearing — they contain operational context
 * that Commander AI could use for grounded retrieval.
 */
export const KNOWLEDGE_ELIGIBLE_ENTITIES = [
  'asset',
  'case',
  'identity',
  'risk-object',
  'verdict',
  'indicator-of-compromise',
  'vulnerability-intelligence',
  'strategy-policy',
  'evidence',
  'observable',
  'action',
  'war-room',
  'control-framework',
] as const;

export type KnowledgeEligibleEntityType = typeof KNOWLEDGE_ELIGIBLE_ENTITIES[number];

/**
 * Entity types explicitly excluded from knowledge export.
 * These are operational telemetry, configuration metadata, or thin join records
 * that would pollute retrieval without adding knowledge value.
 */
export const KNOWLEDGE_EXCLUDED_ENTITIES = [
  'audit-event',
  'platform-intelligence-source',
  'case-strategy-binding',
] as const;

export type KnowledgeExcludedEntityType = typeof KNOWLEDGE_EXCLUDED_ENTITIES[number];

// ─── Export Metadata Shape ───────────────────────────────────────────────────

/**
 * Knowledge Export Metadata — derived at export time, NOT stored on entities.
 *
 * A future export service computes this from entity fields using the
 * derivation rules declared below. This shape defines what metadata
 * accompanies each exported knowledge artifact.
 */
export interface KnowledgeExportMetadata {
  /** Tenant scope — derived from entity.tenant.tenantId */
  tenantId: string;
  /** Source system — derived from entity.source.sourceSystem */
  sourceType: string;
  /** Source connector — derived from entity.source.connectorId */
  sourceId: string;
  /** Entity type discriminator — derived from entity.entityType */
  entityType: KnowledgeEligibleEntityType;
  /** Data classification — derived from entity-specific fields */
  classification: KnowledgeClassification;
  /** Sensitivity level — derived from entity-specific fields */
  sensitivity: KnowledgeSensitivity;
  /** Tags for filtering — derived from entity.tags or entity-specific fields */
  tags: string[];
  /** Record creation time — derived from entity.createdAt */
  createdAt: string;
  /** Record update time — derived from entity.updatedAt */
  updatedAt: string;
}

// ─── Derivation Rule Declarations ────────────────────────────────────────────

/**
 * Derivation rule shape — declares how a field is computed from entity data.
 * These are documentation/contract declarations, not executable logic.
 * A future export service implements these rules.
 */
export interface DerivationRule {
  /** Target field in KnowledgeExportMetadata */
  field: keyof KnowledgeExportMetadata;
  /** Source path on the canonical entity */
  sourcePath: string;
  /** Derivation method */
  method: 'direct' | 'mapped' | 'computed' | 'default';
  /** Description of the derivation logic */
  description: string;
}

/**
 * Static derivation rules for KnowledgeExportMetadata fields.
 *
 * These declare HOW each metadata field is derived from canonical entity fields.
 * They are contract documentation — a future export service implements them.
 * No entity shapes are modified. No per-record storage occurs.
 */
export const KNOWLEDGE_DERIVATION_RULES: DerivationRule[] = [
  {
    field: 'tenantId',
    sourcePath: 'entity.tenant.tenantId',
    method: 'direct',
    description: 'Extracted directly from CommonFields.tenant.tenantId. Every entity carries this.',
  },
  {
    field: 'sourceType',
    sourcePath: 'entity.source.sourceSystem',
    method: 'direct',
    description: 'Extracted directly from CommonFields.source.sourceSystem. Identifies the originating system.',
  },
  {
    field: 'sourceId',
    sourcePath: 'entity.source.connectorId',
    method: 'direct',
    description: 'Extracted directly from CommonFields.source.connectorId. Identifies the specific connector.',
  },
  {
    field: 'entityType',
    sourcePath: 'entity.entityType',
    method: 'direct',
    description: 'Extracted directly from the per-entity entityType discriminator field.',
  },
  {
    field: 'classification',
    sourcePath: 'entity-specific',
    method: 'mapped',
    description:
      'Derived from entity-specific classification fields. ' +
      'Asset: from assetDataClassification (public→PUBLIC, internal→INTERNAL, confidential→CONFIDENTIAL, restricted→RESTRICTED). ' +
      'IOC: from tlpMarking (TLP:WHITE→PUBLIC, TLP:GREEN→INTERNAL, TLP:AMBER→CONFIDENTIAL, TLP:RED→RESTRICTED). ' +
      'Identity: from privilegeLevel (standard→INTERNAL, elevated→CONFIDENTIAL, privileged/super-privileged→RESTRICTED). ' +
      'Case: from priority + surfaceAttribution (P0 external→RESTRICTED, P0 internal→CONFIDENTIAL, P1→CONFIDENTIAL, P2+→INTERNAL). ' +
      'Default for entities without explicit classification field: INTERNAL.',
  },
  {
    field: 'sensitivity',
    sourcePath: 'entity-specific',
    method: 'computed',
    description:
      'Computed from entity-specific fields indicating operational impact. ' +
      'Case: from priority (P0→CRITICAL, P1→HIGH, P2→MEDIUM, P3/P4→LOW). ' +
      'Identity: from privilegeLevel + riskScore (super-privileged OR riskScore>80→CRITICAL, privileged OR riskScore>60→HIGH, elevated→MEDIUM, standard→LOW). ' +
      'Asset: from criticality (5→CRITICAL, 4→HIGH, 3→MEDIUM, 1-2→LOW). ' +
      'RiskObject: from treatmentState + type (open vulnerability_drift→HIGH, mitigated→LOW). ' +
      'IOC: from severity (5→CRITICAL, 4→HIGH, 3→MEDIUM, 1-2→LOW). ' +
      'Verdict: from disposition severity (BLOCK/QUARANTINE→HIGH, REQUIRE_*→MEDIUM, MONITOR/COACH→LOW, ALLOW/AUDIT→LOW). ' +
      'Default: MEDIUM.',
  },
  {
    field: 'tags',
    sourcePath: 'entity.tags || entity-specific',
    method: 'computed',
    description:
      'Derived from entity.tags where present (Asset). ' +
      'For entities without tags: generated from entity-type + key classification fields. ' +
      'Example: Case → ["case", caseType, priority, surfaceAttribution]. ' +
      'Example: Identity → ["identity", classification, privilegeLevel, status]. ' +
      'Tags enable flexible retrieval filtering without schema changes.',
  },
  {
    field: 'createdAt',
    sourcePath: 'entity.createdAt',
    method: 'direct',
    description: 'Extracted directly from CommonFields.createdAt. ISO 8601 timestamp.',
  },
  {
    field: 'updatedAt',
    sourcePath: 'entity.updatedAt',
    method: 'direct',
    description: 'Extracted directly from CommonFields.updatedAt. ISO 8601 timestamp.',
  },
];

// ─── Registry Query Helpers ──────────────────────────────────────────────────

/**
 * Check whether an entity type is eligible for knowledge export.
 */
export function isKnowledgeEligible(entityType: string): entityType is KnowledgeEligibleEntityType {
  return (KNOWLEDGE_ELIGIBLE_ENTITIES as readonly string[]).includes(entityType);
}

/**
 * Check whether an entity type is explicitly excluded from knowledge export.
 */
export function isKnowledgeExcluded(entityType: string): entityType is KnowledgeExcludedEntityType {
  return (KNOWLEDGE_EXCLUDED_ENTITIES as readonly string[]).includes(entityType);
}
