/**
 * Live Activity Feed — Commander C2 (DS-1.0)
 *
 * Timestamped events with severity dots and entity references.
 * DS-1.0 §21: Recurring bottom-right card pattern.
 *
 * Source: DESIGN_SYSTEM.md §21; mockup: command-centre-mission.png, case-handling-dashboard.png
 */

import { primitiveTypeScale, primitiveFonts, primitiveSignal, primitiveSpacing, primitiveRadii } from '../tokens/primitives';
import { componentTokens } from '../tokens/components';
import type { WorkspaceMode } from '../tokens/semantic';
import { getSemanticTokens } from '../tokens/semantic';

export type FeedSeverity = 'critical' | 'warning' | 'info' | 'success' | 'neutral';

export interface FeedEvent {
  id: string;
  timestamp: string;
  severity: FeedSeverity;
  message: string;
  entityRef?: string;
  entityType?: string;
}

export interface LiveFeedStyles {
  container: Record<string, string>;
  header: Record<string, string>;
  list: Record<string, string>;
  item: Record<string, string>;
  dot: Record<string, string>;
  timestamp: Record<string, string>;
  message: Record<string, string>;
  entityRef: Record<string, string>;
}

export function getLiveFeedStyles(mode: WorkspaceMode): LiveFeedStyles {
  const tokens = getSemanticTokens(mode);

  return {
    container: {
      padding: componentTokens.cardPadding,
      background: tokens.surface.elevated,
      border: `1px solid ${tokens.border.subtle}`,
      borderRadius: componentTokens.cardRadius,
      maxHeight: componentTokens.cardListMaxHeight,
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      fontSize: primitiveTypeScale.micro,
      fontWeight: '600',
      color: tokens.text.muted,
      marginBottom: primitiveSpacing[3],
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontFamily: primitiveFonts.body,
    },
    list: {
      flex: '1',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    },
    item: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: primitiveSpacing[2],
      padding: `${primitiveSpacing[2]} 0`,
      borderBottom: `1px solid ${tokens.border.subtle}`,
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: primitiveRadii.full,
      marginTop: '4px',
      flexShrink: '0',
    },
    timestamp: {
      fontSize: primitiveTypeScale.micro,
      color: tokens.text.muted,
      fontFamily: primitiveFonts.mono,
      whiteSpace: 'nowrap',
      minWidth: '56px',
    },
    message: {
      fontSize: primitiveTypeScale.body,
      color: tokens.text.secondary,
      fontFamily: primitiveFonts.body,
      lineHeight: '1.43',
    },
    entityRef: {
      fontSize: primitiveTypeScale.caption,
      color: tokens.action.primary,
      fontFamily: primitiveFonts.mono,
      cursor: 'pointer',
    },
  };
}

/** Get severity dot colour */
export function getSeverityColor(severity: FeedSeverity): string {
  const map: Record<FeedSeverity, string> = {
    critical: primitiveSignal.critical,
    warning: primitiveSignal.warning,
    info: primitiveSignal.info,
    success: primitiveSignal.success,
    neutral: primitiveSignal.neutral,
  };
  return map[severity];
}
