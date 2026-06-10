// @ts-nocheck
'use client';

/**
 * Commander C2 — Header Component (DS-1.0 Tabler reskin)
 *
 * Tabler navbar navbar-expand-md pattern.
 * Header background follows mode: white in standard, dark in mission.
 * data-bs-theme is set on the <header> element to match current mode.
 *
 * All sub-components (TopNav, Search, CommanderAI, ThemeToggle, Bell, User)
 * are unchanged in logic — only structural markup uses Tabler classes.
 *
 * Source: shell-sidebar-header-rebuild spec tasks 8.1–8.7
 * Tabler reference: navbar combo layout header
 */

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useMode } from '@/context/mode-context';
import { getSemanticTokens, type WorkspaceMode } from '../../../../../packages/ui/src/tokens/semantic';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import {
  primitiveSpacing,
  primitiveTypeScale,
} from '../../../../../packages/ui/src/tokens/primitives';
import { getIcon } from '../../../../../packages/ui/src/icons';
import { TOP_NAV_WORKSPACES } from '@/registry/nav-groups';

// ---------------------------------------------------------------------------
// Header props
// ---------------------------------------------------------------------------

interface HeaderProps {
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// NotificationService — unchanged
// ---------------------------------------------------------------------------

interface NotificationService {
  getUnreadCount(): Promise<number>;
  subscribe(callback: (count: number) => void): () => void;
}

const mockNotificationService: NotificationService = {
  getUnreadCount: async () => 3,
  subscribe: (_cb) => () => {},
};

// ---------------------------------------------------------------------------
// UserProfile — unchanged
// ---------------------------------------------------------------------------

interface UserProfile {
  display_name: string;
  role?: string;
  avatarUrl?: string;
}

const MOCK_USER: UserProfile = {
  display_name: 'Johann Seier',
  role: 'Platform Admin',
};

// ---------------------------------------------------------------------------
// TopNav — Tabler ul.navbar-nav. Spacing and alignment handled by Tabler CSS.
// Cases removed, CISO renamed (both already done in TOP_NAV_WORKSPACES).
// ---------------------------------------------------------------------------

function TopNav({ mode }: { mode: WorkspaceMode }) {
  const pathname = usePathname();
  // Active underline colour: black in light mode, white in dark mode
  const underline = mode === 'mission' ? '#ffffff' : '#000000';

  return (
    // Plain flex row — deliberately NOT using Tabler's .navbar-nav/.nav-link/.active
    // classes, so Tabler's blue ::after active indicator cannot render at all.
    <div className="nav-topnav" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      {TOP_NAV_WORKSPACES.map((item, index) => {
        const isActive = pathname === item.path;
        return (
          <a
            key={item.path}
            href={item.path}
            className="nav-topnav-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: '100%',
              // First item flush with breadcrumb; others get symmetric spacing
              paddingLeft: index === 0 ? 0 : '0.75rem',
              paddingRight: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              color: 'var(--tblr-body-color)',
              borderBottom: isActive ? `2px solid ${underline}` : '2px solid transparent',
            }}
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search — Issue 4: square border, compact width, no ⌘K hint
// ---------------------------------------------------------------------------

function Search({ semanticTokens }: { semanticTokens: ReturnType<typeof getSemanticTokens> }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        width: '180px',
        flexShrink: 0,
        height: componentTokens.inputHeight,
        border: `1px solid ${semanticTokens.input.border}`,
        borderRadius: 0,
        background: 'transparent',
        padding: '0 8px',
        boxSizing: 'border-box',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, opacity: 0.55 }}>
        {getIcon('search', { size: 'nav', 'aria-hidden': true })}
      </span>
      <input
        type="text"
        aria-label="Global search"
        placeholder="Search..."
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          outline: 'none',
          fontSize: componentTokens.topNavTextSize,
          color: 'inherit',
          minWidth: 0,
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CommanderAI — Issue 5: square border, compact, matches search height
// ---------------------------------------------------------------------------

function CommanderAIAction({ semanticTokens }: { semanticTokens: ReturnType<typeof getSemanticTokens> }) {
  return (
    <a
      href="#"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        height: componentTokens.inputHeight,
        padding: '0 10px',
        border: `1px solid ${semanticTokens.input.border}`,
        borderRadius: 0,
        background: 'transparent',
        fontSize: componentTokens.topNavTextSize,
        fontWeight: componentTokens.topNavTextWeight,
        whiteSpace: 'nowrap',
        textDecoration: 'none',
        color: 'inherit',
        flexShrink: 0,
      }}
    >
      {getIcon('commander-ai', { size: 'nav', 'aria-hidden': true })}
      Commander AI
    </a>
  );
}

// ---------------------------------------------------------------------------
// ThemeToggle — unchanged logic
// ---------------------------------------------------------------------------

function ThemeToggle({
  mode,
  toggleMode,
}: {
  mode: WorkspaceMode;
  toggleMode: () => void;
}) {
  const isMission = mode === 'mission';
  const ariaLabel = isMission ? 'Switch to Standard mode' : 'Switch to Mission mode';

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={toggleMode}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMode(); }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: 'inherit',
        flexShrink: 0,
        borderRadius: 0,
        padding: 0,
      }}
    >
      {isMission
        ? getIcon('theme-dark', { size: 'nav' })
        : getIcon('theme-light', { size: 'nav' })}
    </button>
  );
}

// ---------------------------------------------------------------------------
// NotificationBell — unchanged logic
// ---------------------------------------------------------------------------

function NotificationBell({ service = mockNotificationService }: { service?: NotificationService }) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    service.getUnreadCount().then(setCount).catch(() => setCount(0));
    const unsubscribe = service.subscribe(setCount);
    return unsubscribe;
  }, [service]);

  return (
    <button
      type="button"
      aria-label="Notifications"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: 'inherit',
        flexShrink: 0,
        borderRadius: 0,
        padding: 0,
      }}
    >
      {getIcon('notification-bell', { size: 'nav', 'aria-hidden': true })}
      {count > 0 && (
        <span
          className="badge bg-red"
          style={{
            position: 'absolute',
            top: '1px',
            right: '1px',
            minWidth: '15px',
            height: '15px',
            padding: '0 3px',
            lineHeight: '15px',
            fontSize: '0.5625rem',
            color: '#ffffff',
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// UserProfileBlock — unchanged logic, Issue 7: breathing room on right
// ---------------------------------------------------------------------------

function deriveInitials(display_name: string): string {
  return display_name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 3).toUpperCase();
}

function UserProfileBlock({ user = MOCK_USER }: { user?: UserProfile }) {
  const displayName = user.display_name.length > 30 ? user.display_name.slice(0, 30) + '…' : user.display_name;
  const initials = deriveInitials(user.display_name);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        paddingLeft: '4px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={display_name}
          style={{ width: '28px', height: '28px', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <span
          className="avatar avatar-sm"
          style={{ background: 'rgba(128,128,128,0.25)', fontSize: primitiveTypeScale.caption, fontWeight: 600, flexShrink: 0 }}
        >
          {initials}
        </span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: componentTokens.topNavTextSize, fontWeight: componentTokens.topNavTextWeight, lineHeight: 1.2 }}>
          {display_name}
        </span>
        {user.role && (
          <span style={{ fontSize: primitiveTypeScale.micro, opacity: 0.55, lineHeight: 1.2 }}>
            {user.role}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header root — Tabler navbar navbar-expand-md structure
// container-xl matches page content padding; order-md-last pushes utilities right
// ---------------------------------------------------------------------------

export function Header({ style }: HeaderProps) {
  const { mode, toggleMode } = useMode();
  const bsTheme = mode === 'mission' ? 'dark' : 'light';
  const semanticTokens = getSemanticTokens(mode);

  return (
    <>
      <style>{`
        /* Top-nav hover (custom class — no Tabler navbar involvement) */
        .commander-header .nav-topnav-link:hover {
          background: rgba(128,128,128,0.07);
        }
        /* Square corners, no shadows on header controls */
        .commander-header .btn,
        .commander-header button,
        .commander-header input {
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        .commander-header button:focus,
        .commander-header input:focus {
          box-shadow: none !important;
          outline: none !important;
        }
        /* Badge white text */
        .commander-header .badge.bg-red {
          color: #ffffff !important;
        }
      `}</style>
      <header
        className="d-print-none commander-header"
        data-bs-theme={bsTheme}
        style={{
          height: componentTokens.topbarHeight,
          borderBottom: '1px solid var(--tblr-border-color)',
          background: 'var(--tblr-bg-surface)',
          padding: 0,
          // Reserve the same scrollbar gutter that <main> loses to its vertical
          // scrollbar, so the header's centered container-xl has identical inner
          // width to the page's container-xl below — aligning nav with breadcrumb.
          // overflowY:auto + scrollbar-gutter:stable reserves the gutter without
          // ever showing a scrollbar (header content fits in one row).
          overflowY: 'auto',
          scrollbarGutter: 'stable',
          ...style,
        }}
      >
        {/*
          container-xl provides the SAME horizontal padding as the page-header's
          container-xl below, so the nav's left edge aligns with the breadcrumb.
          display:flex lays out nav (left) and utility cluster (right).
          No .navbar / .row / .col / .nav-link classes — avoids Tabler's blue
          active indicator and its space-between navbar layout entirely.
        */}
        <div
          className="container-xl"
          style={{ display: 'flex', alignItems: 'center', height: '100%' }}
        >
          {/* Left: top nav */}
          <TopNav mode={mode} />

          {/* Right: utility cluster, pushed right by margin-left:auto */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginLeft: 'auto',
              flexShrink: 0,
            }}
          >
            <Search semanticTokens={semanticTokens} />
            <CommanderAIAction semanticTokens={semanticTokens} />
            <ThemeToggle mode={mode} toggleMode={toggleMode} />
            <NotificationBell />
            <UserProfileBlock />
          </div>
        </div>
      </header>
    </>
  );
}
