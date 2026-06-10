/**
 * TopNavTabs — Commander SDR
 *
 * v1.3.2 Requirement 11: Horizontal tabs with 3px gold border-bottom on active,
 * rgba(255,210,31,.055) tint background on active.
 *
 * Source: shell reference v11
 */

import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';

export interface TopNavTabStyles {
  container: Record<string, string>;
  tab: Record<string, string>;
  tabActive: Record<string, string>;
}

export function getTopNavTabStyles(): TopNavTabStyles {
  return {
    container: {
      display: 'flex',
      height: '100%',
      alignItems: 'stretch',
    },
    tab: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      borderBottom: '3px solid transparent',
      color: colors.chrome.textMuted,
      fontFamily: typography.fontFamily.body,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      textDecoration: 'none',
      cursor: 'pointer',
    },
    tabActive: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      borderBottom: `3px solid ${colors.gold.primary}`,
      background: colors.gold.tint,
      color: '#ffffff',
      fontFamily: typography.fontFamily.body,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      textDecoration: 'none',
      cursor: 'pointer',
    },
  };
}
