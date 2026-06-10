'use client';

import { useMode } from '@/context/mode-context';
import { useSidebarCollapsed } from '@/context/sidebar-context';
import { componentTokens } from '../../../../packages/ui/src/tokens/components';
import { primitiveBrand, primitiveFonts, primitiveTypeScale, primitiveLetterSpacing, primitiveMotion } from '../../../../packages/ui/src/tokens/primitives';
import { standardTokens } from '../../../../packages/ui/src/tokens/semantic';
import { TOP_NAV_WORKSPACES } from '@/registry/nav-groups';

/**
 * Operational App Top Bar — Commander SDR (DS-1.0)
 *
 * DS-1.0 §6: 56px, navy chrome both modes.
 * Structure: Left (Hamburger + Logo), Centre (Search), Right (AI, Mode toggle, Notifications, User).
 * Brand: SEIERTECH (cream) | gold pipe | COMMANDER (gold) | SDR (white) in Inter.
 *
 * Source: DESIGN_SYSTEM.md §6
 */
export function OperationalTopBar() {
  const { mode, toggleMode } = useMode();
  const { collapsed } = useSidebarCollapsed();
  const brandWidth = collapsed ? componentTokens.sidebarRail : componentTokens.sidebarWidth;

  return (
    <header
      style={{
        position: 'fixed',
        zIndex: 10,
        top: 0,
        left: 0,
        right: 0,
        height: componentTokens.topbarHeight,
        background: primitiveBrand.navy,
        display: 'flex',
        alignItems: 'center',
        color: standardTokens.chrome.navText,
        borderBottom: `1px solid rgba(255,255,255,0.14)`,
      }}
    >
      {/* Brand area — width tied to sidebar state */}
      <a
        href="/"
        style={{
          width: brandWidth,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0' : `0 ${componentTokens.cardPadding}`,
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRight: '1px solid rgba(255,255,255,0.14)',
          gap: '8px',
          background: `linear-gradient(155deg, ${primitiveBrand.navy2}, ${primitiveBrand.navy})`,
          textDecoration: 'none',
          transition: `width ${primitiveMotion.standard} ${primitiveMotion.easeDefault}`,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
        aria-label="Commander SDR — Home"
      >
        {!collapsed && (
          <>
            <span style={{ fontFamily: primitiveFonts.body, fontSize: primitiveTypeScale.display, letterSpacing: primitiveLetterSpacing.displayWide, fontWeight: 700, color: primitiveBrand.cream }}>SEIERTECH</span>
            <span style={{ height: '23px', width: '1px', background: primitiveBrand.gold, flexShrink: 0 }} />
            <span style={{ fontFamily: primitiveFonts.body, fontSize: primitiveTypeScale.display, letterSpacing: primitiveLetterSpacing.display, fontWeight: 700, color: primitiveBrand.gold }}>COMMANDER</span>
            <span style={{ fontFamily: primitiveFonts.body, fontSize: primitiveTypeScale.display, letterSpacing: primitiveLetterSpacing.display, fontWeight: 700, color: 'var(--tblr-light)' }}>SDR</span>
          </>
        )}
        {collapsed && (
          <span style={{ color: 'var(--tblr-light)', fontSize: '20px' }}>⌂</span>
        )}
      </a>

      {/* Top nav tabs */}
      <nav style={{ display: 'flex', height: '100%', alignItems: 'stretch' }}>
        {TOP_NAV_WORKSPACES.map((ws, i) => (
          <a
            key={ws.path}
            href={ws.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: `0 ${componentTokens.cardPadding}`,
              borderBottom: i === 0 ? `3px solid ${standardTokens.chrome.navTextActive}` : '3px solid transparent',
              color: i === 0 ? standardTokens.chrome.navTextActive : standardTokens.chrome.navText,
              background: i === 0 ? 'rgba(255,255,255,0.055)' : 'transparent',
              fontWeight: 600,
              fontSize: primitiveTypeScale.body,
              textDecoration: 'none',
            }}
          >
            {ws.label}
          </a>
        ))}
      </nav>

      {/* Tools area */}
      <div style={{ marginLeft: 'auto', height: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: `0 ${componentTokens.cardPadding}`, borderLeft: '1px solid rgba(255,255,255,0.14)' }}>
        {/* Search */}
        <label style={{ width: componentTokens.searchWidth, height: componentTokens.inputHeight, border: '1px solid rgba(255,255,255,0.24)', display: 'flex', alignItems: 'center', padding: '0 12px', background: 'rgba(255,255,255,0.075)' }}>
          <input placeholder="Search cases, assets, CVEs, identities, rules…" aria-label="Global search" style={{ width: '100%', border: 0, background: 'transparent', color: 'var(--tblr-light)', outline: 'none', fontFamily: primitiveFonts.body, fontSize: primitiveTypeScale.body }} />
        </label>
        {/* Commander AI button */}
        <a style={{ height: componentTokens.inputHeight, border: `1px solid rgba(255,255,255,0.24)`, color: primitiveBrand.navy, background: 'var(--tblr-light)', fontWeight: 800, padding: '0 12px', display: 'flex', alignItems: 'center', textDecoration: 'none', fontSize: primitiveTypeScale.body }}>Commander AI</a>
        {/* Mode toggle */}
        <button
          type="button"
          onClick={toggleMode}
          aria-label={`Switch to ${mode === 'standard' ? 'Mission' : 'Standard'} mode`}
          style={{ height: componentTokens.buttonHeight, padding: '0 12px', border: '1px solid rgba(255,255,255,0.16)', background: mode === 'mission' ? 'rgba(59,130,246,0.08)' : 'transparent', color: mode === 'mission' ? standardTokens.chrome.navTextActive : standardTokens.chrome.navText, cursor: 'pointer', fontFamily: primitiveFonts.body, fontSize: primitiveTypeScale.micro, fontWeight: 700, letterSpacing: primitiveLetterSpacing.eyebrow }}
        >
          {mode === 'standard' ? 'STANDARD' : 'MISSION'}
        </button>
        {/* User avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.14)', paddingLeft: '12px' }}>
          <div style={{ width: componentTokens.avatarSize, height: componentTokens.avatarSize, border: '1px solid rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', color: 'var(--tblr-light)', fontFamily: primitiveFonts.body, fontSize: primitiveTypeScale.caption, fontWeight: 700 }}>JS</div>
          <div>
            <b style={{ display: 'block', fontSize: primitiveTypeScale.caption }}>Jane Smith</b>
            <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: 'var(--tblr-secondary)' }}>Analyst</span>
          </div>
        </div>
      </div>
    </header>
  );
}
