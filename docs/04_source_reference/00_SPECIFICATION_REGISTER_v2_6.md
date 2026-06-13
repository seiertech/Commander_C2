> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Specification Register — v2.6 Baseline

**Document ID:** `00_SPECIFICATION_REGISTER_v2_6.md`
**Version:** v2.6
**Status:** Authoritative
**Date:** May 2026

## 1. Purpose

This document catalogues all binding specifications in the Commander SDR baseline at v2.6. It is the authoritative inventory used by the build pipeline, audit operations, and conformance evaluation.

## 2. Master Documents

| ID | Title | Version | Status |
|---|---|---|---|
| 00_master/Commander_SDR_Master_Proposition_v5_0.md | Master Proposition | v5.0 | Active — supersedes v4.7 |
| 00_master/Commander_SDR_Master_Technical_Specification_v7_0.md | Master Technical Specification | v7.0 | Active — supersedes v6.8 |
| 00_master/SDR_Control_Plane_Specification_v1_1.md | SDR Control Plane Specification | v1.1 | Active — carried forward from v2.5.2 |
| 00_master/SDR_Specification_Schedule_and_Folder_Structure_v1_9.md | Spec Schedule & Folder Structure | v1.9 | Active — carried forward from v2.5.2 |

## 3. Authority Documents

| ID | Title | Version |
|---|---|---|
| 00_master/00_AUTHORITY_AND_PRECEDENCE_v2_6.md | Authority and Precedence | v2.6 |
| 00_master/00_SPECIFICATION_REGISTER_v2_6.md | Specification Register | v2.6 |
| CURRENT_BASELINE_MANIFEST_v2_6.md | Current Baseline Manifest | v2.6 |
| RELEASE_NOTES_v2_6.md | Release Notes | v2.6 |

## 4. Binding Child Specifications

### 4.1 v2.5.2 Specifications (carried forward unchanged)

Specs #01 through #56 carry forward from v2.5.2 unchanged. Selected specs receive v2.6 addendum sections (extension specs) which are appended to but do not replace the v2.5.2 content. The full catalogue:

| Spec # | Title | Status at v2.6 |
|---|---|---|
| 01 | Application Boundary and Routing Doctrine | Active — unchanged |
| 02 | Multi-Tenancy and SSO Implementation | Active — unchanged |
| 03 | Tenant Onboarding Workflow | Active — unchanged |
| 04 | Self-Hosted Tenancy Mode | Active — unchanged |
| 05 | Data Connector Normalisation Implementation | Active — unchanged (extended by Spec #61) |
| 06 | Five-Tier Ingestion Strategy | Active — unchanged |
| 07 | Universal Search Implementation | Active — unchanged |
| 08 | Case Management Workflow | Active — v2.6 addendum (case taxonomy extended) |
| 09 | Connector Architecture | Active — unchanged (extended by Spec #61) |
| 10 | Detection Model Library and Rule Builder | Active — unchanged |
| 11 | Coverage Control Model | Active — unchanged |
| 12 | SDR Normalisation Strategy | Active — unchanged (extended by Spec #61, #62) |
| 13 | Identity Intelligence Implementation | Active — unchanged (extended by Spec #68) |
| 14 | Push Capability Implementation | Active — unchanged |
| 15 | SIEM/SOAR Rule Generation | Active — unchanged (extended for v2.6 bidirectional flow) |
| 16 | Vulnerability Management Implementation | Active — unchanged |
| 17 | Target Users and Persona Model | Active — v2.6 addendum (Security Analyst, Risk Analyst) |
| 18 | Use-Case Schedule | Active — v2.6 addendum (new persona use cases) |
| 19 | Full RBAC Permission Matrix | Active — v2.6 addendum (Internal Risk authority) |
| 20 | Push Action Governance | Active — unchanged |
| 21 | Architecture Intelligence Engine | Active — unchanged |
| 22 | Architecture Intelligence Spec | Active — unchanged |
| 23 | Security Tool Intelligence | Active — unchanged (extended by Spec #61) |
| 24 | Connector API Reference Framework | Active — unchanged (extended by Spec #61) |
| 25 | Cross-System Coordinated Push | Active — unchanged |
| 26 | Cross-Cloud Risk Correlation | Active — unchanged |
| 27 | Third-Party Visibility and Trust Boundary Intelligence | Active — unchanged |
| 28 | Strategic and Tactical Priority Framework | Active — v2.6 addendum (verdict modulation, auto-promotion) |
| 29 | Universal Risk Object and Case Binding | Active — v2.6 addendum (new risk object types) |
| 30 | Case Validation and Closure | Active — unchanged |
| 31 | Routing Model and Team Affinity | Active — v2.6 addendum (Internal Risk, Policy Owner roles) |
| 32 | Case Communication Adapters | Active — unchanged |
| 33 | Multi-Domain Fusion Map | Active — v2.6 addendum (Operating Picture relationship) |
| 34 | Commander AI Implementation | Active — unchanged |
| 35 | Compliance and Standards Module | Active — unchanged |
| 36 | Evidence Pack Model | Active — unchanged |
| 37 | Security Debt Register | Active — unchanged |
| 38 | Refresh Planner | Active — unchanged |
| 39 | Behavioural Intelligence | Active — unchanged |
| 40 | Endpoint and SaaS Policy Drift | Active — unchanged |
| 41 | Commander SDR Military Intelligence UI Doctrine | Active — v2.6 addendum (C2 vocabulary, OODA conventions) |
| 42 | Domain Security Dashboards | Active — unchanged |
| 43 | Workspace Model Implementation | Active — unchanged |
| 44 | Tenant Configuration Registry | Active — unchanged |
| 45 | Baseline Profile Authority | Active — unchanged |
| 46 | Canonical Terminology and Object Glossary | Active — v2.6 addendum (new terminology) |
| 47 | Application Route and Navigation Register | Active — v2.6 addendum (new routes) |
| 48 | Audit Event Framework | Active — unchanged |
| 49 | Notification and Alert Adapter Framework | Active — unchanged |
| 50 | RBAC Entitlement Feature Flag Menu Visibility | Active — unchanged |
| 51 | Rule Model and Decision Governance Surface | Active — unchanged |
| 52 | Structured Mission Objective Binding Model | Active — unchanged |
| 53 | Shell UI Usability Correction | Active — unchanged |
| 54 | Pre-Build UI Navigation and Route Baseline v2.5 | Active — unchanged |
| 55 | Baseline Configuration Framework Model and Defaults | Active — v2.6 addendum (v2.6 parameters) |
| 56 | Shell Reference vs Build Authority Doctrine | Active — unchanged |

### 4.2 v2.6 New Binding Specifications

| Spec # | Title | Status |
|---|---|---|
| 57 | Security Command and Control Doctrine | New — v2.6 foundational doctrine |
| 58 | Security OODA Loop Specification | New — v2.6 foundational doctrine |
| 59 | Intelligence Layer Architecture | New — v2.6 foundational architecture |
| 60 | Internal and External Attack Surface Framework | New — v2.6 foundational framework |
| 61 | Universal Security Signal Connector Contract | New — v2.6 foundational connector architecture |
| 62 | Verdict Semantics Specification | New — v2.6 foundational architecture |
| 63 | Reserved | Connector schedules via INDEX.md updates |
| 64 | Reserved | Connector schedules via INDEX.md updates |
| 65 | External Operating Picture Surface | New — v2.6 surface specification |
| 66 | Internal Operating Picture Surface | New — v2.6 surface specification |
| 67 | OODA Dashboard Family | New — v2.6 surface specification |
| 68 | Identity Intelligence Surface | New — v2.6 surface specification |
| 69 | Asset Intelligence Surface | New — v2.6 surface specification |
| 70 | Direction Boards | New — v2.6 surface specification |
| 71 | Pre-Warned/Protected/Novel Classification | New — v2.6 classification architecture |
| 72 | Inverse Discovery Loop | New — v2.6 capability |
| 73 | Silent Defence Reporting | New — v2.6 reporting capability |
| 74 | Context-Aware Drift Prioritisation Matrix | New — v2.6 prioritisation architecture |
| 75 | Internal Risk Investigation Sub-Lifecycle | New — v2.6 governance specification |

## 5. Reference Inputs

### 5.1 `docs/03_api_specs/`

Governed by `API_SPEC_INTAKE_RULES.md`. Catalogued in `INDEX.md`. The reference-input tree contains vendor-specific API specifications informing connector implementation.

The v2.6 release updates `INDEX.md` to capture the four-class declaration model per Spec #61.

### 5.2 `docs/04_shells/`

HTML shell references for the Operational App and Tenant Admin (and Commercial Control Plane). Governed by Spec #56 (Shell Reference vs Build Authority Doctrine).

### 5.3 `docs/05_reference/`

Historical baseline references including v2.5.2 release notes and superseded documents retained for audit purposes.

## 6. Feature Registry

- `SDR_Feature_Registry_FR001_v1_0.md` — Feature registry, updated for v2.6

## 7. Versioning

This is Specification Register v2.6. It supersedes v2.5.2 in full. Future versions issued under successive baseline increments.
