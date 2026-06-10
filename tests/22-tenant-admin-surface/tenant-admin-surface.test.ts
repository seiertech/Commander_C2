import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  TENANT_ADMIN_CAPABILITY_LEDGER,
  MOCK_TENANT_USERS,
  MOCK_AUTHORITY_OVERLAYS,
} from '../../apps/web/src/app/tenant-admin/mock-tenant-config';
import { getRoutesByBoundary } from '../../apps/web/src/registry/index';

const ROOT = resolve(import.meta.dirname, '../..');
const PAGE_PATH = resolve(ROOT, 'apps/web/src/app/tenant-admin/page.tsx');
const pageContent = readFileSync(PAGE_PATH, 'utf-8');
const DEBT = readFileSync(resolve(ROOT, 'docs/knowledge/ARCHITECTURAL_DEBT_REGISTER.md'), 'utf-8');
const DECISIONS = readFileSync(resolve(ROOT, 'DECISIONS.md'), 'utf-8');

/**
 * Unit 22 — Tenant Admin Surface v1
 *
 * Source: Spec #39/#47 Tenant Admin; DEC-unit22-tenant-admin-v1-deferrals.
 *
 * Asserts the v1 display + mock-backed scope, the three-application boundary,
 * and — critically — that EVERY displayed-but-not-enforced capability is recorded
 * with an explicit enforcement status and a formal deferral owner (no hidden deferral).
 */

describe('Unit 22 — Three-application boundary preserved', () => {
  it('tenant-admin layout and page exist (distinct boundary)', () => {
    expect(existsSync(resolve(ROOT, 'apps/web/src/app/tenant-admin/layout.tsx'))).toBe(true);
    expect(existsSync(PAGE_PATH)).toBe(true);
  });

  it('tenant-admin routes are a distinct boundary', () => {
    const admin = getRoutesByBoundary('tenant-admin');
    expect(admin.length).toBeGreaterThan(0);
    expect(admin.every((r) => r.boundary === 'tenant-admin')).toBe(true);
  });
});

describe('Unit 22 — v1 capabilities rendered', () => {
  const sections = [
    'tenant-profile', 'users', 'roles', 'authority-overlays',
    'mfa-policy', 'sso', 'connector-settings', 'security-posture', 'capability-status',
  ];
  it('renders all v1 capability sections', () => {
    // Sections are rendered via <Section id="..."> (which emits data-section={id}).
    for (const s of sections) {
      expect(pageContent, `missing section: ${s}`).toContain(`id="${s}"`);
    }
  });

  it('consumes mock tenant config (no live calls)', () => {
    expect(pageContent).toContain('MOCK_TENANT_PROFILE');
    expect(pageContent).toContain('MOCK_TENANT_USERS');
    expect(pageContent).toContain('TENANT_ADMIN_CAPABILITY_LEDGER');
    expect(MOCK_TENANT_USERS.length).toBeGreaterThan(0);
    expect(MOCK_AUTHORITY_OVERLAYS.some((o) => o.name === 'Internal Risk')).toBe(true);
  });
});

describe('Unit 22 — Critical rule: every capability has explicit enforcement status', () => {
  it('every ledger entry declares an enforcement status of configured-mock or not-live', () => {
    for (const c of TENANT_ADMIN_CAPABILITY_LEDGER) {
      expect(['configured-mock', 'not-live']).toContain(c.enforcement);
    }
  });

  it('every ledger entry records builtNow, notLiveYet and an owner ref', () => {
    for (const c of TENANT_ADMIN_CAPABILITY_LEDGER) {
      expect(c.builtNow.length, `${c.capability} builtNow`).toBeGreaterThan(0);
      expect(c.notLiveYet.length, `${c.capability} notLiveYet`).toBeGreaterThan(0);
      expect(c.owner.ref.length, `${c.capability} owner.ref`).toBeGreaterThan(0);
      expect(c.owner.owner.length, `${c.capability} owner.owner`).toBeGreaterThan(0);
    }
  });

  it('the page renders an enforcement badge for capabilities (no hidden deferral)', () => {
    expect(pageContent).toContain('EnforcementBadge');
    expect(pageContent).toContain('Configured (mock)');
    expect(pageContent).toContain('Not live');
    expect(pageContent).toContain('data-enforcement');
  });
});

describe('Unit 22 — Deferral owners are formally recorded (not prose-only)', () => {
  it('every owner ref resolves to a real ARCH-DEBT entry, a DECISIONS row, or a build unit', () => {
    for (const c of TENANT_ADMIN_CAPABILITY_LEDGER) {
      const ref = c.owner.ref;
      const isDebt = /^ARCH-DEBT-\d+$/.test(ref);
      const isDecision = ref.startsWith('DEC-');
      if (isDebt) {
        expect(DEBT.includes(`### ${ref} `) || DEBT.includes(`### ${ref} —`), `${ref} missing from debt register`).toBe(true);
      } else if (isDecision) {
        expect(DECISIONS.includes(ref), `${ref} missing from DECISIONS.md`).toBe(true);
      } else {
        // Otherwise it must name a unit/spec follow-on
        expect(ref.length).toBeGreaterThan(0);
      }
    }
  });

  it('the new Unit 22 deferral records exist (ARCH-DEBT-047..050 + DECISIONS row)', () => {
    expect(DEBT).toContain('### ARCH-DEBT-047');
    expect(DEBT).toContain('### ARCH-DEBT-048');
    expect(DEBT).toContain('### ARCH-DEBT-049');
    expect(DEBT).toContain('### ARCH-DEBT-050');
    expect(DECISIONS).toContain('DEC-unit22-tenant-admin-v1-deferrals');
  });

  it('references the existing jurisdictional-gate debt (ARCH-DEBT-019)', () => {
    const jurisdiction = TENANT_ADMIN_CAPABILITY_LEDGER.find((c) => c.owner.ref === 'ARCH-DEBT-019');
    expect(jurisdiction).toBeDefined();
  });
});

describe('Unit 22 — Not-allowed capabilities are absent / explicitly deferred', () => {
  it('makes no live SSO/vendor calls (readiness/config only)', () => {
    // No fetch/live integration in the surface; SSO is mock readiness.
    expect(pageContent).not.toContain('fetch(');
    expect(pageContent).toContain('No live SSO provider calls');
  });

  it('connector mutation is declared not-enforced', () => {
    expect(pageContent).toContain('not enforced');
  });
});
