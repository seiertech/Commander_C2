import { describe, it, expect } from 'vitest';
import type {
  ControlFramework,
  FrameworkControl,
  ControlRequirement,
  ControlEvaluation,
  ControlMapping,
} from '../../packages/contracts/src/entities/control-framework';
import {
  FRAMEWORK_CATEGORIES,
  LICENCE_STATUSES,
  CONTROL_TIERS,
  REQUIREMENT_TARGET_TYPES,
  EVALUATION_OPERATORS,
  ADHERENCE_VERDICTS,
  EXCEPTION_STATES,
  MAPPED_ENTITY_TYPES,
  MAPPING_SOURCES,
  COVERAGE_CONTRIBUTIONS,
  validateControlFramework,
  validateFrameworkControl,
  validateControlRequirement,
  validateControlEvaluation,
  validateControlMapping,
} from '../../packages/contracts/src/entities/control-framework';
import {
  seedControlFrameworks,
  seedFrameworkControls,
  seedControlRequirements,
  seedControlEvaluations,
  seedControlMappings,
} from '../../packages/contracts/src/fixtures/seed-control-frameworks';

/**
 * CFM: Control Framework Mapping
 *
 * Source: Spec #55 Baseline Configuration Framework;
 *         Spec #10 Platform Security §8;
 *         Feature Registry FR-FRAME-001;
 *         Kiro Spec 11 (Control Coverage & Editable Baselines)
 * Resolves: ARCH-DEBT-051 (Control Framework Mapping entity absent)
 *
 * Validates:
 * - Five entity contracts: ControlFramework, FrameworkControl, ControlRequirement,
 *   ControlEvaluation, ControlMapping
 * - Enums and constants are correctly bounded
 * - Validation functions reject invalid data
 * - Seed fixtures conform to contract types
 * - Methodology: ingestion → mapping → requirement → evaluation → output
 * - Framework sourcing/licence constraints respected in seed data
 *
 * ADDITIVE ONLY — no existing entities modified.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const baseFw = (overrides: Partial<ControlFramework> = {}): ControlFramework => ({
  id: 'fw-test-001',
  entityType: 'control_framework',
  tenant: { tenantId: 'tenant-001-acme-corp', tenantName: 'Acme Corp' },
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z',
  source: { connectorId: 'conn-test', importRunId: 'run-test', sourceSystem: 'test', sourceTimestamp: '2026-01-10T00:00:00.000Z' },
  frameworkId: 'test-framework',
  frameworkName: 'Test Framework',
  version: '1.0',
  category: 'industry',
  publisher: 'Test Publisher',
  totalControls: 10,
  origin: 'prebuilt',
  active: true,
  licenceStatus: 'open',
  sourceRef: 'https://example.com/framework',
  mappingCompleteness: 50,
  lastReviewedAt: '2026-01-10T00:00:00.000Z',
  ...overrides,
});

const baseCtrl = (overrides: Partial<FrameworkControl> = {}): FrameworkControl => ({
  id: 'fc-test-001',
  entityType: 'framework_control',
  tenant: { tenantId: 'tenant-001-acme-corp', tenantName: 'Acme Corp' },
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z',
  source: { connectorId: 'conn-test', importRunId: 'run-test', sourceSystem: 'test', sourceTimestamp: '2026-01-10T00:00:00.000Z' },
  frameworkId: 'test-framework',
  controlId: 'TEST-1',
  controlName: 'Test Control',
  domain: 'Test Domain',
  objective: 'Test objective',
  tier: 'mandatory',
  ...overrides,
});

const baseReq = (overrides: Partial<ControlRequirement> = {}): ControlRequirement => ({
  id: 'cr-test-001',
  entityType: 'control_requirement',
  tenant: { tenantId: 'tenant-001-acme-corp', tenantName: 'Acme Corp' },
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z',
  source: { connectorId: 'conn-test', importRunId: 'run-test', sourceSystem: 'test', sourceTimestamp: '2026-01-10T00:00:00.000Z' },
  frameworkId: 'test-framework',
  controlId: 'TEST-1',
  requirementId: 'REQ-TEST-1',
  description: 'Test requirement description',
  targetType: 'asset',
  evaluationRule: { field: 'coverage.hasEdr', operator: 'equals', expectedValue: 'true' },
  active: true,
  ...overrides,
});

const baseEval = (overrides: Partial<ControlEvaluation> = {}): ControlEvaluation => ({
  id: 'ce-test-001',
  entityType: 'control_evaluation',
  tenant: { tenantId: 'tenant-001-acme-corp', tenantName: 'Acme Corp' },
  createdAt: '2026-01-18T06:30:00.000Z',
  updatedAt: '2026-01-18T06:30:00.000Z',
  source: { connectorId: 'conn-test', importRunId: 'run-test', sourceSystem: 'test', sourceTimestamp: '2026-01-18T06:30:00.000Z' },
  frameworkId: 'test-framework',
  controlId: 'TEST-1',
  requirementId: 'REQ-TEST-1',
  evaluatedEntityType: 'asset',
  evaluatedEntityId: 'asset-0001',
  verdict: 'compliant',
  evaluatedAt: '2026-01-18T06:30:00.000Z',
  confidence: 90,
  ...overrides,
});

const baseMapping = (overrides: Partial<ControlMapping> = {}): ControlMapping => ({
  id: 'cm-test-001',
  entityType: 'control_mapping',
  tenant: { tenantId: 'tenant-001-acme-corp', tenantName: 'Acme Corp' },
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z',
  source: { connectorId: 'conn-test', importRunId: 'run-test', sourceSystem: 'test', sourceTimestamp: '2026-01-10T00:00:00.000Z' },
  frameworkId: 'test-framework',
  controlId: 'TEST-1',
  mappedEntityType: 'analytic',
  mappedEntityId: 'analytic-0001',
  confidence: 85,
  mappingSource: 'system',
  rationale: 'Test mapping rationale',
  coverageContribution: 'full',
  ...overrides,
});

// ─── Enum Constants ───────────────────────────────────────────────────────────

describe('CFM: Enum Constants', () => {
  it('framework categories are 5 values', () => {
    expect(FRAMEWORK_CATEGORIES).toHaveLength(5);
    expect(FRAMEWORK_CATEGORIES).toContain('regulatory');
    expect(FRAMEWORK_CATEGORIES).toContain('internal');
  });

  it('licence statuses are 4 values', () => {
    expect(LICENCE_STATUSES).toHaveLength(4);
    expect(LICENCE_STATUSES).toContain('restricted');
  });

  it('control tiers are 3 values', () => {
    expect(CONTROL_TIERS).toHaveLength(3);
  });

  it('evaluation operators are 11 values', () => {
    expect(EVALUATION_OPERATORS).toHaveLength(11);
    expect(EVALUATION_OPERATORS).toContain('within_days');
  });

  it('adherence verdicts are 5 values', () => {
    expect(ADHERENCE_VERDICTS).toEqual(['compliant', 'non_compliant', 'partial', 'unknown', 'not_applicable']);
  });

  it('exception states are 5 values', () => {
    expect(EXCEPTION_STATES).toHaveLength(5);
    expect(EXCEPTION_STATES).toContain('compensating_control');
  });

  it('mapped entity types are 10 values', () => {
    expect(MAPPED_ENTITY_TYPES).toHaveLength(10);
  });

  it('mapping sources are 3 values', () => {
    expect(MAPPING_SOURCES).toEqual(['system', 'manual', 'ai_suggested']);
  });

  it('coverage contributions are 3 values', () => {
    expect(COVERAGE_CONTRIBUTIONS).toEqual(['full', 'partial', 'evidence_only']);
  });

  it('requirement target types are 9 values', () => {
    expect(REQUIREMENT_TARGET_TYPES).toHaveLength(9);
  });
});

// ─── ControlFramework Validation ──────────────────────────────────────────────

describe('CFM: ControlFramework Validation', () => {
  it('validates a well-formed framework', () => {
    expect(validateControlFramework(baseFw()).valid).toBe(true);
  });
  it('rejects missing frameworkId', () => {
    const r = validateControlFramework(baseFw({ frameworkId: '' }));
    expect(r.valid).toBe(false);
    expect(r.errors).toContain('frameworkId is required.');
  });
  it('rejects invalid category', () => {
    const r = validateControlFramework(baseFw({ category: 'invalid' as any }));
    expect(r.valid).toBe(false);
  });
  it('rejects negative totalControls', () => {
    const r = validateControlFramework(baseFw({ totalControls: -1 }));
    expect(r.valid).toBe(false);
  });
  it('rejects mappingCompleteness out of range', () => {
    expect(validateControlFramework(baseFw({ mappingCompleteness: 101 })).valid).toBe(false);
    expect(validateControlFramework(baseFw({ mappingCompleteness: -1 })).valid).toBe(false);
  });
});

// ─── FrameworkControl Validation ──────────────────────────────────────────────

describe('CFM: FrameworkControl Validation', () => {
  it('validates a well-formed control', () => {
    expect(validateFrameworkControl(baseCtrl()).valid).toBe(true);
  });
  it('rejects missing controlId', () => {
    expect(validateFrameworkControl(baseCtrl({ controlId: '' })).valid).toBe(false);
  });
  it('rejects missing domain', () => {
    expect(validateFrameworkControl(baseCtrl({ domain: '' })).valid).toBe(false);
  });
  it('rejects invalid tier', () => {
    expect(validateFrameworkControl(baseCtrl({ tier: 'invalid' as any })).valid).toBe(false);
  });
});

// ─── ControlRequirement Validation ────────────────────────────────────────────

describe('CFM: ControlRequirement Validation', () => {
  it('validates a well-formed requirement', () => {
    expect(validateControlRequirement(baseReq()).valid).toBe(true);
  });
  it('rejects missing requirementId', () => {
    expect(validateControlRequirement(baseReq({ requirementId: '' })).valid).toBe(false);
  });
  it('rejects invalid targetType', () => {
    expect(validateControlRequirement(baseReq({ targetType: 'invalid' as any })).valid).toBe(false);
  });
  it('rejects missing evaluationRule', () => {
    expect(validateControlRequirement(baseReq({ evaluationRule: undefined as any })).valid).toBe(false);
  });
  it('rejects evaluationRule with empty field', () => {
    const r = validateControlRequirement(baseReq({ evaluationRule: { field: '', operator: 'equals', expectedValue: 'true' } }));
    expect(r.valid).toBe(false);
  });
  it('rejects evaluationRule with invalid operator', () => {
    const r = validateControlRequirement(baseReq({ evaluationRule: { field: 'x', operator: 'invalid' as any, expectedValue: '' } }));
    expect(r.valid).toBe(false);
  });
});

// ─── ControlEvaluation Validation ─────────────────────────────────────────────

describe('CFM: ControlEvaluation Validation', () => {
  it('validates a well-formed evaluation', () => {
    expect(validateControlEvaluation(baseEval()).valid).toBe(true);
  });
  it('rejects invalid verdict', () => {
    expect(validateControlEvaluation(baseEval({ verdict: 'invalid' as any })).valid).toBe(false);
  });
  it('rejects confidence out of range', () => {
    expect(validateControlEvaluation(baseEval({ confidence: 101 })).valid).toBe(false);
    expect(validateControlEvaluation(baseEval({ confidence: -1 })).valid).toBe(false);
  });
  it('rejects invalid exceptionState', () => {
    expect(validateControlEvaluation(baseEval({ exceptionState: 'invalid' as any })).valid).toBe(false);
  });
  it('accepts valid exception states', () => {
    expect(validateControlEvaluation(baseEval({ exceptionState: 'accepted_risk' })).valid).toBe(true);
    expect(validateControlEvaluation(baseEval({ exceptionState: 'compensating_control' })).valid).toBe(true);
  });
});

// ─── ControlMapping Validation ────────────────────────────────────────────────

describe('CFM: ControlMapping Validation', () => {
  it('validates a well-formed mapping', () => {
    expect(validateControlMapping(baseMapping()).valid).toBe(true);
  });
  it('rejects invalid mappedEntityType', () => {
    expect(validateControlMapping(baseMapping({ mappedEntityType: 'invalid' as any })).valid).toBe(false);
  });
  it('rejects invalid mappingSource', () => {
    expect(validateControlMapping(baseMapping({ mappingSource: 'invalid' as any })).valid).toBe(false);
  });
  it('rejects missing rationale', () => {
    expect(validateControlMapping(baseMapping({ rationale: '' })).valid).toBe(false);
  });
  it('rejects confidence out of range', () => {
    expect(validateControlMapping(baseMapping({ confidence: -5 })).valid).toBe(false);
  });
});

// ─── Seed Fixture Conformance ─────────────────────────────────────────────────

describe('CFM: Seed Fixture Conformance', () => {
  it('seed frameworks are valid (5 frameworks)', () => {
    expect(seedControlFrameworks).toHaveLength(5);
    for (const fw of seedControlFrameworks) {
      const r = validateControlFramework(fw);
      expect(r.valid).toBe(true);
    }
  });

  it('seed frameworks cover required standard types', () => {
    const ids = seedControlFrameworks.map(f => f.frameworkId);
    expect(ids).toContain('nist-csf-2.0');
    expect(ids).toContain('iso-27001-2022');
    expect(ids).toContain('cis-controls-v8');
    expect(ids).toContain('cyber-essentials-2024');
    expect(ids).toContain('acme-internal-2026');
  });

  it('ISO 27001 has restricted licence status', () => {
    const iso = seedControlFrameworks.find(f => f.frameworkId === 'iso-27001-2022')!;
    expect(iso.licenceStatus).toBe('restricted');
  });

  it('seed framework controls are valid (15 controls)', () => {
    expect(seedFrameworkControls).toHaveLength(15);
    for (const ctrl of seedFrameworkControls) {
      const r = validateFrameworkControl(ctrl);
      expect(r.valid).toBe(true);
    }
  });

  it('each framework has exactly 3 seed controls', () => {
    const fwIds = seedControlFrameworks.map(f => f.frameworkId);
    for (const fwId of fwIds) {
      const controls = seedFrameworkControls.filter(c => c.frameworkId === fwId);
      expect(controls).toHaveLength(3);
    }
  });

  it('seed requirements are valid (5 requirements)', () => {
    expect(seedControlRequirements).toHaveLength(5);
    for (const req of seedControlRequirements) {
      const r = validateControlRequirement(req);
      expect(r.valid).toBe(true);
    }
  });

  it('seed evaluations are valid (5 evaluations)', () => {
    expect(seedControlEvaluations).toHaveLength(5);
    for (const ev of seedControlEvaluations) {
      const r = validateControlEvaluation(ev);
      expect(r.valid).toBe(true);
    }
  });

  it('seed evaluations include both compliant and non_compliant', () => {
    const verdicts = seedControlEvaluations.map(e => e.verdict);
    expect(verdicts).toContain('compliant');
    expect(verdicts).toContain('non_compliant');
  });

  it('seed evaluations include an accepted_risk exception', () => {
    const exceptions = seedControlEvaluations.filter(e => e.exceptionState === 'accepted_risk');
    expect(exceptions.length).toBeGreaterThan(0);
  });

  it('seed mappings are valid (5 mappings)', () => {
    expect(seedControlMappings).toHaveLength(5);
    for (const m of seedControlMappings) {
      const r = validateControlMapping(m);
      expect(r.valid).toBe(true);
    }
  });

  it('seed mappings cover multiple entity types', () => {
    const types = new Set(seedControlMappings.map(m => m.mappedEntityType));
    expect(types.size).toBeGreaterThanOrEqual(4);
    expect(types.has('analytic')).toBe(true);
    expect(types.has('risk_object')).toBe(true);
    expect(types.has('sub_action')).toBe(true);
    expect(types.has('action')).toBe(true);
  });

  it('seed mappings reference existing seed entity IDs', () => {
    // Verify cross-references to other fixture data
    const analyticMapping = seedControlMappings.find(m => m.mappedEntityId === 'analytic-0008');
    expect(analyticMapping).toBeDefined();
    expect(analyticMapping!.frameworkId).toBe('cis-controls-v8');
  });
});

// ─── Methodology: Ingestion → Mapping → Requirement → Evaluation → Output ───

describe('CFM: Compliance Evaluation Flow', () => {
  it('evaluation references a requirement which references a control which references a framework', () => {
    const eval1 = seedControlEvaluations[0]; // ACME-SEC-001 / REQ-EDR-PRESENT
    const req = seedControlRequirements.find(r => r.requirementId === eval1.requirementId);
    expect(req).toBeDefined();
    expect(req!.frameworkId).toBe(eval1.frameworkId);
    expect(req!.controlId).toBe(eval1.controlId);
    const ctrl = seedFrameworkControls.find(c => c.frameworkId === eval1.frameworkId && c.controlId === eval1.controlId);
    expect(ctrl).toBeDefined();
    const fw = seedControlFrameworks.find(f => f.frameworkId === eval1.frameworkId);
    expect(fw).toBeDefined();
  });

  it('non-compliant evaluation links to risk object (adherence gap creates/enriches RO)', () => {
    const nonCompliant = seedControlEvaluations.filter(e => e.verdict === 'non_compliant' && e.riskObjectRef);
    expect(nonCompliant.length).toBeGreaterThan(0);
    for (const ev of nonCompliant) {
      expect(ev.riskObjectRef).toBeTruthy();
    }
  });

  it('evaluation carries evidence reference for auditability', () => {
    const withEvidence = seedControlEvaluations.filter(e => e.evidenceRef);
    expect(withEvidence.length).toBeGreaterThan(0);
  });

  it('mapping links Commander entities to framework controls (Commander identity primary)', () => {
    for (const m of seedControlMappings) {
      expect(m.mappedEntityId).toBeTruthy();
      expect(m.frameworkId).toBeTruthy();
      expect(m.controlId).toBeTruthy();
      expect(m.rationale).toBeTruthy();
    }
  });
});

// ─── Licence/Sourcing Compliance ──────────────────────────────────────────────

describe('CFM: Licence and Sourcing Compliance', () => {
  it('restricted frameworks have licence notes explaining constraints', () => {
    const restricted = seedControlFrameworks.filter(f => f.licenceStatus === 'restricted');
    for (const fw of restricted) {
      expect(fw.licenceNotes).toBeTruthy();
      expect(fw.licenceNotes!.toLowerCase()).toContain('restricted');
    }
  });

  it('restricted framework controls use internal summaries only', () => {
    const isoControls = seedFrameworkControls.filter(c => c.frameworkId === 'iso-27001-2022');
    for (const ctrl of isoControls) {
      expect(ctrl.objective.startsWith('Internal summary:')).toBe(true);
    }
  });

  it('all frameworks have a sourceRef', () => {
    for (const fw of seedControlFrameworks) {
      expect(fw.sourceRef).toBeTruthy();
    }
  });

  it('all frameworks record publisher', () => {
    for (const fw of seedControlFrameworks) {
      expect(fw.publisher).toBeTruthy();
    }
  });
});

// ─── Tenant Admin Framework Management ────────────────────────────────────────

describe('CFM: Tenant Admin Framework Management', () => {
  it('frameworks can be active/inactive (tenant admin toggle)', () => {
    const active = seedControlFrameworks.filter(f => f.active);
    expect(active.length).toBe(5); // All seed frameworks active
  });

  it('frameworks carry version information', () => {
    for (const fw of seedControlFrameworks) {
      expect(fw.version).toBeTruthy();
    }
  });

  it('frameworks carry lastReviewedAt for review cycle', () => {
    for (const fw of seedControlFrameworks) {
      expect(fw.lastReviewedAt).toBeTruthy();
    }
  });

  it('frameworks carry mappingCompleteness (0-100)', () => {
    for (const fw of seedControlFrameworks) {
      expect(fw.mappingCompleteness).toBeGreaterThanOrEqual(0);
      expect(fw.mappingCompleteness).toBeLessThanOrEqual(100);
    }
  });

  it('custom/internal frameworks are supported (origin: custom)', () => {
    const custom = seedControlFrameworks.filter(f => f.origin === 'custom');
    expect(custom.length).toBeGreaterThan(0);
    expect(custom[0].category).toBe('internal');
  });
});
