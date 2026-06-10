'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { SEED_TENANT } from '../../../../../../packages/contracts/src/fixtures/seed-tenant';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Tenant Admin — Overview
 * Data: SEED_TENANT from seed-tenant
 * Route: /settings/tenant | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-ADMIN-001 — Commander AI tenant configuration recommendation */}

export default function SettingsTenantPage() {
  const { tokens } = useMode();

  return (
    <PageContainer pretitle="Settings › Tenant" title="Tenant Overview">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Tenant ID" value={SEED_TENANT.tenantId} />
        <Kpi tokens={tokens} label="Tenant Name" value={SEED_TENANT.tenantName} />
        <Kpi tokens={tokens} label="Status" value="Active" accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Licence" value="Enterprise" />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Tenant Configuration</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Property', 'Value', 'Status'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>
              {[
                { prop: 'Tenant ID', val: SEED_TENANT.tenantId, status: 'configured' },
                { prop: 'Tenant Name', val: SEED_TENANT.tenantName, status: 'configured' },
                { prop: 'Multi-Factor Authentication', val: 'Enforced', status: 'active' },
                { prop: 'Session Timeout', val: '30 minutes', status: 'configured' },
                { prop: 'Data Residency', val: 'EU-West-1', status: 'configured' },
                { prop: 'Push Governance', val: 'Dry-Run Only (Phase 1)', status: 'restricted' },
              ].map((r) => (
                <tr key={r.prop} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{r.prop}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{r.val}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: r.status === 'active' ? primitiveSignal.success : r.status === 'restricted' ? primitiveSignal.warning : primitiveSignal.info }}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: primitiveSpacing[3], fontSize: primitiveTypeScale.caption, color: tokens.text.muted }}>Tenant configuration editing is read-only in Phase 1.</p>
      </div>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary, wordBreak: 'break-all' }}>{value}</span></div>);
}
