'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisConnectors, thesisSystemPulse, thesisSignals } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Coverage — Telemetry Coverage
 *
 * Standard: OCSF (telemetry class coverage)
 * Data: thesisConnectors (data sources), thesisSystemPulse (ingestion health),
 *       thesisSignals (signal class coverage)
 * Route: /coverage/telemetry | Nav Group: Coverage | Status: BUILD
 *
 * Shows telemetry source map: which OCSF classes are covered by active connectors.
 */

{/* AI-PLACEMENT: AICAP-TELEMETRY-001 — Commander AI telemetry gap analysis */}

export default function CoverageTelemetryPage() {
  const { tokens } = useMode();

  const activeConnectors = thesisConnectors.filter((c) => c.state === 'active');
  const totalIngestionRate = thesisSystemPulse.reduce((a, s) => a + s.processing_rate, 0);
  const ocsf_classes = [...new Set(thesisSignals.map((s) => s.ocsf_class))];
  const ocsf_categories = [...new Set(thesisSignals.map((s) => s.ocsf_category))];

  return (
    <PageContainer pretitle="Coverage › Telemetry" title="Telemetry Coverage (OCSF)">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Active Sources" value={String(activeConnectors.length)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Ingestion Rate" value={`${totalIngestionRate}/hr`} />
        <KpiCard tokens={tokens} label="OCSF Classes" value={String(ocsf_classes.length)} />
        <KpiCard tokens={tokens} label="OCSF Categories" value={String(ocsf_categories.length)} />
      </section>

      {/* OCSF Class Coverage */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>OCSF Class Coverage</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: primitiveSpacing[3] }}>
          {ocsf_classes.map((cls) => {
            const count = thesisSignals.filter((s) => s.ocsf_class === cls).length;
            return (
              <div key={cls} style={{ padding: primitiveSpacing[3], background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, borderLeft: `3px solid ${primitiveSignal.success}` }}>
                <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{cls}</span>
                <span style={{ fontSize: primitiveTypeScale.h4, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{count} signals</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connector telemetry detail */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Source Telemetry Health</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Subsystem', 'Health', 'Processing Rate', 'Freshness', 'Queue'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisSystemPulse.map((s) => {
                const hc = s.health === 'operational' || s.health === 'healthy' ? primitiveSignal.success : s.health === 'degraded' ? primitiveSignal.warning : primitiveSignal.critical;
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{s.subsystem}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: hc }}>{s.health}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{s.processing_rate}/hr</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: s.data_freshness_hours > 2 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{s.data_freshness_hours}h</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{s.queue_backlog}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

function KpiCard({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span>
    </div>
  );
}
