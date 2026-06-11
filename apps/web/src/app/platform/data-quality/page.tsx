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
import { thesisRules, thesisModels, thesisAutomationRules, thesisFeatureRegistry, thesisSystemPulse, thesisConnectors, thesisBlastRadius, thesisRiskObjects, thesisExposures, thesisPostures, thesisAssets } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

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
    ? (thesisSystemPulse.reduce((acc, s) => acc + s.data_freshness_hours, 0) / thesisSystemPulse.length).toFixed(1)
    : '0';
  const avgErrorRate = thesisSystemPulse.length > 0
    ? (thesisSystemPulse.reduce((acc, s) => acc + s.error_rate, 0) / thesisSystemPulse.length).toFixed(1)
    : '0';

  // Model accuracy
  const avgModelAccuracy = Math.round(thesisModels.reduce((acc, m) => acc + m.accuracy, 0) / thesisModels.length);
  const avgFPR = (thesisModels.reduce((acc, m) => acc + m.false_positive_rate, 0) / thesisModels.length).toFixed(1);

  // Rule efficacy
  const activeRules = thesisRules.filter((r) => r.status === 'active').length;
  const suppressionRules = thesisRules.filter((r) => r.rule_type === 'suppression').length;

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
