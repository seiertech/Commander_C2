'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisControlFrameworks, thesisFrameworkControls } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Controls — Framework Mapping
 * Data: ControlFramework + FrameworkControl from seed-control-frameworks
 * Route: /controls/frameworks | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-CTRL-002 — Commander AI framework gap analysis */}

export default function ControlsFrameworksPage() {
  const { tokens } = useMode();
  const activeFrameworks = thesisControlFrameworks.filter((f) => f.active).length;
  const totalControls = thesisFrameworkControls.length;
  const avgCompleteness = thesisControlFrameworks.length > 0 ? Math.round(thesisControlFrameworks.reduce((a, f) => a + f.mapping_completeness, 0) / thesisControlFrameworks.length) : 0;

  return (
    <PageContainer pretitle="Controls › Frameworks" title="Framework Mapping">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Frameworks" value={String(thesisControlFrameworks.length)} />
        <Kpi tokens={tokens} label="Active" value={String(activeFrameworks)} accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Controls Mapped" value={String(totalControls)} />
        <Kpi tokens={tokens} label="Avg Completeness" value={`${avgCompleteness}%`} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Registered Frameworks</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Framework', 'Version', 'Category', 'Controls', 'Mapping %', 'Licence', 'Active'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisControlFrameworks.map((f) => (
              <tr key={f.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{f.framework_name}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{f.version}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{f.category}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{f.total_controls}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{f.mapping_completeness}%</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>{f.licence_status}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>{f.active ? <span style={{ color: primitiveSignal.success }}>●</span> : <span style={{ color: tokens.text.muted }}>○</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Framework Controls</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Framework', 'Control ID', 'Name', 'Domain', 'Tier'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisFrameworkControls.slice(0, 10).map((c) => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{c.framework_id}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono }}>{c.control_id}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.controlName}>{c.controlName}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{c.domain}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{c.tier}</td>
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
