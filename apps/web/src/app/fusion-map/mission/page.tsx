'use client';

import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisTopology, thesisMissions, thesisAssets, thesisCases, thesisRiskObjects, thesisBlastRadius, thesisPostures, thesisExposures, thesisStrategies, thesisConnectors } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Fusion Map — Mission Overlay
 * Data: Topology + Mission alignment from seed-topology + seed-missions
 * Route: /fusion-map/mission | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-FUSION-003 — Commander AI mission-topology correlation */}

export default function FusionMapMissionPage() {
  const { mode, tokens } = useMode();
  const { nodes } = thesisTopology;
  const activeMissions = thesisMissions.filter((m) => m.status === 'active');
  const missionCaseRefs = new Set(activeMissions.flatMap((m) => m.alignedCases));
  const missionNodes = nodes.filter((n) => n.entity_type === 'case' && missionCaseRefs.has(n.entity_ref));
  const missionDomains = new Set(activeMissions.flatMap((m) => m.impact_domains));
  const domainNodes = nodes.filter((n) => missionDomains.has(n.domain));
  const missionAssetCount = thesisAssets.length;
  const criticalAssets = thesisAssets.filter((a) => a.criticality >= 4).length;

  return (
    <PageContainer pretitle="Fusion Map › Mission Overlay" title="Mission Overlay">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Active Missions" value={String(activeMissions.length)} accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Mission-Linked Nodes" value={String(missionNodes.length)} />
        <Kpi tokens={tokens} label="Impact Domains" value={String(missionDomains.size)} />
        <Kpi tokens={tokens} label="Domain Nodes" value={String(domainNodes.length)} />
        <Kpi tokens={tokens} label="Total Assets" value={String(missionAssetCount)} />
        <Kpi tokens={tokens} label="Critical Assets" value={String(criticalAssets)} accent={criticalAssets > 0 ? primitiveSignal.warning : undefined} />
      </section>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Mission-Aligned Cases in Topology</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead><tr>{['Node', 'Domain', 'Criticality'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
              <tbody>{missionNodes.length > 0 ? missionNodes.map((n) => (
                <tr key={n.node_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
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
                <tr key={m.mission_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{m.mission_name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{m.progress_percent}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontSize: primitiveTypeScale.micro }}>{m.impact_domains.join(', ')}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    
      {/* Cross-Entity Relationship Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Blast Radius Impact</h4>
          {thesisBlastRadius.slice(0,3).map((b) => (
            <div key={b.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,14)}</span>
              <span style={{ color: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} pts → {b.affected_entities.length} entities</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Risk Objects</h4>
          {thesisRiskObjects.map((r) => (
            <div key={r.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ color: tokens.text.primary }}>{r.type.replace(/_/g, ' ')}</span>
              <span style={{ padding: '1px 6px', color: '#fff', background: r.treatment_state === 'open' ? primitiveSignal.warning : primitiveSignal.success }}>{r.treatment_state}</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Related Cases</h4>
          {thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1').slice(0,5).map((c) => (
            <div key={c.case_id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{c.case_id.slice(0,12)}</span>
              <span style={{ padding: '1px 6px', color: '#fff', background: c.priority === 'P0' ? primitiveSignal.critical : primitiveSignal.warning }}>{c.priority} · {c.ooda_state}</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Status</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3] }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'healthy').length} healthy</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.warning }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'degraded').length} degraded</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'critical').length} critical</span>
          </div>
        </div>
      </div>
    
      {/* Engine Correlation Chart — Sweep 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Risk Distribution</h4>
          <Chart type="donut" height={200} options={{ chart: { type: 'donut', background: 'transparent' }, labels: ['Open', 'Mitigated', 'Closed'], colors: [primitiveSignal.warning, primitiveSignal.success, primitiveSignal.neutral], legend: { position: 'bottom', labels: { colors: tokens.text.secondary }, fontSize: '11px' }, dataLabels: { enabled: true }, theme: { mode: mode === 'mission' ? 'dark' : 'light' } }} series={[thesisRiskObjects.filter((r) => r.treatment_state === 'open').length, thesisRiskObjects.filter((r) => r.treatment_state === 'mitigated').length, thesisRiskObjects.filter((r) => r.treatment_state !== 'open' && r.treatment_state !== 'mitigated').length]} />
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Health</h4>
          <Chart type="donut" height={200} options={{ chart: { type: 'donut', background: 'transparent' }, labels: ['Healthy', 'Degraded', 'Critical'], colors: [primitiveSignal.success, primitiveSignal.warning, primitiveSignal.critical], legend: { position: 'bottom', labels: { colors: tokens.text.secondary }, fontSize: '11px' }, dataLabels: { enabled: true }, theme: { mode: mode === 'mission' ? 'dark' : 'light' } }} series={[thesisPostures.filter((p) => p.posture_status === 'healthy').length, thesisPostures.filter((p) => p.posture_status === 'degraded').length, thesisPostures.filter((p) => p.posture_status === 'critical').length]} />
        </div>
      </div>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
