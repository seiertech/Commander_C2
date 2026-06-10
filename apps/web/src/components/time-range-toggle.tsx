'use client';

/**
 * TimeRangeToggle — Commander SDR (Unit 16b)
 *
 * Button group for selecting posture metric time period (24h / 7d / 30d / YTD).
 * Design: DS-1.0 button group pattern, semantic tokens only.
 *
 * Source: Unit 16b deliverables, DEC-command-centre-design-banked.
 */

import { useMode } from '@/context/mode-context';
import {
  primitiveTypeScale,
  primitiveSpacing,
  primitiveFontWeight,
  primitiveSignal,
} from '../../../../packages/ui/src/tokens/primitives';
import type { PostureTimePeriod } from '../../../../packages/contracts/src/entities/posture-metrics-config';
import { POSTURE_TIME_PERIODS } from '../../../../packages/contracts/src/entities/posture-metrics-config';

interface TimeRangeToggleProps {
  /** Currently active period */
  activePeriod: PostureTimePeriod;
  /** Callback when period changes */
  onChange: (period: PostureTimePeriod) => void;
}

const PERIOD_LABELS: Record<PostureTimePeriod, string> = {
  '24h': '24h',
  '7d': '7d',
  '30d': '30d',
  'ytd': 'YTD',
};

export function TimeRangeToggle({ activePeriod, onChange }: TimeRangeToggleProps) {
  const { tokens } = useMode();

  return (
    <div
      role="group"
      aria-label="Time range selection"
      style={{ display: 'inline-flex', gap: '0px', border: `1px solid ${tokens.border.default}`, borderRadius: '2px', overflow: 'hidden' }}
    >
      {POSTURE_TIME_PERIODS.map((period) => {
        const isActive = period === activePeriod;
        return (
          <button
            key={period}
            type="button"
            onClick={() => onChange(period)}
            aria-pressed={isActive}
            style={{
              padding: `${primitiveSpacing[1]} ${primitiveSpacing[3]}`,
              fontSize: primitiveTypeScale.caption,
              fontWeight: isActive ? primitiveFontWeight.semibold : primitiveFontWeight.normal,
              color: isActive ? '#fff' : tokens.text.secondary,
              background: isActive ? primitiveSignal.info : 'transparent',
              border: 'none',
              borderRight: `1px solid ${tokens.border.subtle}`,
              cursor: 'pointer',
              transition: 'background 100ms ease-out, color 100ms ease-out',
            }}
          >
            {PERIOD_LABELS[period]}
          </button>
        );
      })}
    </div>
  );
}
