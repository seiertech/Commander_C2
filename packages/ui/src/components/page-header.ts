/**
 * PageHeader — Commander SDR
 *
 * v1.3.2 Requirement 16: Uppercase grey breadcrumb eyebrow, 22px h1 page title,
 * right-aligned StatusTile with green dot and "Last updated X" text,
 * white background with bottom border #dbe3ef.
 *
 * Source: shell reference v11
 */

import { colors } from '../tokens/colors';
import { chrome } from '../tokens/spacing';
import { typography } from '../tokens/typography';

export interface PageHeaderStyles {
  container: Record<string, string>;
  titleSection: Record<string, string>;
  eyebrow: Record<string, string>;
  title: Record<string, string>;
  statusTile: Record<string, string>;
  statusDot: Record<string, string>;
}

export function getPageHeaderStyles(): PageHeaderStyles {
  return {
    container: {
      height: chrome.pageHeaderHeight,
      background: colors.operational.panel,
      borderBottom: `1px solid ${colors.operational.line}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
    },
    titleSection: {
      display: 'flex',
      flexDirection: 'column',
    },
    eyebrow: {
      color: colors.operational.eyebrow,
      textTransform: 'uppercase',
      letterSpacing: typography.letterSpacing.display,
      fontSize: typography.fontSize.xs,
      marginBottom: '5px',
    },
    title: {
      margin: '0',
      fontSize: typography.fontSize.h1,
      fontWeight: typography.fontWeight.bold,
      color: colors.operational.ink,
    },
    statusTile: {
      border: `1px solid ${colors.operational.line}`,
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 13px',
      background: colors.operational.panel,
      fontSize: typography.fontSize.base,
      color: colors.operational.ink,
    },
    statusDot: {
      width: '7px',
      height: '7px',
      background: colors.status.live,
      display: 'inline-block',
      marginRight: '8px',
      borderRadius: '50%',
    },
  };
}
