> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# SOM Configuration Panel Specification
## Commander SDR — Cognitive Case Handling Engine

**Document version:** v1.6
**Status:** Approved Baseline — Build Package Derivation Ready  
**Governing documents:** Commander SDR Master Technical Specification v6.7, Spec #8 v1.6, Spec #26a v1.2
**Companion to:** Spec #8 — Case Management & Workflow
**Specification phase:** Phase 1

---

## Document Purpose

This specification governs the full implementation of the SOM Configuration Panel — the centralised governance surface through which the Security Operations Manager (SOM) calibrates all CCHE behavioural parameters. It defines: every configurable key and its default value (verbatim from the authoritative source), all validation rules, the versioning and audit trail model, the UI component structure and microcopy, and the full API contract for programmatic access.

The SOM Configuration Panel is a governed interface. Every change made through it produces a versioned, auditable SOMConfig record. No CCHE parameter may be changed through any other mechanism.

---

## Table of Contents

1. Configuration Governance Model
2. All Configurable Keys and Default Values
3. Validation Rules
4. Versioning and Audit Trail
5. UI Structure and Microcopy
6. API Contract
7. Acceptance Criteria

---

## 1. Configuration Governance Model

**Governing principles:**

1. All CCHE behavioural parameters are centralised in a single `SOMConfig` record per tenant.
2. Only users with the `som_config_write` RBAC permission may change configuration. This permission is assigned to the Security Operations Manager role and Platform Administrator role only.
3. Every configuration change creates a new SOMConfig version. The previous version is preserved immutably in the configuration history.
4. A mandatory `changeReason` (free text, minimum 20 characters) is required for every change.
5. Rollback to any previous version is available. Rollback is itself a versioned operation with a mandatory reason.
6. All configuration changes are written to the tenant audit trail (MTS Section 17.6) as tamper-evident events.
7. Configuration changes take effect immediately upon save. There is no staging or delayed activation.
8. The SOM Configuration Panel surfaces the current effective values, the change history, and a preview of the impact of proposed changes before they are committed.

**Who can access the SOM Configuration Panel:**

| Role | Read | Write | Rollback |
|---|---|---|---|
| Security Operations Manager | Yes | Yes | Yes |
| Platform Administrator | Yes | Yes | Yes |
| CISO | Yes | No | No |
| Team Leader | Yes | No | No |
| All other roles | No | No | No |

---

## 2. All Configurable Keys and Default Values

The following table is the authoritative register of all SOMConfig keys. Default values are verbatim from the CCHE Authoritative Source Material. All defaults apply at tenant initialisation and are binding until changed by the SOM.

### 2.1 CRS Weights

| Key | Default | Type | Range | Description |
|---|---|---|---|---|
| `crsWeights.w_B` | **3** | number | 0.1–10 | Weight for Blast Radius factor. Higher weight increases sensitivity to scope of impact. |
| `crsWeights.w_E` | **3** | number | 0.1–10 | Weight for Exposure Severity factor. Higher weight increases sensitivity to external-facing exposure. |
| `crsWeights.w_I` | **2** | number | 0.1–10 | Weight for Impact Score factor (asset criticality-driven). |
| `crsWeights.w_C` | **2** | number | 0.1–10 | Weight for Control Coverage Gap factor. |
| `crsWeights.w_A` | **1** | number | 0.1–10 | Weight for Attack Path Likelihood factor. Lower default reflects probabilistic nature. |
| `crsWeights.w_T` | **2** | number | 0.1–10 | Weight for Time Pressure factor (SLA urgency and KEV status). |

**Validation:** All six weights must be ≥ 0.1. No upper constraint on individual weights, but total weight sum must be ≥ 6 (to avoid a degenerate scoring model where all factors are near-zero). Weights are dimensionally independent — they do not need to sum to any specific value; the CRS formula normalises by total weight sum.

### 2.2 Momentum Score Coefficients

| Key | Default | Type | Range | Description |
|---|---|---|---|---|
| `momentumCoefficients.alpha` | **1.0** | number | 0.1–5.0 | Velocity coefficient. Governs how much CRS reduction rate contributes to Momentum Score. |
| `momentumCoefficients.beta` | **2.0** | number | 0.1–5.0 | Completion ratio coefficient. Governs how much action completion rate contributes. Higher than alpha to reward action completion over passive CRS decay. |
| `momentumCoefficients.gamma` | **1.5** | number | 0.1–5.0 | Stale penalty coefficient. Governs the momentum reduction when stalling is detected. |
| `momentumCoefficients.momentumWindowHours` | **72** | integer | 24–168 | Rolling window for action completion ratio computation (τ). In hours. |

**Validation:** alpha, beta, gamma must each be > 0. momentumWindowHours must be between 24 and 168 (1–7 days).

### 2.3 WCS Coefficients

| Key | Default | Type | Range | Description |
|---|---|---|---|---|
| `wcsCoefficients.lambda1` | **0.6** | number | 0.1–0.9 | Queue load coefficient. Primary WCS driver. |
| `wcsCoefficients.lambda2` | **0.3** | number | 0.05–0.9 | High-priority load coefficient. |
| `wcsCoefficients.lambda3` | **0.1** | number | 0.01–0.5 | Focus factor coefficient. |
| `wcsCoefficients.wcsDisqualifyThreshold` | **20** | number | 0–50 | WCS below this value excludes analyst from new sub-case assignment. |

**Validation:** lambda1 + lambda2 + lambda3 must = 1.0 (±0.001 tolerance). wcsDisqualifyThreshold must be between 0 and 50.

### 2.4 Assignment Weights

| Key | Default | Type | Range | Description |
|---|---|---|---|---|
| `assignmentWeights.skillMatch` | **0.40** | number | 0.05–0.80 | Weight for skill match in assignment scoring. |
| `assignmentWeights.wcs` | **0.30** | number | 0.05–0.70 | Weight for WCS in assignment scoring. |
| `assignmentWeights.rankScore` | **0.15** | number | 0.05–0.50 | Weight for rank seniority. |
| `assignmentWeights.teamAffinity` | **0.10** | number | 0.05–0.30 | Weight for team continuity preference. |
| `assignmentWeights.recentMomentum` | **0.05** | number | 0.01–0.20 | Weight for recent momentum performance. |

**Validation:** All five assignment weights must sum to exactly 1.0 (±0.001 tolerance). Each weight must be ≥ 0.01.

### 2.5 CAA Type Multipliers

| Key | Default | Type | Range | Description |
|---|---|---|---|---|
| `caaTypeMultipliers.Push` | **1.5** | number | 0.5–3.0 | Multiplier applied to Push sub-case AIS. Platform prefers automated reversible actions. |
| `caaTypeMultipliers.Manual` | **1.0** | number | 0.5–2.0 | Multiplier for Manual sub-cases. Baseline. |
| `caaTypeMultipliers.Investigation` | **0.8** | number | 0.3–1.5 | Multiplier for Investigation sub-cases. Lower: investigations enable future actions; direct risk reduction is deferred. |
| `caaTypeMultipliers.Review` | **0.5** | number | 0.1–1.5 | Multiplier for Review sub-cases. Lowest default: reviews have the most indirect path to risk reduction. |

**Validation:** Push multiplier must be ≥ Manual multiplier (preserving the push preference policy). All multipliers must be > 0.

### 2.6 Override Policy

| Key | Default | Type | Range | Description |
|---|---|---|---|---|
| `overridePolicy.defaultTTLHours` | **72** | integer | 4–336 | Default AutoOff TTL in hours. After expiry, sub-case reverts to AutoOn. |
| `overridePolicy.stallingAlertFactor` | **0.5** | number | 0.1–1.0 | Fraction of TTL after which a stalling AutoOff sub-case triggers Case Pulse alert. Default: TTL × 0.5 = 36 hours. |
| `overridePolicy.inactivityEscalationDays` | **7** | integer | 1–30 | Days of assignee inactivity before automatic SOM escalation. |

**Validation:** defaultTTLHours must be between 4 and 336 (4 hours to 14 days). stallingAlertFactor must be between 0.1 and 1.0. inactivityEscalationDays must be between 1 and 30.

### 2.7 Stalling Thresholds

| Key | Default | Type | Range | Description |
|---|---|---|---|---|
| `stallingThresholds.P1StallHours` | **1** | number | 0.25–8 | Hours of analyst inactivity before P1 case is flagged as stalling. |
| `stallingThresholds.P2StallHours` | **4** | number | 1–24 | Hours of analyst inactivity before P2 case is flagged as stalling. |
| `stallingThresholds.P3StallHours` | **8** | number | 2–48 | Hours of analyst inactivity before P3 case is flagged as stalling. |
| `stallingThresholds.P4StallHours` | **24** | number | 4–96 | Hours of analyst inactivity before P4 case is flagged as stalling. |
| `stallingThresholds.autoParkMultiplier` | **2.0** | number | 1.5–5.0 | Auto-park fires at stallingThreshold × this multiplier. Default: P1 stalls at 1h, auto-parks at 2h. |

**Validation:** P1 < P2 < P3 < P4 (stalling thresholds must be in ascending order by priority). autoParkMultiplier must be ≥ 1.5.

### 2.8 Workload Mix Defaults

Applied to new analysts until the SOM or Team Leader configures their individual WorkloadMix.

| Key | Default | Type | Range | Description |
|---|---|---|---|---|
| `workloadMixDefaults.Push` | **0.30** | number | 0–0.80 | Target ratio for Push sub-cases. |
| `workloadMixDefaults.Manual` | **0.30** | number | 0–0.80 | Target ratio for Manual sub-cases. |
| `workloadMixDefaults.Investigation` | **0.25** | number | 0–0.80 | Target ratio for Investigation sub-cases. |
| `workloadMixDefaults.Review` | **0.15** | number | 0–0.80 | Target ratio for Review sub-cases. |

**Validation:** All four ratios must sum to 1.0 (±0.001 tolerance). No individual ratio may exceed 0.80 (prevents degenerate single-type workloads).

### 2.9 Capacity and Priority Limits

| Key | Default | Type | Range | Description |
|---|---|---|---|---|
| `maxActiveHighPriorityPerAnalyst` | **3** | integer | 1–10 | Maximum number of P1/P2 sub-cases an analyst may hold simultaneously. Assignment engine enforces this. |

### 2.10 Phase Transition Thresholds

| Key | Default | Type | Range | Description |
|---|---|---|---|---|
| `phaseTransitionThresholds.actionsResolvedPct` | **0.60** | number | 0.30–0.90 | Phase A→B transition when this proportion of weighted sub-case actions are resolved. |
| `phaseTransitionThresholds.priorityDropBands` | **2** | integer | 1–3 | Phase A→B also triggered when case priority drops by this many bands from creation priority. |

### 2.11 Operating Mode

| Key | Default | Type | Enum | Description |
|---|---|---|---|---|
| `operatingMode` | **"MDR"** | string | MDR, Manual, Hybrid | CCHE assignment operating mode. MDR = algorithmic auto-assignment. Manual = all assignments require SOM action. Hybrid = CCHE suggests, SOM approves. |

### 2.12 Revalidation Cadence

| Key | Default | Type | Description |
|---|---|---|---|
| `revalidationCadence.P1P2CadenceMinutes` | **0** | integer | Revalidation cadence for P1/P2 cases. 0 = every ingestion cycle. |
| `revalidationCadence.P3P4CadenceHours` | **24** | integer | Revalidation cadence for P3/P4 cases in hours. |

---


### 2.13 Closed-Loop Email Communication Configuration

The following keys govern the case email lifecycle introduced by MTS v6.7 Section 13.26A and Spec #26a. They are tenant-level defaults and may be overridden by more specific case-type configuration only where explicitly supported.

| Key | Default | Type | Range / Enum | Description |
|---|---:|---|---|---|
| `emailLifecycle.enabled` | `false` | boolean | true/false | Enables closed-loop case email for the tenant. Disabled tenants retain the Teams/Slack reference-and-import model only. |
| `emailLifecycle.defaultBodyStorageMode` | `reference` | string | metadata_only, reference, snapshot, redacted_snapshot | Determines how email bodies are stored or referenced. |
| `emailLifecycle.autoAcknowledgeInboundVulnNotifications` | `false` | boolean | true/false | If enabled, SDR sends governed acknowledgement templates when an inbound vulnerability notification creates or links a case. |
| `emailLifecycle.responseDueHours.P1` | `4` | integer | 1–72 | Response expectation for P1 case emails. |
| `emailLifecycle.responseDueHours.P2` | `8` | integer | 1–120 | Response expectation for P2 case emails. |
| `emailLifecycle.responseDueHours.P3` | `24` | integer | 4–168 | Response expectation for P3 case emails. |
| `emailLifecycle.responseDueHours.P4` | `72` | integer | 8–336 | Response expectation for P4 case emails. |
| `emailLifecycle.reminderLeadPct` | `0.75` | number | 0.1–0.95 | Fraction of response window after which a reminder recommendation or automated reminder is generated. |
| `emailLifecycle.maxAutoReminders` | `2` | integer | 0–5 | Maximum automated reminders before escalation recommendation. |
| `emailLifecycle.escalateAfterReminderCount` | `2` | integer | 0–5 | Number of reminders after which the communication state may become escalated. |
| `emailLifecycle.correlationAutoLinkThreshold` | `0.90` | number | 0.5–1.0 | Minimum confidence for automatic email-to-case linking. |
| `emailLifecycle.correlationReviewThreshold` | `0.40` | number | 0.0–0.9 | Minimum confidence for creation of a manual correlation candidate. |
| `emailLifecycle.subjectTokenRequired` | `true` | boolean | true/false | Requires `[SDR-CASE-{case_id}]` token in outbound case email subject unless explicitly overridden. |
| `emailLifecycle.attachmentStorageMode` | `metadata_only` | string | metadata_only, reference, snapshot | Governs attachment handling. |
| `emailLifecycle.subscriptionRenewalHours` | `48` | integer | 1–168 | Renewal cadence for Microsoft Graph subscriptions. |
| `emailLifecycle.deltaSyncSafetyNetHours` | `6` | integer | 1–72 | Scheduled delta sync cadence used to reconcile missed subscription events. |

**Validation:**

- `correlationAutoLinkThreshold` must be greater than `correlationReviewThreshold`.
- P1 response due hours must be <= P2 <= P3 <= P4.
- `maxAutoReminders` must be >= `escalateAfterReminderCount` unless escalation is disabled.
- `snapshot` body or attachment storage requires an explicit tenant retention setting.
- Enabling `autoAcknowledgeInboundVulnNotifications` requires at least one approved mailbox and one active acknowledgement template.

**Impact preview:**

Before enabling closed-loop email, the SOM Configuration Panel SHALL show:

- number of configured mailboxes;
- case types covered;
- estimated current open cases that would gain communication tracking;
- templates that will become active;
- retention/storage mode warning;
- Graph permission status.

## 3. Validation Rules

### 3.1 Pre-save Validation

All validation must run client-side (immediate feedback) and server-side (authoritative enforcement) before any configuration change is committed.

| Rule | Error Message |
|---|---|
| WCS lambdas do not sum to 1.0 | "WCS coefficients must sum to 1.0. Current sum: [X]. Adjust Lambda 1, 2, or 3." |
| Assignment weights do not sum to 1.0 | "Assignment weights must sum to 1.0. Current sum: [X]. Adjust any weight to correct." |
| Push multiplier < Manual multiplier | "Push multiplier must be greater than or equal to Manual multiplier. Push preference policy requires Push ≥ Manual." |
| Stalling thresholds out of order | "Stalling thresholds must increase with priority: P1 < P2 < P3 < P4." |
| WorkloadMix ratios do not sum to 1.0 | "Workload mix ratios must sum to 1.0. Current sum: [X]." |
| changeReason < 20 characters | "Change reason must be at least 20 characters. Explain why this configuration change is being made." |
| Any weight set to 0 | "Weights and coefficients cannot be set to zero. Use the minimum value of [minimum] instead." |
| autoParkMultiplier < 1.5 | "Auto-park multiplier must be at least 1.5 to prevent premature case parking." |

### 3.2 Impact Preview

Before committing any CRS weight change, the panel must compute and display an **Impact Preview**: the CRS value change for the top 5 open cases (by current CRS) if the new weights were applied now. The preview is read-only and non-binding. The SOM reviews it before confirming.

```
Impact Preview — CRS weight change:
  SDR-9001 (Identity Risk): CRS 82 → 91  (+9)  [Blast Radius weight increase amplifies scope]
  SDR-8772 (Config Drift):  CRS 61 → 55  (−6)  [Exposure weight change affects external assets]
  SDR-8441 (Vuln):          CRS 74 → 74  (0)   [No change — low blast radius case]
  ...
  Apply changes? [Confirm] [Cancel]
```

### 3.3 Breaking Change Warnings

The following changes trigger a mandatory confirmation dialog with explicit warning:

| Change | Warning |
|---|---|
| Mode switch from MDR → Manual | "Switching to Manual mode. All new sub-case assignments will require SOM action. The CCHE will not auto-assign. Case Pulse will show a pending-assignment queue. Confirm?" |
| Reduction of maxActiveHighPriorityPerAnalyst | "Reducing this limit may cause analysts currently over the new limit to be excluded from assignment until their load drops. [N] analysts are currently above the proposed limit. Confirm?" |
| CRS weight change that would reprioritise >10% of open cases | "This weight change would alter the CRS of [N] open cases by more than 10 points. Review the Impact Preview before confirming." |
| Override TTL reduction >50% | "Reducing the default override TTL significantly may expire active analyst overrides earlier than expected. Current active overrides: [N]. Confirm?" |

---

## 4. Versioning and Audit Trail

### 4.1 Version Model

Every SOMConfig change creates a new version. The `version` field is a monotonically increasing integer. Previous versions are preserved in `SOMConfigHistory` (one record per version, indexed by tenantId + version).

**SOMConfigHistory record:**

```json
{
  "configId":     "string (UUID)",
  "tenantId":     "string",
  "version":      14,
  "effectiveAt":  "2026-04-25T16:00:00Z",
  "expiredAt":    "2026-04-26T09:00:00Z",
  "changedBy":    "som-user-id",
  "changeReason": "Increasing Blast Radius weight to better reflect our large flat network exposure.",
  "changedFields": ["crsWeights.w_B"],
  "previousValues": { "crsWeights.w_B": 3 },
  "newValues":      { "crsWeights.w_B": 4 },
  "fullSnapshot":  { /* complete SOMConfig at this version */ }
}
```

`changedFields` lists only the fields that changed (not the entire config). `fullSnapshot` captures the entire config for rollback purposes.

### 4.2 Rollback

To roll back to a previous version:

```
POST /api/v1/som/config/rollback

Request body:
{
  "targetVersion": 12,
  "rollbackReason": "CRS weight change in version 14 produced unexpected CRS inflation on Identity cases. Reverting to v12 to reassess."
}
```

Rollback is a versioned operation. The new version (e.g. 15) contains the configuration from version 12, with the rollback operation logged. Versions 13 and 14 remain in history — they are not deleted.

### 4.3 Audit Trail Entry

Every SOMConfig change writes to the tenant audit trail:

```json
{
  "eventType":    "som_config_change",
  "tenantId":     "tenant-id",
  "changedBy":    "som-user-id",
  "changedByRole": "SecurityOperationsManager",
  "changedFields": ["crsWeights.w_B"],
  "version":      14,
  "effectiveAt":  "2026-04-25T16:00:00Z",
  "changeReason": "Increasing Blast Radius weight to better reflect our large flat network exposure.",
  "auditHash":    "sha256-hash-of-event-content",
  "previousHash": "sha256-hash-of-previous-audit-event"
}
```

---

## 5. UI Structure and Microcopy

The SOM Configuration Panel is a dedicated administration view accessible via: **Platform Administration → CCHE Configuration**. It is part of the admin workspace (not the main case workspace). It is visible only to users with `som_config_read` permission.

### 5.1 Navigation Entry

Sidebar entry (Platform Administration section):

```
⚙ CCHE Configuration
  Calibrate scoring, assignment, and governance parameters
```

Tooltip on hover: "Configure Case Risk Score weights, assignment rules, override policies, and operating mode for the Cognitive Case Handling Engine."

### 5.2 Page Header

```
CCHE Configuration Panel
Current version: v14  ·  Last changed: 25 Apr 2026 16:00 by Jane Smith (SOM)
"Increasing Blast Radius weight to better reflect our large flat network exposure."

[View change history]  [Roll back to previous version]
```

### 5.3 Section Structure and Microcopy

**Section 1 — Case Risk Score Weights**

```
Case Risk Score (CRS) Weights

Adjust how much each risk factor contributes to the overall Case Risk Score.
Higher weights amplify the influence of that factor across all cases.
Changes take effect immediately and apply to all future CRS computations.

[Impact Preview]  — See how this change would affect your top open cases before saving.

  Blast Radius (w_B)         [—●————]   Current: 3    Min: 0.1  Max: 10
  Exposure Severity (w_E)    [—●————]   Current: 3
  Impact Score (w_I)         [——●———]   Current: 2
  Control Coverage Gap (w_C) [——●———]   Current: 2
  Attack Path Likelihood (w_A) [———●——]  Current: 1
  Time Pressure (w_T)        [——●———]   Current: 2

  These weights determine which risk dimensions matter most for your estate.
  The default settings balance scope (Blast Radius, Exposure) with urgency (Time Pressure)
  and control maturity (Coverage Gap, Impact). Adjust based on your organisation's risk profile.
```

**Section 2 — Momentum Score**

```
Momentum Score Coefficients

Control how case momentum is measured. Momentum tracks how quickly your team is
reducing risk across active cases.

  Velocity coefficient (α)        [——●—]   Current: 1.0
  Completion ratio coefficient (β) [——●—]   Current: 2.0
    Higher β rewards teams that complete planned actions consistently.
  Stale penalty (γ)               [——●—]   Current: 1.5
    Higher γ more aggressively penalises stalling cases in Case Pulse.

  Momentum window (τ)             [72] hours
    Actions completed within this window count toward the completion ratio.
    Range: 24–168 hours (1–7 days).
```

**Section 3 — Analyst Capacity (WCS)**

```
Workload Capacity Score

Controls how analyst capacity is measured and at what level new assignments are blocked.

  Queue load weight (λ₁)          [0.60]
  High-priority load weight (λ₂)  [0.30]
  Focus factor weight (λ₃)        [0.10]
    ⚠ λ₁ + λ₂ + λ₃ must equal 1.0

  Disqualification threshold       [20]
    Analysts with WCS below this value will not receive new sub-case assignments.
    A WCS of 20 means the analyst is at approximately 80% capacity.
    Recommended range: 15–30.

  [Current WCS distribution — see Case Pulse for live view]
```

**Section 4 — Assignment Scoring**

```
Assignment Weights

Determines how sub-cases are matched to analysts. All weights must sum to 1.0.

  Skill match      [0.40]   Primary driver: route sub-cases to domain-matched analysts.
  Capacity (WCS)   [0.30]   Prevent overloading. High-WCS analysts receive more assignments.
  Rank seniority   [0.15]   Complex sub-cases prefer higher-ranked analysts.
  Team affinity    [0.10]   Prefer analysts already on the parent case's team.
  Recent momentum  [0.05]   Slightly favour analysts with recent positive momentum.

  Total: 1.00 ✓

  [Reset to defaults]
```

**Section 5 — Case Action Algorithm**

```
Case Action Algorithm (CAA) — Sub-case Type Preferences

Multipliers applied to each sub-case type during Next Best Action ranking.
Push actions are preferred by default — they are automated and reversible.
Adjust if your organisation's risk appetite or tooling prefers different action types.

  Push multiplier          [1.5]   Automated, reversible. Platform preferred.
  Manual multiplier        [1.0]   Baseline.
  Investigation multiplier [0.8]   Enables future actions; indirect risk reduction.
  Review multiplier        [0.5]   Advisory; most indirect path to risk reduction.

  ⚠ Push multiplier must be ≥ Manual multiplier to preserve platform push preference policy.
```

**Section 6 — Override Governance**

```
Analyst Override Policy

Controls how long analysts can hold a manual assignment override before the
system re-evaluates, and when Case Pulse alerts you to stalled overrides.

  Default override TTL     [72] hours
    After this period, analyst-set AutoOff reverts to AutoOn automatically.
    Analyst is notified before expiry. Range: 4–336 hours.

  Stalling alert trigger   [0.5] × TTL  (at [36] hours with current TTL)
    If an overridden sub-case is stalling (Momentum Score negative) for this
    duration, Case Pulse surfaces an alert for SOM review.

  Inactivity escalation    [7] days
    If an assignee has had no activity on an overridden sub-case for this period,
    you receive an automatic escalation notification.
```

**Section 7 — Stalling Detection**

```
Stalling Detection Thresholds

Hours of analyst inactivity before a case is flagged as stalling in Case Pulse.
Auto-park fires at Threshold × Auto-park multiplier.

  P1 cases:   [1] hour      →  Auto-park at [2] hours
  P2 cases:   [4] hours     →  Auto-park at [8] hours
  P3 cases:   [8] hours     →  Auto-park at [16] hours
  P4 cases:   [24] hours    →  Auto-park at [48] hours

  Auto-park multiplier: [2.0]

  Stalling detection runs continuously. Legitimate analyst pauses (ON_HOLD
  with reason) do not trigger stalling detection.
```

**Section 8 — Workload Mix**

```
Default Workload Mix

The default target ratio for new analysts. Team Leaders and SOM can set
individual ratios per analyst in their profile.

  Push:          [0.30]  (30%)
  Manual:        [0.30]  (30%)
  Investigation: [0.25]  (25%)
  Review:        [0.15]  (15%)
  Total:         1.00 ✓

  Analysts whose actual mix deviates from target by more than [15]% for
  more than [3] consecutive days will appear in Case Pulse workload mix alerts.
```

**Section 9 — Capacity Limits**

```
Priority Case Limits

  Max P1/P2 sub-cases per analyst:  [3]
    Analysts at this limit are excluded from new P1/P2 sub-case assignment.
    This prevents high-priority case concentration on a single analyst.
    Range: 1–10.
```

**Section 10 — Phase Transition**

```
Phase Transition Thresholds

Controls when cases transition from active remediation (Phase A)
to residual confirmation (Phase B) and are rerouted to junior analysts.

  Actions resolved threshold:  [60]%
    Phase A → B when this proportion of weighted sub-case actions are completed.

  Priority drop threshold:     [2] bands
    Phase A → B also triggers when case priority drops by this many bands
    from its creation priority (e.g. P2 at creation → P4 now = 2 bands).

  Adjusting these thresholds earlier (lower %) moves cases to Phase B sooner,
  freeing senior analysts for new P1/P2 work. Later (higher %) keeps senior
  analysts on cases longer for more thorough handoffs.
```

**Section 11 — Operating Mode**

```
CCHE Operating Mode

Controls how sub-case assignments are made across your operation.

  ● MDR (Algorithmic)    CCHE auto-assigns all sub-cases. You can override at any time.
                         Maximum efficiency. Recommended for stable operations.

  ○ Hybrid              CCHE proposes assignments. You approve each one in Case Pulse.
                         More oversight. Useful during onboarding or surge events.

  ○ Manual              All assignments require SOM action. CCHE computes recommendations
                         but does not act. Use for full control during major incidents.

  [Switch mode]  ← Requires rationale. Logged in audit trail.
```

**Section 12 — Revalidation Cadence**

```
Case Revalidation Cadence

How often Commander SDR re-checks open case conditions to detect self-healing.

  P1/P2 cases:  Every ingestion cycle (0 = continuous)
  P3/P4 cases:  Every [24] hours

  More frequent revalidation detects auto-healing faster but increases
  connector API call volume. Adjust based on connector rate limits.
```

**Save and change reason footer (appears on all sections when edits are pending):**

```
  ─────────────────────────────────────────────────────────────────────
  Pending changes: crsWeights.w_B  3 → 4

  Change reason (required, min 20 characters):
  [___________________________________________________]

  [Impact Preview]   [Save changes]   [Cancel]

  Saving will take effect immediately and increment the configuration to v15.
```

---

## 6. API Contract

### 6.1 Read Current Configuration

```
GET /api/v1/som/config

Response 200:
{
  "tenantId":    "tenant-id",
  "version":     14,
  "effectiveAt": "2026-04-25T16:00:00Z",
  "changedBy":   "som-user-id",
  "changeReason": "Increasing Blast Radius weight to reflect flat network exposure.",
  "crsWeights": {
    "w_B": 4, "w_E": 3, "w_I": 2, "w_C": 2, "w_A": 1, "w_T": 2
  },
  "momentumCoefficients": {
    "alpha": 1.0, "beta": 2.0, "gamma": 1.5, "momentumWindowHours": 72
  },
  "wcsCoefficients": {
    "lambda1": 0.6, "lambda2": 0.3, "lambda3": 0.1, "wcsDisqualifyThreshold": 20
  },
  "assignmentWeights": {
    "skillMatch": 0.40, "wcs": 0.30, "rankScore": 0.15,
    "teamAffinity": 0.10, "recentMomentum": 0.05
  },
  "caaTypeMultipliers": {
    "Push": 1.5, "Manual": 1.0, "Investigation": 0.8, "Review": 0.5
  },
  "overridePolicy": {
    "defaultTTLHours": 72, "stallingAlertFactor": 0.5, "inactivityEscalationDays": 7
  },
  "stallingThresholds": {
    "P1StallHours": 1, "P2StallHours": 4, "P3StallHours": 8, "P4StallHours": 24,
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
  }
}
```

### 6.2 Update Configuration

Only the fields included in the request body are changed. All other fields retain their current values.

```
PATCH /api/v1/som/config

Request body:
{
  "changeReason": "Increasing Blast Radius weight to better reflect our large flat network.",
  "crsWeights": {
    "w_B": 4
  }
}

Response 200:
{
  "tenantId":    "tenant-id",
  "version":     15,
  "effectiveAt": "2026-04-26T09:15:00Z",
  "changedBy":   "som-user-id",
  "changedFields": ["crsWeights.w_B"],
  "previousValues": { "crsWeights.w_B": 3 },
  "newValues":      { "crsWeights.w_B": 4 }
}

Response 400 (validation failure):
{
  "error": "validation_failed",
  "violations": [
    {
      "field":   "wcsCoefficients",
      "message": "WCS coefficients must sum to 1.0. Current sum: 1.10."
    }
  ]
}
```

### 6.3 Read Configuration History

```
GET /api/v1/som/config/history?limit=20&offset=0

Response 200:
{
  "tenantId": "tenant-id",
  "history": [
    {
      "version":      15,
      "effectiveAt":  "2026-04-26T09:15:00Z",
      "expiredAt":    null,
      "changedBy":    "som-user-id",
      "changeReason": "Increasing Blast Radius weight...",
      "changedFields": ["crsWeights.w_B"]
    },
    {
      "version":      14,
      "effectiveAt":  "2026-04-25T16:00:00Z",
      "expiredAt":    "2026-04-26T09:15:00Z",
      "changedBy":    "som-user-id",
      "changeReason": "Adjusted momentum window to 48h for faster detection.",
      "changedFields": ["momentumCoefficients.momentumWindowHours"]
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

### 6.4 Read Specific Version

```
GET /api/v1/som/config/history/{version}

Response 200:
{
  "version": 12,
  "effectiveAt": "2026-04-20T10:00:00Z",
  "expiredAt":   "2026-04-25T16:00:00Z",
  "fullSnapshot": { /* complete SOMConfig at version 12 */ }
}
```

### 6.5 Rollback

```
POST /api/v1/som/config/rollback

Request body:
{
  "targetVersion":  12,
  "rollbackReason": "CRS weight change in v14 produced unexpected CRS inflation on Identity cases."
}

Response 200:
{
  "newVersion":      16,
  "restoredFrom":    12,
  "effectiveAt":     "2026-04-26T10:00:00Z",
  "rollbackReason":  "CRS weight change in v14 produced unexpected CRS inflation on Identity cases."
}
```

### 6.6 Read Impact Preview

```
POST /api/v1/som/config/preview

Request body:
{
  "proposedChanges": {
    "crsWeights": { "w_B": 4 }
  }
}

Response 200:
{
  "affectedCasesCount": 47,
  "topImpactedCases": [
    {
      "caseId":       "SDR-9001",
      "currentCRS":   82,
      "projectedCRS": 91,
      "crsDelta":     +9,
      "explanation":  "Blast Radius factor B=72 is high for this case. Increased w_B amplifies its contribution."
    },
    {
      "caseId":       "SDR-8772",
      "currentCRS":   61,
      "projectedCRS": 55,
      "crsDelta":     -6,
      "explanation":  "Low Blast Radius (B=18). Increased w_B has minimal effect; relative weight of other factors decreases."
    }
  ],
  "summary": "Proposed change would increase CRS for 31 cases and decrease CRS for 16 cases. 
               Average CRS change: +3.2 across all open cases."
}
```

---

## 7. Acceptance Criteria

**AC-SOM-01:** All 12 SOMConfig sections are rendered correctly in the UI with current values loaded from the API on page open.

**AC-SOM-02:** Any field change that fails validation is rejected before submission with an inline error message. Server-side validation rejects the same invalid request at the API level.

**AC-SOM-03:** Impact Preview shows projected CRS for top 5 open cases before any CRS weight change is committed. Preview is non-binding.

**AC-SOM-04:** Breaking change warnings appear for mode switches, maxActiveHighPriority reductions, and large CRS weight changes before confirmation.

**AC-SOM-05:** Every successful PATCH creates a new version, increments the version counter, and writes an audit trail event. The previous version is preserved in `SOMConfigHistory`.

**AC-SOM-06:** Rollback restores the full config from the target version, creates a new version, and logs the rollback reason. Versions between current and rollback target are preserved — not deleted.

**AC-SOM-07:** `GET /api/v1/som/config/history` returns all versions in reverse chronological order. Each entry includes `changedFields` and `changeReason`.

**AC-SOM-08:** Only users with `som_config_write` RBAC permission can call PATCH or POST rollback. A 403 response is returned for unauthorised attempts.

**AC-SOM-09:** WCS lambda validation enforces sum = 1.0 ±0.001. Assignment weight validation enforces sum = 1.0 ±0.001. Workload mix validation enforces sum = 1.0 ±0.001.

**AC-SOM-10:** Push typeMultiplier cannot be set below Manual typeMultiplier. API and UI both enforce this rule.

**AC-SOM-11:** All SOMConfig audit events are tamper-evident. The `auditHash` field on each event is a SHA-256 hash of the event content concatenated with the previous event's hash (hash chain per MTS Section 17.6).

**AC-SOM-12:** Configuration changes take effect immediately — the next CRS computation, CAA run, or assignment decision uses the new values. No restart or cache flush is required.

**Test case — full round trip:**

1. Read current config. Assert version = N.
2. Submit PATCH with `crsWeights.w_B = 4` and valid `changeReason`.
3. Assert response version = N+1. Assert `changedFields = ["crsWeights.w_B"]`.
4. Read config. Assert `crsWeights.w_B = 4` and `version = N+1`.
5. Read history. Assert N+1 entry with correct changeReason and changedFields.
6. Submit rollback to version N.
7. Assert response version = N+2. Assert `crsWeights.w_B = 3` (restored).
8. Read history. Assert N+2 entry with rollbackReason. Assert N+1 entry still present.


---

## 8. Team Management Configuration

Team management settings are exposed in a dedicated section of the SOM Configuration Panel: **Platform Administration → Teams**. This section is distinct from the CCHE parameter panel but is governed by the same versioning and audit model.

### 8.1 Team Management UI — Section Entry

Sidebar navigation:

```
👥 Teams
  Create and manage security operations teams
```

The Teams section has two sub-views accessible from a tab bar:

```
[Team Builder]   [Team Performance]   [Attachment Log]
```

### 8.2 Team Builder Quick Access

The Team Builder (Spec #8 Section 16.2) is accessible directly from the Team Management panel. Active teams are displayed as editable cards:

```
Active Teams (4)                                        [+ Create new team]

┌──────────────────────────────────────────────┐
│ Identity & Cloud Operations        ● Active  │
│ 3 members · Jane Smith (Lead)               │
│ Queues: Security Ops, Identity              │
│ SLA targets: P1 95% · P2 90%               │
│ [Edit]  [Pause]  [View performance]         │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Threat Response                    ● Active  │
│ 5 members · Marcus Kim (Lead)               │
│ Queues: Security Ops, Vulnerability         │
│ SLA targets: P1 95% · P2 90%               │
│ [Edit]  [Pause]  [View performance]         │
└──────────────────────────────────────────────┘
```

Paused and Archived teams are shown in collapsed sections below active teams.

### 8.3 SOMConfig Keys for Team Management

All team management defaults are stored in the SOMConfig extension (`teamManagement.*`). Every change is versioned and auditable.

| Key | Default | Type | Description |
|---|---|---|---|
| `teamManagement.defaultTeamSLATargets.P1CompliancePct` | **95** | number | Default P1 SLA target applied to new teams. Editable per-team after creation. |
| `teamManagement.defaultTeamSLATargets.P2CompliancePct` | **90** | number | Default P2 SLA target. |
| `teamManagement.defaultTeamSLATargets.P3CompliancePct` | **85** | number | Default P3 SLA target. |
| `teamManagement.defaultTeamSLATargets.P4CompliancePct` | **80** | number | Default P4 SLA target. |
| `teamManagement.teamCapacityDefaultMultiplier` | **20** | integer | Default team capacity = this × member count. Editable per-team. |
| `teamManagement.temporaryAttachmentMaxDays` | **90** | integer | Maximum duration in days for a temporary team attachment. |
| `teamManagement.durabilityFlagThresholdForCoaching` | **0.75** | number | Analysts with RDS below this are flagged in Team Performance Dashboard for coaching. |
| `teamManagement.attachmentExpiryWarningHours` | **24** | integer | Hours before attachment expiry that SOM receives notification. |
| `teamManagement.deputyAutoActivateOnOOO` | **true** | boolean | Deputy leader automatically activates when team leader sets out-of-office. |

### 8.4 Team Performance Configuration

| Key | Default | Type | Description |
|---|---|---|---|
| `teamPerformance.dashboardRefreshSeconds` | **60** | integer | How frequently Case Pulse Team Performance metrics refresh. |
| `teamPerformance.defaultTimeWindow` | **"7d"** | string | Default time window shown on Team Performance Dashboard (Today, 7d, 30d, 90d). |
| `teamPerformance.comparisonTableDefaultSort` | **"casesClosedDesc"** | string | Default sort for team comparison table. |
| `teamPerformance.momentumAmberThreshold` | **1.5** | number | Team momentum avg below this = amber on team card. |
| `teamPerformance.momentumRedThreshold` | **0** | number | Team momentum avg below this (negative) = red on team card. |
| `teamPerformance.stallingCountRedThreshold` | **3** | integer | Stalling case count at or above this = red on team card. |
| `teamPerformance.capacityAmberThresholdPct` | **80** | number | Team capacity utilisation above this % = amber. |
| `teamPerformance.capacityRedThresholdPct` | **95** | number | Team capacity utilisation above this % = red. |
| `teamPerformance.pushRateAmberThresholdPct` | **20** | number | Push action rate below this % = amber. |
| `teamPerformance.commanderEngagementAmberPct` | **40** | number | Commander AI engagement rate below this % = amber on team card. |

### 8.5 Team Management Audit Trail

All team management actions — create, edit, pause, archive, attach, detach, change leader — are written to the tenant audit trail with the same tamper-evident model as CCHE parameter changes.

```json
{
  "eventType":    "team_updated",
  "tenantId":     "tenant-id",
  "changedBy":    "som-user-id",
  "teamId":       "team-uuid",
  "teamName":     "Identity & Cloud Operations",
  "action":       "member_added",
  "changeDetail": { "userId": "analyst-uuid", "assignmentType": "permanent" },
  "changeReason": "Onboarding new analyst following headcount approval.",
  "timestamp":    "2026-04-26T10:00:00Z",
  "auditHash":    "sha256-...",
  "previousHash": "sha256-..."
}
```

---

## 9. Enhancement Configuration Keys

The following additional SOMConfig sections govern the cognitive and operational enhancements committed in Spec #8 Sections 18–23. They are configurable in the SOM Configuration Panel under **CCHE Configuration → Advanced**.

### 9.1 CRS Confidence

```
Section: CRS Data Freshness

  Stale CRS alert threshold (P1/P2):  [30] minutes
    How long a P1/P2 case CRS must be Stale-badged before Case Pulse alert fires.

  Stale badge threshold (CI half-width): [15]
    CRS confidence interval half-width above which badge shows ● Stale.

  Estimated badge threshold:           [5]
    Half-width above which badge shows ◐ Estimated.
```

### 9.2 Resolution Durability

```
Section: Resolution Durability

  Durability check windows:   30 days  60 days  90 days  (fixed — not configurable)

  Coaching flag threshold:    [75]%
    Analysts with RDS below this appear in Team Performance Dashboard coaching list.

  Assignment bonus threshold: [90]%
    Analysts above this RDS receive +0.05 skillMatch bonus on complex sub-cases.
```

### 9.3 Business Impact

```
Section: Business Impact

  ● Enabled   ○ Disabled
  Currency symbol:  [£]

  Asset value policies are configured in:
  Platform Administration → Business Impact → Asset Value Policies
  [Go to Asset Value Policies]
```

### 9.4 Case Trajectory

```
Section: Case Trajectory

  SLA breach alert threshold:  [60]%
    SLA breach probability above this fires Case Pulse alert on P1/P2 cases.

  Trajectory window:  [72] hours
    Rolling window used for trajectory computation.
```

### 9.5 Case Resonance

```
Section: Case Resonance Engine

  ● Enabled   ○ Disabled

  Surge detection window:    [120] minutes
  Surge case count trigger:  [5] cases  (within the detection window)

  Conflict gate:  ● Enabled   ○ Disabled
    When enabled, push sub-cases with a detected remediation conflict
    cannot execute until the conflict is resolved or the SOM overrides.
```

### 9.6 Commander Silent Monitor

```
Section: Commander Silent Monitor

  ● Enabled   ○ Disabled

  NBA divergence window — P1:  [4] hours
  NBA divergence window — P2:  [12] hours
  Rate limit per case per 24h: [2] observations

  Deliver observations to:
    ● SOM only (Case Pulse)
    ○ SOM and case analyst
    ○ Case analyst only
```


### 9.7 Progressive Complexity Assignment

```
Section: Progressive Complexity Assignment

  Phase 1 gate (days 0–30) max impact weight:  [4]
  Phase 2 gate (days 31–60) max impact weight: [7]
  Phase 1 duration:  [30] days
  Phase 2 duration:  [60] days   (gate removed at day 61)

  Team Leader visibility window:  [60] days
    New analyst flag (▲) shown to Team Leader for this many days.
    Disappears automatically — no action required.

  ⓘ The complexity gate controls what the system auto-pushes to new analysts.
  New analysts can still self-assign higher-complexity cases from the queue.
  [Override gate for specific analyst — Platform Administration → Users → [name]]
```

### 9.8 Cross-Tenant Institutional Memory

```
Section: Platform Intelligence — Institutional Memory

  Contribution:  ● Opted in   ○ Opted out
    When opted in, anonymised pattern signatures from closed cases are contributed
    to the platform-level pattern store. No case content, no entity names, no tenant
    attribution is included in signatures.

  Query:  ● Opted in   ○ Opted out
    When opted in, your cases receive platform intelligence from other tenants'
    anonymised pattern data. Population minimum: 5 cases from 3+ tenants before
    any pattern is surfaced.

  ⓘ Opting out of contribution does not affect your ability to receive query results
  from other tenants' contributions (and vice versa). Each setting is independent.

  [Change opt-in status — requires change reason and SOM or Platform Admin authority]
```

### 9.9 Case Association and Pattern Engine

```
Section: Case Association and Pattern Engine

  Master switch:  ● Enabled   ○ Disabled

  Signal types:
    ☑ Structural clustering      (same rule / entity — deterministic)
    ☑ Resolution path similarity (same fix sequence — algorithmic)
    ☑ Temporal interval mining   (recurrence projection — statistical)
    ☑ Thematic note clustering   (OpenSearch TF-IDF — statistical)

  Temporal mining settings:
    Case history lookback:      [365] days
    Minimum sample size:        [5] prior recurrences
    Sweep lead time:            [7] days before projected recurrence

  Thematic clustering settings:
    Refresh cadence:            [6] hours
    Min shared terms:           [3]
    Min cases per cluster:      [3]
    Resolution path lookback:   [90] days
```


### 9.10 Commander Thematic Intelligence

```
Section: Commander Thematic Intelligence

  ● Enabled   ○ Disabled

  Max cases per analysis context:  [20]
    The maximum number of cases submitted to Commander in a single thematic
    analysis. Clusters exceeding this are split into sub-clusters automatically.

  Hypothesis expiry:  [72] hours
    Undecided hypotheses expire after this period. Retained in history.

  Rejection memory:   [14] days
    If a similar hypothesis is re-triggered within this window, the prior
    rejection and its rationale are surfaced to the SOM before deciding.

  Confidence thresholds:
    High confidence requires:    [3] distinct evidence types
    Medium confidence requires:  [2] distinct evidence types

  Cross-queue trigger minimum:  [3] cases
    Thematic analysis is triggered when a cross-queue cluster reaches this size.

  Monitor Only reminder:  [48] hours
    When SOM accepts a Monitor Only response, a review reminder fires after
    this period if the cluster has not been resolved.

  Incident declaration:
    ● Require explicit active compromise evidence before recommending DeclareIncident
    ○ Allow DeclareIncident based on risk indicators alone

  ⓘ Thematic Intelligence analyses are triggered automatically when cluster
  signals meet the configured thresholds. The SOM can also manually request
  analysis from any algorithmic cluster in the Proactive Intelligence panel.
```

---

*SOM Configuration Panel Specification v1.3 — Complete. Section 9.10 added: Commander Thematic Intelligence configuration panel with all SOMConfig keys from Spec #8 Section 31.10. Reconciled to Spec #8 v1.3 and MTS v6.1. All capabilities fully specified and auditable.*


---

# SOM Configuration Panel Addendum v1.6 — Communication Governance Controls

## Communication Administration Controls

The SOM Configuration Panel and/or Admin Communication Setup SHALL expose tenant-configurable controls for:

```text
mailbox ownership
team-mailbox mapping
case-type mailbox defaults
communication permission and approval chain matrix
SIR destination and approval policy
inbound allocation queue ownership
manual allocation queue ageing thresholds
recipient classes
redaction/safe-summary policy
attachment/evidence inclusion policy
communication closure gates
mailbox health alert thresholds
template governance and versioning
```

## Configurable Permissioning

No communication permission SHALL be hard-coded to a fixed grade model. Default templates MAY map common grades/roles to draft/send/approve rights, but tenant administrators SHALL be able to override them.

## Approval Chain Configuration

Approval chains SHALL support upward chain-of-command routing based on parent case, sub-case/action, swarm/workstream, team, queue and mailbox ownership. SOM preview SHALL show the effect of proposed approval policy changes before save.

## SIR Configuration

SIR configuration SHALL include:

```text
sir.enabled
sir.defaultDestinationMailboxId
sir.defaultSenderMailboxId
sir.approvalPolicyId
sir.requiredFields
sir.includeEvidencePolicy
sir.acknowledgementSlaHours
sir.followUpEscalationPolicy
sir.availableFromParentCase
sir.availableFromSubCase
sir.availableFromAction
sir.availableFromSwarmWorkstream
```

## Communication Closure Gates

Configuration SHALL allow closure gates by case type, including external notifier update, final closure email, SIR acknowledgement, unresolved inbound allocation, open sub-case thread and suppression reason requirement.


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

# DOCUMENT-SPECIFIC REVISION PATCH — SOM_Configuration_Panel_Spec_v1_6.md

**Patch date:** 2026-05-13  
**Patch type:** Functional review remediation  
**Authority:** Closed-loop doctrine patch v2.0  

## Required Update Applied

This document is updated to align with Commander SDR closed-loop doctrine and the functional review remediation baseline.

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

