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
import { thesisModels } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Platform — Model Management
 *
 * Data: ModelDefinition from seed-platform
 * Route: /platform/models | Nav Group: Platform | Status: BUILD
 * Shows detection and scoring models with accuracy and false-positive metrics.
 */

{/* AI-PLACEMENT: AICAP-PLATFORM-002 — Commander AI model performance insight */}

export default function PlatformModelsPage() {
  const { mode, tokens } = useMode();

  const activeModels = thesisModels.filter((m) => m.status === 'active').length;
  const avgAccuracy = Math.round(thesisModels.reduce((acc, m) => acc + m.accuracy, 0) / thesisModels.length);
  const avgFPR = (thesisModels.reduce((acc, m) => acc + m.falsePositiveRate, 0) / thesisModels.length).toFixed(1);

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return primitiveSignal.success;
      case 'training': return primitiveSignal.info;
      case 'candidate': return primitiveSignal.warning;
      case 'retired': return primitiveSignal.neutral;
      default: return primitiveSignal.neutral;
    }
  };

  const chartOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    colors: [primitiveData[1], primitiveSignal.critical],
    plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 0 } },
    xaxis: { categories: thesisModels.map((m) => m.name), labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    yaxis: { labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    grid: { borderColor: tokens.border.subtle, strokeDashArray: 3 },
    legend: { labels: { colors: tokens.text.secondary }, fontSize: primitiveTypeScale.caption },
    dataLabels: { enabled: true, style: { fontSize: primitiveTypeScale.micro, colors: [tokens.text.secondary] } },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
  };

  const chartSeries = [
    { name: 'Accuracy %', data: thesisModels.map((m) => m.accuracy) },
    { name: 'False Positive %', data: thesisModels.map((m) => m.falsePositiveRate) },
  ];

  return (
    <PageContainer pretitle="Platform › Models" title="Model Management">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total Models" value={String(thesisModels.length)} />
        <KpiCard tokens={tokens} label="Active" value={String(activeModels)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Avg Accuracy" value={`${avgAccuracy}%`} accent={avgAccuracy >= 90 ? primitiveSignal.success : primitiveSignal.warning} />
        <KpiCard tokens={tokens} label="Avg FP Rate" value={`${avgFPR}%`} accent={Number(avgFPR) > 5 ? primitiveSignal.warning : undefined} />
      </section>

      {/* Chart */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Accuracy vs False Positive Rate</h3>
        <Chart type="bar" height={260} options={chartOpts} series={chartSeries} />
      </div>

      {/* Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Model Definitions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Name', 'Type', 'Status', 'Domain', 'Accuracy', 'FP Rate', 'Version', 'Last Evaluated'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisModels.map((m) => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{m.name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{m.modelType}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: statusColor(m.status) }}>{m.status}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{m.domain}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: m.accuracy >= 90 ? primitiveSignal.success : primitiveSignal.warning, fontFamily: primitiveFonts.mono }}>{m.accuracy}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: m.falsePositiveRate > 5 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{m.falsePositiveRate}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono }}>{m.version}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(m.lastEvaluatedAt).toLocaleDateString()}</td>
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
