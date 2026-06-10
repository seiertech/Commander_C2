import { describe, it, expect } from 'vitest';
import {
  ANALYTIC_TYPES,
  ANALYTIC_STATES,
  MAX_FALSE_POSITIVE_RATE,
  MIN_FALSE_POSITIVE_RATE,
  MAX_ANALYTIC_ATTACK_BINDINGS,
  validateAnalytic,
} from '../../packages/contracts/src/entities/analytic';
import type {
  Analytic,
  AnalyticType,
  AnalyticState,
  AnalyticRef,
} from '../../packages/contracts/src/entities/analytic';
import { seedAnalytics } from '../../packages/contracts/src/fixtures/seed-analytics';

/**
 * COIM-E: Analytic Entity
 *
 * Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §4.8;
 *         03_REUSABLE_OBJECT_CATALOGUE.md §2.7.
 * Resolves: ARCH-DEBT-042 (analytic entity absence).
 *
 * Validates the Analytic entity contract, validation logic, seed-fixture
 * conformance, ownership model, and the broad analytic type concept.
 * No engine-logic dependency — entity shape and provenance only.
 */

function makeValidAnalytic(): Analytic {
  return {
    id: 'analytic-test-001',
    entity_type: 'analytic',
    tenant: { tenant_id: 'tenant-test-001', tenant_name: 'Test Tenant' },
    created_at: '2026-01-18T06:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: {
      connector_id: 'connector-test-001',
      import_run_id: 'run-test-001',
      source_system: 'test-system',
      source_timestamp: '2026-01-18T05:55:00.000Z',
    },
    analyticId: 'RULE-TEST-BruteForce-v1',
    analyticName: 'Test Brute Force Detection Rule',
    analyticType: 'detection_rule',
    version: '1.0.0',
    state: 'active',
    false_positive_rate: 10,
    attacks: [
      { tactic: 'Credential Access', technique: 'T1110', technique_name: 'Brute Force', version: 'v14.1' },
    ],
  };
}

describe('COIM-E — analytic type taxonomy', () => {
  it('enumerates exactly 8 analytic types', () => {
    expect(ANALYTIC_TYPES).toHaveLength(8);
    expect(ANALYTIC_TYPES).toContain('detection_rule');
    expect(ANALYTIC_TYPES).toContain('analytic_rule');
    expect(ANALYTIC_TYPES).toContain('sigma_rule');
    expect(ANALYTIC_TYPES).toContain('yara_rule');
    expect(ANALYTIC_TYPES).toContain('ml_model');
    expect(ANALYTIC_TYPES).toContain('ueba_model');
    expect(ANALYTIC_TYPES).toContain('vendor_model');
    expect(ANALYTIC_TYPES).toContain('security_control_analytic');
  });

  it('enumerates exactly 3 analytic states', () => {
    expect(ANALYTIC_STATES).toHaveLength(3);
    expect(ANALYTIC_STATES).toContain('active');
    expect(ANALYTIC_STATES).toContain('deprecated');
    expect(ANALYTIC_STATES).toContain('testing');
  });

  it('defines false positive rate bounds (0-100)', () => {
    expect(MIN_FALSE_POSITIVE_RATE).toBe(0);
    expect(MAX_FALSE_POSITIVE_RATE).toBe(100);
  });

  it('defines ATT&CK binding limit (max 20)', () => {
    expect(MAX_ANALYTIC_ATTACK_BINDINGS).toBe(20);
  });

  it('analytic types span the full COIM broad concept (rule + model)', () => {
    // Rule-class types
    expect(ANALYTIC_TYPES).toContain('detection_rule');
    expect(ANALYTIC_TYPES).toContain('analytic_rule');
    expect(ANALYTIC_TYPES).toContain('sigma_rule');
    expect(ANALYTIC_TYPES).toContain('yara_rule');
    // Model-class types
    expect(ANALYTIC_TYPES).toContain('ml_model');
    expect(ANALYTIC_TYPES).toContain('ueba_model');
    expect(ANALYTIC_TYPES).toContain('vendor_model');
    // Control-class type
    expect(ANALYTIC_TYPES).toContain('security_control_analytic');
  });
});

describe('COIM-E — validateAnalytic', () => {
  it('accepts a well-formed analytic entity', () => {
    const result = validateAnalytic(makeValidAnalytic());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects empty analyticId', () => {
    const a = makeValidAnalytic();
    a.analyticId = '';
    const result = validateAnalytic(a);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('analyticId');
  });

  it('rejects whitespace-only analyticId', () => {
    const a = makeValidAnalytic();
    a.analyticId = '   ';
    const result = validateAnalytic(a);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('analyticId');
  });

  it('rejects empty analyticName', () => {
    const a = makeValidAnalytic();
    a.analyticName = '';
    const result = validateAnalytic(a);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('analyticName');
  });

  it('rejects unknown analyticType', () => {
    const a = makeValidAnalytic();
    (a as unknown as { analyticType: string }).analyticType = 'unknown_rule';
    const result = validateAnalytic(a);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('analyticType');
  });

  it('accepts each of the 8 valid analytic types', () => {
    for (const type of ANALYTIC_TYPES) {
      const a = makeValidAnalytic();
      a.analyticType = type;
      const result = validateAnalytic(a);
      expect(result.valid).toBe(true);
    }
  });

  it('rejects empty version', () => {
    const a = makeValidAnalytic();
    a.version = '';
    const result = validateAnalytic(a);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('version');
  });

  it('rejects unknown state', () => {
    const a = makeValidAnalytic();
    (a as unknown as { state: string }).state = 'unknown_state';
    const result = validateAnalytic(a);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('state');
  });

  it('accepts each of the 3 valid states', () => {
    for (const state of ANALYTIC_STATES) {
      const a = makeValidAnalytic();
      a.state = state;
      const result = validateAnalytic(a);
      expect(result.valid).toBe(true);
    }
  });

  it('rejects falsePositiveRate below 0', () => {
    const a = makeValidAnalytic();
    a.false_positive_rate = -1;
    const result = validateAnalytic(a);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('falsePositiveRate');
  });

  it('rejects falsePositiveRate above 100', () => {
    const a = makeValidAnalytic();
    a.false_positive_rate = 101;
    const result = validateAnalytic(a);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('falsePositiveRate');
  });

  it('accepts falsePositiveRate at boundaries (0 and 100)', () => {
    const a0 = makeValidAnalytic();
    a0.false_positive_rate = 0;
    expect(validateAnalytic(a0).valid).toBe(true);

    const a100 = makeValidAnalytic();
    a100.false_positive_rate = 100;
    expect(validateAnalytic(a100).valid).toBe(true);
  });

  it('accepts analytic without falsePositiveRate (not yet scored)', () => {
    const a = makeValidAnalytic();
    a.false_positive_rate = undefined;
    const result = validateAnalytic(a);
    expect(result.valid).toBe(true);
  });

  it('accepts analytic without attacks[] (none mapped)', () => {
    const a = makeValidAnalytic();
    a.attacks = undefined;
    const result = validateAnalytic(a);
    expect(result.valid).toBe(true);
  });

  it('accepts analytic with empty attacks[]', () => {
    const a = makeValidAnalytic();
    a.attacks = [];
    const result = validateAnalytic(a);
    expect(result.valid).toBe(true);
  });

  it('rejects attacks[] exceeding max 20 bindings', () => {
    const a = makeValidAnalytic();
    a.attacks = Array.from({ length: 21 }, (_, i) => ({
      tactic: 'Tactic',
      technique: `T${1000 + i}`,
      technique_name: `Technique ${i}`,
      version: 'v14.1',
    }));
    const result = validateAnalytic(a);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('attacks[]');
  });

  it('accepts attacks[] at max boundary (20 bindings)', () => {
    const a = makeValidAnalytic();
    a.attacks = Array.from({ length: 20 }, (_, i) => ({
      tactic: 'Tactic',
      technique: `T${1000 + i}`,
      technique_name: `Technique ${i}`,
      version: 'v14.1',
    }));
    const result = validateAnalytic(a);
    expect(result.valid).toBe(true);
  });

  it('collects multiple errors when multiple fields are invalid', () => {
    const a = makeValidAnalytic();
    a.analyticId = '';
    a.analyticName = '';
    a.version = '';
    a.false_positive_rate = 200;
    const result = validateAnalytic(a);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe('COIM-E — seed fixture conformance', () => {
  it('provides exactly 8 seed analytics (one per type)', () => {
    expect(seedAnalytics).toHaveLength(8);
  });

  it('every seed analytic has entityType "analytic"', () => {
    for (const a of seedAnalytics) {
      expect(a.entity_type).toBe('analytic');
    }
  });

  it('every seed analytic passes structural validation', () => {
    for (const a of seedAnalytics) {
      const result = validateAnalytic(a);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it('seed analytics cover all 8 analytic types', () => {
    const types = new Set(seedAnalytics.map(a => a.analyticType));
    expect(types.size).toBe(8);
    for (const t of ANALYTIC_TYPES) {
      expect(types.has(t)).toBe(true);
    }
  });

  it('every seed analytic has a non-empty analyticId', () => {
    for (const a of seedAnalytics) {
      expect(a.analyticId).toBeTruthy();
      expect(a.analyticId.trim().length).toBeGreaterThan(0);
    }
  });

  it('every seed analytic has a non-empty analyticName', () => {
    for (const a of seedAnalytics) {
      expect(a.analyticName).toBeTruthy();
      expect(a.analyticName.trim().length).toBeGreaterThan(0);
    }
  });

  it('every seed analytic has a valid state', () => {
    for (const a of seedAnalytics) {
      expect(ANALYTIC_STATES).toContain(a.state);
    }
  });

  it('seed analytics cover multiple states (active/deprecated/testing)', () => {
    const states = new Set(seedAnalytics.map(a => a.state));
    expect(states.size).toBeGreaterThanOrEqual(3);
  });

  it('all false positive rates are in valid range (0-100)', () => {
    for (const a of seedAnalytics) {
      if (a.false_positive_rate !== undefined) {
        expect(a.false_positive_rate).toBeGreaterThanOrEqual(0);
        expect(a.false_positive_rate).toBeLessThanOrEqual(100);
      }
    }
  });

  it('seed analytics include both scored and unscored false positive rates', () => {
    const scored = seedAnalytics.filter(a => a.false_positive_rate !== undefined);
    const unscored = seedAnalytics.filter(a => a.false_positive_rate === undefined);
    expect(scored.length).toBeGreaterThanOrEqual(1);
    expect(unscored.length).toBeGreaterThanOrEqual(1);
  });

  it('seed analytics include both with and without ATT&CK bindings', () => {
    const withAttacks = seedAnalytics.filter(a => a.attacks && a.attacks.length > 0);
    const withoutAttacks = seedAnalytics.filter(a => !a.attacks || a.attacks.length === 0);
    expect(withAttacks.length).toBeGreaterThanOrEqual(1);
    expect(withoutAttacks.length).toBeGreaterThanOrEqual(1);
  });

  it('no ATT&CK binding array exceeds max 20', () => {
    for (const a of seedAnalytics) {
      if (a.attacks) {
        expect(a.attacks.length).toBeLessThanOrEqual(20);
      }
    }
  });

  it('seed analytic IDs are deterministic (seedId pattern)', () => {
    for (let i = 0; i < seedAnalytics.length; i++) {
      expect(seedAnalytics[i].id).toBe(`analytic-${String(i + 1).padStart(4, '0')}`);
    }
  });
});

describe('COIM-E — ownership model assertions', () => {
  it('analytic entity has entityType discriminator', () => {
    const a = makeValidAnalytic();
    expect(a.entity_type).toBe('analytic');
  });

  it('source-owned fields are present and typed (immutable after write)', () => {
    const a = makeValidAnalytic();
    expect(typeof a.analyticId).toBe('string');
    expect(typeof a.analyticName).toBe('string');
    expect(typeof a.analyticType).toBe('string');
    expect(typeof a.version).toBe('string');
  });

  it('commander-owned fields are present and typed (mutable)', () => {
    const a = makeValidAnalytic();
    expect(typeof a.state).toBe('string');
    // falsePositiveRate and attacks[] are optional Commander-managed
  });

  it('common fields are present (id, tenant, timestamps, source)', () => {
    const a = makeValidAnalytic();
    expect(typeof a.id).toBe('string');
    expect(a.tenant).toBeDefined();
    expect(typeof a.tenant.tenant_id).toBe('string');
    expect(typeof a.created_at).toBe('string');
    expect(typeof a.updated_at).toBe('string');
    expect(a.source).toBeDefined();
    expect(typeof a.source.connector_id).toBe('string');
  });

  it('AnalyticRef is the lightweight reference shape (analyticId + analyticType)', () => {
    const ref: AnalyticRef = {
      analyticId: 'RULE-TEST-001',
      analyticType: 'detection_rule',
    };
    expect(ref.analyticId).toBe('RULE-TEST-001');
    expect(ref.analyticType).toBe('detection_rule');
    expect(ANALYTIC_TYPES).toContain(ref.analyticType);
  });
});
