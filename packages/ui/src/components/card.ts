/**
 * Card Component — Commander C2
 *
 * Dashboard card with squared alignment, visual symmetry
 * and information hierarchy per Domain Requirement 2.
 *
 * Source: Spec #11a §4 Component Catalogue
 * Design: Navy elevated background, subtle border, gold accent on hover
 */

import { colors } from '../tokens/colors';
import { spacing, radii, shadows } from '../tokens/spacing';

export interface CardStyleOptions {
  variant?: 'default' | 'elevated' | 'outlined';
  interactive?: boolean;
}

/**
 * Returns CSS styles for a Commander card component.
 */
export function getCardStyles(options: CardStyleOptions = {}) {
  const { variant = 'default', interactive = false } = options;

  const base = {
    borderRadius: radii.md,
    padding: spacing['4'],
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const variants = {
    default: {
      ...base,
      backgroundColor: colors.operational.panel,
      border: `1px solid ${colors.operational.line}`,
      boxShadow: 'none',
    },
    elevated: {
      ...base,
      backgroundColor: colors.operational.panel,
      border: `1px solid ${colors.operational.line}`,
      boxShadow: shadows.md,
    },
    outlined: {
      ...base,
      backgroundColor: 'transparent',
      border: `1px solid ${colors.operational.line}`,
      boxShadow: 'none',
    },
  };

  const styles = variants[variant];

  if (interactive) {
    return {
      ...styles,
      cursor: 'pointer',
      _hover: {
        borderColor: colors.gold.primary,
        boxShadow: shadows.glow.gold,
      },
    };
  }

  return styles;
}
