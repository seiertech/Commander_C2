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
import { thesisTeamPulse } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Team Pulse — SLA Pressure
 *
 * Data: TeamPulseEntry from seed-pulse
 * Route: /team-pulse/sla | Nav Group: Team Pulse | Status: BUILD
 * Shows SLA breach distribution across teams and analysts.
 */

{/* AI-PLACEMENT: AICAP-PULSE-002 — Commander AI SLA breach prediction */}

export default function TeamPulseSlaPage() {
  const { mode, tokens } = useMode();

  const teams = thesisTeamPulse.filter((e) => e.level === 'team');
  const totalBreached = teams.reduce((acc, t) => acc + t.slaBreachedCases, 0);
  const atRiskTeams = teams.filter((t) => t.workloadBand !== 'green').length;

  const gaugeOpts: ApexOptions = {
    chart: { type: 'radialBar', background: 'transparent', sparkline: { enabled: true } },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    colors: teams.map((t) => t.slaBreachedCases > 0 ? primitiveSignal.critical : t.workloadBand === 'amber' ? primitiveSignal.warning : primitiveSignal.success),
    plotOptions: {
      radialBar: {
        startAngle: -135, endAngle: 135,
        hollow: { size: '50%' },
        track: { background: tokens.border.subtle, strokeWidth: '100%' },
        dataLabels: { name: { show: true, fontSize: primitiveTypeScale.micro, color: tokens.text.muted, offsetY: 20 }, value: { show: true, fontSize: primitiveTypeScale.h3, color: tokens.text.primary, fontFamily: primitiveFonts.mono, offsetY: -10, formatter: (v) => `${Math.round(Number(v))}%` } },
      },
    },
    labels: teams.map((t) => t.teamOrAnalyst),
    stroke: { lineCap: 'round' },
  };

  // SLA pressure % per team: (breached + at-risk) / open * 100
  const pressureSeries = teams.map((t) => t.openCases > 0 ? Math.round((t.slaBreachedCases / t.openCases) * 100) : 0);

  const barOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    colors: [primitiveSignal.critical, primitiveSignal.warning],
    plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 0 } },
    xaxis: { categories: teams.map((t) => t.teamOrAnalyst), labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    yaxis: { labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    grid: { borderColor: tokens.border.subtle, strokeDashArray: 3 },
    legend: { labels: { colors: tokens.text.secondary }, fontSize: primitiveTypeScale.caption },
    dataLabels: { enabled: false },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
  };

  const barSeries = [
    { name: 'SLA Breached', data: teams.map((t) => t.slaBreachedCases) },
    { name: 'High Priority (at risk)', data: teams.map((t) => t.highPriorityCases) },
  ];

  return (
    <PageContainer pretitle="Team Pulse › SLA Pressure" title="SLA Pressure Overview">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Total Breached</span>
          <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: totalBreached > 0 ? primitiveSignal.critical : tokens.text.primary }}>{totalBreached}</span>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Teams at Risk</span>
          <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: atRiskTeams > 0 ? primitiveSignal.warning : tokens.text.primary }}>{atRiskTeams}</span>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Avg SLA Pressure</span>
          <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{pressureSeries.length > 0 ? Math.round(pressureSeries.reduce((a, b) => a + b, 0) / pressureSeries.length) : 0}%</span>
        </div>
      </section>

      {/* SLA breach chart */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>SLA Breach by Team</h3>
        <Chart type="bar" height={240} options={barOpts} series={barSeries} />
      </div>

      {/* Detailed table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>SLA Detail</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Team', 'Open', 'Breached', 'Breach %', 'Band'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => {
                const pct = t.openCases > 0 ? Math.round((t.slaBreachedCases / t.openCases) * 100) : 0;
                const bandColor = t.workloadBand === 'red' ? primitiveSignal.critical : t.workloadBand === 'amber' ? primitiveSignal.warning : primitiveSignal.success;
                return (
                  <tr key={t.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{t.teamOrAnalyst}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{t.openCases}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: t.slaBreachedCases > 0 ? primitiveSignal.critical : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{t.slaBreachedCases}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{pct}%</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: bandColor }}>{t.workloadBand}</span></td>
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
