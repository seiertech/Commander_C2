import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { seedCases } from '../../packages/contracts/src/fixtures/seed-cases';
import { seedRiskObjects } from '../../packages/contracts/src/fixtures/seed-risk-objects';
import { seedConnectors } from '../../packages/contracts/src/fixtures/seed-connectors';
import { allRoutes } from '../../apps/web/src/registry/index';

const ROOT = resolve(import.meta.dirname, '../..');
const PAGE_PATH = resolve(ROOT, 'apps/web/src/app/page.tsx');
const pageContent = readFileSync(PAGE_PATH, 'utf-8');

/**
 * Unit 16a — Operational Command Centre Tests
 *
 * Source: Spec #41/#65/#66; DEC-command-centre-split-16a-16b; DEC-unit16a-gate-clarification.
 *
 * Asserts ONLY the Operational Command Centre entry-surface scope:
 *  - OODA phase-health gauges (from Unit 15 OODA Layer engine)
 *  - case queue overview (priority / status / surface attribution)
 *  - risk object overview (type / treatment state)
 *  - connector health overview
 *  - mission-critical alerts (active P0 conditions)
 *  - Level-3 visual intensity (mode-aware)
 *  - drill links to registered SCAFFOLD Operating Picture routes
 *  - NO aggregate posture/SLA/coverage KPI rollups (those are deferred Unit 16b)
 *  - no manual case creation; seed-data only
 */

describe('Unit 16a — Route Registration', () => {
  it('/ is registered as Command Centre (operational)', () => {
    const route = allRoutes.find((r) => r.path === '/');
    expect(route).toBeDefined();
    expect(route!.label).toBe('Command Centre');
    expect(route!.boundary).toBe('operational');
  });

  it('Operating Picture drill-path targets are registered routes (now BUILT by Units 20/21)', () => {
    const ext = allRoutes.find((r) => r.path === '/operating-picture/external');
    const int = allRoutes.find((r) => r.path === '/operating-picture/internal');
    expect(ext, 'external operating picture route missing').toBeDefined();
    expect(int, 'internal operating picture route missing').toBeDefined();
    // Originally registered SCAFFOLD for the 16a drill paths; Units 20/21 have since
    // built them, so they are now BUILD. The drill-path targets remain registered and resolve.
    expect(['SCAFFOLD', 'BUILD']).toContain(ext!.status);
    expect(['SCAFFOLD', 'BUILD']).toContain(int!.status);
    expect(ext!.owningSpec).toContain('20');
    expect(int!.owningSpec).toContain('21');
  });

  it('Operating Picture pages exist (drill-path targets resolve)', () => {
    expect(existsSync(resolve(ROOT, 'apps/web/src/app/operating-picture/external/page.tsx'))).toBe(true);
    expect(existsSync(resolve(ROOT, 'apps/web/src/app/operating-picture/internal/page.tsx'))).toBe(true);
  });
});

describe('Unit 16a — Mode awareness (Level 3 intensity)', () => {
  it('page uses useMode hook for mode-aware rendering', () => {
    expect(pageContent).toContain('useMode');
  });

  it('renders through the shared PageContainer standard', () => {
    expect(pageContent).toContain('PageContainer');
  });
});

describe('Unit 16a — OODA Phase Health Gauges (Unit 15 engine)', () => {
  it('consumes the OODA Layer engine (composeCommandTempo + phase calculators)', () => {
    expect(pageContent).toContain('composeCommandTempo');
    expect(pageContent).toContain('calculateObserveHealth');
    expect(pageContent).toContain('calculateOrientHealth');
    expect(pageContent).toContain('calculateDecideHealth');
    expect(pageContent).toContain('calculateActHealth');
  });

  it('renders a gauge per OODA phase via OODA_PHASES', () => {
    expect(pageContent).toContain('OODA_PHASES');
    expect(pageContent).toContain('OODA_PHASE_LABELS');
  });

  it('OODA health thresholds are strategy-sourced, not hardcoded', () => {
    // Thresholds must derive from the operational-tempo strategy policy.
    expect(pageContent).toContain("surfaceType === 'operational-tempo'");
    expect(pageContent).toContain('tempoThresholds');
  });
});

describe('Unit 16a — Case Queue Overview', () => {
  it('renders case queue overview grouped by priority, status, surface attribution', () => {
    expect(pageContent).toContain('Case Queue Overview');
    expect(pageContent).toContain('By priority');
    expect(pageContent).toContain('By status');
    expect(pageContent).toContain('By surface attribution');
  });

  it('seed data contains the cases the overview summarises', () => {
    expect(seedCases.length).toBeGreaterThan(0);
  });
});

describe('Unit 16a — Risk Object Overview', () => {
  it('renders risk object overview by type and treatment state', () => {
    expect(pageContent).toContain('Risk Object Overview');
    expect(pageContent).toContain('By type');
    expect(pageContent).toContain('By treatment state');
  });

  it('consumes seed risk objects', () => {
    expect(pageContent).toContain('seedRiskObjects');
    expect(seedRiskObjects.length).toBeGreaterThan(0);
  });
});

describe('Unit 16a — Connector Health Overview', () => {
  it('renders connector health overview', () => {
    expect(pageContent).toContain('Connector Health');
    expect(pageContent).toContain('seedConnectors');
  });

  it('seed data contains at least one connector in error state to surface', () => {
    expect(seedConnectors.some((c) => c.state === 'error')).toBe(true);
  });
});

describe('Unit 16a — Mission-Critical Alerts', () => {
  it('seed data contains an active P0 condition', () => {
    expect(seedCases.filter((c) => c.priority === 'P0').length).toBeGreaterThan(0);
  });

  it('renders a P0 alert with role="alert" and a war-room drill path', () => {
    expect(pageContent).toContain('role="alert"');
    expect(pageContent).toContain('P0 ACTIVE');
    expect(pageContent).toContain('/war-room/p0');
  });

  it('P0 alert uses the critical signal token', () => {
    expect(pageContent).toContain('primitiveSignal.critical');
  });
});

describe('Unit 16a — Operating Picture drill links', () => {
  it('links to both scaffold Operating Picture routes', () => {
    expect(pageContent).toContain('/operating-picture/external');
    expect(pageContent).toContain('/operating-picture/internal');
  });

  it('labels the drill targets as scaffold/deferred', () => {
    expect(pageContent).toContain('SCAFFOLD');
  });
});

describe('Unit 16a — Aggregate KPI rollups are OUT of scope (deferred to 16b)', () => {
  it('does NOT render hardcoded Posture Score / SLA Adherence / Coverage aggregate metrics', () => {
    // These belong to Unit 16b and must not appear as seeded/guessed aggregate values.
    expect(pageContent).not.toContain('Posture Score');
    expect(pageContent).not.toContain('SLA Adherence');
    // No hardcoded percentage literals for aggregate posture metrics.
    expect(pageContent).not.toContain("'72%'");
    expect(pageContent).not.toContain("'94%'");
    expect(pageContent).not.toContain("'87%'");
  });
});

describe('Unit 16a — Seed Data Only / No Manual Case Creation', () => {
  it('consumes seed cases, risk objects and connectors', () => {
    expect(pageContent).toContain('seedCases');
    expect(pageContent).toContain('seedRiskObjects');
    expect(pageContent).toContain('seedConnectors');
  });

  it('does not define new entity types', () => {
    expect(existsSync(resolve(ROOT, 'apps/web/src/app/entities.ts'))).toBe(false);
  });

  it('page does not contain manual case creation UI', () => {
    expect(pageContent).not.toContain('Create Case');
    expect(pageContent).not.toContain('createCase');
  });
});
