import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { seedAssets } from '../../packages/contracts/src/fixtures/seed-assets';
import { seedCases } from '../../packages/contracts/src/fixtures/seed-cases';
import { allRoutes } from '../../apps/web/src/registry/index';

const ROOT = resolve(import.meta.dirname, '../..');
const PAGE_PATH = resolve(ROOT, 'apps/web/src/app/operating-picture/external/page.tsx');
const pageContent = readFileSync(PAGE_PATH, 'utf-8');

/**
 * Unit 20 — External Operating Picture Tests
 *
 * Source: Spec #65 External Operating Picture, #60 Attack Surface Framework.
 *
 * Asserts:
 *  - external attack surface inventory (external_attack_surface assets/identities)
 *  - External Attack Intelligence stream visualisation (Class A connectors)
 *  - external attack surface case queue (external-attributed cases)
 *  - external attack surface risk objects
 *  - drill paths
 *  - surface attribution preserved (external only); SOC read-only; no manual case creation
 */

describe('Unit 20 — Route Registration', () => {
  it('/operating-picture/external is registered (owned by spec 20)', () => {
    const r = allRoutes.find((x) => x.path === '/operating-picture/external');
    expect(r).toBeDefined();
    expect(r!.owningSpec).toContain('20');
    expect(r!.boundary).toBe('operational');
  });
});

describe('Unit 20 — Surface Attribution (external only)', () => {
  it('filters strictly on external_attack_surface', () => {
    expect(pageContent).toContain("'external_attack_surface'");
    expect(pageContent).toContain('surfaceAttribution === EXTERNAL');
  });

  it('seed data contains external-attributed assets and cases to surface', () => {
    expect(seedAssets.some((a) => a.surface_attribution === 'external_attack_surface')).toBe(true);
    expect(seedCases.some((c) => c.surface_attribution === 'external_attack_surface')).toBe(true);
  });

  it('does not render internal-only attribution as the primary filter', () => {
    // The page's governing constant must be external.
    expect(pageContent).toContain("const EXTERNAL = 'external_attack_surface'");
  });
});

describe('Unit 20 — External Attack Surface Inventory', () => {
  it('renders an external attack surface inventory', () => {
    expect(pageContent).toContain('External Attack Surface Inventory');
    expect(pageContent).toContain('externalAssets');
    expect(pageContent).toContain('externalIdentities');
  });
});

describe('Unit 20 — External Attack Intelligence Stream', () => {
  it('visualises the External Attack Intelligence stream from Class A connectors', () => {
    expect(pageContent).toContain('STREAM_LABELS.external_attack');
    expect(pageContent).toContain('CLASS_TO_STREAM');
    expect(pageContent).toContain('externalAttackConnectors');
  });
});

describe('Unit 20 — External Case Queue', () => {
  it('renders the external attack surface case queue', () => {
    expect(pageContent).toContain('External Attack Surface Case Queue');
    expect(pageContent).toContain('externalCases');
  });
});

describe('Unit 20 — External Risk Objects', () => {
  it('renders external attack surface risk objects', () => {
    expect(pageContent).toContain('External Risk Objects');
    expect(pageContent).toContain('externalRiskObjects');
  });
});

describe('Unit 20 — Drill Paths', () => {
  it('provides drill paths to cases, assets, identities and the internal picture', () => {
    expect(pageContent).toContain('href="/cases"');
    expect(pageContent).toContain('href="/assets"');
    expect(pageContent).toContain('href="/identity"');
    expect(pageContent).toContain('/operating-picture/internal');
  });

  it('case rows drill to case detail', () => {
    expect(pageContent).toContain('href={`/cases/${c.id}`}');
  });
});

describe('Unit 20 — Doctrinal constraints', () => {
  it('renders through the shared PageContainer', () => {
    expect(pageContent).toContain('PageContainer');
  });

  it('no manual case creation', () => {
    expect(pageContent).not.toContain('Create Case');
    expect(pageContent).not.toContain('createCase');
  });
});
