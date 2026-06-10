import { describe, it, expect } from 'vitest';
import {
  OBSERVABLE_TYPES,
  MAX_REPUTATION,
  MIN_REPUTATION,
  validateObservable,
} from '../../packages/contracts/src/entities/observable';
import type {
  Observable,
  ObservableRiskObjectBinding,
  ObservableValidation,
} from '../../packages/contracts/src/entities/observable';
import { seedObservables, seedObservableBindings } from '../../packages/contracts/src/fixtures/seed-observables';

/**
 * COIM-D: Observable Entity
 *
 * Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §4.5;
 *         03_REUSABLE_OBJECT_CATALOGUE.md §2.5.
 * Resolves: ARCH-DEBT-041 (observable entity absence).
 *
 * Validates the Observable entity contract, validation logic, seed-fixture
 * conformance, ownership model, deduplication binding, and type taxonomy.
 * No engine-logic dependency — entity shape and provenance only.
 */

function makeValidObservable(): Observable {
  return {
    id: 'observable-test-001',
    entityType: 'observable',
    tenant: { tenantId: 'tenant-test-001', tenantName: 'Test Tenant' },
    createdAt: '2026-01-18T06:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: {
      connectorId: 'connector-test-001',
      importRunId: 'run-test-001',
      sourceSystem: 'test-system',
      sourceTimestamp: '2026-01-18T05:55:00.000Z',
    },
    observableType: 'ip',
    value: '192.0.2.1',
    firstSeen: '2026-01-17T10:00:00.000Z',
    lastSeen: '2026-01-18T05:55:00.000Z',
    reputation: 25,
  };
}

describe('COIM-D — observable type taxonomy', () => {
  it('enumerates exactly 8 observable types', () => {
    expect(OBSERVABLE_TYPES).toHaveLength(8);
    expect(OBSERVABLE_TYPES).toContain('ip');
    expect(OBSERVABLE_TYPES).toContain('domain');
    expect(OBSERVABLE_TYPES).toContain('hash');
    expect(OBSERVABLE_TYPES).toContain('url');
    expect(OBSERVABLE_TYPES).toContain('email');
    expect(OBSERVABLE_TYPES).toContain('certificate');
    expect(OBSERVABLE_TYPES).toContain('process');
    expect(OBSERVABLE_TYPES).toContain('file');
  });

  it('defines reputation bounds', () => {
    expect(MIN_REPUTATION).toBe(0);
    expect(MAX_REPUTATION).toBe(100);
  });

  it('observable types match OCSF type_id taxonomy (ip/domain/hash/url/email/certificate/process/file)', () => {
    const expectedTypes = ['ip', 'domain', 'hash', 'url', 'email', 'certificate', 'process', 'file'];
    expect(OBSERVABLE_TYPES).toEqual(expectedTypes);
  });
});

describe('COIM-D — validateObservable', () => {
  it('accepts a well-formed observable entity', () => {
    const result = validateObservable(makeValidObservable());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects unknown observableType', () => {
    const obs = makeValidObservable();
    (obs as unknown as { observableType: string }).observableType = 'unknown_type';
    const result = validateObservable(obs);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('observableType');
  });

  it('rejects empty value', () => {
    const obs = makeValidObservable();
    obs.value = '';
    const result = validateObservable(obs);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('value');
  });

  it('rejects whitespace-only value', () => {
    const obs = makeValidObservable();
    obs.value = '   ';
    const result = validateObservable(obs);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('value');
  });

  it('rejects empty firstSeen', () => {
    const obs = makeValidObservable();
    obs.firstSeen = '';
    const result = validateObservable(obs);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('firstSeen');
  });

  it('rejects empty lastSeen', () => {
    const obs = makeValidObservable();
    obs.lastSeen = '';
    const result = validateObservable(obs);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('lastSeen');
  });

  it('rejects lastSeen before firstSeen', () => {
    const obs = makeValidObservable();
    obs.firstSeen = '2026-01-18T06:00:00.000Z';
    obs.lastSeen = '2026-01-17T06:00:00.000Z'; // before firstSeen
    const result = validateObservable(obs);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('lastSeen');
  });

  it('accepts lastSeen equal to firstSeen (single observation)', () => {
    const obs = makeValidObservable();
    obs.firstSeen = '2026-01-18T06:00:00.000Z';
    obs.lastSeen = '2026-01-18T06:00:00.000Z';
    const result = validateObservable(obs);
    expect(result.valid).toBe(true);
  });

  it('rejects reputation below 0', () => {
    const obs = makeValidObservable();
    obs.reputation = -1;
    const result = validateObservable(obs);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('reputation');
  });

  it('rejects reputation above 100', () => {
    const obs = makeValidObservable();
    obs.reputation = 101;
    const result = validateObservable(obs);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('reputation');
  });

  it('accepts reputation at boundaries (0 and 100)', () => {
    const obs0 = makeValidObservable();
    obs0.reputation = 0;
    expect(validateObservable(obs0).valid).toBe(true);

    const obs100 = makeValidObservable();
    obs100.reputation = 100;
    expect(validateObservable(obs100).valid).toBe(true);
  });

  it('accepts observable without reputation (enrichment not yet available)', () => {
    const obs = makeValidObservable();
    obs.reputation = undefined;
    const result = validateObservable(obs);
    expect(result.valid).toBe(true);
  });

  it('collects multiple errors when multiple fields are invalid', () => {
    const obs = makeValidObservable();
    obs.value = '';
    obs.firstSeen = '';
    obs.lastSeen = '';
    obs.reputation = 200;
    const result = validateObservable(obs);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe('COIM-D — seed fixture conformance', () => {
  it('provides exactly 8 seed observables (one per type)', () => {
    expect(seedObservables).toHaveLength(8);
  });

  it('every seed observable has entityType "observable"', () => {
    for (const obs of seedObservables) {
      expect(obs.entityType).toBe('observable');
    }
  });

  it('every seed observable passes structural validation', () => {
    for (const obs of seedObservables) {
      const result = validateObservable(obs);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it('seed observables cover all 8 observable types', () => {
    const types = new Set(seedObservables.map(obs => obs.observableType));
    expect(types.size).toBe(8);
    for (const t of OBSERVABLE_TYPES) {
      expect(types.has(t)).toBe(true);
    }
  });

  it('every seed observable has a non-empty value', () => {
    for (const obs of seedObservables) {
      expect(obs.value).toBeTruthy();
      expect(obs.value.trim().length).toBeGreaterThan(0);
    }
  });

  it('every seed observable has valid firstSeen and lastSeen (lastSeen >= firstSeen)', () => {
    for (const obs of seedObservables) {
      const first = new Date(obs.firstSeen).getTime();
      const last = new Date(obs.lastSeen).getTime();
      expect(last).toBeGreaterThanOrEqual(first);
    }
  });

  it('seed observables include both scored and unscored reputation', () => {
    const scored = seedObservables.filter(obs => obs.reputation !== undefined);
    const unscored = seedObservables.filter(obs => obs.reputation === undefined);
    expect(scored.length).toBeGreaterThanOrEqual(1);
    expect(unscored.length).toBeGreaterThanOrEqual(1);
  });

  it('all reputation scores are in valid range (0-100)', () => {
    for (const obs of seedObservables) {
      if (obs.reputation !== undefined) {
        expect(obs.reputation).toBeGreaterThanOrEqual(0);
        expect(obs.reputation).toBeLessThanOrEqual(100);
      }
    }
  });

  it('seed observable IDs are deterministic (seedId pattern)', () => {
    for (let i = 0; i < seedObservables.length; i++) {
      expect(seedObservables[i].id).toBe(`observable-${String(i + 1).padStart(4, '0')}`);
    }
  });
});

describe('COIM-D — many-to-many binding conformance', () => {
  it('provides seed observable-risk-object bindings', () => {
    expect(seedObservableBindings.length).toBeGreaterThan(0);
  });

  it('every binding references a valid observable ID from seed data', () => {
    const observableIds = new Set(seedObservables.map(obs => obs.id));
    for (const binding of seedObservableBindings) {
      expect(observableIds.has(binding.observableId)).toBe(true);
    }
  });

  it('every binding has a non-empty riskObjectId', () => {
    for (const binding of seedObservableBindings) {
      expect(binding.riskObjectId).toBeTruthy();
    }
  });

  it('every binding has a non-empty boundAt timestamp', () => {
    for (const binding of seedObservableBindings) {
      expect(binding.boundAt).toBeTruthy();
    }
  });

  it('demonstrates deduplication: at least one observable is bound to multiple risk objects', () => {
    const observableBindingCounts = new Map<string, number>();
    for (const binding of seedObservableBindings) {
      const count = observableBindingCounts.get(binding.observableId) ?? 0;
      observableBindingCounts.set(binding.observableId, count + 1);
    }
    const multipleBindings = [...observableBindingCounts.values()].filter(c => c > 1);
    expect(multipleBindings.length).toBeGreaterThanOrEqual(1);
  });

  it('no duplicate bindings exist (each observable-risk-object pair is unique)', () => {
    const pairs = seedObservableBindings.map(b => `${b.observableId}:${b.riskObjectId}`);
    const uniquePairs = new Set(pairs);
    expect(uniquePairs.size).toBe(pairs.length);
  });
});

describe('COIM-D — ownership model assertions', () => {
  it('observable entity has entityType discriminator', () => {
    const obs = makeValidObservable();
    expect(obs.entityType).toBe('observable');
  });

  it('source-owned fields are present and typed (immutable after write)', () => {
    const obs = makeValidObservable();
    expect(typeof obs.observableType).toBe('string');
    expect(typeof obs.value).toBe('string');
    expect(typeof obs.firstSeen).toBe('string');
    expect(typeof obs.lastSeen).toBe('string');
  });

  it('commander-owned fields are present and typed (mutable)', () => {
    const obs = makeValidObservable();
    // reputation is optional but when present must be number
    expect(typeof obs.reputation).toBe('number');
  });

  it('common fields are present (id, tenant, timestamps, source)', () => {
    const obs = makeValidObservable();
    expect(typeof obs.id).toBe('string');
    expect(obs.tenant).toBeDefined();
    expect(typeof obs.tenant.tenantId).toBe('string');
    expect(typeof obs.tenant.tenantName).toBe('string');
    expect(typeof obs.createdAt).toBe('string');
    expect(typeof obs.updatedAt).toBe('string');
    expect(obs.source).toBeDefined();
    expect(typeof obs.source.connectorId).toBe('string');
    expect(typeof obs.source.importRunId).toBe('string');
    expect(typeof obs.source.sourceSystem).toBe('string');
    expect(typeof obs.source.sourceTimestamp).toBe('string');
  });
});
