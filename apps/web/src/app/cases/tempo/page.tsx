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
import { thesisCases, thesisEvents, thesisActions, thesisTeamPulse, thesisRiskObjects, thesisBlastRadius, thesisExposures, thesisPostures, thesisConnectors } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Cases — OODA Command Tempo
 *
 * Standard: OODA Loop (Boyd)
 * Data: thesisCases (ooda_state), thesisEvents (observe triggers),
 *       thesisActions (act outputs), thesisTeamPulse (team velocity)
 * Route: /cases/tempo | Nav Group: Case Management | Status: BUILD
 *
 * Visualises the OODA loop velocity — how fast the organisation moves
 * through Observe → Orient → Decide → Act for active cases.
 */

{/* AI-PLACEMENT: AICAP-TEMPO-001 — Commander AI OODA tempo optimisation */}

export default function CasesTempoPage() {
  const { mode, tokens } = useMode();

  // OODA state distribution
  const oodaDistribution = {
    observe: thesisCases.filter((c) => c.ooda_state === 'observe').length,
    orient: thesisCases.filter((c) => c.ooda_state === 'orient').length,
    decide: thesisCases.filter((c) => c.ooda_state === 'decide').length,
    act: thesisCases.filter((c) => c.ooda_state === 'act').length,
  };

  const totalActive = Object.values(oodaDistribution).reduce((a, b) => a + b, 0);
  const bottleneckPhase = Object.entries(oodaDistribution).sort((a, b) => b[1] - a[1])[0];
  const teamTotalOpen = thesisTeamPulse.reduce((a, t) => a + t.open_cases, 0);
  const eventVolume = thesisEvents.length;
  const actionRate = thesisActions.filter((a) => a.status === 'completed').length;

  const donutOpts: ApexOptions = {
    chart: { type: 'donut', background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    labels: ['Observe', 'Orient', 'Decide', 'Act'],
    colors: [primitiveData[0], primitiveData[1], primitiveData[2], primitiveData[3]],
    legend: { position: 'bottom', labels: { colors: tokens.text.secondary }, fontSize: primitiveTypeScale.caption },
    dataLabels: { enabled: true, style: { fontSize: primitiveTypeScale.caption } },
    plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'Cases', color: tokens.text.muted } } } } },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
  };

  const donutSeries = [oodaDistribution.observe, oodaDistribution.orient, oodaDistribution.decide, oodaDistribution.act];

  const barOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    colors: [primitiveData[4]],
    plotOptions: { bar: { horizontal: true, barHeight: '60%' } },
    xaxis: { categories: thesisTeamPulse.map((t) => t.team_or_analyst), labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    yaxis: { labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    grid: { borderColor: tokens.border.subtle, strokeDashArray: 3 },
    dataLabels: { enabled: true, style: { fontSize: primitiveTypeScale.micro, colors: [tokens.text.secondary] } },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
  };

  const barSeries = [{ name: 'Open Cases', data: thesisTeamPulse.map((t) => t.open_cases) }];

  return (
    <PageContainer pretitle="Cases › OODA Tempo" title="OODA Command Tempo">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Active Cases" value={String(totalActive)} />
        <KpiCard tokens={tokens} label="Observe" value={String(oodaDistribution.observe)} accent={primitiveData[0]} />
        <KpiCard tokens={tokens} label="Orient" value={String(oodaDistribution.orient)} accent={primitiveData[1]} />
        <KpiCard tokens={tokens} label="Decide" value={String(oodaDistribution.decide)} accent={primitiveData[2]} />
        <KpiCard tokens={tokens} label="Act" value={String(oodaDistribution.act)} accent={primitiveData[3]} />
        <KpiCard tokens={tokens} label="Bottleneck" value={bottleneckPhase[0].toUpperCase()} accent={primitiveSignal.warning} />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        {/* OODA Loop Distribution */}
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>OODA Phase Distribution</h3>
          <Chart type="donut" height={280} options={donutOpts} series={donutSeries} />
        </div>

        {/* Team Velocity */}
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Team Case Load</h3>
          <Chart type="bar" height={280} options={barOpts} series={barSeries} />
        </div>
      </div>

      {/* Tempo Metrics */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Signal Volume (Events)" value={String(eventVolume)} />
        <KpiCard tokens={tokens} label="Actions Completed" value={String(actionRate)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Team Queue Total" value={String(teamTotalOpen)} accent={teamTotalOpen > 20 ? primitiveSignal.warning : undefined} />
      </section>

      {/* Case OODA Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Active Cases by OODA State</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Case ID', 'Priority', 'OODA State', 'ITIL Stage', 'Team', 'Urgency'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisCases.slice(0, 15).map((c) => {
                const oodaColor = c.ooda_state === 'observe' ? primitiveData[0] : c.ooda_state === 'orient' ? primitiveData[1] : c.ooda_state === 'decide' ? primitiveData[2] : primitiveData[3];
                return (
                  <tr key={c.case_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold, fontFamily: primitiveFonts.mono }}>{c.case_id.slice(0, 12)}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: c.priority === 'P0' ? primitiveSignal.critical : c.priority === 'P1' ? primitiveSignal.warning : primitiveSignal.neutral }}>{c.priority}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: oodaColor }}>{c.ooda_state}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{c.itil_stage}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{c.owner_team}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: c.urgency === 'critical' ? primitiveSignal.critical : tokens.text.muted }}>{c.urgency}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* Cross-Entity + Engine Panel — Sweep 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Blast Radius Engine</h4>
          {thesisBlastRadius.map((b) => (<div key={b.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,14)} ({b.originEntityType})</span><span style={{ color: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} pts → {b.affected_entities.length} affected</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Active Risk Objects ({thesisRiskObjects.filter((r) => r.treatment_state === 'open').length} open)</h4>
          {thesisRiskObjects.map((r) => (<div key={r.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ color: tokens.text.primary }}>{r.type.replace(/_/g, ' ')}</span><span style={{ padding: '1px 6px', color: '#fff', background: r.treatment_state === 'open' ? primitiveSignal.warning : primitiveSignal.success }}>{r.treatment_state}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Impact</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'healthy').length} healthy</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.warning }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'degraded').length} degraded</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'critical').length} critical</span>
          </div>
          <div style={{ marginTop: primitiveSpacing[2], fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>Avg: {Math.round(thesisPostures.reduce((a,p) => a + p.posture_score, 0) / Math.max(thesisPostures.length, 1))}/100</div>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Exposure Surface ({thesisExposures.length})</h4>
          {thesisExposures.slice(0,4).map((e) => (<div key={e.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ color: tokens.text.primary }}>{e.exposure_type ?? e.surface ?? 'exposure'}</span><span style={{ color: e.severity === 'critical' ? primitiveSignal.critical : primitiveSignal.warning }}>{e.severity ?? 'medium'}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Data Pipeline</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisConnectors.filter((c) => c.state === 'active').length} active</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisConnectors.filter((c) => c.state === 'error').length} error</span>
          </div>
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
