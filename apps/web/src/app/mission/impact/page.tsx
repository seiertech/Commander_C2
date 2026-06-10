'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisMissions } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Mission Control — Impact
 * Data: Mission impactDomains + kpiMetrics from seed-missions
 * Route: /mission/impact | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-MISSION-003 — Commander AI mission impact correlation */}

export default function MissionImpactPage() {
  const { tokens } = useMode();
  const allDomains = Array.from(new Set(thesisMissions.flatMap((m) => m.impact_domains)));
  const allKpis = thesisMissions.flatMap((m) => m.kpiMetrics.map((k: any) => ({ ...k, missionName: m.mission_name })));
  const kpisOnTrack = allKpis.filter((k) => k.current >= k.target).length;
  const totalAlignedCases = new Set(thesisMissions.flatMap((m) => m.alignedCases)).size;

  return (
    <PageContainer pretitle="Mission Control › Impact" title="Mission Impact">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Impact Domains" value={String(allDomains.length)} />
        <Kpi tokens={tokens} label="KPIs Tracked" value={String(allKpis.length)} />
        <Kpi tokens={tokens} label="KPIs On Track" value={String(kpisOnTrack)} accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Aligned Cases" value={String(totalAlignedCases)} />
      </section>

      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Impact Domains</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
          {allDomains.map((d) => {
            const missionCount = thesisMissions.filter((m) => m.impact_domains.includes(d)).length;
            return (<span key={d} style={{ padding: `${primitiveSpacing[1]} ${primitiveSpacing[3]}`, border: `1px solid ${tokens.border.default}`, fontSize: primitiveTypeScale.caption, color: tokens.text.primary, textTransform: 'capitalize' }}>{d} <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.muted }}>({missionCount})</span></span>);
          })}
        </div>
      </div>

      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>KPI Metrics</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Mission', 'KPI', 'Current', 'Target', 'Unit', 'Status'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{allKpis.map((k, i) => {
              const onTrack = k.current >= k.target;
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{k.missionName}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary }}>{k.name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: onTrack ? primitiveSignal.success : primitiveSignal.warning }}>{k.current}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: tokens.text.muted }}>{k.target}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{k.unit}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: onTrack ? primitiveSignal.success : primitiveSignal.warning }}>{onTrack ? 'ON TRACK' : 'BEHIND'}</span></td>
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
