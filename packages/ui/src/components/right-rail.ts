/**
 * Right-Rail Insight/Action Column — Commander C2 (DS-1.0)
 *
 * Persistent right rail for Path Explorer, Recommended Actions,
 * Case & Action Center beside main visuals on detail surfaces.
 *
 * DS-1.0 §21: Detail surfaces use a right rail for insight/action.
 *
 * Source: DESIGN_SYSTEM.md §21; mockup: blast-radius-command-detailed.png
 */

import { primitiveFonts, primitiveTypeScale, primitiveSpacing } from '../tokens/primitives';
import { componentTokens } from '../tokens/components';
import type { WorkspaceMode } from '../tokens/semantic';
import { getSemanticTokens } from '../tokens/semantic';

export interface RightRailSection {
  id: string;
  title: string;
  content: unknown; // Rendered by consumer
}

export interface RightRailStyles {
  container: Record<string, string>;
  section: Record<string, string>;
  sectionTitle: Record<string, string>;
  sectionContent: Record<string, string>;
}

export function getRightRailStyles(mode: WorkspaceMode): RightRailStyles {
  const tokens = getSemanticTokens(mode);

  return {
    container: {
      width: '320px',
      minWidth: '320px',
      height: '100%',
      overflowY: 'auto',
      borderLeft: `1px solid ${tokens.border.default}`,
      background: tokens.surface.elevated,
      padding: componentTokens.contentPadding,
      display: 'flex',
      flexDirection: 'column',
      gap: componentTokens.gridGap,
    },
    section: {
      padding: componentTokens.cardPadding,
      background: tokens.surface.secondary,
      borderRadius: componentTokens.cardRadius,
      border: `1px solid ${tokens.border.subtle}`,
    },
    sectionTitle: {
      fontSize: primitiveTypeScale.h3,
      fontWeight: '600',
      color: tokens.text.primary,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontFamily: primitiveFonts.body,
      marginBottom: primitiveSpacing[3],
    },
    sectionContent: {
      fontSize: primitiveTypeScale.body,
      color: tokens.text.secondary,
      fontFamily: primitiveFonts.body,
      lineHeight: '1.43',
    },
  };
}
