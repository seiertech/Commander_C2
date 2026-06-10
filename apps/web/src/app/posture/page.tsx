'use client';

/**
 * Posture — Aggregate Command Centre (Unit 16b)
 *
 * 12 posture metric KPI cards in a 4×3 grid with time-range toggle and
 * inline expansion for detail. Pattern A: PageContainer + seed fixture sourcing.
 *
 * Data: PostureMetricConfig from seed-posture-metrics
 * Route: /posture | Nav Group: Command Centre | Status: BUILD
 * Source: Unit 16b deliverables, Spec #65/#66, MP §24.
 *
 * Strategy values consumed from fixture thresholds — no hardcoded literals.
 */

import { useState } from 'react';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { PostureMetricCard } from '@/components/posture-metric-card';
import { TimeRangeToggle } from '@/components/time-range-toggle';
import { seedPostureMetrics } from '../../../../../packages/contracts/src/fixtures/seed-posture-metrics';
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
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: componentTokens.gridGap,
          marginBottom: componentTokens.gridGap,
        }}
      >
        {seedPostureMetrics.map((metric) => (
          <div key={metric.metricKey}>
            <PostureMetricCard
              metric={metric}
              activePeriod={getActivePeriodSnapshot(metric)}
              onExpand={() => handleExpand(metric.metricKey)}
            />

            {/* Inline expansion panel */}
            {expandedMetric === metric.metricKey && (
              <div
                style={{
                  marginTop: primitiveSpacing[1],
                  background: tokens.surface.elevated,
                  border: `1px solid ${tokens.border.default}`,
                  padding: componentTokens.cardPadding,
                }}
              >
                <h4 style={{
                  fontSize: primitiveTypeScale.caption,
                  fontWeight: primitiveFontWeight.semibold,
                  color: tokens.text.primary,
                  margin: `0 0 ${primitiveSpacing[2]}`,
                }}>
                  {metric.label} — Detail
                </h4>

                {/* Period comparison table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.micro }}>
                  <thead>
                    <tr>
                      {['Period', 'Current', 'Previous', 'Delta', 'Trend', 'Band'].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: 'left',
                            padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`,
                            borderBottom: `1px solid ${tokens.border.default}`,
                            color: tokens.text.muted,
                            fontWeight: primitiveFontWeight.semibold,
                            textTransform: 'uppercase',
                            letterSpacing: primitiveLetterSpacing.eyebrow,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metric.periods.map((p) => {
                      const delta = p.currentValue - p.previousValue;
                      const bandColour = p.band === 'green' ? primitiveSignal.success : p.band === 'amber' ? primitiveSignal.warning : primitiveSignal.critical;
                      return (
                        <tr key={p.period} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                          <td style={{ padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{p.period.toUpperCase()}</td>
                          <td style={{ padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, fontFamily: primitiveFonts.mono, color: tokens.text.secondary }}>{p.currentValue}{metric.unit === '%' ? '%' : ''}</td>
                          <td style={{ padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, fontFamily: primitiveFonts.mono, color: tokens.text.muted }}>{p.previousValue}{metric.unit === '%' ? '%' : ''}</td>
                          <td style={{ padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, fontFamily: primitiveFonts.mono, color: delta >= 0 ? primitiveSignal.success : primitiveSignal.critical }}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}</td>
                          <td style={{ padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, color: tokens.text.secondary }}>{p.trend === 'up' ? '▲' : p.trend === 'down' ? '▼' : '—'}</td>
                          <td style={{ padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}` }}><span style={{ padding: '1px 6px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: bandColour, borderRadius: '2px' }}>{p.band}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Threshold reference */}
                <div style={{ marginTop: primitiveSpacing[2], fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>
                  Strategy: <strong>{metric.thresholds.strategySurface}</strong> (policy: {metric.thresholds.policyId}) —
                  Green ≥ {metric.thresholds.green}, Amber ≥ {metric.thresholds.amber}
                  {!metric.higherIsBetter && ' (lower is better — thresholds inverted)'}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </PageContainer>
  );
}
