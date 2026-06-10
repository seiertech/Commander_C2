/**
 * Commander SDR — Primitive Tokens (Layer 1)
 *
 * Raw values. NO component references these directly.
 * All values pinned from DESIGN_SYSTEM.md §2.
 *
 * Source: docs/06_ui_build_reference/DESIGN_SYSTEM.md §2
 */

// === §2.1 Spacing scale (8px base grid) ===
export const primitiveSpacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '24px',
  6: '32px',
  7: '48px',
  8: '64px',
} as const;

// === §2.2 Radius ===
export const primitiveRadii = {
  sm: '0px',
  md: '2px',
  lg: '2px',
  full: '9999px',
} as const;

// === §2.3 Brand anchors ===
export const primitiveBrand = {
  navy: '#061936',
  navy2: '#071f43',
  gold: '#ffd21f',
  cream: '#f4f1eb',
} as const;

// === §2.4 Neutral ramp — Standard (light) mode ===
export const primitiveNeutral = {
  0: '#ffffff',
  50: '#f2f5f9',
  100: '#e7ecf3',
  200: '#dbe3ef',
  300: '#c2cede',
  400: '#9aa9be',
  500: '#68758b',
  600: '#4a5667',
  700: '#2e3848',
  800: '#1a2433',
  900: '#0e1d32',
} as const;

// === §2.5 Neutral ramp — Mission (dark/HUD) mode ===
export const primitiveHud = {
  bg0: '#050b16',
  bg1: '#08111f',
  bg2: '#0c1828',
  bg3: '#122236',
  line: 'rgba(255,255,255,0.10)',
  line2: 'rgba(255,255,255,0.16)',
  text0: '#e8f0fb',
  text1: '#aebfd4',
  text2: '#6f8198',
  gridOpacity: '0.05',
} as const;

// === §2.6 Signal colours ===
export const primitiveSignal = {
  critical: '#d92d20',
  warning: '#e8a317',
  success: '#1a7a3f',
  info: '#2563aa',
  neutral: '#68758b',
} as const;

// === §2.7 Data palette (charts, n=8, colour-blind safe) ===
export const primitiveData = {
  1: '#2563aa',
  2: '#e8a317',
  3: '#1a7a3f',
  4: '#b5446e',
  5: '#4ba3c3',
  6: '#c2611f',
  7: '#7a5cc2',
  8: '#8a8f98',
} as const;

// === §2.8 Glow (Mission mode only) ===
export const primitiveGlow = {
  radius: '8px',
  intensity: '0.35',
} as const;

// === §2.9 Motion ===
export const primitiveMotion = {
  micro: '100ms',
  standard: '180ms',
  complex: '250ms',
  easeDefault: 'ease-out',
  easeInteraction: 'ease-in-out',
  easeData: 'linear',
} as const;

// === §2.10 Fonts — single-font Inter system ===
// All application text uses Inter. Font weight carries semantic meaning.
// The display/mono aliases resolve to Inter for backward compatibility.
export const primitiveFonts = {
  /** Primary application font — Inter for all UI text */
  body: "'Inter', system-ui, sans-serif",
  /** Logo/wordmark text — Inter (logo will be replaced by image asset) */
  display: "'Inter', system-ui, sans-serif",
  /** Technical/code-style text — Inter (mono alias for backward compat) */
  mono: "'Inter', system-ui, sans-serif",
} as const;

// === §2.11 Type scale ===
export const primitiveTypeScale = {
  // Heading scale
  h1: '24px',
  h2: '20px',
  h3: '16px',
  h4: '14px',
  h5: '12px',
  h6: '10px',
  // Content scale
  large: '18px',
  body: '14px',
  caption: '12px',
  micro: '11px',
  // Metric display
  kpiValue: '24px',
  heroKpiValue: '28px',
  // Legacy aliases (resolve to new scale values)
  displayLg: '24px',  // → h1
  display: '22px',    // kept for brand wordmark sizing only
} as const;

export const primitiveLetterSpacing = {
  normal: '0',
  display: '0.09em',    // brand wordmark only
  displayWide: '0.11em', // brand wordmark only
  eyebrow: '0.06em',    // uppercase micro labels / badges
  badge: '0.08em',      // compact badge text
} as const;

export const primitiveLineHeight = {
  body: '1.4285714286',  // 10/7 — body and prose text
  heading: '1.2',        // headings
  denseTable: '1.3',     // dense operational tables
  kpi: '1.1',            // KPI metric values
  prose: '1.4285714286', // long-form prose content
} as const;

// === §2.12 Font weights ===
export const primitiveFontWeight = {
  normal: 400,     // body text, paragraphs, normal labels
  medium: 500,     // navigation items, metadata values, secondary emphasis
  semibold: 600,   // card titles, section headings, tabs, buttons, table headers
  bold: 700,       // page headings, major headings, sidebar group headers
  extrabold: 800,  // Commander AI / control-plane strong emphasis only
} as const;

// === §14.1 Priority scale ===
export const primitivePriority = {
  p0: { color: '#d92d20', shape: '◆', label: 'P0' },
  p1: { color: '#e8531f', shape: '▲', label: 'P1' },
  p2: { color: '#e8a317', shape: '●', label: 'P2' },
  p3: { color: '#2563aa', shape: '○', label: 'P3' },
  p4: { color: '#68758b', shape: '□', label: 'P4' },
} as const;

// === §14.2 OODA phase colours ===
export const primitiveOoda = {
  observe: '#2563aa',
  orient: '#4ba3c3',
  decide: '#e8a317',
  act: '#1a7a3f',
} as const;

// === §14.3 Connector class colours ===
export const primitiveConnectorClass = {
  A: '#2563aa',
  B: '#4ba3c3',
  C: '#7a5cc2',
  D: '#e8a317',
} as const;
