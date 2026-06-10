'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { ARCHITECTURE_CLASSIFICATION_FIXTURES, TOPOLOGY_NODE_FIXTURES } from '../../../../../packages/contracts/src/fixtures/seed-architecture';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';

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
  const { tokens } = useMode();
  const classifications = ARCHITECTURE_CLASSIFICATION_FIXTURES;
  const nodes = TOPOLOGY_NODE_FIXTURES;
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
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
