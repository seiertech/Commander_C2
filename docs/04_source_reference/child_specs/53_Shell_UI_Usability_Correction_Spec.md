> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #53 — Shell UI Usability Correction

## Status
Active baseline authority for Commander SDR v2.5.

## Purpose
Lock the final pre-build shell usability corrections without changing the shell geometry or restarting the design process.

## Binding Doctrine
- Shell geometry remains stable.
- Navigation structure may be expanded and corrected.
- Search must be usable and not cramped.
- Sidebar must visibly support scroll and expansion.
- Build mode may show all menu items; runtime mode suppresses by policy.
- HTML shell references demonstrate behaviour; production dynamic behaviour is implemented during frontend build.

## Global Search / Command Search
Search must be treated as a command surface, not a tiny utility input.

Requirements:
- placed before Commander AI
- minimum desktop width: 360px
- preferred large-screen width: 420–520px
- placeholder: `Search cases, assets, CVEs, identities, rules…`
- visible at normal desktop widths
- supports later global command behaviour
- may collapse only on narrow layouts

Recommended order:
```text
Navigation | Global Search | Commander AI | Notifications | Settings | User
```

## Commander AI Placement
Commander AI remains prominent and adjacent to search.

Reason:
- search locates the object
- Commander AI explains, summarises or recommends against it

## Sidebar Scroll
Sidebar must:
- scroll independently from main content
- show a visible scrollbar when content overflows
- preserve expanded sections
- keep active item visible
- support deep admin menus
- support keyboard navigation later

Minimum style requirements:
```css
.sidebar-nav { overflow-y: auto; scrollbar-width: thin; }
.sidebar-nav::-webkit-scrollbar { width: 6px; }
.sidebar-nav::-webkit-scrollbar-thumb { visible contrast against dark sidebar; }
```

## Menu Expand/Collapse
HTML shell reference must show:
- expanded section
- collapsed section
- caret state
- nested submenu
- active child item
- build-mode placeholder/status badges

Frontend build must implement:
- real expand/collapse state
- persisted user preference
- route-aware active states
- RBAC-filtered menu tree
- build-mode full menu
- runtime suppressed menu
- scroll-to-active item

## Active Shell Files
v2.5 active shell references:
- `commander-sdr-shell-v11-admin-navigation.html`
- `commander-commercial-control-plane-shell-v3-admin-navigation.html`

Older shell files are reference/archive only and are not build-authoritative.
