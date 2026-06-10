import { colors } from '../../../../../packages/ui/src/tokens/colors';
import { chrome } from '../../../../../packages/ui/src/tokens/spacing';
import { typography } from '../../../../../packages/ui/src/tokens/typography';
import { primitiveTypeScale } from '../../../../../packages/ui/src/tokens/primitives';
import { tenantAdminRoutes } from '../../registry/tenant-admin-routes';

/**
 * Tenant Admin Layout — Commander C2 (v1.3.2)
 *
 * Visual language: Inherits Operational App visual language per
 * DEC-v1.3.2-tenant-admin-shell-pending-reference.
 *
 * This is provisional pending a dedicated Tenant Admin reference HTML.
 * The Operational App shell frame with admin-specific page navigation
 * is the documented approach per Spec #47.
 *
 * BrandWordmark variant: SEIERTECH | COMMANDER SDR · TENANT ADMIN
 */
export default function TenantAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: colors.operational.page }}>
      {/* Sidebar — expandable groups from tenant-admin-routes */}
      <aside
        style={{
          position: 'fixed',
          top: chrome.topBarHeight,
          bottom: 0,
          left: 0,
          width: chrome.sidebarWidth,
          background: `linear-gradient(180deg, ${colors.navy.sidebar}, ${colors.navy.sidebarEnd})`,
          borderRight: `1px solid ${colors.chrome.lineDark}`,
          color: colors.chrome.textSubtle,
          display: 'flex',
          flexDirection: 'column',
        }}
        aria-label="Tenant Admin navigation"
      >
        <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
          {tenantAdminRoutes.filter(r => r.showInNav).map((route) => (
            <a
              key={route.path}
              href={route.path}
              style={{
                height: chrome.groupHeaderHeight,
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                color: colors.chrome.textHeading,
                fontWeight: 700,
                fontSize: '12px',
                textDecoration: 'none',
                marginBottom: '4px',
              }}
            >
              {route.label}
            </a>
          ))}
        </div>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: chrome.sidebarWidth }}>
        {/* Top bar — Operational App style with Tenant Admin brand variant */}
        <header
          style={{
            position: 'fixed',
            zIndex: 10,
            top: 0,
            left: 0,
            right: 0,
            height: chrome.topBarHeight,
            background: colors.navy.primary,
            display: 'flex',
            alignItems: 'center',
            color: colors.chrome.textMuted,
            borderBottom: `1px solid ${colors.navy.primary}`,
          }}
        >
          <div style={{ width: chrome.sidebarWidth, height: '100%', display: 'flex', alignItems: 'center', padding: '0 18px', borderRight: `1px solid ${colors.chrome.lineDark}`, gap: '10px', background: `linear-gradient(155deg, ${colors.navy.variant}, ${colors.navy.primary})` }}>
            <span style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.brandSm, letterSpacing: typography.letterSpacing.displayWide, fontWeight: 700, color: colors.brand.seiertech }}>SEIERTECH</span>
            <span style={{ height: '23px', width: '1px', background: colors.brand.pipe }} />
            <span style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.brandLg, letterSpacing: typography.letterSpacing.display, fontWeight: 700, color: colors.brand.commander }}>COMMANDER</span>
            <span style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.brandLg, letterSpacing: typography.letterSpacing.display, fontWeight: 700, color: colors.brand.sdr }}>SDR</span>
            <span style={{ fontSize: primitiveTypeScale.micro, color: colors.controlPlane.muted, marginLeft: '4px' }}>· TENANT ADMIN</span>
          </div>
          <div style={{ marginLeft: 'auto', padding: '0 16px', fontSize: typography.fontSize.base, color: colors.chrome.textSubtle }}>
            Tenant Administration
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '26px', background: colors.operational.panel, marginTop: chrome.topBarHeight }}>
          {children}
        </main>
      </div>
    </div>
  );
}
