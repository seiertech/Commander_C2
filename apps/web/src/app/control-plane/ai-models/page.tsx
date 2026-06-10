'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisModels } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Control Plane — AI & Model Control
 * Data: ModelDefinition from seed-platform
 * Route: /control-plane/ai-models | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-CP-005 — Commander AI model performance oversight */}

export default function ControlPlaneAiModelsPage() {
  const { tokens } = useMode();
  const active = thesisModels.filter((m) => m.status === 'active').length;
  const avgAccuracy = Math.round(thesisModels.reduce((a, m) => a + m.accuracy, 0) / thesisModels.length);
  const candidate = thesisModels.filter((m) => m.status === 'candidate').length;

  return (
    <PageContainer pretitle="Control Plane › AI & Models" title="AI & Model Control">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Total Models" value={String(thesisModels.length)} />
        <Kpi tokens={tokens} label="Active" value={String(active)} accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Candidates" value={String(candidate)} accent={primitiveSignal.info} />
        <Kpi tokens={tokens} label="Avg Accuracy" value={`${avgAccuracy}%`} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Model Registry (Operator View)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Model', 'Type', 'Status', 'Domain', 'Accuracy', 'FP Rate', 'Version'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisModels.map((m) => (
              <tr key={m.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{m.name}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{m.modelType}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: m.status === 'active' ? primitiveSignal.success : m.status === 'candidate' ? primitiveSignal.warning : primitiveSignal.neutral }}>{m.status}</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{m.domain}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: m.accuracy >= 90 ? primitiveSignal.success : primitiveSignal.warning }}>{m.accuracy}%</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{m.falsePositiveRate}%</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono }}>{m.version}</td>
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
