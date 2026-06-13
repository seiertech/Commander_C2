> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #65 — External Operating Picture Surface Specification

**Document ID:** `65_External_Operating_Picture_Surface_Spec.md`
**Spec:** 65
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Surface Specification
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `57_Security_Command_and_Control_Doctrine_Spec.md`
- `58_Security_OODA_Loop_Specification.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `60_Internal_and_External_Attack_Surface_Framework_Spec.md`
- `61_Universal_Security_Signal_Connector_Contract_Spec.md`
- `41_Commander_SDR_Military_Intelligence_UI_Doctrine_Spec.md` (v2.6 addendum)

**Subordinate consumers:** Spec #71 (Pre-Warned Classification — visual conventions), Spec #74 (Context-Aware Drift Prioritisation — priority visualisation).

## 1. Status

This is a binding surface specification. It defines the External Operating Picture as the primary command surface for external attack activity against the estate.

## 2. Surface Statement

The External Operating Picture (External COP) is Commander's command-grade dashboard for external attack activity. It is one of two paired Operating Pictures introduced in v2.6 — the External COP visualises external threat actor activity against the estate; the Internal Operating Picture (Spec #66) visualises internal actor behavioural patterns.

The External COP composes the Estate Intelligence Picture (Spec #59) into a battlefield view that answers the CISO's primary command question: *"What is happening on my external attack surface right now, where is my defence holding, where is it bending, and what does my SOC need to know that they can't see from inside their own platform?"*

The External COP does not replace the Fusion Map (Spec #33). The Fusion Map is the multi-domain graph view (node-link-and-overlay) used for tactical analysis. The External COP is the tactical zone-map view (battlefield map with overlay) used for command-level situational awareness. Both serve different command moments.

## 3. Surface Composition

The External COP is composed of seven principal regions:

### 3.1 Estate Map Base Layer

The base map renders the estate decomposed into operational zones. The default zones are:

- **Identity Zone** — identity providers, federation gateways, privileged identities, service accounts
- **Cloud Zone** — public cloud workloads (AWS, Azure, GCP), cloud-native services, container platforms
- **SaaS Zone** — third-party SaaS applications, OAuth boundaries, SaaS-hosted data
- **Endpoint Zone** — workstations, laptops, mobile devices, user-operated devices
- **Server Zone** — on-premises and IaaS servers, applications, services
- **Network Zone** — network infrastructure, firewalls, perimeter devices, segmentation boundaries

Each zone is rendered as a tactical region on the map. Within each zone, asset and identity entities are represented as small pips coloured by:
- Posture state (clean, drift-detected, multiple-drift, exposed)
- Coverage state (fully covered, partial coverage, blind)
- Criticality (standard, important, critical, mission-critical)

Custom zone configurations are supported per tenant. Customers with non-standard estate decomposition can configure zones aligned to their business architecture (e.g. "Trading Floor Zone", "Patient Records Zone", "Manufacturing OT Zone").

### 3.2 External Attack Overlay

The attack overlay renders external attack activity as foreground markers on the base map:

- **Active attack markers** — crosshair markers on entities currently subject to active external attack (linked to External Attack Correlation cases or correlated SOC cases)
- **Attack chain lines** — when SOC cases indicate multi-stage attacks crossing zones, lines connect the affected entities showing the attack path
- **Attack volume indicators** — zones with elevated attack activity highlighted with intensity gradient
- **Recent attack markers** — entities subject to attack activity in the past 24 hours rendered with faded markers
- **Historical attack heatmap** — optional overlay showing 7-day or 30-day attack pattern density per zone

### 3.3 Pre-Warned and Protected Classification Rings

Every attack marker is annotated with its classification ring (per Spec #71):

- **Amber ring** — pre-warned. Drift, control gap, or coverage deficit existed on the entity at attack open time.
- **Blue ring** — protected. No drift, no control gap, no known weakness — the attack landed despite Commander considering the entity protected. Investigate as potential novel TTP, sophisticated adversary, or internal compromise.
- **Grey ring** — novel. Classification too ambiguous to determine yet (e.g. SOC case still in early triage, entity resolution still resolving).
- **Green ring (optional)** — defence worked. A verdict fired on the entity that prevented or contained the attempted attack. Visible when verdict layer correlation is available.

Ring conventions are visible at the marker level and aggregated at the zone level (zone summary shows count of pre-warned vs protected vs novel attacks).

### 3.4 Case Response Board

A panel adjacent to the map displays the active case feed:

- Recent SOC cases bound to Commander entities (via Class A connector intake)
- External Attack Correlation cases generated by Commander
- For each case: case ID, severity, status (open / triage / contained / resolved per SOC platform), assignee (per SOC platform), affected entities, pre-warned classification

The Case Response Board carries the explicit attribution: **"Commander observes · SOC owns"**. This attribution is binding doctrine — the panel makes clear that Commander does not triage these cases; the SOC does. Commander provides correlation and context.

### 3.5 Control Weakness Direction Board

A panel below the map displays the Control Weakness Direction Board (specified in Spec #70):

- **Exploited controls** — controls correlated to active external attack cases. The CISO sees which control gaps drove which attacks.
- **Unexploited controls** — controls with known weakness that haven't yet been exploited. Queued for next attention.
- **Footer summary** — count of exploited controls, count of unexploited weaknesses, dominant unattended exposure category.

### 3.6 Detection Layer Indicators

A subtle layer renders detection signal activity per zone:

- **Detection density indicators** — count of recent detections per zone (without rendering individual detections — that would overwhelm the surface)
- **Detection coverage indicators** — which detection sources are providing signal for each zone, freshness state per source

Detection layer is rendered subtly so it doesn't compete with attack and weakness overlays for visual attention. Drill-down to detection detail available per zone.

### 3.7 Command Tempo Snapshot

A header strip displays the current OODA tempo metrics (per Spec #67):

- Observe phase health score
- Orient phase health score
- Decide phase health score
- Act phase health score
- Current bottleneck phase
- Estate-wide OODA tempo (hours/days for findings to traverse the loop)

The Command Tempo Snapshot is consistent with the Command Tempo Dashboard (Spec #67) — clicking through opens the full Command Tempo view.

## 4. Visual Language

The External COP visual language follows the Military Intelligence UI Doctrine (Spec #41 v2.6 addendum):

- **Intensity Level 2 (Tactical Analysis)** during normal operations
- **Intensity Level 3 (Emergency Command)** when P0 Zero-Day cases active or surge conditions
- Tactical dark canvas
- Square geometry, grid-based composition
- Eurostile or Eurostile Extended for command headings (where licensed)
- IBM Plex Mono for telemetry, IDs, timestamps, counts
- Inter SemiBold/Bold for primary UI text

**Colour conventions:**
- Red emphasis for active attack activity
- Amber for pre-warned classification
- Blue for protected classification
- Grey for novel/ambiguous
- Green for defence-worked verdict overlay (optional)
- Tactical neutral tones for base map zones
- Status tokens per Spec #41 for priority states (P0, P1, P2, P3, P4)

**Animation:**
- No decorative animation
- Subtle pulse on newly-arrived attack markers (configurable, off by default in production)
- SLA countdown rails on critical cases (when Case Response Board is in detail mode)

## 5. Interaction Model

The External COP supports the following interactions:

- **Click on attack marker** → opens the bound External Attack Correlation case in case detail view
- **Click on SOC case in Case Response Board** → opens the SOC case context view (Commander's record; the SOC's case lives in their platform)
- **Click on entity pip on base map** → opens the entity-centric drill-down (Identity Intelligence Surface or Asset Intelligence Surface per entity type)
- **Click on zone** → drills into zone-specific view with detailed entity list, attack activity, control state
- **Click on control in Control Weakness Direction Board** → opens the control detail with case correlation
- **Click on Command Tempo Snapshot** → opens full Command Tempo Dashboard
- **Toggle overlay layers** — pre-warned/protected rings, detection density, historical attack heatmap, attack chain lines
- **Time scrubber** — visualise estate at past timestamps (within retention window) to see how the picture evolved

All interactions preserve the "Commander observes · SOC owns" attribution where SOC cases are involved.

## 6. RBAC and Persona Access

The External COP is accessible to:

- **CISO** — full access, default landing surface in Executive Posture workspace
- **SOM** — full access in Drift Operations workspace
- **Security Architect** — full access in Control & Architecture workspace
- **Security Analyst** — full access in Drift Operations workspace
- **Security Operations Analyst** — read access, drill-down restricted to assigned cases
- **Vulnerability Analyst** — read access, drill-down to vulnerability-correlated cases
- **Risk Analyst** — read access, drill-down to risk-correlated views
- **Other personas** — per Spec #19 v2.6 RBAC matrix

Default workspace placement: Executive Posture and Drift Operations.

## 7. Build Readiness

The External COP is build-ready when:

- Estate map base layer renders with configurable zone definitions
- External attack overlay consumes from External Attack Intelligence stream (Spec #59)
- Pre-warned classification rings render per Spec #71
- Case Response Board renders SOC case context with "Commander observes · SOC owns" attribution
- Control Weakness Direction Board renders per Spec #70
- Detection layer indicators render with appropriate visual subtlety
- Command Tempo Snapshot integrates with Spec #67 Command Tempo Dashboard
- All interactions per Section 5 are functional
- RBAC per Section 6 is enforced
- Visual language conforms to Spec #41 v2.6 addendum

## 8. Configurability

Tenant-configurable parameters (Spec #55 v2.6):

- Custom zone definitions
- Overlay default visibility (which layers visible by default)
- Time window for "recent" attack markers (default 24h)
- Historical heatmap window (default 7d, 30d options)
- Pre-warned classification ring visibility (default on; can be configured off in jurisdictions where the classification language is sensitive)
- Detection layer indicator density (subtle, medium, prominent)

System defaults shipped at build.

## 9. Audit Events

- `EXTERNAL_OPERATING_PICTURE_ACCESSED` — surface query with persona and scope
- `EXTERNAL_COP_DRILL_DOWN` — drill from COP to entity, case, or zone
- `EXTERNAL_COP_OVERLAY_TOGGLED` — overlay layer change
- `EXTERNAL_COP_TIME_SCRUBBED` — historical view requested with timestamp

## 10. Relationship to Other v2.6 Specifications

- **Spec #57 (Security C2 Doctrine)** — External COP is one of the five structural capabilities (dual Operating Pictures)
- **Spec #59 (Intelligence Layer)** — primary consumer of External Attack Intelligence and Posture Intelligence streams
- **Spec #60 (Attack Surface Framework)** — External COP is the external attack surface visualisation
- **Spec #66 (Internal Operating Picture)** — paired surface
- **Spec #67 (OODA Dashboard Family)** — Command Tempo Snapshot integration
- **Spec #70 (Direction Boards)** — Control Weakness Direction Board integration
- **Spec #71 (Pre-Warned Classification)** — ring visualisation conventions
- **Spec #41 v2.6 (UI Doctrine)** — visual language compliance
- **Spec #33 (Multi-Domain Fusion Map)** — complementary surface, different command moment

## 11. Versioning

v1.0 — initial specification under v2.6 baseline.
