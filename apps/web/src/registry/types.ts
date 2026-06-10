/**
 * Route Registry Types — Commander SDR
 *
 * Source authority:
 * - Spec #47 Application Route and Navigation Register
 * - Spec #56 Shell Reference vs Build Authority Doctrine
 * - docs/06_ui_build_reference/ROUTE_REGISTRY_BASELINE.md
 *
 * Three-application boundary:
 * - Operational App (app.commander-sdr.com)
 * - Tenant Admin (admin.commander-sdr.com)
 * - Commercial Control Plane (internal)
 */

/** Build status for registry-driven visibility */
export type BuildStatus = 'LIVE' | 'BUILD' | 'SCAFFOLD' | 'STUB' | 'PLANNED';

/** Application boundary per Commander doctrine */
export type AppBoundary = 'operational' | 'tenant-admin' | 'control-plane';

/** Target version for staged delivery */
export type TargetVersion = 'v1.1' | 'v1.2' | 'v1.3' | 'v1.4' | 'v1.5' | 'v1.6' | 'v2.0';

/** Workspace assignment per Master Technical Specification §8.1 */
export type Workspace =
  | 'executive-posture'
  | 'drift-operations'
  | 'control-architecture'
  | 'identity-asset-intelligence'
  | 'assurance-audit'
  | 'transformation-ma'
  | 'platform'
  | 'admin'
  | 'control-plane';

/** Route entry in the registry */
export interface RouteEntry {
  /** URL path pattern */
  path: string;
  /** Human-readable surface name */
  label: string;
  /** Application boundary this route belongs to */
  boundary: AppBoundary;
  /** Current build status — drives visibility in build mode */
  status: BuildStatus;
  /** Target product version for delivery */
  version: TargetVersion;
  /** Owning Kiro spec ID */
  owningSpec: string;
  /** Workspace(s) this route appears in */
  workspaces: Workspace[];
  /** RBAC roles required (empty = all authenticated users) */
  rbac: string[];
  /** Whether this route appears in the left navigation */
  showInNav: boolean;
  /** Parent route path for nested navigation */
  parentPath?: string;
  /** Icon identifier for navigation rendering */
  icon?: string;
  /** Sort order within its navigation group */
  sortOrder: number;
}

/** Navigation group for left sidebar */
export interface NavGroup {
  id: string;
  label: string;
  boundary: AppBoundary;
  sortOrder: number;
  routes: RouteEntry[];
}
