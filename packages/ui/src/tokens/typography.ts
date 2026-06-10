/**
 * Commander SDR Design Tokens — Typography System
 *
 * Single-font Inter system. All application text uses Inter.
 * Font weight carries semantic meaning — no separate font families
 * for bold, semibold, display, logo, or technical text.
 *
 * Two typography contexts:
 *   1. Application UI — navigation, cards, tables, forms, KPIs, badges
 *   2. Prose / rich-text — case notes, AI summaries, reports, playbooks
 *
 * Source: Commander SDR typography baseline (2026-05-29)
 */

const inter = "'Inter', system-ui, sans-serif";

// ─── Font families ────────────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    /** Primary application font — Inter for all UI text */
    body: inter,
    /** Logo/wordmark text — Inter (logo will be replaced by image asset) */
    display: inter,
    /** Technical/code-style text — Inter (mono alias for backward compat) */
    mono: inter,
    /** All text — single alias */
    base: inter,
  },

  // ─── Font sizes ─────────────────────────────────────────────────────────────
  fontSize: {
    /** 10px — h6, role labels */
    xs: '10px',
    /** 11px — micro labels, timestamps, badges, dense metadata */
    micro: '11px',
    /** 12px — secondary/meta text, sidebar group headers, table headers */
    sm: '12px',
    /** 13px — dense table body, technical text */
    dense: '13px',
    /** 14px — base body text, navigation, buttons, h4 */
    base: '14px',
    /** 16px — h3, card titles, subsection headings */
    md: '16px',
    /** 18px — large text */
    lg: '18px',
    /** 20px — h2, major section headings */
    xl: '20px',
    /** 24px — h1, page titles, KPI values */
    h1: '24px',
    /** 28px — hero KPI values */
    heroKpi: '28px',
    // Legacy brand wordmark aliases (kept for backward compat)
    /** 21px — brand wordmark SEIERTECH */
    brandSm: '21px',
    /** 23px — brand wordmark COMMANDER/SDR */
    brandLg: '23px',
    /** 22px — legacy display alias */
    sidebarSub: '12px',
  },

  // ─── Font weights ────────────────────────────────────────────────────────────
  fontWeight: {
    /** 400 — body text, paragraphs, normal labels */
    normal: '400',
    /** 500 — navigation items, metadata values, secondary emphasis */
    medium: '500',
    /** 600 — card titles, section headings, tabs, buttons, table headers */
    semibold: '600',
    /** 700 — page headings, major headings, sidebar group headers */
    bold: '700',
    /** 800 — Commander AI / control-plane strong emphasis only */
    extrabold: '800',
  },

  // ─── Line heights ────────────────────────────────────────────────────────────
  lineHeight: {
    /** 1.2 — headings */
    tight: '1.2',
    /** 1.3 — dense tables */
    dense: '1.3',
    /** 1.4285714286 — body text and prose */
    normal: '1.4285714286',
    /** 1.1 — KPI metric values */
    kpi: '1.1',
    /** 1.45 — long descriptions where extra breathing room is needed */
    relaxed: '1.45',
  },

  // ─── Letter spacing ──────────────────────────────────────────────────────────
  letterSpacing: {
    /** 0 — all standard text */
    normal: '0',
    /** 0.06em — uppercase eyebrows, badge text */
    eyebrow: '0.06em',
    /** 0.08em — compact badge text */
    badge: '0.08em',
    /** 0.09em — brand wordmark (kept for backward compat) */
    display: '0.09em',
    /** 0.11em — brand wordmark wide variant (kept for backward compat) */
    displayWide: '0.11em',
  },

  // ─── Heading contracts ───────────────────────────────────────────────────────
  // Each heading role defines: size + weight + lineHeight + letterSpacing
  heading: {
    h1: { fontSize: '24px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '0' },
    h2: { fontSize: '20px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '0' },
    h3: { fontSize: '16px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0' },
    h4: { fontSize: '14px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0' },
    h5: { fontSize: '12px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0' },
    h6: { fontSize: '10px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '0' },
  },

  // ─── Application UI role tokens ──────────────────────────────────────────────
  role: {
    pageTitle:           { fontFamily: inter, fontSize: '24px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '0' },
    majorSectionTitle:   { fontFamily: inter, fontSize: '20px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '0' },
    cardTitle:           { fontFamily: inter, fontSize: '16px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0' },
    subsectionTitle:     { fontFamily: inter, fontSize: '16px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0' },
    compactSectionTitle: { fontFamily: inter, fontSize: '14px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0' },
    bodyText:            { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.4285714286', letterSpacing: '0' },
    secondaryText:       { fontFamily: inter, fontSize: '12px', fontWeight: '400', lineHeight: '1.4285714286', letterSpacing: '0' },
    microText:           { fontFamily: inter, fontSize: '11px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0.06em' },
    navText:             { fontFamily: inter, fontSize: '14px', fontWeight: '500', lineHeight: '1.2', letterSpacing: '0' },
    sidebarGroupHeader:  { fontFamily: inter, fontSize: '12px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '0' },
    sidebarSubmenuItem:  { fontFamily: inter, fontSize: '12px', fontWeight: '500', lineHeight: '1.2', letterSpacing: '0' },
    tableHeader:         { fontFamily: inter, fontSize: '12px', fontWeight: '600', lineHeight: '1.3', letterSpacing: '0' },
    tableBody:           { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.3', letterSpacing: '0' },
    denseTableBody:      { fontFamily: inter, fontSize: '12px', fontWeight: '400', lineHeight: '1.3', letterSpacing: '0' },
    buttonText:          { fontFamily: inter, fontSize: '14px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0' },
    badgeText:           { fontFamily: inter, fontSize: '11px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0.06em' },
    kpiValue:            { fontFamily: inter, fontSize: '24px', fontWeight: '700', lineHeight: '1.1', letterSpacing: '0' },
    heroKpiValue:        { fontFamily: inter, fontSize: '28px', fontWeight: '700', lineHeight: '1.1', letterSpacing: '0' },
    logoText:            { fontFamily: inter, fontSize: '22px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '0.09em' },
    technicalText:       { fontFamily: inter, fontSize: '13px', fontWeight: '500', lineHeight: '1.3', letterSpacing: '0' },
    metadataText:        { fontFamily: inter, fontSize: '12px', fontWeight: '400', lineHeight: '1.4285714286', letterSpacing: '0' },
    breadcrumb:          { fontFamily: inter, fontSize: '12px', fontWeight: '400', lineHeight: '1.2', letterSpacing: '0' },
    tabText:             { fontFamily: inter, fontSize: '14px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0' },
    inputLabel:          { fontFamily: inter, fontSize: '14px', fontWeight: '500', lineHeight: '1.2', letterSpacing: '0' },
    placeholder:         { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.2', letterSpacing: '0' },
    helperText:          { fontFamily: inter, fontSize: '12px', fontWeight: '400', lineHeight: '1.4285714286', letterSpacing: '0' },
    emptyState:          { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.4285714286', letterSpacing: '0' },
  },

  // ─── Prose / rich-text role tokens ───────────────────────────────────────────
  // Used for case notes, AI summaries, reports, playbooks, policy text
  prose: {
    h1:          { fontFamily: inter, fontSize: '24px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '0' },
    h2:          { fontFamily: inter, fontSize: '20px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '0' },
    h3:          { fontFamily: inter, fontSize: '16px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0' },
    h4:          { fontFamily: inter, fontSize: '14px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0' },
    h5:          { fontFamily: inter, fontSize: '12px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0' },
    h6:          { fontFamily: inter, fontSize: '10px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '0' },
    paragraph:   { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.4285714286', letterSpacing: '0' },
    small:       { fontFamily: inter, fontSize: '12px', fontWeight: '400', lineHeight: '1.4285714286', letterSpacing: '0' },
    blockquote:  { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.4285714286', letterSpacing: '0' },
    citation:    { fontFamily: inter, fontSize: '12px', fontWeight: '400', lineHeight: '1.4285714286', letterSpacing: '0' },
    kbd:         { fontFamily: inter, fontSize: '12px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '0' },
    address:     { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.4285714286', letterSpacing: '0' },
    // Inline semantic — inherit size, vary weight/style
    strong:      { fontWeight: '700' },
    emphasis:    { fontStyle: 'italic', fontWeight: '400' },
    // Text roles
    primary:     { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.4285714286' },
    secondary:   { fontFamily: inter, fontSize: '12px', fontWeight: '400', lineHeight: '1.4285714286' },
    body:        { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.4285714286' },
    success:     { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.4285714286' },
    info:        { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.4285714286' },
    warning:     { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.4285714286' },
    danger:      { fontFamily: inter, fontSize: '14px', fontWeight: '400', lineHeight: '1.4285714286' },
  },
} as const;

export type TypographyToken = typeof typography;
