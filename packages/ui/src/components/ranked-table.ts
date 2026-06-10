/**
 * Ranked Table — Commander C2 (DS-1.0)
 *
 * Table with value + inline horizontal bar + trend arrow per row.
 * DS-1.0 §12: Table — row 36px, header 40px, cell padding 8px 12px.
 * DS-1.0 §21: Ranked table with inline bar+trend is a standard pattern.
 *
 * Source: DESIGN_SYSTEM.md §12, §21; mockup: command-centre-standard.png, ciso-dashboard.png
 */

import { primitiveTypeScale, primitiveFonts, primitiveSignal, primitiveSpacing, primitiveRadii } from '../tokens/primitives';
import { componentTokens } from '../tokens/components';
import type { WorkspaceMode } from '../tokens/semantic';
import { getSemanticTokens } from '../tokens/semantic';

export interface RankedTableRow {
  label: string;
  value: number;
  maxValue: number;
  trend: 'up' | 'down' | 'flat';
  /** Whether higher is better (affects trend colour) */
  higherIsBetter?: boolean;
}

export interface RankedTableStyles {
  table: Record<string, string>;
  headerRow: Record<string, string>;
  headerCell: Record<string, string>;
  row: Record<string, string>;
  cell: Record<string, string>;
  labelCell: Record<string, string>;
  barContainer: Record<string, string>;
  bar: Record<string, string>;
  valueCell: Record<string, string>;
  trendCell: Record<string, string>;
}

export function getRankedTableStyles(mode: WorkspaceMode): RankedTableStyles {
  const tokens = getSemanticTokens(mode);

  return {
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: primitiveFonts.body,
      fontSize: primitiveTypeScale.body,
    },
    headerRow: {
      height: componentTokens.tableHeaderHeight,
      borderBottom: `1px solid ${tokens.border.default}`,
    },
    headerCell: {
      padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`,
      textAlign: 'left',
      fontSize: primitiveTypeScale.caption,
      fontWeight: '600',
      color: tokens.text.muted,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    },
    row: {
      height: componentTokens.tableRowHeight,
      borderBottom: `1px solid ${tokens.border.subtle}`,
    },
    cell: {
      padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`,
      color: tokens.text.primary,
    },
    labelCell: {
      padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`,
      color: tokens.text.primary,
      fontWeight: '500',
    },
    barContainer: {
      width: '100%',
      height: '6px',
      background: tokens.border.subtle,
      borderRadius: primitiveRadii.full,
      overflow: 'hidden',
    },
    bar: {
      height: '100%',
      borderRadius: primitiveRadii.full,
      transition: 'width 250ms linear',
    },
    valueCell: {
      padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`,
      fontFamily: mode === 'mission' ? primitiveFonts.mono : primitiveFonts.body,
      fontWeight: '600',
      color: tokens.text.primary,
      textAlign: 'right',
    },
    trendCell: {
      padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`,
      textAlign: 'center',
      width: '40px',
    },
  };
}

/** Get trend arrow and colour */
export function getTrendArrow(trend: 'up' | 'down' | 'flat', higherIsBetter: boolean = true) {
  const arrows = { up: '↑', down: '↓', flat: '→' };
  const colors = {
    up: higherIsBetter ? primitiveSignal.success : primitiveSignal.critical,
    down: higherIsBetter ? primitiveSignal.critical : primitiveSignal.success,
    flat: primitiveSignal.neutral,
  };
  return { arrow: arrows[trend], color: colors[trend] };
}

/** Get bar colour based on value/max ratio */
export function getBarColor(value: number, maxValue: number): string {
  const ratio = value / maxValue;
  if (ratio >= 0.7) return primitiveSignal.success;
  if (ratio >= 0.4) return primitiveSignal.warning;
  return primitiveSignal.critical;
}
