/**
 * Instrument Gauge — Commander SDR (DS-1.0)
 *
 * Circular scored-metric gauge. Commander signature element.
 * - Standard mode: clean arc with value, /scale, label, threshold colour.
 * - Mission mode: dark instrument-cluster with tick marks, needle, glow on active range.
 * - Meaning NEVER by colour alone (always value + label + position).
 *
 * DS-1.0 §13 Gauge spec: value, threshold bands (red→amber→green), numeric label,
 * meaning without colour alone (label + position).
 * DS-1.0 §21: Gauges are a primary signature, not a minor chart type.
 *
 * Source: DESIGN_SYSTEM.md §13, §21; mockup: command-centre-mission.png, case-handling-dashboard.png
 */

import { primitiveSignal, primitiveGlow, primitiveFonts, primitiveTypeScale } from '../tokens/primitives';
import { componentTokens } from '../tokens/components';
import type { WorkspaceMode } from '../tokens/semantic';
import { getSemanticTokens } from '../tokens/semantic';

export interface GaugeData {
  /** Current value */
  value: number;
  /** Maximum scale value */
  max: number;
  /** Label describing what this gauge measures */
  label: string;
  /** Unit (e.g. "%", "/100", "ms") */
  unit?: string;
  /** Threshold bands: [critical-end, warning-end, success-end] as fractions of max */
  thresholds?: { critical: number; warning: number; success: number };
}

export interface GaugeStyles {
  container: Record<string, string>;
  valueText: Record<string, string>;
  labelText: Record<string, string>;
  arc: {
    critical: string;
    warning: string;
    success: string;
    track: string;
  };
  needle: Record<string, string>;
}

export function getGaugeStyles(mode: WorkspaceMode): GaugeStyles {
  const tokens = getSemanticTokens(mode);

  return {
    container: {
      width: '160px',
      height: '160px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: tokens.surface.elevated,
      borderRadius: '50%',
      border: `1px solid ${tokens.border.subtle}`,
      boxShadow: mode === 'mission' ? `0 0 ${primitiveGlow.radius} rgba(255,210,31,${primitiveGlow.intensity})` : 'none',
    },
    valueText: {
      fontSize: primitiveTypeScale.h1,
      fontWeight: '700',
      fontFamily: primitiveFonts.mono,
      color: tokens.text.primary,
    },
    labelText: {
      fontSize: primitiveTypeScale.micro,
      color: tokens.text.muted,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontFamily: primitiveFonts.body,
    },
    arc: {
      critical: primitiveSignal.critical,
      warning: primitiveSignal.warning,
      success: primitiveSignal.success,
      track: tokens.border.subtle,
    },
    needle: {
      stroke: tokens.text.primary,
      strokeWidth: '2',
    },
  };
}

/**
 * Determine which threshold band a value falls into.
 * Returns the band name and colour — always paired with the numeric value for accessibility.
 */
export function getGaugeBand(
  value: number,
  max: number,
  thresholds: { critical: number; warning: number; success: number },
): { band: 'critical' | 'warning' | 'success'; color: string; label: string } {
  const pct = value / max;
  if (pct <= thresholds.critical) return { band: 'critical', color: primitiveSignal.critical, label: 'Critical' };
  if (pct <= thresholds.warning) return { band: 'warning', color: primitiveSignal.warning, label: 'Warning' };
  return { band: 'success', color: primitiveSignal.success, label: 'Healthy' };
}

/**
 * Generate ApexCharts gauge configuration for a gauge arc.
 * Returns a configuration object suitable for rendering with ApexCharts radialBar.
 */
export function getGaugeChartConfig(data: GaugeData, mode: WorkspaceMode) {
  const tokens = getSemanticTokens(mode);
  const thresholds = data.thresholds ?? { critical: 0.3, warning: 0.6, success: 1.0 };
  const pct = (data.value / data.max) * 100;
  const band = getGaugeBand(data.value, data.max, thresholds);

  return {
    series: [pct],
    options: {
      chart: { type: 'radialBar' as const },
      plotOptions: {
        radialBar: {
          hollow: { size: '60%' },
          track: { background: tokens.border.subtle },
          dataLabels: {
            name: { show: true, fontSize: primitiveTypeScale.micro, color: tokens.text.muted },
            value: { show: true, fontSize: primitiveTypeScale.h1, fontFamily: primitiveFonts.mono, color: tokens.text.primary },
          },
        },
      },
      colors: [band.color],
      labels: [data.label],
    },
  };
}
