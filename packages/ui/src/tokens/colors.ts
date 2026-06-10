/**
 * Commander SDR Design Tokens — Colours (v1.3.2 Remediated)
 *
 * Visual direction: military-intelligence, brutalist, precise, executive-grade.
 *
 * Source: Spec #11a, Spec #41, shell reference v11, commercial control plane shell v3
 * v1.3.2 Requirements 4-7: Exact hex values from baseline shell references
 *
 * Palette:
 * - Navy #061936 chrome (v1.3.2 Req 4)
 * - Gold #ffd21f accent (v1.3.2 Req 5)
 * - Light content for Operational App (v1.3.2 Req 6)
 * - Dark content for Commercial Control Plane (v1.3.2 Req 7)
 */

export const colors = {
  // === Navy chrome hierarchy (v1.3.2 Req 4) ===
  navy: {
    primary: '#061936',      // Primary navy — top bar, chrome
    variant: '#071f43',      // Navy variant — brand area gradient
    sidebar: '#06152d',      // Sidebar top
    sidebarEnd: '#030e1e',   // Sidebar gradient terminus
    ink: '#0e1d32',          // Ink text on light backgrounds
  },

  // === Gold accent (v1.3.2 Req 5 — exact #ffd21f, never substitute) ===
  gold: {
    primary: '#ffd21f',      // THE gold — never amber, brass, or muted
    border: 'rgba(255,210,31,.75)',
    subtle: 'rgba(255,210,31,.24)',
    tint: 'rgba(255,210,31,.055)',
    divider: 'rgba(255,210,31,.16)',
    badge: 'rgba(255,210,31,.4)',
    scrollThumb: 'rgba(255,210,31,.55)',
    activeBorder: 'rgba(255,210,31,.45)',
    activeBackground: 'rgba(255,210,31,.08)',
    hoverBorder: 'rgba(255,210,31,.18)',
    hoverBackground: 'rgba(255,210,31,.07)',
  },

  // === Operational App content surfaces (v1.3.2 Req 6) ===
  operational: {
    page: '#f2f5f9',         // Page background
    panel: '#ffffff',        // Card/panel background
    ink: '#0e1d32',          // Primary text
    line: '#dbe3ef',         // Borders, dividers
    muted: '#68758b',        // Secondary/body text
    eyebrow: '#8498b0',      // Breadcrumb, metadata
  },

  // === Commercial Control Plane surfaces (v1.3.2 Req 7) ===
  controlPlane: {
    background: '#0d0d0d',   // Page background
    panel: '#111111',        // Card/panel background
    text: '#f4f4f4',         // Primary text
    line: '#2a2a2a',         // Borders
    muted: '#999999',        // Secondary text
    black: '#0a0a0a',        // Deepest black
    topBar: '#050505',       // Top bar background
  },

  // === Chrome translucent overlays ===
  chrome: {
    lineDark: 'rgba(255,255,255,.14)',
    searchBg: 'rgba(255,255,255,.075)',
    searchBorder: 'rgba(255,255,255,.24)',
    textMuted: 'rgba(255,255,255,.7)',
    textSubtle: 'rgba(185,210,238,.72)',
    textHeading: 'rgba(220,235,255,.82)',
  },

  // === Brand wordmark colours (v1.3.2 Req 10) ===
  brand: {
    seiertech: '#f4f1eb',    // Cream/off-white for SEIERTECH
    commander: '#ffd21f',    // Gold for COMMANDER
    sdr: '#ffffff',          // White for SDR
    pipe: '#ffd21f',         // Gold pipe separator
  },

  // === Status colours (paired with text/shape per v1.3 Req 24) ===
  status: {
    live: '#1a7a3f',         // Active, healthy, resolved (v1.3.2 green)
    build: '#ffd21f',        // In progress, building (gold)
    scaffold: '#68758b',     // Planned, scaffold (muted)
    stub: '#475569',         // Stub, placeholder
    critical: '#d92d20',     // P0, critical, emergency (v1.3.2 red)
    warning: '#f59e0b',      // Warning, attention needed
    info: '#3b82f6',         // Informational
  },

  // === Priority colours ===
  priority: {
    p0: '#d92d20',           // Zero-day, critical emergency
    p1: '#f97316',           // High priority
    p2: '#f59e0b',           // Medium priority
    p3: '#3b82f6',           // Standard
    p4: '#68758b',           // Low priority
  },

  // === Visual intensity levels (Spec #41 §5) ===
  intensity: {
    standard: {
      background: '#061936',
      accent: '#ffd21f',
      text: '#dcecff',
    },
    tactical: {
      background: '#0a1628',
      accent: '#3b82f6',
      text: '#e2e8f0',
    },
    emergency: {
      background: '#1a0a0a',
      accent: '#d92d20',
      text: '#fef2f2',
    },
  },

  // === OODA phase colours (Spec #41 §V2.6-2) ===
  ooda: {
    observe: '#3b82f6',
    orient: '#8b5cf6',
    decide: '#f59e0b',
    act: '#1a7a3f',
  },
} as const;

export type ColorToken = typeof colors;
