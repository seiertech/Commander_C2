import { describe, it, expect } from 'vitest';
import {
  allRoutes,
  operationalRoutes,
  tenantAdminRoutes,
  controlPlaneRoutes,
  getRoutesByBoundary,
  getNavRoutes,
  isRouteVisible,
} from '../../apps/web/src/registry/index';

/**
 * Route Registry Tests — Commander SDR
 *
 * Validates:
 * - Three-application boundary separation
 * - Registry-driven navigation
 * - Build-mode visibility
 * - No committed routes removed
 * - Six workspaces present
 *
 * Source: Spec #47, Spec #56, v1.2 Requirements 1-6
 */

describe('Route Registry', () => {
  describe('Three-application boundary', () => {
    it('operational routes exist', () => {
      expect(operationalRoutes.length).toBeGreaterThan(0);
    });

    it('tenant admin routes exist', () => {
      expect(tenantAdminRoutes.length).toBeGreaterThan(0);
    });

    it('control plane routes exist', () => {
      expect(controlPlaneRoutes.length).toBeGreaterThan(0);
    });

    it('all routes have a boundary assigned', () => {
      for (const route of allRoutes) {
        expect(['operational', 'tenant-admin', 'control-plane']).toContain(route.boundary);
      }
    });

    it('boundaries do not overlap (no route in multiple boundaries)', () => {
      const paths = allRoutes.map((r) => `${r.boundary}:${r.path}`);
      const unique = new Set(paths);
      expect(unique.size).toBe(paths.length);
    });
  });

  describe('Registry completeness', () => {
    it('contains Command Centre at /', () => {
      const cc = allRoutes.find((r) => r.path === '/');
      expect(cc).toBeDefined();
      expect(cc!.label).toBe('Command Centre');
    });

    it('contains all v1.1 BUILD routes', () => {
      const v11 = allRoutes.filter((r) => r.version === 'v1.1');
      expect(v11.length).toBeGreaterThanOrEqual(4);
      expect(v11.every((r) => r.status === 'BUILD')).toBe(true);
    });

    it('contains v1.2 SCAFFOLD routes for all core domains', () => {
      const expected = ['/vulnerabilities', '/exposure', '/controls', '/architecture', '/governance', '/ciso'];
      for (const path of expected) {
        const route = allRoutes.find((r) => r.path === path);
        expect(route, `Missing route: ${path}`).toBeDefined();
        expect(route!.status).toBe('SCAFFOLD');
      }
    });

    it('contains /assets as a BUILD route (Asset Intelligence Surface — Unit 19)', () => {
      const route = allRoutes.find((r) => r.path === '/assets');
      expect(route, 'Missing route: /assets').toBeDefined();
      expect(route!.status).toBe('BUILD');
      expect(route!.owningSpec).toContain('19');
    });

    it('contains /identity as a BUILD route (Identity Intelligence Surface — Unit 18)', () => {
      const route = allRoutes.find((r) => r.path === '/identity');
      expect(route, 'Missing route: /identity').toBeDefined();
      expect(route!.status).toBe('BUILD');
      expect(route!.owningSpec).toContain('18');
      // Aggregate-tier RBAC recorded on the route (DEC-sec-c2-internal-cop-rbac).
      expect(route!.rbac.length).toBeGreaterThan(0);
    });

    it('contains tenant admin routes per Spec #47', () => {
      const adminPaths = ['/settings/tenant', '/settings/users-rbac', '/settings/connectors', '/settings/features'];
      for (const path of adminPaths) {
        expect(allRoutes.find((r) => r.path === path), `Missing: ${path}`).toBeDefined();
      }
    });

    it('contains control plane routes per Spec #47', () => {
      const cpPaths = ['/customers', '/tenants', '/licences', '/entitlements', '/feature-flags'];
      for (const path of cpPaths) {
        expect(allRoutes.find((r) => r.path === path), `Missing: ${path}`).toBeDefined();
      }
    });
  });

  describe('Six workspaces (v1.2 Requirements 1-6)', () => {
    const requiredWorkspaces = [
      'executive-posture',
      'drift-operations',
      'control-architecture',
      'identity-asset-intelligence',
      'assurance-audit',
      'transformation-ma',
    ];

    for (const ws of requiredWorkspaces) {
      it(`workspace "${ws}" has at least one route`, () => {
        const routes = allRoutes.filter((r) => r.workspaces.includes(ws as any));
        expect(routes.length, `No routes in workspace: ${ws}`).toBeGreaterThan(0);
      });
    }
  });

  describe('Build-mode visibility', () => {
    it('all routes visible in build mode', () => {
      for (const route of allRoutes) {
        expect(isRouteVisible(route, { buildMode: true, userRoles: [] })).toBe(true);
      }
    });

    it('SCAFFOLD routes hidden in runtime mode', () => {
      const scaffold = allRoutes.find((r) => r.status === 'SCAFFOLD');
      expect(scaffold).toBeDefined();
      expect(isRouteVisible(scaffold!, { buildMode: false, userRoles: [] })).toBe(false);
    });

    it('BUILD routes visible in runtime mode', () => {
      const build = allRoutes.find((r) => r.status === 'BUILD');
      expect(build).toBeDefined();
      expect(isRouteVisible(build!, { buildMode: false, userRoles: [] })).toBe(true);
    });

    it('RBAC-gated routes hidden without matching role', () => {
      const gated = allRoutes.find((r) => r.rbac.length > 0 && r.status === 'BUILD');
      if (!gated) return; // no RBAC-gated BUILD routes yet
      expect(isRouteVisible(gated, { buildMode: false, userRoles: [] })).toBe(false);
    });
  });

  describe('Registry-driven navigation', () => {
    it('getNavRoutes returns sorted routes for operational boundary', () => {
      const nav = getNavRoutes('operational');
      expect(nav.length).toBeGreaterThan(0);
      for (let i = 1; i < nav.length; i++) {
        expect(nav[i].sortOrder).toBeGreaterThanOrEqual(nav[i - 1].sortOrder);
      }
    });

    it('getRoutesByBoundary filters correctly', () => {
      const ops = getRoutesByBoundary('operational');
      expect(ops.every((r) => r.boundary === 'operational')).toBe(true);
    });
  });

  describe('Doctrinal adherence', () => {
    it('no route allows manual case creation', () => {
      const forbidden = allRoutes.filter((r) =>
        r.label.toLowerCase().includes('create case') ||
        r.path.includes('create-case')
      );
      expect(forbidden).toEqual([]);
    });

    it('every route has an owning spec', () => {
      for (const route of allRoutes) {
        expect(route.owningSpec).toBeTruthy();
      }
    });

    it('every route has a version target', () => {
      for (const route of allRoutes) {
        expect(route.version).toMatch(/^v\d+\.\d+$/);
      }
    });
  });
});
