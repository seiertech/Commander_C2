'use client';

/**
 * Sidebar — Commander C2 (DS-1.0 Tabler reskin)
 *
 * Tabler navbar-vertical combo layout pattern.
 * Always dark (data-bs-theme="dark" on <aside>).
 * Three-section layout: BrandBlock (top), ScrollableMenu (flex: 1), CollapseFooter (bottom).
 *
 * All data logic, collapse state, localStorage, and nav group structure unchanged.
 * This file contains visual/structural changes only.
 *
 * Source: shell-sidebar-header-rebuild spec tasks 6.1–6.5
 * Tabler reference: navbar-vertical combo layout
 */

import { useState, useEffect, Component, type ReactNode, type ErrorInfo } from 'react';
import { usePathname } from 'next/navigation';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { getIcon } from '../../../../../packages/ui/src/icons';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import { useSidebarCollapsed } from '@/context/sidebar-context';
import { OPERATIONAL_NAV_GROUPS } from '@/registry/nav-groups';

// ---------------------------------------------------------------------------
// Constants — unchanged
// ---------------------------------------------------------------------------

const STORAGE_PREFIX = 'commander-sdr.sidebar.';
const DEFAULT_EXPANDED_GROUP = 'case-management';

// ---------------------------------------------------------------------------
// Scoped CSS — injected once, covers all sidebar elements
// Keeps inline styles minimal; pseudo-elements and state variants live here.
// ---------------------------------------------------------------------------

const SIDEBAR_STYLES = `
  /* ── Reset Tabler's navbar-vertical border-radius ── */
  .navbar-vertical.commander-nav {
    border-radius: 0 !important;
  }

  /* ── Radix ScrollArea overrides — no horizontal overflow, always show vertical ── */
  .navbar-vertical.commander-nav [data-radix-scroll-area-viewport] {
    overflow-x: hidden !important;
  }

  .navbar-vertical.commander-nav [data-radix-scroll-area-scrollbar] {
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* ── Parent nav link — 40px row, icon 16px, label left, chevron far right ── */
  .navbar-vertical.commander-nav .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1.25rem;
    height: 40px;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--tblr-nav-link-color) !important;
    background: transparent !important;
    border: none;
    border-radius: 0 !important;
    white-space: nowrap;
    cursor: pointer;
    width: 100%;
    text-align: left;
    text-decoration: none;
    overflow: hidden;
    position: relative;
    transition: background 120ms ease, color 120ms ease;
  }

  .navbar-vertical.commander-nav .nav-link:hover {
    color: var(--tblr-light) !important;
    background: rgba(255,255,255,0.05) !important;
  }

  /* Active parent — blue accent treatment */
  .navbar-vertical.commander-nav .nav-link.active {
    color: var(--tblr-light) !important;
    background: rgba(74,144,217,0.08) !important;
  }

  .navbar-vertical.commander-nav .nav-link.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #4a90d9;
  }

  /* Parent with active child — subtle active state */
  .navbar-vertical.commander-nav .nav-link.parent-active {
    color: var(--tblr-light) !important;
    background: rgba(74,144,217,0.04) !important;
  }

  .navbar-vertical.commander-nav .nav-link.parent-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(74,144,217,0.6);
  }

  /* ── Child (nested) nav links — 34px, stronger indentation, improved tree rail ── */
  .navbar-vertical.commander-nav .nav-item-nested .nav-link {
    height: 34px;
    font-size: 0.75rem;
    font-weight: 400;
    padding: 0 1.25rem 0 3.5rem;
    color: var(--tblr-secondary-color) !important;
    background: transparent !important;
    position: relative;
    text-align: left;
    justify-content: flex-start;
    transition: background 120ms ease, color 120ms ease;
  }

  /* Tree rail — stronger, wider vertical line */
  .navbar-vertical.commander-nav .nav-item-nested .nav-link::before {
    content: '';
    position: absolute;
    left: 1.75rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(255,255,255,0.16);
    opacity: 1;
  }

  .navbar-vertical.commander-nav .nav-item-nested .nav-link:hover {
    color: var(--tblr-light) !important;
    background: rgba(255,255,255,0.03) !important;
  }

  /* Active child — strong blue accent, immediately obvious */
  .navbar-vertical.commander-nav .nav-item-nested .nav-link.active {
    color: var(--tblr-light) !important;
    background: rgba(74,144,217,0.06) !important;
  }

  .navbar-vertical.commander-nav .nav-item-nested .nav-link.active::before {
    width: 2px;
    background: #4a90d9;
    opacity: 1;
  }

  /* ── Nav link icon — 16px ── */
  .navbar-vertical.commander-nav .nav-link-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    opacity: 0.70;
  }

  .navbar-vertical.commander-nav .nav-link-icon svg {
    width: 16px !important;
    height: 16px !important;
  }

  .navbar-vertical.commander-nav .nav-link:hover .nav-link-icon,
  .navbar-vertical.commander-nav .nav-link.active .nav-link-icon {
    opacity: 1;
  }

  /* ── Nav link title — truncates cleanly ── */
  .navbar-vertical.commander-nav .nav-link-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Build status badge — compact, before chevron, optimized positioning ── */
  .navbar-vertical.commander-nav .nav-badge {
    flex-shrink: 0;
    font-size: 0.5rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--tblr-secondary-color);
    border: 1px solid var(--tblr-border-color);
    padding: 0 4px;
    line-height: 1.5;
    background: transparent;
    border-radius: 0;
    margin-right: 0.375rem;
    margin-left: auto;
  }

  /* ── Chevron — optimized alignment and smooth transitions ── */
  .navbar-vertical.commander-nav .nav-link-toggle {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    opacity: 0.4;
    transition: transform 180ms ease-out, opacity 150ms ease;
  }

  .navbar-vertical.commander-nav .nav-link-toggle svg {
    width: 10px !important;
    height: 10px !important;
  }

  .navbar-vertical.commander-nav .nav-link:hover .nav-link-toggle,
  .navbar-vertical.commander-nav .nav-link.active .nav-link-toggle {
    opacity: 0.7;
  }

  /* ── Footer border ── */
  .navbar-vertical.commander-nav .navbar-footer {
    border-top: 1px solid var(--tblr-border-color);
    padding: 0;
    width: 100%;
    flex-shrink: 0;
  }

  /* ── Brand block (expanded) ── */
  .navbar-vertical.commander-nav .navbar-brand {
    flex-shrink: 0;
    padding: 1.25rem 1.25rem 1.125rem;
    border-bottom: 1px solid var(--tblr-border-color);
    min-height: 72px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .navbar-vertical.commander-nav .navbar-brand-text {
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
    font-weight: 700;
    font-size: 1.0625rem;
    letter-spacing: 0.07em;
    line-height: 1.2;
    white-space: nowrap;
  }

  .navbar-vertical.commander-nav .brand-commander { color: #ffd21f; }
  .navbar-vertical.commander-nav .brand-sdr { color: var(--tblr-light); }

  .navbar-vertical.commander-nav .navbar-brand-sub {
    font-size: 0.6875rem;
    font-weight: 400;
    color: var(--tblr-secondary-color);
    margin-top: 4px;
    line-height: 1;
    white-space: nowrap;
  }

  /* ── Brand block (collapsed) ── */
  .navbar-vertical.commander-nav .navbar-brand-icon {
    flex-shrink: 0;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--tblr-border-color);
    text-decoration: none;
    color: var(--tblr-nav-link-color);
    transition: color 150ms ease;
  }

  .navbar-vertical.commander-nav .navbar-brand-icon:hover {
    color: var(--tblr-light);
    background: rgba(255,255,255,0.06);
  }

  .navbar-vertical.commander-nav .navbar-brand-icon svg {
    width: 20px !important;
    height: 20px !important;
  }

  /* ── Collapsed icon rail — enhanced hover states ── */
  .navbar-vertical.commander-nav .nav-icon-rail {
    width: 100%;
    height: 40px;
    min-height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--tblr-secondary-color);
    cursor: pointer;
    position: relative;
    transition: background 150ms ease, color 150ms ease;
    border-radius: 0;
  }

  .navbar-vertical.commander-nav .nav-icon-rail:hover {
    color: var(--tblr-light);
    background: rgba(255,255,255,0.06);
  }

  .navbar-vertical.commander-nav .nav-icon-rail:active {
    background: rgba(255,255,255,0.08);
  }

  .navbar-vertical.commander-nav .nav-icon-rail svg {
    width: 20px !important;
    height: 20px !important;
    transition: transform 120ms ease;
  }

  .navbar-vertical.commander-nav .nav-icon-rail:hover svg {
    transform: scale(1.05);
  }

  /* ── CSS tooltip on collapsed rail items ── */
  .navbar-vertical.commander-nav .nav-icon-rail::after {
    content: attr(data-tooltip);
    position: absolute;
    left: calc(100% + 12px);
    top: 50%;
    transform: translateY(-50%);
    background: var(--tblr-bg-surface-dark);
    color: var(--tblr-nav-link-color);
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    padding: 6px 10px;
    border: 1px solid var(--tblr-border-color);
    pointer-events: none;
    opacity: 0;
    transition: opacity 120ms ease;
    z-index: 200;
  }

  .navbar-vertical.commander-nav .nav-icon-rail:hover::after {
    opacity: 1;
  }

  /* ── Collapsed footer button — enhanced interactions ── */
  .navbar-vertical.commander-nav .nav-link-collapse {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--tblr-secondary-color);
    transition: color 150ms ease, background 150ms ease, transform 120ms ease;
    border-radius: 0;
  }

  .navbar-vertical.commander-nav .nav-link-collapse:hover {
    color: var(--tblr-nav-link-color);
    background: rgba(255,255,255,0.05);
    transform: translateY(-1px);
  }

  .navbar-vertical.commander-nav .nav-link-collapse:active {
    transform: translateY(0);
  }

  .navbar-vertical.commander-nav .nav-link-collapse svg {
    width: 14px !important;
    height: 14px !important;
    transition: transform 150ms ease;
  }

  .navbar-vertical.commander-nav .nav-link-collapse:hover svg {
    transform: scale(1.1);
  }
`;

// ---------------------------------------------------------------------------
// Error boundary for BrandBlock — unchanged
// ---------------------------------------------------------------------------

interface BrandErrorBoundaryState { hasError: boolean }

class BrandErrorBoundary extends Component<{ children: ReactNode }, BrandErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): BrandErrorBoundaryState { return { hasError: true }; }
  componentDidCatch(_e: Error, _i: ErrorInfo) {}
  render() { return this.state.hasError ? null : this.props.children; }
}

// ---------------------------------------------------------------------------
// BrandBlock
// Issues 3 & 4: two-line layout, no clipping, correct padding
// ---------------------------------------------------------------------------

function BrandBlock({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <BrandErrorBoundary>
        {/* Issue 2: LayoutDashboard icon, links to Command Centre */}
        <a href="/" className="navbar-brand-icon" aria-label="Command Centre">
          {getIcon('command-centre', { size: 'nav', 'aria-hidden': true })}
        </a>
      </BrandErrorBoundary>
    );
  }

  return (
    <div className="navbar-brand">
      {/* Line 1: COMMANDER (gold) C2 (white) */}
      <div className="navbar-brand-text">
        <span className="brand-commander">COMMANDER</span>
        <span className="brand-sdr">C2</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NavGroupRow — Radix Collapsible for accessible expand/collapse
// shadcn/Radix: Tabler lacks accessible collapsible tree with keyboard nav
// ---------------------------------------------------------------------------

interface NavGroupRowProps {
  group: (typeof OPERATIONAL_NAV_GROUPS)[number];
  isExpanded: boolean;
  isActive: boolean;
  hasActiveChild: boolean;
  activeItemPath: string | null;
  onToggle: () => void;
  pathname: string;
}

function NavGroupRow({ group, isExpanded, isActive, hasActiveChild, activeItemPath, onToggle }: NavGroupRowProps) {
  // Determine the appropriate CSS class for the parent
  let navLinkClass = 'nav-link';
  if (isActive && !hasActiveChild) {
    // Parent is directly active (no specific child active)
    navLinkClass += ' active';
  } else if (hasActiveChild) {
    // Parent has an active child - use subtle parent-active state
    navLinkClass += ' parent-active';
  }

  return (
    <li className="nav-item">
      <Collapsible.Root open={isExpanded} onOpenChange={() => onToggle()}>
        {/* Group header — trigger */}
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className={navLinkClass}
            aria-expanded={isExpanded}
          >
            {/* Icon */}
            <span className="nav-link-icon">
              {getIcon(group.id, { size: 'nav', 'aria-hidden': true })}
            </span>

            {/* Label */}
            <span className="nav-link-title">{group.label}</span>

            {/* Build status badge — compact, before chevron */}
            {group.badge && (
              <span className="nav-badge">{group.badge}</span>
            )}

            {/* Chevron — far right */}
            <span
              className="nav-link-toggle"
              style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              {getIcon('collapse-footer', { size: 'nav', 'aria-hidden': true })}
            </span>
          </button>
        </Collapsible.Trigger>

        {/* Sub-items — collapsible content */}
        <Collapsible.Content>
          <ul style={{ 
            listStyle: 'none', 
            margin: '0.375rem 0 0 0', 
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.125rem',
          }}>
            {group.subItems.map((item) => {
              const itemActive = activeItemPath === item.path;
              return (
                <li key={item.path} className="nav-item nav-item-nested">
                  <a
                    href={item.path}
                    className={`nav-link${itemActive ? ' active' : ''}`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </Collapsible.Content>
      </Collapsible.Root>
    </li>
  );
}

// ---------------------------------------------------------------------------
// ScrollableMenu — Radix ScrollArea for accessible vertical scrolling
// shadcn/Radix: Tabler lacks accessible scroll area with custom scrollbar
// ---------------------------------------------------------------------------

function ScrollableMenu({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const safePath = pathname ?? '/';

  const [expansionState, setExpansionState] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    for (const group of OPERATIONAL_NAV_GROUPS) {
      state[group.id] = group.id === DEFAULT_EXPANDED_GROUP;
    }
    return state;
  });

  useEffect(() => {
    const stored: Record<string, boolean> = {};
    try {
      for (const group of OPERATIONAL_NAV_GROUPS) {
        const val = localStorage.getItem(`${STORAGE_PREFIX}${group.id}.expanded`);
        if (val !== null) stored[group.id] = val === 'true';
      }
    } catch { /* localStorage unavailable */ }
    if (Object.keys(stored).length > 0) {
      setExpansionState((prev) => ({ ...prev, ...stored }));
    }
  }, []);

  function toggleGroup(groupId: string) {
    setExpansionState((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${groupId}.expanded`, String(next[groupId]));
      } catch { /* localStorage unavailable */ }
      return next;
    });
  }

  function getActiveItemPath(): string | null {
    // Find the most specific match for current path
    let bestMatch = null;
    let bestMatchLength = 0;
    
    for (const group of OPERATIONAL_NAV_GROUPS) {
      for (const item of group.subItems) {
        // Exact match takes priority
        if (safePath === item.path) return item.path;
        
        // For sub-paths, find the longest matching prefix
        if (safePath.startsWith(item.path + '/')) {
          if (item.path.length > bestMatchLength) {
            bestMatch = item.path;
            bestMatchLength = item.path.length;
          }
        }
      }
    }
    return bestMatch;
  }

  function isGroupActive(group: (typeof OPERATIONAL_NAV_GROUPS)[number]): boolean {
    // Group is active if current path matches any child item exactly or starts with child path
    return group.subItems.some((item) => {
      return safePath === item.path || safePath.startsWith(item.path + '/');
    });
  }

  function hasActiveChild(group: (typeof OPERATIONAL_NAV_GROUPS)[number]): boolean {
    // Check if any child item is specifically active
    return group.subItems.some((item) => activeItemPath === item.path);
  }

  const activeItemPath = getActiveItemPath();

  // Collapsed — icon rail only
  if (collapsed) {
    return (
      <ScrollArea.Root style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollArea.Viewport
          className="navbar-nav"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            gap: '0.25rem',
          }}>
          {OPERATIONAL_NAV_GROUPS.map((group) => (
            <div
              key={group.id}
              className="nav-icon-rail"
              data-tooltip={group.label}
              role="button"
              tabIndex={0}
              aria-label={group.label}
              onClick={() => toggleGroup(group.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup(group.id); }
              }}
            >
              {getIcon(group.id, { size: 'nav', 'aria-hidden': true })}
            </div>
          ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          style={{
            width: 4,
            padding: 0,
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          <ScrollArea.Thumb
            style={{
              background: 'var(--tblr-border-color)',
              borderRadius: 0,
            }}
          />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    );
  }

  // Expanded — full nav list with Radix ScrollArea
  return (
    <ScrollArea.Root style={{ flex: 1, overflow: 'hidden' }}>
      <ScrollArea.Viewport
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <ul
          className="navbar-nav"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '0.75rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {OPERATIONAL_NAV_GROUPS.map((group) => (
            <NavGroupRow
              key={group.id}
              group={group}
              isExpanded={expansionState[group.id] ?? false}
              isActive={isGroupActive(group)}
              hasActiveChild={hasActiveChild(group)}
              activeItemPath={activeItemPath}
              onToggle={() => toggleGroup(group.id)}
              pathname={safePath}
            />
          ))}
        </ul>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="vertical"
        style={{
          width: 6,
          padding: 0,
          background: 'rgba(255,255,255,0.06)',
        }}
      >
        <ScrollArea.Thumb
          style={{
            background: 'rgba(255,255,255,0.28)',
            borderRadius: 0,
          }}
        />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

// ---------------------------------------------------------------------------
// CollapseFooter — Issue 5: no clipping, chevron-left expanded / chevron-right collapsed
// ---------------------------------------------------------------------------

function CollapseFooter({
  collapsed,
  toggleCollapsed,
}: {
  collapsed: boolean;
  toggleCollapsed: () => void;
}) {
  if (collapsed) {
    // Collapsed: centred chevron-right (rotate 180° of ChevronLeft = points right)
    return (
      <div className="navbar-footer">
        <button
          type="button"
          className="nav-link-collapse"
          onClick={toggleCollapsed}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCollapsed(); }
          }}
          aria-label="Expand sidebar"
        >
          <span style={{ display: 'flex', alignItems: 'center', transform: 'rotate(180deg)' }}>
            {getIcon('collapse-footer', { size: 'nav', 'aria-hidden': true })}
          </span>
        </button>
      </div>
    );
  }

  // Expanded: chevron-left icon + "Collapse" label
  return (
    <div className="navbar-footer">
      <button
        type="button"
        className="nav-link"
        onClick={toggleCollapsed}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCollapsed(); }
        }}
        aria-label="Collapse sidebar"
        style={{ justifyContent: 'flex-start' }}
      >
        <span className="nav-link-icon">
          {getIcon('collapse-footer', { size: 'nav', 'aria-hidden': true })}
        </span>
        <span className="nav-link-title">Collapse</span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar root
// ---------------------------------------------------------------------------

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();

  const sidebarWidth = collapsed ? componentTokens.sidebarRail : componentTokens.sidebarWidth;

  return (
    <>
      {/* Scoped sidebar styles — injected once at root */}
      <style>{SIDEBAR_STYLES}</style>

      <aside
        className="commander-nav navbar navbar-vertical navbar-expand-lg"
        data-bs-theme="dark"
        aria-label="Primary navigation"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: sidebarWidth,
          background: 'var(--tblr-bg-surface-dark)',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overflowY: 'hidden',
          transition: 'width 180ms ease-out',
          zIndex: 100,
          borderRight: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 0,
        }}
      >
        <BrandBlock collapsed={collapsed} />
        <ScrollableMenu collapsed={collapsed} />
        <CollapseFooter collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
      </aside>
    </>
  );
}
