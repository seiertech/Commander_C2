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
import { thesisRules, thesisModels, thesisAutomationRules, thesisFeatureRegistry, thesisSystemPulse } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Platform — Data Quality
 *
 * Data: Aggregate view from seed-platform + seed-pulse (system health)
 * Route: /platform/data-quality | Nav Group: Platform | Status: BUILD
 * Shows platform-wide data quality indicators: freshness, error rates, model accuracy, rule efficacy.
 */

{/* AI-PLACEMENT: AICAP-PLATFORM-005 — Commander AI data quality improvement recommendation */}

export default function PlatformDataQualityPage() {
  const { mode, tokens } = useMode();

  // Freshness from system pulse
  const avgFreshness = thesisSystemPulse.length > 0
    ? (thesisSystemPulse.reduce((acc, s) => acc + s.dataFreshnessHours, 0) / thesisSystemPulse.length).toFixed(1)
    : '0';
  const avgErrorRate = thesisSystemPulse.length > 0
    ? (thesisSystemPulse.reduce((acc, s) => acc + s.errorRate, 0) / thesisSystemPulse.length).toFixed(1)
    : '0';

  // Model accuracy
  const avgModelAccuracy = Math.round(thesisModels.reduce((acc, m) => acc + m.accuracy, 0) / thesisModels.length);
  const avgFPR = (thesisModels.reduce((acc, m) => acc + m.falsePositiveRate, 0) / thesisModels.length).toFixed(1);

  // Rule efficacy
  const activeRules = thesisRules.filter((r) => r.status === 'active').length;
  const suppressionRules = thesisRules.filter((r) => r.ruleType === 'suppression').length;

  // Platform completeness
  const totalEntities = thesisRules.length + thesisModels.length + thesisAutomationRules.length + thesisFeatureRegistry.length;
  const enabledFeatures = thesisFeatureRegistry.filter((f) => f.state === 'enabled').length;

  const gaugeOpts: ApexOptions = {
    chart: { type: 'radialBar', background: 'transparent', sparkline: { enabled: true } },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    plotOptions: {
      radialBar: {
        startAngle: -135, endAngle: 135,
        hollow: { size: '55%' },
        track: { background: tokens.border.subtle, strokeWidth: '100%' },
        dataLabels: { name: { show: true, fontSize: primitiveTypeScale.micro, color: tokens.text.muted, offsetY: 20 }, value: { show: true, fontSize: primitiveTypeScale.h3, color: tokens.text.primary, fontFamily: primitiveFonts.mono, offsetY: -10 } },
      },
    },
    stroke: { lineCap: 'round' },
  };

  const qualityScore = Math.round(
    (avgModelAccuracy * 0.4) +
    ((100 - Number(avgFPR)) * 0.2) +
    ((100 - Math.min(Number(avgErrorRate) * 10, 100)) * 0.2) +
    ((100 - Math.min(Number(avgFreshness) * 20, 100)) * 0.2)
  );

  return (
    <PageContainer pretitle="Platform › Data Quality" title="Data Quality Overview">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Quality Score" value={`${qualityScore}%`} accent={qualityScore >= 85 ? primitiveSignal.success : qualityScore >= 70 ? primitiveSignal.warning : primitiveSignal.critical} />
        <KpiCard tokens={tokens} label="Avg Freshness" value={`${avgFreshness}h`} accent={Number(avgFreshness) > 2 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Error Rate" value={`${avgErrorRate}%`} accent={Number(avgErrorRate) > 3 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Model Accuracy" value={`${avgModelAccuracy}%`} accent={avgModelAccuracy >= 90 ? primitiveSignal.success : primitiveSignal.warning} />
      </section>

      {/* Quality gauge and breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}`, alignSelf: 'flex-start' }}>Overall Quality</h3>
          <Chart type="radialBar" height={200} options={{ ...gaugeOpts, colors: [qualityScore >= 85 ? primitiveSignal.success : qualityScore >= 70 ? primitiveSignal.warning : primitiveSignal.critical], labels: ['Quality'] }} series={[qualityScore]} />
        </div>

        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Quality Dimensions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: primitiveSpacing[3] }}>
            <QualityDimension tokens={tokens} label="Data Freshness" value={`${avgFreshness}h avg`} status={Number(avgFreshness) <= 1 ? 'good' : Number(avgFreshness) <= 2 ? 'fair' : 'poor'} />
            <QualityDimension tokens={tokens} label="Processing Errors" value={`${avgErrorRate}% avg`} status={Number(avgErrorRate) <= 1 ? 'good' : Number(avgErrorRate) <= 3 ? 'fair' : 'poor'} />
            <QualityDimension tokens={tokens} label="Model Accuracy" value={`${avgModelAccuracy}%`} status={avgModelAccuracy >= 90 ? 'good' : avgModelAccuracy >= 80 ? 'fair' : 'poor'} />
            <QualityDimension tokens={tokens} label="False Positives" value={`${avgFPR}% avg`} status={Number(avgFPR) <= 3 ? 'good' : Number(avgFPR) <= 7 ? 'fair' : 'poor'} />
            <QualityDimension tokens={tokens} label="Active Rules" value={`${activeRules}/${thesisRules.length}`} status={activeRules >= thesisRules.length * 0.7 ? 'good' : 'fair'} />
            <QualityDimension tokens={tokens} label="Feature Coverage" value={`${enabledFeatures}/${thesisFeatureRegistry.length}`} status={enabledFeatures >= thesisFeatureRegistry.length * 0.5 ? 'good' : 'fair'} />
          </div>
        </div>
      </div>

      {/* Platform entity counts summary */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Platform Entity Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap }}>
          <SummaryItem tokens={tokens} label="Rules" value={thesisRules.length} sublabel={`${activeRules} active, ${suppressionRules} suppression`} />
          <SummaryItem tokens={tokens} label="Models" value={thesisModels.length} sublabel={`${thesisModels.filter((m) => m.status === 'active').length} active`} />
          <SummaryItem tokens={tokens} label="Automation" value={thesisAutomationRules.length} sublabel={`${thesisAutomationRules.filter((a) => a.status === 'active').length} active`} />
          <SummaryItem tokens={tokens} label="Features" value={thesisFeatureRegistry.length} sublabel={`${enabledFeatures} enabled`} />
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

function QualityDimension({ tokens, label, value, status }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; status: 'good' | 'fair' | 'poor' }) {
  const color = status === 'good' ? primitiveSignal.success : status === 'fair' ? primitiveSignal.warning : primitiveSignal.critical;
  return (
    <div style={{ padding: primitiveSpacing[2], border: `1px solid ${tokens.border.subtle}` }}>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: primitiveSpacing[1] }}>
        <span style={{ fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{value}</span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      </div>
    </div>
  );
}

function SummaryItem({ tokens, label, value, sublabel }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: number; sublabel: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.h2, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{value}</span>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.caption, color: tokens.text.secondary, fontWeight: primitiveFontWeight.semibold }}>{label}</span>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{sublabel}</span>
    </div>
  );
}
