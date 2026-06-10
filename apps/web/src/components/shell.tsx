'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { useSidebarCollapsed } from '@/context/sidebar-context';
import { componentTokens } from '../../../../packages/ui/src/tokens/components';
import { primitiveMotion } from '../../../../packages/ui/src/tokens/primitives';

/**
 * Operational App Shell — Commander C2 (DS-1.0)
 *
 * DS-1.0 §5 Global Layout — three-zone CSS fixed positioning:
 * - Sidebar: fixed, full viewport height, left edge (self-positioned by <Sidebar />)
 * - Header:  fixed, top-right, offset left by sidebarWidth
 * - Workspace: fixed, below header, offset left by sidebarWidth, overflow-y: auto
 *
 * Shell chrome is ALWAYS navy/dark regardless of workspace mode (DS-1.0 §3).
 * Shell only reads useSidebarCollapsed() — no useMode() or tokens needed here.
 *
 * Source: DESIGN_SYSTEM.md §5, §3; shell-sidebar-header-rebuild spec tasks 5.1, 5.2
 */

/**
 * parsePx — Task 5.2
 *
 * Parses a CSS pixel string (e.g. '264px') to a number (264).
 * Returns 0 for any non-numeric or non-positive result.
 */
export function parsePx(value: string): number {
  const trimmed = value.trim();
  // Accept strings like '264px', '72px', '56px'
  const match = trimmed.match(/^(\d+(?:\.\d+)?)px$/);
  if (!match) return 0;
  const n = parseFloat(match[1]);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Safe fallback sidebar width in pixels (used when token resolves to non-positive/NaN) */
const FALLBACK_SIDEBAR_PX = 264;

export function Shell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarCollapsed();

  // Resolve raw token strings
  const rawWidth = collapsed ? componentTokens.sidebarRail : componentTokens.sidebarWidth;

  // Task 5.2 — parse and apply fallback if non-positive or NaN
  const parsedWidth = parsePx(rawWidth);
  const sidebarPx = parsedWidth > 0 ? parsedWidth : FALLBACK_SIDEBAR_PX;
  const sidebarWidth = `${sidebarPx}px`;

  // Transition applies to left offsets on Header and Workspace
  const transition = `left ${primitiveMotion.standard} ${primitiveMotion.easeDefault}`;

  return (
    <>
      {/* Sidebar handles its own fixed positioning (top: 0, bottom: 0, left: 0) */}
      <Sidebar />

      {/* Header — fixed, top-right, offset by sidebar width */}
      <Header
        style={{
          position: 'fixed',
          top: 0,
          left: sidebarWidth,
          right: 0,
          height: componentTokens.topbarHeight,
          transition,
        }}
      />

      {/* Workspace — fixed, below header, offset by sidebar width */}
      <main
        style={{
          position: 'fixed',
          top: componentTokens.topbarHeight,
          left: sidebarWidth,
          right: 0,
          bottom: 0,
          overflowY: 'auto',
          // stable gutter so the content width matches the header (which also
          // reserves a stable gutter) — keeps nav aligned with breadcrumb
          scrollbarGutter: 'stable',
          transition,
        }}
      >
        {children}
      </main>
    </>
  );
}
