// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
import { describe, it, expect } from 'vitest';
import type { Case } from '../../packages/contracts/src/entities/case';
import type { RiskObject } from '../../packages/contracts/src/entities/risk-object';
import type { AttackMapping } from '../../packages/contracts/src/entities/coim';
import {
  computeCaseAggregation,
  MAX_CASE_ATTACK_BINDINGS,
  MAX_BLAST_RADIUS_SCORE,
} from '../../packages/contracts/src/resolvers/case-aggregation-resolver';
import { seedCases } from '../../packages/contracts/src/fixtures/seed-cases';
import { seedRiskObjects } from '../../packages/contracts/src/fixtures/seed-risk-objects';

/**
 * COIM-G: Case Aggregation
 *
 * Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §6 (Case impact);
 *         02_SOURCE_CLASSIFICATION_MODEL §10.4; Spec #08 Case Management.
 * Resolves: ARCH-DEBT-045 (Case dwell time portion).
 *
 * Validates:
 * - COIM-G additive aggregate fields are present at the type level
 * - The aggregation resolver computes correct values from bound Risk Objects
 * - Existing seed fixtures remain valid (backward-compatibility gate)
 * - Aggregates inform but do not change case governance fields
 * ADDITIVE ONLY — no existing fields removed or changed.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const baseRisk = (overrides: Partial<RiskObject>): RiskObject =>
  ({
    id: 'risk-object-9001',
    entity_type: 'risk-object',
    tenant: { tenant_id: 'tenant-001-acme-corp', tenant_name: 'Acme Corp' },
    created_at: '2026-01-18T06:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: {
      connector_id: 'conn-test',
      import_run_id: 'run-test',
      source_system: 'commander-test',
      source_timestamp: '2026-01-18T06:00:00.000Z',
    },
    type: 'vulnerability_drift',
    affected_entity_id: 'asset-0001',
    affected_entity_type: 'asset',
    justification: 'test',
    owner: 'test',
    treatment_state: 'open',
    expiry_or_review_trigger: 'test',
    ...overrides,
  }) as RiskObject;

const attack = (technique: string, subTechnique?: string): AttackMapping => ({
  tactic: 'Initial Access',
  technique,
  technique_name: `Technique ${technique}`,
  subTechnique,
  version: 'v14.1',
});

// ─── Type-level field presence ─────────────────────────────────────────────────

describe('COIM-G — Case aggregate fields (additive, optional)', () => {
  it('Case type accepts attacks[] (optional)', () => {
    const c: Partial<Case> = { attacks: [attack('T1190')] };
    expect(c.attacks?.[0].technique).toBe('T1190');
  });

  it('Case type accepts affectedEntityCount (optional)', () => {
    const c: Partial<Case> = { affected_entity_count: 3 };
    expect(c.affected_entity_count).toBe(3);
  });

  it('Case type accepts blastRadiusScore (optional)', () => {
    const c: Partial<Case> = { blastRadiusScore: 40 };
    expect(c.blastRadiusScore).toBe(40);
  });

  it('Case type accepts dwellTimeHours (optional)', () => {
    const c: Partial<Case> = { dwellTimeHours: 79 };
    expect(c.dwellTimeHours).toBe(79);
  });

  it('Case type accepts confidenceAggregate (optional)', () => {
    const c: Partial<Case> = { confidenceAggregate: 95 };
    expect(c.confidenceAggregate).toBe(95);
  });

  it('Case type accepts findingClassBreakdown (optional)', () => {
    const c: Partial<Case> = { findingClassBreakdown: { vulnerability: 2, detection: 1 } };
    expect(c.findingClassBreakdown?.vulnerability).toBe(2);
  });

  it('all COIM-G fields are optional — case without them is valid shape', () => {
    const minimal: Pick<Case, 'entityType' | 'caseRef' | 'priority'> = {
      entity_type: 'case',
      case_ref: 'CASE-TEST',
      priority: 'P2',
    };
    expect(minimal.entity_type).toBe('case');
  });
});

// ─── Resolver: ATT&CK aggregation ──────────────────────────────────────────────

describe('COIM-G — computeCaseAggregation: ATT&CK aggregation', () => {
  it('unions ATT&CK bindings across bound risk objects', () => {
    const ros = [
      baseRisk({ source_classification: scWith([attack('T1190')]) }),
      baseRisk({ source_classification: scWith([attack('T1078')]) }),
    ];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.attacks.map((a) => a.technique).sort()).toEqual(['T1078', 'T1190']);
  });

  it('deduplicates identical technique bindings', () => {
    const ros = [
      baseRisk({ source_classification: scWith([attack('T1190')]) }),
      baseRisk({ source_classification: scWith([attack('T1190')]) }),
    ];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.attacks).toHaveLength(1);
  });

  it('treats sub-techniques as distinct from their parent technique', () => {
    const ros = [
      baseRisk({ source_classification: scWith([attack('T1078'), attack('T1078', 'T1078.001')]) }),
    ];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.attacks).toHaveLength(2);
  });

  it('bounds aggregated ATT&CK bindings to MAX_CASE_ATTACK_BINDINGS', () => {
    const many = Array.from({ length: 60 }, (_, i) => attack(`T${1000 + i}`));
    const ros = [baseRisk({ source_classification: scWith(many) })];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.attacks.length).toBe(MAX_CASE_ATTACK_BINDINGS);
  });

  it('returns empty attacks[] when no bound risk object carries ATT&CK', () => {
    const ros = [baseRisk({})];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.attacks).toEqual([]);
  });
});

// ─── Resolver: affected-entity count + blast radius ─────────────────────────────

describe('COIM-G — computeCaseAggregation: affected entities + blast radius', () => {
  it('counts distinct affected entities via plural affectedEntities[]', () => {
    const ros = [
      baseRisk({ affected_entities: ['asset-0001', 'asset-0002'] }),
      baseRisk({ affected_entities: ['asset-0002', 'asset-0003'] }),
    ];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.affected_entity_count).toBe(3);
  });

  it('falls back to singular affectedEntityId when plural is absent', () => {
    const ros = [
      baseRisk({ affected_entity_id: 'asset-0001', affected_entities: undefined }),
      baseRisk({ affected_entity_id: 'asset-0002', affected_entities: undefined }),
    ];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.affected_entity_count).toBe(2);
  });

  it('blast radius is 10 points per affected entity, saturating at 100', () => {
    const ros = [baseRisk({ affected_entities: ['a', 'b', 'c'] })];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.blastRadiusScore).toBe(30);
  });

  it('blast radius never exceeds MAX_BLAST_RADIUS_SCORE', () => {
    const entities = Array.from({ length: 20 }, (_, i) => `asset-${i}`);
    const ros = [baseRisk({ affected_entities: entities })];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.blastRadiusScore).toBe(MAX_BLAST_RADIUS_SCORE);
  });
});

// ─── Resolver: dwell time ───────────────────────────────────────────────────────

describe('COIM-G — computeCaseAggregation: dwell time (ARCH-DEBT-045)', () => {
  it('computes whole-hour dwell from earliest firstDetectedAt to case creation', () => {
    const ros = [
      baseRisk({ first_detected_at: '2026-01-18T00:00:00.000Z' }),
      baseRisk({ first_detected_at: '2026-01-17T22:00:00.000Z' }), // earliest
    ];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.dwellTimeHours).toBe(8); // 22:00 → 06:00 next day
  });

  it('returns undefined when no bound risk object carries firstDetectedAt', () => {
    const ros = [baseRisk({ first_detected_at: undefined })];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.dwellTimeHours).toBeUndefined();
  });

  it('clamps negative spans (detection after case creation) to 0', () => {
    const ros = [baseRisk({ first_detected_at: '2026-01-18T10:00:00.000Z' })];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.dwellTimeHours).toBe(0);
  });
});

// ─── Resolver: confidence aggregate + finding-class breakdown ──────────────────

describe('COIM-G — computeCaseAggregation: confidence + finding-class breakdown', () => {
  it('averages source confidence across bound risk objects (rounded)', () => {
    const ros = [
      baseRisk({ source_classification: scWith([], 90) }),
      baseRisk({ source_classification: scWith([], 95) }),
    ];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.confidenceAggregate).toBe(93); // round(92.5)
  });

  it('returns undefined confidence when no risk object carries a score', () => {
    const agg = computeCaseAggregation([baseRisk({})], '2026-01-18T06:00:00.000Z');
    expect(agg.confidenceAggregate).toBeUndefined();
  });

  it('counts bound risk objects per finding class', () => {
    const ros = [
      baseRisk({ source_classification: scWith([], 50, 'vulnerability') }),
      baseRisk({ source_classification: scWith([], 50, 'vulnerability') }),
      baseRisk({ source_classification: scWith([], 50, 'detection') }),
    ];
    const agg = computeCaseAggregation(ros, '2026-01-18T06:00:00.000Z');
    expect(agg.findingClassBreakdown).toEqual({ vulnerability: 2, detection: 1 });
  });

  it('returns empty breakdown when no risk object carries a finding class', () => {
    const agg = computeCaseAggregation([baseRisk({})], '2026-01-18T06:00:00.000Z');
    expect(agg.findingClassBreakdown).toEqual({});
  });

  it('handles an empty risk-object set without throwing', () => {
    const agg = computeCaseAggregation([], '2026-01-18T06:00:00.000Z');
    expect(agg.affected_entity_count).toBe(0);
    expect(agg.blastRadiusScore).toBe(0);
    expect(agg.attacks).toEqual([]);
    expect(agg.dwellTimeHours).toBeUndefined();
    expect(agg.confidenceAggregate).toBeUndefined();
    expect(agg.findingClassBreakdown).toEqual({});
  });
});

// ─── Seed fixture self-consistency ─────────────────────────────────────────────

describe('COIM-G — seed case 0001 cached aggregates match resolver output', () => {
  it('cached aggregates on case-0001 equal computeCaseAggregation over its bound risk object', () => {
    const case1 = seedCases.find((c) => c.id === 'case-0001')!;
    // risk-object-0003 is bound to case-0001 (affected_entities: [case-0001]).
    const bound = seedRiskObjects.filter((ro) => ro.affected_entities?.includes('case-0001'));
    expect(bound.length).toBeGreaterThan(0);

    const agg = computeCaseAggregation(bound, case1.created_at);
    expect(case1.attacks).toEqual(agg.attacks);
    expect(case1.affected_entity_count).toBe(agg.affected_entity_count);
    expect(case1.blastRadiusScore).toBe(agg.blastRadiusScore);
    expect(case1.dwellTimeHours).toBe(agg.dwellTimeHours);
    expect(case1.confidenceAggregate).toBe(agg.confidenceAggregate);
    expect(case1.findingClassBreakdown).toEqual(agg.findingClassBreakdown);
  });

  it('case-0001 dwell time is 79h (2026-01-14T22:30Z → 2026-01-18T06:00Z)', () => {
    const case1 = seedCases.find((c) => c.id === 'case-0001')!;
    expect(case1.dwellTimeHours).toBe(79);
  });
});

// ─── Backward compatibility ─────────────────────────────────────────────────────

describe('COIM-G — backward compatibility: existing seed cases unchanged', () => {
  it('all 30 seed cases retain required governance fields (no regression)', () => {
    expect(seedCases).toHaveLength(30);
    for (const c of seedCases) {
      expect(c.entity_type).toBe('case');
      expect(c.case_ref).toBeTruthy();
      expect(c.case_type).toBeTruthy();
      expect(c.status).toBeTruthy();
      expect(c.priority).toBeTruthy();
      expect(c.owner).toBeTruthy();
      expect(c.routingRationale).toBeTruthy();
      expect(c.auditTrailRef).toBeTruthy();
      expect(c.sla.target_resolution_hours).toBeGreaterThan(0);
      expect(['internal_attack_surface', 'external_attack_surface']).toContain(c.surface_attribution);
    }
  });

  it('cases other than case-0001 do not set COIM-G aggregate fields', () => {
    for (const c of seedCases) {
      if (c.id === 'case-0001') continue;
      expect(c.attacks).toBeUndefined();
      expect(c.affected_entity_count).toBeUndefined();
      expect(c.blastRadiusScore).toBeUndefined();
      expect(c.dwellTimeHours).toBeUndefined();
      expect(c.confidenceAggregate).toBeUndefined();
      expect(c.findingClassBreakdown).toBeUndefined();
    }
  });

  it('no seed case has a manual-creation source (Doctrinal Assertion 1)', () => {
    for (const c of seedCases) {
      expect(c.source.source_system).not.toContain('manual');
    }
  });
});

// ─── Local source-classification helper ────────────────────────────────────────

function scWith(
  attacks: AttackMapping[],
  confidenceScore = 50,
  finding_class: 'vulnerability' | 'detection' | 'incident' = 'vulnerability',
): RiskObject['sourceClassification'] {
  return {
    finding_class,
    source_severity: { severity_level: 'high', severity_id: 4 },
    source_confidence: { confidence_level: 'high', confidence_score },
    source_product: { vendor: 'Test', name: 'Test Scanner' },
    source_finding_uid: 'test-uid',
    attacks,
    observables: [],
  };
}
