/**
 * Commander C2 — Semantic Tokens (Layer 2)
 *
 * Mapped to meaning. Mode-overridable.
 * Components reference THESE, not primitives.
 *
 * Source: docs/06_ui_build_reference/DESIGN_SYSTEM.md §3
 */

import { primitiveNeutral, primitiveHud, primitiveBrand, primitiveSignal, primitiveData } from './primitives';

export type WorkspaceMode = 'standard' | 'mission';

/** Resolve semantic tokens for a given workspace mode */
export function getSemanticTokens(mode: WorkspaceMode) {
  return {
    surface: {
      primary: mode === 'standard' ? primitiveNeutral[50] : primitiveHud.bg1,
      secondary: mode === 'standard' ? primitiveNeutral[0] : primitiveHud.bg2,
      elevated: mode === 'standard' ? primitiveNeutral[0] : primitiveHud.bg3,
      overlay: mode === 'standard' ? 'rgba(14,29,50,0.45)' : 'rgba(0,0,0,0.6)',
    },
    text: {
      primary: mode === 'standard' ? primitiveNeutral[900] : primitiveHud.text0,
      secondary: mode === 'standard' ? primitiveNeutral[500] : primitiveHud.text1,
      muted: mode === 'standard' ? primitiveNeutral[400] : primitiveHud.text2,
    },
    border: {
      default: mode === 'standard' ? primitiveNeutral[300] : primitiveHud.line2,
      subtle: mode === 'standard' ? primitiveNeutral[200] : primitiveHud.line,
    },
    action: {
      primary: primitiveBrand.gold,
      secondary: mode === 'standard' ? primitiveNeutral[700] : primitiveHud.text1,
    },
    status: {
      critical: primitiveSignal.critical,
      warning: primitiveSignal.warning,
      success: primitiveSignal.success,
      info: primitiveSignal.info,
      neutral: primitiveSignal.neutral,
    },
    data: primitiveData,
    chrome: {
      navText: '#ffffff',
      navTextActive: primitiveBrand.gold,
      separator: 'rgba(255,255,255,0.12)',
    },
    brand: {
      gold: primitiveBrand.gold, // '#ffd21f' — for Top_Nav underline use only
    },
    sidebar: {
      background: '#040a11',                        // near-black navy, mode-invariant
      scrollbarThumb: 'rgba(255,255,255,0.18)',
      scrollbarThumbHover: 'rgba(255,255,255,0.32)',
      scrollbarTrack: 'transparent',
      activeBackground: 'rgba(255,255,255,0.08)',   // non-Gold, ≥10% luminance delta
      activeIndicator: '#4a90d9',                   // non-Gold blue accent
    },
    input: {
      border: mode === 'standard' ? 'rgba(24,36,51,0.20)' : 'rgba(255,255,255,0.18)',
      background: mode === 'standard' ? 'rgba(24,36,51,0.06)' : 'rgba(255,255,255,0.07)',
      text: mode === 'standard' ? '#182433' : '#dce1e7',
    },
    shellSurface: {
      headerBackground: mode === 'standard' ? '#ffffff' : '#0d1b2a',
      pageBackground: mode === 'standard' ? '#f6f8fb' : '#040a11',
      cardBackground: mode === 'standard' ? '#ffffff' : '#0e1722',
      cardBorder: mode === 'standard' ? '#dce1e7' : '#25384f',
      bodyText: mode === 'standard' ? '#182433' : '#dce1e7',
      secondaryText: mode === 'standard' ? 'rgba(24,36,51,0.75)' : 'rgba(220,225,231,0.75)',
    },
  } as const;
}

/** Standard mode tokens (convenience export) */
export const standardTokens = getSemanticTokens('standard');

/** Mission mode tokens (convenience export) */
export const missionTokens = getSemanticTokens('mission');
