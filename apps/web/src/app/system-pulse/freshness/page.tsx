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
 * System Pulse — Data Freshness
 *
 * Data: SystemPulseEntry from seed-pulse
 * Route: /system-pulse/freshness | Nav Group: System Pulse | Status: BUILD
 * Shows data freshness (hours since last ingestion) per subsystem.
 */

{/* AI-PLACEMENT: AICAP-PULSE-009 — Commander AI stale data alerting */}

export default function SystemPulseFreshnessPage() {
  const { mode, tokens } = useMode();

  const avgFreshness = thesisSystemPulse.length > 0
    ? (thesisSystemPulse.reduce((acc, s) => acc + s.data_freshness_hours, 0) / thesisSystemPulse.length).toFixed(1)
    : '0';
  const staleSubsystems = thesisSystemPulse.filter((s) => s.data_freshness_hours > 2).length;
  const freshest = [...thesisSystemPulse].sort((a, b) => a.data_freshness_hours - b.data_freshness_hours)[0];

  const chartOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    colors: thesisSystemPulse.map((s) => s.data_freshness_hours > 2 ? primitiveSignal.warning : primitiveData[1]),
    plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 0, distributed: true } },
    xaxis: { categories: thesisSystemPulse.map((s) => s.subsystem), labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    yaxis: { labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } }, title: { text: 'Hours', style: { color: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    grid: { borderColor: tokens.border.subtle, strokeDashArray: 3 },
    legend: { show: false },
    dataLabels: { enabled: true, style: { fontSize: primitiveTypeScale.micro, colors: [tokens.text.secondary] }, formatter: (v) => `${v}h` },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
  };

  const chartSeries = [{ name: 'Freshness (hrs)', data: thesisSystemPulse.map((s) => s.data_freshness_hours) }];

  return (
    <PageContainer pretitle="System Pulse › Freshness" title="Data Freshness">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Avg Freshness" value={`${avgFreshness}h`} accent={Number(avgFreshness) > 2 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Stale (>2h)" value={String(staleSubsystems)} accent={staleSubsystems > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Freshest" value={freshest?.subsystem ?? '—'} />
      </section>

      {/* Chart */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Hours Since Last Ingestion</h3>
        <Chart type="bar" height={240} options={chartOpts} series={chartSeries} />
      </div>

      {/* Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Subsystem Freshness Detail</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Subsystem', 'Health', 'Freshness (hrs)', 'Processing Rate', 'Queue Backlog'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisSystemPulse.map((s) => {
                const healthColor = s.health === 'offline' ? primitiveSignal.critical : s.health === 'degraded' ? primitiveSignal.warning : primitiveSignal.success;
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{s.subsystem}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: healthColor }}>{s.health}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: s.data_freshness_hours > 2 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{s.data_freshness_hours}h</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{s.processing_rate}/hr</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{s.queue_backlog}</td>
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
