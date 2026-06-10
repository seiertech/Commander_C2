/**
 * GlobalSearch — Commander C2
 *
 * v1.3.2 Requirement 12: 440px wide, translucent white background
 * (rgba(255,255,255,.075)), 1px translucent border.
 *
 * Source: shell reference v11
 */

import { colors } from '../tokens/colors';
import { chrome } from '../tokens/spacing';
import { typography } from '../tokens/typography';

export interface GlobalSearchStyles {
  container: Record<string, string>;
  input: Record<string, string>;
}

export function getGlobalSearchStyles(): GlobalSearchStyles {
  return {
    container: {
      width: chrome.searchWidth,
      height: chrome.iconSize,
      border: `1px solid ${colors.chrome.searchBorder}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      background: colors.chrome.searchBg,
    },
    input: {
      width: '100%',
      border: '0',
      background: 'transparent',
      color: '#ffffff',
      outline: 'none',
      fontFamily: typography.fontFamily.body,
      fontSize: typography.fontSize.base,
    },
  };
}
