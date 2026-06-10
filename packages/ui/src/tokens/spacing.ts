/**
 * Commander C2 Design Tokens — Spacing & Chrome (v1.3.2 Remediated)
 *
 * v1.3.2 Requirement 8: Top bar 68px
 * v1.3.2 Requirement 9: Sidebar 306px (286px below 1450px)
 *
 * Source: shell reference v11
 */

export const spacing = {
  '0.5': '0.125rem',
  '1': '0.25rem',
  '1.5': '0.375rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '8': '2rem',
  '12': '3rem',
} as const;

/** Chrome dimensions from baseline shell references */
export const chrome = {
  /** Top bar height — exactly 68px (v1.3.2 Req 8) */
  topBarHeight: '68px',
  /** Sidebar width — exactly 306px on standard viewports (v1.3.2 Req 9) */
  sidebarWidth: '306px',
  /** Sidebar width — 286px below 1450px viewport (v1.3.2 Req 9) */
  sidebarWidthNarrow: '286px',
  /** Responsive breakpoint for sidebar narrowing */
  sidebarBreakpoint: '1450px',
  /** Page header height */
  pageHeaderHeight: '76px',
  /** Search input width — 440px (v1.3.2 Req 12) */
  searchWidth: '440px',
  /** Search input width — narrow viewport */
  searchWidthNarrow: '360px',
  /** Sidebar scrollbar width — 6px (v1.3.2 Req 15) */
  scrollbarWidth: '6px',
  /** Sidebar group header height */
  groupHeaderHeight: '38px',
  /** Sidebar sub-item height */
  subItemHeight: '27px',
  /** Avatar size (v1.3.2 Req 18) */
  avatarSize: '34px',
  /** Icon button size */
  iconSize: '38px',
} as const;

export const radii = {
  none: '0',
  sm: '2px',
  md: '4px',
  lg: '6px',
  xl: '8px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 2px 4px rgba(0, 0, 0, 0.4)',
  lg: '0 4px 8px rgba(0, 0, 0, 0.5)',
  glow: {
    gold: '0 0 8px rgba(255, 210, 31, 0.3)',
    critical: '0 0 8px rgba(217, 45, 32, 0.3)',
    info: '0 0 8px rgba(59, 130, 246, 0.3)',
  },
} as const;

export type SpacingToken = typeof spacing;
export type ChromeToken = typeof chrome;
