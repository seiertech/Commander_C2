/**
 * Route Registry — Commander C2
 *
 * Central export for the registry-driven runtime.
 * All navigation, menus, and route visibility derive from this registry.
 *
 * Per Spec #56: No route may be removed because a shell omits it.
 * Per Spec #47: Three-application boundary is maintained.
 */

export type { RouteEntry, NavGroup, BuildStatus, AppBoundary, TargetVersion, Workspace } from './types';
export { operationalRoutes } from './routes';
export { tenantAdminRoutes } from './tenant-admin-routes';
export { controlPlaneRoutes } from './control-plane-routes';
export {
  TOP_NAV_WORKSPACES,
  OPERATIONAL_NAV_GROUPS,
  TENANT_ADMIN_NAV_ITEMS,
  CONTROL_PLANE_NAV_ITEMS,
  CONTROL_PLANE_TOP_NAV,
} from './nav-groups';
export type { NavGroup as SidebarNavGroup, NavSubItem } from './nav-groups';

import { operationalRoutes } from './routes';
import { tenantAdminRoutes } from './tenant-admin-routes';
import { controlPlaneRoutes } from './control-plane-routes';
import type { RouteEntry, AppBoundary, BuildStatus } from './types';

/** All routes across all application boundaries */
export const allRoutes: RouteEntry[] = [
  ...operationalRoutes,
  ...tenantAdminRoutes,
  ...controlPlaneRoutes,
];

/** Get routes filtered by application boundary */
export function getRoutesByBoundary(boundary: AppBoundary): RouteEntry[] {
  return allRoutes.filter((r) => r.boundary === boundary);
}

/** Get navigable routes (showInNav: true) for a boundary */
export function getNavRoutes(boundary: AppBoundary): RouteEntry[] {
  return allRoutes
    .filter((r) => r.boundary === boundary && r.showInNav)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Get routes by build status — useful for build-mode visibility */
export function getRoutesByStatus(status: BuildStatus): RouteEntry[] {
  return allRoutes.filter((r) => r.status === status);
}

/**
 * Check if a route should be visible at runtime.
 * In build mode: all routes visible with status badges.
 * In runtime mode: only LIVE and BUILD routes visible, filtered by RBAC.
 */
export function isRouteVisible(
  route: RouteEntry,
  options: { buildMode: boolean; userRoles: string[] },
): boolean {
  // Build mode shows everything
  if (options.buildMode) return true;

  // Runtime mode: only LIVE and BUILD routes
  if (route.status !== 'LIVE' && route.status !== 'BUILD') return false;

  // RBAC check: empty rbac means all authenticated users
  if (route.rbac.length === 0) return true;

  return route.rbac.some((role) => options.userRoles.includes(role));
}
