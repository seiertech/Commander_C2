// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
import { describe, it, expect } from 'vitest';
import {
  SEED_TENANT,
  seedId,
  seedAssets,
  seedIdentities,
  seedCases,
  seedConnectors,
} from '../../packages/contracts/src/fixtures/index';
import { CONNECTOR_CLASS_LABELS } from '../../packages/contracts/src/entities/common';

/**
 * Seed Data and Test Fixtures Tests — Commander C2
 *
 * Validates:
 * - Tenant isolation (v1.3 Req 7)
 * - Deterministic IDs (v1.3 Req 20)
 * - No real credentials (Domain Req 1, v1.3 Req 19)
 * - Connector class adherence (v1.3 Req 14 — A/B/C/D only)
 * - Surface attribution preserved (Doctrinal Assertion 10)
 * - Case lifecycle system-owned (Doctrinal Assertion 1)
 * - Entity completeness (v1.3 Reqs 3-6)
 */

describe('Tenant Isolation (v1.3 Req 7)', () => {
  it('all assets are tenant-scoped', () => {
    for (const asset of seedAssets) {
      expect(asset.tenant.tenant_id).toBe(SEED_TENANT.tenant_id);
    }
  });

  it('all identities are tenant-scoped', () => {
    for (const identity of seedIdentities) {
      expect(identity.tenant.tenant_id).toBe(SEED_TENANT.tenant_id);
    }
  });

  it('all cases are tenant-scoped', () => {
    for (const c of seedCases) {
      expect(c.tenant.tenant_id).toBe(SEED_TENANT.tenant_id);
    }
  });

  it('all connectors are tenant-scoped', () => {
    for (const conn of seedConnectors) {
      expect(conn.tenant.tenant_id).toBe(SEED_TENANT.tenant_id);
    }
  });
});

describe('Deterministic IDs (v1.3 Req 20)', () => {
  it('seedId produces stable, predictable identifiers', () => {
    expect(seedId('asset', 1)).toBe('asset-0001');
    expect(seedId('asset', 1)).toBe('asset-0001'); // same call = same result
    expect(seedId('case', 42)).toBe('case-0042');
  });

  it('all fixture IDs follow the deterministic pattern', () => {
    for (const asset of seedAssets) {
      expect(asset.id).toMatch(/^asset-\d{4}$/);
    }
    for (const identity of seedIdentities) {
      expect(identity.id).toMatch(/^identity-\d{4}$/);
    }
    for (const c of seedCases) {
      expect(c.id).toMatch(/^case-\d{4}$/);
    }
    for (const conn of seedConnectors) {
      expect(conn.id).toMatch(/^connector-\d{4}$/);
    }
  });
});

describe('No Real Credentials (Domain Req 1, v1.3 Req 19)', () => {
  const allFixtureStrings = JSON.stringify([
    ...seedAssets,
    ...seedIdentities,
    ...seedCases,
    ...seedConnectors,
  ]);

  it('no real API keys or tokens', () => {
    expect(allFixtureStrings).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
    expect(allFixtureStrings).not.toMatch(/Bearer [a-zA-Z0-9]{20,}/);
  });

  it('no real email domains (only .example)', () => {
    const emails = seedIdentities.map((i) => i.email);
    for (const email of emails) {
      expect(email).toMatch(/\.example$/);
    }
  });

  it('uses synthetic source system names (mock suffix)', () => {
    for (const conn of seedConnectors) {
      expect(conn.name).toContain('Mock');
    }
  });
});

describe('Connector Class Adherence (v1.3 Req 14)', () => {
  const validClasses = ['A', 'B', 'C', 'D'];

  it('all connectors use only valid classes A/B/C/D', () => {
    for (const conn of seedConnectors) {
      for (const cls of conn.classes) {
        expect(validClasses).toContain(cls);
      }
    }
  });

  it('connector class labels are defined for all classes', () => {
    for (const cls of validClasses) {
      expect(CONNECTOR_CLASS_LABELS[cls as keyof typeof CONNECTOR_CLASS_LABELS]).toBeTruthy();
    }
  });

  it('at least one connector per class exists', () => {
    for (const cls of validClasses) {
      const hasClass = seedConnectors.some((c) => c.classes.includes(cls as any));
      expect(hasClass, `No connector with class ${cls}`).toBe(true);
    }
  });
});

describe('Surface Attribution (Doctrinal Assertion 10)', () => {
  it('all assets have surface attribution', () => {
    for (const asset of seedAssets) {
      expect(['internal_attack_surface', 'external_attack_surface']).toContain(
        asset.surface_attribution,
      );
    }
  });

  it('all identities have surface attribution', () => {
    for (const identity of seedIdentities) {
      expect(['internal_attack_surface', 'external_attack_surface']).toContain(
        identity.surface_attribution,
      );
    }
  });

  it('all cases have surface attribution', () => {
    for (const c of seedCases) {
      expect(['internal_attack_surface', 'external_attack_surface']).toContain(
        c.surface_attribution,
      );
    }
  });
});

describe('Case Lifecycle (Doctrinal Assertion 1)', () => {
  it('all cases have routing rationale (system-routed, not manual)', () => {
    for (const c of seedCases) {
      expect(c.routingRationale).toBeTruthy();
    }
  });

  it('all cases have audit trail reference', () => {
    for (const c of seedCases) {
      expect(c.auditTrailRef).toBeTruthy();
    }
  });

  it('all cases have SLA information', () => {
    for (const c of seedCases) {
      expect(c.sla.target_resolution_hours).toBeGreaterThan(0);
    }
  });

  it('no case has manual-creation source', () => {
    for (const c of seedCases) {
      expect(c.source.source_system).not.toContain('manual');
      expect(c.source.source_system).toContain('commander');
    }
  });
});

describe('Entity Completeness', () => {
  it('assets have coverage fields (v1.3 Req 3)', () => {
    for (const asset of seedAssets) {
      expect(asset.coverage).toBeDefined();
      expect(typeof asset.coverage.has_edr).toBe('boolean');
    }
  });

  it('identities have classification and lineage (v1.3 Req 4)', () => {
    for (const identity of seedIdentities) {
      expect(identity.classification).toBeTruthy();
      expect(identity.source_system_lineage.length).toBeGreaterThan(0);
    }
  });

  it('connectors have mapping pack version (v1.3 Req 9)', () => {
    for (const conn of seedConnectors) {
      expect(conn.mapping_pack_version).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it('all entities have source provenance (v1.3 Req 12)', () => {
    const allEntities = [...seedAssets, ...seedIdentities, ...seedCases, ...seedConnectors];
    for (const entity of allEntities) {
      expect(entity.source.connector_id).toBeTruthy();
      expect(entity.source.import_run_id).toBeTruthy();
      expect(entity.source.source_system).toBeTruthy();
    }
  });
});
