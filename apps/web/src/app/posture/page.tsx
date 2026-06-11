'use client';

/**
 * Posture — Aggregate Command Centre (Thesis §9 — Asset Security Posture)
 *
 * 12 posture metric KPI cards in a 4×3 grid with time-range toggle and
 * inline expansion for detail. Pattern A: PageContainer + seed fixture sourcing.
 *
 * Data: PostureMetricConfig from seed-posture-metrics + thesis Asset_Security_Posture
 * Route: /posture | Nav Group: Command Centre | Status: BUILD
 * Use Case: UC-POSTURE-001, UC-POSTURE-002
 * Entities: Asset_Security_Posture, Posture_Dimension (L5)
 * Standards: NIST CSF 2.0
 */

import { useState } from 'react';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { PostureMetricCard } from '@/components/posture-metric-card';
import { TimeRangeToggle } from '@/components/time-range-toggle';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale,
  primitiveSpacing,
  primitiveFontWeight,
  primitiveFonts,
  primitiveSignal,
  primitiveLetterSpacing,
} from '../../../../../packages/ui/src/tokens/primitives';
import type { PostureTimePeriod, PostureMetricConfig } from '../../../../../packages/contracts/src/entities/posture-metrics-config';
import { thesisPostureMetrics, thesisPostureAccountability, thesisCases, thesisBlastRadius, thesisRiskObjects, thesisExposures, thesisConnectors, thesisAssets } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

export default function PosturePage() {
  const { tokens } = useMode();
  const [activePeriod, setActivePeriod] = useState<PostureTimePeriod>('24h');
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  /** Get the period snapshot for a metric */
  function getActivePeriodSnapshot(metric: PostureMetricConfig) {
    return metric.periods.find((p) => p.period === activePeriod) ?? metric.periods[0];
  }

  /** Toggle metric expansion */
  function handleExpand(metricKey: string) {
    setExpandedMetric((prev) => (prev === metricKey ? null : metricKey));
  }

  return (
    <PageContainer
      pretitle="Command Centre"
      title="Security Posture"
      headerActions={<TimeRangeToggle activePeriod={activePeriod} onChange={setActivePeriod} />}
    >
      {/* 4×3 metric grid */}
      {/* Cross-Entity Governance Panel — Sweep 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Blast Radius</h4>
          {thesisBlastRadius.map((b) => (<div key={b.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,14)}</span><span style={{ color: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} → {b.affected_entities.length}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Risk Objects ({thesisRiskObjects.length})</h4>
          {thesisRiskObjects.map((r) => (<div key={r.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ color: tokens.text.primary }}>{r.type.replace(/_/g, ' ')}</span><span style={{ padding: '1px 6px', color: '#fff', background: r.treatment_state === 'open' ? primitiveSignal.warning : primitiveSignal.success }}>{r.treatment_state}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Linked Cases</h4>
          {thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1').slice(0,5).map((c) => (<div key={c.case_id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{c.case_id.slice(0,12)}</span><span style={{ padding: '1px 6px', color: '#fff', background: c.priority === 'P0' ? primitiveSignal.critical : primitiveSignal.warning }}>{c.priority} · {c.ooda_state}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Exposures ({thesisExposures.length})</h4>
          {thesisExposures.slice(0,3).map((e) => (<div key={e.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ color: tokens.text.primary }}>{e.exposure_type ?? e.surface ?? 'exposure'}</span><span style={{ color: e.severity === 'critical' ? primitiveSignal.critical : primitiveSignal.warning }}>{e.severity ?? 'medium'}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Data Sources</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisConnectors.filter((c) => c.state === 'active').length} active</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisConnectors.filter((c) => c.state === 'error').length} error</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
