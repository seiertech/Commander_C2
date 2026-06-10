'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { seedLicences } from '../../../../../../packages/contracts/src/fixtures/seed-licences';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';

{/* AI-PLACEMENT: AICAP-CP-010 — Commander AI usage forecast */}

export default function ControlPlaneBillingPage() {
  const { tokens } = useMode();
  const totalUsers = seedLicences.reduce((a, l) => a + l.currentUsage.users, 0);
  const totalAssets = seedLicences.reduce((a, l) => a + l.currentUsage.assets, 0);
  const totalConnectors = seedLicences.reduce((a, l) => a + l.currentUsage.connectors, 0);

  return (
    <PageContainer pretitle="Control Plane › Billing" title="Billing / Usage Evidence">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Users" value={String(totalUsers)} />
        <Kpi tokens={tokens} label="Assets" value={String(totalAssets)} />
        <Kpi tokens={tokens} label="Connectors" value={String(totalConnectors)} />
        <Kpi tokens={tokens} label="Licences" value={String(seedLicences.length)} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Usage Evidence</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Licence', 'Type', 'Users (used/max)', 'Assets (used/max)', 'Connectors', 'Cycle', 'Status'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{seedLicences.map((l) => (
              <tr key={l.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{l.id}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{l.licenceType}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{l.currentUsage.users}/{l.maxUsers}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{l.currentUsage.assets}/{l.maxAssets}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{l.currentUsage.connectors}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{l.billingCycle}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: l.status === 'active' ? primitiveSignal.success : primitiveSignal.neutral }}>{l.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p style={{ marginTop: primitiveSpacing[3], fontSize: primitiveTypeScale.caption, color: tokens.text.muted }}>Phase 1 read-only — no live billing implementation. Usage evidence for audit purposes only.</p>
      </div>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
