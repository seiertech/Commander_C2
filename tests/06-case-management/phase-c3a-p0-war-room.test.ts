import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { primitiveSignal, primitiveGlow, primitiveHud } from '../../packages/ui/src/tokens/primitives';

const ROOT = resolve(import.meta.dirname, '../..');
const PAGE_PATH = resolve(ROOT, 'apps/web/src/app/war-room/p0/page.tsx');
const pageContent = readFileSync(PAGE_PATH, 'utf-8');

/**
 * Spec 06 Phase C3a — P0 Zero-Day War Room Tests
 *
 * Validates:
 * - Page exists at war-room/p0/page.tsx
 * - Forces Mission/Emergency Command mode (DS-1.0 §9.3)
 * - P0 propagation: reason, scope, owner, expiry/review, evidence (Assertion 2)
 * - Emergency styling with critical glow
 * - No manual case creation or closure (Assertion 1)
 * - Surface attribution displayed (Assertion 10)
 * - Strategy consumption for SLA (Constraint 9)
 */

describe('P0 War Room — Page Exists', () => {
  it('war-room/p0/page.tsx exists', () => {
    expect(existsSync(PAGE_PATH)).toBe(true);
  });
});

describe('P0 War Room — Emergency Command Mode (DS-1.0 §9.3)', () => {
  it('uses HUD/Mission tokens directly (forces Mission)', () => {
    expect(pageContent).toContain('primitiveHud.bg0');
    expect(pageContent).toContain('primitiveHud.bg2');
    expect(pageContent).toContain('primitiveHud.text0');
  });

  it('displays EMERGENCY COMMAND banner', () => {
    expect(pageContent).toContain('EMERGENCY COMMAND');
  });

  it('uses critical glow effect', () => {
    expect(pageContent).toContain('primitiveGlow.radius');
    expect(pageContent).toContain('primitiveGlow.intensity');
  });

  it('uses critical signal colour', () => {
    expect(pageContent).toContain('primitiveSignal.critical');
  });
});

describe('P0 War Room — P0 Propagation (Assertion 2)', () => {
  it('displays reason (title)', () => {
    expect(pageContent).toContain('c.title');
  });

  it('displays scope (surface attribution)', () => {
    expect(pageContent).toContain('surface_attribution');
  });

  it('displays owner', () => {
    expect(pageContent).toContain('c.owner');
  });

  it('displays SLA (expiry/review)', () => {
    expect(pageContent).toContain('strategy.sla');
    expect(pageContent).toContain('response');
  });

  it('displays routing rationale (evidence)', () => {
    expect(pageContent).toContain('routingRationale');
  });
});

describe('P0 War Room — Strategy Consumption (Constraint 9)', () => {
  it('uses resolveAllStrategies', () => {
    expect(pageContent).toContain('resolveAllStrategies');
  });

  it('SLA from strategy resolution', () => {
    expect(pageContent).toContain("c.strategy.sla.status === 'resolved'");
  });
});

describe('P0 War Room — No Manual Actions (Assertion 1)', () => {
  it('no manual case creation', () => {
    expect(pageContent).not.toContain('Create Case');
    expect(pageContent).not.toContain('createCase');
  });

  it('no manual closure', () => {
    expect(pageContent).not.toContain('Close Case');
    expect(pageContent).not.toContain('manualClosure');
  });
});

describe('P0 War Room — Accessibility', () => {
  it('emergency banner has role="alert"', () => {
    expect(pageContent).toContain('role="alert"');
  });

  it('priority uses shape + label (never colour alone)', () => {
    expect(pageContent).toContain('primitivePriority.p0.shape');
    expect(pageContent).toContain('primitivePriority.p0.label');
  });
});
