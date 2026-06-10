/**
 * Commander C2 Design Tokens — Three-Layer Architecture (DS-1.0)
 *
 * Layer 1: Primitives (raw values — never referenced by components directly)
 * Layer 2: Semantic (mode-overridable — components reference these)
 * Layer 3: Component (pinned dimensions per component)
 *
 * Source: docs/06_ui_build_reference/DESIGN_SYSTEM.md §1-§4
 */

// Layer 1 — Primitives
export {
  primitiveSpacing,
  primitiveRadii,
  primitiveBrand,
  primitiveNeutral,
  primitiveHud,
  primitiveSignal,
  primitiveData,
  primitiveGlow,
  primitiveMotion,
  primitiveFonts,
  primitiveTypeScale,
  primitiveLetterSpacing,
  primitiveLineHeight,
  primitiveFontWeight,
  primitivePriority,
  primitiveOoda,
  primitiveConnectorClass,
} from './primitives';

// Layer 2 — Semantic
export { getSemanticTokens, standardTokens, missionTokens } from './semantic';
export type { WorkspaceMode } from './semantic';

// Layer 3 — Component
export { componentTokens } from './components';
export type { ComponentTokens } from './components';

// Legacy re-exports for backward compatibility during migration
// These will be removed once all consumers migrate to the three-layer system
export { colors } from './colors';
export { typography } from './typography';
export { spacing, chrome, radii, shadows } from './spacing';
