'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisExposures, thesisAssets, thesisExposureEngine } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Exposure Management — Coverage Gaps
 * Data: CoverageGap from seed-exposures
 * Route: /exposure/coverage-gaps | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-EXPOSURE-003 — Commander AI coverage gap remediation */}

export default function ExposureCoverageGapsPage() {
  const { tokens } = useMode();
  const allGaps = thesisExposures.flatMap((e) => e.coverage_gaps.map((g) => ({ ...g, exposureId: e.id, blast_zone: e.blast_zone, surface_type: e.surface_type })));
  const noScanner = allGaps.filter((g) => g.gap_type === 'no_scanner').length;
  const noEdr = allGaps.filter((g) => g.gap_type === 'no_edr').length;
  const noMonitoring = allGaps.filter((g) => g.gap_type === 'no_monitoring').length;
  const staleData = allGaps.filter((g) => g.gap_type === 'stale_data').length;

  return (
    <PageContainer pretitle="Exposure Management › Coverage Gaps" title="Coverage Gaps">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Total Gaps" value={String(allGaps.length)} accent={allGaps.length > 0 ? primitiveSignal.warning : undefined} />
        <Kpi tokens={tokens} label="No Scanner" value={String(noScanner)} accent={noScanner > 0 ? primitiveSignal.critical : undefined} />
        <Kpi tokens={tokens} label="No EDR" value={String(noEdr)} accent={noEdr > 0 ? primitiveSignal.critical : undefined} />
        <Kpi tokens={tokens} label="Stale Data" value={String(staleData)} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Gap Detail</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Gap Type', 'Affected Entity', 'Blast Zone', 'Surface', 'Stale Days'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{allGaps.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: primitiveSpacing[4], textAlign: 'center', color: tokens.text.muted }}>No coverage gaps.</td></tr>
            ) : allGaps.map((g, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: g.gap_type === 'no_scanner' || g.gap_type === 'no_edr' ? primitiveSignal.critical : primitiveSignal.warning }}>{g.gap_type.replace(/_/g, ' ')}</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{g.affected_entity_ref}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{g.blast_zone}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{g.surface_type === 'external_attack_surface' ? 'EXT' : 'INT'}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: tokens.text.muted }}>{g.staleDays ?? '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{assetsCount} Assets</span>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{exposureengineCount} Exposure Engine</span>
        </div>
      </section>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
