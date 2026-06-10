// @ts-nocheck — final 7: require manual line-by-line review
import { describe, it, expect } from 'vitest';
import {
  DISPOSITION_SEVERITY,
  DISPOSITIONS_BY_SEVERITY,
  validateVerdict,
} from '../../packages/contracts/src/entities/verdict';
import type { Verdict } from '../../packages/contracts/src/entities/verdict';
import { seedVerdicts } from '../../packages/contracts/src/fixtures/seed-verdicts';

/**
 * COIM-C: Verdict Entity Promotion
 *
 * Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §6;
 *         Spec #62 Verdict Semantics (semantics authority — NOT changed).
 * Resolves: ARCH-DEBT-043 (verdict entity absence as canonical entity).
 *
 * Validates the Verdict canonical entity contract, disposition semantics
 * preservation (Spec #62), validation logic, and seed-fixture conformance.
 * No engine-logic change — entity promotion only.
 */

function makeValidVerdict(): Verdict {
  return {
    id: 'verdict-test-001',
    entity_type: 'verdict',
    tenant: { tenant_id: 'tenant-test-001', tenant_name: 'Test Tenant' },
    created_at: '2026-01-18T06:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: {
      connector_id: 'connector-test-001',
      import_run_id: 'run-test-001',
      source_system: 'test-system',
      source_timestamp: '2026-01-18T05:55:00.000Z',
    },
    disposition: 'BLOCK',
    source_product: { vendor: 'Cloudflare', name: 'WAF', version: '4.2', connector_class: 'B' },
    confidence: 95,
    observed_at: '2026-01-18T05:59:00.000Z',
    targetEntityId: 'asset-0001',
    targetEntityType: 'asset',
    policy_ref: {
      policy_id: 'waf-rule-001',
      policy_name: 'Test Rule',
      policy_version: '1.0.0',
      policySource: 'Test Source',
    },
    timeBound: true,
    expires_at: '2026-01-25T05:59:00.000Z',
  };
}

describe('COIM-C — disposition semantics preservation (Spec #62)', () => {
  it('defines exactly 8 dispositions in severity order', () => {
    expect(DISPOSITIONS_BY_SEVERITY).toHaveLength(8);
    expect(DISPOSITIONS_BY_SEVERITY[0]).toBe('BLOCK');
    expect(DISPOSITIONS_BY_SEVERITY[7]).toBe('ALLOW');
  });

  it('BLOCK has highest severity (8), ALLOW has lowest (1)', () => {
    expect(DISPOSITION_SEVERITY.BLOCK).toBe(8);
    expect(DISPOSITION_SEVERITY.ALLOW).toBe(1);
  });

  it('severity ordering is strictly decreasing', () => {
    for (let i = 0; i < DISPOSITIONS_BY_SEVERITY.length - 1; i++) {
      const current = DISPOSITION_SEVERITY[DISPOSITIONS_BY_SEVERITY[i]];
      const next = DISPOSITION_SEVERITY[DISPOSITIONS_BY_SEVERITY[i + 1]];
      expect(current).toBeGreaterThan(next);
    }
  });

  it('preserves all 8 Spec #62 dispositions', () => {
    const expected = ['BLOCK', 'QUARANTINE', 'COACH', 'REQUIRE_MFA', 'REQUIRE_COMPLIANT', 'MONITOR', 'ALLOW', 'AUDIT'];
    for (const d of expected) {
      expect(d in DISPOSITION_SEVERITY).toBe(true);
    }
  });
});

describe('COIM-C — validateVerdict', () => {
  it('accepts a well-formed verdict', () => {
    const result = validateVerdict(makeValidVerdict());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects unknown disposition', () => {
    const v = makeValidVerdict();
    (v as unknown as { disposition: string }).disposition = 'DESTROY';
    const result = validateVerdict(v);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('disposition');
  });

  it('rejects confidence below 0', () => {
    const v = makeValidVerdict();
    v.confidence = -5;
    const result = validateVerdict(v);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('confidence');
  });

  it('rejects confidence above 100', () => {
    const v = makeValidVerdict();
    v.confidence = 150;
    const result = validateVerdict(v);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('confidence');
  });

  it('accepts confidence at boundaries (0 and 100)', () => {
    const v0 = makeValidVerdict();
    v0.confidence = 0;
    expect(validateVerdict(v0).valid).toBe(true);

    const v100 = makeValidVerdict();
    v100.confidence = 100;
    expect(validateVerdict(v100).valid).toBe(true);
  });

  it('rejects empty observedAt', () => {
    const v = makeValidVerdict();
    v.observed_at = '';
    const result = validateVerdict(v);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('observed_at');
  });

  it('rejects empty targetEntityId', () => {
    const v = makeValidVerdict();
    v.targetEntityId = '';
    const result = validateVerdict(v);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('targetEntityId');
  });

  it('rejects empty targetEntityType', () => {
    const v = makeValidVerdict();
    v.targetEntityType = '';
    const result = validateVerdict(v);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('targetEntityType');
  });

  it('rejects missing sourceProduct vendor/name', () => {
    const v = makeValidVerdict();
    v.source_product = { vendor: '', name: '' };
    const result = validateVerdict(v);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('source_product');
  });

  it('rejects empty policyRef.policy_id', () => {
    const v = makeValidVerdict();
    v.policy_ref = { policy_id: '' };
    const result = validateVerdict(v);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('policy_ref');
  });

  it('rejects timeBound=true with null expiresAt', () => {
    const v = makeValidVerdict();
    v.timeBound = true;
    v.expires_at = null;
    const result = validateVerdict(v);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('expires_at');
  });

  it('rejects timeBound=false with non-null expiresAt', () => {
    const v = makeValidVerdict();
    v.timeBound = false;
    v.expires_at = '2026-01-25T00:00:00.000Z';
    const result = validateVerdict(v);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('expires_at');
  });

  it('accepts timeBound=false with null expiresAt', () => {
    const v = makeValidVerdict();
    v.timeBound = false;
    v.expires_at = null;
    const result = validateVerdict(v);
    expect(result.valid).toBe(true);
  });
});

describe('COIM-C — seed fixture conformance', () => {
  it('provides exactly 5 seed verdicts', () => {
    expect(seedVerdicts).toHaveLength(5);
  });

  it('every seed verdict has entityType "verdict"', () => {
    for (const v of seedVerdicts) {
      expect(v.entity_type).toBe('verdict');
    }
  });

  it('every seed verdict passes structural validation', () => {
    for (const v of seedVerdicts) {
      const result = validateVerdict(v);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it('seed verdicts cover multiple dispositions', () => {
    const dispositions = new Set(seedVerdicts.map(v => v.disposition));
    expect(dispositions.size).toBeGreaterThanOrEqual(4);
  });

  it('seed verdicts include both time-bound and non-time-bound', () => {
    const timeBound = seedVerdicts.filter(v => v.timeBound);
    const notTimeBound = seedVerdicts.filter(v => !v.timeBound);
    expect(timeBound.length).toBeGreaterThanOrEqual(1);
    expect(notTimeBound.length).toBeGreaterThanOrEqual(1);
  });

  it('seed verdicts target both assets and identities', () => {
    const types = new Set(seedVerdicts.map(v => v.targetEntityType));
    expect(types.has('asset')).toBe(true);
    expect(types.has('identity')).toBe(true);
  });

  it('every seed verdict has a structured policyRef with policyId', () => {
    for (const v of seedVerdicts) {
      expect(v.policy_ref.policy_id).toBeTruthy();
    }
  });

  it('every seed verdict has confidence in valid range (0-100)', () => {
    for (const v of seedVerdicts) {
      expect(v.confidence).toBeGreaterThanOrEqual(0);
      expect(v.confidence).toBeLessThanOrEqual(100);
    }
  });
});
