/**
 * SidebarGroup — Commander C2
 *
 * v1.3.2 Requirement 14: Two-level structure with expandable group headers,
 * sub-items indented with vertical gold-tinted divider (rgba(255,210,31,.16)).
 *
 * Source: shell reference v11
 */

import { colors } from '../tokens/colors';
import { chrome } from '../tokens/spacing';
import { typography } from '../tokens/typography';

export interface SidebarGroupStyles {
  group: Record<string, string>;
  header: Record<string, string>;
  headerActive: Record<string, string>;
  caret: Record<string, string>;
  badge: Record<string, string>;
  subItems: Record<string, string>;
  subItem: Record<string, string>;
  subItemActive: Record<string, string>;
}

export function getSidebarGroupStyles(): SidebarGroupStyles {
  return {
    group: {
      marginBottom: '7px',
    },
    header: {
      height: chrome.groupHeaderHeight,
      border: '1px solid transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0 10px',
      fontWeight: typography.fontWeight.bold,
      color: colors.chrome.textHeading,
      cursor: 'pointer',
    },
    headerActive: {
      height: chrome.groupHeaderHeight,
      border: `1px solid ${colors.gold.hoverBorder}`,
      background: colors.gold.hoverBackground,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0 10px',
      fontWeight: typography.fontWeight.bold,
      color: '#ffffff',
      cursor: 'pointer',
    },
    caret: {
      marginLeft: 'auto',
      color: colors.gold.primary,
    },
    badge: {
      fontSize: '8px',
      letterSpacing: typography.letterSpacing.badge,
      border: `1px solid ${colors.gold.badge}`,
      color: colors.gold.primary,
      padding: '2px 4px',
      marginLeft: '6px',
    },
    subItems: {
      marginLeft: '13px',
      padding: '4px 0 7px 18px',
      borderLeft: `1px solid ${colors.gold.divider}`,
    },
    subItem: {
      height: chrome.subItemHeight,
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      color: colors.chrome.textSubtle,
      fontSize: typography.fontSize.sidebarSub,
      textDecoration: 'none',
    },
    subItemActive: {
      height: chrome.subItemHeight,
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      color: '#ffffff',
      fontSize: typography.fontSize.sidebarSub,
      fontWeight: typography.fontWeight.extrabold,
      textDecoration: 'none',
    },
  };
}
