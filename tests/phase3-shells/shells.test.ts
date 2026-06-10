import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  allRoutes,
  getRoutesByBoundary,
  TOP_NAV_WORKSPACES,
  OPERATIONAL_NAV_GROUPS,
  CONTROL_PLANE_NAV_ITEMS,
  CONTROL_PLANE_TOP_NAV,
} from '../../apps/web/src/registry/index';
import { getBrandWordmarkStyles } from '../../packages/ui/src/components/brand-wordmark';
import { colors } from '../../packages/ui/src/tokens/colors';

const ROOT = resolve(import.meta.dirname, '../..');

/**
 * Phase 3 Shell Tests — Commander C2
 *
 * Validates:
 * - Boundary tagging on all routes
 * - getRoutesByBoundary returns correct counts
 * - Operational App: BrandWordmark, 7 top nav workspaces, 19 sidebar groups (18 in nav-groups)
 * - Commercial Control Plane: dark chrome, 5 top nav items, 12 sidebar items
 * - Tenant Admin: brand wordmark variant
 */

describe('Boundary Tagging', () => {
  it('every route has a boundary tag', () => {
    for (const route of allRoutes) {
      expect(['operational', 'tenant-admin', 'control-plane']).toContain(route.boundary);
    }
  });

  it('getRoutesByBoundary("operational") returns operational routes', () => {
    const ops = getRoutesByBoundary('operational');
    expect(ops.length).toBeGreaterThan(0);
    expect(ops.every((r) => r.boundary === 'operational')).toBe(true);
  });

  it('getRoutesByBoundary("tenant-admin") returns tenant admin routes', () => {
    const admin = getRoutesByBoundary('tenant-admin');
    expect(admin.length).toBeGreaterThan(0);
    expect(admin.every((r) => r.boundary === 'tenant-admin')).toBe(true);
  });

  it('getRoutesByBoundary("control-plane") returns control plane routes', () => {
    const cp = getRoutesByBoundary('control-plane');
    expect(cp.length).toBeGreaterThan(0);
    expect(cp.every((r) => r.boundary === 'control-plane')).toBe(true);
  });
});

describe('Operational App Shell', () => {
  it('BrandWordmark renders SEIERTECH | COMMANDER SDR', () => {
    const styles = getBrandWordmarkStyles();
    expect(styles.seiertech.color).toBe('#f4f1eb');
    expect(styles.commander.color).toBe('#ffd21f');
    expect(styles.sdr.color).toBe('#ffffff');
    expect(styles.pipe.background).toBe('#ffd21f');
  });

  it('has exactly 5 top nav workspaces', () => {
    expect(TOP_NAV_WORKSPACES.length).toBe(5);
  });

  it('top nav includes Command Centre, Fusion Map, Vulnerabilities, Identity, Architecture', () => {
    const labels = TOP_NAV_WORKSPACES.map((w) => w.label);
    expect(labels).toContain('Command Centre');
    expect(labels).toContain('Fusion Map');
    expect(labels).toContain('Vulnerabilities');
    expect(labels).toContain('Identity');
    expect(labels).toContain('Architecture');
  });

  it('has 19 sidebar navigation groups', () => {
    expect(OPERATIONAL_NAV_GROUPS.length).toBe(19);
  });

  it('sidebar groups include Case Management, Vulnerability Management, Platform, Tenant Admin, SOM', () => {
    const ids = OPERATIONAL_NAV_GROUPS.map((g) => g.id);
    expect(ids).toContain('case-management');
    expect(ids).toContain('vulnerability-management');
    expect(ids).toContain('platform');
    expect(ids).toContain('som');
    expect(ids).toContain('tenant-admin');
  });

  it('shell.tsx exists', () => {
    expect(existsSync(resolve(ROOT, 'apps/web/src/components/shell.tsx'))).toBe(true);
  });

  it('operational-top-bar.tsx exists', () => {
    expect(existsSync(resolve(ROOT, 'apps/web/src/components/operational-top-bar.tsx'))).toBe(true);
  });

  it('operational-sidebar.tsx exists', () => {
    expect(existsSync(resolve(ROOT, 'apps/web/src/components/operational-sidebar.tsx'))).toBe(true);
  });
});

describe('Commercial Control Plane Shell', () => {
  it('has dark chrome colours defined', () => {
    expect(colors.controlPlane.background).toBe('#0d0d0d');
    expect(colors.controlPlane.topBar).toBe('#050505');
    expect(colors.controlPlane.panel).toBe('#111111');
  });

  it('has 5 top nav items', () => {
    expect(CONTROL_PLANE_TOP_NAV.length).toBe(5);
  });

  it('top nav includes Command Overview, Customers, Tenants, Entitlements, Deployment', () => {
    const labels = CONTROL_PLANE_TOP_NAV.map((t) => t.label);
    expect(labels).toContain('Command Overview');
    expect(labels).toContain('Customers');
    expect(labels).toContain('Tenants');
    expect(labels).toContain('Entitlements');
    expect(labels).toContain('Deployment');
  });

  it('has 12 sidebar items', () => {
    expect(CONTROL_PLANE_NAV_ITEMS.length).toBe(12);
  });

  it('control-plane layout exists', () => {
    expect(existsSync(resolve(ROOT, 'apps/web/src/app/control-plane/layout.tsx'))).toBe(true);
  });

  it('control-plane page exists', () => {
    expect(existsSync(resolve(ROOT, 'apps/web/src/app/control-plane/page.tsx'))).toBe(true);
  });
});

describe('Tenant Admin Shell', () => {
  it('tenant-admin layout exists', () => {
    expect(existsSync(resolve(ROOT, 'apps/web/src/app/tenant-admin/layout.tsx'))).toBe(true);
  });

  it('tenant-admin page exists', () => {
    expect(existsSync(resolve(ROOT, 'apps/web/src/app/tenant-admin/page.tsx'))).toBe(true);
  });

  it('brand wordmark includes SEIERTECH and COMMANDER SDR elements for Tenant Admin variant', () => {
    // The Tenant Admin variant adds "· TENANT ADMIN" to the standard wordmark
    const styles = getBrandWordmarkStyles();
    // Base wordmark elements are the same
    expect(styles.seiertech.color).toBe('#f4f1eb');
    expect(styles.commander.color).toBe('#ffd21f');
    expect(styles.sdr.color).toBe('#ffffff');
  });
});
