/**
 * Commander SDR — Icon_Map Module
 *
 * Single source of truth for all Lucide icon assignments.
 * Shell, Sidebar and Header import icons exclusively from here.
 * No direct `lucide-react` imports are permitted in those components.
 *
 * Source: .kiro/specs/shell-sidebar-header-rebuild/design.md §Icon_Map
 */

import React from 'react';
import {
  Activity,
  Bell,
  Blocks,
  Building,
  ChevronLeft,
  Circle,
  FileText,
  FolderKanban,
  Globe,
  LayoutDashboard,
  Moon,
  Network,
  Radar,
  Scale,
  ScanSearch,
  Search,
  Server,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  UsersRound,
  Waypoints,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Semantic size category for icons. */
export type IconSize = 'nav' | 'utility' | 'inline';

/** Props accepted by the getIcon() accessor. */
export interface IconProps {
  size?: IconSize;
  className?: string;
  'aria-hidden'?: boolean;
}

// ---------------------------------------------------------------------------
// Icon Map
// ---------------------------------------------------------------------------

/**
 * Central registry mapping icon keys to Lucide component types.
 * Icons will be registered in tasks 4.2 and 4.3.
 * Defined as `const` so ICON_MAP_KEYS can be derived from it.
 */
export const ICON_MAP = {
  // ── Operational navigation modules (Task 4.2) ──────────────────────────
  'command-centre': LayoutDashboard,
  'case-management': FolderKanban,
  'mission-control': Radar,
  'fusion-map': Network,
  'vulnerability-management': ShieldAlert,
  'exposure-management': ScanSearch,
  'identity-access': Users,
  'architecture': Blocks,
  'assets': Server,
  'controls': ShieldCheck,
  'coverage': Radar,
  'tool-health': Activity,
  'team-pulse': UsersRound,
  'domain-pulse': Globe,
  'system-pulse': Activity,
  // Additional modules
  'platform': Settings,
  'tenant-admin': Building,
  'governance': Scale,
  'reporting': FileText,
  'som': Waypoints,
  // ── Header utility icons (Task 4.3) ────────────────────────────────────
  'search': Search,
  'theme-light': Sun,
  'theme-dark': Moon,
  'notification-bell': Bell,
  'commander-ai': Sparkles,
  'collapse-footer': ChevronLeft,
} as const satisfies Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
>;

/** All registered icon keys — derived from ICON_MAP. */
export const ICON_MAP_KEYS: ReadonlyArray<keyof typeof ICON_MAP> = Object.keys(
  ICON_MAP,
) as Array<keyof typeof ICON_MAP>;

// ---------------------------------------------------------------------------
// Size resolution
// ---------------------------------------------------------------------------

/**
 * Resolves an IconSize value to a pixel dimension.
 * - 'nav' and 'utility' → 20
 * - 'inline'            → 16
 * - undefined (default) → 20
 */
function resolveSize(size?: IconSize): number {
  if (size === 'inline') return 16;
  return 20;
}

// ---------------------------------------------------------------------------
// Accessor
// ---------------------------------------------------------------------------

/**
 * Returns a React element for the requested icon key.
 *
 * Default render attributes applied to every element:
 *   fill="none"  stroke="currentColor"  strokeWidth={1.75}
 *
 * Size is resolved from the `size` prop (nav/utility → 20px, inline → 16px).
 * `className` and `aria-hidden` are forwarded when provided.
 *
 * If `key` is not present in ICON_MAP, returns a Lucide <Circle /> fallback
 * rather than throwing or returning null/undefined.
 */
export function getIcon(key: string, props?: IconProps): React.ReactElement {
  const px = resolveSize(props?.size);

  const svgProps: React.SVGProps<SVGSVGElement> = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    width: px,
    height: px,
    ...(props?.className !== undefined ? { className: props.className } : {}),
    ...(props?.['aria-hidden'] !== undefined
      ? { 'aria-hidden': props['aria-hidden'] }
      : {}),
  };

  const IconComponent =
    key in ICON_MAP
      ? (ICON_MAP as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[key]
      : Circle;

  return React.createElement(IconComponent, svgProps);
}
