/**
 * KPI Tile — Commander C2 (DS-1.0)
 *
 * Single metric tile: small label, large value, delta/trend with arrow, optional sparkline.
 * Part of the KPI strip (8-10 tiles under every page header).
 *
 * DS-1.0 §12: KPI/Metric tile — 80-120px; [label small][value large][delta/trend small]
 * Mission: value mono, delta in signal colour; optional sparkline.
 *
 * Source: DESIGN_SYSTEM.md §12, §21; mockup: command-centre-standard.png, command-centre-mission.png
 */

import { primitiveTypeScale, primitiveFonts, primitiveSignal } from '../tokens/primitives';
import { componentTokens } from '../tokens/components';
import type { WorkspaceMode } from '../tokens/semantic';
import { getSemanticTokens } from '../tokens/semantic';

export interface KpiTileData {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  trend?: 'up' | 'down' | 'flat';
}

export interface KpiTileStyles {
  container: Record<string, string>;
  label: Record<string, string>;
  value: Record<string, string>;
  delta: Record<string, string>;
  arrow: Record<string, string>;
}

export function getKpiTileStyles(mode: WorkspaceMode): KpiTileStyles {
  const tokens = getSemanticTokens(mode);

  return {
    container: {
      minWidth: '120px',
      padding: componentTokens.cardPadding,
      background: tokens.surface.elevated,
      borderRadius: componentTokens.cardRadius,
      border: `1px solid ${tokens.border.subtle}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    label: {
      fontSize: primitiveTypeScale.micro,
      color: tokens.text.muted,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontFamily: primitiveFonts.body,
    },
    value: {
      fontSize: primitiveTypeScale.kpiValue,
      fontWeight: '600',
      color: tokens.text.primary,
      fontFamily: mode === 'mission' ? primitiveFonts.mono : primitiveFonts.body,
    },
    delta: {
      fontSize: primitiveTypeScale.micro,
      color: tokens.text.muted,
      fontFamily: primitiveFonts.body,
    },
    arrow: {
      fontSize: primitiveTypeScale.micro,
    },
  };
}

/** Get arrow character and colour for a trend direction */
export function getTrendIndicator(trend: 'up' | 'down' | 'flat', isPositiveGood: boolean = true) {
  const arrows = { up: '↑', down: '↓', flat: '→' };
  const colors = {
    up: isPositiveGood ? primitiveSignal.success : primitiveSignal.critical,
    down: isPositiveGood ? primitiveSignal.critical : primitiveSignal.success,
    flat: primitiveSignal.neutral,
  };
  return { arrow: arrows[trend], color: colors[trend] };
}
