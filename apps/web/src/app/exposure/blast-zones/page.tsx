'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisExposures, thesisBlastRadius } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Exposure Management — Blast Zones
 * Data: Exposure blastZone grouping from seed-exposures
 * Route: /exposure/blast-zones | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-EXPOSURE-002 — Commander AI blast zone risk assessment */}

export default function ExposureBlastZonesPage() {
  const { tokens } = useMode();
  const zones = Array.from(new Set(thesisExposures.map((e) => e.blast_zone)));
  const zoneData = zones.map((z) => {
    const items = thesisExposures.filter((e) => e.blast_zone === z);
    return { zone: z, count: items.length, open_count: items.filter((e) => e.status === 'open').length, maxSeverity: Math.min(...items.map((e) => e.severity)) };
  });

  return (
    <PageContainer pretitle="Exposure Management › Blast Zones" title="Blast Zones">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Blast Zones" value={String(zones.length)} />
        <Kpi tokens={tokens} label="Total Exposures" value={String(thesisExposures.length)} />
        <Kpi tokens={tokens} label="Open" value={String(thesisExposures.filter((e) => e.status === 'open').length)} accent={primitiveSignal.critical} />
        <Kpi tokens={tokens} label="Mitigated" value={String(thesisExposures.filter((e) => e.status === 'mitigated').length)} accent={primitiveSignal.success} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Zone Summary</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Zone', 'Exposures', 'Open', 'Worst Severity'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{zoneData.map((z) => (
              <tr key={z.zone} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{z.zone}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{z.count}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: z.open_count > 0 ? primitiveSignal.critical : tokens.text.secondary }}>{z.open_count}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: z.maxSeverity <= 2 ? primitiveSignal.critical : primitiveSignal.warning }}>{z.maxSeverity}/5</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{blastradiusCount} Blast Radius</span>
        </div>
      </section>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
