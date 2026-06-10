import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { seedAssets } from '../../packages/contracts/src/fixtures/seed-assets';
import { seedCases } from '../../packages/contracts/src/fixtures/seed-cases';
import { allRoutes } from '../../apps/web/src/registry/index';

const ROOT = resolve(import.meta.dirname, '../..');
const PAGE_PATH = resolve(ROOT, 'apps/web/src/app/operating-picture/internal/page.tsx');
const pageContent = readFileSync(PAGE_PATH, 'utf-8');

/**
 * Unit 21 — Internal Operating Picture
 *
 * Source: Spec #66 Internal Operating Picture, #60 Attack Surface Framework;
 *         RBAC per DEC-sec-c2-internal-cop-rbac (Option C).
 *
 * Asserts: internal attack surface inventory, aggregate Internal Behavioural stream,
 * internal case queue + risk objects, the IR-overlay-gated per-identity tier
 * (aggregate-only default, no fabricated data), drill paths, and surface attribution.
 */

describe('Unit 21 — Route Registration & RBAC', () => {
  it('/operating-picture/internal is a BUILD route owned by spec 21', () => {
    const r = allRoutes.find((x) => x.path === '/operating-picture/internal');
    expect(r).toBeDefined();
    expect(r!.status).toBe('BUILD');
    expect(r!.owningSpec).toContain('21');
    expect(r!.boundary).toBe('operational');
  });

  it('carries aggregate-tier RBAC (no longer the RBAC:[] placeholder)', () => {
    const r = allRoutes.find((x) => x.path === '/operating-picture/internal');
    expect(r!.rbac.length).toBeGreaterThan(0);
    expect(r!.rbac).toContain('CISO');
    expect(r!.rbac).toContain('Identity/Access Specialist');
  });
});

describe('Unit 21 — Surface Attribution (internal only)', () => {
  it('filters strictly on internal_attack_surface', () => {
    expect(pageContent).toContain("const INTERNAL = 'internal_attack_surface'");
    expect(pageContent).toContain('surfaceAttribution === INTERNAL');
  });

  it('seed data contains internal-attributed assets and cases to surface', () => {
    expect(seedAssets.some((a) => a.surface_attribution === 'internal_attack_surface')).toBe(true);
    expect(seedCases.some((c) => c.surface_attribution === 'internal_attack_surface')).toBe(true);
  });
});

describe('Unit 21 — Deliverables', () => {
  it('renders internal attack surface inventory', () => {
    expect(pageContent).toContain('Internal Attack Surface Inventory');
    expect(pageContent).toContain('internalAssets');
    expect(pageContent).toContain('internalIdentities');
  });

  it('visualises the aggregate Internal Behavioural Intelligence stream (Class B)', () => {
    expect(pageContent).toContain('STREAM_LABELS.internal_behavioural');
    expect(pageContent).toContain('CLASS_TO_STREAM');
    expect(pageContent).toContain('internalBehaviouralConnectors');
  });

  it('renders the internal case queue and internal risk objects', () => {
    expect(pageContent).toContain('Internal Attack Surface Case Queue');
    expect(pageContent).toContain('internalCases');
    expect(pageContent).toContain('Internal Risk Objects');
    expect(pageContent).toContain('internalRiskObjects');
  });
});

describe('Unit 21 — Internal Risk overlay gating (DEC-sec-c2-internal-cop-rbac)', () => {
  it('per-identity verdict density / identity risk pattern is overlay-gated', () => {
    expect(pageContent).toContain('data-section="verdict-density-overlay"');
    expect(pageContent).toContain('Internal Risk authority');
    expect(pageContent).toContain('VIEWER_HAS_INTERNAL_RISK_AUTHORITY');
  });

  it('aggregate-only is the default (overlay flag defaults to false)', () => {
    expect(pageContent).toContain('VIEWER_HAS_INTERNAL_RISK_AUTHORITY = false');
  });

  it('does not fabricate behavioural data; documents audit-of-access + backend enforcement', () => {
    expect(pageContent).toContain('No behavioural data is fabricated');
    expect(pageContent).toContain('audit-of-access');
    expect(pageContent).toContain('backend-authoritative');
  });
});

describe('Unit 21 — Drill paths & doctrine', () => {
  it('provides drill paths to cases, assets, identities, external picture', () => {
    expect(pageContent).toContain('href="/cases"');
    expect(pageContent).toContain('href="/assets"');
    expect(pageContent).toContain('href="/identity"');
    expect(pageContent).toContain('/operating-picture/external');
  });

  it('case rows drill to case detail', () => {
    expect(pageContent).toContain('href={`/cases/${c.id}`}');
  });

  it('renders through PageContainer; no manual case creation', () => {
    expect(pageContent).toContain('PageContainer');
    expect(pageContent).not.toContain('Create Case');
    expect(pageContent).not.toContain('createCase');
  });
});
