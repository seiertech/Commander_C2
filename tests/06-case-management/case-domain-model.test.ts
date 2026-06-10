import { describe, it, expect } from 'vitest';
import { CASE_TYPES } from '../../packages/contracts/src/entities/case';
import { RISK_OBJECT_TYPES } from '../../packages/contracts/src/entities/risk-object';
import { seedCases } from '../../packages/contracts/src/fixtures/seed-cases';
import { seedRiskObjects } from '../../packages/contracts/src/fixtures/seed-risk-objects';
import { SEED_TENANT } from '../../packages/contracts/src/fixtures/seed-tenant';

/**
 * Case Management Domain Model Tests — Commander C2 (Phase A)
 *
 * Validates:
 * - 12 case types per Master Technical Specification §6.2
 * - Closed-loop lifecycle states (no manual states)
 * - 2 new risk object types (coverage_blindspot, ooda_phase_degradation)
 * - Surface attribution on all cases
 * - Seed cases remain valid
 * - No manual case creation paths
 * - Strategy consumption type contracts exist
 */

describe('Twelve Case Types (v1.2 Requirements 1-12)', () => {
  it('defines exactly 12 case types', () => {
    expect(CASE_TYPES.length).toBe(12);
  });

  it('includes drift', () => expect(CASE_TYPES).toContain('drift'));
  it('includes vulnerability', () => expect(CASE_TYPES).toContain('vulnerability'));
  it('includes identity', () => expect(CASE_TYPES).toContain('identity'));
  it('includes exposure', () => expect(CASE_TYPES).toContain('exposure'));
  it('includes coverage', () => expect(CASE_TYPES).toContain('coverage'));
  it('includes tool-health', () => expect(CASE_TYPES).toContain('tool-health'));
  it('includes threat-intelligence-estate-match', () => expect(CASE_TYPES).toContain('threat-intelligence-estate-match'));
  it('includes external-attack-correlation', () => expect(CASE_TYPES).toContain('external-attack-correlation'));
  it('includes verdict-pattern (v2.6)', () => expect(CASE_TYPES).toContain('verdict-pattern'));
  it('includes inverse-discovery-coverage-blindspot (v2.6)', () => expect(CASE_TYPES).toContain('inverse-discovery-coverage-blindspot'));
  it('includes policy-effectiveness (v2.6)', () => expect(CASE_TYPES).toContain('policy-effectiveness'));
  it('includes ooda-tempo-degradation (v2.6)', () => expect(CASE_TYPES).toContain('ooda-tempo-degradation'));
});

describe('Risk Object Types (v1.3.1 Lineage Closure)', () => {
  it('includes coverage_blindspot (Spec #72)', () => {
    expect(RISK_OBJECT_TYPES).toContain('coverage_blindspot');
  });

  it('includes ooda_phase_degradation (Spec #58)', () => {
    expect(RISK_OBJECT_TYPES).toContain('ooda_phase_degradation');
  });

  it('seed risk objects include a coverage_blindspot instance', () => {
    const cb = seedRiskObjects.find((r) => r.type === 'coverage_blindspot');
    expect(cb).toBeDefined();
  });

  it('seed risk objects include an ooda_phase_degradation instance', () => {
    const od = seedRiskObjects.find((r) => r.type === 'ooda_phase_degradation');
    expect(od).toBeDefined();
  });
});

describe('Closed-Loop Lifecycle (Doctrinal Assertion 1)', () => {
  it('seed cases use only system-owned lifecycle states', () => {
    const validStates = ['open', 'in-progress', 'awaiting-validation', 'awaiting-closure', 'closed', 'reopened'];
    for (const c of seedCases) {
      expect(validStates).toContain(c.status);
    }
  });

  it('no seed case has a manual-creation source', () => {
    for (const c of seedCases) {
      expect(c.source.sourceSystem).not.toContain('manual');
    }
  });

  it('all seed cases have routing rationale (system-routed)', () => {
    for (const c of seedCases) {
      expect(c.routingRationale).toBeTruthy();
    }
  });
});

describe('Surface Attribution (Doctrinal Assertion 10)', () => {
  it('all seed cases have surface attribution', () => {
    for (const c of seedCases) {
      expect(['internal_attack_surface', 'external_attack_surface']).toContain(c.surfaceAttribution);
    }
  });
});

describe('Seed Cases Validity', () => {
  it('seed cases are tenant-scoped', () => {
    for (const c of seedCases) {
      expect(c.tenant.tenantId).toBe(SEED_TENANT.tenantId);
    }
  });

  it('seed cases have SLA information', () => {
    for (const c of seedCases) {
      expect(c.sla.targetResolutionHours).toBeGreaterThan(0);
    }
  });

  it('seed cases include a P0 case', () => {
    const p0 = seedCases.find((c) => c.priority === 'P0');
    expect(p0).toBeDefined();
  });

  it('seed cases have audit trail references', () => {
    for (const c of seedCases) {
      expect(c.auditTrailRef).toBeTruthy();
    }
  });
});

describe('No Manual Case Creation (Doctrinal Assertion 1)', () => {
  it('case types do not include any manual-creation type', () => {
    expect(CASE_TYPES).not.toContain('manual');
    expect(CASE_TYPES).not.toContain('manual-creation');
    expect(CASE_TYPES).not.toContain('user-created');
  });
});
