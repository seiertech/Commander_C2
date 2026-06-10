/**
 * Closed-Loop Lifecycle Pipeline — Commander SDR (DS-1.0)
 *
 * Horizontal stepper: New → Triage → Investigating → Awaiting Feedback →
 * Actioning → Validation → Closure.
 * Per-stage counts and active-stage gold ring.
 *
 * DS-1.0 §21: The visual form of the closed-loop case model (Spec 06).
 * Doctrinal Assertion 1: Cases are system-owned. This pipeline visualises
 * system-owned lifecycle states only.
 *
 * Source: DESIGN_SYSTEM.md §21; mockup: case-handling-dashboard.png
 */

import { primitiveBrand, primitiveFonts, primitiveTypeScale, primitiveSpacing, primitiveMotion } from '../tokens/primitives';
import { componentTokens } from '../tokens/components';
import type { WorkspaceMode } from '../tokens/semantic';
import { getSemanticTokens } from '../tokens/semantic';

/** The 7 lifecycle stages per Spec #08 / Spec #30 */
export const LIFECYCLE_STAGES = [
  'New',
  'Triage',
  'Investigating',
  'Awaiting Feedback',
  'Actioning',
  'Validation',
  'Closure',
] as const;

export type LifecycleStage = typeof LIFECYCLE_STAGES[number];

export interface StageData {
  stage: LifecycleStage;
  count: number;
  isActive: boolean;
}

export interface PipelineStyles {
  container: Record<string, string>;
  stage: Record<string, string>;
  stageActive: Record<string, string>;
  stageLabel: Record<string, string>;
  stageCount: Record<string, string>;
  connector: Record<string, string>;
}

export function getPipelineStyles(mode: WorkspaceMode): PipelineStyles {
  const tokens = getSemanticTokens(mode);

  return {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: primitiveSpacing[2],
      padding: `${componentTokens.cardPadding} 0`,
      overflowX: 'auto',
    },
    stage: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`,
      borderRadius: componentTokens.cardRadius,
      border: `2px solid ${tokens.border.subtle}`,
      background: tokens.surface.elevated,
      minWidth: '80px',
      transition: `border-color ${primitiveMotion.standard} ${primitiveMotion.easeDefault}`,
    },
    stageActive: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`,
      borderRadius: componentTokens.cardRadius,
      border: `2px solid ${primitiveBrand.gold}`,
      background: tokens.surface.elevated,
      minWidth: '80px',
      boxShadow: mode === 'mission' ? `0 0 8px rgba(255,210,31,0.35)` : `0 0 4px rgba(255,210,31,0.2)`,
    },
    stageLabel: {
      fontSize: primitiveTypeScale.micro,
      color: tokens.text.muted,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontFamily: primitiveFonts.body,
      textAlign: 'center',
      whiteSpace: 'nowrap',
    },
    stageCount: {
      fontSize: primitiveTypeScale.h3,
      fontWeight: '700',
      color: tokens.text.primary,
      fontFamily: mode === 'mission' ? primitiveFonts.mono : primitiveFonts.body,
    },
    connector: {
      width: primitiveSpacing[4],
      height: '2px',
      background: tokens.border.default,
      flexShrink: '0',
    },
  };
}
