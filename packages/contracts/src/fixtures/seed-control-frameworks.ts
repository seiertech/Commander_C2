/**
 * Seed Control Frameworks — Commander C2 Test Fixtures
 *
 * Synthetic control-framework mapping data conforming to canonical entity shape.
 * Source: Spec #55 Baseline Configuration Framework; Feature Registry FR-FRAME-001
 * Build unit: CFM (Control Framework Mapping — Foundational)
 *
 * Five seed frameworks:
 * 1. NIST CSF 2.0 (industry, open licence)
 * 2. ISO 27001:2022 (industry, restricted licence — no full text)
 * 3. CIS Controls v8 (industry, open licence)
 * 4. Cyber Essentials (regulatory, open licence)
 * 5. Acme Internal Controls (internal, internal_only)
 *
 * Each framework has 3 sample controls, 1-2 requirements per control,
 * sample evaluations, and entity mappings.
 *
 * SOURCING RULE: For restricted frameworks (ISO 27001), only control IDs
 * and short internal summaries are stored — no reproduced standard text.
 * All content is synthetic/illustrative for local-first development.
 */

import type {
  ControlFramework,
  FrameworkControl,
  ControlRequirement,
  ControlEvaluation,
  ControlMapping,
} from '../entities/control-framework';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const CFM_SOURCE = { ...SEED_SOURCE, import_run_id: 'run-cfm-001', source_system: 'commander-cfm-seed' };

// ═══════════════════════════════════════════════════════════════════════════════
// FRAMEWORKS
// ═══════════════════════════════════════════════════════════════════════════════

export const seedControlFrameworks: ControlFramework[] = [
  {
    id: seedId('framework', 1),
    entity_type: 'control_framework',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
    source: CFM_SOURCE,
    framework_id: 'nist-csf-2.0',
    framework_name: 'NIST Cybersecurity Framework 2.0',
    version: '2.0',
    category: 'industry',
    publisher: 'National Institute of Standards and Technology (NIST)',
    total_controls: 106,
    origin: 'prebuilt',
    active: true,
    licence_status: 'open',
    source_ref: 'https://www.nist.gov/cyberframework',
    mapping_completeness: 15,
    lastReviewedAt: '2026-01-10T00:00:00.000Z',
    licenceNotes: 'Public domain — freely available, no reproduction restrictions.',
  },
  {
    id: seedId('framework', 2),
    entity_type: 'control_framework',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
    source: CFM_SOURCE,
    framework_id: 'iso-27001-2022',
    framework_name: 'ISO/IEC 27001:2022',
    version: '2022',
    category: 'industry',
    publisher: 'International Organization for Standardization (ISO)',
    total_controls: 93,
    origin: 'prebuilt',
    active: true,
    licence_status: 'restricted',
    source_ref: 'ISO/IEC 27001:2022 Information Security Management Systems',
    mapping_completeness: 10,
    lastReviewedAt: '2026-01-10T00:00:00.000Z',
    licenceNotes: 'Restricted — control IDs and short internal summaries only. Full standard text requires ISO licence.',
  },
  {
    id: seedId('framework', 3),
    entity_type: 'control_framework',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
    source: CFM_SOURCE,
    framework_id: 'cis-controls-v8',
    framework_name: 'CIS Controls v8',
    version: '8.0',
    category: 'industry',
    publisher: 'Center for Internet Security (CIS)',
    total_controls: 153,
    origin: 'prebuilt',
    active: true,
    licence_status: 'open',
    source_ref: 'https://www.cisecurity.org/controls/v8',
    mapping_completeness: 12,
    lastReviewedAt: '2026-01-10T00:00:00.000Z',
    licenceNotes: 'Creative Commons — freely available for non-commercial use.',
  },
  {
    id: seedId('framework', 4),
    entity_type: 'control_framework',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
    source: CFM_SOURCE,
    framework_id: 'cyber-essentials-2024',
    framework_name: 'Cyber Essentials',
    version: '2024',
    category: 'regulatory',
    publisher: 'National Cyber Security Centre (NCSC)',
    total_controls: 5,
    origin: 'prebuilt',
    active: true,
    licence_status: 'open',
    source_ref: 'https://www.ncsc.gov.uk/cyberessentials/overview',
    mapping_completeness: 60,
    lastReviewedAt: '2026-01-10T00:00:00.000Z',
    licenceNotes: 'UK Government Open Licence — freely reproducible.',
  },
  {
    id: seedId('framework', 5),
    entity_type: 'control_framework',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
    source: CFM_SOURCE,
    framework_id: 'acme-internal-2026',
    framework_name: 'Acme Corp Internal Security Controls',
    version: '2026.1',
    category: 'internal',
    publisher: 'Acme Corporation Security Team',
    total_controls: 25,
    origin: 'custom',
    active: true,
    licence_status: 'internal_only',
    source_ref: 'internal://acme-corp/security-controls/2026.1',
    mapping_completeness: 40,
    lastReviewedAt: '2026-01-10T00:00:00.000Z',
    licenceNotes: 'Internal only — tenant-provided framework.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FRAMEWORK CONTROLS (3 per framework = 15 total)
// ═══════════════════════════════════════════════════════════════════════════════

export const seedFrameworkControls: FrameworkControl[] = [
  // NIST CSF 2.0
  { id: seedId('fc', 1), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'nist-csf-2.0', control_id: 'PR.AC-1', controlName: 'Identities and credentials are issued, managed, verified, revoked, and audited', domain: 'Protect', subDomain: 'Identity Management and Access Control', objective: 'Ensure identities and credentials are managed through their full lifecycle with appropriate governance controls.', tier: 'mandatory' },
  { id: seedId('fc', 2), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'nist-csf-2.0', control_id: 'DE.CM-1', controlName: 'Networks are monitored to detect potential cybersecurity events', domain: 'Detect', subDomain: 'Continuous Monitoring', objective: 'Maintain continuous monitoring of networks to identify anomalous activity and potential security events.', tier: 'mandatory' },
  { id: seedId('fc', 3), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'nist-csf-2.0', control_id: 'RS.RP-1', controlName: 'Response plan is executed during or after a cybersecurity incident', domain: 'Respond', subDomain: 'Response Planning', objective: 'Ensure incident response plans are tested, maintained, and executed during cybersecurity events.', tier: 'mandatory' },
  // ISO 27001:2022 (restricted — short internal summaries only)
  { id: seedId('fc', 4), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'iso-27001-2022', control_id: 'A.8.1', controlName: 'User Endpoint Devices', domain: 'Technological Controls', subDomain: undefined, objective: 'Internal summary: Ensure endpoint devices used by personnel are protected against unauthorized access and malware.', tier: 'mandatory' },
  { id: seedId('fc', 5), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'iso-27001-2022', control_id: 'A.8.8', controlName: 'Management of Technical Vulnerabilities', domain: 'Technological Controls', subDomain: undefined, objective: 'Internal summary: Obtain timely information about technical vulnerabilities, evaluate exposure, and take appropriate measures.', tier: 'mandatory' },
  { id: seedId('fc', 6), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'iso-27001-2022', control_id: 'A.5.15', controlName: 'Access Control', domain: 'Organisational Controls', subDomain: undefined, objective: 'Internal summary: Ensure access to information and systems is restricted based on business and security requirements.', tier: 'mandatory' },
  // CIS Controls v8
  { id: seedId('fc', 7), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'cis-controls-v8', control_id: '1.1', controlName: 'Establish and Maintain Detailed Enterprise Asset Inventory', domain: 'Inventory and Control of Enterprise Assets', subDomain: undefined, objective: 'Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets.', tier: 'mandatory' },
  { id: seedId('fc', 8), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'cis-controls-v8', control_id: '4.1', controlName: 'Establish and Maintain a Secure Configuration Process', domain: 'Secure Configuration of Enterprise Assets and Software', subDomain: undefined, objective: 'Establish and maintain a secure configuration process for enterprise assets and software.', tier: 'mandatory' },
  { id: seedId('fc', 9), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'cis-controls-v8', control_id: '7.1', controlName: 'Establish and Maintain a Vulnerability Management Process', domain: 'Continuous Vulnerability Management', subDomain: undefined, objective: 'Establish and maintain a documented vulnerability management process for enterprise assets.', tier: 'mandatory' },
  // Cyber Essentials
  { id: seedId('fc', 10), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'cyber-essentials-2024', control_id: 'CE-FW', controlName: 'Firewalls', domain: 'Boundary Firewalls and Internet Gateways', subDomain: undefined, objective: 'Ensure boundary firewalls/gateways are configured to prevent unauthorized access and that default credentials are changed.', tier: 'mandatory' },
  { id: seedId('fc', 11), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'cyber-essentials-2024', control_id: 'CE-SC', controlName: 'Secure Configuration', domain: 'Secure Configuration', subDomain: undefined, objective: 'Ensure computers and network devices are configured to reduce vulnerabilities and only provide services required to fulfil their role.', tier: 'mandatory' },
  { id: seedId('fc', 12), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'cyber-essentials-2024', control_id: 'CE-PM', controlName: 'Patch Management', domain: 'Security Update Management', subDomain: undefined, objective: 'Ensure software running on computers and network devices is kept up to date and patched within 14 days of critical patches.', tier: 'mandatory' },
  // Acme Internal
  { id: seedId('fc', 13), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'acme-internal-2026', control_id: 'ACME-SEC-001', controlName: 'EDR Deployment', domain: 'Endpoint Security', subDomain: undefined, objective: 'All production endpoints must have EDR agent installed and reporting.', tier: 'mandatory' },
  { id: seedId('fc', 14), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'acme-internal-2026', control_id: 'ACME-SEC-002', controlName: 'MFA Enforcement', domain: 'Identity Security', subDomain: undefined, objective: 'All human identities must have MFA enabled on all production systems.', tier: 'mandatory' },
  { id: seedId('fc', 15), entity_type: 'framework_control', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'acme-internal-2026', control_id: 'ACME-SEC-003', controlName: 'Privileged Access Review', domain: 'Identity Security', subDomain: undefined, objective: 'Privileged access must be reviewed every 90 days with documented approval.', tier: 'mandatory' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROL REQUIREMENTS (sample testable requirements)
// ═══════════════════════════════════════════════════════════════════════════════

export const seedControlRequirements: ControlRequirement[] = [
  // ACME-SEC-001: EDR present
  { id: seedId('cr', 1), entity_type: 'control_requirement', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'acme-internal-2026', control_id: 'ACME-SEC-001', requirement_id: 'REQ-EDR-PRESENT', description: 'EDR agent installed and reporting on all production endpoints', targetType: 'asset', evaluationRule: { field: 'coverage.has_edr', operator: 'equals', expectedValue: 'true' }, active: true },
  // ACME-SEC-002: MFA enabled
  { id: seedId('cr', 2), entity_type: 'control_requirement', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'acme-internal-2026', control_id: 'ACME-SEC-002', requirement_id: 'REQ-MFA-ENABLED', description: 'MFA enabled on identity for all production system access', targetType: 'identity', evaluationRule: { field: 'authenticationStrength', operator: 'equals', expectedValue: 'strong' }, active: true },
  // ACME-SEC-003: Privileged access reviewed within 90 days
  { id: seedId('cr', 3), entity_type: 'control_requirement', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'acme-internal-2026', control_id: 'ACME-SEC-003', requirement_id: 'REQ-PAR-90D', description: 'Privileged access review completed within last 90 days', targetType: 'identity', evaluationRule: { field: 'lastAccessReview', operator: 'within_days', expectedValue: '90', unit: 'days' }, active: true },
  // Cyber Essentials CE-PM: Patch within 14 days
  { id: seedId('cr', 4), entity_type: 'control_requirement', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'cyber-essentials-2024', control_id: 'CE-PM', requirement_id: 'REQ-PATCH-14D', description: 'Critical patches applied within 14 days of release', targetType: 'asset', evaluationRule: { field: 'patchAge', operator: 'less_than_or_equal', expectedValue: '14', unit: 'days' }, active: true },
  // CIS 1.1: Asset inventory exists
  { id: seedId('cr', 5), entity_type: 'control_requirement', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'cis-controls-v8', control_id: '1.1', requirement_id: 'REQ-ASSET-INV', description: 'Enterprise asset is recorded in Commander asset inventory with classification', targetType: 'asset', evaluationRule: { field: 'classification', operator: 'exists', expectedValue: '' }, active: true },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROL EVALUATIONS (sample results)
// ═══════════════════════════════════════════════════════════════════════════════

export const seedControlEvaluations: ControlEvaluation[] = [
  // asset-0001 (prod-web-01) evaluated against EDR requirement → non_compliant (compromised)
  { id: seedId('ce', 1), entity_type: 'control_evaluation', tenant: SEED_TENANT, created_at: '2026-01-18T06:30:00.000Z', updated_at: '2026-01-18T06:30:00.000Z', source: CFM_SOURCE, framework_id: 'acme-internal-2026', control_id: 'ACME-SEC-001', requirement_id: 'REQ-EDR-PRESENT', evaluatedEntityType: 'asset', evaluatedEntityId: seedId('asset', 1), verdict: 'non_compliant', evidence_ref: seedId('evidence', 1), riskObjectRef: seedId('risk-object', 3), exception_state: 'none', evaluated_at: '2026-01-18T06:30:00.000Z', nextEvaluationDue: '2026-01-19T06:30:00.000Z', confidence: 95 },
  // asset-0002 evaluated against EDR requirement → compliant
  { id: seedId('ce', 2), entity_type: 'control_evaluation', tenant: SEED_TENANT, created_at: '2026-01-18T06:30:00.000Z', updated_at: '2026-01-18T06:30:00.000Z', source: CFM_SOURCE, framework_id: 'acme-internal-2026', control_id: 'ACME-SEC-001', requirement_id: 'REQ-EDR-PRESENT', evaluatedEntityType: 'asset', evaluatedEntityId: seedId('asset', 2), verdict: 'compliant', evidence_ref: undefined, riskObjectRef: undefined, exception_state: 'none', evaluated_at: '2026-01-18T06:30:00.000Z', nextEvaluationDue: '2026-01-25T06:30:00.000Z', confidence: 90 },
  // identity-0001 evaluated against MFA → compliant
  { id: seedId('ce', 3), entity_type: 'control_evaluation', tenant: SEED_TENANT, created_at: '2026-01-18T07:00:00.000Z', updated_at: '2026-01-18T07:00:00.000Z', source: CFM_SOURCE, framework_id: 'acme-internal-2026', control_id: 'ACME-SEC-002', requirement_id: 'REQ-MFA-ENABLED', evaluatedEntityType: 'identity', evaluatedEntityId: seedId('identity', 1), verdict: 'compliant', evidence_ref: undefined, riskObjectRef: undefined, exception_state: 'none', evaluated_at: '2026-01-18T07:00:00.000Z', nextEvaluationDue: '2026-01-25T07:00:00.000Z', confidence: 85 },
  // asset-0001 evaluated against patch requirement → non_compliant
  { id: seedId('ce', 4), entity_type: 'control_evaluation', tenant: SEED_TENANT, created_at: '2026-01-18T06:35:00.000Z', updated_at: '2026-01-18T06:35:00.000Z', source: CFM_SOURCE, framework_id: 'cyber-essentials-2024', control_id: 'CE-PM', requirement_id: 'REQ-PATCH-14D', evaluatedEntityType: 'asset', evaluatedEntityId: seedId('asset', 1), verdict: 'non_compliant', evidence_ref: seedId('evidence', 1), riskObjectRef: seedId('risk-object', 3), exception_state: 'none', evaluated_at: '2026-01-18T06:35:00.000Z', nextEvaluationDue: '2026-01-19T06:35:00.000Z', confidence: 95 },
  // identity with accepted risk exception
  { id: seedId('ce', 5), entity_type: 'control_evaluation', tenant: SEED_TENANT, created_at: '2026-01-18T07:00:00.000Z', updated_at: '2026-01-18T07:00:00.000Z', source: CFM_SOURCE, framework_id: 'acme-internal-2026', control_id: 'ACME-SEC-003', requirement_id: 'REQ-PAR-90D', evaluatedEntityType: 'identity', evaluatedEntityId: seedId('identity', 5), verdict: 'non_compliant', evidence_ref: undefined, riskObjectRef: undefined, exception_state: 'accepted_risk', evaluated_at: '2026-01-18T07:00:00.000Z', nextEvaluationDue: '2026-02-18T07:00:00.000Z', confidence: 80 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROL MAPPINGS (entity-to-control bindings)
// ═══════════════════════════════════════════════════════════════════════════════

export const seedControlMappings: ControlMapping[] = [
  // analytic-0008 (CIS Firewall Adherence) → CIS 4.1
  { id: seedId('cm', 1), entity_type: 'control_mapping', tenant: SEED_TENANT, created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T00:00:00.000Z', source: CFM_SOURCE, framework_id: 'cis-controls-v8', control_id: '4.1', mappedEntityType: 'analytic', mappedEntityId: seedId('analytic', 8), confidence: 90, mappingSource: 'system', rationale: 'Firewall rule adherence analytic directly evaluates CIS Control 4.1 secure configuration requirements.', coverageContribution: 'full' },
  // risk-object-0003 (vulnerability_drift) → ISO A.8.8
  { id: seedId('cm', 2), entity_type: 'control_mapping', tenant: SEED_TENANT, created_at: '2026-01-18T06:30:00.000Z', updated_at: '2026-01-18T06:30:00.000Z', source: CFM_SOURCE, framework_id: 'iso-27001-2022', control_id: 'A.8.8', mappedEntityType: 'risk_object', mappedEntityId: seedId('risk-object', 3), confidence: 85, mappingSource: 'system', rationale: 'Vulnerability drift risk object represents a gap in technical vulnerability management (ISO A.8.8).', coverageContribution: 'partial' },
  // sub-action-0003 (patch application) → Cyber Essentials CE-PM
  { id: seedId('cm', 3), entity_type: 'control_mapping', tenant: SEED_TENANT, created_at: '2026-01-18T10:00:00.000Z', updated_at: '2026-01-18T10:00:00.000Z', source: CFM_SOURCE, framework_id: 'cyber-essentials-2024', control_id: 'CE-PM', mappedEntityType: 'sub_action', mappedEntityId: seedId('sub-action', 3), confidence: 95, mappingSource: 'system', rationale: 'Emergency patch application sub-action directly addresses Cyber Essentials patch management requirement.', coverageContribution: 'full' },
  // action-0001 (containment) → NIST RS.RP-1
  { id: seedId('cm', 4), entity_type: 'control_mapping', tenant: SEED_TENANT, created_at: '2026-01-18T07:00:00.000Z', updated_at: '2026-01-18T07:00:00.000Z', source: CFM_SOURCE, framework_id: 'nist-csf-2.0', control_id: 'RS.RP-1', mappedEntityType: 'action', mappedEntityId: seedId('action', 1), confidence: 80, mappingSource: 'system', rationale: 'Immediate containment action represents execution of incident response plan (NIST RS.RP-1).', coverageContribution: 'partial' },
  // case-0001 (P0 active exploitation) → NIST RS.RP-1
  { id: seedId('cm', 5), entity_type: 'control_mapping', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: CFM_SOURCE, framework_id: 'nist-csf-2.0', control_id: 'RS.RP-1', mappedEntityType: 'case', mappedEntityId: seedId('case', 1), confidence: 75, mappingSource: 'system', rationale: 'P0 zero-day case represents an active incident response event (NIST RS.RP-1).', coverageContribution: 'evidence_only' },
];
