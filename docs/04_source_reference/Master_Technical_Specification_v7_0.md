> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.

# v2.6 Baseline Authority Notice

This document is active under Commander SDR Baseline v2.6. It is governed by `00_AUTHORITY_AND_PRECEDENCE_v2_6.md`. It supersedes `Commander_SDR_Master_Technical_Specification_v6_8.md` in full.

---

**Commander SDR — Master Technical Specification**

**Version 7.0  |  May 2026  |  Authoritative**

**CONFIDENTIAL**

---

# Document Purpose and Authority

This is the single authoritative Master Technical Specification for Commander SDR. It defines the platform architecture, component behaviour, data model, integration model, lifecycle model, security model, governance model, and technical conformance criteria.

It describes *how* the platform is implemented technically. The proposition, capability model, persona model, commercial model, and use-case schedule are defined separately in the Master Proposition v5.0.

**Supersedes:** Master Technical Specification v6.8 in full.

**Material changes from v6.8 to v7.0:**

1. Adds the Intelligence Layer Architecture as a load-bearing technical construct (Spec #59)
2. Adds the four-class connector architecture with multi-class declaration (Spec #61)
3. Adds verdict semantics processing layer (Spec #62)
4. Adds the Security OODA Loop technical implementation (Spec #58)
5. Adds the Operating Pictures technical implementation (Specs #65, #66)
6. Adds Identity and Asset Intelligence Surface technical implementation (Specs #68, #69)
7. Adds Pre-Warned/Protected/Novel classification engine (Spec #71)
8. Adds Inverse Discovery Loop (Spec #72)
9. Adds context-aware drift prioritisation matrix (Spec #74)
10. Adds Internal Risk Investigation Sub-Lifecycle technical governance (Spec #75)
11. Extends case taxonomy to twelve case types
12. Extends persona model to eleven personas with Internal Risk authority overlay

This document operates under the authority of the Master Proposition v5.0 and the v2.6 binding doctrine specs (#57-#75). Where this technical specification contradicts a binding child spec, the child spec governs (per Authority and Precedence v2.6).

---

# 1. Platform Architecture Overview

Commander SDR is a SaaS Security Command and Control platform structured in seven architectural layers:

| Layer | Function | Key Specs |
|---|---|---|
| Connector Layer | Four-class connector architecture (SOC Telemetry, Operational Verdict, Configuration State, Threat Intelligence). Read-only by default. Push capability authorised separately. | #05, #09, #12, #23, #24, **#61** |
| Normalisation Layer | Canonical entity model, authority resolution, entity matching, verdict semantics processing, inverse discovery routing | #12, **#62**, **#72** |
| Engine Layer | Drift detection (~240 models), identity intelligence, architecture intelligence, blast radius, attack path likelihood, risk scoring, behavioural anomaly, pre-warned classification | Existing v2.5 + **#71** |
| Intelligence Layer | Four-stream integration, Estate Intelligence Picture, Identity Intelligence Surface, Asset Intelligence Surface, cross-stream correlation | **#59**, **#68**, **#69** |
| Case Layer | Universal Risk Object binding, closed-loop case lifecycle, routing, validation, closure gates, reopening triggers | #08, #29, #30, #31 |
| OODA Layer | Programme-level OODA tempo, phase health metrics, phase dashboards, Command Tempo Dashboard | **#58**, **#67** |
| Surface Layer | Workspaces, dashboards, Operating Pictures, Entity Intelligence Surfaces, Direction Boards, reporting cadences, three application boundaries | #41, **#65**, **#66**, **#70** |

The architectural layering is strict. Each layer consumes from the layer below and produces for the layer above. Cross-layer shortcuts are prohibited.

# 2. The Connector Layer

## 2.1 Four-Class Architecture

Per Spec #61, every connector declares against one or more of four classes:

- **Class A — SOC Telemetry**: case and detection signal from SIEM/XDR/EDR/NDR platforms
- **Class B — Operational Verdict**: verdict signal from email security, endpoint compliance, web filtering, identity policy, DLP enforcement
- **Class C — Configuration State**: intended state of controls, assets, identities (v2.5 connector universe extended)
- **Class D — Threat Intelligence**: external threat intelligence feeds

A connector may declare against multiple classes (multi-class declaration pattern). Microsoft Defender for Endpoint declares A+B+C. CrowdStrike Falcon declares A+B+C. Microsoft Sentinel declares A+C.

## 2.2 Eight Signal Purposes

Every pull operation produces signal resolving to one or more of eight purposes:

1. Configuration Signal → drift detection engine
2. State Signal → platform-health and coverage engines
3. Verdict Signal → Internal Behavioural Intelligence stream, verdict semantics processing
4. Detection Signal → External Attack Intelligence stream
5. Case Signal → External Attack Intelligence stream, External Operating Picture
6. Inventory Signal → canonical entity model
7. Behavioural Signal → risk scoring engine, summary counters
8. Threat Signal → External Threat Intelligence stream, estate-matching engine

## 2.3 Conformance Tier System

Per Spec #61 Section 4.1, every connector has a conformance tier per declared class:

- **Certified** — built, tested against vendor sandbox, conformance test suite running continuously
- **Full** — built, tested against customer data in pilot
- **Baseline** — built against vendor documentation, customer-specific tuning expected
- **Planned** — named in schedule, not yet built

The conformance tier per class is captured in `docs/03_api_specs/INDEX.md` and informs deployment planning.

## 2.4 Read-Only Enforcement

Class A and Class B connectors are read-only with respect to source platforms. The enforcement is implemented at the connector contract layer — Class A and Class B connectors are technically incapable of write operations under normal configuration. The Push capability operates separately (Spec #14) with explicit authorisation, approval gates, and reversibility.

## 2.5 v2.6 Tier 1 Connector Schedule

The v2.6 release ships with the following Tier 1 connectors certified for production deployment:

| Connector | Class A | Class B | Class C | Class D |
|---|---|---|---|---|
| Microsoft Sentinel | Certified | — | Full | — |
| Microsoft Defender for Endpoint | Certified | Certified | Full | — |
| Google SecOps / Chronicle | Certified | — | — | — |
| Splunk Enterprise Security | Full | — | — | — |
| CrowdStrike Falcon | Certified | Certified | Full | — |
| Rapid7 InsightIDR | Full | — | — | — |
| Darktrace | Full | Full | — | — |
| Antigena Email | — | Certified | — | — |
| Microsoft Intune | — | Certified | Certified | — |
| Microsoft Entra Conditional Access | — | Full | Certified | — |
| Microsoft Purview DLP | — | Full | Full | — |
| Zscaler ZIA | — | Full | Full | — |
| (All v2.5.2 connectors) | — | — | Carried forward unchanged | — |
| CISA KEV Feed | — | — | — | Certified |

Tier 2 connectors named in `docs/03_api_specs/INDEX.md` v2.6.

# 3. The Normalisation Layer

## 3.1 Canonical Entity Model

The canonical entity model (per existing v2.5.2 specs) is the single source of truth for entities. The v2.6 release extends the canonical model with:

- Verdict-emitting entities (policies, verdict events)
- Intelligence stream artefacts
- Multi-class connector signal attribution
- Cross-stream entity binding

The canonical model is extensible — new entity types and new relationship types can be added without doctrinal change.

## 3.2 Verdict Semantics Processing

Per Spec #62, verdict signal is processed with specific semantic discipline:

- **Time-bound claims** — every verdict is a claim at a moment in time, not ground truth
- **Five mandatory dimensions** — identity, time, disposition, policy reference, source
- **Eight canonical dispositions** — BLOCK / QUARANTINE / COACH / REQUIRE_MFA / REQUIRE_COMPLIANT / MONITOR / ALLOW / AUDIT
- **Density aggregation** — per-entity, per-policy, per-disposition, per-source, cross-axis
- **Disagreement detection** — when multiple tools produce contradictory verdicts
- **Trust calibration** — per-tool, per-disposition trust weights tuned over time
- **Storage tiering** — hot (24-72h) / warm (3-30d) / cold (30d+, summary form only)

## 3.3 Inverse Discovery Routing

Per Spec #72, when any normalisation operation fails to resolve an entity reference, the Inverse Discovery Loop fires:

1. Secondary resolution attempt (fuzzy match, identifier translation, recent change check)
2. If secondary resolution fails, Coverage Blindspot case generated
3. Root cause auto-classified (discovery gap, staleness, shadow IT, naming mismatch)
4. Case routed to platform or architecture team

# 4. The Engine Layer

The engine layer comprises Commander's analytical engines. All existing v2.5 engines carry forward unchanged:

- Drift detection engine (~240 models across 13 domains)
- Risk scoring engine
- Blast radius engine
- Architecture intelligence engine
- Identity chain computation engine
- Behavioural anomaly detection engine
- Attack path likelihood engine
- BAS integration engine (Phase 2)

The v2.6 release adds:

- **Pre-Warned Classification Engine** (Spec #71) — runs on every External Attack Correlation case
- **Threat Relevance Scoring** — extended for v2.6 cross-stream correlation

# 5. The Intelligence Layer

Per Spec #59, the Intelligence Layer is the architectural construct that integrates four streams:

- External Threat Intelligence
- External Attack Intelligence
- Internal Behavioural Intelligence
- Posture Intelligence

Above the four streams sits the unified **Estate Intelligence Picture (EIP)** — the integration surface queried by all surface-layer consumers.

Cross-stream correlations produced by the Intelligence Layer:

- Pre-Warned/Protected/Novel classification
- Verdict disagreement detection
- Inverse discovery
- Behavioural anomaly detection
- Threat relevance scoring
- Silent defence aggregation

# 6. The Case Layer

## 6.1 Closed-Loop Case Lifecycle

The closed-loop case lifecycle from v2.5.2 carries forward unchanged. Every case progresses:

`DETECTED` → `BOUND` → `ROUTED` → `PRIORITISED` → `ACTION_DECOMPOSED` → `IN_PROGRESS` → `PENDING_VALIDATION` → `VALIDATION_RUNNING` → `VALIDATED_*` → `PENDING_CLOSURE_GATES` → `CLOSED_BY_SYSTEM` → optionally `REOPENED_BY_SYSTEM`

No manual case creation. No manual lifecycle progression. No manual closure.

## 6.2 v2.6 Case Taxonomy

Twelve case types in v2.6:

**v2.5 case types (unchanged):**

1. Drift case
2. Vulnerability case
3. Identity case
4. Exposure case
5. Coverage case
6. Tool Health case
7. Threat Intelligence Estate Match case

**v2.6 new case types:**

8. External Attack Correlation case
9. Verdict Pattern case
10. Inverse Discovery (Coverage Blindspot) case
11. Policy Effectiveness case
12. OODA Tempo Degradation case

## 6.3 Universal Risk Object Extension

The `risk_object_type` enum extends with:

- `external_attack_correlation`
- `verdict_pattern`
- `coverage_blindspot`
- `policy_effectiveness`
- `ooda_phase_degradation`

# 7. The OODA Layer

Per Spec #58, Commander runs a continuous Security OODA Loop at the programme level. The four phases:

- **Observe** — signal intake, connector freshness, coverage completeness
- **Orient** — drift detection, risk scoring, blast radius, classification
- **Decide** — remediation generation, routing, prioritisation, approval
- **Act** — execution, validation, closure

OODA tempo is Commander's primary operational metric. Phase health scores computed continuously. Bottleneck identification surfaces the slowest phase.

# 8. The Surface Layer

## 8.1 Workspaces (six)

- Executive Posture
- Drift Operations
- Control & Architecture
- Identity & Asset Intelligence
- Assurance & Audit
- Transformation & M&A

## 8.2 v2.6 Surface Additions

- External Operating Picture (Spec #65)
- Internal Operating Picture (Spec #66)
- OODA Dashboard Family (Spec #67) — 4 phase dashboards + Command Tempo Dashboard
- Identity Intelligence Surface (Spec #68)
- Asset Intelligence Surface (Spec #69)
- Control Weakness Direction Board (Spec #70)
- Policy Effectiveness Direction Board (Spec #70)
- Silent Defence Reporting (Spec #73)

## 8.3 Three Application Boundaries

Per v2.5.2 doctrine, Commander operates as three distinct applications:

- **Operational App** — `app.commander-sdr.com` — case management, dashboards, intelligence surfaces
- **Tenant Admin** — `admin.commander-sdr.com` — configuration, RBAC, audit, deployment
- **Commercial Control Plane** — internal Anthropic admin for cross-tenant operations, licensing, baseline profile management

# 9. The Security Model

## 9.1 Persona Model (eleven personas)

Per Spec #17 v2.6:

1. Security Operations Analyst (SOA)
2. Security Operations Manager (SOM)
3. Vulnerability Analyst
4. Security Architect
5. Identity/Access Specialist
6. Risk/Compliance/Audit User
7. M&A/Transformation Analyst
8. CISO
9. Control Owner
10. Security Analyst (new in v2.6)
11. Risk Analyst (new in v2.6)

## 9.2 Authority Overlays (five)

- Administrative authority
- Investigation authority
- Approval authority
- Reporting authority
- **Internal Risk authority** (new in v2.6)

## 9.3 RBAC

Per Spec #19 v2.6, RBAC scopes extend with:

- Internal Risk scope (gates access to Verdict Pattern cases, Internal Operating Picture identity detail, Identity Intelligence Surface behavioural section)
- Policy Owner scope (gates Policy Effectiveness case ownership)
- OODA Phase scope (operational metric access per phase)

# 10. The Governance Model

## 10.1 SOC Boundary

Per Master Proposition v5.0 Section 25 and Spec #57 Section 5: Commander never triages SOC cases, never runs incident response, never executes against SOC platforms. Read-only Class A connector intake; outbound detection specifications via ITSM dispatch.

## 10.2 Insider Risk Boundary

Per Master Proposition v5.0 Section 26 and Spec #75: Commander surfaces patterns, customer investigates. No intent determination, no disciplinary action, intelligence-grade evidence only (not investigation-grade).

## 10.3 Jurisdictional Configuration

Internal Behavioural Intelligence stream supports jurisdiction-specific configuration:

- Stream disable per jurisdiction
- Threshold configuration per local norms
- RBAC restriction
- Retention restriction
- Audit-of-access transparency

## 10.4 Configuration Governance

Per Spec #55 v2.6, all v2.6 configurable parameters operate under the Tenant Configuration Registry with:

- System defaults shipped at build
- Tenant-customisable via Tenant Admin
- Versioned and audited
- Baseline profile authority (Commercial Control Plane)

# 11. The Data Model

## 11.1 Data Classifications

- **Configuration data** — intended state, retained per tenant policy
- **State data** — operational state, retained per tenant policy
- **Verdict data** — high-volume, tiered storage (hot/warm/cold)
- **Detection data** — read-only from SOC platforms, retained per SOC policy
- **Case data** — Commander cases, retained per tenant policy
- **Threat intelligence data** — per source licensing
- **Audit data** — retained per audit retention policy

## 11.2 Data Residency

Commander supports:

- EU data residency (EU-resident tenancy)
- UK data residency
- US data residency
- APAC data residency (configurable per region)
- Self-hosted option for sovereign tenancy requirements

# 12. The Integration Model

## 12.1 Inbound Integration (read)

- Class A SOC Telemetry connectors → External Attack Intelligence stream
- Class B Operational Verdict connectors → Internal Behavioural Intelligence stream
- Class C Configuration State connectors → drift detection, posture intelligence
- Class D Threat Intelligence connectors → External Threat Intelligence stream

## 12.2 Outbound Integration (write — gated)

- Push actions to source systems (Spec #14, premium-gated, approval-required, reversible)
- SOAR dispatch (Spec #15, via ITSM record)
- ITSM record creation (two-record dispatch model)
- Detection specifications via ITSM to SIEM/SOAR engineering teams
- Notification adapters (Teams, Slack)

## 12.3 Reporting Integration

- Evidence pack export (PDF, structured formats)
- Compliance framework export
- Board report generation
- API access (audit-logged)

# 13. The Lifecycle Model

## 13.1 Tenant Lifecycle

- Tenant provisioning (Commercial Control Plane)
- Baseline profile assignment
- Initial configuration
- Connector onboarding
- Pilot operation
- Production cutover
- Renewal / expansion / termination

## 13.2 Connector Lifecycle

- Onboarding (Spec #09)
- Configuration
- Activation
- Health monitoring
- Tuning
- Retirement

## 13.3 Detection Model Lifecycle

- Authoring (Rule Builder)
- Testing (test-to-live staging)
- Promotion
- Operation
- Tuning
- Retirement

# 14. Conformance Criteria

The v2.6 baseline is conformant when:

- All seven architectural layers operate per their specifications
- Connector classes A, B, C, D operate with multi-class declaration support
- Verdict semantics processing operates per Spec #62
- Intelligence Layer integrates four streams per Spec #59
- Security OODA Loop runs continuously per Spec #58
- Operating Pictures (both) operational per Specs #65, #66
- OODA Dashboard Family operational per Spec #67
- Identity and Asset Intelligence Surfaces operational per Specs #68, #69
- Direction Boards operational per Spec #70
- Pre-Warned Classification Engine operational per Spec #71
- Inverse Discovery Loop operational per Spec #72
- Silent Defence Reporting operational per Spec #73
- Context-Aware Drift Prioritisation operational per Spec #74
- Internal Risk Investigation Sub-Lifecycle governance enforced per Spec #75
- Case taxonomy extended to twelve types per Spec #08 v2.6
- Persona model at eleven per Spec #17 v2.6
- RBAC extended for v2.6 authority overlays per Spec #19 v2.6
- All v2.6 configurable parameters exposed per Spec #55 v2.6
- SOC boundary enforced (no incident triage, no SOC writes)
- Insider Risk boundary enforced (surface only, no investigation)
- All v2.5.2 conformance criteria continue to hold

# 15. Versioning

This is Master Technical Specification v7.0, superseding v6.8. The v2.6 release introduces substantial new architecture (Intelligence Layer, OODA Layer, Surface Layer extensions) while preserving all existing v2.5.2 conformance criteria.

Future releases will continue versioning per the established baseline pattern. The Master Technical Specification re-issues when changes affect technical conformance criteria; intermediate releases may update via child spec versions without re-issuing the master.
