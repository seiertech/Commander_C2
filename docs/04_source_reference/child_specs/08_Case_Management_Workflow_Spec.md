> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #8 — Case Management & Workflow
## Commander SDR Cognitive Case Handling Engine

**Document version:** v1.6
**Status:** Approved Baseline — Build Package Derivation Ready  
**Governing documents:** Commander SDR Master Technical Specification v6.7, Master Proposition v4.7, Spec #26a Closed-Loop Email & Case Communication Lifecycle
**Specification phase:** Phase 0 (state machines, data models, formulas); Phase 1 (CAA, assignment engine, Case Pulse, CCHE full runtime)
**Author authority:** Derived from CCHE Authoritative Source Material, April 2026

---

## Document Purpose

This specification governs the full implementation of the Commander SDR Case Management & Workflow engine, including the Cognitive Case Handling Engine (CCHE) introduced in v6.2. It is the canonical engineering reference for:

- All case and sub-case data models, schemas, and field semantics.
- The deterministic scoring system: Case Risk Score (CRS), Momentum Score (MS), and Workload Capacity Score (WCS).
- The Case Action Algorithm (CAA) and Next Best Action (NBA) output contract.
- The assignment engine, workload mix, override governance, and anti-hoarding rules.
- Teams, ranks, specialisms, and the Operational Passport.
- Evidence packs, rollback snapshots, and auto-healing behaviour.
- Acceptance criteria and test cases for all above.

This spec extends but does not replace MTS Section 13. Where this spec adds detail beyond the MTS, this spec governs. Where the MTS makes a governing decision, that decision binds this spec. Conflicts are flagged and resolved inline.

---

## Table of Contents

1. Strategic Proposition
2. Architecture Overview
3. Deterministic Scoring System
   - 3.1 Case Risk Score (CRS)
   - 3.2 Momentum Score (MS)
   - 3.3 Workload Capacity Score (WCS)
4. Data Models and JSON Schemas
   - 4.1 Case (Parent)
   - 4.2 SubCase
   - 4.3 AnalystProfile
   - 4.4 Team
   - 4.5 WorkloadMix
   - 4.6 SOMConfig
5. Case Action Algorithm (CAA)
   - 5.1 Inputs and Derived Metrics
   - 5.2 CAA Pseudocode
   - 5.3 Worked Example — Three-Step
6. Parent Case State Machine
7. SubCase State Machine
8. Assignment Engine
   - 8.1 Assignment Scoring
   - 8.2 Workload Mix Enforcement
   - 8.3 Override Governance (AutoOn / AutoOff / Locked)
   - 8.4 Anti-Hoarding Rules
   - 8.5 Reassignment Rules
9. Case Pulse SOM Command Surface
   - 9.1 Operating Modes
   - 9.2 SOM Controls
   - 9.3 Telemetry Obligations
10. Teams, Ranks, and Specialisms
    - 10.1 Team Model
    - 10.2 Rank Model (L0–L7)
    - 10.3 Grade-to-Rank Mapping
    - 10.4 Specialism Model
    - 10.5 Rank Progression Criteria
11. Operational Passport
12. Evidence Packs and Rollback Snapshots
    - 12.1 Evidence Pack Schema
    - 12.2 Auto-Healing Behaviour
    - 12.3 Rollback Snapshot Requirements
13. Audit and Logging Requirements
14. Migration Notes
15. Acceptance Criteria and Test Cases

---

## 1. Strategic Proposition

Commander SDR reframes case management from ticketing to deterministic, low-cognitive risk reduction. The platform's primary operational objective is to drive the estate toward a safer state by minimising a single normalised metric — the **Case Risk Score (CRS)** — for each parent case.

Every workflow, automation, SLA policy, human role, and assignment decision must align to that objective. The CCHE operationalises this principle through:

- A deterministic **Case Action Algorithm** that ranks available sub-case actions by expected CRS reduction per unit of cognitive cost, surfacing the **Next Best Action** for each analyst without requiring them to reason across the full case.
- An **Assignment Engine** that matches sub-cases to analysts by skill, capacity, rank, and workload mix — ensuring the right analyst receives the right work at the right time.
- A **Workload Capacity Score** that provides a real-time view of analyst capacity, preventing overload and ensuring consistent SLA performance.
- An auditable **Override Governance** model that preserves analyst judgement while maintaining SOM visibility and control.
- A **Case Pulse** command surface that gives the Security Operations Manager (SOM) real-time telemetry, calibration authority, and emergency control.

The net effect: analysts spend cognitive effort on judgement, not on deciding what to do next. The platform decides what to do next. The analyst decides whether to do it.

---

## 2. Architecture Overview

```
Parent Case
  │
  ├── CRS Engine ──────────────────────────── Continuous recomputation
  │     └── Factors: B, E, I, C, A, T        on action completion, phase
  │                                           transition, revalidation
  ├── SubCases[]
  │     ├── SubCase (Push)
  │     ├── SubCase (Manual)
  │     ├── SubCase (Investigation)
  │     └── SubCase (Review)
  │
  ├── Case Action Algorithm (CAA) ─────────── Ranks actionable sub-cases
  │     └── Next Best Action (NBA) output     by adjustedImpact desc
  │
  ├── Assignment Engine ──────────────────── Assigns sub-cases to analysts
  │     ├── WCS per analyst
  │     ├── skillMatch per sub-case × analyst
  │     └── WorkloadMix enforcement
  │
  ├── Override Governor ──────────────────── AutoOn / AutoOff / Locked
  │     └── TTL enforcement + escalation
  │
  └── Evidence Pack ─────────────────────── Pre/post snapshots per action
        └── Rollback snapshot reference
```

**Governing integration points:**

| CCHE Component | Integrates With | MTS Reference |
|---|---|---|
| CRS Engine | Priority model, Phase transition trigger | 13.13, 13.30, 13.33 |
| CAA | Sub-case model, push approval chain | 13.12, 14.x |
| Assignment Engine | Grade model, Operational Passport, workload dashboard | 13.10, 13.17, 13.20, 13.34 |
| Case Pulse | Notification engine, SOM dashboard | 13.9, 13.16 |
| Evidence Pack | Push audit trail, Section 14 evidence model | 13.8, 13.11, 14.2 |

---

## 3. Deterministic Scoring System

All three formulas are governing. They must be implemented exactly as specified. All weights and coefficients are configurable in the SOM Configuration Panel (Section 15 of the SOMConfig spec) with versioning and audit trail. The defaults stated here are binding until a SOM changes them through the configuration panel.

### 3.1 Case Risk Score (CRS)

**Purpose:** The CRS is the single normalised metric representing the current risk magnitude of a parent case. It is the platform's objective function — the number that every action, assignment, and workflow is oriented to reduce.

**Formula (verbatim):**

```
CRS = (w_B·B + w_E·E + w_I·I + w_C·C + w_A·A + w_T·T)
      ─────────────────────────────────────────────────
              (w_B + w_E + w_I + w_C + w_A + w_T)
```

**Factor definitions:**

All factors are normalised to the range [0, 100].

| Factor | Symbol | Definition | Source in Commander SDR |
|---|---|---|---|
| Blast Radius | B | The number of assets and identities that are materially affected if the risk materialises, normalised against the tenant estate size. A finding affecting 500 of 5,000 assets = 100. A finding affecting 10 = 2. | Computed by the blast radius engine from the case's affected entity set. See MTS Section 7.6 and push impact assessment. |
| Exposure Severity | E | The degree to which affected assets are externally exposed. Assets with `attack_surface_position = external` contribute fully; perimeter = 75; internal = 40; restricted = 15. Weighted average across all affected assets. | Computed from the `attack_surface_position` field on each affected asset entity. |
| Impact Score | I | The business-weighted impact of the risk, derived from asset criticality and business context. Critical assets = 100; High = 75; Medium = 40; Low = 15. Weighted average across affected assets. | Computed from `criticality` tags and ownership hierarchy business context. |
| Control Coverage Gap | C | The proportion of required security controls that are absent, degraded, or non-compliant on the affected assets. 100 = no required controls in place. 0 = all required controls deployed and healthy. | Computed by the Coverage Evaluator from the coverage control model (MTS Section 9). |
| Attack Path Likelihood | A | The computed probability that an active exploitation path exists through the affected assets, expressed as a score [0, 100]. Derived from the attack path likelihood engine. | Computed by the Likelihood Scorer (MTS Section 10). Directly mapped from the probability percentage. |
| Time Pressure | T | A composite urgency signal: elapsed SLA percentage (60%), KEV status of associated CVEs (20%), and case age in days relative to SLA deadline (20%). 100 = SLA breached or KEV-listed and past deadline. | Computed by the SLA Monitor from `sla_deadline`, `created_at`, and KEV feed. |

**Default weights (SOM-configurable via SOMConfig panel):**

```
w_B = 3    (Blast Radius — high weight: scope of exposure is primary)
w_E = 3    (Exposure Severity — high weight: surface position is primary)
w_I = 2    (Impact Score — medium weight)
w_C = 2    (Control Coverage Gap — medium weight)
w_A = 1    (Attack Path Likelihood — lower weight: probabilistic input)
w_T = 2    (Time Pressure — medium weight: SLA urgency)
```

**Computation cadence:** CRS is recomputed:
- On sub-case completion (push executed, manual action confirmed, investigation closed).
- On continuous revalidation event (Section 13.31 auto-resolved or partial resolution).
- On phase transition (Phase A → Phase B, Section 13.30).
- On priority recomputation (Section 13.33).
- On manual analyst trigger (analyst can request re-evaluation).

**CRS history:** Every CRS computation result is appended to the case's `crs_history[]` array with: `crs_value`, `computed_at`, `trigger` (enum: action_completed, revalidation, phase_transition, manual, scheduled), `factor_snapshot` (the six factor values at computation time), and `weight_snapshot` (the weights in effect). CRS history is immutable and append-only.

**CRS and priority:** CRS is a continuous risk signal. Priority (P1–P4, MTS Section 13.13) remains the discrete SLA governance signal. Both coexist: Priority governs SLA and queue ordering. CRS governs CAA ranking, phase transition thresholds, and Case Pulse telemetry. CRS reduction is the outcome metric. Priority is the operational urgency label.

---

### 3.2 Momentum Score (MS)

**Purpose:** The MS measures how quickly a case's risk is being reduced. Positive momentum indicates active, effective remediation. Negative or zero momentum indicates stalling, blocked actions, or unproductive investigation loops.

**Formula (verbatim):**

```
MS = α · (ΔCRS_(t-1→t) / Δt)  +  β · (ActionsCompleted_τ / ActionsPlanned_τ)  −  γ · StaleFactor
```

**Parameter definitions:**

| Parameter | Definition |
|---|---|
| `ΔCRS_(t-1→t)` | Change in CRS between the previous computation and the current one. Negative = CRS decreasing = good. The formula uses the raw delta; a negative ΔCRS with α > 0 produces positive MS contribution. |
| `Δt` | Time elapsed in hours between the previous and current CRS computation. |
| `ActionsCompleted_τ` | Number of sub-case actions completed within the rolling momentum window `τ` (default: 72 hours, SOM-configurable). |
| `ActionsPlanned_τ` | Number of sub-case actions that were planned (created) within the same window `τ`. |
| `StaleFactor` | Binary signal: 1 if the case has `stalling_flag: true` (Section 13.32), 0 otherwise. |
| `α` | Velocity coefficient: default 1.0. Governs how much CRS reduction rate contributes to momentum. |
| `β` | Completion ratio coefficient: default 2.0. Governs how much action completion rate contributes. Higher than α to reward action completion over passive CRS decay. |
| `γ` | Stale penalty coefficient: default 1.5. Governs the penalty applied when stalling is detected. |

**Default coefficients (SOM-configurable):**
```
α = 1.0
β = 2.0
γ = 1.5
```

**MS interpretation:**

| MS Range | Interpretation | Case Pulse Signal |
|---|---|---|
| MS > 2.0 | Strong positive momentum — effective active remediation | Green |
| 0 < MS ≤ 2.0 | Positive momentum — case progressing | Amber-positive |
| MS = 0 | No momentum — no recent actions, no CRS change | Amber |
| MS < 0 | Negative momentum — stalling, blocked, or regression | Red |

**Computation cadence:** MS is computed on every CRS recomputation cycle and on stalling detection events. MS is stored in the parent case entity (`momentumScore` field) and in the CRS history record as an associated field.

---

### 3.3 Workload Capacity Score (WCS)

**Purpose:** The WCS is a per-analyst capacity metric used by the Assignment Engine to determine how much additional work an analyst can absorb. A WCS of 100 indicates a fully available analyst. A WCS of 0 indicates an analyst at maximum capacity.

**Formula (verbatim):**

```
WCS_u = max(0, 100 − (λ₁ · Q_u + λ₂ · H_u + λ₃ · F_u))
```

**Parameter definitions:**

| Parameter | Definition |
|---|---|
| `Q_u` | Queue load: the total number of open sub-cases currently assigned to analyst `u`, normalised against their `max_concurrent_subcases` setting. A score of [0, 100]. |
| `H_u` | High-priority load: the number of P1/P2 sub-cases assigned to analyst `u`, normalised against `maxActiveHighPriorityPerAnalyst` (default: 3). A score of [0, 100]. Caps at 100 when the analyst holds the maximum permitted high-priority sub-cases. |
| `F_u` | Focus factor: the inverse of analyst availability — accounts for out-of-office status, time outside working hours, and active focus timer engagement. [0, 100]. 0 = fully available; 100 = completely unavailable. |
| `λ₁` | Queue load coefficient: default 0.6. Governs how heavily general queue load reduces capacity. |
| `λ₂` | High-priority load coefficient: default 0.3. Governs how heavily high-priority burden reduces capacity. |
| `λ₃` | Focus factor coefficient: default 0.1. Governs how heavily availability constraints reduce capacity. |

**Default coefficients (SOM-configurable):**
```
λ₁ = 0.6
λ₂ = 0.3
λ₃ = 0.1
```

**WCS usage:** The Assignment Engine queries the current WCS for every candidate analyst during scoring. WCS below a configurable threshold (default: 20) disqualifies an analyst from new assignment in the current cycle. WCS is recomputed on every assignment cycle, every sub-case status change, and on analyst availability changes.

---

## 4. Data Models and JSON Schemas

All schemas below are minimal stubs. The full field set is defined in the Commander SDR Data Model Spec (#5) which governs the canonical Drizzle ORM schema. These stubs define the CCHE-critical fields and the structure required for the CAA and assignment engine.

### 4.1 Case (Parent) — JSON Schema

```json
{
  "title": "Case",
  "type": "object",
  "properties": {
    "caseId":           { "type": "string" },
    "title":            { "type": "string" },
    "description":      { "type": "string" },
    "crs":              { "type": "number", "minimum": 0, "maximum": 100,
                          "description": "Current Case Risk Score. Recomputed on action completion, revalidation, and phase transition." },
    "crsHistory":       { "type": "array", "items": { "$ref": "#/definitions/CRSHistoryEntry" },
                          "description": "Immutable append-only log of every CRS computation." },
    "momentumScore":    { "type": "number",
                          "description": "Current Momentum Score. Positive = case progressing. Negative = stalling." },
    "status":           { "type": "string",
                          "enum": ["New","Triaged","Investigating","ActionProposed","PendingApproval",
                                   "Approved","Executing","PendingValidation","Validated",
                                   "Closing","Closed","OnHold","Escalated","Reopened","AutoResolved"],
                          "description": "Aligned to MTS Section 13.3 lifecycle state machine." },
    "casePhase":        { "type": "string",
                          "enum": ["active_risk_reduction", "residual_confirmation"],
                          "description": "Phase A (active remediation) or Phase B (residual confirmation). See MTS Section 13.30." },
    "owner":            { "type": "string", "description": "Analyst user ID currently responsible for the case." },
    "teamId":           { "type": "string", "description": "Team assigned to this case, if any." },
    "priority":         { "type": "string", "enum": ["P1","P2","P3","P4"],
                          "description": "Computed priority per MTS Section 13.13. Governs SLA and queue ordering." },
    "severity":         { "type": "string", "enum": ["Critical","High","Medium","Low"] },
    "caseType":         { "type": "string",
                          "description": "One of six case type categories per MTS Section 13.2." },
    "createdAt":        { "type": "string", "format": "date-time" },
    "updatedAt":        { "type": "string", "format": "date-time" },
    "slaDeadline":      { "type": "string", "format": "date-time",
                          "description": "Computed SLA deadline per MTS Section 13.5." },
    "subCases":         { "type": "array", "items": { "$ref": "#/definitions/SubCase" } },
    "rationaleTimeline":{ "type": "array", "items": { "$ref": "#/definitions/RationaleEntry" },
                          "description": "Ordered log of CAA recommendations and analyst override rationales." },
    "stallingFlag":     { "type": "boolean", "description": "True when no analyst activity exceeds stalling threshold. MTS Section 13.32." },
    "investigatingSince": { "type": "string", "format": "date-time" },
    "lastAnalystActivityAt": { "type": "string", "format": "date-time" },
    "retainOnRiskReduction": { "type": "boolean",
                               "description": "Prevents auto-reroute on Phase A→B transition when true. MTS Section 13.30." },
    "autoAssignmentState": { "type": "string", "enum": ["AutoOn","AutoOff","Locked"],
                             "description": "Governs CCHE auto-assignment behaviour for this case." }
  },
  "required": ["caseId","title","crs","status","casePhase","priority","createdAt"],
  "definitions": {
    "CRSHistoryEntry": {
      "type": "object",
      "properties": {
        "crsValue":       { "type": "number" },
        "momentumScore":  { "type": "number" },
        "computedAt":     { "type": "string", "format": "date-time" },
        "trigger":        { "type": "string", "enum": ["action_completed","revalidation","phase_transition","manual","scheduled"] },
        "factorSnapshot": { "type": "object",
                            "properties": { "B": {}, "E": {}, "I": {}, "C": {}, "A": {}, "T": {} },
                            "description": "The six CRS factor values at computation time." },
        "weightSnapshot": { "type": "object",
                            "properties": { "w_B": {}, "w_E": {}, "w_I": {}, "w_C": {}, "w_A": {}, "w_T": {} },
                            "description": "The weights in effect at computation time." }
      },
      "required": ["crsValue","computedAt","trigger"]
    },
    "RationaleEntry": {
      "type": "object",
      "properties": {
        "entryId":     { "type": "string" },
        "entryType":   { "type": "string", "enum": ["caa_recommendation","analyst_override","som_override","auto_reassignment"] },
        "actor":       { "type": "string" },
        "timestamp":   { "type": "string", "format": "date-time" },
        "rationale":   { "type": "string", "minLength": 50, "maxLength": 300 },
        "ttlHours":    { "type": "integer", "description": "For overrides: how long this override is valid." },
        "expiresAt":   { "type": "string", "format": "date-time" }
      }
    }
  }
}
```

### 4.2 SubCase — JSON Schema

```json
{
  "title": "SubCase",
  "type": "object",
  "properties": {
    "subCaseId":              { "type": "string" },
    "parentCaseId":           { "type": "string" },
    "type":                   { "type": "string", "enum": ["Push","Manual","Investigation","Review"],
                                "description": "Sub-case type. Determines typeMultiplier in CAA and default SLA." },
    "impactWeight":           { "type": "number", "minimum": 0, "maximum": 10,
                                "description": "Expected CRS reduction contribution if this sub-case is completed. Analyst or Commander-assessed." },
    "estimatedEffortMinutes": { "type": "integer", "minimum": 1,
                                "description": "Estimated time to complete this sub-case. Used in AIS computation." },
    "confidence":             { "type": "number", "minimum": 0, "maximum": 1,
                                "description": "Confidence that completing this sub-case will deliver the impactWeight CRS reduction." },
    "frictionScore":          { "type": "number", "minimum": 0, "maximum": 1,
                                "description": "Composite friction: context switches, approvals required, stakeholder coordination. Normalised to [0,1]." },
    "dependencies":           { "type": "array", "items": { "type": "string" },
                                "description": "List of subCaseIds that must be completed before this sub-case is actionable." },
    "currentCRSContribution": { "type": "number",
                                "description": "Estimated CRS delta if this sub-case executes. Negative = CRS reduction. Recomputed by CAA." },
    "assignedTo":             { "type": "string", "description": "Analyst user ID assigned to this sub-case." },
    "autoAssignmentState":    { "type": "string", "enum": ["AutoOn","AutoOff","Locked"],
                                "description": "AutoOn: CCHE may auto-assign. AutoOff: analyst override (TTL-bounded). Locked: SOM lock." },
    "overrideRationale":      { "type": "string", "minLength": 50, "maxLength": 300,
                                "description": "Required when autoAssignmentState transitions to AutoOff. Analyst explains override." },
    "overrideTTLHours":       { "type": "integer", "description": "Hours until AutoOff expires and returns to AutoOn. Default: 72." },
    "overrideExpiresAt":      { "type": "string", "format": "date-time" },
    "status":                 { "type": "string", "enum": ["Open","InProgress","Blocked","Done"] },
    "adjustedImpact":         { "type": "number",
                                "description": "Last computed CAA adjusted impact score. Used for NBA ranking." },
    "createdAt":              { "type": "string", "format": "date-time" },
    "updatedAt":              { "type": "string", "format": "date-time" },
    "completedAt":            { "type": "string", "format": "date-time" },
    "evidencePack":           { "$ref": "#/definitions/EvidencePack" }
  },
  "required": ["subCaseId","parentCaseId","type","impactWeight","status","createdAt"]
}
```

### 4.3 AnalystProfile

```json
{
  "title": "AnalystProfile",
  "type": "object",
  "properties": {
    "userId":              { "type": "string" },
    "platformIdentityId":  { "type": "string", "description": "Platform-level identity. Portable across tenants. MTS Section 13.34." },
    "gradeLevel":          { "type": "string", "enum": ["L0","L1","L2","L3"],
                             "description": "RBAC grade band. Governs approval authority. MTS Section 13.20." },
    "rankLevel":           { "type": "string", "enum": ["L0","L1","L2","L3","L4","L5","L6","L7"],
                             "description": "CCHE rank. Finer-grained progression within grade band. See Section 10.2." },
    "specialisms":         { "type": "array", "items": { "$ref": "#/definitions/Specialism" } },
    "workloadMix":         { "$ref": "#/definitions/WorkloadMix" },
    "wcsHistory":          { "type": "array", "items": { "$ref": "#/definitions/WCSHistoryEntry" } },
    "currentWCS":          { "type": "number", "minimum": 0, "maximum": 100 },
    "maxConcurrentSubcases": { "type": "integer", "default": 20 },
    "maxActiveHighPriority": { "type": "integer", "default": 3,
                               "description": "Maximum P1/P2 sub-cases. From SOMConfig.maxActiveHighPriorityPerAnalyst." },
    "activeSubcaseCount":  { "type": "integer" },
    "activeHighPriorityCount": { "type": "integer" },
    "operationalPassportId": { "type": "string" },
    "recentMomentum":      { "type": "number",
                             "description": "Average MS contribution across cases worked in the momentum window. Used in assignment scoring." }
  }
}
```

### 4.4 Team

```json
{
  "title": "Team",
  "type": "object",
  "properties": {
    "teamId":         { "type": "string" },
    "name":           { "type": "string" },
    "leaderId":       { "type": "string", "description": "Team leader user ID." },
    "deputyLeaderId": { "type": "string" },
    "memberIds":      { "type": "array", "items": { "type": "string" } },
    "specialisms":    { "type": "array", "items": { "type": "string" },
                        "description": "Aggregate specialism domains covered by the team." },
    "domainScope":    { "type": "array", "items": { "type": "string" },
                        "description": "Case type domains this team handles." },
    "assignmentTypes": { "type": "array",
                         "items": { "type": "string",
                                    "enum": ["permanent","temporary_attachment","cross_team_contributor","swarm_participant"] } },
    "metrics": {
      "type": "object",
      "properties": {
        "velocityScore":    { "type": "number", "description": "Average CRS reduction rate across team cases." },
        "slaAdherence":     { "type": "number", "description": "Percentage of cases closed within SLA." },
        "avgTimeToClose":   { "type": "number", "description": "Average hours from TRIAGED to CLOSED." },
        "openCaseCount":    { "type": "integer" },
        "momentumAvg":      { "type": "number" }
      }
    },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "required": ["teamId","name","leaderId"]
}
```

### 4.5 WorkloadMix

```json
{
  "title": "WorkloadMix",
  "type": "object",
  "description": "Target ratios for sub-case types assigned to an analyst over a rolling window. Sum must equal 1.0.",
  "properties": {
    "workloadMixId":    { "type": "string" },
    "analystId":        { "type": "string" },
    "rollingWindowDays": { "type": "integer", "default": 14 },
    "targetRatios": {
      "type": "object",
      "properties": {
        "Push":          { "type": "number", "minimum": 0, "maximum": 1 },
        "Manual":        { "type": "number", "minimum": 0, "maximum": 1 },
        "Investigation": { "type": "number", "minimum": 0, "maximum": 1 },
        "Review":        { "type": "number", "minimum": 0, "maximum": 1 }
      },
      "description": "Must sum to 1.0. Default mix is SOM-configurable; starting default: Push=0.30, Manual=0.30, Investigation=0.25, Review=0.15."
    },
    "actualRatios": {
      "type": "object",
      "description": "Computed from actual sub-cases worked in the rolling window.",
      "properties": {
        "Push":          { "type": "number" },
        "Manual":        { "type": "number" },
        "Investigation": { "type": "number" },
        "Review":        { "type": "number" }
      }
    },
    "deviationThreshold": { "type": "number", "default": 0.15,
                            "description": "If any actual ratio deviates from target by more than this, Case Pulse alerts SOM." },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "required": ["analystId","targetRatios"]
}
```

### 4.6 SOMConfig

```json
{
  "title": "SOMConfig",
  "type": "object",
  "description": "All configurable parameters for the CCHE. Every change is versioned and auditable. Defaults are binding until changed by SOM.",
  "properties": {
    "configId":    { "type": "string" },
    "tenantId":    { "type": "string" },
    "version":     { "type": "integer", "description": "Monotonically increasing. Incremented on every change." },
    "effectiveAt": { "type": "string", "format": "date-time" },
    "changedBy":   { "type": "string", "description": "SOM user ID who made the change." },
    "changeReason":{ "type": "string", "description": "Mandatory rationale for configuration change." },

    "crsWeights": {
      "type": "object",
      "properties": {
        "w_B": { "type": "number", "default": 3 },
        "w_E": { "type": "number", "default": 3 },
        "w_I": { "type": "number", "default": 2 },
        "w_C": { "type": "number", "default": 2 },
        "w_A": { "type": "number", "default": 1 },
        "w_T": { "type": "number", "default": 2 }
      }
    },

    "momentumCoefficients": {
      "type": "object",
      "properties": {
        "alpha": { "type": "number", "default": 1.0, "description": "Velocity coefficient." },
        "beta":  { "type": "number", "default": 2.0, "description": "Completion ratio coefficient." },
        "gamma": { "type": "number", "default": 1.5, "description": "Stale penalty coefficient." },
        "momentumWindowHours": { "type": "integer", "default": 72, "description": "Rolling window for action completion ratio (τ)." }
      }
    },

    "wcsCoefficients": {
      "type": "object",
      "properties": {
        "lambda1": { "type": "number", "default": 0.6, "description": "Queue load coefficient." },
        "lambda2": { "type": "number", "default": 0.3, "description": "High-priority load coefficient." },
        "lambda3": { "type": "number", "default": 0.1, "description": "Focus factor coefficient." },
        "wcsDisqualifyThreshold": { "type": "number", "default": 20,
                                    "description": "WCS below this value: analyst excluded from new assignment." }
      }
    },

    "assignmentWeights": {
      "type": "object",
      "properties": {
        "skillMatch":      { "type": "number", "default": 0.40 },
        "wcs":             { "type": "number", "default": 0.30 },
        "rankScore":       { "type": "number", "default": 0.15 },
        "teamAffinity":    { "type": "number", "default": 0.10 },
        "recentMomentum":  { "type": "number", "default": 0.05 }
      },
      "description": "Assignment scoring weights. Must sum to 1.0."
    },

    "caaTypeMultipliers": {
      "type": "object",
      "properties": {
        "Push":          { "type": "number", "default": 1.5 },
        "Manual":        { "type": "number", "default": 1.0 },
        "Investigation": { "type": "number", "default": 0.8 },
        "Review":        { "type": "number", "default": 0.5 }
      }
    },

    "overridePolicy": {
      "type": "object",
      "properties": {
        "defaultTTLHours":     { "type": "integer", "default": 72,
                                 "description": "Default AutoOff TTL in hours." },
        "stallingAlertFactor": { "type": "number", "default": 0.5,
                                 "description": "If overridden sub-case has MS below zero for TTL × this factor, Case Pulse alerts SOM." },
        "inactivityEscalationDays": { "type": "integer", "default": 7,
                                      "description": "Days of assignee inactivity before automatic SOM escalation." }
      }
    },

    "stallingThresholds": {
      "type": "object",
      "properties": {
        "P1StallHours": { "type": "number", "default": 1 },
        "P2StallHours": { "type": "number", "default": 4 },
        "P3StallHours": { "type": "number", "default": 8 },
        "P4StallHours": { "type": "number", "default": 24 },
        "autoParkMultiplier": { "type": "number", "default": 2.0,
                                "description": "Auto-park fires at stallingThreshold × this multiplier." }
      }
    },

    "workloadMixDefaults": {
      "type": "object",
      "properties": {
        "Push":          { "type": "number", "default": 0.30 },
        "Manual":        { "type": "number", "default": 0.30 },
        "Investigation": { "type": "number", "default": 0.25 },
        "Review":        { "type": "number", "default": 0.15 }
      },
      "description": "Default workload mix applied to new analysts until individually configured."
    },

    "maxActiveHighPriorityPerAnalyst": { "type": "integer", "default": 3 },

    "phaseTransitionThresholds": {
      "type": "object",
      "properties": {
        "actionsResolvedPct": { "type": "number", "default": 0.60,
                                "description": "Phase A→B transition when this proportion of weighted actions are resolved." },
        "priorityDropBands":  { "type": "integer", "default": 2,
                                "description": "Phase A→B also triggered when priority drops by this many bands." }
      }
    },

    "operatingMode": {
      "type": "string",
      "enum": ["MDR","Manual","Hybrid"],
      "default": "MDR",
      "description": "MDR: CCHE auto-assigns. Manual: SOM assigns all. Hybrid: CCHE suggests, SOM approves."
    },

    "revalidationCadence": {
      "type": "object",
      "properties": {
        "P1P2CadenceMinutes": { "type": "integer", "default": 0,
                                "description": "0 = every ingestion cycle." },
        "P3P4CadenceHours":   { "type": "integer", "default": 24 }
      }
    }
  },
  "required": ["tenantId","version","effectiveAt","changedBy","changeReason"]
}
```

---

## 5. Case Action Algorithm (CAA)

### 5.1 Inputs and Derived Metrics

**Goal:** Produce a deterministic ranking of actionable sub-cases that maximises expected CRS reduction per unit of cognitive cost. The ranked output is the **Next Best Action (NBA)** list, presented to the assigned analyst on the case detail view.

**Inputs per sub-case:**

| Field | Type | Description |
|---|---|---|
| `type` | enum | Push, Manual, Investigation, Review |
| `impactWeight` | float [0–10] | Expected CRS contribution if completed |
| `estimatedEffortMinutes` | integer ≥ 1 | Estimated time to complete |
| `confidence` | float [0–1] | Confidence that impactWeight will be achieved |
| `dependencies[]` | string[] | SubCase IDs that must be Done before this is actionable |
| `frictionScore` | float [0–1] | Composite friction: context switches, approvals, coordination overhead |
| `currentCRSContribution` | float | Estimated CRS delta if executed (negative = CRS decreases) |

**Derived metrics:**

**Action Impact Score (AIS):**
```
AIS = (impactWeight × confidence) / max(estimatedEffortMinutes, 1)
```
AIS represents raw risk-reduction efficiency: expected impact per minute of effort. It is normalised across all candidate sub-cases of the same parent case after initial computation.

**Adjusted Impact:**
```
adjustedImpact = AIS_normalised × typeMultiplier[type] × (1 − frictionPenalty)
```

Where:
- `AIS_normalised` = AIS of this sub-case / max(AIS across all actionable sub-cases). Range: [0, 1].
- `typeMultiplier[type]` = per-type preference multiplier (Push preferred over Manual, Investigation, Review):

```
typeMultiplier defaults (SOM-configurable via SOMConfig.caaTypeMultipliers):
  Push:          1.5
  Manual:        1.0
  Investigation: 0.8
  Review:        0.5
```

- `frictionPenalty` = normalise(`frictionScore`) to [0, 1]. The frictionScore accounts for: number of approvals required (each adds 0.05), number of distinct systems touched (each adds 0.03), number of stakeholder contacts required (each adds 0.04), and whether a context switch from the analyst's current domain is needed (adds 0.10). Cap at 0.50 — no sub-case should be penalised by more than 50% for friction alone.

### 5.2 CAA Pseudocode

```
function computeCAA(parentCase):

  candidateSubCases = []
  blockedSubCases = []

  // Step 1: Dependency resolution
  completedIds = { sc.subCaseId for sc in parentCase.subCases if sc.status == "Done" }

  for each subCase in parentCase.subCases where subCase.status in ["Open", "InProgress"]:
    if all(dep in completedIds for dep in subCase.dependencies):
      candidateSubCases.append(subCase)
    else:
      blockedSubCases.append(subCase)
      subCase.status = "Blocked"   // Mark as blocked; do not include in ranking

  // Step 2: Compute AIS for each candidate
  for each subCase in candidateSubCases:
    subCase.ais = (subCase.impactWeight × subCase.confidence) / max(subCase.estimatedEffortMinutes, 1)

  maxAIS = max(sc.ais for sc in candidateSubCases)  // Normalisation denominator

  // Step 3: Compute adjustedImpact for each candidate
  for each subCase in candidateSubCases:
    aisNormalised = subCase.ais / max(maxAIS, 0.001)  // Guard against division by zero
    typeMultiplier = SOMConfig.caaTypeMultipliers[subCase.type]
    frictionPenalty = min(normaliseFriction(subCase.frictionScore), 0.50)
    subCase.adjustedImpact = aisNormalised × typeMultiplier × (1 - frictionPenalty)

  // Step 4: Sort by adjustedImpact descending
  rankedActions = sort(candidateSubCases, by=adjustedImpact, direction=descending)

  // Step 5: Apply preference rule — if Push adjustedImpact is within 10% of top non-Push action, elevate Push to top
  topAdjustedImpact = rankedActions[0].adjustedImpact
  for each subCase in rankedActions[1:]:
    if subCase.type == "Push" and subCase.adjustedImpact >= topAdjustedImpact × 0.90:
      move subCase to position 0 in rankedActions
      break

  // Step 6: Build NBA output with explanation per action
  nbaOutput = []
  for each subCase in rankedActions:
    nbaOutput.append({
      "subCaseId":       subCase.subCaseId,
      "rank":            index + 1,
      "type":            subCase.type,
      "title":           subCase.title,
      "adjustedImpact":  subCase.adjustedImpact,
      "explanation": {
        "ais":             subCase.ais,
        "aisNormalised":   aisNormalised,
        "typeMultiplier":  typeMultiplier,
        "frictionPenalty": frictionPenalty,
        "expectedCRSDelta": subCase.currentCRSContribution,
        "rationale":       generateNaturalLanguageRationale(subCase)
      }
    })

  // Step 7: Append blocked actions (informational only)
  for each subCase in blockedSubCases:
    nbaOutput.append({
      "subCaseId": subCase.subCaseId,
      "rank":      null,
      "status":    "Blocked",
      "blockedBy": [dep for dep in subCase.dependencies if dep not in completedIds],
      "explanation": { "rationale": "Blocked: requires completion of " + blockedByList }
    })

  // Persist adjustedImpact on each subCase entity
  // Trigger: recompute after every action completion event

  return nbaOutput
```

**Behavioural rules:**

1. **Determinism:** Given identical inputs (same sub-case field values, same SOMConfig), the CAA must produce identical output. No randomisation. No non-deterministic tie-breaking (if adjustedImpact ties exactly, resolve by `subCaseId` lexicographic order as a stable tiebreaker).
2. **Explainability:** Every NBA entry includes the computed `adjustedImpact` and all contributing factors. The natural-language rationale is generated from the factor values, not from a language model.
3. **Push preference:** If a Push sub-case is within 10% of the top-ranked action by adjustedImpact, it is elevated to the top position. This implements the platform preference for automated, reversible remediation.
4. **Recomputation:** CAA is recomputed after every sub-case status change, every CRS recomputation, and every dependency resolution event.
5. **Override recording:** If an analyst chooses an action other than the #1 NBA recommendation, the choice is logged in the case's `rationaleTimeline[]` as an analyst override entry (not an AutoOff assignment override — this is a separate, lighter action-choice log).

---

### 5.3 Worked Example — Three-Step

**Scenario:** Parent case SDR-9001 — *Critical: Privileged cloud admin account with MFA disabled, excess group memberships, and overly permissive API key.*

- Case type: Identity Risk Escalation
- Current CRS: 82/100
- Priority: P1
- Three sub-cases have been created.

---

**Sub-case inputs:**

| Field | SC-9001-A (Push) | SC-9001-B (Manual) | SC-9001-C (Investigation) |
|---|---|---|---|
| type | Push | Manual | Investigation |
| impactWeight | 9 | 7 | 6 |
| estimatedEffortMinutes | 10 | 90 | 45 |
| confidence | 0.95 | 0.80 | 0.85 |
| frictionScore | 0.10 | 0.30 | 0.15 |
| dependencies | none | [SC-9001-C] | none |
| description | Enforce MFA via Entra ID push | Remove 12 group memberships (manual, requires architect confirmation) | Review API key permissions and determine rotation scope |

---

**Step 1 — Dependency resolution and AIS computation:**

SC-9001-A: dependencies = none → **actionable**
SC-9001-B: depends on SC-9001-C (not yet Done) → **blocked**
SC-9001-C: dependencies = none → **actionable**

Candidate sub-cases: SC-9001-A, SC-9001-C.

```
AIS(SC-9001-A) = (9 × 0.95) / 10 = 8.55 / 10 = 0.855
AIS(SC-9001-C) = (6 × 0.85) / 45 = 5.10 / 45 = 0.113

maxAIS = 0.855
```

---

**Step 2 — adjustedImpact computation:**

```
SC-9001-A:
  aisNormalised  = 0.855 / 0.855 = 1.000
  typeMultiplier = 1.5  (Push)
  frictionPenalty = normalise(0.10) = 0.10
  adjustedImpact  = 1.000 × 1.5 × (1 − 0.10) = 1.000 × 1.5 × 0.90 = 1.350

SC-9001-C:
  aisNormalised  = 0.113 / 0.855 = 0.132
  typeMultiplier = 0.8  (Investigation)
  frictionPenalty = normalise(0.15) = 0.15
  adjustedImpact  = 0.132 × 0.8 × (1 − 0.15) = 0.132 × 0.8 × 0.85 = 0.090
```

---

**Step 3 — Rank and present Next Best Actions:**

```
NBA Rank 1: SC-9001-A [Push]
  adjustedImpact: 1.350
  Rationale: "Highest-impact action available. MFA enforcement via Entra ID push is automated, 
  reversible (rollback payload generated pre-execution), and addresses the primary identity 
  exposure. Expected CRS delta: −28 points (from 82 to ~54). Push type multiplier applied. 
  Minimal friction: single approval required, connector healthy."

NBA Rank 2: SC-9001-C [Investigation]
  adjustedImpact: 0.090
  Rationale: "Unblocks SC-9001-B (group membership cleanup). Complete this investigation 
  to enable the manual remediation workstream. Expected to identify scope for API key rotation, 
  which may generate a fourth sub-case. Moderate confidence."

Blocked: SC-9001-B [Manual]
  Rationale: "Blocked: requires completion of SC-9001-C. Will surface after investigation 
  is complete and dependency is satisfied."
```

**Post-execution outcome:**

Analyst accepts NBA Rank 1 and executes the push. SC-9001-A status → Done. CRS recomputed: CRS drops from 82 → 54 (ΔCRS = −28, matching expected contribution). Phase transition check: 0 of 3 weighted actions fully resolved at 60% threshold — phase stays in Phase A. CAA recomputes: SC-9001-C is now the sole actionable sub-case and becomes the new #1 NBA recommendation.

---

## 6. Parent Case State Machine

The parent case state machine is defined in MTS Section 13.3 and governs all parent cases. The CCHE extends it with the following CRS-driven transitions and guards. No existing states or transitions are removed or modified.

**CCHE-added transition conditions:**

| Transition | CCHE Condition Added |
|---|---|
| INVESTIGATING → ACTION_PROPOSED | CAA must have computed at least one actionable sub-case with adjustedImpact > 0 before the platform suggests transitioning. Analyst may override. |
| any → AUTO-RESOLVED | Triggered when CRS drops to 0 via continuous revalidation (all factors resolved). Existing MTS trigger: all source conditions no longer detected. |
| active_risk_reduction → residual_confirmation (Phase A → B) | CRS-based: actionsResolvedPct ≥ SOMConfig.phaseTransitionThresholds.actionsResolvedPct (default 60%) OR priority drops ≥ 2 bands from creation priority. |
| CLOSING → CLOSED | Requires: CRS < 10 OR all sub-cases status Done, AND evidence pack complete for each sub-case, AND architecture_review_required resolved (per MTS 13.7). |

**State machine diagram (additions to MTS 13.3):**

```
                    [CCHE: CAA computed ≥1 actionable]
INVESTIGATING ─────────────────────────────────────────► ACTION_PROPOSED
      │
      │  [CRS=0 via revalidation — all conditions resolved]
      └──────────────────────────────────────────────────► AUTO-RESOLVED
                                                                │
                                                   [Human confirms] │
                                                                ▼
                                                             CLOSED

Phase tracking (orthogonal to lifecycle states):
  case_phase: active_risk_reduction ──────[60% actions resolved OR -2 priority bands]──► residual_confirmation
```

---

## 7. SubCase State Machine

Sub-cases have a simpler four-state model with CCHE-specific transitions:

```
States: Open → InProgress → Done
                          ↗ Blocked (dependency not satisfied — not a terminal state)
                          
Open:       Sub-case created. Not yet assigned or started.
InProgress: Assigned to analyst. CAA is tracking it. WCS debited for assignee.
Blocked:    One or more dependencies not in Done state. CAA excludes from NBA ranking.
            Automatically returns to Open when dependency is satisfied.
Done:       Sub-case completed. Evidence pack written. CRS recomputation triggered.
            CAA recomputes NBA for remaining sub-cases.
```

**SubCase state transition rules:**

| Transition | Trigger | CAA Response |
|---|---|---|
| Open → InProgress | Assignment (auto or manual). | No immediate CAA change. WCS decremented for assignee. |
| Open/InProgress → Blocked | Dependency sub-case returns to Open/InProgress from Done (e.g. rollback). | CAA excludes from ranking. Surfaces dependency resolution action if available. |
| Blocked → Open | All dependency sub-cases reach Done. | CAA includes in next recomputation. |
| InProgress → Done | Completion confirmed (push executed + validated, or manual completion confirmed by analyst). | **CRS recomputed. CAA recomputed. Evidence pack finalised. NBA updated.** |
| InProgress → Open | Auto-park rule fires (stalling detected, TTL expired). | CAA re-evaluates assignment. |

---

## 8. Assignment Engine

The CCHE Assignment Engine extends the existing case assignment model (MTS Sections 13.10 and 13.17). The extension does not replace existing assignment logic — it adds the CCHE scoring layer, override governance, workload mix enforcement, and anti-hoarding rules.

### 8.1 Assignment Scoring

When a sub-case enters Open or returns to Open state, the Assignment Engine evaluates all eligible analysts and computes an assignment score per analyst.

**Assignment score formula:**

```
assignmentScore_u = (w_skill × skillMatch_u)
                  + (w_wcs   × WCS_u_normalised)
                  + (w_rank  × rankScore_u)
                  + (w_team  × teamAffinity_u)
                  + (w_mom   × recentMomentum_u)
```

**Default weights (SOM-configurable via SOMConfig.assignmentWeights — must sum to 1.0):**
```
w_skill   = 0.40  (Skill match is primary driver)
w_wcs     = 0.30  (Capacity is critical)
w_rank    = 0.15  (Rank seniority for complex sub-cases)
w_team    = 0.10  (Team continuity preference)
w_mom     = 0.05  (Recent performance signal)
```

**Factor definitions:**

| Factor | Range | Definition |
|---|---|---|
| `skillMatch_u` | [0, 1] | Degree of match between the sub-case type/domain and the analyst's specialism tiers. Perfect match = 1.0. No relevant specialism = 0.1 (minimum, not 0 — every analyst can attempt every sub-case type). Partial match (Practitioner vs Expert required) = 0.5–0.7. |
| `WCS_u_normalised` | [0, 1] | `WCS_u / 100`. Analysts with WCS below `SOMConfig.wcsCoefficients.wcsDisqualifyThreshold` (default 20) are excluded from scoring. |
| `rankScore_u` | [0, 1] | Normalised rank. Sub-cases with impactWeight ≥ 7 require rank L4+. Sub-cases with type Push on critical assets require rank L4+. Lower-complexity sub-cases do not apply rank minimum — any rank is eligible. |
| `teamAffinity_u` | [0, 1] | 1.0 if analyst is on the team assigned to the parent case. 0.5 if analyst has worked a sub-case on this parent case before. 0.0 otherwise. |
| `recentMomentum_u` | [0, 1] | Normalised `AnalystProfile.recentMomentum` across all eligible analysts. Rewards analysts who have been contributing positive momentum to their cases recently. |

**Analyst eligibility filters (applied before scoring):**

1. Analyst RBAC grade (L0–L3) must permit the sub-case type and priority. (MTS Section 13.20 rules apply.)
2. WCS must be ≥ `wcsDisqualifyThreshold`.
3. Analyst must not already hold `maxActiveHighPriorityPerAnalyst` P1/P2 sub-cases (if this sub-case is P1/P2).
4. Analyst must be within working hours and not out of office (MTS Section 13.17 availability rules apply).
5. `autoAssignmentState` of the parent case must be AutoOn or Hybrid (see Section 8.3).

The highest-scoring eligible analyst is selected. The assignment decision, score breakdown, and all factor values are recorded in the sub-case entity and are visible to the SOM via Case Pulse.

### 8.2 Workload Mix Enforcement

Over each analyst's rolling window (default: 14 days), the Assignment Engine tracks the actual sub-case type distribution (Push, Manual, Investigation, Review) against the analyst's `WorkloadMix.targetRatios`.

Enforcement behaviour:

- **Soft enforcement:** If an analyst's actual ratio for any type deviates from target by more than `WorkloadMix.deviationThreshold` (default: ±15%), the Assignment Engine applies a 20% discount to `skillMatch` for the over-represented type (not a block — other factors may still result in assignment).
- **SOM alert:** If deviation exceeds the threshold for more than 3 consecutive days, Case Pulse surfaces an alert: "Analyst [Name]'s workload mix has deviated from target for [N] days. Review assignment rules."
- **SOM override:** The SOM may adjust an individual analyst's `WorkloadMix.targetRatios` or override the enforced ratios for a specific period (e.g. during surge). Override is logged with rationale.

### 8.3 Override Governance (AutoOn / AutoOff / Locked)

Every sub-case has an `autoAssignmentState` field governing whether the CCHE may auto-assign it. Every parent case also has an `autoAssignmentState` that governs all sub-cases unless individually overridden.

**States:**

| State | Who Sets It | Effect |
|---|---|---|
| `AutoOn` | Default (system) | CCHE may auto-assign this sub-case to the highest-scoring eligible analyst. |
| `AutoOff` | Analyst | Analyst soft override. CCHE will not auto-assign. Analyst retains or selects assignee manually. TTL-bounded: default 72 hours, then revert to AutoOn. |
| `Locked` | SOM only | SOM authoritative lock. CCHE cannot auto-assign regardless of TTL. Only SOM can clear Locked state. |

**Override Lifecycle Rules (verbatim from authoritative source):**

1. Analyst override requires a short rationale between 50 and 300 characters.
2. All overrides are logged with: actor (user ID), timestamp, TTL in hours, TTL expiry datetime, and rationale text.
3. If an AutoOff sub-case has Momentum Score below zero for TTL × stallingAlertFactor (default: 72 × 0.5 = 36 hours), Case Pulse alerts the SOM: "Override sub-case [ID] is stalling. Analyst [name] set AutoOff [N] hours ago. Momentum: negative. Consider reassignment."
4. If the assignee has had no activity on the sub-case for more than `SOMConfig.overridePolicy.inactivityEscalationDays` days (default: 7), the SOM receives an automatic escalation notification and the Locked state may be cleared by SOM action.
5. When AutoOff TTL expires, `autoAssignmentState` reverts to `AutoOn` automatically. The analyst is notified. The reversion is logged.
6. All override and lock actions are tamper-evident (recorded in the case audit trail as immutable events).
7. All override and reassignment actions are visible to the SOM via Case Pulse.

**API contract for override state transition:**

```
POST /api/v1/cases/{caseId}/subcases/{subCaseId}/override

Request body:
{
  "newState":   "AutoOff",           // Required: AutoOff or AutoOn (analyst); Locked or AutoOn (SOM)
  "rationale":  "string (50–300 chars)",  // Required for AutoOff and Locked
  "ttlHours":   72                   // Required for AutoOff. SOM Locked has no TTL.
}

Response 200:
{
  "subCaseId":           "SC-9001-B",
  "autoAssignmentState": "AutoOff",
  "overrideSetBy":       "user-id-123",
  "overrideSetAt":       "2026-04-25T14:30:00Z",
  "expiresAt":           "2026-04-28T14:30:00Z",
  "rationale":           "Waiting for architect confirmation before reassigning."
}
```

### 8.4 Anti-Hoarding Rules

**Governing rule:** An analyst who retains a sub-case beyond the AutoOff TTL without demonstrable progress is flagged for SOM review.

Hoarding detection criteria (all must be true):
- Sub-case `autoAssignmentState` is AutoOff.
- Time since AutoOff set ≥ `overridePolicy.defaultTTLHours / 2` (i.e. 36 hours by default).
- Sub-case `status` is still InProgress (not Done).
- Momentum Score for this sub-case: negative or zero for the entire AutoOff window.

**Action when hoarding detected:**
1. Case Pulse surfaces alert to SOM.
2. SOM can: reassign manually, extend TTL with rationale, or lock (force assignment).
3. Alert is not shown to the analyst — escalation is handled at SOM level.

### 8.5 Reassignment Rules

Sub-cases may be reassigned at any time by:
- **SOM:** Full authority. No rationale required (though recommended). Logged in trail.
- **Analyst (L2+):** May reassign within their grade band. Rationale required.
- **Team Leader:** May reassign within the team. Rationale required.
- **CCHE auto-reassignment:** Fires when AutoOff TTL expires. Reverts to AutoOn and re-runs assignment scoring. Original assignee notified.
- **Auto-park reassignment:** When stalling detection fires auto-park (MTS Section 13.32), sub-case returns to Open and CCHE re-assigns.

All reassignment events are logged in `rationaleTimeline[]` and in the case audit trail.

---

## 9. Case Pulse SOM Command Surface

Case Pulse is the SOM's real-time command dashboard. It is a dedicated workspace view (specified in full in Spec #11b) governed here at the data and behaviour level.

### 9.1 Operating Modes

The CCHE supports three operating modes, set in `SOMConfig.operatingMode`. Mode changes are logged in the tenant audit trail with mandatory SOM rationale.

| Mode | Behaviour | Use Case |
|---|---|---|
| **MDR** (Algorithmic — default) | CCHE auto-assigns all sub-cases using the Assignment Engine. SOM sees all assignments and can override at any time. | Normal operations. Maximum efficiency. |
| **Manual** | CCHE computes recommendations but does not assign. All assignments require SOM approval or manual SOM action. Case Pulse shows a pending-assignment queue. | Surge events, incident response periods, or when SOM needs full control. |
| **Hybrid** | CCHE computes and proposes assignments. Each proposed assignment is surfaced to SOM as a one-click approve/modify/reject action. Approved proposals execute immediately. | Transition periods, new team onboarding, or when SOM wants oversight without full manual control. |

**Mode switch API:**
```
POST /api/v1/som/config/mode

Request body:
{
  "mode":     "Hybrid",
  "rationale": "Onboarding three new analysts this week. Want visibility on all assignments.",
  "changedBy": "som-user-id"
}

Response 200:
{
  "previousMode": "MDR",
  "newMode":      "Hybrid",
  "effectiveAt":  "2026-04-25T16:00:00Z",
  "version":      14
}
```

### 9.2 SOM Controls

Case Pulse must provide the following controls. All actions are logged with actor, timestamp, and rationale.

| Control | Description |
|---|---|
| **Reassign sub-case** | Force-reassign any sub-case to any eligible analyst. Requires rationale. |
| **Lock / Unlock AutoAssignment** | Set `autoAssignmentState` to Locked or clear to AutoOn. |
| **Force reassignment** | Override the current assignment and trigger new CCHE scoring. |
| **Mode switch** | Switch between MDR / Manual / Hybrid with rationale. |
| **Approve pending assignment (Hybrid)** | One-click approve CCHE proposal. Or modify analyst selection before approving. |
| **Adjust analyst WorkloadMix** | Modify target ratios for an individual analyst. |
| **Override stalling threshold** | Temporarily suppress stalling alerts for a case or analyst. |
| **View assignment rationale** | See the full factor breakdown for any CCHE assignment decision. |
| **Export Case Pulse snapshot** | Export current telemetry state as JSON or CSV for reporting. |

### 9.3 Telemetry Obligations

Case Pulse must surface the following telemetry in real time:

- **Workload balance:** Active sub-case count and WCS per analyst. Colour-coded by WCS range.
- **Momentum distribution:** MS per open parent case. Red/amber/green bands.
- **Stale cases:** All cases with `stallingFlag: true`, sorted by stall duration.
- **Override activity:** All active AutoOff and Locked sub-cases, sorted by time remaining on TTL.
- **SLA pressure:** Cases approaching SLA breach (> 80% elapsed), sorted by urgency.
- **Risk concentration:** Top 10 parent cases by CRS, with CRS trend arrow (improving/worsening/stable).
- **Team velocity:** Per-team aggregate momentum score and cases-closed-this-week.
- **Automation savings:** CRS reduction attributed to push-executed sub-cases vs manually-completed vs self-healed.
- **Workload mix health:** Analysts whose actual mix deviates from target. Flagged with deviation percentage.
- **Actionable recommendations:** CCHE-generated SOM recommendations (e.g. "4 sub-cases are stalling on Identity cases. Consider reassigning to Identity Specialist [Name] (WCS: 71).").

---

## 10. Teams, Ranks, and Specialisms

### 10.1 Team Model

Teams are first-class entities in the CCHE. The Team schema is defined in Section 4.4. Team assignment types:

| Type | Description |
|---|---|
| `permanent` | Analyst is a full-time member of this team. |
| `temporary_attachment` | Analyst is attached for a defined period (e.g. surge support). |
| `cross_team_contributor` | Analyst contributes to team cases without changing their home team. |
| `swarm_participant` | Analyst joins a case swarm (MTS Section 13.21) originating from this team. |

Team Leaders are designated by the SOM. They have authority to: reassign within the team, set WorkloadMix for team members, review Operational Passport entries for their team, and approve rank promotions up to L5 (L6+ require SOM approval).

### 10.2 Rank Model (L0–L7)

The CCHE introduces an 8-level rank ladder (L0–L7) as a finer-grained progression mechanism within the existing 4-level grade band model (MTS Section 13.20).

**Governing reconciliation:** MTS grades (L0–L3) govern RBAC and approval authority — unchanged. CCHE ranks (L0–L7) govern Operational Passport progression, assignment scoring priority within a grade band, career development visibility, and specialism recognition. The rank is the analyst's position on the career ladder; the grade is their RBAC authority level.

### 10.3 Grade-to-Rank Mapping

| CCHE Rank | MTS Grade Band | Title | RBAC Authority |
|---|---|---|---|
| L0 | Grade L0 (Trainee) | Trainee Analyst | MTS Section 13.20 Grade L0 rules |
| L1 | Grade L0 (Trainee) | Junior Analyst | MTS Section 13.20 Grade L0 rules |
| L2 | Grade L1 (Analyst) | Security Analyst | MTS Section 13.20 Grade L1 rules |
| L3 | Grade L1 (Analyst) | Senior Analyst | MTS Section 13.20 Grade L1 rules |
| L4 | Grade L2 (Senior) | Lead Analyst | MTS Section 13.20 Grade L2 rules |
| L5 | Grade L2 (Senior) | Principal Analyst | MTS Section 13.20 Grade L2 rules |
| L6 | Grade L3 (Lead) | Operations Lead | MTS Section 13.20 Grade L3 rules |
| L7 | Grade L3 (Lead) | Senior Operations Lead / SOC Director | MTS Section 13.20 Grade L3 rules |

**Assignment implications:** Within the same grade band, higher-ranked analysts receive priority for complex sub-cases (impactWeight ≥ 7 or Push on critical assets) via the `rankScore` factor in assignment scoring.

### 10.4 Specialism Model

Nine specialism domains (per MTS Section 13.34): Cloud Security, Identity Intelligence, Network Defence, Endpoint Operations, Threat Response, Vulnerability Management, Compliance and Assurance, Architecture Security, Push Operations.

Three tiers per domain: Practitioner, Specialist, Expert. Tiers are earned through sustained operational performance. Criteria per domain are defined in the Achievement Catalogue (Section 11 of this spec).

**SkillMatch computation for assignment scoring:**

```
For a sub-case in domain D:
  if analyst has Expert specialism in D:    skillMatch = 1.00
  if analyst has Specialist specialism in D: skillMatch = 0.80
  if analyst has Practitioner in D:         skillMatch = 0.60
  if analyst has no specialism in D:        skillMatch = 0.10  (minimum — not zero)
```

### 10.5 Rank Progression Criteria

Promotion requires: SOM or Team Leader review and approval, evidence in the Operational Passport, and the metric criteria below being met.

| From → To | Criteria |
|---|---|
| L0 → L1 | 20 P3/P4 cases closed with SLA compliance ≥ 85%. 2 supervised push actions observed. |
| L1 → L2 | 50 cases closed across ≥ 2 case types. SLA compliance ≥ 90%. 1 specialism at Practitioner tier. |
| L2 → L3 | 100 cases closed. SLA compliance ≥ 90%. 1 P1 case closed. 2 specialisms. |
| L3 → L4 | 150 cases closed. ≥ 5 P1/P2 cases closed. 2 specialisms at Specialist tier. 10 sub-case push actions. |
| L4 → L5 | 250 cases closed. ≥ 15 P1/P2. 1 specialism at Expert tier. Mentor credit (1 analyst mentored to L2+). |
| L5 → L6 | 400 cases closed. ≥ 30 P1. Expert in ≥ 2 domains. Team leadership credit. Commander Review acceptance rate ≥ 85%. |
| L6 → L7 | SOC-wide impact demonstrated via telemetry. SOM nomination required. Platform-level passport reviewed. |

All criteria are computed from the Operational Passport. Metric thresholds are verifiable from case data and are not fabricable. SOM approval is mandatory at every level.

---

## 11. Operational Passport

The Operational Passport is the analyst's verified career record within Commander SDR. Governed at architecture level in MTS Section 13.34. This section provides the spec-level data model.

**Passport entity:**

```json
{
  "passportId":        "string",
  "platformIdentityId": "string",
  "serviceRecord": {
    "currentGrade": "L1",
    "currentRank":  "L3",
    "gradeHistory": [ { "grade": "L0", "promotedAt": "date" }, { "grade": "L1", "promotedAt": "date" } ],
    "rankHistory":  [ { "rank": "L0", "promotedAt": "date" }, ... ]
  },
  "specialismMap": {
    "CloudSecurity":       { "tier": "Specialist", "earnedAt": "date", "lastActivityAt": "date" },
    "IdentityIntelligence": { "tier": "Practitioner", "earnedAt": "date", "lastActivityAt": "date" }
  },
  "achievementGallery": [
    {
      "achievementId": "string",
      "title":         "string",
      "earnedAt":      "date",
      "backingMetric": "string",
      "credentialHash": "string (SHA-256 hash chain entry)"
    }
  ],
  "commandHistory": [
    { "role": "TeamLead", "teamId": "string", "from": "date", "to": "date" }
  ],
  "casePortfolio": {
    "totalClosed":    150,
    "byType": { "SecurityOperations": 60, "Identity": 45, "Vulnerability": 30, "Architecture": 15 },
    "byPriority": { "P1": 5, "P2": 25, "P3": 80, "P4": 40 },
    "avgTimeToCloseHours": 18.4,
    "slaCompliancePct": 92.3,
    "pushActionsExecuted": 22,
    "crsReductionContributed": 1847.3
  },
  "growthTrajectory": {
    "complexityTrend": "increasing",
    "momentumContributionAvg": 1.8
  }
}
```

**Immutable credential chain:** Every promotion, specialism award, and achievement is recorded as a tamper-evident event using the SHA-256 hash chain mechanism defined in MTS Section 17.6. The `credentialHash` on each achievement entry is the hash of (previousHash + achievementId + earnedAt + platformIdentityId). Third-party verification uses the `/api/v1/passport/verify/{credentialId}` endpoint.

---

## 12. Evidence Packs and Rollback Snapshots

The CCHE extends the existing evidence model (MTS Sections 13.8 and 13.11) to require evidence packs for every sub-case action type — not just push actions.

### 12.1 Evidence Pack Schema

```json
{
  "evidencePackId":    "string",
  "subCaseId":        "string",
  "parentCaseId":     "string",
  "actionType":       "Push | Manual | Investigation | Review",
  "actor":            "string (user ID or 'system' for auto-healing)",
  "executedAt":       "string (ISO 8601)",
  "crsAtExecution":   "number",
  "crsPostExecution": "number",
  "crsDelta":         "number (negative = CRS reduced)",
  "preActionSnapshot": {
    "capturedAt":    "string",
    "snapshotData":  "object (connector-specific pre-state)"
  },
  "actionPayload": {
    "description":   "string",
    "parameters":    "object"
  },
  "postActionSnapshot": {
    "capturedAt":    "string",
    "snapshotData":  "object (connector-specific post-state)"
  },
  "validationResult": {
    "validatedAt":   "string",
    "outcome":       "Confirmed | Partial | Failed | Pending",
    "source":        "connector_requery | bas_simulation | identity_revalidation | manual",
    "detail":        "string"
  },
  "rollbackSnapshotRef": {
    "rollbackPayloadId": "string",
    "validUntil":        "string",
    "rollbackSteps":     "array"
  }
}
```

**Evidence pack obligations by sub-case type:**

| Type | Pre-action snapshot | Post-action snapshot | Validation | Rollback ref |
|---|---|---|---|---|
| Push | Required (hard gate — MTS 14.3) | Required | Required | Required |
| Manual | Recommended (state at time of manual action, where capturable) | Required | Required | N/A |
| Investigation | N/A | Required (findings documented) | N/A | N/A |
| Review | N/A | Required (review outcome documented) | N/A | N/A |

### 12.2 Auto-Healing Behaviour

When continuous revalidation (MTS Section 13.31) detects that a case condition has self-healed, the CCHE writes an evidence pack with `actor: 'system'`:

```json
{
  "evidencePackId":    "ep-auto-9001-3",
  "subCaseId":        "SC-9001-A",
  "actionType":       "Push",
  "actor":            "system",
  "executedAt":       "2026-04-25T18:00:00Z",
  "crsAtExecution":   54,
  "crsPostExecution": 54,
  "crsDelta":         0,
  "preActionSnapshot": { ... },
  "postActionSnapshot": { "snapshotData": { "mfaEnabled": true } },
  "validationResult": {
    "outcome": "Confirmed",
    "source":  "connector_requery",
    "detail":  "MFA status confirmed active via Entra ID API re-query. Condition self-healed."
  }
}
```

The case transitions to AUTO-RESOLVED. Commander generates a confirmation note (MTS 13.31). The evidence pack is linked to the case's evidence collection and is exportable for audit.

### 12.3 Rollback Snapshot Requirements

For all Push sub-cases (extending MTS Section 14.3):

1. Rollback payload must be generated and validated BEFORE push execution. Push aborts if rollback generation fails.
2. Rollback payload validity window: default 7 days. Configurable per connector.
3. If rollback payload is stale (validity window expired), the SOM is notified before any re-execution attempt.
4. Evidence pack `rollbackSnapshotRef.validUntil` must be within the validity window at execution time.
5. Rollback execution produces its own evidence pack with `actor` set to the approver who authorised the rollback.

---

## 13. Audit and Logging Requirements

All CCHE events must be written to the immutable audit trail (MTS Section 17.6). The following event types are mandatory:

| Event Type | Required Fields |
|---|---|
| `crs_computed` | caseId, crsValue, momentumScore, factorSnapshot, weightSnapshot, trigger, computedAt |
| `caa_computed` | caseId, rankedActionIds, topActionId, computedAt, caaVersion |
| `nba_presented` | caseId, analystId, topActionId, allRankedActionIds, presentedAt |
| `assignment_made` | subCaseId, assignedTo, scoreBreakdown, assignmentMode (MDR/Manual/Hybrid), assignedAt |
| `override_set` | subCaseId, actor, newState, rationale, ttlHours, expiresAt |
| `override_expired` | subCaseId, previousState, revertedTo, expiredAt |
| `hoarding_detected` | subCaseId, analystId, stallDuration, alertedSOM |
| `auto_park` | caseId, analystId, parkReason, returnedToQueueAt |
| `phase_transition` | caseId, fromPhase, toPhase, trigger, transitionedAt |
| `som_mode_change` | tenantId, previousMode, newMode, changedBy, rationale, effectiveAt |
| `som_config_change` | tenantId, changedBy, changedFields, rationale, version, effectiveAt |
| `evidence_pack_created` | subCaseId, evidencePackId, actionType, actor, crsDelta |
| `rank_promotion` | analystId, fromRank, toRank, approvedBy, evidenceRef, promotedAt |
| `specialism_awarded` | analystId, domain, tier, awardedAt, backingMetric |

All audit events are tamper-evident (hash-chained per MTS Section 17.6). All events include `tenantId` for tenant isolation.

---

## 14. Migration Notes

For tenants migrating existing cases to the CCHE schema:

1. **CRS initialisation:** Existing open cases receive a CRS computed from their current finding state. The computation uses the default SOMConfig weights. First CRS computation trigger: `scheduled`.
2. **SubCase creation:** Existing cases with the `sub_case_ids[]` relationship (MTS 7.6) are migrated to the SubCase schema. `impactWeight` is initially set to 5 (medium, neutral) and `confidence` to 0.7. Analysts are prompted to refine these values via the case detail view.
3. **AutoAssignment state:** All migrated sub-cases and parent cases default to `AutoOn`.
4. **Operational Passport:** Analyst Passport entries are backfilled from historical case data where computable. Backfilled entries are marked `source: historical_backfill` and are not included in immutable credential chain computation — only forward-going events generate credential entries.
5. **SOMConfig initialisation:** Every tenant receives a SOMConfig record with all default values (as specified in Section 4.6) on migration. Version is set to 1.
6. **Evidence packs:** Historical cases do not receive retroactive evidence packs. Evidence pack creation begins from migration date forward.

---


## 14A. Closed-Loop Email Communication Lifecycle Alignment

This section aligns Spec #8 with Master Proposition v4.7, MTS v6.7 Section 13.26A, and Spec #26a.

### 14A.1 Scope Boundary

The Case Management & Workflow engine SHALL recognise email as a case-native communication channel where the tenant has enabled closed-loop email. This does not replace the existing Teams/Slack reference-and-import communication model.

Email events may influence communication state, stakeholder engagement state, SLA reminders, no-response escalation and closure-readiness checks. Email events SHALL NOT, by themselves, close technical remediation work without normal SDR validation evidence.

### 14A.2 Case Fields Added or Referenced

The following fields are added to the case workflow model or referenced through related entities governed by Spec #26a:

```text
communication_state
last_email_activity_at
last_inbound_email_at
last_outbound_email_at
awaiting_stakeholder_response
stakeholder_response_due_at
email_thread_count
email_correlation_pending_count
last_communication_event_id
```

These may be implemented as direct case fields, computed fields, or derived from `CaseEmailThread` / `CommunicationEvent` depending on the final data model decision in Spec #26a.

### 14A.3 Communication State Values

```text
not_started
initiated
awaiting_response
in_discussion
stale
escalated
closed
```

### 14A.4 Workflow Transitions

| Event | Case workflow effect |
|---|---|
| Outbound remediation request email sent | Set `awaiting_stakeholder_response = true`; compute `stakeholder_response_due_at`; create communication timeline event. |
| Inbound acknowledgement received | Clear immediate no-response risk; update stakeholder engagement; retain case technical state. |
| Inbound remediation update received | Add case note/event; prompt analyst to validate or update action status. |
| Inbound dispute/rejection detected | Route case/sub-case to investigation or dispute review; require analyst confirmation before state change. |
| No response by configured threshold | Mark communication state `stale`; create reminder recommendation or automated reminder if enabled. |
| Escalation threshold breached | Mark communication state `escalated`; notify SOM/manager according to policy. |
| Closure confirmation received | Mark communication loop closed only after remediation validation or approved manual closure evidence. |

### 14A.5 SLA Coupling

Email communication state SHALL integrate with the SLA Monitor as follows:

- response timers are separate from remediation timers;
- no-response reminders may trigger before the main case SLA warning;
- no-response escalation may increase case attention without changing technical severity;
- communication staleness may contribute to Case Pulse stalling signals;
- all reminders and escalations are recorded in the trail of travel.

### 14A.6 Vulnerability Management Workflow Impact

For vulnerability and exposure cases, inbound email may originate from:

- vendors;
- threat intelligence providers;
- internal scanner notification mailboxes;
- infrastructure/platform owners;
- third-party service providers;
- business application owners.

The VM workflow SHALL support:

1. inbound advisory intake;
2. CVE and asset extraction;
3. case creation or case linking;
4. acknowledgement to notifier;
5. owner engagement;
6. update cadence;
7. dispute handling;
8. closure confirmation.

### 14A.7 Test Requirements

- State transition tests for email-driven communication events.
- SLA timer tests for response due, stale and escalation states.
- Dispute-handling tests for inbound rejection messages.
- No-response escalation tests.
- Regression tests proving email failure does not block core case workflow.

## 15. Acceptance Criteria and Test Cases

### Epic A — Case Risk Engine

**A1: CRS Computation Service**
- AC: Given a parent case with known factor values and weights, CRS is computed exactly per the formula. Result matches formula output to 4 decimal places.
- AC: CRS is recomputed on action completion, revalidation, phase transition, and manual trigger.
- AC: CRS history entry is appended on every computation with correct trigger type and factor snapshot.
- Test: Unit test CRS formula with edge inputs: all factors = 0 (expect CRS = 0), all factors = 100 (expect CRS = 100), weight change produces correct proportional result.

**A2: CRS Timeline API**
- AC: `GET /api/v1/cases/{caseId}/crs-history` returns time-ordered array of CRSHistoryEntry.
- AC: API response includes factorSnapshot and weightSnapshot for each entry.
- Test: Create a case, complete 3 sub-cases, verify 3+ CRS history entries with correct triggers.

### Epic B — Case Action Algorithm

**B1: CAA Determinism**
- AC: Given identical parent case inputs (same sub-case fields, same SOMConfig), CAA must produce identical ranking on every invocation.
- AC: Stablebreaker: exact tie on adjustedImpact resolves by subCaseId lexicographic order.
- Test: Run CAA 100 times on same input. Assert output is identical on every run.

**B2: CAA Dependency Handling**
- AC: Sub-cases with unsatisfied dependencies are excluded from NBA ranking and labelled "Blocked".
- AC: When a dependency sub-case reaches Done, the previously blocked sub-case is included in the next CAA recomputation.
- Test: Create parent case with 3 sub-cases in dependency chain (A → B → C). Assert: only A is actionable initially. Mark A Done. Assert B becomes actionable. Mark B Done. Assert C becomes actionable.

**B3: CAA Explainability**
- AC: Every NBA entry includes adjustedImpact, aisNormalised, typeMultiplier, frictionPenalty, expectedCRSDelta, and rationale.
- AC: Rationale is deterministic text derived from factor values, not generated by Commander AI.

**B4: Push Preference Rule**
- AC: If Push sub-case adjustedImpact ≥ topNonPushAdjustedImpact × 0.90, Push is elevated to rank 1.
- Test: Create scenario where Manual sub-case has highest raw adjustedImpact but Push is within 10%. Assert Push is #1 in output.

### Epic C — Assignment Engine

**C1: WCS Computation**
- AC: WCS computed per formula. Test edge cases: all parameters zero (WCS = 100), all parameters maxed (WCS = 0, not negative).
- AC: Analyst with WCS < wcsDisqualifyThreshold is excluded from assignment scoring.
- Test: Set analyst Q_u = 80, H_u = 100, F_u = 0, λ₁=0.6, λ₂=0.3, λ₃=0.1. Expect WCS = max(0, 100 − (48 + 30 + 0)) = max(0, 22) = 22. Confirm included at threshold 20. Set Q_u=100, H_u=100 → WCS = max(0, 100−90) = 10 → excluded.

**C2: Assignment Scoring and Eligibility**
- AC: Highest-scoring eligible analyst is selected. Score breakdown is stored on sub-case entity.
- AC: Analyst with insufficient grade for sub-case priority is excluded before scoring.
- AC: maxActiveHighPriorityPerAnalyst enforced: analyst at limit is excluded for P1/P2 sub-cases.

**C3: Anti-Hoarding and TTL Enforcement**
- AC: AutoOff TTL expiry reverts state to AutoOn. Reversion logged.
- AC: Case Pulse alert generated when hoarding criteria are met (all 4 conditions).
- Test: Set AutoOff with 72h TTL. Advance time by 36h with negative MS. Assert Case Pulse alert. Advance time to 72h. Assert AutoOn reversion.

### Epic D — Override Governance

**D1: Override State Audit**
- AC: Every AutoOff, Locked, and AutoOn transition is recorded in case audit trail with actor, timestamp, rationale, TTL.
- AC: Override visible in Case Pulse immediately after setting.

**D2: Inactivity Escalation**
- AC: After `inactivityEscalationDays` with no analyst activity on overridden sub-case, SOM notification fires.
- Test: Set AutoOff. Simulate 7 days of no `lastAnalystActivityAt` update. Assert SOM escalation notification.

### Epic E — Teams and Ranks

**E1: Team Metrics**
- AC: Team velocity, SLA adherence, avgTimeToClose computed from member case data.
- AC: Team assignment types correctly govern analyst sub-case routing.

**E2: Operational Passport and Rank Progression**
- AC: Rank promotion requires SOM or Team Leader approval. Automatic promotion is not permitted.
- AC: Achievement entries are recorded with SHA-256 hash chain. Hash is verifiable via verification endpoint.
- AC: Passport entries do not expose case content across tenant boundaries.
- Test: Attempt to trigger promotion without SOM approval. Assert rejection. Complete promotion with approval. Assert hash entry appended.

### Epic F — Case Pulse

**F1: Mode Switch**
- AC: Mode switch requires rationale. Rationale stored in SOMConfig audit log.
- AC: In Manual mode, CCHE computes but does not execute assignments. Pending-assignment queue surfaced in Case Pulse.

**F2: SOMConfig Versioning**
- AC: Every SOMConfig change increments version. Previous version preserved in config history.
- AC: Rollback to previous SOMConfig version available. Rollback logged.
- Test: Change w_B from 3 to 4. Assert version = previous + 1. Assert rollback restores w_B = 3 and version advances again.

### Epic G — Evidence Packs

**G1: Evidence Pack Creation**
- AC: Every sub-case completion creates an evidence pack with correct actionType, actor, crsDelta.
- AC: Push sub-cases require valid rollbackSnapshotRef. Push aborts if rollback generation fails.

**G2: Auto-Healing Evidence**
- AC: When system auto-resolves via revalidation, evidence pack is written with actor = 'system'.
- AC: Evidence pack includes postActionSnapshot confirming condition resolved.


---

## 16. Team Builder and Management

Team management is a first-class operational surface in Commander SDR. Every team configuration is fully editable by the SOM. All changes are versioned and auditable. This section governs the data model, the creation and editing workflows, the membership management model, and the configuration options available per team.

### 16.1 Team Entity — Full Schema

```json
{
  "teamId":            "string (UUID)",
  "tenantId":          "string",
  "name":              "string (3–60 chars)",
  "description":       "string (optional, max 200 chars)",
  "status":            "string (enum: Active, Paused, Archived)",
  "leaderId":          "string (user ID)",
  "deputyLeaderId":    "string (user ID, optional)",
  "memberIds":         "string[] (user IDs)",
  "domainScope":       "string[] (enum values from case type categories)",
  "specialisms": {
    "aggregate": "string[] (auto-computed from member specialisms)",
    "declared":  "string[] (SOM-declared team specialisms, overrides aggregate if set)"
  },
  "workloadMix": {
    "Push":          "number (target ratio)",
    "Manual":        "number",
    "Investigation": "number",
    "Review":        "number"
  },
  "slaTargets": {
    "P1CompliancePct":  "number (default: 95)",
    "P2CompliancePct":  "number (default: 90)",
    "P3CompliancePct":  "number (default: 85)",
    "P4CompliancePct":  "number (default: 80)"
  },
  "capacityLimits": {
    "maxConcurrentCasesTeam":      "integer (total cases across all team members)",
    "maxConcurrentCasesPerMember": "integer (overrides individual analyst setting if lower)"
  },
  "caseQueueAssignments": "string[] (queue names this team handles)",
  "temporaryAttachments": [
    {
      "userId":     "string",
      "attachedBy": "string (SOM user ID)",
      "from":       "date-time",
      "to":         "date-time",
      "reason":     "string"
    }
  ],
  "createdAt":  "date-time",
  "createdBy":  "string (SOM user ID)",
  "updatedAt":  "date-time",
  "archivedAt": "date-time (null if active)"
}
```

### 16.2 Team Builder Workflow

The Team Builder is a guided, step-by-step creation flow accessed via **Platform Administration → Teams → Create New Team**. It is also available as a quick-edit mode on any existing team. Every field is editable after creation — nothing is locked post-creation except `teamId`.

**Step 1 — Team Identity**

```
Team name:        [___________________________]   3–60 characters. Must be unique within tenant.
Description:      [___________________________]   Optional. Appears in Case Pulse and assignment rationale.
Status:           ● Active   ○ Paused
                  Paused teams receive no new auto-assignments. Existing cases continue.
```

**Step 2 — Leadership**

```
Team Leader:      [Search analyst by name or user ID ▼]
                  The Team Leader can: reassign within the team, set individual WorkloadMix,
                  approve rank promotions up to L5, and view full team performance.

Deputy Leader:    [Search analyst ▼]   (optional)
                  Activates automatically when Team Leader is out-of-office.
                  Has full Team Leader authority during activation.
```

**Step 3 — Members**

```
Members:          [Search and add analysts ▼]

Current members:
  Jane Smith     L4 · Identity Specialist · WCS 74   [Set as Leader] [Remove]
  Tom Clarke     L2 · Cloud Practitioner  · WCS 61   [Remove]
  Aisha Patel    L3 · Push Specialist     · WCS 88   [Remove]

Assignment types (per member):
  ● Permanent          Full team member. All team metrics apply.
  ○ Temporary          Set duration: [From ____] [To ____] [Reason ___________]
  ○ Cross-team contributor  Contributes to team cases without changing home team.

Aggregate specialisms (auto-computed): Identity, Cloud, Push Operations
[Add declared specialism override ▼]   Use when the team covers a domain not yet earned by any member.
```

**Step 4 — Domain Scope**

```
Case queues this team handles:
  ☑ Security Operations — Drift Operations queue
  ☑ Identity — Identity Intelligence queue
  ☐ Vulnerability & Exposure — Vulnerability Tracker
  ☐ Architecture — Control & Architecture
  ☐ Engineering Health — Platform Engineering
  ☐ Governance — Assurance & Audit

  Teams can cover multiple queues. The Assignment Engine routes sub-cases to
  this team when the case type matches a covered queue.
```

**Step 5 — Team Workload Mix**

```
Target workload mix for this team (applies to all members unless individually overridden):

  Push:          [0.35] ▲   Drag or type to adjust.
  Manual:        [0.30]
  Investigation: [0.25]
  Review:        [0.10]
  Total:          1.00 ✓

  Individual analyst ratios override team defaults when set.
  [Reset to organisation defaults]
```

**Step 6 — SLA Targets**

```
Team SLA compliance targets (used in Team Performance Dashboard):

  P1 cases:  [95]%   Target for percentage of P1 cases closed within SLA.
  P2 cases:  [90]%
  P3 cases:  [85]%
  P4 cases:  [80]%

  These targets govern the Team Performance Dashboard amber/red thresholds.
  They do not change the underlying SLA deadlines — those are set by the SLA engine.
```

**Step 7 — Capacity Limits**

```
  Max concurrent cases (team total):    [60]    (default: 20 × member count)
  Max concurrent cases per member:      [15]    (overrides individual setting if lower)
  Max P1/P2 cases per member:           [3]     (uses SOMConfig default; override per team here)
```

**Step 8 — Review and Create**

```
Team summary:
  Name:         Identity & Cloud Operations
  Leader:       Jane Smith (L4)
  Members:      3 analysts
  Queues:       Security Operations, Identity
  Specialisms:  Identity, Cloud, Push Operations
  Workload mix: Push 35% / Manual 30% / Investigation 25% / Review 10%
  SLA targets:  P1 95% / P2 90% / P3 85% / P4 80%

  [Create team]   [Back]   [Save as draft]
```

### 16.3 Team Editing

Every team is editable in full from **Platform Administration → Teams → [Team Name] → Edit**. The edit view uses the same step structure as the builder but with current values pre-populated. All fields remain editable. Editing is not transactional — changes are applied section by section, each with a mandatory change reason.

**Quick-edit actions (without entering full edit mode):**

| Action | Access | Requirement |
|---|---|---|
| Add member | Team card → Members → Add | SOM or Team Leader |
| Remove member | Team card → Members → [name] → Remove | SOM or Team Leader |
| Attach temporarily | Team card → Members → Attach temporarily | SOM only |
| Change leader | Team card → Leadership → Change | SOM only |
| Activate deputy | Team card → Leadership → Activate deputy | SOM only; auto-activates on leader OOO |
| Pause team | Team card → Status → Pause | SOM only; requires reason |
| Archive team | Team card → Status → Archive | SOM only; requires reason; open cases reassigned first |

### 16.4 Team Archiving

A team cannot be archived while it has open assigned cases. Attempting to archive a team with open cases shows:

```
Cannot archive: 14 open cases are assigned to members of this team.
Resolve before archiving:
  ● Reassign all cases to another team  [Select team ▼]  [Reassign]
  ● Reassign individually in Case Pulse
  [Cancel]
```

Once all cases are resolved or reassigned, archiving proceeds. The archived team's history (performance metrics, case records) is preserved indefinitely. The team cannot receive new assignments in archived state.

### 16.5 Temporary Attachment Management

The SOM can attach an analyst from any team to any other team for a defined period. This is the formal surge and cross-skill augmentation mechanism.

```
Attach analyst to team:
  Analyst:   [Search ▼]   Tom Clarke (L2 · Cloud Practitioner · Team: Threat Response)
  To team:   [Search ▼]   Identity & Cloud Operations
  From:      [2026-05-01]
  To:        [2026-05-15]
  Reason:    [__________________________________________]
  
  During attachment:
  ● Tom Clarke appears in Identity & Cloud Operations metrics.
  ● Tom Clarke's workload mix target switches to the destination team's defaults.
  ● Tom Clarke's Operational Passport records the attachment with team and duration.
  ● At end date, attachment expires automatically. Tom Clarke returns to Threat Response.
  
  [Confirm attachment]
```

---

## 17. Team Performance Dashboard

The Team Performance Dashboard is a dedicated view within Case Pulse giving the SOM a comprehensive, real-time view of team operational health. Every metric is drillable — clicking any metric opens the underlying case or analyst list.

### 17.1 Dashboard Layout

The SOM sees a grid of team cards at the top, followed by a detailed comparison table, followed by trend charts. All views are filterable by time window (Today / 7 days / 30 days / 90 days / Custom).

**Team Card (one per active team):**

```
┌────────────────────────────────────────────────────┐
│ Identity & Cloud Operations          ● Active       │
│ Jane Smith (Lead) · 3 members                       │
│                                                     │
│ Cases open:    14    Closed this week:   8          │
│ Avg CRS:       67    CRS trend:         ↓ −11       │
│ Momentum avg:  1.4   Stalling:          2           │
│                                                     │
│ SLA compliance:  P1 100% ✓  P2 87% ⚠  P3 91% ✓    │
│ Capacity:        ██████░░░░  61% (41/60 cases)      │
│                                                     │
│ Resolution durability (30d): 91%                    │
│ Business impact resolved: £340K                     │
│                                                     │
│ [View team]  [Reassign cases]  [Edit team]          │
└────────────────────────────────────────────────────┘
```

### 17.2 Team Performance Metrics — Full Register

| Metric | Definition | Threshold — Green | Threshold — Amber | Threshold — Red |
|---|---|---|---|---|
| **Cases closed (period)** | Count of cases closed within the selected time window. | Trending up vs prior period | Flat | Declining |
| **Average time to close** | Mean hours from TRIAGED to CLOSED across all case types. | Below team SLA target | Within 20% above target | > 20% above target |
| **SLA compliance — P1** | % of P1 cases closed within SLA this period. | ≥ team P1 target (default 95%) | Within 10% below target | > 10% below target |
| **SLA compliance — P2/P3/P4** | Per-priority SLA compliance rate. | ≥ team target | Within 10% below | > 10% below |
| **Average CRS at close** | Mean CRS of cases at the point of closure. Lower = better. | < 15 | 15–30 | > 30 |
| **CRS reduction delivered** | Total CRS points reduced across all team cases this period. | Trending up | Flat | Declining |
| **Momentum score average** | Mean MS across all team's active open cases. | > 1.5 | 0–1.5 | Negative |
| **Stalling case count** | Open cases with `stallingFlag: true` assigned to this team. | 0 | 1–2 | ≥ 3 |
| **Override activity** | Count of active AutoOff sub-cases on team's cases. | < 10% of open sub-cases | 10–25% | > 25% |
| **WorkloadMix deviation** | Any member whose actual mix deviates from target by > 15% for > 3 days. | None flagged | 1 member | ≥ 2 members |
| **Capacity utilisation** | Open cases / team capacity limit. | 50–80% | 80–95% | > 95% or < 30% |
| **Push action rate** | % of remediation sub-cases resolved via push vs manual. | ≥ 40% push | 20–40% | < 20% |
| **Commander AI engagement** | % of P1/P2 cases where analyst invoked Commander analysis. | ≥ 70% | 40–70% | < 40% |
| **Resolution durability (30d)** | % of cases closed in last 30d that have not reopened or recurred. | ≥ 90% | 75–90% | < 75% |
| **Business impact resolved** | Cumulative estimated financial exposure eliminated this period. | Trending up | Flat | — |

### 17.3 Team Comparison Table

The SOM can view all teams side by side in a sortable table. Any column is sortable. Any row is drillable.

```
                           Identity & Cloud  Threat Response  Vuln & Exposure  Architecture
Cases closed (7d)                  8               12               5               3
Avg time to close (hrs)           19.4             14.2             42.1            88.6
P1 SLA compliance                100%              96%              91%             n/a
Momentum avg                      1.4              1.9              0.7             0.3
Stalling cases                    2                0                4               1
Capacity                         61%              78%              89%             42%
Resolution durability             91%              94%              79%             96%
Business impact resolved         £340K            £820K            £210K           £90K

[Sort by any column]  [Export table]  [Drill into any team]
```

### 17.4 Individual Analyst View Within Team

From any team card or comparison table, the SOM can drill to see per-analyst metrics within the team:

```
Identity & Cloud Operations — Analyst Detail

Analyst          Rank  WCS  Open  P1/P2  SLA%   Momentum  Stalling  Durability
Jane Smith        L4   74    6     2      100%    1.8        0         94%
Tom Clarke        L2   61    5     1       87%    1.1        1         88%
Aisha Patel       L3   88    3     0       100%   2.1        0         96%

[Reassign from Jane]  [Adjust workload mix]  [View passport]
```

All columns sortable. Clicking an analyst row opens their full profile with case queue, specialism map, recent momentum history, and WorkloadMix actual vs target.

### 17.5 Trend Charts

Below the team cards and comparison table, Case Pulse renders time-series charts for the selected time window:

- **CRS reduction by team** — stacked area chart showing how much each team is contributing to estate-wide CRS reduction.
- **Momentum score trend** — line chart per team, showing whether teams are accelerating or decelerating.
- **SLA compliance trend** — by team, by priority, over time. Identifies whether SLA degradation is acute or chronic.
- **Cases closed per week** — bar chart per team with P1/P2/P3/P4 breakdown.
- **Resolution durability trend** — % of closed cases that held at 30/60/90 days, per team.

All charts are exportable as PNG or CSV.

---

## 18. CRS Confidence Intervals and Data Freshness

The CRS is a point estimate. Commander SDR must be honest about when that estimate is reliable and when it is based on stale or partial data. This section governs the confidence interval computation and the data freshness indicator displayed alongside every CRS value.

### 18.1 Confidence Interval Model

Every CRS computation produces a confidence interval alongside the point estimate: **CRS 82 ±11 (CI: 71–93)**.

The interval width is determined by the freshness and reliability of the underlying factor data:

| Factor | Freshness window | Confidence contribution |
|---|---|---|
| Blast Radius (B) | Computed at case creation + on every ingestion | High if computed within 1 ingestion cycle. Degrades linearly if connector degraded. |
| Exposure Severity (E) | From most recent network/cloud connector pull | High within Tier 1 cadence. Degrades if connector not pulled in > 2× expected cadence. |
| Impact Score (I) | From asset criticality tags — refreshed on Tier 3 baseline | Stable unless criticality tags changed. Low confidence if tags are > 30 days stale. |
| Control Coverage Gap (C) | Recomputed each coverage evaluator cycle | Degrades if coverage evaluator cycle is behind schedule. |
| Attack Path Likelihood (A) | From likelihood scorer — cadence per MTS Section 10 | Lowest inherent confidence (probabilistic). Additionally degrades if scorer is lagged. |
| Time Pressure (T) | Real-time SLA computation | Always current. Never degrades. |

**Interval computation:**

```
baseConfidence = 1.0
for each factor in [B, E, I, C, A, T]:
  dataAge     = now − factor.lastComputedAt  (in hours)
  expectedAge = factor.expectedRefreshCadenceHours
  freshnessScore = max(0, 1 − (dataAge / (expectedAge × 2)))
  baseConfidence = baseConfidence × (0.5 + 0.5 × freshnessScore)

intervalHalfWidth = CRS × (1 − baseConfidence) × 0.5
confidenceInterval = [CRS − intervalHalfWidth, CRS + intervalHalfWidth]
```

### 18.2 Data Freshness Indicator

Every CRS display — case detail view, Case Pulse, Team Performance Dashboard — shows a freshness badge alongside the CRS value:

| Badge | Meaning |
|---|---|
| ● **Fresh** (green) | All factors computed within expected cadence. CI half-width < 5. |
| ◐ **Estimated** (amber) | One or more factors are stale. CI half-width 5–15. Reason shown on hover. |
| ○ **Stale** (red) | Multiple factors significantly stale or connector degraded. CI half-width > 15. CRS should not be used for escalation decisions without acknowledgement. |

**Hover tooltip on amber/red:**

```
CRS 82 ±11 — Estimated
  Blast Radius: computed 4.2 hours ago (expected ≤ 1 hour) — AWS Config connector degraded
  Attack Path Likelihood: computed 6.1 hours ago (expected ≤ 4 hours) — Likelihood scorer lagged
  Recommendation: re-run ingestion for affected connectors before making assignment decisions.
  [Trigger ingestion refresh]
```

### 18.3 SOM Alert for Stale CRS

If any open P1 or P2 case has a CRS confidence badge of **Stale** for more than 30 minutes, Case Pulse surfaces an alert:

```
⚠ CRS data stale on 3 P1/P2 cases — SDR-9001, SDR-9034, SDR-8881
  Affected connector: AWS Config (degraded — last successful pull 4.3h ago)
  Assignment and escalation decisions based on CRS for these cases may be unreliable.
  [View connector health]  [Trigger refresh]
```

---

## 19. Resolution Durability Score

### 19.1 Purpose

Closing a case is not the same as solving a problem. The Resolution Durability Score measures whether fixes hold over time. It is the primary quality metric for case outcomes — complementary to speed (time to close) and compliance (SLA adherence).

### 19.2 Durability Model

After every case is closed, the SDR drift detection engine continues to monitor the affected entities for recurrence of the same or structurally identical conditions.

**Durability check cadence:** 30 days, 60 days, and 90 days post-close.

**Outcome classification:**

| Status | Condition | Durability Contribution |
|---|---|---|
| `durable` | No recurrence at 90-day check. | Full credit. |
| `partial` | Condition partially recurred (different scope or lower severity). | 50% credit. |
| `recurred` | Same condition detected on same or overlapping asset set. | 0 credit. |
| `pending` | Not yet reached first check window. | Not yet scored. |

**Resolution Durability Score (RDS) per analyst:**

```
RDS_u = (fully_durable_count + 0.5 × partial_count) / (total_checked_count)
```

Expressed as a percentage. Target: ≥ 90%.

**Resolution Durability Score per team:**

```
RDS_team = mean(RDS_u for all members in team)
```

### 19.3 Durability in the Operational Passport

Every analyst's durability score is visible in their Operational Passport and feeds into:
- **Rank promotion criteria:** L4+ promotion requires RDS ≥ 85%.
- **Assignment engine:** Analysts with RDS ≥ 90% receive a +0.05 bonus to `skillMatch` for complex (impactWeight ≥ 7) sub-cases.
- **SOM view:** Analysts with RDS < 75% are flagged in the Team Performance Dashboard for coaching attention.

### 19.4 Recurrence Analysis

When a case recurs (a new finding matches a closed case's condition on the same or overlapping entity set), the new case is automatically linked: `recurrence_of_case_id`. Commander generates a recurrence note: "This condition previously occurred as SDR-8441 (closed 44 days ago by [analyst]). Previous resolution: [action summary]. Durability: failed at 44 days."

This recurrence history is available in the CAA — if previous push actions on this condition type have low durability, the CAA reduces the confidence on similar push sub-cases for this entity.

---

## 20. Business Impact Translation Layer

### 20.1 Purpose

The CRS tells the security team what the risk level is. The Business Impact Translation Layer tells every stakeholder — CISO, CFO, board — what the risk means in financial and operational terms. It converts CRS and blast radius data into estimated business impact exposure.

### 20.2 Business Impact Estimate (BIE) Model

Each parent case carries a `businessImpactEstimate` computed from:

```
BIE = blastRadius_assets × assetDailyRevenueAtRisk × exploitabilityFactor × exposureDurationDays
```

| Component | Source |
|---|---|
| `blastRadius_assets` | Affected entity count from blast radius computation |
| `assetDailyRevenueAtRisk` | From asset entity `business_value_daily` field (SOM-configurable per asset group or asset tag). Default: £0 (no financial exposure assigned). |
| `exploitabilityFactor` | Derived from Attack Path Likelihood factor A. Range [0.1, 1.0]. |
| `exposureDurationDays` | Days since case was created (how long the exposure has been open). |

**BIE is displayed as an estimated range, not a point value:**

```
Business impact estimate: £180K – £340K
  Based on: 12 affected assets · £8,200/day asset value · 68% exploitability · 4 days open
  ⓘ Asset business values are configured in asset tag policies. Unvalued assets contribute £0.
```

### 20.3 Aggregate Business Impact in Case Pulse

Case Pulse and the CISO dashboard aggregate BIE across all open cases:

```
Total open exposure:  £2.1M – £4.8M   (across 47 open cases)
Resolved this month:  £6.3M – £12.4M  (risk eliminated through case closure)
```

### 20.4 Asset Business Value Configuration

Asset business values are configured in **Platform Administration → Business Impact → Asset Value Policies**. The SOM or Platform Administrator assigns daily revenue-at-risk values by asset tag:

```
Tag: payment-processing    →  £18,500 / day
Tag: customer-data         →  £12,000 / day
Tag: critical-infrastructure → £25,000 / day
Tag: internal-tooling      →  £800 / day
[No tag assigned]          →  £0 / day (contributes no financial exposure)
```

Values are stored in the SOMConfig extension (`businessImpact.assetValuePolicies[]`) and are tenant-configurable. They are not used in CRS computation — they are a parallel translation layer only.

---

## 21. Case Trajectory Engine

### 21.1 Purpose

The Case Trajectory Engine gives the SOM and analysts a forward view of where a case is heading — expected CRS at close, expected time to close, SLA breach probability — based on current momentum, sub-case completion rate, analyst capacity, and historical patterns for this case type.

### 21.2 Trajectory Computation

For each open case, the engine computes:

```
expectedTimeToClose = remainingWeightedActions / (completionRatePerHour × capacityFactor)

slaBreachProbability = f(slaDeadline, expectedTimeToClose, momentumScore)
  → if expectedTimeToClose > timeRemaining: breach probability > 50%
  → scaled by momentumScore: low momentum amplifies breach probability

expectedCRSAtClose = currentCRS × (1 − remainingImpactFraction)
  → remainingImpactFraction = sum(impactWeight of open subCases) / sum(impactWeight of all subCases)
```

### 21.3 Trajectory Display

Every case in Case Pulse shows a trajectory indicator alongside the current CRS and priority:

```
SDR-9001  P1  CRS 82 ●Fresh
  Trajectory:  ↓ Expected CRS at close: ~18
  Time to close: ~14 hours at current momentum
  SLA breach probability: 12%  ✓

SDR-9034  P2  CRS 61 ◐Estimated
  Trajectory:  → Flat — no momentum in last 6 hours
  Time to close: unknown — stalling detected
  SLA breach probability: 67%  ⚠  Action required
```

### 21.4 SOM Trajectory Alerts

If SLA breach probability exceeds 60% on a P1 or P2 case, Case Pulse surfaces an actionable alert:

```
⚠ SDR-9034 (P2 · Identity) — SLA breach risk: 67%
  No analyst activity in 6.1 hours. Current assignee: Tom Clarke (WCS: 22 — near capacity).
  Recommended action: reassign to Aisha Patel (WCS: 88, Identity Practitioner).
  [Reassign to Aisha Patel]  [View case]  [Suppress alert]
```

---

## 22. Case Resonance Engine

### 22.1 Purpose

Cases do not exist in isolation. The Case Resonance Engine continuously analyses all open cases for structural relationships — shared entities, shared attack vectors, conflicting proposed remediations, complementary evidence — and surfaces these connections to analysts and the SOM.

This is distinct from the master/sub-case model (which is explicitly created by an analyst). Resonance is automatically detected by the platform.

### 22.2 Resonance Signal Types

| Signal | Condition | Action |
|---|---|---|
| **Shared entity** | Two or more cases affect the same asset or identity. | Link cases. Show on each case: "3 other open cases affect this entity." |
| **Conflicting remediation** | A push action proposed on Case A would conflict with a compensating control on Case B on the same entity. | Block push until conflict is resolved. Alert analyst and SOM. Recommend coordinated push group. |
| **Complementary evidence** | Case A's investigation findings would inform Case B's action scope. | Suggest: "Evidence from SDR-9001 may be relevant to SDR-9034. Share investigation notes?" |
| **Common attack vector** | Two or more cases share the same MITRE ATT&CK technique or attack path likelihood pathway. | Surface pattern: "4 open cases share lateral movement vector TA0008. Recommend swarm." |
| **Surge pattern** | 5+ structurally similar cases open within a configurable window (default: 2 hours). | SOM alert: surge pattern detected. Recommend shared workstream and Commander deep analysis before individual assignment. |

### 22.3 Resonance in Case Pulse

Case Pulse maintains a **Resonance Panel** showing active cross-case connections:

```
Resonance — Active Connections

  ⚠ Remediation conflict: SDR-9001 and SDR-9034
    Push proposed on SDR-9001 (Entra ID MFA enforcement) conflicts with
    compensating control on SDR-9034 (conditional access exemption). 
    Resolve conflict before executing either push.
    [Create coordinated push group]  [View both cases]

  ↗ Surge pattern: Identity cases  (8 cases, last 3 hours)
    SDR-9001 SDR-9034 SDR-9038 SDR-9041 SDR-9044 SDR-9048 SDR-9051 SDR-9055
    Potential systemic cause. Recommend Commander deep analysis before individual assignment.
    [Request Commander analysis]  [Assign to swarm]

  ↔ Shared entity: 3 cases affect identity user@company.com
    SDR-9001 (P1) · SDR-9034 (P2) · SDR-9051 (P3)
    [View entity timeline]  [Consolidate cases]
```

### 22.4 Conflict Gate

If a push sub-case on Case A has a remediation conflict with Case B, the push gate (MTS Section 14) is extended with a resonance check. The push cannot execute until:
- The analyst acknowledges the conflict, OR
- The SOM overrides the conflict gate with mandatory rationale, OR
- A coordinated push group is created that resolves both cases simultaneously.

---

## 23. Commander Silent Monitor

### 23.1 Purpose

Commander AI currently operates in query-response mode — analysts ask, Commander answers. The Silent Monitor extends Commander to operate as a persistent background observer of case health, surfacing concise, actionable observations to the SOM when something matters — without being intrusive or chatty.

### 23.2 Silent Monitor Triggers

Commander Silent Monitor fires an observation when any of the following conditions are met:

| Trigger | Condition | Recipient |
|---|---|---|
| **NBA divergence** | Analyst has ignored the #1 NBA recommendation for ≥ `nbaDivergenceWindowHours` (default: 4h on P1, 12h on P2) and CRS has increased during that period. | SOM via Case Pulse. Not shown to analyst. |
| **Trajectory shift** | Case trajectory changes from expected-close to expected-SLA-breach within a single momentum window. | SOM and case owner. |
| **Resonance-driven insight** | Resonance Engine detects a new cross-case pattern that Commander assesses as indicating a systemic issue vs isolated incidents. | SOM. |
| **Evidence gap** | Case reaches ACTION_PROPOSED state but Commander detects insufficient evidence to support the proposed action confidence. | Analyst (as an inline case observation). |
| **Phase B quality check** | Case enters Phase B. Commander reviews the Phase B directive and flags if any remaining items appear more complex than a junior analyst should handle. | SOM and Phase B assignee. |

### 23.3 Silent Monitor Output Format

All Silent Monitor outputs are brief and actionable. Commander does not write paragraphs in monitoring mode.

```
Commander Observation — SDR-9001  [14:32]
  Push sub-case SC-9001-A has been available as the #1 recommended action for 4.2 hours.
  CRS has increased from 82 to 89 during this period.
  Analyst override rationale: "Waiting for architect confirmation."
  Architect confirmation has not been logged. Consider: reassign, escalate to architect,
  or accept push without confirmation if risk warrants.
  [Reassign]  [Notify architect]  [Dismiss]
```

### 23.4 Silent Monitor Rate Limiting

Commander Silent Monitor is rate-limited per case: maximum 2 observations per case per 24-hour period. This prevents observation fatigue. If more than 2 trigger conditions fire in 24 hours on the same case, they are batched into a single observation.

### 23.5 SOM Configuration for Silent Monitor

Silent Monitor behaviour is configurable in the SOMConfig extension:

| Key | Default | Description |
|---|---|---|
| `silentMonitor.enabled` | `true` | Enable/disable the Silent Monitor entirely. |
| `silentMonitor.nbaDivergenceWindowHoursP1` | `4` | Hours before NBA divergence fires on P1. |
| `silentMonitor.nbaDivergenceWindowHoursP2` | `12` | Hours before NBA divergence fires on P2. |
| `silentMonitor.maxObservationsPerCasePer24h` | `2` | Rate limit per case. |
| `silentMonitor.deliveryTarget` | `"som_only"` | `som_only`, `som_and_analyst`, or `analyst_only`. |

---

## 24. SOMConfig Additions — Enhancements Register

The following keys extend Section 4.6 (SOMConfig schema) to govern the new capabilities in Sections 18–23:

```json
{
  "crsConfidence": {
    "staleAlertThresholdMinutesP1P2": 30,
    "staleBadgeHalfWidthThreshold": 15,
    "estimatedBadgeHalfWidthThreshold": 5
  },
  "resolutionDurability": {
    "checkDaysWindows": [30, 60, 90],
    "durableRDSThreshold": 0.90,
    "flaggedRDSThreshold": 0.75,
    "assignmentBonusThreshold": 0.90,
    "assignmentBonusValue": 0.05
  },
  "businessImpact": {
    "enabled": true,
    "displayCurrencySymbol": "£",
    "assetValuePolicies": []
  },
  "caseTrajectory": {
    "slaBreachAlertThresholdPct": 60,
    "trajectoryWindowHours": 72
  },
  "caseResonance": {
    "surgeDetectionWindowMinutes": 120,
    "surgeCaseCountThreshold": 5,
    "conflictGateEnabled": true
  },
  "silentMonitor": {
    "enabled": true,
    "nbaDivergenceWindowHoursP1": 4,
    "nbaDivergenceWindowHoursP2": 12,
    "maxObservationsPerCasePer24h": 2,
    "deliveryTarget": "som_only"
  },
  "teamManagement": {
    "defaultTeamSLATargets": {
      "P1CompliancePct": 95,
      "P2CompliancePct": 90,
      "P3CompliancePct": 85,
      "P4CompliancePct": 80
    },
    "teamCapacityDefaultMultiplier": 20,
    "temporaryAttachmentMaxDays": 90,
    "durabilityFlagThresholdForCoaching": 0.75
  }
}
```

---

## 25. Acceptance Criteria — Enhancement Additions

### Epic H — Team Builder and Management

**H1: Team Builder**
- AC: Team can be created in 8 steps with all fields validated before creation.
- AC: Every field is editable post-creation. No field is locked except `teamId`.
- AC: Team cannot be archived with open assigned cases. System prompts for reassignment.
- AC: Quick-edit actions (add member, change leader, pause, archive) are accessible from team card without entering full edit mode.

**H2: Temporary Attachments**
- AC: Temporary attachment expires automatically at `to` date. Analyst returns to home team metrics.
- AC: Temporary attachment recorded in analyst's Operational Passport with team name and duration.
- AC: SOM receives notification 24 hours before attachment expiry.

**H3: Team Performance Dashboard**
- AC: All 15 metrics in Section 17.2 are computed and displayed. Amber/red thresholds are applied correctly.
- AC: All metrics are drillable to underlying case or analyst list.
- AC: Trend charts render correctly for all time windows (Today, 7d, 30d, 90d, Custom).
- AC: Team comparison table is sortable by any column. Export to CSV produces correct data.

### Epic I — CRS Confidence and Freshness

**I1: Confidence Interval**
- AC: Every CRS computation produces a confidence interval. Interval width reflects actual data freshness.
- AC: Fresh/Estimated/Stale badge is displayed on all CRS representations.
- AC: Hover tooltip on Estimated/Stale badge identifies the degraded factor(s) and reason.

**I2: Stale CRS Alert**
- AC: P1/P2 case with Stale badge for > 30 minutes triggers Case Pulse alert.
- AC: Alert includes trigger refresh action that initiates ingestion for the degraded connector.

### Epic J — Resolution Durability

**J1: Durability Tracking**
- AC: Durability checks fire at 30, 60, 90 days post-close. Results stored on closed case entity.
- AC: Recurrence detection links new case to closed case via `recurrence_of_case_id`.
- AC: Commander generates recurrence note on new case creation when prior case exists.

**J2: Durability in Assignment**
- AC: Analysts with RDS ≥ 90% receive +0.05 skillMatch bonus. Bonus stored in assignment score breakdown.
- AC: Analysts with RDS < 75% are flagged in Team Performance Dashboard.

### Epic K — Business Impact

**K1: BIE Computation**
- AC: BIE computed for every case with at least one asset tagged with a business value policy.
- AC: BIE displayed as a range on case detail and Case Pulse. Unvalued assets contribute £0.
- AC: Aggregate open exposure and resolved-this-month totals appear in Case Pulse and CISO dashboard.

### Epic L — Case Trajectory

**L1: Trajectory Computation**
- AC: expectedTimeToClose, slaBreachProbability, and expectedCRSAtClose computed per case.
- AC: SLA breach probability > 60% on P1/P2 triggers Case Pulse alert with recommended reassignment.
- AC: Trajectory indicator visible on every case in Case Pulse.

### Epic M — Case Resonance

**M1: Resonance Detection**
- AC: Shared entity resonance detected within one ingestion cycle of second case opening.
- AC: Remediation conflict blocks push gate. Push cannot execute until conflict resolved or SOM overrides.
- AC: Surge pattern alert fires when 5+ similar cases open within 2-hour window.

**M2: Conflict Gate**
- AC: Conflict gate override by SOM requires mandatory rationale. Logged in audit trail.
- AC: Coordinated push group creation from resonance alert creates correctly linked push group (MTS Section 14.4).

### Epic N — Silent Monitor

**N1: Observation Delivery**
- AC: NBA divergence observation fires at configured window (default 4h P1, 12h P2) when CRS has increased.
- AC: Rate limit of 2 observations per case per 24h enforced. Overflow is batched.
- AC: Observation includes specific recommended action with one-click execution.

**N2: SOM Configuration**
- AC: Silent Monitor can be disabled globally from SOMConfig. Setting takes effect immediately.
- AC: Delivery target configurable (som_only, som_and_analyst, analyst_only).


---

## 26. Progressive Complexity Assignment

### 26.1 Purpose

When a new analyst is assigned their first case, the CCHE assignment engine has no basis for differentiating their practical readiness from an analyst at the same grade with two years of case history. This section governs a purely algorithmic complexity gate that applies to new analysts automatically, requires no SOM configuration or manual setup, and fades without intervention as the analyst accumulates operational history.

### 26.2 Assignment Age Model

The `AnalystProfile` entity carries two fields governing progressive assignment:

| Field | Type | Definition |
|---|---|---|
| `firstAssignmentAt` | date-time | The timestamp of the first sub-case auto-assigned to this analyst. Set once by the system on first assignment. Never modified. |
| `assignmentAgeDays` | integer (computed) | `now − firstAssignmentAt` in whole days. Recomputed on each assignment cycle. |

`firstAssignmentAt` is set automatically by the assignment engine at the moment the first sub-case is assigned. No SOM action required. No onboarding form. No human trigger.

### 26.3 Complexity Gate

The assignment engine applies a progressive `complexityGate` on `impactWeight` based on `assignmentAgeDays`:

| Assignment Age | Complexity Gate | Effect |
|---|---|---|
| Days 0–30 | `impactWeight ≤ 4` | Only lower-complexity sub-cases are auto-assigned. Higher-complexity sub-cases remain in the queue visible to the analyst — they may self-assign if they choose. The gate governs what the system pushes, not what the analyst can access. |
| Days 31–60 | `impactWeight ≤ 7` | Mid-complexity gate. Covers most operational sub-cases. High-impact sub-cases (impactWeight 8–10) remain queue-eligible for self-assignment but are not auto-pushed. |
| Days 61+ | No gate | Full grade-level assignment. Gate removed entirely. No further differentiation. |

**Gate removal:** The gate is removed at `assignmentAgeDays = 61` with no action required. The system does not flag the transition. The analyst does not receive a notification. The gate simply ceases to apply on the next assignment cycle.

**Gate override:** The SOM may clear the complexity gate for a specific analyst at any time — for example, if an analyst has prior experience that the platform has not yet measured. Override is set via `AnalystProfile.complexityGateOverride: true`. Override is logged in the audit trail.

### 26.4 Automatic Team Leader Visibility

For all analysts with `assignmentAgeDays < 60`, the system automatically sets a `newAnalystFlag: true` on every sub-case assigned to them. This flag is visible to the Team Leader in their team view as a `▲` indicator on the case row. No mentor pairing, no manual attribution, no SOM configuration required.

The Team Leader sees:

```
Identity & Cloud Operations — Open Cases

  SDR-9001  P1  CRS 82  Jane Smith        [normal]
  SDR-9044  P3  CRS 41  Tom Clarke ▲      [new analyst — day 12]
  SDR-9051  P3  CRS 38  Tom Clarke ▲      [new analyst — day 12]
```

The `▲` flag disappears automatically at `assignmentAgeDays = 60`. No action required.

### 26.5 SOMConfig Keys

| Key | Default | Description |
|---|---|---|
| `progressiveAssignment.phase1MaxImpactWeight` | **4** | Complexity gate for days 0–30. |
| `progressiveAssignment.phase2MaxImpactWeight` | **7** | Complexity gate for days 31–60. |
| `progressiveAssignment.phase1DurationDays` | **30** | Length of Phase 1 gate in days. |
| `progressiveAssignment.phase2DurationDays` | **60** | Days at which all gates are removed. |
| `progressiveAssignment.teamLeaderVisibilityDays` | **60** | Days for which `newAnalystFlag` is shown to Team Leader. |

### 26.6 Operational Passport Integration

The `firstAssignmentAt` timestamp and the case count, type distribution, and complexity progression within the first 60 days are recorded in the Operational Passport as the analyst's `operationalOnsetRecord`. This provides a clean baseline for all subsequent progression metrics — rank criteria, specialism thresholds, and RDS computations are all measured from `firstAssignmentAt`, not from account creation date.

---

## 27. Cross-Tenant Institutional Memory Engine

### 27.1 Purpose and Scope

Every Commander SDR tenant operates with full data isolation — tenant case data, entity data, and configuration data never cross tenant boundaries under any circumstances. The Cross-Tenant Institutional Memory Engine operates on anonymised pattern signatures extracted from resolved case data, not on case content. The pattern store is a platform-level service, not a tenant-level service.

When a new case opens in any tenant, the engine can surface: how many times this condition type has been seen across the platform, what resolution paths have been used, which resolution paths produced the highest durability, and what the typical time-to-close has been. None of this reveals which tenant, which asset, which identity, or any case content.

### 27.2 Architecture — Two-Layer Model

```
Tenant Layer (isolated)                 Platform Layer (anonymised)
────────────────────────                ──────────────────────────
Tenant A case data         ──extract──► PatternSignature A1
Tenant B case data         ──extract──► PatternSignature B1   ──► PatternStore
Tenant C case data         ──extract──► PatternSignature C1

                                             │
                           ◄──query──────────┘
                           PatternMatchResults (no tenant attribution)
```

### 27.3 Pattern Signature — What Is Extracted

When a case is closed, the system extracts a `PatternSignature`. Extraction is automatic. No analyst or SOM action required. The signature contains:

```json
{
  "signatureId":          "uuid (new, not case ID)",
  "conditionType":        "string — rule model category (e.g. 'identity.mfa_disabled')",
  "assetTypeCategory":    "string — normalised asset class (e.g. 'cloud.identity.admin_account')",
  "attackSurfaceClass":   "string — external | perimeter | internal | restricted",
  "casePriority":         "P1 | P2 | P3 | P4",
  "resolutionPath":       "string[] — ordered sub-case types executed (e.g. ['Push','Manual'])",
  "resolutionPathHash":   "string — SHA-256 of ordered resolution path for clustering",
  "timeToCloseHours":     "number",
  "crsAtOpen":            "number",
  "crsAtClose":           "number",
  "durabilityOutcome":    "durable | partial | recurred | pending",
  "recurrenceIntervalDays": "number | null (days from prior closure of same conditionType on same assetTypeCategory)",
  "contributedAt":        "date-time",
  "platformVersion":      "string"
}
```

**What is explicitly excluded from the signature:** tenant ID, case ID, asset ID, entity name, user ID, IP address, hostname, any free text from case notes, any field that could identify the tenant or the affected entity.

### 27.4 Pattern Store Service

The Pattern Store is a platform-level service (not deployed per-tenant) that:

- Accepts `PatternSignature` contributions from all tenants on case closure.
- Indexes signatures by `conditionType`, `assetTypeCategory`, `resolutionPathHash`, and `durabilityOutcome`.
- Serves `PatternMatchQuery` requests from all tenants when a new case opens.
- Applies a minimum population threshold: a pattern is not surfaced in queries until it has at least `N` contributing signatures (default: 5) from at least `M` distinct tenants (default: 3). This prevents any single tenant's data from dominating cross-tenant pattern results.

### 27.5 Pattern Match — What Tenants Receive

When a new case opens, the Case Engine queries the Pattern Store with the case's `conditionType` and `assetTypeCategory`. The response contains:

```json
{
  "conditionType":    "identity.mfa_disabled",
  "assetTypeCategory": "cloud.identity.admin_account",
  "populationCount":  847,
  "tenantCount":      "31+ tenants",
  "medianTimeToCloseHours": 18.4,
  "p90TimeToCloseHours":    72.1,
  "topResolutionPaths": [
    {
      "path":            ["Push", "Manual"],
      "frequency":       0.62,
      "medianDurability": "durable",
      "medianCRSReduction": 41
    },
    {
      "path":            ["Investigation", "Push", "Manual"],
      "frequency":       0.28,
      "medianDurability": "durable",
      "medianCRSReduction": 58
    }
  ],
  "recurrenceProfile": {
    "recurrenceRate":          0.23,
    "medianRecurrenceDays":    44,
    "recurrenceRateIfPushOnly": 0.41
  }
}
```

No tenant attribution. No case IDs. No entity data. Aggregated statistics only.

### 27.6 Surfacing in Commander SDR

Pattern match results are surfaced in two places:

**Case detail view — Institutional Memory Panel (new panel on case detail):**

```
Platform Intelligence — identity.mfa_disabled on admin accounts
  Seen across 847 cases on 31+ tenants

  Typical resolution:
    Push + Manual cleanup — 62% of resolutions — durable in 91% of cases
    Median time to close: 18 hours

  Recurrence insight:
    23% of cases recur. Median recurrence interval: 44 days.
    Push-only resolutions recur at nearly double the rate (41%).
    Recommendation: include manual group hygiene sub-case for durability.

  ⓘ Data is anonymised cross-platform intelligence. No tenant attribution.
```

**CAA integration:** If the platform intelligence indicates that a specific resolution path has significantly higher durability (e.g. `[Push, Manual]` vs `[Push]` alone), the CAA applies a `platformDurabilityAdjustment` to the `confidence` field of relevant sub-cases. This nudges the ranking toward the more durable path without overriding analyst judgement.

### 27.7 Opt-In Governance

Cross-tenant pattern contribution is opt-in at the tenant level. Default is opted-in for new tenants. Platform Administrators may opt out in **Platform Administration → Privacy and Data Sharing → Institutional Memory**. Opting out means the tenant's closed case signatures are not contributed to the Pattern Store. The tenant can still receive pattern match results from other tenants' contributions.

Opting out of both contribution and query is available. A tenant that opts out entirely receives no platform intelligence but their data is not shared.

Opt-in/opt-out status is recorded in the tenant configuration and is auditable.

---

## 28. Case Association and Pattern Engine

### 28.1 Purpose

Cases do not exist in isolation but the platform currently treats them as if they do. The Case Association and Pattern Engine continuously analyses all open and recently closed cases within a tenant for structural, temporal, resolution-path, and thematic relationships — surfacing explicit connections, proactive sweep recommendations, and root cause hypotheses. Everything is algorithmic. No language model is required for core function. Commander AI may optionally enrich outputs with natural language summaries.

### 28.2 Four Signal Types

#### Signal Type 1 — Structural Clustering (Deterministic)

Cases sharing the same rule model ID, the same affected entity ID, or the same connector and finding type are structurally associated. This is a join on identifiers already in the data model — no inference required.

**Association rule:**
```
if case_A.triggeringRuleId == case_B.triggeringRuleId
   AND overlap(case_A.affectedEntityIds, case_B.affectedEntityIds) > 0:
     associate(case_A, case_B, type="structural", strength="high")

if case_A.sourceConnectorId == case_B.sourceConnectorId
   AND case_A.conditionType == case_B.conditionType
   AND case_A.affectedEntityIds ∩ case_B.affectedEntityIds == ∅:
     associate(case_A, case_B, type="structural", strength="medium")
     note: "Same condition type on different entities via same connector — potential systematic issue"
```

**Output:** Explicit case links with `associationType: structural`. Shown on case detail and in Case Pulse Resonance Panel.

#### Signal Type 2 — Resolution Path Similarity (Algorithmic)

If two cases were resolved by the same ordered sequence of sub-case types, they likely share a root cause even if their affected entities are different.

**Computation:**
```
resolutionPathHash(case) = SHA-256(ordered list of completed subCase.type values)

for each pair of closed cases (case_A, case_B) within lookback window (default: 90 days):
  if case_A.resolutionPathHash == case_B.resolutionPathHash
     AND case_A.conditionType == case_B.conditionType:
       associate(case_A, case_B, type="resolution_path", strength="medium")
       flag for root cause hypothesis generation
```

**Output:** Case clusters grouped by resolution path hash. The SOM can see: "7 cases in the last 90 days resolved via the same three-step sequence. Possible shared root cause." One-click Commander AI request to analyse the cluster for common cause.

#### Signal Type 3 — Temporal Interval Mining (Statistical)

The system mines its own case history to compute expected recurrence intervals — no external calendar or change management system required.

**Per condition type, per asset category, compute:**
```
recurrenceIntervals[] = [days between closure and reopening of same conditionType
                         on same or overlapping entity set, across all historical cases]

if len(recurrenceIntervals) >= 5:
  meanInterval    = mean(recurrenceIntervals)
  stddevInterval  = stddev(recurrenceIntervals)
  lastClosureDate = most recent closure date of this conditionType on this asset category

  daysSinceLastClosure = today − lastClosureDate
  projectedRecurrenceIn = meanInterval − daysSinceLastClosure

  if projectedRecurrenceIn <= sweepLeadTimeDays (default: 7):
    generate ProactiveSweepRecommendation
```

**ProactiveSweepRecommendation:**

```
Case Association Engine — Proactive Sweep Recommendation
  Condition type:   identity.mfa_disabled on cloud admin accounts
  Historical pattern:  recurred 4 times · mean interval 44 days ± 8 days
  Last closure:     38 days ago
  Projected window: recurrence likely within 6 days

  Recommended action: Proactive identity sweep on cloud admin accounts
  [Trigger sweep]  [Dismiss for 14 days]  [View historical cases]
```

Sweep recommendations appear in Case Pulse under a dedicated **Proactive Intelligence** panel.

#### Signal Type 4 — Thematic Note Clustering (OpenSearch TF-IDF)

Case notes are free text written by analysts during investigation. They are already indexed in OpenSearch (existing architecture). The engine runs TF-IDF analysis across the corpus of open case notes to surface shared themes — without requiring a language model.

**Process:**
```
Periodically (default: every 6 hours):
  Fetch all case notes for open cases from OpenSearch
  Run TF-IDF against the note corpus
  Extract top N terms per case (N=10)
  Cluster cases that share ≥ K high-weight terms (K=3, configurable)
  Surface clusters where ≥ 3 cases share the same thematic cluster
  Generate ThematicAssociation record with shared terms and case list
```

**Example output in Case Pulse:**

```
Thematic Association Detected — 5 cases
  Shared terms: "terraform", "cron", "scheduled job"
  Cases: SDR-9001 SDR-9034 SDR-9038 SDR-9044 SDR-9051

  These cases share investigation notes referencing Terraform and scheduled jobs.
  Possible common cause: a recurring automated configuration change.
  [Request Commander analysis]  [Create linked workstream]  [Dismiss]
```

**What TF-IDF does not do:** It does not understand meaning. "Terraform" and "scheduled job" are frequent terms across these notes — not interpreted, just statistically prominent. Commander AI interprets the cluster if the SOM requests it. The engine only surfaces the statistical signal.

### 28.3 Association Strength Model

Associations are scored by strength. Higher strength associations are shown more prominently in Case Pulse and on case detail views.

| Strength | Criteria | Display |
|---|---|---|
| `critical` | Structural + resolution path match on same entities — near-certain relationship | Red indicator. SOM alert. |
| `high` | Structural clustering (same rule + entity overlap) OR temporal projection within 3 days | Amber indicator. Case Pulse panel. |
| `medium` | Resolution path similarity OR temporal projection 4–7 days out | Yellow indicator. Case detail association panel. |
| `low` | Thematic note clustering only | Blue indicator. Informational only. |

### 28.4 Case Association Panel — Case Detail View

Every case detail view includes a new **Association Panel** showing all associations for that case:

```
Associations — SDR-9001

  ● Critical  SDR-9034  Structural — same rule, same entity (user@company.com)
                        Resolution path match — [Push, Manual] both cases
  ◑ High      SDR-9038  Structural — same connector, same conditionType, different entity
  ◑ High      Proactive sweep due in 6 days — temporal projection (4 prior occurrences)
  ◔ Medium    SDR-9044  Resolution path match — [Investigation, Push, Manual]
  ◌ Low       SDR-9044 SDR-9051 SDR-9055  Thematic — "terraform", "cron", "scheduled job"

  [Request Commander root cause analysis on cluster]
```

### 28.5 Proactive Intelligence Panel in Case Pulse

Case Pulse includes a dedicated **Proactive Intelligence** panel below the Resonance Panel:

```
Proactive Intelligence

  Upcoming sweep recommendations (temporal projections):
    identity.mfa_disabled · cloud admin accounts  — projected recurrence in 6 days  [Trigger sweep]
    network.firewall_rule_change · perimeter       — projected recurrence in 12 days [View]

  Active thematic clusters:
    "terraform / cron / scheduled job"  — 5 cases  [View cluster]  [Commander analysis]
    "azure ad / conditional access"     — 3 cases  [View cluster]

  Root cause hypotheses pending Commander review:
    7 cases share resolution path [Push, Manual] on identity.mfa_disabled  [Analyse cluster]
```

### 28.6 Commander AI Integration (Optional)

The Case Association and Pattern Engine is fully functional without Commander AI. When the SOM or analyst requests Commander analysis of a cluster, Commander receives:

- The cluster's association type and strength
- The shared signal (rule IDs, resolution path hash, temporal interval, TF-IDF terms)
- The case list with their current CRS and status

Commander generates a root cause hypothesis in natural language: "These 7 cases share the same detection rule and resolution path. The pattern suggests a recurring process is resetting a configuration that SDR's push is correctly enforcing. The root cause may be an automation job or policy sync overwriting the remediated state — consistent with the 44-day average recurrence interval."

This is the Commander AI enrichment layer on top of the algorithmic signal, not the source of the signal itself.

### 28.7 SOMConfig Keys

| Key | Default | Description |
|---|---|---|
| `caseAssociation.enabled` | `true` | Enable/disable the full Case Association and Pattern Engine. |
| `caseAssociation.structuralClusteringEnabled` | `true` | Enable Signal Type 1. |
| `caseAssociation.resolutionPathEnabled` | `true` | Enable Signal Type 2. |
| `caseAssociation.temporalMiningEnabled` | `true` | Enable Signal Type 3. |
| `caseAssociation.thematicClusteringEnabled` | `true` | Enable Signal Type 4. |
| `caseAssociation.temporalLookbackDays` | **365** | Case history window for temporal interval computation. |
| `caseAssociation.temporalMinSampleSize` | **5** | Minimum prior recurrences before temporal projection is generated. |
| `caseAssociation.sweepLeadTimeDays` | **7** | Days before projected recurrence that sweep recommendation fires. |
| `caseAssociation.thematicRefreshHours` | **6** | How often TF-IDF note clustering runs. |
| `caseAssociation.thematicMinSharedTerms` | **3** | Minimum shared high-weight terms to form a thematic cluster. |
| `caseAssociation.thematicMinCaseCount` | **3** | Minimum cases in a thematic cluster before surfacing. |
| `caseAssociation.resolutionPathLookbackDays` | **90** | Window for resolution path similarity analysis. |

---

## 29. Updated SOMConfig Keys — Full Enhancement Register

The following keys extend Section 4.6 and Section 24 to reflect all committed enhancements. All are configurable in the SOM Configuration Panel with versioning and audit trail.

```json
{
  "progressiveAssignment": {
    "phase1MaxImpactWeight":       4,
    "phase2MaxImpactWeight":       7,
    "phase1DurationDays":          30,
    "phase2DurationDays":          60,
    "teamLeaderVisibilityDays":    60,
    "complexityGateOverride":      false
  },
  "institutionalMemory": {
    "contributionOptIn":           true,
    "queryOptIn":                  true,
    "platformMinPopulation":       5,
    "platformMinTenantCount":      3
  },
  "caseAssociation": {
    "enabled":                     true,
    "structuralClusteringEnabled": true,
    "resolutionPathEnabled":       true,
    "temporalMiningEnabled":       true,
    "thematicClusteringEnabled":   true,
    "temporalLookbackDays":        365,
    "temporalMinSampleSize":       5,
    "sweepLeadTimeDays":           7,
    "thematicRefreshHours":        6,
    "thematicMinSharedTerms":      3,
    "thematicMinCaseCount":        3,
    "resolutionPathLookbackDays":  90
  }
}
```

---

## 30. Acceptance Criteria — Final Enhancement Set

### Epic O — Progressive Complexity Assignment

**O1: Assignment Age Gate**
- AC: `firstAssignmentAt` is set on first sub-case auto-assignment. Never modified after setting.
- AC: Day 0–30: only sub-cases with `impactWeight ≤ 4` auto-assigned. Higher-weight sub-cases remain visible in queue for self-assignment.
- AC: Day 31–60: gate relaxes to `impactWeight ≤ 7`.
- AC: Day 61+: no gate applied. No flag, no notification, no SOM action required.
- AC: SOM `complexityGateOverride: true` removes all gates for specified analyst. Override logged in audit trail.
- Test: Set `firstAssignmentAt` to 15 days ago. Attempt to auto-assign sub-case with `impactWeight = 6`. Assert: not auto-assigned. Assert: visible in queue. Assert: self-assignment permitted.

**O2: Team Leader Visibility**
- AC: All sub-cases assigned to analysts with `assignmentAgeDays < 60` carry `newAnalystFlag: true`.
- AC: Flag visible to Team Leader in team view as `▲` indicator with day count.
- AC: Flag disappears automatically at `assignmentAgeDays = 60`. No SOM action required.

### Epic P — Cross-Tenant Institutional Memory

**P1: Pattern Signature Extraction**
- AC: Pattern signature extracted on every case closure. Signature contains no tenant ID, case ID, entity name, or any identifying field.
- AC: Signature contains only: conditionType, assetTypeCategory, attackSurfaceClass, priority, resolutionPathHash, timeToClose, crsAtOpen, crsAtClose, durabilityOutcome, recurrenceIntervalDays.
- AC: Signatures are contributed to Platform Pattern Store only when tenant `contributionOptIn: true`.

**P2: Pattern Match Query**
- AC: On new case creation, Pattern Store is queried with conditionType and assetTypeCategory.
- AC: Query returns results only when population ≥ 5 signatures from ≥ 3 distinct tenants.
- AC: Results contain no tenant attribution. Aggregated statistics only.
- AC: Institutional Memory Panel rendered on case detail when pattern match exists.

**P3: CAA Integration**
- AC: `platformDurabilityAdjustment` applied to sub-case `confidence` when platform intelligence indicates a higher-durability alternative path exists.
- AC: Adjustment is visible in CAA explanation output: "Confidence adjusted +0.08 — platform intelligence: this path has 23% higher durability than push-only resolution."

**P4: Opt-In Governance**
- AC: Tenant can opt out of contribution and/or query independently.
- AC: Opt-out takes effect immediately. No further signatures contributed after opt-out.
- AC: Opt-out status recorded in tenant configuration and audit trail.

### Epic Q — Case Association and Pattern Engine

**Q1: Structural Clustering**
- AC: Structural association created within one ingestion cycle when two open cases share a rule ID and entity ID.
- AC: Associations shown on case detail Association Panel and in Case Pulse Resonance Panel.
- AC: Association strength correctly classified (critical/high/medium/low).

**Q2: Resolution Path Similarity**
- AC: Resolution path hash computed on every case closure. Hash is deterministic for identical ordered sub-case type sequences.
- AC: Cases within lookback window sharing resolution path hash and conditionType are associated as `resolution_path`.
- AC: Clusters of ≥ 3 cases surfaced in Case Pulse with one-click Commander analysis.

**Q3: Temporal Interval Mining**
- AC: Recurrence interval computed for conditionType × assetTypeCategory pairs with ≥ 5 prior occurrences.
- AC: ProactiveSweepRecommendation generated when projected recurrence is within `sweepLeadTimeDays`.
- AC: Recommendation includes: conditionType, sample size, mean interval, stddev, last closure date, projected days remaining.
- AC: SOM can dismiss recommendation for configurable period (14 days default) or trigger sweep immediately.
- Test: Create 5 historical cases of same conditionType on same assetTypeCategory with closures 40, 43, 46, 44, 42 days prior to recurrence. Set `sweepLeadTimeDays = 7`. Simulate last closure 38 days ago. Assert: mean interval ≈ 43 days, projected recurrence in ≈ 5 days, ProactiveSweepRecommendation generated.

**Q4: Thematic Note Clustering**
- AC: TF-IDF runs every `thematicRefreshHours` against OpenSearch case note index.
- AC: Clusters of ≥ `thematicMinCaseCount` cases sharing ≥ `thematicMinSharedTerms` high-weight terms are surfaced.
- AC: Thematic clusters shown in Proactive Intelligence panel with shared terms listed and case count.
- AC: Disabling `thematicClusteringEnabled` stops TF-IDF runs. Existing cluster records remain visible until dismissed.


---

## 31. Commander Thematic Intelligence Engine

### 31.1 Purpose and Architectural Position

Individual analysts see their own case queues. The SOM sees all cases across the operation. Neither sees the causal structure that connects heterogeneous cases — cases of different types, in different queues, assigned to different analysts — that share a common origin. A configuration drift case, an architecture review, a Commander Review, and an identity escalation may all be symptoms of the same root cause event. No individual analyst encounters all four. No algorithmic signal connects them because their surface attributes are dissimilar.

The Commander Thematic Intelligence Engine gives the SOM a capability that no individual analyst has: Commander AI reasons across a curated candidate set of cases — constructed by the algorithmic association engine — and identifies thematic coherence, proposes a root cause hypothesis, and surfaces this as a governed **Thematic Incident Hypothesis** for SOM action.

**Architectural separation from the Case Association and Pattern Engine (Section 28):**

The algorithmic engine (Section 28) finds candidates through deterministic and statistical signals — same rule, same entity, same resolution sequence, overlapping note terms. It does not reason. It clusters.

The Commander Thematic Intelligence Engine receives those clusters as structured input and reasons over them. It answers the question the algorithm cannot: *why* are these cases connected, what is the probable common origin, and what is the appropriate response at fleet level?

These two engines are complementary and sequential. The algorithm finds. Commander explains. Neither replaces the other.

### 31.2 Context Construction Model

Commander's existing grounding pipeline (MTS Section 11, Spec #13) constructs a context for a single case. Thematic Intelligence requires a multi-case context. The context construction model for thematic analysis is distinct and governed separately.

**Input to Commander — ThematicAnalysisContext:**

```json
{
  "contextType":        "thematic_analysis",
  "candidateCluster": {
    "clusterId":        "string (generated by Section 28 engine)",
    "clusterSignal":    "structural | resolution_path | temporal | thematic | mixed",
    "clusterStrength":  "critical | high | medium | low",
    "caseCount":        "integer",
    "cases": [
      {
        "caseId":            "string",
        "caseType":          "string",
        "conditionType":     "string",
        "priority":          "string",
        "status":            "string",
        "casePhase":         "string",
        "crs":               "number",
        "momentumScore":     "number",
        "affectedEntitySummary": "string (entity types and count — no names)",
        "triggeringRuleId":  "string",
        "resolutionPathHash": "string",
        "completedSubCaseTypes": "string[]",
        "architectureReviewRequired": "boolean",
        "commanderAssessmentSummary": "string (most recent Commander output for this case, truncated to 500 chars)",
        "trailHighlights":   "string[] (significant trail events: escalations, stall events, phase transitions)",
        "caseNotesKeyTerms": "string[] (top TF-IDF terms from this case's notes)",
        "openDays":          "integer",
        "stallingFlag":      "boolean",
        "recurrenceOfCaseId": "string | null"
      }
    ],
    "sharedSignals": {
      "sharedRuleIds":          "string[]",
      "sharedEntityTypes":      "string[]",
      "sharedResolutionPaths":  "string[]",
      "sharedNoteTerms":        "string[]",
      "temporalPatternSummary": "string | null"
    }
  },
  "estateContext": {
    "recentChangeEvents":     "string[] (derived from case trail — push executions, baseline changes in last 30d)",
    "recentArchitectureFlags": "integer (cases with architecture_review_required opened in last 14d)",
    "recentCommanderReviews": "integer (commander_review cases opened in last 14d)"
  }
}
```

**What is excluded from Commander's thematic context:**

- Asset hostnames, IP addresses, usernames, email addresses, or any directly identifying entity data.
- Case notes verbatim — only TF-IDF key terms are included.
- Data from cases not in the candidate cluster — Commander does not search the full case corpus autonomously.
- Data from other tenants — the thematic analysis context is strictly tenant-scoped.

**Context size governance:** The ThematicAnalysisContext is bounded. Maximum 20 cases per cluster submitted to Commander in a single analysis. If a cluster exceeds 20 cases, the algorithmic engine selects the 20 with the highest association strength and highest CRS. Larger clusters are split into sub-clusters with a note: "Cluster exceeds analysis window. Sub-cluster 1 of N submitted."

### 31.3 Thematic Incident Hypothesis Schema

Commander's output from a thematic analysis is a structured **Thematic Incident Hypothesis (TIH)**, not a free-text response.

```json
{
  "hypothesisId":       "string (UUID)",
  "clusterId":          "string (links to triggering Section 28 cluster)",
  "tenantId":           "string",
  "generatedAt":        "date-time",
  "commanderModelRef":  "string (model provider and version used)",
  "status":             "string (enum: Pending, Accepted, Modified, Rejected, Expired)",

  "thematicTitle":      "string (max 80 chars — SOM-readable headline)",
  "rootCauseHypothesis": "string (max 500 chars — Commander's reasoned explanation)",
  "confidence":         "string (enum: High | Medium | Low)",
  "confidenceRationale": "string (max 200 chars — why Commander assigned this confidence level)",

  "evidenceReferences": [
    {
      "caseId":        "string",
      "evidenceType":  "string (enum: structural_match | resolution_pattern | temporal_signal | thematic_term | commander_assessment)",
      "evidenceDetail": "string (max 150 chars — specific supporting signal)"
    }
  ],

  "caseTypes":          "string[] (distinct case types in this cluster)",
  "crossQueueFlag":     "boolean (true if cluster spans more than one case queue)",
  "architectureFlag":   "boolean (true if Commander identifies a design-level root cause)",
  "incidentFlag":       "boolean (true if Commander assesses this as a potential active security incident rather than drift)",

  "recommendedResponse": {
    "action":    "string (enum: ConsolidateWorkstream | EscalateToArchitecture | InitiateCommanderReview | TriggerProactiveSweep | DeclareIncident | MonitorOnly)",
    "rationale": "string (max 300 chars)",
    "urgency":   "string (enum: Immediate | WithinSLAWindow | Planned)"
  },

  "somDecision": {
    "decidedBy":   "string (user ID)",
    "decidedAt":   "date-time",
    "decision":    "string (enum: Accepted | Modified | Rejected)",
    "modification": "string | null (SOM's modifications if decision = Modified)",
    "rationale":   "string (mandatory for Rejected; optional for Accepted)"
  },

  "expiresAt": "date-time (hypothesis expires if no SOM decision within 72 hours — configurable)"
}
```

### 31.4 Commander Thematic Intelligence — SOM Dashboard Panel

The SOM Dashboard contains a dedicated **Thematic Intelligence** panel. This is distinct from the Proactive Intelligence panel (Section 28.5) — that panel surfaces algorithmic projections. This panel surfaces Commander-reasoned hypotheses.

```
Thematic Intelligence                                    [Configure]  [View history]

Active hypotheses (2):

┌──────────────────────────────────────────────────────────────────────────────┐
│ ⚠ HIGH CONFIDENCE                                         Generated 14 mins ago │
│                                                                                │
│ Identity Access Policy Automation Overwrite                                    │
│                                                                                │
│ 6 cases across Security Operations, Identity, and Architecture queues share   │
│ a common pattern: conditional access policies are being enforced by Commander  │
│ SDR push and then overwritten within 30–48 hours. Evidence across case trails  │
│ and resolution histories suggests an automated synchronisation process is      │
│ resetting these policies. Three Commander Reviews from the last 14 days        │
│ raised architecture flags on the same policy scope.                            │
│                                                                                │
│ Root cause hypothesis: An Entra ID policy sync automation job is overriding    │
│ manually-enforced conditional access rules. The job appears to run on a        │
│ 36–48 hour cycle based on the recurrence interval observed across case trails. │
│                                                                                │
│ Confidence: HIGH                                                               │
│ Evidence: 6 structural matches · 4 resolution path matches · 3 Commander      │
│ Reviews with architecture flags · Temporal interval 36–48h consistent          │
│                                                                                │
│ Recommended response: Escalate to Architecture — design-level root cause.      │
│ Urgency: Within SLA window.                                                    │
│                                                                                │
│ Cases: SDR-9001 SDR-9034 SDR-9038 SDR-9044 SDR-9051 SDR-9055                 │
│                                                                                │
│ [Accept — Escalate to Architecture]  [Modify]  [Reject]  [View evidence]      │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ ○ MEDIUM CONFIDENCE                                       Generated 2 hrs ago  │
│                                                                                │
│ Endpoint Guardrail Erosion — Possible Policy Rollout Side Effect               │
│                                                                                │
│ 4 cases across Endpoint Operations queue share drift findings on the same      │
│ guardrail category. Case notes across all four reference a recent MDM policy   │
│ update. The temporal clustering is consistent with a policy rollout event.     │
│                                                                                │
│ Confidence: MEDIUM — insufficient Commander Review history to confirm design   │
│ intent. May be expected drift from a known change.                             │
│                                                                                │
│ Recommended response: Monitor Only — gather one more case cycle before         │
│ escalation. Set 48h review reminder.                                           │
│                                                                                │
│ Cases: SDR-9060 SDR-9061 SDR-9063 SDR-9067                                    │
│                                                                                │
│ [Accept — Monitor]  [Modify]  [Reject]  [View evidence]                       │
└──────────────────────────────────────────────────────────────────────────────┘

Expired / resolved (last 7 days): 8   [View history]
```

### 31.5 SOM Governance Actions

Every SOM decision on a Thematic Incident Hypothesis is a governed action with mandatory audit trail entry.

**Accept:** SOM accepts the hypothesis and the recommended response. Commander executes the response action (e.g. creates a consolidated workstream, initiates a Commander Review, flags cases for architecture escalation). All actions taken as a result of an accepted TIH are linked to the `hypothesisId` in the audit trail.

**Modify:** SOM accepts the hypothesis but changes the recommended response or the case grouping. Modification text is mandatory. The modified response is executed. The original Commander recommendation and the SOM modification are both preserved in the audit record.

**Reject:** SOM dismisses the hypothesis. Rejection rationale is mandatory (minimum 20 characters). The rejected hypothesis is preserved in history. If the same cluster generates a new hypothesis within 14 days (because new cases join the cluster), the SOM is shown: "A similar hypothesis was rejected [N] days ago. Rejection reason: [text]. Review before deciding."

**Expiry:** If no SOM decision is made within the expiry window (default: 72 hours, configurable), the hypothesis expires automatically. Expired hypotheses are retained in history. Expiry does not delete the underlying cluster — it may generate a new hypothesis if the cluster grows or signals strengthen.

### 31.6 Response Actions — What Acceptance Triggers

| Recommended Response | What Happens on Accept |
|---|---|
| `ConsolidateWorkstream` | Commander creates a parent workstream case linking all cluster cases as sub-cases. SOM selects the workstream owner. |
| `EscalateToArchitecture` | All cluster cases receive `architecture_review_required: true`. An Architecture queue case is created linking all cluster cases. |
| `InitiateCommanderReview` | Commander generates a deep-analysis review proposal for the SOM covering all cluster cases. The review enters the Commander Review acceptance workflow. |
| `TriggerProactiveSweep` | The SOM selects the scope for a proactive detection sweep targeting the conditions identified in the hypothesis. |
| `DeclareIncident` | The SOM is taken to the case swarm initiation flow with the cluster cases pre-selected. The Security Incident Referral (SIR) workflow is initiated. |
| `MonitorOnly` | No immediate action. A 48-hour review reminder is set in Case Pulse. If the cluster grows, a new hypothesis is triggered. |

### 31.7 Thematic Intelligence Generation Triggers

A Thematic Intelligence analysis is triggered when any of the following conditions are met:

| Trigger | Condition |
|---|---|
| Cluster strength escalation | A Section 28 cluster's association strength increases from medium to high or high to critical. |
| Cross-queue cluster | A Section 28 cluster spans more than one case queue and contains ≥ 3 cases. |
| Commander Review correlation | A new Commander Review case opens on an entity or condition type that matches an existing algorithmic cluster. |
| Architecture flag correlation | A new `architecture_review_required` flag is set on a case that matches an existing cluster by rule ID or entity type. |
| Temporal projection + structural | A temporal ProactiveSweepRecommendation fires on a condition type that has ≥ 2 open cases with structural association. |
| SOM manual request | SOM selects any algorithmic cluster in the Proactive Intelligence panel and clicks "Request Commander thematic analysis." |

Analysis is not triggered on every cluster — only when the trigger conditions indicate sufficient signal that a thematic pattern is likely meaningful. This prevents hypothesis fatigue.

### 31.8 Grounding Rules Extension for Thematic Analysis

Commander's grounding rules (MTS Section 11, Spec #13) are extended for thematic analysis mode:

**Permitted in thematic context:**
- Reasoning across the provided multi-case ThematicAnalysisContext.
- Inferring probable causal connections from structural, temporal, and resolution signals.
- Proposing root cause hypotheses at confidence levels (High/Medium/Low) with stated rationale.
- Recommending response actions from the defined `recommendedResponse.action` enumeration.

**Prohibited in thematic context:**
- Speculating about cases not included in the ThematicAnalysisContext.
- Asserting facts about external systems, processes, or actors not evidenced in the provided context.
- Producing a hypothesis with `confidence: High` when fewer than 3 distinct evidence types support it.
- Recommending `DeclareIncident` unless `incidentFlag: true` is warranted by evidence of active exploitation or active compromise indicators in the case trails.

**Confidence assignment rules:**

| Confidence | Required evidence |
|---|---|
| High | ≥ 3 distinct evidence types (e.g. structural match + temporal signal + Commander Review correlation). Consistent signal across all cluster cases. |
| Medium | 2 evidence types, or 3 evidence types with inconsistencies across cluster cases. |
| Low | 1 evidence type, or multiple types with significant inconsistency. |

If Commander cannot meet the Low confidence threshold, it must return: `"Insufficient evidence to form a thematic hypothesis. Recommend: allow cluster to grow before re-analysis."` This is a valid and expected output — it is not a failure.

### 31.9 History and Learning

All TIHs — accepted, modified, rejected, and expired — are retained in `ThematicHypothesisHistory` indefinitely. This history serves two purposes:

**SOM review awareness:** When a new TIH is generated for a cluster that resembles a previously rejected hypothesis, the prior rejection and its rationale are surfaced. The SOM is not shown the same hypothesis twice without knowing the history.

**Pattern quality feedback (future):** Accepted TIHs where the recommended response produced a confirmed resolution contribute to a quality signal for the thematic analysis engine. This is a Phase 3+ capability — the feedback loop requires sufficient TIH volume to be meaningful. The data model supports it from Phase 1.

### 31.10 SOMConfig Keys

| Key | Default | Description |
|---|---|---|
| `thematicIntelligence.enabled` | `true` | Enable/disable the Commander Thematic Intelligence Engine. |
| `thematicIntelligence.maxCasesPerContext` | `20` | Maximum cases submitted to Commander per analysis. |
| `thematicIntelligence.hypothesisExpiryHours` | `72` | Hours before an undecided TIH expires. |
| `thematicIntelligence.rejectionMemoryDays` | `14` | Days within which a re-triggered similar hypothesis surfaces the prior rejection. |
| `thematicIntelligence.minEvidenceTypesForHigh` | `3` | Minimum distinct evidence types for High confidence assignment. |
| `thematicIntelligence.minEvidenceTypesForMedium` | `2` | Minimum for Medium confidence. |
| `thematicIntelligence.crossQueueMinCases` | `3` | Minimum cases for cross-queue trigger. |
| `thematicIntelligence.monitorReminderHours` | `48` | Review reminder window when `MonitorOnly` response is accepted. |
| `thematicIntelligence.incidentFlagRequiresExplicit` | `true` | `DeclareIncident` recommendation requires explicit active compromise evidence. |

### 31.11 Acceptance Criteria — Epic R

**R1: Context Construction**
- AC: ThematicAnalysisContext contains no entity names, hostnames, IP addresses, usernames, or case note verbatim text.
- AC: Context is bounded at `maxCasesPerContext` cases. Clusters exceeding this are split into sub-clusters.
- AC: Context includes all required fields per schema in Section 31.2. Missing required fields cause analysis to abort with a structured error, not a malformed Commander request.

**R2: Hypothesis Generation**
- AC: Commander returns a structured TIH conforming to the schema in Section 31.3 on every successful analysis.
- AC: Confidence is assigned per the evidence type rules in Section 31.8. High confidence requires ≥ 3 distinct evidence types — enforced by validation on the returned schema before storage.
- AC: When evidence is insufficient, Commander returns the defined insufficiency message. This is stored as a `status: Insufficient` TIH record, not an error.
- AC: `DeclareIncident` recommendation is only produced when `incidentFlag: true` AND evidence of active exploitation is present in the context.

**R3: SOM Governance**
- AC: Accept, Modify, and Reject actions all write audit trail entries with actor, timestamp, decision, and rationale.
- AC: Reject requires mandatory rationale ≥ 20 characters. Submission blocked without it.
- AC: Hypothesis expiry fires automatically at `hypothesisExpiryHours`. Expired TIH retained in history.
- AC: Re-triggered similar hypothesis surfaces prior rejection rationale. Tested by: reject TIH, advance time by < `rejectionMemoryDays`, trigger same cluster analysis, assert prior rejection shown.

**R4: Response Action Execution**
- AC: `ConsolidateWorkstream` creates a correctly structured parent case with all cluster cases linked as sub-cases.
- AC: `EscalateToArchitecture` sets `architecture_review_required: true` on all cluster cases and creates a linked Architecture queue case.
- AC: `InitiateCommanderReview` generates a Commander Review proposal visible in the Commander Review acceptance workflow.
- AC: All executed response actions reference `hypothesisId` in their audit trail entries.

**R5: SOM Dashboard Panel**
- AC: Thematic Intelligence panel is distinct from and positioned separately to the Proactive Intelligence panel.
- AC: Hypotheses are ordered: Critical/High confidence first, then by `generatedAt` descending.
- AC: Each hypothesis card shows: confidence badge, title, root cause summary, case count, case IDs, recommended response, and three action buttons (Accept / Modify / Reject).
- AC: "View evidence" shows the full evidenceReferences array with evidence type and detail per case.
- AC: History view shows all TIHs in the last N days (configurable, default 30) with their final status and SOM decision.

---

## 32. Final SOMConfig Master Register

The complete SOMConfig key register, combining all sections committed across Spec #8 versions 1.0–1.3. This is the authoritative reference for Spec #13 (SOM Configuration Panel) and for the SOMConfig Drizzle schema in Spec #5.

```json
{
  "tenantId":    "string",
  "version":     "integer (monotonically increasing)",
  "effectiveAt": "date-time",
  "changedBy":   "string",
  "changeReason":"string (min 20 chars)",

  "crsWeights": {
    "w_B": 3, "w_E": 3, "w_I": 2, "w_C": 2, "w_A": 1, "w_T": 2
  },
  "momentumCoefficients": {
    "alpha": 1.0, "beta": 2.0, "gamma": 1.5, "momentumWindowHours": 72
  },
  "wcsCoefficients": {
    "lambda1": 0.6, "lambda2": 0.3, "lambda3": 0.1,
    "wcsDisqualifyThreshold": 20
  },
  "assignmentWeights": {
    "skillMatch": 0.40, "wcs": 0.30, "rankScore": 0.15,
    "teamAffinity": 0.10, "recentMomentum": 0.05
  },
  "caaTypeMultipliers": {
    "Push": 1.5, "Manual": 1.0, "Investigation": 0.8, "Review": 0.5
  },
  "overridePolicy": {
    "defaultTTLHours": 72, "stallingAlertFactor": 0.5,
    "inactivityEscalationDays": 7
  },
  "stallingThresholds": {
    "P1StallHours": 1, "P2StallHours": 4,
    "P3StallHours": 8, "P4StallHours": 24,
    "autoParkMultiplier": 2.0
  },
  "workloadMixDefaults": {
    "Push": 0.30, "Manual": 0.30, "Investigation": 0.25, "Review": 0.15
  },
  "maxActiveHighPriorityPerAnalyst": 3,
  "phaseTransitionThresholds": {
    "actionsResolvedPct": 0.60, "priorityDropBands": 2
  },
  "operatingMode": "MDR",
  "revalidationCadence": {
    "P1P2CadenceMinutes": 0, "P3P4CadenceHours": 24
  },
  "crsConfidence": {
    "staleAlertThresholdMinutesP1P2": 30,
    "staleBadgeHalfWidthThreshold": 15,
    "estimatedBadgeHalfWidthThreshold": 5
  },
  "resolutionDurability": {
    "checkDaysWindows": [30, 60, 90],
    "durableRDSThreshold": 0.90,
    "flaggedRDSThreshold": 0.75,
    "assignmentBonusThreshold": 0.90,
    "assignmentBonusValue": 0.05
  },
  "businessImpact": {
    "enabled": true,
    "displayCurrencySymbol": "£",
    "assetValuePolicies": []
  },
  "caseTrajectory": {
    "slaBreachAlertThresholdPct": 60,
    "trajectoryWindowHours": 72
  },
  "caseResonance": {
    "surgeDetectionWindowMinutes": 120,
    "surgeCaseCountThreshold": 5,
    "conflictGateEnabled": true
  },
  "silentMonitor": {
    "enabled": true,
    "nbaDivergenceWindowHoursP1": 4,
    "nbaDivergenceWindowHoursP2": 12,
    "maxObservationsPerCasePer24h": 2,
    "deliveryTarget": "som_only"
  },
  "teamManagement": {
    "defaultTeamSLATargets": {
      "P1CompliancePct": 95, "P2CompliancePct": 90,
      "P3CompliancePct": 85, "P4CompliancePct": 80
    },
    "teamCapacityDefaultMultiplier": 20,
    "temporaryAttachmentMaxDays": 90,
    "durabilityFlagThresholdForCoaching": 0.75,
    "attachmentExpiryWarningHours": 24,
    "deputyAutoActivateOnOOO": true
  },
  "teamPerformance": {
    "dashboardRefreshSeconds": 60,
    "defaultTimeWindow": "7d",
    "comparisonTableDefaultSort": "casesClosedDesc",
    "momentumAmberThreshold": 1.5,
    "momentumRedThreshold": 0,
    "stallingCountRedThreshold": 3,
    "capacityAmberThresholdPct": 80,
    "capacityRedThresholdPct": 95,
    "pushRateAmberThresholdPct": 20,
    "commanderEngagementAmberPct": 40
  },
  "progressiveAssignment": {
    "phase1MaxImpactWeight": 4,
    "phase2MaxImpactWeight": 7,
    "phase1DurationDays": 30,
    "phase2DurationDays": 60,
    "teamLeaderVisibilityDays": 60,
    "complexityGateOverride": false
  },
  "institutionalMemory": {
    "contributionOptIn": true,
    "queryOptIn": true,
    "platformMinPopulation": 5,
    "platformMinTenantCount": 3
  },
  "caseAssociation": {
    "enabled": true,
    "structuralClusteringEnabled": true,
    "resolutionPathEnabled": true,
    "temporalMiningEnabled": true,
    "thematicClusteringEnabled": true,
    "temporalLookbackDays": 365,
    "temporalMinSampleSize": 5,
    "sweepLeadTimeDays": 7,
    "thematicRefreshHours": 6,
    "thematicMinSharedTerms": 3,
    "thematicMinCaseCount": 3,
    "resolutionPathLookbackDays": 90
  },
  "thematicIntelligence": {
    "enabled": true,
    "maxCasesPerContext": 20,
    "hypothesisExpiryHours": 72,
    "rejectionMemoryDays": 14,
    "minEvidenceTypesForHigh": 3,
    "minEvidenceTypesForMedium": 2,
    "crossQueueMinCases": 3,
    "monitorReminderHours": 48,
    "incidentFlagRequiresExplicit": true
  }
}
```

---

*Spec #8 — Case Management & Workflow v1.3. Complete. Commander Thematic Intelligence Engine committed (Section 31) — ThematicAnalysisContext schema, Thematic Incident Hypothesis schema, SOM dashboard panel, governance model (Accept/Modify/Reject), response action execution, Commander grounding extension, confidence assignment rules, history and learning model, SOMConfig keys, Epic R acceptance criteria. Final SOMConfig Master Register (Section 32) — all keys across all versions consolidated into single authoritative reference. Reconciled to MTS v6.1 and Master Proposition v4.1. No further sections proposed.*


---

# Spec #8 Addendum v1.6 — Hierarchical Communication, SIR and Sub-Case Email

## Case/Sub-Case Communication Rule

Parent cases, sub-cases, actions and swarm workstreams SHALL each be valid communication origins. Communication created from a sub-case/action SHALL be linked to the originating object and SHALL roll up to the parent case.

## Sub-Case/Action Send Email Action

Every actionable sub-case/action MAY expose **Send Email** where tenant policy allows. The email SHALL inherit:

```text
parent_case_id
sub_case_id or action_id
case_swarm_id/workstream_id where applicable
owning team
suggested mailbox
communication playbook
approval policy
```

## SIR from Sub-Case/Action

A SIR may originate from a sub-case/action when that work item reveals a control weakness, drift condition, exploitation evidence or incident concern. The SIR SHALL include both parent case context and originating sub-case/action context.

## Communication-Aware Case Action Algorithm

The CAA/NBA model SHOULD consider communication state as an input. If a high-impact sub-case is stalled because an owner has not replied, the Next Best Action may be to send a reminder, escalate, raise SIR or reassign the action.

## Case Closure Gate

Where configured, cases cannot close until communication requirements are satisfied or deliberately suppressed with reason. Required checks may include unresolved inbound messages, open sub-case threads, external notifier closure, SIR acknowledgement and stakeholder response state.

## Separated SLA States

Case runtime SHALL be able to represent:

```text
technical_sla_state
communication_sla_state
stakeholder_response_state
validation_sla_state
```

These states may diverge and must be visible in case dashboards and Case Pulse.


---

# Closed Architecture Decisions — Approved Build-Ready Baseline v1.0

The following decisions are now closed for this baseline and SHALL govern all downstream child specifications, implementation tickets, AI-agent work and manual review activity.

| ID | Decision Area | Binding Decision |
|---|---|---|
| CAD-EMAIL-001 | Microsoft Graph permissions | SDR SHALL use least-privilege Microsoft Graph permissions with tenant administrator consent. Approved mailboxes SHALL be explicitly configured. SDR SHALL NOT assume unrestricted tenant-wide mailbox access. Where application permissions are required, access SHALL be constrained to approved mailboxes through Microsoft 365 / Exchange controls and recorded in the tenant audit trail. |
| CAD-EMAIL-002 | Email body storage | SDR SHALL default to metadata-first email storage. Full message body storage SHALL be disabled by default and enabled only through tenant retention/evidence policy, explicit analyst evidence capture, SIR generation, or regulated deployment configuration. SIR bodies generated by SDR SHALL be stored as case evidence and audit material. |
| CAD-EMAIL-003 | Mailbox rollout sequence | The initial closed-loop email implementation SHALL prioritise tenant-approved shared mailboxes as the primary operational mailbox type. Microsoft 365 group mailboxes SHALL follow after shared mailbox support. Individual user mailbox sending SHALL be supported later where required, but SHALL NOT be the baseline operational model. |
| CAD-SIR-001 | SIR acknowledgement | SIR acknowledgement SHALL be supported in Phase 1 through email reply correlation, manual acknowledgement, and optional incident reference capture. Full incident-management platform integration is deferred and SHALL NOT block SIR capability. A SIR creates a governed hand-off; it does not convert the SDR case into an incident record. |
| CAD-VM-001 | VM closure gates | VM communication closure gates SHALL be provided as a configurable policy. The default tenant posture SHALL surface advisory closure checks without hard-blocking closure unless the tenant enables enforcement. For externally notified, KEV, SIR-linked, or risk-accepted vulnerability cases, SDR SHOULD recommend enforced closure gates. |
| CAD-GOV-001 | Communication approval chain | Communication approval SHALL be resolved through the tenant-configured Communication Permission and Approval Chain Matrix. Approval routing SHALL support upward chain-of-command resolution from the originating case, sub-case, action, swarm workstream, mailbox, queue, team, and recipient class. SDR SHALL NOT hard-code grade-based approval rules, although default templates MAY be supplied. |
| CAD-SIR-002 | SIR origination from sub-case/action | Authorised users SHALL be able to raise a Security Incident Report / Referral from a parent case, sub-case, case action, or case swarm workstream. The SIR SHALL preserve linkage to the originating object and SHALL roll up to the parent case timeline, communication record, audit trail, and evidence pack. The generated SIR summary SHALL include both parent case context and originating object context. |

## Baseline Status

There are no remaining open architecture decisions for the closed-loop email, Communication Administration, SIR, sub-case/action communication, or VM mailbox workflow enhancement pack. Implementation-level choices such as exact API field names, UI component layout and test fixture contents remain subordinate specification or build-ticket matters and SHALL NOT reopen the architecture decisions above.


---

# DOCUMENT-SPECIFIC REVISION PATCH — Spec_08_Case_Management_Workflow_v1_6.md

**Patch date:** 2026-05-13  
**Patch type:** Functional review remediation  
**Authority:** Closed-loop doctrine patch v2.0  

## Required Update Applied

This case specification is superseded where it permits manual lifecycle movement. The case engine is now a closed-loop state machine with prioritisation-only user interaction.

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



## v2.2 Case Engine Update — P0 Zero-Day Priority

Case Management must support P0 Zero-Day Priority as the highest queue class. P0 applies only to existing case-bound risks. The case lifecycle remains system-owned. Applying P0 must recalculate SLA, routing, sub-actions, communication cadence, validation cadence, and dashboard placement.

Case UI must expose P0 recommend/apply/remove controls only to authorised roles. P0 controls must not create, close, or request revalidation or challenge closures directly.

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

# v2.6 Extension — Case Taxonomy Addendum

**Extension version:** v2.6.0
**Extension date:** May 2026
**Extension scope:** Extends the case taxonomy with five new case types introduced in v2.6 baseline. All v2.5.2 case management doctrine above this section remains in force unchanged.

## V2.6-1. Five New Case Types

The v2.5.2 case taxonomy is extended with five new case types. The complete v2.6 case taxonomy is now twelve types:

**v2.5 case types (carried forward unchanged):**

1. Drift case
2. Vulnerability case
3. Identity case (technical identity findings)
4. Exposure case
5. Coverage case
6. Tool Health case
7. Threat Intelligence Estate Match case

**v2.6 new case types:**

8. **External Attack Correlation case** — Commander's parallel record when a SOC case binds to Commander entities. Tracks pre-warned classification (per Spec #71), control weakness correlation, and any drift item exposed by the attack. Routes to Commander analyst (not to the SOC). The SOC case in their own system remains the authority on incident response; Commander's correlated case manages the estate-side remediation. Closure of the External Attack Correlation case is independent of the SOC's case closure — the SOC closes their case when the incident is handled; Commander closes the correlation case when the exposed drift is remediated.

9. **Verdict Pattern case** — Generated when internal behavioural intelligence flags a pattern warranting attention. Verdict count anomalies, behavioural divergence from peers, geographic or temporal clustering, policy-firing concentration. Routes to the customer-configured Internal Risk function. Subject to the Internal Risk Investigation Sub-Lifecycle (Spec #75), with strict RBAC, audit-of-access, and jurisdictional configuration. Commander surfaces the pattern; the customer's Internal Risk team conducts the investigation and adjudicates.

10. **Inverse Discovery (Coverage Blindspot) case** — Generated when external signal references an entity Commander doesn't know about. Root cause auto-classified into: Discovery Gap, Staleness, Shadow IT, Naming Mismatch. Routes to platform or architecture teams for entity onboarding and connector tuning. Closure requires entity to flow through standard discovery in the next cycle.

11. **Policy Effectiveness case** — Generated when a security policy exhibits a pattern suggesting it isn't working as intended: override rate above threshold, zero-fire anomaly (a policy that has never fired), or drift between intended and actual enforcement. Routes to policy owner for retuning, replacement, or formal acceptance. The policy owner is identified per the Routing Model (Spec #31 v2.6).

12. **OODA Tempo Degradation case** — Generated when Commander's own OODA phase health drops below configurable threshold. Routes to SOM or platform team depending on which phase degraded (per Spec #58, Section 10). Restores Commander's operational tempo. Closure requires phase health to return above baseline for the recovery window.

## V2.6-2. Case Lifecycle for v2.6 Case Types

All five new case types follow the established closed-loop case lifecycle (`DETECTED → BOUND → ROUTED → PRIORITISED → ACTION_DECOMPOSED → IN_PROGRESS → PENDING_VALIDATION → VALIDATION_RUNNING → VALIDATED_* → PENDING_CLOSURE_GATES → CLOSED_BY_SYSTEM`).

Specific lifecycle considerations per new case type:

- **External Attack Correlation:** ACTION_DECOMPOSED phase produces remediation actions for the underlying drift (not for the SOC incident itself). Validation confirms drift remediation, not incident closure.
- **Verdict Pattern:** ROUTED phase routes to Internal Risk Investigation Sub-Lifecycle (Spec #75). Standard case workflow continues in parallel with the customer-owned investigation. CLOSED_BY_SYSTEM only when investigation outcome is recorded and disposition is captured.
- **Inverse Discovery:** ACTION_DECOMPOSED phase produces entity onboarding action with target connector and entity profile. Validation requires the entity to appear in standard discovery in the subsequent cycle.
- **Policy Effectiveness:** ACTION_DECOMPOSED phase produces policy retuning recommendation. Approval chain requires policy owner approval. Validation requires the next verdict pattern cycle to show retuned behaviour.
- **OODA Tempo Degradation:** ACTION_DECOMPOSED phase produces phase-specific recovery actions. Validation requires phase health metric to return above baseline.

## V2.6-3. No Manual Case Creation

The no-manual-case-creation doctrine from v2.5 carries forward unchanged to all five new case types. All v2.6 cases are generated by deterministic rules from signal and engine output. Commander AI does not generate cases (it provides rationale and recommendation on existing cases).

## V2.6-4. Priority for v2.6 Case Types

Default priority assignment per v2.6 case type:

| Case Type | Default Priority | Promotion Triggers |
|---|---|---|
| External Attack Correlation | P1 | Pre-warned classification escalates to P0 if confidence high and asset critical |
| Verdict Pattern | P2 | Severity/scope of pattern can promote to P1 |
| Inverse Discovery | P3 | Critical asset references can promote to P2 |
| Policy Effectiveness | P3 | Override rate above critical threshold can promote to P2 |
| OODA Tempo Degradation | P2 | Sustained degradation can promote to P1 |

Priority is modulated by the Context-Aware Drift Prioritisation Matrix (Spec #74) for case types that touch drift state.

## V2.6-5. Case-Type Specific RBAC

Verdict Pattern cases carry the Internal Risk authority overlay per Spec #19 v2.6. Other v2.6 case types use existing RBAC scopes:

- External Attack Correlation: Security Analyst, SOM, CISO (standard)
- Inverse Discovery: Platform Engineering, Security Architect (standard)
- Policy Effectiveness: Policy Owner, Security Architect (standard)
- OODA Tempo Degradation: SOM, Platform Engineering (standard)

## V2.6-6. Audit Events

New audit events for v2.6 case types:

- `CASE_EXTERNAL_ATTACK_CORRELATION_OPENED`
- `CASE_VERDICT_PATTERN_OPENED`
- `CASE_INVERSE_DISCOVERY_OPENED`
- `CASE_POLICY_EFFECTIVENESS_OPENED`
- `CASE_OODA_TEMPO_DEGRADATION_OPENED`
- `CASE_VERDICT_PATTERN_INTERNAL_RISK_HANDOFF`
- `CASE_INVERSE_DISCOVERY_ROOT_CAUSE_CLASSIFIED`
- `CASE_OODA_PHASE_RECOVERY_CONFIRMED`

All audit events flow through the existing audit infrastructure.

