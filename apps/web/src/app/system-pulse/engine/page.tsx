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
import { thesisSystemPulse } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * System Pulse — Engine Health
 *
 * Data: SystemPulseEntry from seed-pulse
 * Route: /system-pulse/engine | Nav Group: System Pulse | Status: BUILD
 * Shows engine/subsystem health status and error rates.
 */

{/* AI-PLACEMENT: AICAP-PULSE-007 — Commander AI engine anomaly detection */}

export default function SystemPulseEnginePage() {
  const { mode, tokens } = useMode();

  const operational = thesisSystemPulse.filter((s) => s.health === 'operational').length;
  const degraded = thesisSystemPulse.filter((s) => s.health === 'degraded').length;
  const offline = thesisSystemPulse.filter((s) => s.health === 'offline').length;
  const avgErrorRate = thesisSystemPulse.length > 0
    ? (thesisSystemPulse.reduce((acc, s) => acc + s.errorRate, 0) / thesisSystemPulse.length).toFixed(1)
    : '0';

  const healthColor = (h: string) =>
    h === 'offline' ? primitiveSignal.critical : h === 'degraded' ? primitiveSignal.warning : primitiveSignal.success;

  const chartOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    colors: [primitiveData[1], primitiveSignal.critical],
    plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 0 } },
    xaxis: { categories: thesisSystemPulse.map((s) => s.subsystem), labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro }, rotate: -30 } },
    yaxis: [
      { title: { text: 'Items/hr', style: { color: tokens.text.muted, fontSize: primitiveTypeScale.micro } }, labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
      { opposite: true, title: { text: 'Error %', style: { color: tokens.text.muted, fontSize: primitiveTypeScale.micro } }, labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    ],
    grid: { borderColor: tokens.border.subtle, strokeDashArray: 3 },
    legend: { labels: { colors: tokens.text.secondary }, fontSize: primitiveTypeScale.caption },
    dataLabels: { enabled: false },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
  };

  const chartSeries = [
    { name: 'Processing Rate', data: thesisSystemPulse.map((s) => s.processingRate) },
    { name: 'Error Rate %', data: thesisSystemPulse.map((s) => s.errorRate) },
  ];

  return (
    <PageContainer pretitle="System Pulse › Engine" title="Engine Health">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Operational" value={String(operational)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Degraded" value={String(degraded)} accent={degraded > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Offline" value={String(offline)} accent={offline > 0 ? primitiveSignal.critical : undefined} />
        <KpiCard tokens={tokens} label="Avg Error Rate" value={`${avgErrorRate}%`} accent={Number(avgErrorRate) > 3 ? primitiveSignal.warning : undefined} />
      </section>

      {/* Chart */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Processing Rate & Error Rate</h3>
        <Chart type="bar" height={260} options={chartOpts} series={chartSeries} />
      </div>

      {/* Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Subsystem Detail</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Subsystem', 'Health', 'Processing Rate', 'Error Rate', 'Queue Backlog', 'Freshness (hrs)'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisSystemPulse.map((s) => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{s.subsystem}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: healthColor(s.health) }}>{s.health}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{s.processingRate}/hr</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: s.errorRate > 3 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{s.errorRate}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: s.queueBacklog > 10 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{s.queueBacklog}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{s.dataFreshnessHours}</td>
                </tr>
              ))}
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
