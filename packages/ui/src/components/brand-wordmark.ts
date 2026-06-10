/**
 * BrandWordmark — Commander SDR
 *
 * v1.3.2 Requirement 10: SEIERTECH (cream #f4f1eb) | gold pipe (#ffd21f) |
 * COMMANDER (gold) | SDR (white), all in Inter.
 *
 * Source: shell reference v11
 */

import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';

export interface BrandWordmarkStyles {
  container: Record<string, string>;
  seiertech: Record<string, string>;
  pipe: Record<string, string>;
  commander: Record<string, string>;
  sdr: Record<string, string>;
}

export function getBrandWordmarkStyles(): BrandWordmarkStyles {
  return {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    seiertech: {
      fontFamily: typography.fontFamily.display,
      fontSize: typography.fontSize.brandSm,
      letterSpacing: typography.letterSpacing.displayWide,
      color: colors.brand.seiertech,
    },
    pipe: {
      height: '23px',
      width: '1px',
      background: colors.brand.pipe,
    },
    commander: {
      fontFamily: typography.fontFamily.display,
      fontSize: typography.fontSize.brandLg,
      letterSpacing: typography.letterSpacing.display,
      color: colors.brand.commander,
    },
    sdr: {
      fontFamily: typography.fontFamily.display,
      fontSize: typography.fontSize.brandLg,
      letterSpacing: typography.letterSpacing.display,
      color: colors.brand.sdr,
    },
  };
}
