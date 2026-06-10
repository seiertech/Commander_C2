/**
 * OperationalCard — Commander SDR
 *
 * v1.3.2 Requirement 17: White background, 1px border #dbe3ef, 18px padding,
 * uppercase 13px h3 titles with 0.06em letter-spacing, body text #68758b.
 *
 * Source: shell reference v11
 */

import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';

export interface OperationalCardStyles {
  card: Record<string, string>;
  title: Record<string, string>;
  body: Record<string, string>;
}

export function getOperationalCardStyles(): OperationalCardStyles {
  return {
    card: {
      border: `1px solid ${colors.operational.line}`,
      padding: '18px',
      background: colors.operational.panel,
      minHeight: '110px',
    },
    title: {
      margin: '0 0 10px',
      fontSize: typography.fontSize.base,
      textTransform: 'uppercase',
      letterSpacing: typography.letterSpacing.eyebrow,
      fontWeight: typography.fontWeight.bold,
      color: colors.operational.ink,
    },
    body: {
      margin: '0',
      color: colors.operational.muted,
      lineHeight: typography.lineHeight.normal,
      fontSize: typography.fontSize.base,
    },
  };
}
