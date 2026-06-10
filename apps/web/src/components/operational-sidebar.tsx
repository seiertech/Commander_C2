'use client';

import { useState, useEffect } from 'react';
import { componentTokens } from '../../../../packages/ui/src/tokens/components';
import { primitiveBrand, primitiveFonts, primitiveTypeScale, primitiveLetterSpacing, primitiveMotion } from '../../../../packages/ui/src/tokens/primitives';
import { standardTokens } from '../../../../packages/ui/src/tokens/semantic';
import { useSidebarCollapsed } from '@/context/sidebar-context';
import { OPERATIONAL_NAV_GROUPS } from '@/registry/nav-groups';

/**
 * Operational App Sidebar — Commander SDR (DS-1.0)
 *
 * DS-1.0 §7: 248px expanded / 68px icon rail. Collapsible via hamburger.
 * - Item height 36px, padding 8px 12px, icon 20px
 * - Active item: gold-tinted background + gold left border
 * - Custom scrollbar (6px, subtle thumb)
 * - Hierarchical groups, expand/collapse persisted per user
 * - Icons required (Lucide). Labels in expanded; tooltips in rail (200ms delay)
 * - Chrome is navy gradient both modes
 * - Transition 180ms ease-out
 *
 * Source: DESIGN_SYSTEM.md §7
 */

const STORAGE_PREFIX = 'commander-sdr.sidebar.';
const DEFAULT_EXPANDED_GROUP = 'case-management';

export function OperationalSidebar() {
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();
  const [expansionState, setExpansionState] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    for (const group of OPERATIONAL_NAV_GROUPS) {
      state[group.id] = group.id === DEFAULT_EXPANDED_GROUP;
    }
    return state;
  });

  useEffect(() => {
    const stored: Record<string, boolean> = {};
    for (const group of OPERATIONAL_NAV_GROUPS) {
      const val = localStorage.getItem(`${STORAGE_PREFIX}${group.id}.expanded`);
      if (val !== null) stored[group.id] = val === 'true';
    }
    if (Object.keys(stored).length > 0) setExpansionState((prev) => ({ ...prev, ...stored }));
  }, []);

  function toggleGroup(groupId: string) {
    setExpansionState((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      localStorage.setItem(`${STORAGE_PREFIX}${groupId}.expanded`, String(next[groupId]));
      return next;
    });
  }

  const sidebarWidth = collapsed ? componentTokens.sidebarRail : componentTokens.sidebarWidth;

  return (
    <aside
      style={{
        position: 'fixed',
        top: componentTokens.topbarHeight,
        bottom: 0,
        left: 0,
        width: sidebarWidth,
        background: `linear-gradient(180deg, ${primitiveBrand.navy2}, var(--tblr-bg-surface-dark))`,
        borderRight: '1px solid rgba(255,255,255,0.10)',
        color: standardTokens.chrome.navText,
        display: 'flex',
        flexDirection: 'column',
        transition: `width ${primitiveMotion.standard} ${primitiveMotion.easeDefault}`,
        overflow: 'hidden',
      }}
      aria-label="Primary navigation"
    >
      {/* Hamburger toggle */}
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          height: componentTokens.itemHeight,
          width: '100%',
          border: 'none',
          background: 'transparent',
          color: standardTokens.chrome.navTextActive,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 12px',
          fontSize: '20px',
          fontFamily: primitiveFonts.body,
        }}
      >
        ☰
      </button>

      {/* Home link — visible in collapsed rail */}
      {collapsed && (
        <a
          href="/"
          aria-label="Command Centre (Home)"
          style={{
            height: componentTokens.itemHeight,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: standardTokens.chrome.navTextActive,
            textDecoration: 'none',
            fontSize: primitiveTypeScale.large,
          }}
        >
          ⌂
        </a>
      )}

      {/* Nav groups */}
      <div style={{ padding: collapsed ? '4px' : '12px', overflowY: 'auto', flex: 1 }} className="sidebar-scroll">
        {OPERATIONAL_NAV_GROUPS.map((group) => {
          const isExpanded = expansionState[group.id] ?? false;
          return (
            <div key={group.id} style={{ marginBottom: collapsed ? '4px' : '4px' }}>
              <button
                type="button"
                onClick={() => !collapsed && toggleGroup(group.id)}
                onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !collapsed) { e.preventDefault(); toggleGroup(group.id); } }}
                aria-expanded={collapsed ? undefined : isExpanded}
                title={collapsed ? group.label : undefined}
                style={{
                  width: '100%',
                  height: componentTokens.itemHeight,
                  border: 'none',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: collapsed ? '0 0 0 24px' : '8px 12px',
                  fontWeight: 700,
                  color: standardTokens.chrome.navText,
                  cursor: 'pointer',
                  fontFamily: primitiveFonts.body,
                  fontSize: primitiveTypeScale.caption,
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {!collapsed && (
                  <>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.label}</span>
                    {group.badge && (
                      <span style={{ fontSize: primitiveTypeScale.micro, letterSpacing: primitiveLetterSpacing.eyebrow, border: '1px solid rgba(255,255,255,0.24)', color: standardTokens.chrome.navTextActive, padding: '2px 4px' }}>{group.badge}</span>
                    )}
                    <span style={{ color: standardTokens.chrome.navTextActive, transition: `transform ${primitiveMotion.standard} ${primitiveMotion.easeDefault}`, transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block' }}>⌄</span>
                  </>
                )}
              </button>
              {!collapsed && isExpanded && (
                <div style={{ marginLeft: '12px', padding: '4px 0 4px 12px', borderLeft: '1px solid rgba(255,255,255,0.14)' }}>
                  {group.subItems.map((item) => (
                    <a
                      key={item.path}
                      href={item.path}
                      style={{
                        height: componentTokens.itemHeight,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 12px',
                        color: standardTokens.chrome.navText,
                        fontSize: primitiveTypeScale.caption,
                        textDecoration: 'none',
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
