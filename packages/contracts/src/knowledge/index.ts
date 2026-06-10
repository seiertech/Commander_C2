/**
 * Knowledge Export — Commander C2
 *
 * Central registry for knowledge export eligibility and derivation rules.
 * Infrastructure-neutral. No AWS/RAG/vector/embedding concepts.
 * Dormant until a future export service consumes it.
 */

export {
  // Types
  type KnowledgeClassification,
  type KnowledgeSensitivity,
  type KnowledgeEligibleEntityType,
  type KnowledgeExcludedEntityType,
  type KnowledgeExportMetadata,
  type DerivationRule,
  // Constants
  KNOWLEDGE_CLASSIFICATIONS,
  KNOWLEDGE_SENSITIVITIES,
  KNOWLEDGE_ELIGIBLE_ENTITIES,
  KNOWLEDGE_EXCLUDED_ENTITIES,
  KNOWLEDGE_DERIVATION_RULES,
  // Helpers
  isKnowledgeEligible,
  isKnowledgeExcluded,
} from './knowledge-export-registry';
