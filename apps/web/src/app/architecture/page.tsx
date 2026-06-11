'use client';

import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';
import { thesisArchitectureClassifications, thesisTopologyNodes, thesisArchitectureIntelligence, thesisTopologyEdges, thesisAssets, thesisBlastRadius, thesisDriftDetection, thesisRiskObjects, thesisConnectors, thesisPostures, thesisExposures, thesisStrategies, thesisCases, thesisMissions, thesisRiskScores, thesisActions, thesisIdentities, thesisEvents, thesisSignals, thesisIocs } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Architecture — Overview (Thesis §6 — Architecture Classification & Topology)
 * Data: Architecture_Classification, Topology_Node from thesis fixtures
 * Route: /architecture | Status: BUILD
 * Use Case: UC-ARCH-001 — View Architecture Topology
 * Entities: Architecture_Classification, Topology_Node (L2)
 * Standards: TOGAF, Zachman
 */
{/* AI-PLACEMENT: AICAP-ARCH-001 — Commander AI architecture risk assessment */}

export default function ArchitectureOverviewPage() {
  const { mode, tokens } = useMode();
  const classifications = thesisArchitectureClassifications;
  const nodes = thesisTopologyNodes;
  const byDomain = { business: 0, data: 0, application: 0, technology: 0 };
  classifications.forEach((c) => { byDomain[c.togaf_domain]++; });
  const totalNodes = nodes.length;

  return (
    <PageContainer pretitle="Architecture" title="Architecture Classification & Topology">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Classifications" value={String(classifications.length)} />
        <Kpi tokens={tokens} label="Topology Nodes" value={String(totalNodes)} />
        <Kpi tokens={tokens} label="Business Domain" value={String(byDomain.business)} />
        <Kpi tokens={tokens} label="Technology Domain" value={String(byDomain.technology)} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Architecture Classifications</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['ID', 'TOGAF Domain', 'Zachman Aspect', 'Zachman Perspective', 'Logical Layer', 'Physical Layer', 'Service Tier', 'Topology Type'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{classifications.map((c) => (
              <tr key={c.architecture_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{c.architecture_id}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: c.togaf_domain === 'technology' ? primitiveSignal.info : c.togaf_domain === 'application' ? primitiveSignal.success : c.togaf_domain === 'data' ? primitiveSignal.warning : primitiveSignal.neutral }}>{c.togaf_domain}</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{c.zachman_aspect}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{c.zachman_perspective}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{c.logical_layer}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{c.physical_layer}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{c.service_tier}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{c.topology_type}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginTop: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Topology Nodes</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Node ID', 'Asset ID', 'Node Type', 'Topology Type', 'Architectural Zone', 'Standard'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{nodes.map((n) => (
              <tr key={n.topology_node_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{n.topology_node_id}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: tokens.text.secondary }}>{n.asset_id}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{n.node_type}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{n.topology_type}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: n.architectural_zone === 'dmz' ? primitiveSignal.warning : n.architectural_zone === 'perimeter' ? primitiveSignal.critical : primitiveSignal.info }}>{n.architectural_zone}</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>{n.standard_marker}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    

      {/* Cross-Entity: Architecture Intelligence Findings */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginTop: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Architecture Intelligence ({thesisArchitectureIntelligence.length} findings)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Finding', 'Severity', 'Category', 'Affected Entities', 'Recommendation'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisArchitectureIntelligence.map((ai) => (
              <tr key={ai.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{ai.name}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: ai.severity >= 7 ? primitiveSignal.critical : ai.severity >= 5 ? primitiveSignal.warning : primitiveSignal.neutral }}>{ai.severity}/10</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{ai.category}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{ai.affected_entity_refs?.length ?? 0}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ai.recommendation}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* Cross-Entity: Topology Edges + Blast Radius */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Topology Edges ({thesisTopologyEdges.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead><tr>{['Source', 'Target', 'Type', 'Protocol'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `1px solid ${tokens.border.default}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
              <tbody>{thesisTopologyEdges.map((e) => (
                <tr key={e.topology_edge_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.primary }}>{e.source_node_id?.slice(0,12)}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.secondary }}>{e.target_node_id?.slice(0,12)}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{e.edge_type}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{e.protocol ?? '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Blast Radius ({thesisBlastRadius.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead><tr>{['Origin', 'Type', 'Impact Score', 'Affected'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `1px solid ${tokens.border.default}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
              <tbody>{thesisBlastRadius.map((b) => (
                <tr key={b.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,16)}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{b.originEntityType}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{b.affected_entities.length}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cross-Entity: Linked Risk Objects + Drift */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Architecture Risk Objects ({thesisRiskObjects.length})</h3>
          {thesisRiskObjects.map((r) => (
            <div key={r.id} style={{ padding: primitiveSpacing[2], borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: tokens.text.primary, fontSize: primitiveTypeScale.caption }}>{r.type.replace(/_/g, ' ')}</span>
              <span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: r.treatment_state === 'open' ? primitiveSignal.warning : primitiveSignal.success }}>{r.treatment_state}</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Drift Detections ({thesisDriftDetection.length})</h3>
          {thesisDriftDetection.map((d) => (
            <div key={d.id} style={{ padding: primitiveSpacing[2], borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: tokens.text.primary, fontSize: primitiveTypeScale.caption }}>{d.name}</span>
              <span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: d.driftSeverity >= 7 ? primitiveSignal.critical : primitiveSignal.warning }}>{d.driftSeverity}/10</span>
            </div>
          ))}
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
