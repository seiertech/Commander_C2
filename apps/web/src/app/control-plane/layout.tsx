import { colors } from '../../../../../packages/ui/src/tokens/colors';
import { chrome } from '../../../../../packages/ui/src/tokens/spacing';
import { typography } from '../../../../../packages/ui/src/tokens/typography';
import { CONTROL_PLANE_NAV_ITEMS, CONTROL_PLANE_TOP_NAV } from '@/registry/nav-groups';

/**
 * Commercial Control Plane Layout — Commander SDR (v1.3.2)
 *
 * Source: docs/06_ui_build_reference/commander-commercial-control-plane-shell-v3-admin-navigation.html
 *
 * Visual language:
 * - Dark chrome (token-driven surfaces)
 * - Navy underline on top bar bottom
 * - INTERNAL environment badge
 * - "PROD ACTIONS REQUIRE APPROVAL" header tile
 * - Flat sidebar (single-level per v3 reference)
 */
export default function ControlPlaneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: colors.controlPlane.background }}>
      {/* Sidebar — flat single-level per v3 reference */}
      <aside
        style={{
          position: 'fixed',
          top: chrome.topBarHeight,
          bottom: 0,
          width: '330px',
          background: colors.controlPlane.panel,
          borderRight: `1px solid ${colors.controlPlane.line}`,
        }}
        aria-label="Control Plane navigation"
      >
        <div style={{ height: '100%', overflowY: 'auto', padding: '12px' }}>
          {CONTROL_PLANE_NAV_ITEMS.map((item, i) => (
            <div
              key={item.path}
              style={{
                height: chrome.groupHeaderHeight,
                display: 'flex',
                alignItems: 'center',
                border: i === 0 ? `1px solid rgba(6,25,54,.45)` : '1px solid transparent',
                background: i === 0 ? 'rgba(6,25,54,.08)' : 'transparent',
                padding: '0 10px',
                fontWeight: 700,
                fontSize: '12px',
                color: i === 0 ? colors.controlPlane.text : colors.controlPlane.muted,
                marginBottom: '7px',
              }}
            >
              {item.label}
              {'badge' in item && item.badge && (
                <small style={{ marginLeft: '8px', color: colors.controlPlane.text, border: `1px solid ${colors.controlPlane.line}`, fontSize: '8px', padding: '2px 4px' }}>
                  {item.badge}
                </small>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '330px' }}>
        {/* Top bar — v3 reference: #050505 with navy border */}
        <header
          style={{
            position: 'fixed',
            zIndex: 10,
            top: 0,
            left: 0,
            right: 0,
            height: chrome.topBarHeight,
            background: colors.controlPlane.topBar,
            borderBottom: `1px solid ${colors.navy.primary}`,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Brand — COMMANDER COMMERCIAL CONTROL */}
          <div style={{ width: '330px', height: '100%', display: 'flex', alignItems: 'center', padding: '0 18px', borderRight: `1px solid ${colors.controlPlane.line}`, gap: '10px' }}>
            <span style={{ letterSpacing: typography.letterSpacing.displayWide, fontSize: '22px', fontWeight: 700, color: colors.brand.commander }}>COMMANDER</span>
            <span style={{ letterSpacing: typography.letterSpacing.displayWide, fontSize: '22px', fontWeight: 700, color: colors.controlPlane.text }}>COMMERCIAL CONTROL</span>
          </div>
          {/* Top nav tabs */}
          <nav style={{ display: 'flex', height: '100%' }}>
            {CONTROL_PLANE_TOP_NAV.map((tab, i) => (
              <a
                key={tab.path}
                href={tab.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  color: i === 0 ? colors.controlPlane.text : colors.controlPlane.muted,
                  borderBottom: i === 0 ? `3px solid ${colors.controlPlane.text}` : '3px solid transparent',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                {tab.label}
              </a>
            ))}
          </nav>
          {/* Tools */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center', padding: '0 16px' }}>
            <label style={{ width: chrome.searchWidth, height: chrome.iconSize, border: `1px solid ${colors.controlPlane.line}`, background: colors.controlPlane.black, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
              <input placeholder="Search customers, tenants, licences, features, rules…" style={{ width: '100%', height: '100%', background: 'transparent', border: 0, color: colors.controlPlane.text, outline: 'none', fontSize: '14px' }} />
            </label>
            {/* INTERNAL badge */}
            <div style={{ border: `1px solid ${colors.status.critical}`, color: colors.status.critical, padding: '9px 12px', fontWeight: 700, fontSize: '12px' }}>INTERNAL</div>
            <div style={{ borderLeft: `1px solid ${colors.controlPlane.line}`, paddingLeft: '12px', color: colors.controlPlane.muted, fontSize: '14px' }}>Operator</div>
          </div>
        </header>

        {/* Page header */}
        <section style={{ height: chrome.pageHeaderHeight, background: colors.controlPlane.panel, borderBottom: `1px solid ${colors.controlPlane.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', marginTop: chrome.topBarHeight }}>
          <div>
            <small style={{ color: colors.controlPlane.muted, textTransform: 'uppercase', letterSpacing: typography.letterSpacing.eyebrow, fontSize: '11px' }}>Commander Commercial Control Plane › v2.5 shell reference</small>
            <h1 style={{ margin: '4px 0 0', color: colors.controlPlane.text, fontSize: '24px', fontWeight: 700, lineHeight: '1.2' }}>Command Overview</h1>
          </div>
          <div style={{ border: `1px solid ${colors.status.critical}`, color: colors.status.critical, padding: '9px 12px', fontWeight: 700, fontSize: '12px' }}>PROD ACTIONS REQUIRE APPROVAL</div>
        </section>

        {/* Content */}
        <section style={{ padding: '26px', overflow: 'auto', flex: 1 }}>
          {children}
        </section>
      </div>
    </div>
  );
}
