'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisControlFrameworks } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

{/* AI-PLACEMENT: AICAP-CP-007 — Commander AI baseline drift detection */}

export default function ControlPlaneBaselinesPage() {
  const { tokens } = useMode();
  const active = thesisControlFrameworks.filter((f) => f.active).length;
  const avgCompleteness = Math.round(thesisControlFrameworks.reduce((a, f) => a + f.mapping_completeness, 0) / thesisControlFrameworks.length);

  return (
    <PageContainer pretitle="Control Plane › Baselines" title="Baseline Profile Management">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Frameworks" value={String(thesisControlFrameworks.length)} />
        <Kpi tokens={tokens} label="Active" value={String(active)} accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Avg Completeness" value={`${avgCompleteness}%`} />
        <Kpi tokens={tokens} label="Custom" value={String(thesisControlFrameworks.filter((f) => f.origin === 'custom').length)} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Baseline Profiles</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Framework', 'Version', 'Category', 'Controls', 'Mapping %', 'Origin', 'Active'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisControlFrameworks.map((f) => (
              <tr key={f.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{f.framework_name}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{f.version}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{f.category}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{f.total_controls}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{f.mapping_completeness}%</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{f.origin}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>{f.active ? <span style={{ color: primitiveSignal.success }}>●</span> : <span style={{ color: tokens.text.muted }}>○</span>}</td>
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
