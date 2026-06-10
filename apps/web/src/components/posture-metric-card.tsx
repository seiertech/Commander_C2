'use client';

/**
 * PostureMetricCard — Commander C2 (Unit 16b)
 *
 * KPI card for the posture/aggregate Command Centre rollup.
 * Displays: metric label, current value + unit, sparkline, threshold band
 * colouring, and trend indicator (▲ up / ▼ down / — flat).
 *
 * Strategy-sourced thresholds determine band colour; no hardcoded literals.
 * Source: Unit 16b deliverables, DS-1.0 §14 metric cards.
 */

import { useMode } from '@/context/mode-context';
import { Sparkline } from './sparkline';
import { componentTokens } from '../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale,
  primitiveSpacing,
  primitiveFontWeight,
  primitiveFonts,
  primitiveLetterSpacing,
  primitiveSignal,
} from '../../../../packages/ui/src/tokens/primitives';
import type {
  PostureMetricConfig,
  PostureMetricPeriodSnapshot,
  ThresholdBand,
  TrendDirection,
} from '../../../../packages/contracts/src/entities/posture-metrics-config';

interface PostureMetricCardProps {
  metric: PostureMetricConfig;
  /** Which period snapshot to display */
  activePeriod: PostureMetricPeriodSnapshot;
  /** Click handler for inline expansion */
  onExpand?: () => void;
}

/** Band → accent colour mapping */
const BAND_ACCENT: Record<ThresholdBand, string> = {
  green: primitiveSignal.success,
  amber: primitiveSignal.warning,
  red: primitiveSignal.critical,
};

/** Trend → indicator glyph */
const TREND_GLYPH: Record<TrendDirection, string> = {
  up: '▲',
  down: '▼',
  flat: '—',
};

/** Trend → colour (contextual: green for improvement, red for degradation) */
function getTrendColour(trend: TrendDirection, higherIsBetter: boolean): string {
  if (trend === 'flat') return primitiveSignal.neutral;
  const improving = (trend === 'up' && higherIsBetter) || (trend === 'down' && !higherIsBetter);
  return improving ? primitiveSignal.success : primitiveSignal.critical;
}

export function PostureMetricCard({ metric, activePeriod, onExpand }: PostureMetricCardProps) {
  const { tokens } = useMode();

  const { currentValue, previousValue, trend, history, band } = activePeriod;
  const delta = currentValue - previousValue;
  const deltaSign = delta >= 0 ? '+' : '';
  const trendColour = getTrendColour(trend, metric.higherIsBetter);
  const sparkData = history.map((p) => p.value);

  return (
    <div
      onClick={onExpand}
      role={onExpand ? 'button' : undefined}
      tabIndex={onExpand ? 0 : undefined}
      onKeyDown={onExpand ? (e) => { if (e.key === 'Enter' || e.key === ' ') onExpand(); } : undefined}
      aria-label={`${metric.label}: ${currentValue}${metric.unit}`}
      style={{
        background: tokens.surface.elevated,
        border: `1px solid ${tokens.border.default}`,
        borderLeft: `3px solid ${BAND_ACCENT[band]}`,
        padding: componentTokens.cardPadding,
        cursor: onExpand ? 'pointer' : 'default',
        transition: 'box-shadow 180ms ease-out',
      }}
    >
      {/* Label row */}
      <div style={{
        fontSize: primitiveTypeScale.micro,
        color: tokens.text.muted,
        textTransform: 'uppercase',
        letterSpacing: primitiveLetterSpacing.eyebrow,
        marginBottom: primitiveSpacing[1],
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {metric.label}
      </div>

      {/* Value + trend row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: primitiveSpacing[2], marginBottom: primitiveSpacing[2] }}>
        <span style={{
          fontSize: primitiveTypeScale.kpiValue,
          fontFamily: primitiveFonts.mono,
          fontWeight: primitiveFontWeight.bold,
          color: BAND_ACCENT[band],
          lineHeight: 1.1,
        }}>
          {currentValue}
          {metric.unit === '%' && <span style={{ fontSize: primitiveTypeScale.caption }}>%</span>}
        </span>
        <span style={{
          fontSize: primitiveTypeScale.micro,
          color: trendColour,
          fontWeight: primitiveFontWeight.semibold,
        }}>
          {TREND_GLYPH[trend]} {deltaSign}{delta.toFixed(1)}
        </span>
      </div>

      {/* Sparkline */}
      <Sparkline data={sparkData} band={band} />
    </div>
  );
}
