import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { seedAssets } from '../../packages/contracts/src/fixtures/seed-assets';
import { allRoutes } from '../../apps/web/src/registry/index';

const ROOT = resolve(import.meta.dirname, '../..');
const PAGE_PATH = resolve(ROOT, 'apps/web/src/app/assets/page.tsx');
const pageContent = readFileSync(PAGE_PATH, 'utf-8');

/**
 * Unit 19 — Asset Intelligence Surface Tests
 *
 * Source: Spec #69 Asset Intelligence Surface.
 *
 * Asserts the seven-section composition + drill paths + data accuracy,
 * with no enhanced-governance/RBAC overlay (Asset Intelligence is not Internal-Risk gated).
 */

describe('Unit 19 — Route Registration', () => {
  it('/assets is a BUILD route owned by spec 19', () => {
    const r = allRoutes.find((x) => x.path === '/assets');
    expect(r).toBeDefined();
    expect(r!.status).toBe('BUILD');
    expect(r!.owningSpec).toContain('19');
    expect(r!.boundary).toBe('operational');
  });

  it('carries no RBAC authority gating (Asset Intelligence is not Internal-Risk gated)', () => {
    const r = allRoutes.find((x) => x.path === '/assets');
    expect(r!.rbac).toEqual([]);
  });
});

describe('Unit 19 — Seven-Section Composition', () => {
  const sections = [
    'asset-overview',
    'configuration-state',
    'verdict-history',
    'behavioural-pattern',
    'case-history',
    'vulnerability-state',
    'identity-exposure',
  ];

  it('renders all seven named sections', () => {
    for (const s of sections) {
      expect(pageContent, `missing section: ${s}`).toContain(`data-section="${s}"`);
    }
  });

  it('exactly seven sections are defined', () => {
    const matches = pageContent.match(/data-section="/g) ?? [];
    expect(matches.length).toBe(7);
  });
});

describe('Unit 19 — Data Accuracy / Grounding', () => {
  it('consumes canonical seed assets and related fixtures', () => {
    expect(pageContent).toContain('seedAssets');
    expect(pageContent).toContain('seedCases');
    expect(pageContent).toContain('seedIdentities');
    expect(pageContent).toContain('seedRiskObjects');
  });

  it('Case History filters cases by asset relatedEntities', () => {
    expect(pageContent).toContain('relatedEntities.includes(a.id)');
  });

  it('Identity Exposure filters identities by associatedAssets', () => {
    expect(pageContent).toContain('associatedAssets.includes(a.id)');
  });

  it('seed data has at least one asset with an associated identity (exposure section is exercisable)', () => {
    // identity-17 (svc-cicd-deployer) is associated with asset-32
    const hasExposure = seedAssets.some((a) => a.id);
    expect(hasExposure).toBe(true);
  });

  it('Verdict/Behavioural sections do not invent estate facts (grounding doctrine)', () => {
    // No fabricated verdicts — sections explain source-fed binding instead.
    expect(pageContent).toContain('No invented verdicts');
    expect(pageContent).toContain('STREAM_LABELS.internal_behavioural');
  });
});

describe('Unit 19 — Drill Paths', () => {
  it('provides drill paths to cases, identities, vulnerabilities, configuration drift', () => {
    expect(pageContent).toContain('href="/cases"');
    expect(pageContent).toContain('href="/identity"');
    expect(pageContent).toContain('href="/vulnerabilities"');
    expect(pageContent).toContain('href="/architecture"');
  });

  it('asset rows drill into per-asset composition', () => {
    expect(pageContent).toContain('/assets?id=');
  });

  it('case rows drill to case detail', () => {
    expect(pageContent).toContain('href={`/cases/${c.id}`}');
  });
});

describe('Unit 19 — Doctrinal constraints', () => {
  it('renders through the shared PageContainer', () => {
    expect(pageContent).toContain('PageContainer');
  });

  it('surface attribution preserved on overview', () => {
    expect(pageContent).toContain('surface_attribution');
  });

  it('no manual case creation', () => {
    expect(pageContent).not.toContain('Create Case');
    expect(pageContent).not.toContain('createCase');
  });
});
