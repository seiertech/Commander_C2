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
import { thesisDomainPulse } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Domain Pulse — Closure Blockers
 *
 * Data: DomainPulseEntry from seed-pulse
 * Route: /domain-pulse/closure-blockers | Nav Group: Domain Pulse | Status: BUILD
 * Shows domains with closure blockers preventing case resolution.
 */

{/* AI-PLACEMENT: AICAP-PULSE-006 — Commander AI closure blocker resolution suggestion */}

export default function DomainPulseClosureBlockersPage() {
  const { mode, tokens } = useMode();

  const totalBlockers = thesisDomainPulse.reduce((acc, d) => acc + d.closureBlockers, 0);
  const domainsBlocked = thesisDomainPulse.filter((d) => d.closureBlockers > 0).length;
  const mostBlocked = [...thesisDomainPulse].sort((a, b) => b.closureBlockers - a.closureBlockers)[0];

  const chartOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    colors: [primitiveData[4]],
    plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 0 } },
    xaxis: { categories: thesisDomainPulse.map((d) => d.domain), labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    yaxis: { labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    grid: { borderColor: tokens.border.subtle, strokeDashArray: 3 },
    dataLabels: { enabled: true, style: { fontSize: primitiveTypeScale.micro, colors: [tokens.text.secondary] } },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
  };

  const chartSeries = [{ name: 'Closure Blockers', data: thesisDomainPulse.map((d) => d.closureBlockers) }];

  const healthColor = (health: string) =>
    health === 'critical' ? primitiveSignal.critical : health === 'degraded' ? primitiveSignal.warning : primitiveSignal.success;

  return (
    <PageContainer pretitle="Domain Pulse › Closure Blockers" title="Closure Blockers">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Total Blockers</span>
          <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: totalBlockers > 0 ? primitiveSignal.warning : tokens.text.primary }}>{totalBlockers}</span>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Domains Blocked</span>
          <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{domainsBlocked}</span>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Most Blocked</span>
          <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{mostBlocked?.domain ?? '—'}</span>
        </div>
      </section>

      {/* Chart */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Blockers by Domain</h3>
        <Chart type="bar" height={220} options={chartOpts} series={chartSeries} />
      </div>

      {/* Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Domain Closure Detail</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Domain', 'Health', 'Blockers', 'Failed Validation', 'Risk Objects', 'MTTR (hrs)'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisDomainPulse.map((d) => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{d.domain}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: healthColor(d.health) }}>{d.health}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: d.closureBlockers > 0 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{d.closureBlockers}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: d.failedValidation > 0 ? primitiveSignal.critical : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{d.failedValidation}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{d.activeRiskObjects}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{d.meanResolutionHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
