> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# v2.4 Baseline Schedule Authority Addendum

This schedule is baseline-aligned by `00_AUTHORITY_AND_PRECEDENCE_v2_4.md` and `00_SPECIFICATION_REGISTER_v2_4.md`.

Active specification set now includes Specs #01 through #48 where present. The following previously missing or placeholder specs are now active:

- `01_AI_Build_Agent_Workflow_Spec.md`
- `09_Connector_Architecture_Spec.md`
- `24_Connector_API_Reference_Framework_Spec.md`
- `46_Canonical_Terminology_and_Object_Glossary.md`
- `47_Application_Route_and_Navigation_Register.md`
- `48_Active_Shell_UI_Authority.md`

Spec #08 is standardised as `08_Case_Management_Workflow_Spec.md`.

---

# Commander SDR — Specification Schedule, Folder Structure & Work Plan

**Version:** 1.9 | May 2026
**Source:** Master Technical Specification v6.8, Master Proposition v4.7

---



## Changelog

> v1.9 — May 2026: Three new documents registered — CP-01 (Control Plane Specification v1.1), FR-001 (Feature Registry), TAP-001 (Tenant Admin Panel Specification). New docs/feature_registry/ folder added to canonical folder structure.

---

## 0.0A Closed Decision Alignment

This schedule is aligned to the Approved Build-Ready Baseline v1.0. The closed architecture decisions for Microsoft Graph least-privilege access, metadata-first body storage, shared-mailbox-first rollout, SIR acknowledgement, VM closure gates, upward chain-of-command approval routing, and SIR origination from sub-cases/actions are binding for Spec #26a and all related child specifications.

## 0.0 Current Baseline Version Alignment

This schedule is aligned to the current final baseline pack:

```text
Commander_SDR_Master_Proposition_v4_7.md
Commander_SDR_Master_Technical_Specification_v6_8.md
SDR_Specification_Schedule_and_Folder_Structure_v1_9.md
Commander_SDR_AI_Build_Playbooks_v1_7.md
05_Data_Connector_Normalisation_Implementation_Spec_v1_5.md
AGENTS.md
```

Historic source inputs may be retained in archive/reference folders, but Codex must not treat them as active build authority unless the assigned issue explicitly asks for a reconciliation task.

---

## 0.1 Phase 0 Consolidation Decision — Data, Connector and Normalisation

To reduce document count and accelerate Codex-ready implementation, the Phase 0 build-level detail for the data/connector path is consolidated into one active implementation specification:

```text
docs/02_child_specs/05_Data_Connector_Normalisation_Implementation_Spec_v1_5.md
```

This single document covers the Phase 0 implementation detail for:

- Spec #5 — Data Model & Schema, for the Phase 0 entity subset only;
- Spec #9 — Connector Architecture, for the connector framework and first connector only;
- the Phase 0 subset of Spec #12 — SDR Normalisation Strategy;
- asset matching and deduplication implementation detail consolidated from the Asset Matching & Deduplication source input;
- connector constants, lifecycle, scheduling, delta sync, source authority and push boundary consolidated from the Connector Specification source input.

This consolidation does **not** remove the logical register entries for Specs #5, #9, or #12. It only means they are represented by a single Phase 0 implementation document until the project reaches a point where separate documents are genuinely required.

**Active Phase 0 build reference for data/connector/normalisation work:** `05_Data_Connector_Normalisation_Implementation_Spec_v1_5.md`.

---

## Companion Documents

| ID | Document | Location | Type | Status |
|---|---|---|---|---|
| CP-01 | SDR_Control_Plane_Specification_v1_1.md | docs/00_master/ | Companion Specification — Internal Commercial Operations | Active |
| FR-001 | SDR_Feature_Registry_FR001_v1_0.md | docs/feature_registry/ | Feature Registry — Canonical Feature Control Reference | Active |
| TAP-001 | TAP_Tenant_Admin_Panel_Spec_v1_0.md | docs/02_child_specs/ | Child Specification — Tenant Admin Panel | Active |


## 1. Complete Specification Schedule — Build Order

The 29 specifications are listed below in **dependency order** — the order they must be written. This is not the numerical order from the MTS register; it is the order that unblocks the build.

### Sprint 0: Write First, Build Nothing (Weeks 1–2)

These two specs define HOW the team works. Every other spec and every line of code depends on them.

> **Before writing any data, connector, ingestion, API, matching, or normalisation build spec:** use `docs/02_child_specs/05_Data_Connector_Normalisation_Implementation_Spec_v1_5.md` as the active implementation reference. API Strategy v4, Core Data Model Baseline v1.2, Identity Matching Spec v1, Connector Specification v1, and Asset Matching & Dedup Spec v1 have been consolidated into that document and are no longer active build authorities.

| # | Spec | What It Governs | Pages (est.) |
|---|---|---|---|
| **1** | AI Build and Agent Workflow Spec | AI agent task templates, prompt patterns for code generation, context loading, PR review checklists, security gates. Defines how AI agents write code for SDR. | 15–20 |
| **2** | DevOps / Environments / CI-CD Spec | Terraform modules, ECS Fargate tasks, Docker builds, GitHub Actions, monitoring, deployment runbooks. Defines where code runs. | 20–25 |

### Sprint 1: Platform Foundation Specs (Weeks 3–4)

These define the structural patterns. The build team starts P0-01 (Infrastructure) while these are being written.

| # | Spec | What It Governs | Pages (est.) |
|---|---|---|---|
| **3** | Backend / API Architecture Spec | Fastify structure, middleware chain, service/repository patterns, Zod validation, auth flow. Every backend module follows these patterns. | 20–25 |
| **4** | Frontend Architecture Spec | Next.js structure, component hierarchy, workspace routing, state management. Every frontend component follows these patterns. | 20–25 |
| **5** | Data Model & Schema Spec | **THE BIGGEST SPEC.** All 30+ entity schemas at Drizzle ORM level. Every entity from MTS Sections 7.1–7.30. Field types, indexes, constraints, relationships, JSONB structures, provenance fields, config version fields. Migration strategy. Tenant isolation enforcement. | 40–50 |
| **6** | Worker and Scheduling Spec | BullMQ configuration, job types/payloads, retry/backoff, dead-letter, tenant isolation. Defines every background job in the system. | 15–20 |

### Sprint 2: Core Engine Specs (Weeks 5–6)

These define the three core engines. P0-02 (Database) and P0-03 (Auth) building in parallel.

| # | Spec | What It Governs | Pages (est.) |
|---|---|---|---|
| **7** | Drift & Rule Engine Spec | Rule execution runtime, dependency graph, IF/THEN/PROPOSE_ACTION implementation, evaluation scheduling, model library loading, test-to-live staging, suppression logic. Combined with Formal Rule Engine Spec. **Governing decision OD-005 resolved (MTS v6.1):** YAML declarative rule format is the binding standard for Phase 0. All drift rules must be authored and stored in YAML format. The rule engine must load, validate, and execute YAML-defined rules at Phase 0. This decision governs the entire rule syntax, storage, and evaluation design of this spec. | 25–30 |
| **8** | Case Management & Workflow Spec | **Governing spec for the Cognitive Case Handling Engine (CCHE).** Full case lifecycle state machine, six case types, SLA engine, ITSM two-record model, approval chains, case collaboration (contributors, swarm, sub-cases), case followers, case-to-compliance traceability, tactical priority alignment, admin alert routing. Combined with Formal Workflow and State Model. **CCHE content (v1.3):** Case Risk Score (CRS) with six factors and configurable weights, Momentum Score (MS), Workload Capacity Score (WCS), Case Action Algorithm (CAA) with Next Best Action output, CRS Confidence Intervals and Data Freshness, Assignment Engine with skill/capacity/rank scoring, Override Governance (AutoOn/AutoOff/Locked), Workload Mix enforcement, Anti-hoarding rules, Team Builder and Management (full lifecycle), Team Performance Dashboard (15 metrics, comparison, drill-through), Case Pulse operating modes (MDR/Manual/Hybrid), Progressive Complexity Assignment (algorithmic, zero-config), Resolution Durability Score (30/60/90-day tracking), Business Impact Translation Layer, Case Trajectory Engine, Case Resonance Engine (5 signal types including conflict gate), Commander Silent Monitor, Case Association and Pattern Engine (4 algorithmic signal types), Cross-Tenant Institutional Memory Engine, Commander Thematic Intelligence Engine (Thematic Incident Hypothesis, SOM governance). **Companion:** Spec #8a (SOM Configuration Panel). **Governing MTS sections:** 13.35–13.46. **Status: Complete — v1.3.** | Complete |
| **8a** | SOM Configuration Panel Spec | Companion to Spec #8. All CCHE configurable parameters — complete SOMConfig Master Register with every key, default value, valid range, validation rule, and SOM-facing UI microcopy. Versioning, audit trail, rollback model. API contract (GET/PATCH/rollback/preview). Team management configuration. All cognitive enhancement configuration sections. **Status: Complete — v1.3.** | Complete |
| **9** | Connector Architecture Spec | Connector framework, lifecycle internals (configured→authenticated→healthy→degraded→failed), scheduler model, five-tier ingestion, concurrency, retry, delta sync, authority resolution integration. **Read before writing: SDR API Strategy v4** (`docs/00_master/SDR_API_Strategy_v4.md`) governs the connector API design, authentication model, and ingestion contract. This spec must be fully consistent with the API Strategy. | 20–25 |
| **10** | Platform Security & Hardening Spec | Authentication (SSO/OIDC), RBAC enforcement, tenant isolation, secrets management, encryption, tamper-evidence audit trail, **audit export format (17.6a)**, configuration review register integration, admin alert security constraints, threat model. **Governing decision OD-009 resolved (MTS v6.1):** Break-glass access is a time-limited session with mandatory written justification at activation, a full audit record written to the immutable audit trail, and an automatic governance case created and routed to the Security Architecture team. All break-glass design in this spec must implement these four requirements. | 25–30 |

### Sprint 3: UI Foundation Spec (Weeks 7–8)

| # | Spec | What It Governs | Pages (est.) |
|---|---|---|---|
| **11** | UI/UX and Workspace Architecture Spec | **THE SECOND BIGGEST SPEC.** This is now massive given v6.1 scope. Covers: navigation model, workspace layouts, design system (tokens, components, patterns), case detail view (15+ panels, 8 tabs, all action buttons), 5 domain security dashboards (common panels + domain-specific), CISO dashboard, SOM management dashboard, architecture dashboard, admin alert queue UI, configuration registry UI, trust boundary enrichment UI, shared responsibility profile editor, Communication Panel, Command Bridge panel, suggested priorities panel, priority management subsections (CISO + SOM), operational savings dashboard, blast radius visualisation. **Formally split into two documents:** | |
| **11a** | UI/UX Foundation & Design System | Design tokens, component library, layout patterns, navigation model, workspace routing, responsive behaviour, accessibility. The HOW of building UI. | 25–30 |
| **11b** | Workspace & Dashboard Composition | Every view in the application: which panels, which data, which interactions, which layout. The WHAT of each screen. Case detail view, 5 domain dashboards, CISO view, SOM view, admin views, all feature panels. | 30–40 |

### Phase 1 Specs (Weeks 9–14, written just-in-time as Phase 0 modules complete)

| # | Spec | What It Governs | Pages (est.) |
|---|---|---|---|
| **12** | SDR Normalisation Strategy | Per-connector field mappings, type conversion, conflict resolution, entity matching signals, weighted scoring, auto-merge thresholds, manual review triggers. Drives every connector implementation. | 20–25 |
| **13** | Commander AI Architecture & Grounding Rules | BYOM pipeline design, model provider abstraction, grounding pipeline, context construction, prompt template engine, output validation, safety gates, trust boundary, Commander Execution Record, token management, tiered intelligence model. Combined with Grounding Rules. | 30–35 |
| **14** | Push Engine Architecture | Execution pipeline, rollback-first design, pre-execution state capture, rollback payload generation, idempotency, coordinated push group orchestration, failure handling, push audit trail, Red Button emergency isolation, Red Button referral sub-case, per-case automation savings tracking. | 20–25 |
| **15** | SIEM/SOAR Rule Generation Templates | Platform-agnostic detection specification format, handoff process to SIEM/SOAR engineering team, retirement lifecycle, specification packaging. | 10–15 |
| **16** | Performance, Scaling & Operational Spec | SLO targets (API latency, ingestion throughput, query performance), scaling model, telemetry, backpressure, DR/failover, runbooks, capacity planning. | 20–25 |
| **17** | Closed-Loop Control Architecture | Feedback orchestration (detect→analyse→control→validate→adjust), control selection logic, validation pipeline (re-query, BAS, identity chain revalidation), adjustment and recalculation pipeline, coverage impact projection, compensating control lifecycle, baseline adjustment governance. | 20–25 |
| **18** | Unified Identity Architecture | Identity graph, three-stage computation model (continuous→triggered→sweep), privilege propagation, chain computation, group intelligence, blast radius from identity, cross-system identity correlation. **Required in Phase 1:** Stage 1 and Stage 2 identity computation activate in Phase 1. This spec must be written before Phase 1 build begins. Confirmed governing phase: Phase 1 (aligned with Master Proposition and MTS v6.1). | 25–30 |
| **25** | Trust Boundary & Third-Party Intelligence Spec | TrustBoundary entity management, auto-detection rules (from firewall, identity, cloud connectors), architect enrichment workflow, boundary monitoring integration, third-party contact model, operational model auto-computation, blind spot detection. | 15–20 |
| **26** | Case Communication & Broadcast Channel Spec | Communication provider adapter pattern (Teams first, Slack Phase 2), CaseConversation entity lifecycle, CommunicationProviderConfig, on-demand transcript import, dedup, lazy-load status, Command Bridge (channel posting + deep link), Operations Channel Broadcast (analyst-initiated), BroadcastChannelConfig, channel setup wizard. | 15–20 |
| **26a** | Closed-Loop Email & Case Communication Lifecycle Spec | Microsoft Graph / Exchange Online email integration, approved mailbox model, outbound case email execution, inbound reply ingestion, thread correlation, CaseEmailThread, CaseEmailMessage, CommunicationEvent, communication state machine, SLA-driven reminders/escalations, templates, manual linking, failure handling, audit and retention. Companion to Spec #26 but governed as a distinct email lifecycle model. | 20–25 |
| **27** | Shared Responsibility Profile & Configuration Governance Spec | SharedResponsibilityProfile entity, default profiles for AWS/Azure/GCP × all service models, ResponsibilityLayer schema, detection suppression integration, coverage filtering integration, cloud_service_model auto-computation, architect profile management workflow. Tenant Configuration Registry: seven configuration groups, standard version fields, review scheduling, change impact visibility, admin alert integration. | 20–25 |

### Phase 2 Specs (written during Phase 1 build)

| # | Spec | What It Governs | Pages (est.) |
|---|---|---|---|
| **19** | Full RBAC Permission Matrix | Complete permission-action matrix across all domains, personas, authority overlays (Red Button, Approver, Break-Glass), grade model (L0–L3), case type RBAC assignment. | 15–20 |
| **20** | Coordinated Push Group Schema | Multi-system push group structure, group execution orchestration, group rollback mechanics, per-action tracking within group, impact assessment per-action and aggregate. | 10–15 |
| **21** | BAS Connector Integration Contract | Simulation trigger format, result schema, confidence scoring, exploitability overlay, post-remediation re-simulation. | 10–15 |
| **22** | Architecture Intelligence Engine | Anti-pattern library, architecture scoring, design incongruence detection, debt computation, reasoning model, architecture review flag automation. | 15–20 |
| **23** | Security Tool Intelligence Specification | Tool value scoring (data dimension + push dimension), overlap detection matrix, removal impact simulation, console utilisation tracking, automation savings integration. | 15–20 |
| **28** | Strategic & Tactical Priority Framework Spec | StrategicPriority entity, TacticalPriority entity, 30+ targetable metrics catalogue, case alignment engine, priority boost mechanism, thematic alignment, suggested priorities computation, Commander calibration (on request), velocity analysis, trajectory computation, BAU workload protection (alignment coverage monitor, ageing guardrails), CISO Strategic Priorities subsection, SOM Tactical Priorities subsection. | 20–25 |

### Ongoing

| # | Spec | What It Governs | Pages (est.) |
|---|---|---|---|
| **24** | Connector API References (per connector) | Per-connector API contracts. See Section 3 below. | 5–10 per connector |

---

## 2. Connector API Reference Documents

These are separate from the 28 architecture/implementation specs. Each Connector API Reference defines what SDR reads from and writes to a specific security tool's API. They are the implementation artifacts that drive connector module development AND define what data enters Commander's grounding pipeline.

### Structure per Connector API Reference

Every Connector API Reference follows the same template:

| Section | Content |
|---|---|
| **Connector Identity** | Vendor, product, API version, connector ID, connector category |
| **Authentication** | Auth method (OAuth, API key, certificate), required credentials, token refresh, scoping |
| **Read Operations (Pull)** | Per-endpoint: URL, method, response schema, which SDR entity fields are populated, ingestion tier, pull cadence, pagination strategy, rate limits |
| **Data Domain Authority** | Per data domain: what authority type this connector should hold (Primary, Enrichment, Correlation, Validation, Fallback) — with rationale |
| **Normalisation Mapping** | Per field: source field name → canonical SDR field → type conversion → null handling |
| **Write Operations (Push)** | Per push action: what SDR can push to this tool, API endpoint, payload schema, pre-execution state capture method, rollback payload generation |
| **Health Monitoring** | Health check endpoint, expected cadence, degradation indicators, failure indicators |
| **Baseline Template** | Default security configuration baseline for this tool — what "good" looks like per setting |
| **Detection Model Dependencies** | Which of the ~240 detection models depend on data from this connector |
| **Commander Context** | What data from this connector enters Commander's grounding pipeline |
| **Permissions** | Minimum required API permissions, over-scope warnings, under-scope impact |

### Current Connector API References (20 drafted)

| # | Connector | Category | Phase | Status |
|---|---|---|---|---|
| API-01 | CrowdStrike Falcon | EDR / Endpoint | Phase 0 (first connector candidate) | Drafted |
| API-02 | Microsoft Entra ID | Identity | Phase 0 | Drafted |
| API-03 | AWS IAM | Cloud Identity | Phase 1 | Drafted |
| API-04 | AWS Config / Security Hub | Cloud Posture | Phase 1 | Drafted |
| API-05 | Microsoft Defender for Endpoint | EDR / Endpoint | Phase 1 | Drafted |
| API-06 | Microsoft Defender for Cloud | Cloud Posture | Phase 1 | Drafted |
| API-07 | Palo Alto Networks (PAN-OS) | Firewall / Network | Phase 1 | Drafted |
| API-08 | Zscaler ZIA / ZPA | ZTA / Network | Phase 1 | Drafted |
| API-09 | Tenable.io | Vulnerability | Phase 1 | Drafted |
| API-10 | Qualys | Vulnerability | Phase 1 | Drafted |
| API-11 | Okta | Identity | Phase 1 | Drafted |
| API-12 | ServiceNow | ITSM | Phase 0 | Drafted |
| API-13 | Jira | ITSM | Phase 1 | Drafted |
| API-14 | Darktrace | NDR / Behavioural | Phase 2 | Drafted |
| API-15 | CyberArk | PAM | Phase 2 | Drafted |
| API-16 | Delinea | PAM | Phase 2 | Drafted |
| API-17 | SentinelOne | EDR / Endpoint | Phase 2 | Drafted |
| API-18 | Wiz | Cloud Posture | Phase 2 | Drafted |
| API-19 | Azure DevOps | DevSec | Phase 2 | Drafted |
| API-20 | GitHub Advanced Security | DevSec | Phase 2 | Drafted |

### Connector API References — Build Priority (Your Infrastructure First)

Given you're dogfooding with your own AWS, Cloudflare, Microsoft Defender, and small Azure/GCP environments:

| Priority | Connector | Why first |
|---|---|---|
| **1st** | AWS (Config + IAM + Security Hub) | Your primary cloud — proves cloud posture + identity |
| **2nd** | Microsoft Entra ID | Your identity provider — proves identity intelligence + access chains |
| **3rd** | Microsoft Defender for Endpoint | Your endpoint coverage — proves endpoint domain |
| **4th** | Cloudflare | Your network/WAF/DNS — proves network domain + trust boundaries |
| **5th** | Azure (Defender for Cloud + Azure AD) | Small Azure estate — proves cross-cloud correlation |
| **6th** | GCP (Security Command Center) | Small GCP estate — proves three-cloud story |

Connectors 1–3 are your Phase 0/1a minimum. Connectors 4–6 are your Phase 1b proof points.

**Missing from the drafted list:** Cloudflare and GCP Security Command Center. These need new Connector API References drafted:

| # | Connector | Category | Phase | Status |
|---|---|---|---|---|
| API-21 | Cloudflare (WAF + DNS + Firewall Rules) | Network / WAF / DNS | Phase 1 | **Needs drafting** |
| API-22 | GCP Security Command Center | Cloud Posture | Phase 1 | **Needs drafting** |
| API-23 | Microsoft Graph (Teams) | Communication Platform | Phase 1 | **Needs drafting** |

**Total Connector API References: 23** (20 drafted + 3 to draft)

---

## 3. UI Strategy and Specification — Where It Fits

### The Problem

Spec #11 (UI/UX and Workspace Architecture Spec) is now the second largest specification in the register. The v6.1 MTS defines:

- Case detail view with 15+ panels and 8 tabs
- 5 domain security dashboards (each with 10 common + domain-specific panels)
- CISO Dashboard with strategic priorities, suggested priorities, posture overview
- SOM Management Dashboard with tactical priorities, team capacity, velocity
- Security Architect Dashboard with topology, policy conflicts, coverage map
- Platform Administration with admin alert queue, configuration registry (7 groups), connector management, shared responsibility profile editor, broadcast channel setup, communication provider setup
- Identity & Asset Intelligence workspace
- Compliance & Assurance workspace
- Blast radius and attack path visualisations
- Operational savings dashboard

That's 20+ distinct views with hundreds of panels.

### Recommended Split

| Spec | What it covers | When needed | Est. pages |
|---|---|---|---|
| **#4 Frontend Architecture Spec** | Technical foundation: Next.js project structure, component patterns, state management, API client, routing, theming/design tokens, testing strategy. HOW to build any UI component. | Phase 0 start | 20–25 |
| **#11a UI/UX Design System** | Component library definition: buttons, forms, tables, charts, cards, panels, navigation, modals, badges, status indicators, colour palette, typography, spacing, responsive breakpoints, dark mode tokens, accessibility standards. The reusable building blocks. | Phase 0 (P0-11 first half) | 20–25 |
| **#11b Workspace & View Composition** | Every screen in the application, specified panel by panel: case detail view, 5 domain dashboards, CISO view, SOM view, architect view, admin views, all feature panels, interaction flows, navigation tree, RBAC-driven visibility rules. The WHAT of each view. | Phase 0 (P0-11 second half) — but updated continuously as features are built in Phase 1/2 | 35–45 |

**#4** tells the developer HOW to build a component.
**#11a** tells the developer WHAT components exist.
**#11b** tells the developer WHERE each component goes and HOW it behaves in context.

### UI Strategy Integration Points

| Spec | UI content it must include |
|---|---|
| **#8 Case Management** | Case detail view panel specifications, case action button behaviours, state machine UI transitions |
| **#13 Commander AI** | Commander panel rendering, interactive follow-up UI, calibration dialog |
| **#26 Case Communication** | Communication Panel, transcript import view, channel setup wizard |
| **#27 Configuration Governance** | Configuration registry UI, shared responsibility profile editor, review register |
| **#28 Priority Framework** | CISO strategic priorities subsection, SOM tactical priorities subsection, suggested priorities panel, alignment indicators on case queue |

Each of these specs defines the **data and behaviour**. Spec #11b defines the **layout, composition, and interaction design**.

---

## 4. Canonical Folder Structure

The canonical folder structure uses **phase-based naming with underscores**. This is the authoritative structure. It matches the executable `mkdir` commands in the Commander SDR AI Build Playbooks (Playbook 1, Step 7). All specs, AI agent instructions, repo operating model documentation, and generated READMEs must reference this structure.

**Convention rules:**
- Folder names use underscores, not hyphens
- Folder names are prefixed with two-digit phase numbers
- Spec files use the spec number prefix matching the build schedule
- All folders are created at repo initialisation (Playbook 1, Step 7)

```
commander-sdr/
│
├── docs/
│   ├── 00_master/                              ← Governance documents (read before anything else)
│   │   ├── SDR_Master_Proposition_v4_2.md
│   │   ├── SDR_Master_Technical_Specification_v6_2.md
│   │   ├── SDR_API_Strategy_v4.md              ← Read before Specs #3 and #9
│   │   ├── SDR_Patent_Reference.md
│   │   ├── SDR_Specification_Schedule_and_Folder_Structure_v1_9.md
│   │   └── Repository_Operating_Model.md
│   │
│   ├── 01_phase_0_foundation/                  ← Specs required before Phase 0 build starts
│   │   ├── 01_AI_Build_Agent_Workflow_Spec.md
│   │   ├── 02_DevOps_Environments_CICD_Spec.md
│   │   ├── 03_Backend_API_Architecture_Spec.md
│   │   ├── 04_Frontend_Architecture_Spec.md
│   │   ├── 05_Data_Connector_Normalisation_Implementation_Spec_v1_5.md  ← consolidated Phase 0 build spec for #5, #9, and Phase 0 subset of #12
│   │   ├── 06_Worker_Scheduling_Spec.md
│   │   ├── 07_Drift_Rule_Engine_Spec.md
│   │   ├── 08_Case_Management_Workflow_Spec.md
│   │   ├── 08a_SOM_Configuration_Panel_Spec.md
│   │   ├── 10_Platform_Security_Hardening_Spec.md
│   │   ├── 11a_UI_UX_Design_System.md
│   │   └── 11b_Workspace_Dashboard_Composition.md
│   │
│   ├── 02_phase_1_capability/                  ← Specs required before Phase 1 build starts
│   │   ├── 12_Normalisation_Strategy.md      ← fuller Phase 1 normalisation strategy if needed after consolidated Phase 0 spec
│   │   ├── 13_Commander_AI_Architecture_Grounding.md
│   │   ├── 14_Push_Engine_Architecture.md
│   │   ├── 15_SIEM_SOAR_Rule_Templates.md
│   │   ├── 16_Performance_Scaling_Operational_Spec.md
│   │   ├── 17_Closed_Loop_Control_Architecture.md
│   │   ├── 18_Unified_Identity_Architecture.md  ← Phase 1 (confirmed — identity computation activates Phase 1)
│   │   ├── 25_Trust_Boundary_Third_Party_Intelligence.md
│   │   ├── 26_Case_Communication_Broadcast_Channel.md
│   │   └── 27_Shared_Responsibility_Configuration_Governance.md
│   │
│   ├── 03_phase_2_intelligence/                ← Specs written during Phase 1, required before Phase 2
│   │   ├── 19_Full_RBAC_Permission_Matrix.md
│   │   ├── 20_Coordinated_Push_Group_Schema.md
│   │   ├── 21_BAS_Connector_Integration_Contract.md
│   │   ├── 22_Architecture_Intelligence_Engine.md
│   │   ├── 23_Security_Tool_Intelligence_Spec.md
│   │   └── 28_Strategic_Tactical_Priority_Framework.md
│   │
│   ├── 04_connector_api_references/            ← Per-connector API contracts (ongoing)
│   │   ├── API-01_CrowdStrike_Falcon.md
│   │   ├── API-02_Microsoft_Entra_ID.md
│   │   ├── API-03_AWS_IAM.md
│   │   ├── API-04_AWS_Config_Security_Hub.md
│   │   ├── API-05_Microsoft_Defender_Endpoint.md
│   │   ├── API-06_Microsoft_Defender_Cloud.md
│   │   ├── API-07_Palo_Alto_PAN_OS.md
│   │   ├── API-08_Zscaler_ZIA_ZPA.md
│   │   ├── API-09_Tenable_io.md
│   │   ├── API-10_Qualys.md
│   │   ├── API-11_Okta.md
│   │   ├── API-12_ServiceNow.md
│   │   ├── API-13_Jira.md
│   │   ├── API-14_Darktrace.md
│   │   ├── API-15_CyberArk.md
│   │   ├── API-16_Delinea.md
│   │   ├── API-17_SentinelOne.md
│   │   ├── API-18_Wiz.md
│   │   ├── API-19_Azure_DevOps.md
│   │   ├── API-20_GitHub_Advanced_Security.md
│   │   ├── API-21_Cloudflare.md              ← NEEDS DRAFTING
│   │   ├── API-22_GCP_Security_Command_Center.md  ← NEEDS DRAFTING
│   │   ├── API-23_Microsoft_Graph_Teams.md    ← NEEDS DRAFTING
│   │   └── _TEMPLATE_Connector_API_Reference.md
│   │
│   ├── 05_design_reference/                   ← UI design reference (not production code)
│   │   ├── 00_Master_UI_Design_Direction.md
│   │   ├── master_layout/
│   │   │   └── Master_Layout_Spec.md
│   │   ├── use_case_page_maps/
│   │   │   └── Dashboard_Page_Briefs.md
│   │   ├── mockup_images/                     ← Screenshots and visual references only
│   │   └── template_reference/                ← External UI template reference material
│   │       ├── screenshots/
│   │       ├── selected_components/
│   │       └── page_patterns/
│   │
│   ├── 06_decisions/                          ← Architectural decision log
│   │   └── Architecture_Decision_Log.md
│   │
│   ├── 90_prompts/                            ← AI agent prompt library
│   │
│   └── 99_archive/                            ← Superseded documents
│
├── apps/
│   ├── web/              (governed by Spec #4 — Next.js frontend)
│   └── api/              (governed by Spec #3 — Fastify backend)
│
├── packages/
│   ├── db/               (governed by Spec #5 — Drizzle schema)
│   ├── contracts/        (shared API contracts and types)
│   ├── connectors/       (governed by Spec #9 + API refs)
│   ├── rules/            (governed by Spec #7 — YAML rule engine)
│   ├── workers/          (governed by Spec #6 — BullMQ)
│   ├── shared/           (shared utilities)
│   └── ui/               (governed by Spec #11a — component library)
│
├── infra/
│   ├── terraform/        (governed by Spec #2)
│   ├── docker/
│   └── github-actions/
│
├── scripts/
│   └── python/           ← Non-runtime support scripts only
│
├── analytics/
│   ├── experiments/
│   └── notebooks/
│
└── tests/
    ├── unit/
    ├── integration/
    ├── contract/
    ├── tenant-isolation/
    └── e2e/
```

**Folder governance rules:**
- `docs/00_master/` — read-only after governance approval. Changes require architecture review.
- `docs/02_child_specs/` through `docs/03_phase_2_intelligence/` — specs live in the folder matching their required phase. A spec does not move once placed.
- `docs/05_design_reference/` — reference material only. No production code is copied from here without explicit approval in a GitHub issue.
- `scripts/python/` and `analytics/` — the only permitted locations for Python in Phase 0.
- `apps/` and `packages/` — all production runtime code. TypeScript only in Phase 0.

---

## 5. Write Schedule — Weeks 1–14

| Week | Spec Being Written | Build Work In Parallel | Spec Delivered |
|---|---|---|---|
| 1 | #1 AI Build Workflow | — | #1 |
| 2 | #2 DevOps/CI-CD | — | #2 |
| 3 | #3 Backend Architecture, #4 Frontend Architecture | P0-01 Infrastructure (from #2) | #3, #4 |
| 4 | #5 Data Model (week 1 of 2) | P0-01 continues | — |
| 5 | #5 Data Model (week 2), #6 Worker Spec | P0-01 completes, P0-02 Database starts (from #5) | #5, #6 |
| 6 | #7 Drift Engine, #8 Case Management (week 1 of 2) | P0-02 continues, P0-03 Auth starts | #7 |
| 7 | #8 Case Management (week 2), #9 Connector Arch | P0-04 Connector framework starts (from #9), P0-05 Tenant model | #8, #9 |
| 8 | #10 Platform Security, #11a UI Design System | P0-06 First connector, P0-07 Normalisation | #10, #11a |
| 9 | #11b Workspace Composition (week 1 of 2) | P0-08 Drift engine skeleton, P0-09 Case management basic | — |
| 10 | #11b Workspace Composition (week 2), #12 Normalisation | P0-10 Audit trail, P0-11 UI skeleton | #11b, #12 |
| 11 | #13 Commander AI Architecture (week 1 of 2) | P0-12 Push gate, Phase 0 exit testing | — |
| 12 | #13 Commander AI (week 2), #14 Push Engine | **Phase 0 complete.** P1-01 Detection models starts. | #13, #14 |
| 13 | #15 SIEM/SOAR Templates, #25 Trust Boundary, #26 Case Communication + #26a Closed-Loop Email | P1-02 Case lifecycle, P1-03 Commander AI | #15, #25, #26, #26a |
| 14 | #16 Performance, #17 Closed-Loop, #27 Shared Responsibility | P1-04 Coverage, P1-05 Push execution | #16, #17, #27 |

**Phase 2 specs (#19–#23, #28) written during Phase 1 build — no dedicated spec sprint needed. Note: Spec #18 (Unified Identity Architecture) confirmed Phase 1 — identity computation activates in Phase 1 build.**

---

## 6. Summary Counts

| Category | Count | Status |
|---|---|---|
| **Governance documents** | 4 | 3 current (Proposition v4.3, MTS v6.3, API Strategy v4), 1 reference (Patent) |
| **Phase 0 specs** | Lean active set: consolidated `05_Data_Connector_Normalisation_Implementation_Spec_v1_5.md` plus all Phase 0 foundation specs present in the active child-spec folder. Logical register still tracks Specs #1–#10, #11a, #11b. | Complete for build-package derivation, excluding connector API references. |
| **Phase 1 specs** | 12 (Specs #12–#18, #25–#27 plus #26a — Spec #18 confirmed Phase 1) | Present in active child-spec folder. |
| **Phase 2 specs** | 6 (Specs #19–#23, #28) | Present in active child-spec folder. |
| **Ongoing** | 1 (Spec #24 — Connector API References, per connector) | Deferred until connector framework and first connector pattern are proven. Draft source inputs may remain archived. |
| **Connector API References** | 23 | 20 drafted, 3 need drafting (API-21 Cloudflare, API-22 GCP SCC, API-23 Microsoft Graph Teams) |
| **Supporting documents** | 3 | In progress |
| **Total numbered specs** | 30 (29 logical specifications — 11a and 11b are one logical spec split into two documents; 26a is a companion spec) | |
| **Total documents in suite** | Reduced active count for Phase 0 by consolidation. Full suite remains a register, not a requirement to author everything upfront. | |

---

*Commander SDR Specification Schedule v1.2 — April 2026. Spec #8 scope description updated to reflect full CCHE content (v1.3 complete). Spec #8a (SOM Configuration Panel) registered as companion to Spec #8 in folder structure and spec register. Both specs marked Complete. Summary counts updated. MTS reference updated to v6.3. Reconciled to MTS v6.3 and Master Proposition v4.3.*


---

## 7. Active Phase 0 Document Reduction Decision

The working Phase 0 document set should be kept lean. Do not author every registered specification upfront. Use the schedule as a register, not a command to create all documents immediately.

### Active immediately

```text
docs/00_master/SDR_Master_Proposition_v4_2.md
docs/00_master/SDR_Master_Technical_Specification_v6_2.md
docs/00_master/SDR_Specification_Schedule_and_Folder_Structure_v1_9.md
docs/02_child_specs/05_Data_Connector_Normalisation_Implementation_Spec_v1_5.md
docs/02_child_specs/08_Case_Management_Workflow_Spec.md
docs/02_child_specs/08a_SOM_Configuration_Panel_Spec.md
```

### Just-in-time only

```text
02_DevOps_Environments_CICD_Spec.md
03_Backend_API_Architecture_Spec.md
04_Frontend_Architecture_Spec.md
06_Worker_Scheduling_Spec.md
07_Drift_Rule_Engine_Spec.md
10_Platform_Security_Hardening_Spec.md
11a_UI_UX_Design_System.md
11b_Workspace_Dashboard_Composition.md
```

These should be written only when Codex is about to build the related module, unless a human reviewer decides they are required earlier.

*Commander SDR Specification Schedule v1.3 — April 2026. Adds Phase 0 consolidation decision for Data, Connector and Normalisation implementation detail. Reconciled to Master Proposition v4.3 and Master Technical Specification v6.3. This schedule remains a register and work plan, not a requirement to author every document before build starts.*


---

## 8. v1.6 Closed-Loop Email Schedule Amendment

Spec #26a is added as a Phase 1 companion to Spec #26. It must be written before any build task that implements Microsoft Graph case email sending, inbound reply ingestion, mailbox administration, email correlation, email-driven SLA reminders, or case email timeline UI.

### Dependencies

| Spec #26a depends on | Reason |
|---|---|
| Master Proposition v4.7 | Product scope and value statement. |
| MTS v6.8 Section 13.26A | Governing technical architecture. |
| Spec #8 v1.6 | Case lifecycle, SLA and state machine alignment. |
| Spec #8a v1.5 | SOM-configurable communication thresholds and template policy. |
| Platform Security & Hardening Spec | Graph permissions, RBAC, tenant isolation, retention and audit. |
| Backend/API Architecture Spec | API conventions and service/repository pattern. |
| Worker and Scheduling Spec | BullMQ jobs, subscription renewal, delta sync, retry and dead-letter behaviour. |
| UI/UX Specs 11a/11b | Case communication panel and timeline presentation. |

### Phase boundary

Spec #26a remains Phase 1 unless explicitly promoted by the human owner. Phase 0 SHALL NOT implement Graph email ingestion or mailbox send unless the Phase 0 scope is formally amended.


---

# Schedule Addendum v1.8 — Build-Ready Baseline Completion

## Current Baseline Pack

The v1.8 schedule aligns to:

```text
Commander_SDR_Master_Proposition_v4_7.md
Commander_SDR_Master_Technical_Specification_v6_8.md
SDR_Specification_Schedule_and_Folder_Structure_v1_9.md
26a_Closed_Loop_Email_Case_Communication_Lifecycle_Spec_v1_2.md
Spec_08_Case_Management_Workflow_v1_6.md
SOM_Configuration_Panel_Spec_v1_6.md
05_Data_Connector_Normalisation_Implementation_Spec_v1_5.md
Commander_SDR_AI_Build_Playbooks_v1_7.md
AGENTS.md
```

## Spec #26a Updated Scope

| # | Spec | What It Governs | Phase |
|---|---|---|---|
| **26a** | Closed-Loop Email & Case Communication Lifecycle Spec v1.2 | Microsoft Graph closed-loop email, Communication Administration, team mailbox setup, Communication Permission and Approval Chain Matrix, hierarchical parent/sub-case/action/swarm email linkage, SIR from parent/sub-case/action/workstream, inbound allocation queue, recipient classification, redaction/evidence policy, approval lifecycle, template versioning, mailbox health, VM mailbox workflows and communication analytics. | Phase 1 |

## Dependency Update

Spec #26a v1.2 depends on:

```text
Spec #8 Case Management & Workflow v1.6
Spec #8a SOM Configuration Panel v1.6
Spec #10 Platform Security & Hardening
Spec #11a UI/UX Foundation & Design System
Spec #11b Workspace & Dashboard Composition
Spec #26 Case Communication & Broadcast Channel Spec
05_Data_Connector_Normalisation_Implementation_Spec_v1_4
```

## Build Boundary

This remains a **Phase 1 capability** unless explicitly promoted by Johann. Phase 0 may show disabled UI affordances or navigation placeholders only where helpful for design continuity. Phase 0 SHALL NOT implement Microsoft Graph send, receive, subscription renewal, delta sync, SIR email dispatch or email approval-chain runtime unless explicitly authorised.


---

# CHANGE-ARCH-002 Schedule Alignment Note

This schedule is aligned to the foundation architecture hardening baseline:

```text
Commander_SDR_Master_Proposition_v4_7.md
Commander_SDR_Master_Technical_Specification_v6_8.md
SDR_Specification_Schedule_and_Folder_Structure_v1_9.md
Commander_SDR_AI_Build_Playbooks_v1_7.md
AGENTS.md
```

The active child-spec family now includes binding alignment for:

```text
domain-segmented PostgreSQL
open-source-first TypeScript stack
AWS-first but portable cloud deployment
Terraform for cloud infrastructure
Docker Compose for local development
minimum security baseline
Safe View Mode
Asset Rationalisation & Anomaly Check
```

Connector Data Flush is deferred and SHALL NOT be treated as active implementation scope.


---

# DOCUMENT-SPECIFIC REVISION PATCH — SDR_Specification_Schedule_and_Folder_Structure_v1_9.md

**Patch date:** 2026-05-13  
**Patch type:** Functional review remediation  
**Authority:** Closed-loop doctrine patch v2.0  

## Required Update Applied

This schedule is updated to include the missing build-critical specifications required before implementation.

## Mandatory Build Interpretation

- Any previous language in this document that permits manual case creation, manual lifecycle progression, manual closure, manual reopening, optional case promotion for actionable risk, or unbound risk handling is superseded.
- Manual remediation remains permitted only as a remediation execution method, not as a case lifecycle authority.
- Manual evidence, manual acknowledgement, manual approval, and manual challenge are permitted only as audited inputs to deterministic system decisions.
- Every feature in this document SHALL define case binding, sub-action binding, validation state, closure gate, reopening trigger, routing decision, prioritisation impact, strategy dependency, UI surface, and Fusion Map binding before implementation.


---

# REVISION ADDENDUM — CLOSED-LOOP FUNCTIONAL DOCTRINE PATCH v2.0

**Status:** SUPERSEDING ADDENDUM  
**Effective date:** 2026-05-13  
**Applies to:** all Commander SDR functional, technical, UI, case, workflow, routing, strategy, communication, validation, automation, data model, and build artefacts.

## 1. Supersession Rule

Where this document previously permits or implies any of the following, this addendum supersedes that language:

- manual freeform case creation;
- manual lifecycle progression;
- manual case closure;
- manual case reopening;
- unbound findings;
- optional case promotion for risk objects;
- lifecycle decisions owned by analysts rather than deterministic system rules;
- UI controls that mutate lifecycle state directly;
- case assignment modes that prevent deterministic routing from producing an auditable route decision.

Human users may submit evidence, approve governed exceptions, approve high-risk automation, challenge a system decision, request validation refresh, request routing review, prioritise work, annotate records, and confirm business context. Human users do not directly create, close, reopen, or progress lifecycle state.

## 2. Non-Negotiable Closed-Loop Doctrine

Commander SDR SHALL enforce the following doctrine:

1. **No manual case creation.** Cases are generated only from normalised risk objects, communication-ingested risk objects, tool-health objects, exposure objects, drift objects, vulnerability objects, control objects, identity objects, coverage objects, architecture objects, blast-radius objects, or governed residual-risk/debt objects.
2. **Every risk object is case-bound.** No risk object may remain operationally actionable without a parent case or a deterministic case-linking decision.
3. **Prioritisation-only interaction.** Operators may prioritise, annotate, challenge, approve, suppress, or provide evidence. They may not directly mutate lifecycle state.
4. **Automatic routing.** The routing engine SHALL produce the route, owner, team, approval path, escalation path, and rationale for every case and blocking sub-action.
5. **Automatic sub-action generation.** The case engine SHALL generate sub-actions from risk decomposition, remediation options, validation dependencies, communication requirements, ownership boundaries, push requirements, and approval requirements.
6. **Automatic validation.** Technical validation SHALL be system-owned and evidence-driven.
7. **Automatic closure.** Closure SHALL be system-owned and SHALL occur only when all configured closure gates are satisfied.
8. **Automatic reopening.** Reopening SHALL be system-owned and SHALL occur when any configured reopening trigger fires.
9. **Automatic communication binding.** Inbound and outbound case communication SHALL bind to a case, sub-action, risk object, external notification, or allocation queue object.
10. **Audit-first operation.** Every decision SHALL emit a machine-readable rationale and immutable audit event.

## 3. Universal Risk Object Contract

Every domain SHALL emit or link to a canonical `RiskObject` with these minimum fields:

| Field | Requirement |
|---|---|
| `risk_object_id` | Required immutable identifier. |
| `risk_object_type` | Required enum: identity, architecture, vulnerability, exposure, control, drift, tool_health, coverage, blast_radius, asset, communication, trust_boundary, BAS, SIEM_SOAR, shared_responsibility, security_debt, exception. |
| `domain` | Required owning domain. |
| `source_systems[]` | Required source list. |
| `affected_entities[]` | Required canonical entity references. |
| `case_binding_status` | Required enum: bound, linked_to_existing, suppressed_by_policy, pending_allocation_error. |
| `case_id` | Required unless suppressed by approved policy. |
| `sub_action_ids[]` | Required when decomposition generates work. |
| `validation_state` | Required universal validation state. |
| `routing_state` | Required universal routing state. |
| `priority_score` | Required computed priority. |
| `closure_gate_state` | Required aggregate closure gate state. |
| `reopen_trigger_state` | Required aggregate reopening trigger state. |
| `mission_impact` | Required nullable object. |
| `fusion_map_refs[]` | Required node and edge references. |

## 4. Universal Case Lifecycle

The closed-loop case lifecycle SHALL be:

1. `DETECTED`
2. `BOUND`
3. `ROUTED`
4. `PRIORITISED`
5. `ACTION_DECOMPOSED`
6. `IN_PROGRESS`
7. `PENDING_VALIDATION`
8. `VALIDATION_RUNNING`
9. `VALIDATED_FIXED` / `VALIDATED_COMPENSATED` / `VALIDATED_SUPPRESSED` / `VALIDATED_RESIDUAL_ACCEPTED` / `VALIDATION_FAILED` / `VALIDATION_INCONCLUSIVE`
10. `PENDING_CLOSURE_GATES`
11. `CLOSED_BY_SYSTEM`
12. `REOPENED_BY_SYSTEM`

Forbidden lifecycle states or interactions:

- user-created case;
- user-closed case;
- user-reopened case;
- analyst-only lifecycle progression;
- unvalidated closure;
- closure based only on ITSM or email acknowledgement.

## 5. Universal Sub-Action Lifecycle

Every blocking sub-action SHALL use this lifecycle:

1. `GENERATED`
2. `ROUTED`
3. `OWNER_NOTIFIED`
4. `EVIDENCE_REQUIRED`
5. `IN_PROGRESS`
6. `PENDING_APPROVAL` when applicable
7. `PENDING_EXECUTION` when applicable
8. `PENDING_VALIDATION`
9. `VALIDATED`
10. `FAILED_VALIDATION`
11. `SUPPRESSED_APPROVED`
12. `RESIDUAL_ACCEPTED`
13. `CLOSED_BY_SYSTEM`
14. `REOPENED_BY_SYSTEM`

Parent cases SHALL NOT close while a blocking sub-action is unresolved unless an approved exception, approved suppression, or accepted residual-risk record exists.

## 6. Universal Validation Lifecycle

Validation SHALL use these states:

- `NOT_STARTED`
- `EVIDENCE_REQUESTED`
- `EVIDENCE_RECEIVED`
- `VALIDATION_RUNNING`
- `VALIDATED_FIXED`
- `VALIDATED_COMPENSATED`
- `VALIDATED_NOT_FIXED`
- `VALIDATION_INCONCLUSIVE`
- `VALIDATION_BLOCKED`
- `VALIDATION_EXPIRED`
- `REVALIDATION_REQUIRED`

Validation SHALL be triggered by source refresh, connector delta, owner evidence, push execution, BAS result, SIEM/SOAR deployment status, control-state change, scanner refresh, identity graph change, architecture graph change, or communication evidence.

## 7. Universal Closure Gates

A case SHALL close only when all configured gates are satisfied:

- technical validation gate;
- sub-action completion gate;
- communication gate where configured;
- external notifier gate where configured;
- SIR acknowledgement gate where configured;
- SLA/residual phase gate;
- exception/suppression expiry gate;
- evidence freshness gate;
- approval gate;
- audit completeness gate;
- mission-impact gate;
- fusion-map state refresh gate.

Closure SHALL be executed by the system after gate evaluation. User confirmation may be recorded as evidence, not as lifecycle authority.

## 8. Universal Reopening Triggers

A closed case SHALL reopen automatically when any configured trigger fires:

- original risk condition reappears;
- risk object source changes severity or exploitability;
- KEV, CVSS, EPSS, MISP, vendor, BAS, or threat-intel status changes materially;
- validation expires or fails;
- compensating control disappears or degrades;
- affected asset, identity, exposure, or dependency expands;
- blast radius expands;
- mission objective impact increases;
- routing owner rejects or cannot fulfil work;
- communication thread receives material inbound evidence;
- connector freshness drops below threshold;
- tool coverage degrades;
- suppression or exception expires;
- strategy threshold changes and requalifies the case.

## 9. Universal Routing Model

Routing SHALL consider:

- domain;
- risk object type;
- owner of affected asset, identity, application, cloud account, tool, control, or business service;
- business unit;
- tenant and organisation;
- environment;
- severity;
- priority;
- blast radius;
- mission impact;
- operational tempo;
- required skills;
- team affinity;
- workload;
- escalation path;
- approval authority;
- time zone;
- communication ownership;
- shared-responsibility profile;
- automation boundary.

The route decision SHALL be visible in the UI with route rationale and route challenge controls. Route challenge does not directly reroute the case; it requests route recalculation or approval review.

## 10. Strategy Layer Runtime Surfaces

Commander SDR SHALL expose runtime strategy surfaces for:

- SLA strategy;
- thresholds;
- automation boundaries;
- routing;
- posture objectives;
- mission objectives;
- operational tempo;
- domain-specific strategy;
- prioritisation weights;
- validation windows;
- closure gates;
- reopening triggers.

## 11. Fusion Map Binding

Every domain SHALL project into the multi-domain Fusion Map using node, edge, overlay, and case-binding rules. The Fusion Map SHALL include:

- risk overlay;
- drift overlay;
- exposure overlay;
- control overlay;
- coverage overlay;
- blast-radius overlay;
- identity overlay;
- vulnerability overlay;
- architecture overlay;
- tool-health overlay;
- mission overlay;
- validation overlay;
- SLA overlay;
- communication overlay;
- routing overlay.

Every actionable map node SHALL open a bound case, risk object, validation object, sub-action, or communication object. The map SHALL NOT create freeform cases.

## 12. Shell UI Binding

The Shell UI SHALL expose, at minimum:

- Command Centre;
- Case Management;
- Fusion Map;
- Strategy Centre;
- Mission Control;
- System Pulse;
- Team Pulse;
- Domain Pulse;
- Validation Console;
- Routing Console;
- Closure Gates;
- Reopening Queue;
- Communication Centre;
- Automation Boundaries;
- Tool Health;
- Controls;
- Drift;
- Coverage;
- Blast Radius;
- Prioritisation Console.

Any shell frame that lacks these routes is incomplete and SHALL be treated as a visual shell only, not a functional UI authority.


## Universal Domain Lifecycle Matrix

| Domain | Required case lifecycle binding | Required validation | Required reopening | Required routing | Required UI surface | Required Fusion Map layer |
|---|---|---|---|---|---|---|
| Identity | Identity risk, privilege drift, access drift, stale identity, service-account exposure SHALL bind to cases. | Access removed, privilege reduced, identity disabled, conditional access restored, or exception accepted. | Privilege returns, risk score rises, identity graph expands, stale account reappears. | IAM owner, app owner, identity platform owner, SOC/SOM escalation. | Identity Overview, Privileged Access, Risky Identities, Access Drift, Identity Coverage. | Identity nodes, admin edges, privilege edges, blast-radius overlay. |
| Architecture | Architecture drift, anti-pattern, dependency-risk, trust-boundary breach SHALL bind to cases. | Topology confirmed, control restored, design exception approved, dependency risk reduced. | Topology changes, exposure expands, dependency appears, trust boundary changes. | Architecture owner, cloud/platform owner, service owner, SOM. | Architecture Overview, Architecture Drift, Dependency Map, Cloud Posture. | Architecture nodes, dependency edges, trust-boundary overlay. |
| Vulnerability | Scanner findings, external advisories, code/supply-chain findings SHALL bind to cases. | Patch confirmed, mitigation confirmed, compensating control confirmed, not-applicable confirmed. | KEV/intel changes, asset remains vulnerable, patch rollback, new asset affected. | VM owner, asset owner, app owner, patch owner, SOM. | Vulnerability Overview, KEV, Remediation, SLA, Patch Intelligence, Code/Supply Chain. | CVE nodes, asset edges, control compensation overlay. |
| Exposure | External/internal exposure, internet-facing drift, open service risk SHALL bind to cases. | Exposure removed, firewall/WAF/DNS state confirmed, accepted exception. | Exposure reappears, DNS changes, port opens, asset becomes public. | Exposure owner, network owner, cloud owner, app owner. | Exposure & Posture, Attack Surface, Blast Zones. | Exposure overlay, internet boundary, attack path edges. |
| Controls | Missing/degraded control, failed control, weak compensating control SHALL bind to cases. | Control restored or compensating control validated. | Control degrades, coverage drops, configuration changes. | Control owner, platform owner, governance owner. | Control Coverage, Control Validation, Compliance. | Control nodes and protects/lacks_control edges. |
| Drift | Config drift, policy drift, architecture drift, access drift SHALL bind to cases. | Baseline restored, approved exception, accepted residual risk. | Drift recurs, exception expires, baseline changes. | Domain owner plus SOM threshold route. | Drift Console, Architecture Drift, Access Drift. | Drift overlay and baseline deviation edges. |
| Tool Health | Connector failure, telemetry stale, tool degradation, license/coverage failure SHALL bind to cases. | Fresh ingestion restored, connector healthy, telemetry confirmed. | Freshness expires, tool fails again, exclusive coverage disappears. | Platform/tool owner, SOC tooling owner, SOM. | Tool Health, Connectors, Platform. | Tool nodes, monitored_by, covered_by, stale edges. |
| Coverage | EDR/NDR/VM/cloud/identity coverage gaps SHALL bind to cases. | Coverage confirmed, tool state restored, exception accepted. | Asset loses coverage, connector stale, new uncovered asset appears. | Tool owner, asset owner, platform owner. | Coverage Gaps, Scanner Coverage, Identity Coverage. | Coverage overlay and not_covered_by edges. |
| Blast Radius | Blast zone expansion or high-impact path SHALL bind to cases. | Radius reduced, path broken, compensating control confirmed. | Graph expands, critical path reappears, identity privilege increases. | SOM, domain owner, mission owner, architecture owner. | Blast Zones, Mission Control, Fusion Map. | Blast-radius overlay, mission-impact overlay. |


---

# REVISION v2.0 SPECIFICATION SCHEDULE EXTENSION

| Spec | Document | Status | Build Gate |
|---|---|---|---|
| 29 | Universal Risk Object and Case Binding | Required | Blocks all case, connector, drift, exposure, vulnerability, identity and communication work. |
| 30 | Universal Validation, Closure and Reopening Lifecycle | Required | Blocks case lifecycle, validation, closure, reopening and dashboard work. |
| 31 | Routing Model and Team Affinity | Required | Blocks assignment, team pulse, routing console and escalation work. |
| 32 | Strategy Layer Runtime Surface | Required | Blocks SLA, threshold, automation-boundary, mission and operational tempo work. |
| 33 | Multi-Domain Fusion Map | Required | Blocks architecture map, blast radius, identity graph and case graph work. |
| 34 | Mission Control, System Pulse, Team Pulse and Domain Pulse | Required | Blocks command centre, CISO dashboard and operational dashboard work. |
| 35 | Shell UI Functional Surface | Required | Blocks shell implementation beyond visual frame. |

---

# v2.1 APPLICATION BOUNDARY UPDATE — COMMANDER INTERNAL CONTROL PLANE

## Status
Superseding architectural clarification. This section is authoritative where legacy wording treats the Commander control capability as only a module, panel, or configuration page.

## Mandatory Application Boundary
Commander is now defined as a platform with three distinct application surfaces:

1. **Commander SDR Operational Application**
   - Customer-facing and internal operational surface.
   - Used for Command Centre, cases, risk objects, validation state, Fusion Map, communications, dashboards, reporting, and prioritisation-led remediation work.
   - Does not own commercial licence allocation, entitlement manifest authoring, deployment ring assignment, customer onboarding governance, or internal operator controls.

2. **Commander SDR Tenant Admin Surface**
   - Customer tenant administration surface inside the SDR tenant context.
   - Used by authorised customer administrators for users, tenant connectors, tenant-visible features, tenant policy settings, notification channels, and tenant audit/export.
   - May display licence/entitlement state as read-only unless explicitly delegated by the internal Commander Control Plane.

3. **Commander Internal Control Plane Application**
   - Separate internal application used by the Commander/Seiertech operating team.
   - Governs customers, tenants, instances, licences, entitlements, commercial feature allocation, module availability, trial state, demo/dogfood tenants, deployment rings, support access, self-hosted licence artefacts, operator audit, and emergency commercial/platform controls.
   - Controls what the SDR Operational Application and Tenant Admin Surface may expose, but is not used for day-to-day customer case operations.

## Non-Negotiable Rule
The Commander Internal Control Plane is not a customer module. It is a separate internal authority surface wired into the shared platform runtime through controlled entitlement, tenant, feature, deployment, support-access, and audit contracts.

## Runtime Authority
- The Operational Application executes SDR work.
- The Tenant Admin Surface manages customer-tenant administration within delegated boundaries.
- The Internal Control Plane governs commercial/platform authority above tenants.

## Build Consequence
Any implementation work must preserve this boundary. No operational Shell screen may become the authoritative source for licence allocation, commercial entitlement authoring, deployment ring membership, emergency kill switch control, or internal operator impersonation/support access approval.

---

# v2.1 Specification Additions — Commander Internal Control Plane Application Boundary

The following documents are added to the active child specification schedule and are build-blocking for application-boundary correctness:

| Spec | Document | Application Surface | Status |
|---|---|---|---|
| 36 | `36_Commander_Internal_Control_Plane_Application_Architecture_Spec.md` | Commander Control Plane | Required |
| 37 | `37_Commander_Internal_Control_Plane_to_SDR_Runtime_Contract.md` | Shared Runtime Contract | Required |
| 38 | `38_Commander_Internal_Control_Plane_UI_Surface_Spec.md` | Commander Control Plane UI | Required |
| 39 | `39_Commander_Application_Boundary_and_Naming_Model_Spec.md` | Platform Boundary | Required |

HTML/UI artefact added:

- `commander-control-plane-shell-v1.html`
- `docs/06_ui_build_reference/commander-control-plane-shell-v1.html`

These additions establish the internal Commander Control Plane as a separate application for customer, tenant, licence, entitlement, deployment ring, support access, and operator audit management.



---

# v2.2 Addendum — P0 Zero-Day Priority Override

This document is updated by the v2.2 P0 Zero-Day Priority doctrine.

Authoritative rule:

- P0 Zero-Day Priority is the highest emergency priority class in Commander SDR.
- P0 is a governed priority overlay, not a case lifecycle status.
- P0 may only be applied to an existing case-bound risk object.
- P0 may be applied automatically by deterministic risk conditions or manually by authorised senior role owners.
- P0 does not permit manual case creation, manual case closure, manual lifecycle bypass, validation bypass, or evidence bypass.
- P0 immediately drives emergency SLA, routing, escalation, validation cadence, communication cadence, dashboard prominence, Fusion Map visibility, sub-action generation, and audit.
- P0 downgrade/removal requires equal-or-higher authority, reason code, evidence reference, and audit capture.
- Where this document contains older priority, SLA, routing, RBAC, dashboard, or lifecycle wording, the v2.2 P0 doctrine supersedes it.

Required implementation reference:

- `docs/02_child_specs/40_P0_Zero_Day_Priority_Override_Spec.md`



## v2.2 Schedule Addition — Spec 40

| Spec | Document | Status | Purpose |
|---|---|---|---|
| 40 | `docs/02_child_specs/40_P0_Zero_Day_Priority_Override_Spec.md` | Authoritative | Defines P0 Zero-Day Priority as the highest governed emergency priority overlay across case engine, SLA, routing, validation, communication, Fusion Map, Tenant Admin, Commander Internal Control Plane, RBAC, and audit. |
## v2.3 Schedule Update — UI Doctrine Specs Added
The schedule now includes Specs 41–45 as active build-authority documents. These specs govern military-intelligence UI doctrine, reusable components, graph/gauge/overlay instrumentation, P0 War Room UI, and application shell boundaries. UI build work must reference these specs before generating or modifying shell/page components.

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



## v2.3 Added UI Doctrine Documents

- Spec 41: `Commander_SDR_Military_Intelligence_UI_Doctrine_Spec.md` — active build authority.
- Spec 42: `Commander_SDR_UI_Component_Catalogue_Spec.md` — active build authority.
- Spec 43: `Commander_SDR_Graph_Gauge_and_Overlay_System_Spec.md` — active build authority.
- Spec 44: `Commander_SDR_P0_Zero_Day_War_Room_UI_Spec.md` — active build authority.
- Spec 45: `Commander_SDR_Application_Shell_Boundary_Spec.md` — active build authority.

---

# v2.5 Baseline Alignment Addendum — Admin, Navigation, Visibility and Defaults

This document is governed by `00_AUTHORITY_AND_PRECEDENCE_v2_5_2.md`.

v2.5 adds the following binding baseline rules:

1. Admin/control surfaces are first-class and split across Operational App Platform, Tenant Admin, Commander Commercial Control Plane and Build Pipeline Control.
2. Tenant Admin includes Baseline Configuration, Users & Access, Connectors & Data Sources, Strategy & Operating Model, Rules & Models, AI Configuration, Automation Boundaries, Communications, Exceptions & Suppressions, Audit/Compliance/Exports and Feature Availability.
3. Commander Commercial Control Plane is the internal application for customers, tenants, licences, entitlements, feature flags, baseline profiles, rule/model packs, deployment rings, support access, usage evidence and operator audit.
4. Menus, routes, panels and actions are generated from a registry and are visible in build mode but suppressed at runtime by RBAC, entitlement, feature flag, environment and policy state.
5. Frontend menu suppression is not security. Backend/API enforcement is mandatory.
6. Rule Engine and Model Management surfaces are mandatory and include simulation, versioning, rollback, audit and decision explainability.
7. Mission Control is driven by structured MissionObjective bindings to assets, applications, identities, cloud accounts, data stores, endpoints, tags, business services, dependency graph relationships and rules.
8. Baseline Configuration Profiles are mandatory and cover risk, SLA, routing, validation, closure/reopening, P0, automation, communications, RBAC, AI, rule packs, decision models, control frameworks, compliance mappings, CTEM, MITRE ATT&CK, ISO/NIST/CIS/AWS mappings and reporting defaults.
9. Tenant active configuration is derived from baseline templates and may be customised with audit, approval, versioning and baseline-drift visibility.
10. Shell usability corrections are binding: global search moves before Commander AI, search must not be cramped, sidebar scroll must be visible, and menu expansion must be supported structurally now and dynamically during frontend build.

Where older wording conflicts with this addendum, v2.5 authority wins.
