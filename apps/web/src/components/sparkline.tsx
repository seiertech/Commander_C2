'use client';

/**
 * Sparkline — Commander SDR (Unit 16b)
 *
 * Inline SVG mini-chart for posture metric trend visualisation.
 * 7 data points, 60px wide, 24px tall. Pure SVG — no chart library dependency.
 * Uses semantic data tokens for stroke colour per threshold band.
 *
 * Source: Unit 16b deliverables, DS-1.0 chart token discipline.
 */

import { primitiveSignal } from '../../../../packages/ui/src/tokens/primitives';
import type { ThresholdBand } from '../../../../packages/contracts/src/entities/posture-metrics-config';

interface SparklineProps {
  /** 7-point data values */
  data: number[];
  /** Current threshold band for stroke colouring */
  band: ThresholdBand;
  /** Width in pixels (default: 60) */
  width?: number;
  /** Height in pixels (default: 24) */
  height?: number;
}

/** Map threshold band to semantic signal colour */
const BAND_COLOURS: Record<ThresholdBand, string> = {
  green: primitiveSignal.success,
  amber: primitiveSignal.warning,
  red: primitiveSignal.critical,
};

export function Sparkline({ data, band, width = 60, height = 24 }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // avoid division by zero for flat lines
  const padding = 2; // px padding top/bottom

  const usableHeight = height - padding * 2;
  const stepX = width / (data.length - 1);

  const points = data
    .map((value, i) => {
      const x = i * stepX;
      const y = padding + usableHeight - ((value - min) / range) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Sparkline trend"
      style={{ display: 'block' }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={BAND_COLOURS[band]}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
