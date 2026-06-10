'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { thesisMissions } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Mission Control — Overview (Thesis §14 — Mission & Strategic Portfolio)
 * Data: MissionThesis from thesis-adapters
 * Route: /mission/overview | Status: BUILD
 * Use Case: UC-MISSION-001 — View Mission Portfolio
 * Entities: Mission (L9)
 * Standards: CBP, OKR
 */
{/* AI-PLACEMENT: AICAP-MISSION-001 — Commander AI mission progress assessment */}

export default function MissionOverviewPage() {
  const { tokens } = useMode();
  const active = thesisMissions.filter((m) => m.status === 'active').length;
  const draft = thesisMissions.filter((m) => m.status === 'draft').length;
  const avgDelta = thesisMissions.length > 0 ? Math.round(thesisMissions.reduce((a, m) => a + m.delta_score, 0) / thesisMissions.length) : 0;
  const avgRiskReduction = thesisMissions.length > 0 ? Math.round(thesisMissions.reduce((a, m) => a + m.risk_reduction_value, 0) / thesisMissions.length) : 0;

  return (
    <PageContainer pretitle="Mission Control › Overview" title="Mission Portfolio">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Total Missions" value={String(thesisMissions.length)} />
        <Kpi tokens={tokens} label="Active" value={String(active)} accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Avg Delta" value={`${avgDelta}%`} />
        <Kpi tokens={tokens} label="Avg Risk Reduction" value={`${avgRiskReduction}%`} accent={primitiveSignal.info} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Mission Portfolio</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Mission', 'Status', 'Priority', 'Current', 'Target', 'Delta', 'Risk Reduction', 'Type', 'Owner', 'Timeframe'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisMissions.map((m) => {
              const statusColor = m.status === 'active' ? primitiveSignal.success : m.status === 'completed' ? primitiveSignal.info : primitiveSignal.neutral;
              return (
                <tr key={m.mission_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{m.mission_name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: statusColor }}>{m.status}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{m.priority_score}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{m.current_state_score}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{m.target_state_score}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: m.delta_score > 30 ? primitiveSignal.critical : m.delta_score > 15 ? primitiveSignal.warning : primitiveSignal.success }}>{m.delta_score}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{m.risk_reduction_value}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{m.mission_type}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{m.owner}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(m.timeframe).toLocaleDateString()}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
