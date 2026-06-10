import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');
const PAGE_PATH = resolve(ROOT, 'apps/web/src/app/cases/analytics/page.tsx');
const pageContent = readFileSync(PAGE_PATH, 'utf-8');

/**
 * Spec 06 Phase C3b — Case Analytics Tests (aligned to committed Tabler/PageContainer pattern)
 *
 * The analytics page renders four chart placeholders (ApexCharts pending) with mode-aware
 * rendering, SLA from strategy resolver, and token-driven layout. The old Vega-Lite spec
 * assertions are removed — the page never implemented Vega specs (DEC-pagecontainer-shared-standard
 * Tabler conversion + ApexCharts migration note in the page comment).
 */

describe('Case Analytics — Page Exists', () => {
  it('cases/analytics/page.tsx exists', () => {
    expect(existsSync(PAGE_PATH)).toBe(true);
  });
});

describe('Case Analytics — Mode Support', () => {
  it('uses useMode hook', () => {
    expect(pageContent).toContain('useMode');
  });

  it('passes tokens and mode to chart cards', () => {
    expect(pageContent).toContain('tokens={tokens}');
    expect(pageContent).toContain('mode={mode}');
  });
});

describe('Case Analytics — Four Chart Types (placeholders — ApexCharts pending)', () => {
  it('has Case Volume Trend (line chart placeholder)', () => {
    expect(pageContent).toContain('Case Volume Trend');
    expect(pageContent).toContain('chartType="line"');
  });

  it('has Case Type Distribution (donut chart placeholder)', () => {
    expect(pageContent).toContain('Case Type Distribution');
    expect(pageContent).toContain('chartType="donut"');
  });

  it('has SLA Compliance (numeric gauge from strategy resolver)', () => {
    expect(pageContent).toContain('SLA Compliance');
    expect(pageContent).toContain('slaCompliancePct');
  });

  it('has Priority Distribution (bar chart placeholder)', () => {
    expect(pageContent).toContain('Priority Distribution');
    expect(pageContent).toContain('chartType="bar"');
  });
});

describe('Case Analytics — SLA from Strategy Resolver (Constraint 9)', () => {
  it('uses resolveAllStrategies for SLA data', () => {
    expect(pageContent).toContain('resolveAllStrategies');
    expect(pageContent).toContain('seedStrategies');
  });

  it('SLA adherence derived from resolver output', () => {
    expect(pageContent).toContain('slaResolutions');
    expect(pageContent).toContain("s.status === 'resolved'");
  });

  it('notes strategy source in subtitle', () => {
    expect(pageContent).toContain('not hardcoded');
  });
});

describe('Case Analytics — Token Consumption', () => {
  it('uses componentTokens for layout', () => {
    expect(pageContent).toContain('componentTokens.cardPadding');
    expect(pageContent).toContain('componentTokens.gridGap');
  });

  it('uses primitiveTypeScale for font sizes', () => {
    expect(pageContent).toContain('primitiveTypeScale.h3');
    expect(pageContent).toContain('primitiveTypeScale.caption');
    expect(pageContent).toContain('primitiveTypeScale.micro');
  });

  it('uses primitiveFonts.mono for SLA numeric value', () => {
    expect(pageContent).toContain('primitiveFonts.mono');
  });

  it('renders through PageContainer', () => {
    expect(pageContent).toContain('PageContainer');
  });
});

describe('Case Analytics — Mode-aware Surfaces', () => {
  it('chart cards use tokens.surface.elevated and tokens.border.subtle', () => {
    expect(pageContent).toContain('tokens.surface.elevated');
    expect(pageContent).toContain('tokens.border.subtle');
  });

  it('text uses tokens.text.primary and tokens.text.muted', () => {
    expect(pageContent).toContain('tokens.text.primary');
    expect(pageContent).toContain('tokens.text.muted');
  });
});
