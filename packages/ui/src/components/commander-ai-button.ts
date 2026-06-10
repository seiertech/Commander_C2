/**
 * CommanderAIButton — Commander C2
 *
 * White background, gold 1px border, bold uppercase text.
 * Positioned after global search in the top bar tools area.
 *
 * Source: shell reference v11
 */

import { colors } from '../tokens/colors';
import { chrome } from '../tokens/spacing';
import { typography } from '../tokens/typography';

export interface CommanderAIButtonStyles {
  button: Record<string, string>;
}

export function getCommanderAIButtonStyles(): CommanderAIButtonStyles {
  return {
    button: {
      height: chrome.iconSize,
      border: `1px solid ${colors.gold.border}`,
      color: colors.navy.primary,
      background: '#ffffff',
      fontFamily: typography.fontFamily.body,
      fontWeight: typography.fontWeight.extrabold,
      fontSize: typography.fontSize.base,
      padding: '0 14px',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      textDecoration: 'none',
    },
  };
}
