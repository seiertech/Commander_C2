/**
 * Seed StandardsFieldMapping — TOGAF & Zachman — Commander C2 Fixtures
 *
 * Field-by-field evidence of adherence to TOGAF 10 and Zachman Framework 3.0
 * for the ArchitectureClassification and TopologyNode entities.
 *
 * Standards adherence:
 *   - TOGAF 10 domain names exact per Open Group
 *   - Zachman 3.0 aspect/perspective names exact per Zachman International
 *   - commander_ prefix on all extension fields
 */

import type { StandardsFieldMapping } from '../entities/standards-field-mapping';
import { validateStandardsFieldMapping } from '../entities/standards-field-mapping';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

// ─── Helper ──────────────────────────────────────────────────────────────────

const now = '2026-06-10T00:00:00.000Z';
const togafDeclarationId = seedId('standards-declaration', 5);
const zachmanDeclarationId = seedId('standards-declaration', 6);

let mappingSeq = 0;

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
    declarationId: '',
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

// ─── TOGAF Field Mappings — ArchitectureClassification ───────────────────────

const TOGAF_ARCH_MAPPINGS: StandardsFieldMapping[] = [
  makeMapping({
    declarationId: togafDeclarationId,
    entityName: 'ArchitectureClassification',
    entityFile: 'architecture-classification.ts',
    commanderFieldName: 'togafDomain',
    commanderFieldType: 'TogafDomain',
    commanderFieldPath: 'ArchitectureClassification.togafDomain',
    standardFieldName: 'Architecture Domain',
    standardFieldPath: 'TOGAF.ADM.Architecture_Domain',
    standardFieldType: 'Enumeration',
    standardDefinition: 'One of four architecture domains: Business, Data, Application, Technology',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    declarationId: togafDeclarationId,
    entityName: 'ArchitectureClassification',
    entityFile: 'architecture-classification.ts',
    commanderFieldName: 'togafSecondaryDomain',
    commanderFieldType: 'TogafDomain | null',
    commanderFieldPath: 'ArchitectureClassification.togafSecondaryDomain',
    standardFieldName: 'Secondary Domain',
    standardFieldPath: 'TOGAF.ADM.Cross_Cutting_Domain',
    standardFieldType: 'Enumeration | null',
    standardDefinition: 'Optional secondary domain for cross-cutting artefacts',
    standardRequirement: 'optional',
    conformanceType: 'extension',
    justification: 'TOGAF does not formally define secondary domain; Commander extends for cross-cutting governance',
  }),
  makeMapping({
    declarationId: togafDeclarationId,
    entityName: 'ArchitectureClassification',
    entityFile: 'architecture-classification.ts',
    commanderFieldName: 'togafAdmPhase',
    commanderFieldType: 'string',
    commanderFieldPath: 'ArchitectureClassification.togafAdmPhase',
    standardFieldName: 'ADM Phase',
    standardFieldPath: 'TOGAF.ADM.Phase',
    standardFieldType: 'String',
    standardDefinition: 'Architecture Development Method phase (Preliminary, A-H, Requirements Management)',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    declarationId: togafDeclarationId,
    entityName: 'ArchitectureClassification',
    entityFile: 'architecture-classification.ts',
    commanderFieldName: 'artefactType',
    commanderFieldType: 'string',
    commanderFieldPath: 'ArchitectureClassification.artefactType',
    standardFieldName: 'Building Block Type',
    standardFieldPath: 'TOGAF.Content_Framework.Building_Block',
    standardFieldType: 'String',
    standardDefinition: 'Type of architecture building block (ABB or SBB)',
    standardRequirement: 'recommended',
    conformanceType: 'semantic_match',
    justification: 'Commander uses artefactType as a broader classification than strict ABB/SBB taxonomy',
  }),
];

// ─── TOGAF Field Mappings — TopologyNode ─────────────────────────────────────

const TOGAF_TOPO_MAPPINGS: StandardsFieldMapping[] = [
  makeMapping({
    declarationId: togafDeclarationId,
    entityName: 'TopologyNode',
    entityFile: 'topology-node.ts',
    commanderFieldName: 'togafDomain',
    commanderFieldType: 'TogafDomain',
    commanderFieldPath: 'TopologyNode.togafDomain',
    standardFieldName: 'Architecture Domain',
    standardFieldPath: 'TOGAF.ADM.Architecture_Domain',
    standardFieldType: 'Enumeration',
    standardDefinition: 'Domain classification of the technology component',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    declarationId: togafDeclarationId,
    entityName: 'TopologyNode',
    entityFile: 'topology-node.ts',
    commanderFieldName: 'nodeType',
    commanderFieldType: 'TopologyNodeType',
    commanderFieldPath: 'TopologyNode.nodeType',
    standardFieldName: 'Technology Component Type',
    standardFieldPath: 'TOGAF.TRM.Platform_Service',
    standardFieldType: 'Enumeration',
    standardDefinition: 'Type of technology component in the Technology Reference Model',
    standardRequirement: 'required',
    conformanceType: 'semantic_match',
    justification: 'Commander nodeType aligns to TOGAF TRM platform service categories with extended granularity',
  }),
  makeMapping({
    declarationId: togafDeclarationId,
    entityName: 'TopologyNode',
    entityFile: 'topology-node.ts',
    commanderFieldName: 'environment',
    commanderFieldType: 'string',
    commanderFieldPath: 'TopologyNode.environment',
    standardFieldName: 'Deployment Environment',
    standardFieldPath: 'TOGAF.Implementation.Environment',
    standardFieldType: 'String',
    standardDefinition: 'Target deployment environment for the component',
    standardRequirement: 'recommended',
    conformanceType: 'exact',
  }),
  makeMapping({
    declarationId: togafDeclarationId,
    entityName: 'TopologyNode',
    entityFile: 'topology-node.ts',
    commanderFieldName: 'region',
    commanderFieldType: 'string',
    commanderFieldPath: 'TopologyNode.region',
    standardFieldName: 'Location',
    standardFieldPath: 'TOGAF.ADM.Technology_Architecture.Location',
    standardFieldType: 'String',
    standardDefinition: 'Physical or logical location of the technology component',
    standardRequirement: 'recommended',
    conformanceType: 'semantic_match',
    justification: 'Commander uses cloud region identifiers aligned to TOGAF location concept',
  }),
];

// ─── Zachman Field Mappings — ArchitectureClassification ─────────────────────

const ZACHMAN_ARCH_MAPPINGS: StandardsFieldMapping[] = [
  makeMapping({
    declarationId: zachmanDeclarationId,
    entityName: 'ArchitectureClassification',
    entityFile: 'architecture-classification.ts',
    commanderFieldName: 'zachmanAspect',
    commanderFieldType: 'ZachmanAspect',
    commanderFieldPath: 'ArchitectureClassification.zachmanAspect',
    standardFieldName: 'Column (Interrogative)',
    standardFieldPath: 'Zachman.Matrix.Column',
    standardFieldType: 'Enumeration',
    standardDefinition: 'What, How, Where, Who, When, Why — the six interrogatives',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    declarationId: zachmanDeclarationId,
    entityName: 'ArchitectureClassification',
    entityFile: 'architecture-classification.ts',
    commanderFieldName: 'zachmanPerspective',
    commanderFieldType: 'ZachmanPerspective',
    commanderFieldPath: 'ArchitectureClassification.zachmanPerspective',
    standardFieldName: 'Row (Perspective)',
    standardFieldPath: 'Zachman.Matrix.Row',
    standardFieldType: 'Enumeration',
    standardDefinition: 'Executive, Business Management, Architect, Engineer, Technician, Enterprise',
    standardRequirement: 'required',
    conformanceType: 'exact',
  }),
  makeMapping({
    declarationId: zachmanDeclarationId,
    entityName: 'ArchitectureClassification',
    entityFile: 'architecture-classification.ts',
    commanderFieldName: 'zachmanSecondaryAspect',
    commanderFieldType: 'ZachmanAspect | null',
    commanderFieldPath: 'ArchitectureClassification.zachmanSecondaryAspect',
    standardFieldName: 'Secondary Column',
    standardFieldPath: 'Zachman.Matrix.Secondary_Column',
    standardFieldType: 'Enumeration | null',
    standardDefinition: 'Optional secondary interrogative for multi-concern artefacts',
    standardRequirement: 'optional',
    conformanceType: 'extension',
    justification: 'Zachman cells are singular; Commander extends for artefacts spanning multiple concerns',
  }),
  makeMapping({
    declarationId: zachmanDeclarationId,
    entityName: 'ArchitectureClassification',
    entityFile: 'architecture-classification.ts',
    commanderFieldName: 'zachmanSecondaryPerspective',
    commanderFieldType: 'ZachmanPerspective | null',
    commanderFieldPath: 'ArchitectureClassification.zachmanSecondaryPerspective',
    standardFieldName: 'Secondary Row',
    standardFieldPath: 'Zachman.Matrix.Secondary_Row',
    standardFieldType: 'Enumeration | null',
    standardDefinition: 'Optional secondary perspective for multi-stakeholder artefacts',
    standardRequirement: 'optional',
    conformanceType: 'extension',
    justification: 'Zachman cells are singular; Commander extends for multi-perspective governance',
  }),
  makeMapping({
    declarationId: zachmanDeclarationId,
    entityName: 'ArchitectureClassification',
    entityFile: 'architecture-classification.ts',
    commanderFieldName: 'artefactName',
    commanderFieldType: 'string',
    commanderFieldPath: 'ArchitectureClassification.artefactName',
    standardFieldName: 'Cell Primitive',
    standardFieldPath: 'Zachman.Cell.Primitive',
    standardFieldType: 'String',
    standardDefinition: 'The fundamental thing (primitive) represented in a Zachman cell',
    standardRequirement: 'required',
    conformanceType: 'semantic_match',
    justification: 'Commander artefactName maps to the Zachman concept of cell primitive content',
  }),
  makeMapping({
    declarationId: zachmanDeclarationId,
    entityName: 'ArchitectureClassification',
    entityFile: 'architecture-classification.ts',
    commanderFieldName: 'artefactDescription',
    commanderFieldType: 'string',
    commanderFieldPath: 'ArchitectureClassification.artefactDescription',
    standardFieldName: 'Cell Composite Description',
    standardFieldPath: 'Zachman.Cell.Composite',
    standardFieldType: 'String',
    standardDefinition: 'Description of the composite model within the Zachman cell',
    standardRequirement: 'recommended',
    conformanceType: 'semantic_match',
    justification: 'Commander description provides composite context for the cell content',
  }),
];

// ─── Zachman Field Mappings — TopologyNode ───────────────────────────────────

const ZACHMAN_TOPO_MAPPINGS: StandardsFieldMapping[] = [
  makeMapping({
    declarationId: zachmanDeclarationId,
    entityName: 'TopologyNode',
    entityFile: 'topology-node.ts',
    commanderFieldName: 'nodeName',
    commanderFieldType: 'string',
    commanderFieldPath: 'TopologyNode.nodeName',
    standardFieldName: 'What (Data)',
    standardFieldPath: 'Zachman.Matrix.What.Technician',
    standardFieldType: 'String',
    standardDefinition: 'The data entity at the Technician perspective — physical component name',
    standardRequirement: 'required',
    conformanceType: 'semantic_match',
    justification: 'Node name represents the What interrogative at Technician perspective',
  }),
  makeMapping({
    declarationId: zachmanDeclarationId,
    entityName: 'TopologyNode',
    entityFile: 'topology-node.ts',
    commanderFieldName: 'zone',
    commanderFieldType: 'string',
    commanderFieldPath: 'TopologyNode.zone',
    standardFieldName: 'Where (Network)',
    standardFieldPath: 'Zachman.Matrix.Where.Technician',
    standardFieldType: 'String',
    standardDefinition: 'The network location at Technician perspective — logical zone/segment',
    standardRequirement: 'required',
    conformanceType: 'semantic_match',
    justification: 'Zone maps to Zachman Where column at technology implementation level',
  }),
  makeMapping({
    declarationId: zachmanDeclarationId,
    entityName: 'TopologyNode',
    entityFile: 'topology-node.ts',
    commanderFieldName: 'owner',
    commanderFieldType: 'string',
    commanderFieldPath: 'TopologyNode.owner',
    standardFieldName: 'Who (People)',
    standardFieldPath: 'Zachman.Matrix.Who.Engineer',
    standardFieldType: 'String',
    standardDefinition: 'The responsible party at Engineer perspective — owning team',
    standardRequirement: 'required',
    conformanceType: 'semantic_match',
    justification: 'Owner maps to Zachman Who column representing responsible organisation unit',
  }),
  makeMapping({
    declarationId: zachmanDeclarationId,
    entityName: 'TopologyNode',
    entityFile: 'topology-node.ts',
    commanderFieldName: 'lastSeenAt',
    commanderFieldType: 'string',
    commanderFieldPath: 'TopologyNode.lastSeenAt',
    standardFieldName: 'When (Time)',
    standardFieldPath: 'Zachman.Matrix.When.Technician',
    standardFieldType: 'Timestamp',
    standardDefinition: 'The temporal dimension at Technician perspective — last observed time',
    standardRequirement: 'recommended',
    conformanceType: 'semantic_match',
    justification: 'lastSeenAt maps to Zachman When column at operational monitoring level',
  }),
];

// ─── Consolidated Export ─────────────────────────────────────────────────────

export const SEED_FIELD_MAPPINGS_TOGAF: StandardsFieldMapping[] = [
  ...TOGAF_ARCH_MAPPINGS,
  ...TOGAF_TOPO_MAPPINGS,
];

export const SEED_FIELD_MAPPINGS_ZACHMAN: StandardsFieldMapping[] = [
  ...ZACHMAN_ARCH_MAPPINGS,
  ...ZACHMAN_TOPO_MAPPINGS,
];

export const SEED_FIELD_MAPPINGS_TOGAF_ZACHMAN: StandardsFieldMapping[] = [
  ...SEED_FIELD_MAPPINGS_TOGAF,
  ...SEED_FIELD_MAPPINGS_ZACHMAN,
];

// ─── Validation Gate ─────────────────────────────────────────────────────────

export function validateAllTogafZachmanMappings(): { index: number; errors: string[] }[] {
  const failures: { index: number; errors: string[] }[] = [];
  SEED_FIELD_MAPPINGS_TOGAF_ZACHMAN.forEach((mapping, index) => {
    const result = validateStandardsFieldMapping(mapping);
    if (!result.valid) {
      failures.push({ index, errors: result.errors });
    }
  });
  return failures;
}
