/**
 * Commander C2 Canonical Entities — Central Export
 *
 * All entities exported from this index. Import from '@commander/contracts'.
 */

// ─── Foundation ──────────────────────────────────────────────────────────────
export type { CommonFields, TenantContext, SourceMetadata } from './common';

// ─── Layer 1: Standards Evidence Model ───────────────────────────────────────
export type {
  StandardsDeclaration,
  StandardsCategory,
  ConformanceLevel,
  DeclarationStatus,
  StandardsDeclarationValidation,
} from './standards-declaration';
export { validateStandardsDeclaration } from './standards-declaration';

export type {
  StandardsFieldMapping,
  ConformanceType,
  StandardRequirement,
  StandardsFieldMappingValidation,
} from './standards-field-mapping';
export { validateStandardsFieldMapping } from './standards-field-mapping';

export type {
  StandardsVersionHistory,
  VersionChangeType,
  StandardsVersionHistoryValidation,
} from './standards-version-history';
export { validateStandardsVersionHistory } from './standards-version-history';

// ─── Layer 2: Architecture Classification & Topology ─────────────────────────
export type {
  ArchitectureClassification,
  TogafDomain,
  ZachmanAspect,
  ZachmanPerspective,
  ClassificationStatus,
  ArchitectureClassificationValidation,
} from './architecture-classification';
export { validateArchitectureClassification } from './architecture-classification';

export type {
  TopologyNode,
  TopologyNodeType,
  TopologyNodeStatus,
  DiscoveryMethod,
  TopologyNodeValidation,
} from './topology-node';
export { validateTopologyNode } from './topology-node';

export type {
  TopologyEdge,
  TopologyEdgeType,
  TopologyEdgeStatus,
  EdgeProtocol,
  TopologyEdgeValidation,
} from './topology-edge';
export { validateTopologyEdge } from './topology-edge';

// ─── Layer 3: Event & Intelligence (OCSF 1.3.0) ─────────────────────────────
export type {
  OcsfSeverityId,
  OcsfStatusId,
  OcsfBaseActivityId,
  OcsfCategoryUid,
  OcsfMetadata,
  OcsfProduct,
  OcsfObservable,
  OcsfReputation,
  OcsfEnrichment,
  OcsfBaseEvent,
  NatoSourceReliability,
  NatoInformationCredibility,
  CommanderEventExtensions,
} from './ocsf-types';
export {
  OCSF_SEVERITY_LABELS,
  OCSF_STATUS_LABELS,
  OCSF_CATEGORY_LABELS,
  NATO_RELIABILITY_LABELS,
  NATO_CREDIBILITY_LABELS,
  computeTypeUid,
  deriveSeverityLabel,
} from './ocsf-types';

export type {
  Signal,
  SignalStatus,
  SignalValidation,
} from './signal';
export { validateSignal } from './signal';

export type {
  FindingEvent,
  FindingState,
  MitreAttackReference,
  FindingEventValidation,
} from './finding-event';
export { validateFindingEvent } from './finding-event';

export type {
  RemediationEvent,
  RemediationStatus,
  RemediationMethod,
  RemediationEventValidation,
} from './remediation-event';
export { validateRemediationEvent } from './remediation-event';

export type {
  IntelligenceAssessment,
  AssessmentStatus,
  ThreatLevel,
  IntelligenceAssessmentValidation,
} from './intelligence-assessment';
export { validateIntelligenceAssessment } from './intelligence-assessment';
