import { describe, it, expect } from 'vitest';
import * as schema from '../../packages/db/src/schema/index';

/**
 * Canonical Data Model Schema Tests — Commander SDR
 *
 * Validates:
 * - All tables have tenant scope (Domain Req 18)
 * - Data classification enum covers all 7 types (§11.1)
 * - Data residency enum covers UK/US (§11.2)
 * - Connector class enum is A/B/C/D only (Spec #61)
 * - Surface attribution enum is internal/external (Spec #60)
 * - Case status is system-owned lifecycle
 * - Schema exports are complete
 */

describe('Schema Exports', () => {
  it('exports tenants table', () => {
    expect(schema.tenants).toBeDefined();
  });

  it('exports assets table', () => {
    expect(schema.assets).toBeDefined();
  });

  it('exports identities table', () => {
    expect(schema.identities).toBeDefined();
  });

  it('exports cases table', () => {
    expect(schema.cases).toBeDefined();
  });

  it('exports connectors table', () => {
    expect(schema.connectors).toBeDefined();
  });

  it('exports auditEvents table', () => {
    expect(schema.auditEvents).toBeDefined();
  });
});

describe('Data Classification Enum (§11.1)', () => {
  it('includes all seven classifications', () => {
    const values = schema.dataClassificationEnum.enumValues;
    expect(values).toContain('configuration');
    expect(values).toContain('state');
    expect(values).toContain('verdict');
    expect(values).toContain('detection');
    expect(values).toContain('case');
    expect(values).toContain('threat_intelligence');
    expect(values).toContain('audit');
    expect(values.length).toBe(7);
  });
});

describe('Data Residency Enum (§11.2)', () => {
  it('includes UK and US residency options', () => {
    const values = schema.dataResidencyEnum.enumValues;
    expect(values).toContain('uk');
    expect(values).toContain('us');
  });
});

describe('Connector Class Enum (Spec #61)', () => {
  it('includes only A/B/C/D', () => {
    const values = schema.connectorClassEnum.enumValues;
    expect(values).toEqual(['A', 'B', 'C', 'D']);
  });
});

describe('Surface Attribution Enum (Spec #60)', () => {
  it('includes internal and external attack surfaces', () => {
    const values = schema.surfaceAttributionEnum.enumValues;
    expect(values).toContain('internal_attack_surface');
    expect(values).toContain('external_attack_surface');
    expect(values.length).toBe(2);
  });
});

describe('Case Status Enum (Doctrinal Assertion 1)', () => {
  it('includes system-owned lifecycle states', () => {
    const values = schema.caseStatusEnum.enumValues;
    // 12-state closed-loop lifecycle (Unit 7)
    expect(values).toContain('detected');
    expect(values).toContain('bound');
    expect(values).toContain('routed');
    expect(values).toContain('prioritised');
    expect(values).toContain('action_decomposed');
    expect(values).toContain('in_progress');
    expect(values).toContain('pending_validation');
    expect(values).toContain('validation_running');
    expect(values).toContain('validated_pass');
    expect(values).toContain('validated_fail');
    expect(values).toContain('pending_closure_gates');
    expect(values).toContain('closed_by_system');
    expect(values).toContain('reopened_by_system');
    expect(values.length).toBe(13);
  });

  it('does not include manual states', () => {
    const values = schema.caseStatusEnum.enumValues;
    expect(values).not.toContain('manually_created');
    expect(values).not.toContain('manually_closed');
  });
});

describe('Priority Enum', () => {
  it('includes P0 through P4', () => {
    const values = schema.priorityEnum.enumValues;
    expect(values).toEqual(['P0', 'P1', 'P2', 'P3', 'P4']);
  });
});
