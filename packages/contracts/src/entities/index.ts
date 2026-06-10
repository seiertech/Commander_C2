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
