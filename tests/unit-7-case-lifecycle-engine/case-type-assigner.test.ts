import { describe, it, expect } from 'vitest';
import {
  assignCaseType,
  getReachableCaseTypes,
  DEFAULT_RISK_TO_CASE_MAP,
  SIGNAL_CONTEXT_CASE_TYPES,
} from '../../packages/contracts/src/engines/case-type-assigner';
import { RISK_OBJECT_TYPES } from '../../packages/contracts/src/entities/risk-object';
import { CASE_TYPES } from '../../packages/contracts/src/entities/case';
import type { RiskObjectType } from '../../packages/contracts/src/entities/risk-object';

/**
 * Unit 7: Case Type Assignment Engine Tests
 *
 * Validates:
 * - All 8 risk object types have a default case type mapping
 * - All 12 canonical case types are reachable
 * - Context-aware disambiguation works
 * - Signal-context case types are reachable
 * - Unknown risk object types are rejected
 */

describe('Case Type Assigner — DEFAULT_RISK_TO_CASE_MAP', () => {
  it('maps all 8 risk object types', () => {
    for (const roType of RISK_OBJECT_TYPES) {
      expect(DEFAULT_RISK_TO_CASE_MAP[roType]).toBeDefined();
    }
  });

  it('all mapped case types are valid canonical types', () => {
    for (const caseType of Object.values(DEFAULT_RISK_TO_CASE_MAP)) {
      expect(CASE_TYPES).toContain(caseType);
    }
  });
});

describe('Case Type Assigner — all 12 case types reachable', () => {
  it('all 12 canonical case types are reachable from risk objects + signal contexts', () => {
    const reachable = new Set<string>();

    // From risk object default mappings
    for (const caseType of Object.values(DEFAULT_RISK_TO_CASE_MAP)) {
      reachable.add(caseType);
    }

    // From context overrides (via getReachableCaseTypes)
    for (const roType of RISK_OBJECT_TYPES) {
      for (const ct of getReachableCaseTypes(roType)) {
        reachable.add(ct);
      }
    }

    // From signal context case types
    for (const ct of Object.values(SIGNAL_CONTEXT_CASE_TYPES)) {
      reachable.add(ct);
    }

    // Verify all 12 are reachable
    for (const caseType of CASE_TYPES) {
      expect(reachable.has(caseType)).toBe(true);
    }
  });
});

describe('Case Type Assigner — assignCaseType default mappings', () => {
  it.each([
    ['coverage_blindspot', 'coverage'],
    ['ooda_phase_degradation', 'ooda-tempo-degradation'],
    ['vulnerability_drift', 'vulnerability'],
    ['configuration_drift', 'drift'],
    ['exposure_drift', 'exposure'],
    ['control_gap', 'tool-health'],
    ['identity_risk', 'identity'],
    ['policy_gap', 'policy-effectiveness'],
  ] as [RiskObjectType, string][])('%s → %s (default)', (roType, expectedCaseType) => {
    const result = assignCaseType({ riskObjectType: roType });
    expect(result.success).toBe(true);
    expect(result.case_type).toBe(expectedCaseType);
    expect(result.error).toBeNull();
  });
});

describe('Case Type Assigner — context-aware disambiguation', () => {
  it('coverage_blindspot + inverse_discovery → inverse-discovery-coverage-blindspot', () => {
    const result = assignCaseType({
      riskObjectType: 'coverage_blindspot',
      context: 'inverse_discovery',
    });
    expect(result.success).toBe(true);
    expect(result.case_type).toBe('inverse-discovery-coverage-blindspot');
  });

  it('vulnerability_drift + drift_primary → drift', () => {
    const result = assignCaseType({
      riskObjectType: 'vulnerability_drift',
      context: 'drift_primary',
    });
    expect(result.success).toBe(true);
    expect(result.case_type).toBe('drift');
  });

  it('vulnerability_drift + vulnerability_primary → vulnerability', () => {
    const result = assignCaseType({
      riskObjectType: 'vulnerability_drift',
      context: 'vulnerability_primary',
    });
    expect(result.success).toBe(true);
    expect(result.case_type).toBe('vulnerability');
  });

  it('control_gap + tool_health → tool-health', () => {
    const result = assignCaseType({
      riskObjectType: 'control_gap',
      context: 'tool_health',
    });
    expect(result.success).toBe(true);
    expect(result.case_type).toBe('tool-health');
  });

  it('control_gap + policy_effectiveness → policy-effectiveness', () => {
    const result = assignCaseType({
      riskObjectType: 'control_gap',
      context: 'policy_effectiveness',
    });
    expect(result.success).toBe(true);
    expect(result.case_type).toBe('policy-effectiveness');
  });
});

describe('Case Type Assigner — signal-context case types', () => {
  it('threat_intelligence context → threat-intelligence-estate-match', () => {
    const result = assignCaseType({
      riskObjectType: 'vulnerability_drift',
      context: 'threat_intelligence',
    });
    expect(result.success).toBe(true);
    expect(result.case_type).toBe('threat-intelligence-estate-match');
  });

  it('external_attack context → external-attack-correlation', () => {
    const result = assignCaseType({
      riskObjectType: 'exposure_drift',
      context: 'external_attack',
    });
    expect(result.success).toBe(true);
    expect(result.case_type).toBe('external-attack-correlation');
  });

  it('verdict_pattern context → verdict-pattern', () => {
    const result = assignCaseType({
      riskObjectType: 'identity_risk',
      context: 'verdict_pattern',
    });
    expect(result.success).toBe(true);
    expect(result.case_type).toBe('verdict-pattern');
  });
});

describe('Case Type Assigner — error handling', () => {
  it('rejects unknown risk object type', () => {
    const result = assignCaseType({
      riskObjectType: 'unknown_type' as RiskObjectType,
    });
    expect(result.success).toBe(false);
    expect(result.case_type).toBeNull();
    expect(result.error).toContain('Unknown risk object type');
  });
});

describe('Case Type Assigner — getReachableCaseTypes', () => {
  it('coverage_blindspot reaches coverage and inverse-discovery-coverage-blindspot', () => {
    const types = getReachableCaseTypes('coverage_blindspot');
    expect(types).toContain('coverage');
    expect(types).toContain('inverse-discovery-coverage-blindspot');
  });

  it('vulnerability_drift reaches vulnerability and drift', () => {
    const types = getReachableCaseTypes('vulnerability_drift');
    expect(types).toContain('vulnerability');
    expect(types).toContain('drift');
  });

  it('control_gap reaches tool-health and policy-effectiveness', () => {
    const types = getReachableCaseTypes('control_gap');
    expect(types).toContain('tool-health');
    expect(types).toContain('policy-effectiveness');
  });

  it('ooda_phase_degradation reaches only ooda-tempo-degradation', () => {
    const types = getReachableCaseTypes('ooda_phase_degradation');
    expect(types).toEqual(['ooda-tempo-degradation']);
  });
});
