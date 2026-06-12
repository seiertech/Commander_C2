/**
 * Commander C2 — Component Tokens (Layer 3)
 *
 * Per-component pinned dimensions.
 * Source: docs/06_ui_build_reference/DESIGN_SYSTEM.md §4
 */

import { primitiveSpacing, primitiveRadii } from './primitives';

export const componentTokens = {
  topbarHeight: '56px',
  sidebarWidth: '280px',
  sidebarRail: '72px',

  // Top navigation sizing — Requirement 18.1
  topNavTextSize: '14px',
  topNavTextWeight: 500,
  topNavLineHeight: 1.2,
  topNavItemHeight: '44px',
  topNavUnderline: '2px',

  // Sidebar primary navigation sizing — Requirement 18.1
  sidebarNavTextSize: '14px',
  sidebarNavTextWeight: 500,
  sidebarNavLineHeight: 1.2,

  // Sidebar sub-navigation sizing — Requirement 18.1
  sidebarSubNavTextSize: '12px',
  sidebarSubNavTextWeight: 500,
  sidebarSubNavLineHeight: 1.2,

  // Sidebar group header sizing — Requirement 18.1
  sidebarGroupHeaderTextSize: '12px',
  sidebarGroupHeaderTextWeight: 700,
  sidebarGroupHeaderLineHeight: 1.2,

  // Sidebar row heights — Requirement 18.1
  sidebarRowHeight: '40px',
  sidebarSubRowHeight: '36px',

  cardPadding: primitiveSpacing[4],    // 16px
  cardRadius: primitiveRadii.md,        // 2px (sharp corners per Tweak Pass A)
  gridGap: primitiveSpacing[4],         // 16px
  gridColumns: 12,                      // 12-column grid system
  contentPadding: primitiveSpacing[5],  // 24px
  pageheaderPadding: primitiveSpacing[5], // 24px
  tableRowHeight: '36px',
  tableHeaderHeight: '40px',
  buttonHeight: '32px',
  buttonHeightEmphasis: '36px',
  inputHeight: '34px',
  itemHeight: '36px',
  searchWidth: '440px',                 // within 360–480px range — no change needed
  avatarSize: '32px',
  cardHeaderMargin: primitiveSpacing[3], // 12px — consistent card header bottom margin
  cardListMaxHeight: '360px',           // max-height for scrollable card lists
} as const;

export type ComponentTokens = typeof componentTokens;
