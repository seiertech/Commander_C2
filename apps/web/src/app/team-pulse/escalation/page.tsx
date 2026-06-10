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
 * Team Pulse — Escalation Queue
 *
 * Data: TeamPulseEntry from seed-pulse
 * Route: /team-pulse/escalation | Nav Group: Team Pulse | Status: BUILD
 * Shows escalation queue depth and time-since-closure per team.
 */

{/* AI-PLACEMENT: AICAP-PULSE-003 — Commander AI escalation routing recommendation */}

export default function TeamPulseEscalationPage() {
  const { mode, tokens } = useMode();

  const teams = thesisTeamPulse.filter((e) => e.level === 'team');
  const totalEscalationDepth = teams.reduce((acc, t) => acc + t.escalationQueueDepth, 0);
  const teamsWithEscalations = teams.filter((t) => t.escalationQueueDepth > 0).length;
  const avgHoursSinceClosure = teams.length > 0 ? Math.round(teams.reduce((acc, t) => acc + t.hoursSinceLastClosure, 0) / teams.length) : 0;

  const chartOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    colors: [primitiveData[5], primitiveData[2]],
    plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 0 } },
    xaxis: { categories: teams.map((t) => t.teamOrAnalyst), labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    yaxis: { labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    grid: { borderColor: tokens.border.subtle, strokeDashArray: 3 },
    legend: { labels: { colors: tokens.text.secondary }, fontSize: primitiveTypeScale.caption },
    dataLabels: { enabled: false },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
  };

  const chartSeries = [
    { name: 'Escalation Queue', data: teams.map((t) => t.escalationQueueDepth) },
    { name: 'Hrs Since Closure', data: teams.map((t) => t.hoursSinceLastClosure) },
  ];

  return (
    <PageContainer pretitle="Team Pulse › Escalation" title="Escalation Queue">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Total Queue Depth</span>
          <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: totalEscalationDepth > 0 ? primitiveSignal.warning : tokens.text.primary }}>{totalEscalationDepth}</span>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Teams with Escalations</span>
          <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{teamsWithEscalations} / {teams.length}</span>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Avg Hrs Since Closure</span>
          <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: avgHoursSinceClosure > 8 ? primitiveSignal.warning : tokens.text.primary }}>{avgHoursSinceClosure}h</span>
        </div>
      </section>

      {/* Escalation chart */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Escalation & Closure Metrics</h3>
        <Chart type="bar" height={240} options={chartOpts} series={chartSeries} />
      </div>

      {/* Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Escalation Detail</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Team', 'Queue Depth', 'Hrs Since Closure', 'Band', 'Open Cases'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => {
                const bandColor = t.workloadBand === 'red' ? primitiveSignal.critical : t.workloadBand === 'amber' ? primitiveSignal.warning : primitiveSignal.success;
                return (
                  <tr key={t.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{t.teamOrAnalyst}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: t.escalationQueueDepth > 0 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{t.escalationQueueDepth}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{t.hoursSinceLastClosure}h</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: bandColor }}>{t.workloadBand}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{t.openCases}</td>
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
