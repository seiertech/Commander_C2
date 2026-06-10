import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { seedIdentities } from '../../packages/contracts/src/fixtures/seed-identities';
import { allRoutes } from '../../apps/web/src/registry/index';

const ROOT = resolve(import.meta.dirname, '../..');
const PAGE_PATH = resolve(ROOT, 'apps/web/src/app/identity/page.tsx');
const pageContent = readFileSync(PAGE_PATH, 'utf-8');

/**
 * Unit 18 — Identity Intelligence Surface
 *
 * Source: Spec #68; RBAC per DEC-sec-c2-internal-cop-rbac (Option C).
 *
 * Asserts the six-section composition, aggregate-tier RBAC on the route, the
 * Internal-Risk-overlay gate on the Behavioural Intelligence tier (aggregate-only
 * default, no fabricated behavioural data), drill paths, and data accuracy.
 */

describe('Unit 18 — Route Registration & RBAC', () => {
  it('/identity is a BUILD route owned by spec 18', () => {
    const r = allRoutes.find((x) => x.path === '/identity');
    expect(r).toBeDefined();
    expect(r!.status).toBe('BUILD');
    expect(r!.owningSpec).toContain('18');
    expect(r!.boundary).toBe('operational');
  });

  it('carries aggregate-tier RBAC (no longer the RBAC:[] placeholder)', () => {
    const r = allRoutes.find((x) => x.path === '/identity');
    expect(r!.rbac.length).toBeGreaterThan(0);
    // Aggregate-tier base personas per DEC-sec-c2-internal-cop-rbac.
    expect(r!.rbac).toContain('CISO');
    expect(r!.rbac).toContain('Identity/Access Specialist');
    expect(r!.rbac).toContain('Security Analyst');
  });
});

describe('Unit 18 — Six-Section Composition', () => {
  const sections = [
    'identity-overview',
    'access-intelligence',
    'behavioural-intelligence',
    'threat-intelligence',
    'case-history',
    'risk-trajectory',
  ];

  it('renders all six named sections', () => {
    for (const s of sections) {
      expect(pageContent, `missing section: ${s}`).toContain(`data-section="${s}"`);
    }
  });

  it('exactly six sections are defined', () => {
    const matches = pageContent.match(/data-section="/g) ?? [];
    expect(matches.length).toBe(6);
  });
});

describe('Unit 18 — Internal Risk overlay gating (DEC-sec-c2-internal-cop-rbac)', () => {
  it('Behavioural Intelligence is gated by the Internal Risk authority overlay', () => {
    expect(pageContent).toContain('Internal Risk authority');
    expect(pageContent).toContain('VIEWER_HAS_INTERNAL_RISK_AUTHORITY');
  });

  it('aggregate-only is the default (overlay flag defaults to false; no auth runtime yet)', () => {
    expect(pageContent).toContain('VIEWER_HAS_INTERNAL_RISK_AUTHORITY = false');
  });

  it('does not fabricate per-identity behavioural data (grounding doctrine)', () => {
    expect(pageContent).toContain('No behavioural data is fabricated');
    expect(pageContent).toContain('audit-of-access');
  });

  it('states backend-authoritative enforcement (frontend is presentation only)', () => {
    expect(pageContent).toContain('backend-authoritative');
  });
});

describe('Unit 18 — Data Accuracy / Grounding', () => {
  it('consumes canonical seed identities and related fixtures', () => {
    expect(pageContent).toContain('seedIdentities');
    expect(pageContent).toContain('seedCases');
    expect(pageContent).toContain('seedAssets');
  });

  it('Case History filters cases by identity relatedEntities', () => {
    expect(pageContent).toContain('relatedEntities.includes(i.id)');
  });

  it('Access Intelligence links associated assets', () => {
    expect(pageContent).toContain('associatedAssets.includes(a.id)');
  });

  it('seed identities include a high-risk identity for the risk-trajectory section', () => {
    expect(seedIdentities.some((i) => i.risk_score >= 50)).toBe(true);
  });
});

describe('Unit 18 — Drill Paths & doctrine', () => {
  it('provides drill paths to cases, assets, and the internal operating picture', () => {
    expect(pageContent).toContain('href="/cases"');
    expect(pageContent).toContain('href="/assets"');
    expect(pageContent).toContain('/operating-picture/internal');
  });

  it('identity rows drill into per-identity composition', () => {
    expect(pageContent).toContain('/identity?id=');
  });

  it('renders through the shared PageContainer; preserves surface attribution; no manual case creation', () => {
    expect(pageContent).toContain('PageContainer');
    expect(pageContent).toContain('surfaceAttribution');
    expect(pageContent).not.toContain('Create Case');
    expect(pageContent).not.toContain('createCase');
  });
});
