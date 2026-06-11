'use client';

import dynamic from 'next/dynamic';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal, primitiveData,
} from '../../../../../packages/ui/src/tokens/primitives';
import type { ApexOptions } from 'apexcharts';
import { thesisDomainPulse, thesisRiskObjects } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Domain Pulse — Overview
 *
 * Data: DomainPulseEntry from seed-pulse
 * Route: /domain-pulse | Nav Group: Domain Pulse | Status: BUILD
 * Shows health across all security domains with key metrics.
 */

{/* AI-PLACEMENT: AICAP-PULSE-004 — Commander AI domain health correlation */}

export default function DomainPulseOverviewPage() {
  const { mode, tokens } = useMode();

  const totalDomains = thesisDomainPulse.length;
  const healthyCount = thesisDomainPulse.filter((d) => d.health === 'healthy').length;
  const degradedCount = thesisDomainPulse.filter((d) => d.health === 'degraded').length;
  const criticalCount = thesisDomainPulse.filter((d) => d.health === 'critical').length;
  const totalRiskObjects = thesisDomainPulse.reduce((acc, d) => acc + d.active_risk_objects, 0);
  const avgResolution = Math.round(thesisDomainPulse.reduce((acc, d) => acc + d.mean_resolution_hours, 0) / totalDomains);

  const healthColor = (health: string) =>
    health === 'critical' ? primitiveSignal.critical : health === 'degraded' ? primitiveSignal.warning : primitiveSignal.success;

  const radarOpts: ApexOptions = {
    chart: { type: 'radar', toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    colors: [primitiveData[1], primitiveData[3]],
    xaxis: { categories: thesisDomainPulse.map((d) => d.domain) },
    yaxis: { show: false },
    grid: { show: false },
    legend: { labels: { colors: tokens.text.secondary }, fontSize: primitiveTypeScale.caption },
    dataLabels: { enabled: false },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
    stroke: { width: 2 },
    fill: { opacity: 0.25 },
  };

  const radarSeries = [
    { name: 'Risk Objects', data: thesisDomainPulse.map((d) => d.active_risk_objects) },
    { name: 'Closure Blockers', data: thesisDomainPulse.map((d) => d.closure_blockers) },
  ];

  return (
    <PageContainer pretitle="Domain Pulse" title="Domain Health Overview">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Domains" value={String(totalDomains)} />
        <KpiCard tokens={tokens} label="Healthy" value={String(healthyCount)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Degraded" value={String(degradedCount)} accent={degradedCount > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Critical" value={String(criticalCount)} accent={criticalCount > 0 ? primitiveSignal.critical : undefined} />
        <KpiCard tokens={tokens} label="Risk Objects" value={String(totalRiskObjects)} />
      </section>

      {/* Radar chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Domain Risk Profile</h3>
          <Chart type="radar" height={280} options={radarOpts} series={radarSeries} />
        </div>

        {/* Resolution time chart */}
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Mean Resolution (Hours)</h3>
          <Chart type="bar" height={280} options={{
            chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body },
            theme: { mode: mode === 'mission' ? 'dark' : 'light' },
            colors: [primitiveData[2]],
            plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 0 } },
            xaxis: { categories: thesisDomainPulse.map((d) => d.domain), labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
            yaxis: { labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
            grid: { borderColor: tokens.border.subtle, strokeDashArray: 3 },
            dataLabels: { enabled: true, style: { fontSize: primitiveTypeScale.micro, colors: [tokens.text.secondary] }, formatter: (v) => `${v}h` },
            tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
          }} series={[{ name: 'Avg Resolution', data: thesisDomainPulse.map((d) => d.mean_resolution_hours) }]} />
        </div>
      </div>

      {/* Domain table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Domain Status</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Domain', 'Health', 'Pending Validation', 'Failed Validation', 'Closure Blockers', 'Risk Objects', 'MTTR (hrs)'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisDomainPulse.map((d) => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{d.domain}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: healthColor(d.health) }}>{d.health}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{d.pending_validation}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: d.failed_validation > 0 ? primitiveSignal.critical : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{d.failed_validation}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: d.closure_blockers > 0 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{d.closure_blockers}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{d.active_risk_objects}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{d.mean_resolution_hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{riskobjectsCount} Risk Objects</span>
        </div>
      </section>
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
