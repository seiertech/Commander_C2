'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisTopology, thesisMissionSeeds } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Fusion Map — Mission Overlay
 * Data: Topology + Mission alignment from seed-topology + seed-missions
 * Route: /fusion-map/mission | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-FUSION-003 — Commander AI mission-topology correlation */}

export default function FusionMapMissionPage() {
  const { tokens } = useMode();
  const { nodes } = thesisTopology;
  const activeMissions = thesisMissionSeeds.filter((m) => m.status === 'active');
  const missionCaseRefs = new Set(activeMissions.flatMap((m) => m.alignedCases));
  const missionNodes = nodes.filter((n) => n.entityType === 'case' && missionCaseRefs.has(n.entityRef));
  const missionDomains = new Set(activeMissions.flatMap((m) => m.impactDomains));
  const domainNodes = nodes.filter((n) => missionDomains.has(n.domain));

  return (
    <PageContainer pretitle="Fusion Map › Mission Overlay" title="Mission Overlay">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Active Missions" value={String(activeMissions.length)} accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Mission-Linked Nodes" value={String(missionNodes.length)} />
        <Kpi tokens={tokens} label="Impact Domains" value={String(missionDomains.size)} />
        <Kpi tokens={tokens} label="Domain Nodes" value={String(domainNodes.length)} />
      </section>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Mission-Aligned Cases in Topology</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead><tr>{['Node', 'Domain', 'Criticality'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
              <tbody>{missionNodes.length > 0 ? missionNodes.map((n) => (
                <tr key={n.nodeId} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary }}>{n.label}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{n.domain}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{n.criticality}</td>
                </tr>
              )) : <tr><td colSpan={3} style={{ padding: primitiveSpacing[4], textAlign: 'center', color: tokens.text.muted }}>No direct case-node links in current topology.</td></tr>}</tbody>
            </table>
          </div>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Active Missions</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead><tr>{['Mission', 'Progress', 'Domains'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
              <tbody>{activeMissions.map((m) => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{m.name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{m.progressPercent}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontSize: primitiveTypeScale.micro }}>{m.impactDomains.join(', ')}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
