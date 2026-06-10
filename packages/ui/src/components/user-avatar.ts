/**
 * UserAvatar — Commander SDR
 *
 * v1.3.2 Requirement 18: 34px avatar tile with initials in
 * Inter, alongside user's name (12px bold) and role (10px muted).
 *
 * Source: shell reference v11
 */

import { colors } from '../tokens/colors';
import { chrome } from '../tokens/spacing';
import { typography } from '../tokens/typography';

export interface UserAvatarStyles {
  container: Record<string, string>;
  avatar: Record<string, string>;
  info: Record<string, string>;
  name: Record<string, string>;
  role: Record<string, string>;
}

export function getUserAvatarStyles(): UserAvatarStyles {
  return {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '9px',
      borderLeft: `1px solid ${colors.chrome.lineDark}`,
      paddingLeft: '12px',
    },
    avatar: {
      width: chrome.avatarSize,
      height: chrome.avatarSize,
      border: `1px solid rgba(255,255,255,.2)`,
      display: 'grid',
      placeItems: 'center',
      color: colors.gold.primary,
      fontFamily: typography.fontFamily.display,
      fontSize: '14px',
    },
    info: {
      display: 'flex',
      flexDirection: 'column',
    },
    name: {
      display: 'block',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: '#ffffff',
    },
    role: {
      display: 'block',
      fontSize: typography.fontSize.xs,
      color: '#8ca6c2',
    },
  };
}
