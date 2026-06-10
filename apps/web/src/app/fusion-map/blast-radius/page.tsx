'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisTopology } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Fusion Map — Blast Radius
 * Data: BlastRadiusResult from seed-topology
 * Route: /fusion-map/blast-radius | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-FUSION-002 — Commander AI blast radius impact assessment */}

export default function FusionMapBlastRadiusPage() {
  const { tokens } = useMode();
  const results = thesisTopology.blastRadiusResults;
  const nodes = thesisTopology.nodes;
  const maxImpact = results.length > 0 ? Math.max(...results.map((r) => r.totalImpactScore)) : 0;
  const maxDepth = results.length > 0 ? Math.max(...results.map((r) => r.depth)) : 0;
  const totalAffected = new Set(results.flatMap((r) => r.affectedNodes)).size;

  return (
    <PageContainer pretitle="Fusion Map › Blast Radius" title="Blast Radius Analysis">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Analyses" value={String(results.length)} />
        <Kpi tokens={tokens} label="Max Impact" value={String(maxImpact)} accent={maxImpact >= 80 ? primitiveSignal.critical : primitiveSignal.warning} />
        <Kpi tokens={tokens} label="Max Depth" value={String(maxDepth)} />
        <Kpi tokens={tokens} label="Nodes Affected" value={String(totalAffected)} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Blast Radius Results</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Origin', 'Origin Label', 'Affected Nodes', 'Depth', 'Impact Score'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{results.map((r) => {
              const originNode = nodes.find((n) => n.nodeId === r.originNodeId);
              return (
                <tr key={r.originNodeId} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.secondary }}>{r.originNodeId}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{originNode?.label ?? '—'}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{r.affectedNodes.length}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{r.depth}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: r.totalImpactScore >= 80 ? primitiveSignal.critical : r.totalImpactScore >= 50 ? primitiveSignal.warning : tokens.text.secondary }}>{r.totalImpactScore}</td>
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
