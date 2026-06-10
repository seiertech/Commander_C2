/**
 * Commander C2 Fixtures — Central Export
 *
 * All seed fixtures exported from this index.
 * Import from '@commander/contracts/fixtures'.
 */

// ─── Seed Infrastructure ─────────────────────────────────────────────────────
export { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

// ─── Standards Declarations ──────────────────────────────────────────────────
export { SEED_DECLARATIONS, validateAllSeedDeclarations } from './seed-standards-declarations';

// ─── Architecture Classifications ────────────────────────────────────────────
export {
  SEED_ARCHITECTURE_CLASSIFICATIONS,
  validateAllSeedArchitectureClassifications,
} from './seed-architecture-classifications';

// ─── Topology (Nodes + Edges) ────────────────────────────────────────────────
export {
  SEED_TOPOLOGY_NODES,
  SEED_TOPOLOGY_EDGES,
  validateAllSeedTopologyNodes,
  validateAllSeedTopologyEdges,
} from './seed-topology';

// ─── Field Mappings: TOGAF & Zachman ─────────────────────────────────────────
export {
  SEED_FIELD_MAPPINGS_TOGAF,
  SEED_FIELD_MAPPINGS_ZACHMAN,
  SEED_FIELD_MAPPINGS_TOGAF_ZACHMAN,
  validateAllTogafZachmanMappings,
} from './seed-field-mappings-togaf-zachman';

// ─── Field Mappings: OCSF + NATO/Admiralty + MITRE ATT&CK ───────────────────
export {
  SEED_FIELD_MAPPINGS_OCSF_SIGNAL,
  SEED_FIELD_MAPPINGS_OCSF_FINDING,
  SEED_FIELD_MAPPINGS_OCSF_REMEDIATION,
  SEED_FIELD_MAPPINGS_OCSF_ASSESSMENT,
  SEED_FIELD_MAPPINGS_OCSF_ALL,
  validateAllOcsfMappings,
} from './seed-field-mappings-ocsf';
