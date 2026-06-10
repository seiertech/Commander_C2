'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisStrategies } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Tenant Admin — Rules & Models Configuration
 * Data: Strategy policies from seed-strategies
 * Route: /settings/rules | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-ADMIN-004 — Commander AI rule tuning suggestion */}

export default function SettingsRulesPage() {
  const { tokens } = useMode();
  const active = thesisStrategies.filter((s) => s.status === 'active').length;
  const surfaces = Array.from(new Set(thesisStrategies.map((s) => s.surface_type))).length;

  return (
    <PageContainer pretitle="Settings › Rules & Models" title="Rules & Models">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Policies" value={String(thesisStrategies.length)} />
        <Kpi tokens={tokens} label="Active" value={String(active)} accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Surfaces" value={String(surfaces)} />
        <Kpi tokens={tokens} label="Governance" value="Read-Only" />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Strategy Policy Rules</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Policy', 'Surface', 'Status', 'Version', 'Owner'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisStrategies.map((s) => (
              <tr key={s.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{s.surface_type}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{s.surface_type}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: s.status === 'active' ? primitiveSignal.success : primitiveSignal.neutral }}>{s.status}</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono }}>{s.policy_version}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{s.proposed_by}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p style={{ marginTop: primitiveSpacing[3], fontSize: primitiveTypeScale.caption, color: tokens.text.muted }}>Rule and model editing is read-only in Phase 1. Strategy values are consumed by the routing, SLA, and prioritisation engines.</p>
      </div>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
