> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# 43 — Commander SDR Graph, Gauge, and Overlay System Specification

## 1. Status
- Version: v1.0
- Pack revision: v2.3
- Purpose: Defines the visual instrumentation language for Commander SDR maps, dashboards, tactical workspaces, and emergency views.

## 2. Instrumentation Doctrine
Graphs, gauges, and overlays exist to improve decision speed, not to decorate the interface.

Every visual instrument must answer at least one of:
- What is the risk?
- Where is the risk?
- Who owns it?
- What is blocking closure?
- What changed?
- What is exposed?
- What is unvalidated?
- What is routing incorrectly?
- What is P0?
- What affects the mission?

## 3. Approved Graph Types

| Graph Type | Use | Not For |
|---|---|---|
| Node-link Fusion Graph | domain relationships, blast radius, case/risk binding | simple tabular work queues |
| Chord Diagram | high-level relationship density between domains/teams | individual case execution |
| Threat Corridor | exposure-to-impact pathway | routine summary metrics |
| Heat Grid | coverage, SLA, validation, domain posture | evidence chains |
| Stacked Telemetry Bar | source/tool/connector composition | complex ownership relationships |
| Timeline Track | case, validation, communication, audit | unrelated metric comparison |
| Arc Meter | posture or strength score | exact numeric analysis where table is better |
| Linear Gauge | SLA, validation cadence, freshness | domain relationships |
| Radar Sweep | live signal/pulse context | static reporting |

## 4. Required Overlays

| Overlay | Surface | Required Bindings |
|---|---|---|
| Risk Overlay | Fusion Map / Command Centre | risk object, case, priority |
| Drift Overlay | Fusion Map / Architecture | drift object, validation, closure gate |
| Exposure Overlay | Fusion Map / Exposure | exposure object, internet/internal split |
| Identity Overlay | Fusion Map / Identity | identity chain, privilege, blast path |
| Control Stack Overlay | Fusion Map / Controls | control, compensating control, control gap |
| Blast Radius Overlay | Fusion Map / P0 War Room | affected nodes, mission, criticality |
| Coverage Overlay | Fusion Map / Tool Health | tool, connector, coverage state |
| Tool Health Overlay | Fusion Map / Platform | connector freshness, ingestion health |
| Case Pulse Overlay | Fusion Map / Case Management | open, reopened, blocked, P0 |
| P0 Zero-Day Overlay | All tactical surfaces | P0 case, owner, SLA, routing, validation |

## 5. Overlay Interaction Rules
- Every overlay must be toggleable.
- P0 overlay is always visible by default for authorised users.
- Overlay state must be represented in the URL or view state where practical.
- Clicking a node opens the bound object panel.
- Clicking an edge opens evidence and relationship rationale.
- No overlay may create a case manually.
- Overlay interactions may prioritise, filter, request validation, request routing review, or open evidence.

## 6. Fusion Map Visual Encoding

### Node Encoding
- shape = node type;
- border = validation state;
- signal strip = priority;
- fill tint = domain;
- badge = P0 / SLA / closure blocker / reopened;
- pulse = active change, not decoration.

### Edge Encoding
- line pattern = edge type;
- thickness = confidence/impact;
- colour = domain or risk relationship;
- arrow = direction of dependency/impact;
- badge = evidence age or validation state.

## 7. Gauge Rules
Approved gauges:
- Threat;
- Exposure;
- Drift;
- Control Strength;
- Identity Exposure;
- Blast Radius;
- Operational Tempo;
- System Pulse;
- Team Pulse;
- Domain Pulse;
- Validation Freshness;
- Connector Freshness;
- SLA Burn.

Gauge requirements:
- label required;
- numeric value required;
- threshold required;
- trend required where available;
- source required;
- drill-through required.

## 8. P0 Visual Rules
P0 Zero-Day visual treatment must include:
- persistent P0 label;
- non-colour symbol or text indicator;
- senior owner;
- SLA countdown;
- validation cadence;
- routing state;
- communication cadence;
- generated sub-actions;
- downgrade authority.

## 9. Performance Guardrails
- Fusion Map must degrade gracefully for large estates.
- Use clustering for high node counts.
- Use progressive disclosure for overlays.
- Default views must not render every edge at once.
- Tactical surfaces must remain usable on standard enterprise laptops.

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

