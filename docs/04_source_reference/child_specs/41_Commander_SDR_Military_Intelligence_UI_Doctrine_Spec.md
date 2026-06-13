> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# 41 — Commander SDR Military-Intelligence UI Doctrine Specification

## 1. Status
- Version: v1.0
- Pack revision: v2.3
- Authority: UI doctrine authority for Commander SDR Operational App, Commander SDR Tenant Admin Surface, and Commander Internal Control Plane Application.
- Supersedes: any visual guidance that conflicts with this document.
- Does not supersede: closed-loop case doctrine, P0 Zero-Day doctrine, application-boundary doctrine, validation doctrine, routing doctrine, or risk-object binding doctrine.

## 2. Doctrine Statement
Commander SDR shall present as a command-grade security drift and remediation platform, not a generic SaaS dashboard.

The interface shall be:
- operationally dense;
- square and grid-based;
- intelligence-led;
- evidence-forward;
- high-contrast where urgency requires it;
- calm and scannable for normal operations;
- visually escalated only when operational urgency escalates.

## 3. Shell Preservation Doctrine
The established shell is structurally fixed unless explicitly superseded by an approved shell migration.

Do not change without approval:
- top navigation location;
- left navigation location;
- brand lockup location;
- Commander AI location;
- user/avatar location;
- search location;
- notification/settings location;
- sidebar expansion model;
- sidebar scroll behaviour;
- primary content-canvas contract.

Permitted changes:
- visual tokens;
- density;
- panel styling;
- graph/gauge/overlay styling;
- content layouts;
- page-level composition;
- role-based page availability;
- application-specific shell variant styling that keeps the boundary intact.

## 4. Application Surface Treatment

| Surface | Primary Users | Treatment | Intensity Ceiling |
|---|---|---|---|
| Commander SDR Operational App | analysts, engineers, managers, CISOs | command/intelligence operations | Level 3 |
| Commander SDR Tenant Admin Surface | tenant admins, security architects, governance owners | controlled administrative console | Level 2 |
| Commander Internal Control Plane | internal operators, commercial/platform admins | secure operator-console | Level 2, Level 3 only for emergency controls |

## 5. Visual Intensity Levels

### Level 1 — Operational Standard
Used for:
- normal case lists;
- vulnerability pages;
- identity pages;
- architecture pages;
- assets;
- reporting;
- routine dashboards.

Rules:
- high-density but readable;
- minimal animation;
- square panels;
- clear table hierarchy;
- restrained colour;
- visible priority and validation state.

### Level 2 — Tactical Analysis
Used for:
- Fusion Map;
- blast-radius analysis;
- exposure paths;
- dependency map;
- control overlays;
- tool/coverage overlays.

Rules:
- tactical dark canvas allowed;
- node-link graph allowed;
- heat grids allowed;
- arc meters allowed;
- telemetry bars allowed;
- overlays must be toggleable.

### Level 3 — Emergency Command
Used for:
- P0 Zero-Day cases;
- active exploitation;
- surge mode;
- mission-critical blast radius;
- executive emergency view.

Rules:
- persistent P0 banner;
- SLA countdown;
- senior owner accountability;
- validation cadence visible;
- communication cadence visible;
- escalation rails visible;
- no decorative animation.

## 6. Typography

Required font families:
- Inter SemiBold/Bold for primary UI text and labels;
- IBM Plex Mono for telemetry, IDs, counters, timestamps, logs, evidence chains, connector health, and audit surfaces;
- Eurostile / Eurostile Extended for command headings where licensed and available.

Fallback rule:
- If Eurostile is unavailable, use a licensed geometric extended font or a system-safe uppercase heading treatment.
- Do not embed unlicensed font files.

## 7. Geometry
- Prefer square corners.
- Do not introduce consumer SaaS rounded-card styling.
- Do not introduce soft shadows as the primary separation method.
- Use grid, borders, separators, density, typography, and signal strips.
- Browser-native controls may be normalised, but not at the cost of accessibility.

## 8. Colour Doctrine

### 8.1 Base Tokens
- `--bg-command`: tactical black/near-black surface.
- `--bg-navy-command`: Commander navy surface.
- `--bg-panel`: panel surface.
- `--bg-panel-elevated`: raised information surface without soft SaaS shadow reliance.
- `--text-primary`: primary readable text.
- `--text-secondary`: muted operational text.
- `--line-structural`: grid/separator line.
- `--line-signal`: signal accent line.

### 8.2 Priority Tokens
- `--signal-p0`: P0 Zero-Day emergency.
- `--signal-p1`: Critical.
- `--signal-p2`: High.
- `--signal-p3`: Medium.
- `--signal-p4`: Low.
- `--signal-info`: Informational.

### 8.3 Domain Tokens
- `--domain-identity`
- `--domain-controls`
- `--domain-architecture`
- `--domain-vulnerability`
- `--domain-exposure`
- `--domain-drift`
- `--domain-tool-health`
- `--domain-coverage`
- `--domain-blast-radius`

## 9. Graph, Gauge, and Overlay Doctrine
Permitted instrumentation:
- radar sweeps;
- arc meters;
- linear gauges;
- threat corridors;
- chord diagrams;
- node-link fusion graphs;
- heat grids;
- stacked telemetry bars;
- SLA countdown rails;
- validation-state tracks;
- routing-decision rails.

Forbidden:
- decorative graphs with no decision value;
- gauges that duplicate table values without adding scan speed;
- overlays that cannot be toggled;
- animation that impairs evidence reading.

## 10. Accessibility and Cognitive Load
- High density is allowed; ambiguity is not.
- Every critical colour state must also have text, icon, or shape encoding.
- P0 must never rely on colour alone.
- Dark tactical views require contrast validation.
- Tables remain first-class for operational work.
- Fusion Map must never become the only path to act on work.

## 11. Build-Readiness Gate
A page/component is not build-ready until it defines:
- application surface;
- user role;
- intensity level;
- data objects;
- lifecycle state bindings;
- routing bindings;
- validation bindings;
- strategy bindings;
- Fusion Map bindings where applicable;
- P0 behaviour where applicable;
- accessibility constraints.

---

# v2.3 UI Doctrine Integration Addendum — Commander Military-Intelligence Interface

## Status
- This addendum supersedes any visual or interaction guidance that conflicts with the v2.3 UI doctrine.
- It does not alter closed-loop case doctrine, P0 Zero-Day doctrine, application-boundary doctrine, risk-object binding doctrine, validation doctrine, routing doctrine, or Fusion Map doctrine.
- It preserves existing shell geometry and navigation boundaries unless a later approved shell migration explicitly replaces them.

## Binding UI Doctrine
Commander SDR uses a fixed operational shell with a military-intelligence visual system applied at the content, dashboard, graph, gauge, overlay, map, pulse, case-detail, and control-surface layers.

The shell frame is not to be repeatedly redesigned. Visual evolution is controlled through:
- design tokens;
- typography;
- density rules;
- square component geometry;
- command-grade instrumentation;
- graph/gauge/overlay systems;
- semantic priority and domain colour rules;
- application-specific treatment for the Operational App, Tenant Admin Surface, and Commander Internal Control Plane.

## Application Surface Rule
The doctrine applies differently by surface:

| Surface | Treatment |
|---|---|
| Commander SDR Operational Application | Strongest command/intelligence treatment; risk, case, Fusion Map, pulse, P0, validation, communication, and mission surfaces. |
| Commander SDR Tenant Admin Surface | Controlled administrative treatment; same tokens and square geometry, lower visual intensity, strong form/table usability. |
| Commander Internal Control Plane Application | Secure operator-console treatment; customers, tenants, licences, entitlements, features, deployment rings, support access, emergency controls, and audit. |

## Shell Preservation Rule
Do not change without explicit approval:
- top bar placement;
- left navigation placement;
- product/brand lockup placement;
- Commander AI placement;
- search/user/notification placement;
- sidebar expansion and scroll behaviour;
- core content-canvas contract;
- distinction between Operational App, Tenant Admin Surface, and Commander Internal Control Plane.

## Visual Intensity Model
| Level | Name | Used For | Visual Behaviour |
|---|---|---|---|
| 1 | Operational Standard | normal cases, dashboards, assets, vulnerabilities, identity, architecture, reporting | dense, square, calm, readable, navy/gold/light or controlled dark surfaces |
| 2 | Tactical Analysis | Fusion Map, blast radius, exposure, threat corridor, dependency map, control overlays | dark tactical canvas, overlays, node-link views, heat grids, gauges |
| 3 | Emergency Command | P0 Zero-Day, active exploitation, surge mode, mission-critical risk | maximum contrast, P0 banner, SLA countdown, owner accountability, live pulse, escalation rails |

## Non-Negotiable Usability Guardrail
The interface must remain faster to operate than it is to admire. Visual intensity must never reduce scan speed, evidence traceability, routing clarity, validation clarity, closure-gate clarity, or senior accountability.

## P0 Zero-Day UI Rule
P0 Zero-Day is rendered as an emergency priority overlay, not a lifecycle state. It must appear consistently across:
- case list;
- case detail;
- Command Centre;
- CISO dashboard;
- Fusion Map;
- Team Pulse;
- Domain Pulse;
- Mission Pulse;
- Routing Console;
- Validation Console;
- Communication surfaces;
- Tenant Admin policy pages;
- Commander Internal Control Plane entitlement and emergency-control surfaces where applicable.

## Build Pipeline Rule
No new UI page is build-ready unless it declares:
- surface owner;
- target application;
- intensity level;
- required data objects;
- lifecycle bindings;
- routing bindings;
- validation bindings;
- strategy bindings;
- Fusion Map bindings where applicable;
- P0 behaviour where applicable;
- accessibility and density constraints.


---

# v2.6 Extension — UI Doctrine Addendum

**Extension version:** v2.6.0
**Extension date:** May 2026
**Extension scope:** Extends the Military Intelligence UI Doctrine with Security Command and Control vocabulary, OODA visualisation conventions, and dual operating picture conventions. All existing UI doctrine above this section remains in force unchanged.

## V2.6-1. Security Command and Control Vocabulary

The v2.6 release introduces Security C2 as Commander's category position (Spec #57). The UI doctrine adopts C2-consistent vocabulary across the product:

| Concept | Preferred UI Label | Avoid |
|---|---|---|
| The platform's category position | "Security Command and Control" or "Security C2" | "Posture platform", "CTEM platform" (these understate) |
| The operational discipline | "Security Drift Response" or "SDR" | Just "drift detection" (understates the closed loop) |
| The unified intelligence layer | "Intelligence Layer" or "Estate Intelligence Picture" | "Dashboard layer" (generic) |
| The four phases of programme operation | "Observe", "Orient", "Decide", "Act" — capitalised, in this order | Lowercase or paraphrased |
| The continuous loop | "Security OODA Loop" or "OODA Loop" | "Process loop", "Workflow loop" |
| External attack picture | "External Operating Picture" | "Attack dashboard", "Threat view" |
| Internal attack picture | "Internal Operating Picture" | "Insider risk dashboard" |
| The aggregate defence story | "Silent Defence" | "Background activity" |

The vocabulary discipline is consistent across UI labels, tooltips, navigation, help text, and documentation. Customer-facing copy in v2.6 surfaces uses this vocabulary.

## V2.6-2. OODA Visualisation Conventions

The four OODA phases are visualised consistently across surfaces:

- **Observe phase** — left-most in horizontal layouts, top in vertical layouts. Cool blue accent (`#5B9BD5`) when healthy, amber when degraded, red when severely degraded.
- **Orient phase** — second position. Cool teal accent (`#4FAB97`) when healthy.
- **Decide phase** — third position. Warm yellow-green accent (`#A9C46C`) when healthy.
- **Act phase** — right-most / bottom. Decisive orange-amber accent (`#F0A500`) when healthy.

When a phase is the current bottleneck, it carries a visible indicator (pulsing border, "BOTTLENECK" badge, increased contrast). The bottleneck indicator does not change the phase colour — it adds a visual layer on top of the phase's normal colour.

OODA tempo is visualised as:

- A horizontal stacked bar showing time-in-each-phase per case type
- A trend line showing tempo over time (24-hour, 7-day, 30-day windows)
- A "tempo target" reference line that the SOM can set per case type

## V2.6-3. Dual Operating Picture Conventions

The External Operating Picture and Internal Operating Picture share the estate base map but diverge in foreground visual language:

| Visual Element | External Operating Picture | Internal Operating Picture |
|---|---|---|
| Foreground colour palette | Reds, oranges, attack-indicating | Ambers, violets, behavioural-indicating |
| Foreground icons | Crosshairs, attack chains, threat actor markers | Identity icons, department badges, behavioural pattern markers |
| Ring conventions | Pre-warned (amber ring), Protected (green ring), Novel (grey-dashed ring) — per Spec #71 | Peer-deviation rings, geographic anomaly rings |
| Drill-down destinations | External Attack Correlation case, Identity/Asset Intelligence Surface (threat context) | Verdict Pattern case (where authority permits), Identity Intelligence Surface (behavioural section) |

The visual divergence is intentional — viewers should immediately distinguish whether they are looking at external attack activity or internal behavioural activity. The two surfaces are NEVER overlaid simultaneously.

## V2.6-4. Pre-Warned/Protected/Novel Ring Conventions

Per Spec #71, the three-way classification is visualised:

- **Pre-warned** — amber ring around the affected entity, labelled "PRE-WARNED" with confidence percentage.
- **Protected** — green ring, labelled "PROTECTED" with confidence percentage.
- **Novel** — grey dashed ring, labelled "NOVEL" with classification confidence (typically low — "novel" means insufficient evidence to classify).

The classification is visible on the External Operating Picture (as a ring on attack markers), on the Case Response Board (as a badge on External Attack Correlation cases), and on the Asset Intelligence Surface (in the threat intelligence section).

## V2.6-5. Direction Board Visual Conventions

Direction Boards (Spec #70) use a consistent visual pattern:

- Two-column layout: "Current State" on the left, "Direction of Travel" on the right.
- Current State shows the metric snapshot.
- Direction of Travel shows trend arrows (up/down/flat) with magnitude and the suggested next action.
- Action items are clickable and link to the relevant case generation.

The Control Weakness Direction Board uses red-to-green colour scaling for control coverage. The Policy Effectiveness Direction Board uses amber-to-green colour scaling for effectiveness percentage.

## V2.6-6. RBAC-Sensitive UI Behaviour

UI elements that surface Internal Risk-authorised content (Verdict Pattern cases, Behavioural Intelligence sections) follow consistent visual conventions:

- **Without Internal Risk authority:** the relevant section displays "Aggregate view available — drill-down requires Internal Risk authority" placeholder.
- **With Internal Risk authority:** full per-identity detail visible, with access audit indicator visible at the top of the section.

The audit indicator is a small icon with hover text: "Access to this section is audited per Spec #75."

