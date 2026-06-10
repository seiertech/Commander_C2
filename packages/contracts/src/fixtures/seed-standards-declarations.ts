/**
 * Seed Standards Declarations — Commander C2 Fixtures
 *
 * 13 declaration records covering Commander's adopted standards.
 * Standards Fidelity Doctrine: zero exclusions, 34 standards total.
 * These 13 represent the primary governing standards; remaining standards
 * derive through field mappings from these declarations.
 *
 * Adherence model: strict | aligned | derived | partial
 */

import type { StandardsDeclaration } from '../entities/standards-declaration';
import { validateStandardsDeclaration } from '../entities/standards-declaration';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

// ─── Helper ──────────────────────────────────────────────────────────────────

const now = '2026-06-10T00:00:00.000Z';
const reviewDate = '2027-06-10T00:00:00.000Z';

function makeDeclaration(
  seq: number,
  overrides: Partial<StandardsDeclaration>,
): StandardsDeclaration {
  const id = seedId('standards-declaration', seq);
  return {
    id,
    entityType: 'standards-declaration',
    tenant: SEED_TENANT,
    createdAt: now,
    updatedAt: now,
    source: SEED_SOURCE,
    declarationId: id,
    standardName: '',
    standardVersion: '',
    standardPublisher: '',
    standardCategory: 'schema',
    standardUrl: '',
    thesisLayer: '',
    scope: '',
    governedEntities: [],
    conformanceLevel: 'strict',
    totalFields: 0,
    exactFields: 0,
    conformancePercentage: 0,
    declaredBy: 'Commander Architecture',
    declarationDate: now,
    reviewDate,
    supersedes: null,
    status: 'active',
    ...overrides,
  } as StandardsDeclaration;
}

// ─── 13 Standards Declarations ───────────────────────────────────────────────

export const SEED_DECLARATIONS: StandardsDeclaration[] = [
  // 1. OCSF — Event & Intelligence Layer
  makeDeclaration(1, {
    standardName: 'OCSF',
    standardVersion: '1.3.0',
    standardPublisher: 'OCSF Project / Linux Foundation',
    standardCategory: 'schema',
    standardUrl: 'https://schema.ocsf.io/1.3.0/',
    thesisLayer: 'Event & Intelligence',
    scope: 'Event schema, field names, type_uid computation, severity classification',
    governedEntities: ['Signal', 'FindingEvent', 'RemediationEvent', 'IntelligenceAssessment'],
    conformanceLevel: 'strict',
    totalFields: 32,
    exactFields: 28,
    conformancePercentage: 87.5,
  }),

  // 2. NIST CSF 2.0 — Risk & Posture Layer
  makeDeclaration(2, {
    standardName: 'NIST CSF 2.0',
    standardVersion: '2.0',
    standardPublisher: 'NIST',
    standardCategory: 'taxonomy',
    standardUrl: 'https://www.nist.gov/cyberframework',
    thesisLayer: 'Risk & Posture',
    scope: 'Function/Category/Subcategory taxonomy for posture scoring',
    governedEntities: ['PostureScore', 'ControlAssessment', 'RiskRegister'],
    conformanceLevel: 'aligned',
    totalFields: 18,
    exactFields: 12,
    conformancePercentage: 66.7,
  }),

  // 3. ISO 27005 — Risk Assessment
  makeDeclaration(3, {
    standardName: 'ISO 27005',
    standardVersion: '2022',
    standardPublisher: 'ISO/IEC',
    standardCategory: 'terminology',
    standardUrl: 'https://www.iso.org/standard/80585.html',
    thesisLayer: 'Risk & Posture',
    scope: 'Risk assessment terminology — consequence (not impact), likelihood, risk level',
    governedEntities: ['RiskRegister', 'RiskAssessment'],
    conformanceLevel: 'strict',
    totalFields: 14,
    exactFields: 14,
    conformancePercentage: 100,
  }),

  // 4. ISO 31000 — Enterprise Risk Management
  makeDeclaration(4, {
    standardName: 'ISO 31000',
    standardVersion: '2018',
    standardPublisher: 'ISO',
    standardCategory: 'terminology',
    standardUrl: 'https://www.iso.org/standard/65694.html',
    thesisLayer: 'Risk & Posture',
    scope: 'Enterprise risk management principles and framework terminology',
    governedEntities: ['RiskRegister', 'RiskTreatment'],
    conformanceLevel: 'aligned',
    totalFields: 10,
    exactFields: 8,
    conformancePercentage: 80,
  }),

  // 5. TOGAF 10 — Architecture Classification
  makeDeclaration(5, {
    standardName: 'TOGAF',
    standardVersion: '10',
    standardPublisher: 'The Open Group',
    standardCategory: 'taxonomy',
    standardUrl: 'https://www.opengroup.org/togaf',
    thesisLayer: 'Architecture & Topology',
    scope: '4 architecture domains (Business, Data, Application, Technology)',
    governedEntities: ['ArchitectureClassification', 'TopologyNode'],
    conformanceLevel: 'aligned',
    totalFields: 12,
    exactFields: 8,
    conformancePercentage: 66.7,
  }),

  // 6. Zachman Framework — Architecture Classification
  makeDeclaration(6, {
    standardName: 'Zachman Framework',
    standardVersion: '3.0',
    standardPublisher: 'Zachman International',
    standardCategory: 'taxonomy',
    standardUrl: 'https://zachman-feac.com/zachman/philosopher/item/the-zachman-framework-evolution',
    thesisLayer: 'Architecture & Topology',
    scope: '6 aspects (What, How, Where, Who, When, Why) x 6 perspectives',
    governedEntities: ['ArchitectureClassification', 'TopologyNode'],
    conformanceLevel: 'aligned',
    totalFields: 14,
    exactFields: 10,
    conformancePercentage: 71.4,
  }),

  // 7. MITRE ATT&CK — Threat Intelligence
  makeDeclaration(7, {
    standardName: 'MITRE ATT&CK',
    standardVersion: '15.1',
    standardPublisher: 'MITRE Corporation',
    standardCategory: 'taxonomy',
    standardUrl: 'https://attack.mitre.org/',
    thesisLayer: 'Event & Intelligence',
    scope: 'Tactic/Technique/Sub-technique classification for threat correlation',
    governedEntities: ['IntelligenceAssessment', 'FindingEvent', 'ThreatActor'],
    conformanceLevel: 'strict',
    totalFields: 16,
    exactFields: 16,
    conformancePercentage: 100,
  }),

  // 8. ITIL 4 / ISO 19770 — Asset & Service Management
  makeDeclaration(8, {
    standardName: 'ITIL 4 / ISO 19770',
    standardVersion: 'ITIL 4 (2019) / ISO 19770-1:2017',
    standardPublisher: 'Axelos / ISO',
    standardCategory: 'taxonomy',
    standardUrl: 'https://www.axelos.com/certifications/itil-service-management',
    thesisLayer: 'Asset & Configuration',
    scope: 'Service asset lifecycle, CI classification, software asset management',
    governedEntities: ['AssetRecord', 'ConfigurationItem', 'ServiceCatalogEntry'],
    conformanceLevel: 'aligned',
    totalFields: 20,
    exactFields: 14,
    conformancePercentage: 70,
  }),

  // 9. CTEM / OODA — Continuous Threat Exposure Management + Decision Loop
  makeDeclaration(9, {
    standardName: 'CTEM / OODA',
    standardVersion: 'Gartner CTEM 2022 / Boyd OODA',
    standardPublisher: 'Gartner / John Boyd',
    standardCategory: 'taxonomy',
    standardUrl: 'https://www.gartner.com/en/articles/how-to-manage-cybersecurity-threats-not-episodes',
    thesisLayer: 'Operational Tempo',
    scope: '5-phase CTEM cycle + OODA loop tempo metrics for approval/response',
    governedEntities: ['ExposureAssessment', 'DecisionRecord', 'ApprovalWorkflow'],
    conformanceLevel: 'aligned',
    totalFields: 15,
    exactFields: 10,
    conformancePercentage: 66.7,
  }),

  // 10. NATO/Admiralty — Source Reliability & Information Credibility
  makeDeclaration(10, {
    standardName: 'NATO/Admiralty Code',
    standardVersion: 'STANAG 2022 / AJP-2.1',
    standardPublisher: 'NATO',
    standardCategory: 'taxonomy',
    standardUrl: 'https://www.nato.int/cps/en/natohq/topics_57564.htm',
    thesisLayer: 'Event & Intelligence',
    scope: 'Source reliability (A-F) and information credibility (1-6) grading',
    governedEntities: ['IntelligenceAssessment', 'Signal'],
    conformanceLevel: 'strict',
    totalFields: 6,
    exactFields: 6,
    conformancePercentage: 100,
  }),

  // 11. CMMI / COBIT — Maturity & Governance
  makeDeclaration(11, {
    standardName: 'CMMI / COBIT',
    standardVersion: 'CMMI v2.0 / COBIT 2019',
    standardPublisher: 'ISACA / CMMI Institute',
    standardCategory: 'taxonomy',
    standardUrl: 'https://www.isaca.org/resources/cobit',
    thesisLayer: 'Governance & Maturity',
    scope: 'Maturity levels (0-5), process capability, governance objectives',
    governedEntities: ['MaturityAssessment', 'GovernanceObjective', 'ProcessCapability'],
    conformanceLevel: 'aligned',
    totalFields: 12,
    exactFields: 8,
    conformancePercentage: 66.7,
  }),

  // 12. DORA — DevOps Performance Metrics
  makeDeclaration(12, {
    standardName: 'DORA',
    standardVersion: '2023',
    standardPublisher: 'Google Cloud / DORA Team',
    standardCategory: 'taxonomy',
    standardUrl: 'https://dora.dev/research/',
    thesisLayer: 'Operational Tempo',
    scope: 'Full 4 DORA metrics: deployment frequency, lead time, change failure rate, MTTR',
    governedEntities: ['DeploymentMetric', 'ChangeFailureRecord', 'RecoveryMetric'],
    conformanceLevel: 'strict',
    totalFields: 8,
    exactFields: 8,
    conformancePercentage: 100,
  }),

  // 13. CBP / Portfolio / OKR / DMAIC — Strategy & Delivery
  makeDeclaration(13, {
    standardName: 'CBP / OKR / DMAIC',
    standardVersion: 'CBP 2024 / OKR (Doerr) / Six Sigma DMAIC',
    standardPublisher: 'Various (Capability-Based Planning / Doerr / Six Sigma Institute)',
    standardCategory: 'taxonomy',
    standardUrl: 'https://www.pmi.org/learning/library/capability-based-planning',
    thesisLayer: 'Strategy & Delivery',
    scope: 'Capability-based planning, portfolio OKR alignment, DMAIC improvement cycle',
    governedEntities: ['StrategicObjective', 'CapabilityItem', 'ImprovementCycle'],
    conformanceLevel: 'aligned',
    totalFields: 16,
    exactFields: 10,
    conformancePercentage: 62.5,
  }),
];

// ─── Validation Gate ─────────────────────────────────────────────────────────

/**
 * Validate all seed declarations. Returns errors array (empty = all pass).
 */
export function validateAllSeedDeclarations(): { index: number; errors: string[] }[] {
  const failures: { index: number; errors: string[] }[] = [];
  SEED_DECLARATIONS.forEach((decl, index) => {
    const result = validateStandardsDeclaration(decl);
    if (!result.valid) {
      failures.push({ index, errors: result.errors });
    }
  });
  return failures;
}
