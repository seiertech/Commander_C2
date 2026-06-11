'use client';

import dynamic from 'next/dynamic';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal, primitiveData,
} from '../../../../../../packages/ui/src/tokens/primitives';
import type { ApexOptions } from 'apexcharts';
import { thesisExposures, thesisExposureEngine, thesisCases, thesisAssets, thesisRiskObjects, thesisBlastRadius, thesisConnectors, thesisPostures, thesisIdentities, thesisStrategies } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Exposure — CTEM Lifecycle
 *
 * Standard: Continuous Threat Exposure Management (Gartner CTEM)
 * Data: thesisExposures, thesisExposureEngine, thesisCases, thesisAssets, thesisRiskObjects
 * Route: /exposure/ctem | Nav Group: Exposure & CTEM | Status: BUILD
 *
 * CTEM 5-phase pipeline: Scoping → Discovery → Prioritisation → Validation → Mobilisation
 */

{/* AI-PLACEMENT: AICAP-CTEM-001 — Commander AI CTEM phase progression analysis */}

export default function ExposureCtemPage() {
  const { mode, tokens } = useMode();

  // CTEM phase mapping from exposure + case data
  const scopedAssets = thesisAssets.filter((a) => a.surface_attribution === 'external_attack_surface').length;
  const discoveredExposures = thesisExposures.length;
  const prioritisedRisks = thesisRiskObjects.filter((r) => r.treatment_state !== 'closed').length;
  const validationCases = thesisCases.filter((c) => c.ctem_phase === 'mobilization').length;
  const engineComputations = thesisExposureEngine.length;

  const avgExposureScore = thesisExposureEngine.length > 0
    ? Math.round(thesisExposureEngine.reduce((a, e) => a + e.exposureScore, 0) / thesisExposureEngine.length)
    : 0;

  const totalAttackPaths = thesisExposureEngine.reduce((a, e) => a + e.attackPathCount, 0);
  const totalCoverageGaps = thesisExposureEngine.reduce((a, e) => a + e.coverageGapCount, 0);

  // Chart: Exposure scores by surface type
  const chartOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    colors: thesisExposureEngine.map((e) => e.exposureScore > 70 ? primitiveSignal.critical : e.exposureScore > 40 ? primitiveSignal.warning : primitiveSignal.success),
    plotOptions: { bar: { horizontal: false, columnWidth: '60%', distributed: true } },
    xaxis: { categories: thesisExposureEngine.map((e) => `${e.surface_type} (${e.blastZoneId.slice(-8)})`), labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    yaxis: { max: 100, labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } }, title: { text: 'Exposure Score', style: { color: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    grid: { borderColor: tokens.border.subtle, strokeDashArray: 3 },
    legend: { show: false },
    dataLabels: { enabled: true, style: { fontSize: primitiveTypeScale.micro, colors: [tokens.text.secondary] } },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
  };

  const chartSeries = [{ name: 'Exposure Score', data: thesisExposureEngine.map((e) => e.exposureScore) }];

  return (
    <PageContainer pretitle="Exposure › CTEM" title="CTEM Exposure Lifecycle">
      {/* CTEM 5-Phase Summary */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <PhaseCard tokens={tokens} phase="1. Scoping" value={String(scopedAssets)} sub="External assets" accent={primitiveData[0]} />
        <PhaseCard tokens={tokens} phase="2. Discovery" value={String(discoveredExposures)} sub="Exposures found" accent={primitiveData[1]} />
        <PhaseCard tokens={tokens} phase="3. Prioritisation" value={String(prioritisedRisks)} sub="Open risk objects" accent={primitiveData[2]} />
        <PhaseCard tokens={tokens} phase="4. Validation" value={String(engineComputations)} sub="Engine computations" accent={primitiveData[3]} />
        <PhaseCard tokens={tokens} phase="5. Mobilisation" value={String(validationCases)} sub="Active cases" accent={primitiveData[4]} />
      </section>

      {/* Metrics strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Avg Exposure Score" value={`${avgExposureScore}/100`} accent={avgExposureScore > 60 ? primitiveSignal.critical : avgExposureScore > 30 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Attack Paths" value={String(totalAttackPaths)} accent={totalAttackPaths > 5 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Coverage Gaps" value={String(totalCoverageGaps)} accent={totalCoverageGaps > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Total Exposures" value={String(discoveredExposures)} />
      </section>

      {/* Chart */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Exposure Score by Surface</h3>
        <Chart type="bar" height={260} options={chartOpts} series={chartSeries} />
      </div>

      {/* Engine Detail Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Exposure Engine Computations</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Surface', 'Blast Zone', 'Score', 'Attack Paths', 'Gaps', 'Trend', 'Assets'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisExposureEngine.map((e) => {
                const sc = e.exposureScore > 70 ? primitiveSignal.critical : e.exposureScore > 40 ? primitiveSignal.warning : primitiveSignal.success;
                return (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{e.surface_type}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{e.blastZoneId}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: sc }}>{e.exposureScore}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{e.attackPathCount}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: e.coverageGapCount > 0 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{e.coverageGapCount}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{e.trend ?? '—'}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{e.assetRefs.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* Cross-Entity Relationship Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Blast Radius Impact</h4>
          {thesisBlastRadius.slice(0,3).map((b) => (
            <div key={b.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,14)}</span>
              <span style={{ color: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} pts → {b.affected_entities.length} entities</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Status</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3] }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'healthy').length} healthy</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.warning }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'degraded').length} degraded</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'critical').length} critical</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function PhaseCard({ tokens, phase, value, sub, accent }: { tokens: ReturnType<typeof useMode>['tokens']; phase: string; value: string; sub: string; accent: string }) {
  return (
    <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, borderTop: `3px solid ${accent}` }}>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: accent, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontWeight: primitiveFontWeight.semibold }}>{phase}</span>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary, marginTop: primitiveSpacing[1] }}>{value}</span>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{sub}</span>
    </div>
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
