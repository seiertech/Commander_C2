/**
 * Seed Risk & Posture Fixtures — Commander C2
 *
 * Risk registers (ISO 27005/31000), posture scores (NIST CSF 2.0),
 * and control assessments.
 *
 * Standards adherence:
 *   - ISO 27005: "consequence" (NOT "impact")
 *   - NIST CSF 2.0: 6 functions (Govern, Identify, Protect, Detect, Respond, Recover)
 */

import type { RiskRegister } from '../entities/risk-register';
import type { PostureScore } from '../entities/posture-score';
import type { ControlAssessment } from '../entities/control-assessment';
import { validateRiskRegister } from '../entities/risk-register';
import { validatePostureScore } from '../entities/posture-score';
import { validateControlAssessment } from '../entities/control-assessment';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const now = '2026-06-10T00:00:00.000Z';
const reviewDate = '2026-09-10T00:00:00.000Z';

// ─── Risk Register Fixtures ──────────────────────────────────────────────────

function makeRisk(seq: number, overrides: Partial<RiskRegister>): RiskRegister {
  const id = seedId('risk-register', seq);
  return {
    id,
    entityType: 'risk-register',
    tenant: SEED_TENANT,
    createdAt: now,
    updatedAt: now,
    source: SEED_SOURCE,
    riskId: id,
    title: '',
    description: '',
    category: 'technical',
    riskSource: '',
    potentialEvent: '',
    consequence: 'moderate',
    likelihood: 'possible',
    riskLevel: 'medium',
    riskScore: 9,
    status: 'identified',
    residualRiskLevel: null,
    residualRiskScore: null,
    treatmentStrategy: null,
    treatmentPlan: null,
    treatmentDeadline: null,
    treatmentOnTrack: null,
    riskOwner: 'Security Team Lead',
    riskAnalyst: null,
    relatedFindingIds: [],
    affectedNodeIds: [],
    relatedControlIds: [],
    nextReviewDate: reviewDate,
    commander_csfFunction: null,
    commander_aiTreatmentConfidence: null,
    ...overrides,
  } as RiskRegister;
}

export const SEED_RISK_REGISTERS: RiskRegister[] = [
  makeRisk(1, {
    title: 'Unpatched critical vulnerability in event store',
    description: 'Event store database running version with known CVE allowing privilege escalation',
    category: 'technical',
    riskSource: 'Vulnerability scanning',
    potentialEvent: 'Attacker exploits CVE to gain elevated privileges on event store',
    consequence: 'major',
    likelihood: 'likely',
    riskLevel: 'high',
    riskScore: 16,
    status: 'evaluated',
    treatmentStrategy: 'modify',
    treatmentPlan: 'Apply security patch within next maintenance window',
    treatmentDeadline: '2026-06-17T00:00:00.000Z',
    treatmentOnTrack: true,
    affectedNodeIds: [seedId('topology-node', 4)],
    commander_csfFunction: 'Protect',
  }),
  makeRisk(2, {
    title: 'Insufficient logging on AI orchestrator',
    description: 'AI Orchestrator lacks comprehensive audit trail for inference requests',
    category: 'compliance',
    riskSource: 'Internal audit',
    potentialEvent: 'Unable to reconstruct AI decision chain during incident investigation',
    consequence: 'moderate',
    likelihood: 'possible',
    riskLevel: 'medium',
    riskScore: 9,
    status: 'analysed',
    riskOwner: 'AI Platform Team Lead',
    affectedNodeIds: [seedId('topology-node', 2)],
    commander_csfFunction: 'Detect',
  }),
  makeRisk(3, {
    title: 'Single point of failure in event bus',
    description: 'Event bus lacks multi-AZ redundancy configuration',
    category: 'operational',
    riskSource: 'Architecture review',
    potentialEvent: 'AZ failure causes complete event pipeline disruption',
    consequence: 'catastrophic',
    likelihood: 'unlikely',
    riskLevel: 'high',
    riskScore: 15,
    status: 'treated',
    residualRiskLevel: 'low',
    residualRiskScore: 4,
    treatmentStrategy: 'modify',
    treatmentPlan: 'Deploy multi-AZ event bus configuration with automatic failover',
    treatmentDeadline: '2026-07-01T00:00:00.000Z',
    treatmentOnTrack: true,
    affectedNodeIds: [seedId('topology-node', 8)],
    commander_csfFunction: 'Recover',
  }),
  makeRisk(4, {
    title: 'Approval workflow bypass via API',
    description: 'Direct API access could potentially bypass OODA approval workflow',
    category: 'compliance',
    riskSource: 'Penetration testing',
    potentialEvent: 'Remediation actions executed without required approval',
    consequence: 'major',
    likelihood: 'rare',
    riskLevel: 'medium',
    riskScore: 8,
    status: 'treated',
    residualRiskLevel: 'very_low',
    residualRiskScore: 2,
    treatmentStrategy: 'modify',
    treatmentPlan: 'Enforce approval check at service layer with API gateway policy',
    treatmentDeadline: '2026-06-15T00:00:00.000Z',
    treatmentOnTrack: true,
    affectedNodeIds: [seedId('topology-node', 3), seedId('topology-node', 9)],
    commander_csfFunction: 'Govern',
  }),
  makeRisk(5, {
    title: 'Tenant data isolation breach via graph queries',
    description: 'Complex graph traversal queries could potentially cross tenant boundaries',
    category: 'technical',
    riskSource: 'Security architecture review',
    potentialEvent: 'Tenant A observes topology data belonging to Tenant B',
    consequence: 'catastrophic',
    likelihood: 'rare',
    riskLevel: 'high',
    riskScore: 12,
    status: 'monitoring',
    residualRiskLevel: 'low',
    residualRiskScore: 3,
    treatmentStrategy: 'modify',
    treatmentPlan: 'Row-level security + query rewriter enforcing tenant_id predicate',
    treatmentOnTrack: true,
    affectedNodeIds: [seedId('topology-node', 6)],
    commander_csfFunction: 'Protect',
  }),
];

// ─── Posture Score Fixtures (one per CSF Function) ───────────────────────────

function makePosture(seq: number, overrides: Partial<PostureScore>): PostureScore {
  const id = seedId('posture-score', seq);
  return {
    id,
    entityType: 'posture-score',
    tenant: SEED_TENANT,
    createdAt: now,
    updatedAt: now,
    source: SEED_SOURCE,
    scoreId: id,
    csfFunction: 'Identify',
    csfCategoryId: '',
    csfCategoryName: '',
    csfSubcategoryId: null,
    csfSubcategoryDescription: null,
    currentScore: 70,
    previousScore: null,
    targetScore: 85,
    tier: 'risk_informed',
    trend: 'stable',
    assessmentType: 'hybrid',
    assessedAt: now,
    assessedBy: 'Commander Automated Assessment',
    nextAssessmentDate: reviewDate,
    controlsAssessed: 10,
    controlsPassing: 7,
    relatedControlIds: [],
    commander_weightedContribution: null,
    commander_predictedScore30d: null,
    ...overrides,
  } as PostureScore;
}

export const SEED_POSTURE_SCORES: PostureScore[] = [
  makePosture(1, {
    csfFunction: 'Govern',
    csfCategoryId: 'GV.OC',
    csfCategoryName: 'Organizational Context',
    currentScore: 78,
    previousScore: 72,
    targetScore: 90,
    tier: 'repeatable',
    trend: 'positive',
    controlsAssessed: 12,
    controlsPassing: 9,
    commander_weightedContribution: 0.18,
  }),
  makePosture(2, {
    csfFunction: 'Identify',
    csfCategoryId: 'ID.AM',
    csfCategoryName: 'Asset Management',
    currentScore: 65,
    previousScore: 60,
    targetScore: 85,
    tier: 'risk_informed',
    trend: 'positive',
    controlsAssessed: 15,
    controlsPassing: 10,
    commander_weightedContribution: 0.16,
  }),
  makePosture(3, {
    csfFunction: 'Protect',
    csfCategoryId: 'PR.AC',
    csfCategoryName: 'Access Control',
    currentScore: 82,
    previousScore: 80,
    targetScore: 95,
    tier: 'repeatable',
    trend: 'positive',
    controlsAssessed: 18,
    controlsPassing: 15,
    commander_weightedContribution: 0.20,
  }),
  makePosture(4, {
    csfFunction: 'Detect',
    csfCategoryId: 'DE.CM',
    csfCategoryName: 'Continuous Monitoring',
    currentScore: 88,
    previousScore: 85,
    targetScore: 95,
    tier: 'repeatable',
    trend: 'positive',
    assessmentType: 'continuous',
    controlsAssessed: 20,
    controlsPassing: 18,
    commander_weightedContribution: 0.22,
    commander_predictedScore30d: 91,
  }),
  makePosture(5, {
    csfFunction: 'Respond',
    csfCategoryId: 'RS.MA',
    csfCategoryName: 'Incident Management',
    currentScore: 72,
    previousScore: 75,
    targetScore: 90,
    tier: 'risk_informed',
    trend: 'negative',
    controlsAssessed: 14,
    controlsPassing: 10,
    commander_weightedContribution: 0.14,
  }),
  makePosture(6, {
    csfFunction: 'Recover',
    csfCategoryId: 'RC.RP',
    csfCategoryName: 'Recovery Planning',
    currentScore: 60,
    previousScore: 58,
    targetScore: 80,
    tier: 'partial',
    trend: 'positive',
    controlsAssessed: 8,
    controlsPassing: 5,
    commander_weightedContribution: 0.10,
  }),
];

// ─── Control Assessment Fixtures ─────────────────────────────────────────────

function makeControl(seq: number, overrides: Partial<ControlAssessment>): ControlAssessment {
  const id = seedId('control-assessment', seq);
  return {
    id,
    entityType: 'control-assessment',
    tenant: SEED_TENANT,
    createdAt: now,
    updatedAt: now,
    source: SEED_SOURCE,
    controlId: id,
    controlName: '',
    controlDescription: '',
    controlFamily: '',
    controlReferenceId: '',
    csfFunction: 'Protect',
    csfCategoryId: '',
    csfSubcategoryId: null,
    status: 'implemented',
    effectiveness: 'effective',
    score: 85,
    assessedAt: now,
    assessedBy: 'Commander Automated Assessment',
    evidenceType: 'automated_scan',
    evidenceDescription: '',
    evidenceDate: now,
    consequenceOfFailure: '',
    consequenceSeverity: 'moderate',
    remediationRequired: null,
    remediationDeadline: null,
    relatedRiskIds: [],
    commander_automatedCheckPassed: null,
    commander_lastAutomatedCheck: null,
    commander_affectedNodeIds: [],
    ...overrides,
  } as ControlAssessment;
}

export const SEED_CONTROL_ASSESSMENTS: ControlAssessment[] = [
  makeControl(1, {
    controlName: 'Multi-Factor Authentication',
    controlDescription: 'MFA enforced for all administrative and privileged access',
    controlFamily: 'Access Control',
    controlReferenceId: 'PR.AC-07',
    csfFunction: 'Protect',
    csfCategoryId: 'PR.AC',
    csfSubcategoryId: 'PR.AC-07',
    status: 'implemented',
    effectiveness: 'effective',
    score: 95,
    evidenceType: 'automated_scan',
    evidenceDescription: 'Identity provider audit shows 100% MFA enforcement for admin roles',
    consequenceOfFailure: 'Unauthorised administrative access leading to data breach',
    consequenceSeverity: 'catastrophic',
    commander_automatedCheckPassed: true,
    commander_lastAutomatedCheck: now,
    commander_affectedNodeIds: [seedId('topology-node', 10)],
  }),
  makeControl(2, {
    controlName: 'Event Log Integrity',
    controlDescription: 'Immutable event logging with cryptographic hash chain',
    controlFamily: 'Audit & Accountability',
    controlReferenceId: 'DE.CM-03',
    csfFunction: 'Detect',
    csfCategoryId: 'DE.CM',
    csfSubcategoryId: 'DE.CM-03',
    status: 'implemented',
    effectiveness: 'effective',
    score: 90,
    evidenceType: 'automated_scan',
    evidenceDescription: 'Hash chain verification passed for last 30 days of event data',
    consequenceOfFailure: 'Tampered logs unable to support forensic investigation',
    consequenceSeverity: 'major',
    commander_automatedCheckPassed: true,
    commander_lastAutomatedCheck: now,
    commander_affectedNodeIds: [seedId('topology-node', 4)],
  }),
  makeControl(3, {
    controlName: 'Tenant Data Isolation',
    controlDescription: 'Row-level security enforcing tenant boundary on all data stores',
    controlFamily: 'Data Protection',
    controlReferenceId: 'PR.DS-01',
    csfFunction: 'Protect',
    csfCategoryId: 'PR.DS',
    csfSubcategoryId: 'PR.DS-01',
    status: 'implemented',
    effectiveness: 'effective',
    score: 92,
    evidenceType: 'testing',
    evidenceDescription: 'Cross-tenant query injection tests passed (0 violations in 10,000 attempts)',
    consequenceOfFailure: 'Cross-tenant data leak violating confidentiality',
    consequenceSeverity: 'catastrophic',
    relatedRiskIds: [seedId('risk-register', 5)],
    commander_automatedCheckPassed: true,
    commander_lastAutomatedCheck: now,
    commander_affectedNodeIds: [seedId('topology-node', 4), seedId('topology-node', 5), seedId('topology-node', 6)],
  }),
  makeControl(4, {
    controlName: 'Encryption in Transit',
    controlDescription: 'TLS 1.3 enforced on all inter-service communication',
    controlFamily: 'Communications Protection',
    controlReferenceId: 'PR.DS-02',
    csfFunction: 'Protect',
    csfCategoryId: 'PR.DS',
    csfSubcategoryId: 'PR.DS-02',
    status: 'implemented',
    effectiveness: 'effective',
    score: 98,
    evidenceType: 'automated_scan',
    evidenceDescription: 'Network scan confirms TLS 1.3 on all internal endpoints, no cleartext detected',
    consequenceOfFailure: 'Data interception on internal network',
    consequenceSeverity: 'major',
    commander_automatedCheckPassed: true,
    commander_lastAutomatedCheck: now,
  }),
  makeControl(5, {
    controlName: 'Approval Workflow Enforcement',
    controlDescription: 'OODA-tempo approval required before high-severity remediation execution',
    controlFamily: 'Governance',
    controlReferenceId: 'GV.OC-04',
    csfFunction: 'Govern',
    csfCategoryId: 'GV.OC',
    csfSubcategoryId: 'GV.OC-04',
    status: 'implemented',
    effectiveness: 'partially_effective',
    score: 75,
    evidenceType: 'manual_review',
    evidenceDescription: 'Audit of last 50 remediation actions: 3 bypassed approval via legacy API path',
    consequenceOfFailure: 'Unauthorised remediation actions without governance oversight',
    consequenceSeverity: 'major',
    remediationRequired: 'Close legacy API path, enforce approval check at gateway level',
    remediationDeadline: '2026-06-15T00:00:00.000Z',
    relatedRiskIds: [seedId('risk-register', 4)],
    commander_automatedCheckPassed: false,
    commander_lastAutomatedCheck: now,
    commander_affectedNodeIds: [seedId('topology-node', 3)],
  }),
  makeControl(6, {
    controlName: 'Vulnerability Patch Management',
    controlDescription: 'Critical vulnerabilities patched within 72 hours of disclosure',
    controlFamily: 'Risk Management',
    controlReferenceId: 'ID.RA-01',
    csfFunction: 'Identify',
    csfCategoryId: 'ID.RA',
    csfSubcategoryId: 'ID.RA-01',
    status: 'partially_implemented',
    effectiveness: 'partially_effective',
    score: 65,
    evidenceType: 'automated_scan',
    evidenceDescription: '80% of critical CVEs patched within SLA; event store patch pending',
    consequenceOfFailure: 'Exploitation of known vulnerabilities in production systems',
    consequenceSeverity: 'catastrophic',
    remediationRequired: 'Accelerate event store patching, add automated patch verification',
    remediationDeadline: '2026-06-17T00:00:00.000Z',
    relatedRiskIds: [seedId('risk-register', 1)],
    commander_automatedCheckPassed: false,
    commander_lastAutomatedCheck: now,
    commander_affectedNodeIds: [seedId('topology-node', 4)],
  }),
];

// ─── Validation Gates ────────────────────────────────────────────────────────

export function validateAllSeedRiskRegisters(): { index: number; errors: string[] }[] {
  const failures: { index: number; errors: string[] }[] = [];
  SEED_RISK_REGISTERS.forEach((r, index) => {
    const result = validateRiskRegister(r);
    if (!result.valid) failures.push({ index, errors: result.errors });
  });
  return failures;
}

export function validateAllSeedPostureScores(): { index: number; errors: string[] }[] {
  const failures: { index: number; errors: string[] }[] = [];
  SEED_POSTURE_SCORES.forEach((p, index) => {
    const result = validatePostureScore(p);
    if (!result.valid) failures.push({ index, errors: result.errors });
  });
  return failures;
}

export function validateAllSeedControlAssessments(): { index: number; errors: string[] }[] {
  const failures: { index: number; errors: string[] }[] = [];
  SEED_CONTROL_ASSESSMENTS.forEach((c, index) => {
    const result = validateControlAssessment(c);
    if (!result.valid) failures.push({ index, errors: result.errors });
  });
  return failures;
}
