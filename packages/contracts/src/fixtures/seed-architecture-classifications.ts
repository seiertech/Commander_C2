/**
 * Seed Architecture Classifications — Commander C2 Fixtures
 *
 * Covers all 4 TOGAF domains with representative artefacts,
 * each cross-mapped to Zachman aspect/perspective.
 *
 * Standards adherence:
 *   - TOGAF 10 domain names exact
 *   - Zachman 3.0 aspect/perspective names exact
 */

import type { ArchitectureClassification } from '../entities/architecture-classification';
import { validateArchitectureClassification } from '../entities/architecture-classification';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

// ─── Helper ──────────────────────────────────────────────────────────────────

const now = '2026-06-10T00:00:00.000Z';

function makeClassification(
  seq: number,
  overrides: Partial<ArchitectureClassification>,
): ArchitectureClassification {
  const id = seedId('architecture-classification', seq);
  return {
    id,
    entityType: 'architecture-classification',
    tenant: SEED_TENANT,
    createdAt: now,
    updatedAt: now,
    source: SEED_SOURCE,
    classificationId: id,
    artefactName: '',
    artefactType: '',
    artefactDescription: '',
    togafDomain: 'Technology',
    togafSecondaryDomain: null,
    togafAdmPhase: 'Phase B',
    zachmanAspect: 'What',
    zachmanPerspective: 'Architect',
    zachmanSecondaryAspect: null,
    zachmanSecondaryPerspective: null,
    classifiedBy: 'Commander Architecture',
    classificationDate: now,
    status: 'active',
    tags: [],
    ...overrides,
  } as ArchitectureClassification;
}

// ─── Seed Architecture Classifications ───────────────────────────────────────

export const SEED_ARCHITECTURE_CLASSIFICATIONS: ArchitectureClassification[] = [
  // ─── TOGAF: Business Architecture ────────────────────────────────
  makeClassification(1, {
    artefactName: 'Security Operations Capability',
    artefactType: 'capability',
    artefactDescription: 'Core business capability for managing security operations lifecycle',
    togafDomain: 'Business',
    togafAdmPhase: 'Phase B',
    zachmanAspect: 'Why',
    zachmanPerspective: 'Executive',
    tags: ['soc', 'capability', 'core'],
  }),
  makeClassification(2, {
    artefactName: 'Incident Response Process',
    artefactType: 'process',
    artefactDescription: 'End-to-end incident response workflow from detection to resolution',
    togafDomain: 'Business',
    togafAdmPhase: 'Phase B',
    zachmanAspect: 'How',
    zachmanPerspective: 'Business Management',
    tags: ['incident', 'process', 'workflow'],
  }),
  makeClassification(3, {
    artefactName: 'Risk Governance Function',
    artefactType: 'capability',
    artefactDescription: 'Enterprise risk governance aligned to ISO 31000 principles',
    togafDomain: 'Business',
    togafSecondaryDomain: 'Data',
    togafAdmPhase: 'Phase B',
    zachmanAspect: 'Why',
    zachmanPerspective: 'Executive',
    zachmanSecondaryAspect: 'What',
    zachmanSecondaryPerspective: null,
    tags: ['risk', 'governance', 'iso-31000'],
  }),

  // ─── TOGAF: Data Architecture ────────────────────────────────────
  makeClassification(4, {
    artefactName: 'OCSF Event Schema',
    artefactType: 'data-store',
    artefactDescription: 'Canonical event data model adhering to OCSF 1.3.0 schema',
    togafDomain: 'Data',
    togafAdmPhase: 'Phase C',
    zachmanAspect: 'What',
    zachmanPerspective: 'Architect',
    tags: ['ocsf', 'schema', 'events'],
  }),
  makeClassification(5, {
    artefactName: 'Standards Evidence Store',
    artefactType: 'data-store',
    artefactDescription: 'Persistent store for StandardsDeclaration, FieldMapping, VersionHistory',
    togafDomain: 'Data',
    togafAdmPhase: 'Phase C',
    zachmanAspect: 'What',
    zachmanPerspective: 'Engineer',
    tags: ['standards', 'evidence', 'persistence'],
  }),
  makeClassification(6, {
    artefactName: 'Topology Graph Model',
    artefactType: 'data-store',
    artefactDescription: 'Graph-based infrastructure topology with nodes and edges',
    togafDomain: 'Data',
    togafSecondaryDomain: 'Technology',
    togafAdmPhase: 'Phase C',
    zachmanAspect: 'Where',
    zachmanPerspective: 'Architect',
    zachmanSecondaryAspect: 'What',
    zachmanSecondaryPerspective: null,
    tags: ['topology', 'graph', 'infrastructure'],
  }),

  // ─── TOGAF: Application Architecture ─────────────────────────────
  makeClassification(7, {
    artefactName: 'Commander Signal Processor',
    artefactType: 'service',
    artefactDescription: 'Event ingestion and normalisation service for OCSF signals',
    togafDomain: 'Application',
    togafAdmPhase: 'Phase C',
    zachmanAspect: 'How',
    zachmanPerspective: 'Engineer',
    tags: ['signal', 'ingestion', 'ocsf'],
  }),
  makeClassification(8, {
    artefactName: 'Commander AI Orchestrator',
    artefactType: 'service',
    artefactDescription: 'AI persona routing and channel orchestration service',
    togafDomain: 'Application',
    togafAdmPhase: 'Phase C',
    zachmanAspect: 'How',
    zachmanPerspective: 'Architect',
    tags: ['ai', 'orchestration', 'personas'],
  }),
  makeClassification(9, {
    artefactName: 'Approval Workflow Engine',
    artefactType: 'service',
    artefactDescription: 'OODA-tempo approval workflow with leaderboard metrics',
    togafDomain: 'Application',
    togafAdmPhase: 'Phase C',
    zachmanAspect: 'When',
    zachmanPerspective: 'Business Management',
    tags: ['approval', 'ooda', 'workflow'],
  }),

  // ─── TOGAF: Technology Architecture ──────────────────────────────
  makeClassification(10, {
    artefactName: 'AWS Bedrock Runtime',
    artefactType: 'service',
    artefactDescription: 'Internal LLM inference runtime — invisible to customer',
    togafDomain: 'Technology',
    togafAdmPhase: 'Phase D',
    zachmanAspect: 'How',
    zachmanPerspective: 'Technician',
    tags: ['aws', 'bedrock', 'internal', 'ai'],
  }),
  makeClassification(11, {
    artefactName: 'Event Bus Infrastructure',
    artefactType: 'service',
    artefactDescription: 'Message broker for async event distribution across services',
    togafDomain: 'Technology',
    togafAdmPhase: 'Phase D',
    zachmanAspect: 'How',
    zachmanPerspective: 'Engineer',
    tags: ['messaging', 'event-bus', 'async'],
  }),
  makeClassification(12, {
    artefactName: 'Multi-Tenant Compute Cluster',
    artefactType: 'compute',
    artefactDescription: 'Container orchestration cluster with tenant isolation',
    togafDomain: 'Technology',
    togafAdmPhase: 'Phase D',
    zachmanAspect: 'Where',
    zachmanPerspective: 'Technician',
    tags: ['compute', 'containers', 'multi-tenant'],
  }),
];

// ─── Validation Gate ─────────────────────────────────────────────────────────

export function validateAllSeedArchitectureClassifications(): { index: number; errors: string[] }[] {
  const failures: { index: number; errors: string[] }[] = [];
  SEED_ARCHITECTURE_CLASSIFICATIONS.forEach((cls, index) => {
    const result = validateArchitectureClassification(cls);
    if (!result.valid) {
      failures.push({ index, errors: result.errors });
    }
  });
  return failures;
}
