/**
 * Strategic Heading Compass — Commander C2 (DS-1.0)
 *
 * Bespoke compass-rose instrument (N/S/E/W) with needle pointing to heading
 * (degrees + cardinal). Mission mode signature element.
 *
 * DS-1.0 §21: Distinctive to Commander. Bespoke component, Mission mode.
 *
 * Source: DESIGN_SYSTEM.md §21; mockup: command-centre-mission.png
 */

import { primitiveFonts, primitiveTypeScale, primitiveBrand, primitiveGlow } from '../tokens/primitives';
import { componentTokens } from '../tokens/components';
import type { WorkspaceMode } from '../tokens/semantic';
import { getSemanticTokens } from '../tokens/semantic';

export interface CompassData {
  /** Heading in degrees (0-360) */
  heading: number;
  /** Optional label (e.g. "Strategic Direction") */
  label?: string;
}

export interface CompassStyles {
  container: Record<string, string>;
  rose: Record<string, string>;
  needle: Record<string, string>;
  headingText: Record<string, string>;
  cardinalText: Record<string, string>;
  labelText: Record<string, string>;
}

/** Get cardinal direction from degrees */
export function getCardinal(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return dirs[index];
}

export function getCompassStyles(mode: WorkspaceMode): CompassStyles {
  const tokens = getSemanticTokens(mode);

  return {
    container: {
      width: '180px',
      height: '180px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: tokens.surface.elevated,
      borderRadius: '50%',
      border: `1px solid ${tokens.border.subtle}`,
      boxShadow: mode === 'mission' ? `0 0 ${primitiveGlow.radius} rgba(255,210,31,${primitiveGlow.intensity})` : 'none',
    },
    rose: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: mode === 'mission' ? '0.3' : '0.15',
    },
    needle: {
      position: 'absolute',
      width: '2px',
      height: '60px',
      background: primitiveBrand.gold,
      transformOrigin: 'bottom center',
      borderRadius: '1px',
    },
    headingText: {
      fontSize: primitiveTypeScale.h1,
      fontWeight: '700',
      fontFamily: primitiveFonts.mono,
      color: tokens.text.primary,
    },
    cardinalText: {
      fontSize: primitiveTypeScale.caption,
      fontWeight: '600',
      color: primitiveBrand.gold,
      fontFamily: primitiveFonts.body,
    },
    labelText: {
      fontSize: primitiveTypeScale.micro,
      color: tokens.text.muted,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontFamily: primitiveFonts.body,
      marginTop: '4px',
    },
  };
}
