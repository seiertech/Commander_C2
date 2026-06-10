'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { SEED_TENANT } from '../../../../../../packages/contracts/src/fixtures/seed-tenant';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Tenant Admin — Users & Access (RBAC)
 * Data: SEED_TENANT (tenant context) + static RBAC role definitions
 * Route: /settings/users-rbac | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-ADMIN-003 — Commander AI access anomaly detection */}

const RBAC_ROLES = [
  { role: 'CISO', users: 1, permissions: 'Full read, strategy approval, report access', scope: 'global' },
  { role: 'SOM (Security Operations Manager)', users: 2, permissions: 'Operational read/write, case routing, team management', scope: 'global' },
  { role: 'Security Analyst', users: 4, permissions: 'Case work, investigation, evidence submission', scope: 'team' },
  { role: 'Security Architect', users: 1, permissions: 'Architecture read, drift review, baseline management', scope: 'global' },
  { role: 'Identity/Access Specialist', users: 1, permissions: 'Identity domain read/write, access reviews', scope: 'domain' },
  { role: 'Tenant Admin', users: 1, permissions: 'Configuration, user management, audit access', scope: 'tenant' },
  { role: 'Seiertech Operator', users: 0, permissions: 'Control plane access (separate boundary)', scope: 'platform' },
];

export default function SettingsUsersRbacPage() {
  const { tokens } = useMode();
  const totalUsers = RBAC_ROLES.reduce((a, r) => a + r.users, 0);
  const totalRoles = RBAC_ROLES.length;

  return (
    <PageContainer pretitle="Settings › Users & Access" title="Users & RBAC">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Total Users" value={String(totalUsers)} />
        <Kpi tokens={tokens} label="Roles Defined" value={String(totalRoles)} />
        <Kpi tokens={tokens} label="Tenant" value={SEED_TENANT.tenantName.split(' ')[0]} />
        <Kpi tokens={tokens} label="MFA Status" value="Enforced" accent={primitiveSignal.success} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>RBAC Role Definitions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Role', 'Users', 'Permissions', 'Scope'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{RBAC_ROLES.map((r) => (
              <tr key={r.role} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{r.role}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{r.users}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, maxWidth: 300 }}>{r.permissions}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: r.scope === 'global' ? primitiveSignal.info : r.scope === 'platform' ? primitiveSignal.warning : primitiveSignal.neutral }}>{r.scope}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p style={{ marginTop: primitiveSpacing[3], fontSize: primitiveTypeScale.caption, color: tokens.text.muted }}>User management and RBAC editing is read-only in Phase 1. Live enforcement deferred (ARCH-DEBT-047).</p>
      </div>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
