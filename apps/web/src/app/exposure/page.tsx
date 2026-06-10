'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';
import { thesisExposures } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Exposure Management — Attack Surface
 * Data: Exposure from seed-exposures
 * Route: /exposure | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-EXPOSURE-001 — Commander AI attack surface risk correlation */}

export default function ExposurePage() {
  const { tokens } = useMode();
  const external = thesisExposures.filter((e) => e.surfaceType === 'external_attack_surface').length;
  const internal = thesisExposures.filter((e) => e.surfaceType === 'internal_attack_surface').length;
  const open = thesisExposures.filter((e) => e.status === 'open').length;
  const totalGaps = thesisExposures.reduce((a, e) => a + e.coverageGaps.length, 0);

  return (
    <PageContainer pretitle="Exposure Management" title="Attack Surface">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="External" value={String(external)} accent={primitiveSignal.warning} />
        <Kpi tokens={tokens} label="Internal" value={String(internal)} />
        <Kpi tokens={tokens} label="Open" value={String(open)} accent={open > 0 ? primitiveSignal.critical : undefined} />
        <Kpi tokens={tokens} label="Coverage Gaps" value={String(totalGaps)} accent={totalGaps > 0 ? primitiveSignal.warning : undefined} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Exposure Register</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Surface', 'Category', 'Severity', 'Status', 'Blast Zone', 'Vector', 'Gaps'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisExposures.map((e) => (
              <tr key={e.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, border: `1px solid ${e.surfaceType === 'external_attack_surface' ? primitiveSignal.warning : tokens.border.subtle}`, color: e.surfaceType === 'external_attack_surface' ? primitiveSignal.warning : tokens.text.muted }}>{e.surfaceType === 'external_attack_surface' ? 'EXT' : 'INT'}</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{e.category}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: e.severity <= 2 ? primitiveSignal.critical : tokens.text.secondary }}>{e.severity}/5</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: e.status === 'open' ? primitiveSignal.critical : e.status === 'monitoring' ? primitiveSignal.warning : primitiveSignal.success }}>{e.status}</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>{e.blastZone}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={e.exposureVector}>{e.exposureVector}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{e.coverageGaps.length}</td>
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
