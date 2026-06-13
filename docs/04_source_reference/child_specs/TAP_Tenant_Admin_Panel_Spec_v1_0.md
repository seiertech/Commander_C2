> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# SDR Tenant Admin Panel — Feature Control Specification
## Document ID: TAP-001 | Version: 1.0 | May 2026

**Purpose:** Specifies the tenant-facing administration panel where a customer's own admin user configures and controls their SDR instance. This is distinct from the operator console (your team) and from the Control Plane (cross-instance commercial management).

**Authority:** This spec governs what tenant admins can see and configure. It does not govern what the operator console can do. Feature availability in this panel is always bounded by the entitlement manifest delivered by the Control Plane — tenant admins can only configure features that are commercially entitled for their instance.

**Relates to:** FR-001 (Feature Registry), SDR_Control_Plane_Specification_v1_0.md, MTS Section 16, MTS Section 17.14, Proposition Section 16.

---

## 1. Panel Architecture

### 1.1 Access and Location

The Tenant Admin Panel lives at `/settings/*` within the customer-facing application (`app.commandersdr.com`). It is not a separate application — it is a protected section of the existing web application accessible only to users with the `tenant_admin` or `tenant_super_admin` RBAC role.

It is NOT the operator console at `admin.commandersdr.com`. Those are separate with completely separate authentication and completely separate data access scope.

### 1.2 Authentication

Tenant admins authenticate via their company SSO exactly as any other user. The `tenant_admin` persona is assigned by the operator during tenant onboarding. Additional admins can be promoted by the existing tenant admin. There is no shared password or master admin credential.

### 1.3 Panel Navigation Structure

```
Settings (/settings)
├── Overview                         ← entitlement status, usage gauges, quick links
├── Features                         ← the feature control panel (this spec)
│   ├── Detection & Models
│   ├── Case Management
│   ├── Communication
│   ├── Push Execution
│   ├── Commander AI
│   ├── Compliance
│   ├── Identity Intelligence
│   ├── Reporting
│   └── Platform
├── Connectors                       ← connector management
├── Users & RBAC                     ← user management
├── Commander AI                     ← model provider config
├── SLA Policies                     ← SLA configuration
├── Coverage Model                   ← coverage stack configuration
├── Notifications                    ← notification and escalation config
├── Communication Channels           ← Teams/Slack/Email config
├── Compliance Frameworks            ← framework selection and mapping
├── Audit & Export                   ← audit trail access and export
└── Billing & Licence                ← read-only licence and usage view
```

### 1.4 The Three States of Every Feature

Every feature the tenant admin can see is in one of three states rendered consistently across the panel.

**ENTITLED + ACTIVE** — The feature is in the commercial entitlement manifest AND has been enabled. Green indicator. Toggle is ON. Full configuration options visible.

**ENTITLED + INACTIVE** — The feature is in the manifest but has been turned off (either by the tenant admin or by the operator as the default). Amber indicator. Toggle is OFF. Brief description of what enabling it will do. No upgrade prompt.

**NOT ENTITLED** — The feature is not in the entitlement manifest. Grey locked state. Description of what the feature does. Upgrade prompt: "This feature requires [module name]. Contact your account manager." No toggle. No configuration options visible.

**OPERATOR-CONTROLLED (not tenant-configurable)** — The feature is active but controlled exclusively by the operator. Tenant admin sees a status indicator ("Active") with a lock icon and a tooltip: "This feature is managed by the SDR platform. Contact support if you have questions." No toggle.

---

## 2. Features Panel — Section by Section

### 2.1 Detection & Models

This section controls what the drift and rule engine does within the tenant's instance.

**Auto-activate New Detection Models**
Flag: `feat.detection.model_updates_auto`
Control scope: tenant-admin
What it does: When SDR releases new built-in detection models, they automatically become active for this tenant. If OFF, new models are deployed but not active — the tenant admin must review and activate each one manually.
Recommendation shown: "Keep ON unless your security team wants to review every new model before it fires. Turning this off means new detections won't run until you activate them."
Default: ON

**Per-Model Suppression**
Flag: `feat.detection.model_suppress_individual`
Control scope: tenant-admin
What it does: Enables the tenant to suppress individual detection models that generate false positives or are not relevant to their estate. Each suppression is logged with mandatory justification.
Default: ON
Sub-configuration when enabled: Link to Detection Model Library where individual models can be suppressed.

**Custom Rule Builder**
Flag: `feat.detect_full.custom_rule_builder`
Entitlement gate: `detection_full`
Control scope: tenant-admin
What it does: Enables security architects to author custom YAML drift detection rules.
Default when entitled: ON
Sub-configuration when enabled: Maximum active custom rules (limit from licence), rule staging lifecycle settings.

**Ghost Asset Detection**
Flag: `feat.detection.ghost_asset_detection`
Control scope: tenant-admin
What it does: Detects assets that appear in ingested data but have no ownership record, no coverage assignment, and no asset cartography tags.
Default: ON
Configuration option: Ghost asset inactivity threshold (days before an asset is flagged — default 30 days).

**Platform Health Signal Detection**
Flag: `feat.detection.platform_health_signals`
Control scope: operator-only (visible to admin as status only — cannot toggle)
What it does: Detects when connected security tools are degraded, unhealthy, or providing stale data.

---

### 2.2 Case Management

This section controls case lifecycle behaviour, routing, and operational features.

**Automatic Case Creation**
Flag: `feat.case.creation_auto`
Control scope: tenant-admin
What it does: Findings from the drift engine automatically generate cases. If OFF, new detection logic may be held from activation, but any actionable finding produced by active logic SHALL still bind to a case or approved suppression object. No actionable finding may require manual promotion to become case-bound.
Recommendation: "Leave ON. Turning this off means drift findings accumulate without becoming actionable cases."
Default: ON

**SLA Engine**
Flag: `feat.case.sla_engine`
Control scope: tenant-admin (on/off) + sub-configuration
What it does: SLA timers apply to cases based on severity. Breach alerts fire when SLA is exceeded.
Default: ON
Sub-configuration when enabled:
- SLA policy per severity (P1/P2/P3/P4 — target hours, breach escalation)
- SLA tag multipliers (e.g. production assets get 0.5× SLA multiplier — half the time)
- Post-remediation auto-validation window

**Case Focus Timer and Stalling Detection**
Flag: `feat.case.focus_timer`
Control scope: tenant-admin
What it does: Tracks how long a case has been in "Investigating" state without analyst activity. Cases that stall beyond threshold are flagged.
Default: ON
Configuration: Stalling threshold in hours (default 4 hours for P1/P2, 24 hours for P3/P4).

**Case Collaboration (Contributors and Swarm)**
Flag: `feat.workflow.case_collaboration`
Control scope: tenant-admin
What it does: Allows multiple analysts to be added as contributors to a case. Enables Case Swarm for complex cases requiring multi-analyst investigation.
Default: ON

**Batch Case Processing**
Flag: `feat.workflow.batch_processing`
Control scope: operator-only (active when enabled — no tenant toggle)

**Security Incident Referral (SIR)**
Flag: `feat.workflow.sir`
Control scope: operator-sets-tenant-configures
What it does: Enables analysts to raise a Security Incident Referral from a case, routing it to the incident response team.
Operator enables: The SIR capability for this tenant.
Tenant admin configures: The SIR destination — email address or ITSM queue to receive referrals, referral template, SLA tracking.

**Case Notes, Metrics, and Workload Management**
Flag: `feat.workflow.case_notes_metrics`
Control scope: tenant-admin
What it does: Case notes, per-analyst metrics, workload caps, and concurrent case limits.
Default: ON
Configuration: Max concurrent cases per analyst grade (L0/L1/L2/L3), case note templates.

---

### 2.3 Communication Channels

This section configures integration with enterprise communication platforms. All channels require the relevant platform integration to be configured before being usable in cases.

**Microsoft Teams — Case Communication**
Flag: `feat.teams.case_chat`
Control scope: operator-sets-tenant-configures
Operator enables: The Teams integration for this tenant.
Tenant admin configures:
- Microsoft 365 tenant ID and Graph API credentials
- Which case personas can initiate Teams chats (all analysts / L2+ only / all)
- Teams transcript auto-import policy (never / on analyst request / for P1/P2 automatically)

Sub-features (visible once Teams is configured):
- One-Click Teams Call: `feat.teams.one_click_call` — tenant-admin toggle — default ON
- Meeting Scheduling: `feat.teams.meeting_schedule` — tenant-admin toggle — default ON
- On-Demand Transcript Import: `feat.teams.transcript_import` — tenant-admin toggle — default ON

**Command Bridge**
Flag: `feat.teams.command_bridge`
Control scope: operator-sets-tenant-configures
Tenant admin configures: The management channel in Teams/Slack that receives Command Bridge escalations. Channel name, who can initiate (L1+ / L2+ only).

**Operations Channel Broadcast**
Flag: `feat.teams.ops_channel_broadcast`
Control scope: operator-sets-tenant-configures
Tenant admin configures: The operations channel in Teams/Slack. Who can post (L0+ / L1+ / L2+ only).

**Slack — Case Communication (Phase 2)**
Flag: `feat.slack.case_chat`
Control scope: operator-sets-tenant-configures
Status in panel when Phase 1: "Coming in Phase 2" — greyed out with phase label.

**Closed-Loop Email**
Flag: `feat.email.closed_loop_mode`
Entitlement gate: `email_ingestion`
Control scope: operator-sets-tenant-configures
Operator enables: Email ingestion entitlement for this tenant.
Tenant admin configures:
- Approved mailboxes (user, shared, or Microsoft 365 group mailboxes — add/remove)
- SendAs vs SendOnBehalf policy per mailbox
- Inbound reply correlation (toggle per mailbox)
- SLA reminder schedule (hours before SLA breach, reminder sends)
- No-response escalation threshold (hours, escalation action)

Sub-features (visible once closed-loop email is configured):
- Outbound Case Email: `feat.email.outbound_case_email` — tenant-admin toggle — default ON
- Inbound Reply Correlation: `feat.email.inbound_reply_correlation` — operator-only (shown as active)
- SLA-Driven Reminders: `feat.email.sla_reminders` — tenant-admin toggle — default ON
- No-Response Escalation: `feat.email.no_response_escalation` — tenant-admin toggle — default ON

**Vulnerability Notification Ingestion**
Flag: `feat.email.vuln_notification_ingestion`
Entitlement gate: `email_ingestion`
Control scope: operator-sets-tenant-configures
Tenant admin configures: Which approved mailboxes receive vulnerability notification emails, which senders are trusted (CISA, vendor advisory domains), cross-reference settings.

**IOC Email Triage**
Flag: `feat.email.ioc_email_triage`
Entitlement gate: `email_ingestion`
Control scope: operator-sets-tenant-configures
Tenant admin configures: IOC email sources, triage workflow, auto-case generation thresholds.

---

### 2.4 Push Execution

This section controls push capability settings. Push must be enabled at the operator level before any tenant admin settings apply.

**Single-System Push**
Flag: `feat.push.single_system`
Entitlement gate: `push`
Control scope: operator-sets-tenant-configures
Operator enables: Push entitlement.
Tenant admin configures: Which connectors have push enabled (per-connector toggle — each shows: connector name, push actions available, last push date, push action count this month).

**Coordinated Multi-System Push**
Flag: `feat.push.coordinated_groups`
Entitlement gate: `push` (Enterprise tier)
Control scope: operator-sets-tenant-configures
Tenant admin configures: Allowed push group configurations, maximum simultaneous push targets.

**Emergency Device Isolation (Red Button)**
Flag: `feat.push.red_button_isolation`
Entitlement gate: `push`
Control scope: operator-sets-tenant-configures
Operator enables: Red Button capability for this tenant (treated as highest-sensitivity capability).
Tenant admin configures: Who can initiate Red Button (L3 only / L2+ with dual approval), notification list, auto-escalation post-isolation.

**Monthly Push Action Budget**
Flag: `feat.push.monthly_budget`
Control scope: operator-sets-tenant-configures
Operator sets: Maximum push actions per month (from licence limits).
Tenant admin configures: Warning threshold (default 80%), which admin users receive warnings, whether to allow burst above budget with manual approval.

**Change Control / CAB Alignment (Phase 2)**
Flag: `feat.push.change_control_cab`
Control scope: tenant-admin
Status: "Coming in Phase 2."

---

### 2.5 Commander AI

This section configures the Commander AI framework. All Commander functionality requires a model provider to be configured.

**Model Provider Configuration**
Flag: `feat.commander.model_provider_config`
Entitlement gate: `commander`
Control scope: operator-sets-tenant-configures (operator enables Commander, tenant admin configures the model)
Tenant admin configures:
- Provider type: Azure OpenAI / Anthropic / AWS Bedrock / Google Vertex / Self-hosted (OpenAI-compatible)
- API endpoint and credentials (stored in SDR Secrets Manager — never shown again after save)
- Model selection (dropdown of supported models per provider)
- Validation suite: runs automatically after save — tests connectivity, capability, security content handling
- Commander activates only when validation passes

**Operating Mode Controls**
Entitlement gate: `commander`
Control scope: operator-sets-tenant-configures (operator enables Commander, tenant admin can disable individual modes)

| Sub-feature | Flag | Default when entitled | Tenant can disable? |
|---|---|---|---|
| Estate Mode | `feat.commander.mode_estate` | ON | Yes |
| Engineering Mode | `feat.commander.mode_engineering` | ON | Yes |
| Architectural Mode | `feat.commander.mode_architecture` | ON | Yes |
| Threat Triage Mode | `feat.commander.mode_threat_triage` | ON | Yes |

**Token Consumption Visibility**
Flag: `feat.commander.token_visibility`
Control scope: tenant-admin
What it does: Shows token usage, estimated AI cost, and breakdown by operation type in the Commander admin dashboard.
Default: ON (tenant can hide if preferred)

**Request Rate Limiting**
Flag: `feat.commander.rpm_limit`
Control scope: operator-sets-tenant-configures
Operator sets: Maximum Commander requests per month (from licence).
Tenant admin configures: Per-analyst rate limits, burst allowance, warning threshold.

**Auto Case Summary for P1/P2**
Flag: `feat.commander.auto_case_summary_p1p2`
Entitlement gate: `commander`
Control scope: tenant-admin (can turn off if token cost is a concern)
Default: ON
Note shown when turning off: "Auto-summaries consume Commander tokens at case creation. Turning this off reduces token usage but means P1/P2 cases arrive without a pre-generated intelligence summary."

---

### 2.6 Identity Intelligence

This section controls identity computation settings. Stage 2/3 computation requires the `identity_advanced` entitlement.

**Stage 3 Sweep Schedule**
Flag: `feat.identity.stage3_schedule`
Entitlement gate: `identity_advanced`
Control scope: tenant-admin
What it does: Controls when the full-estate identity sweep runs.
Options: On-demand only / Daily (configurable time) / Weekly (configurable day and time) / Suppressed.
Default: Weekly, Sunday 02:00 tenant timezone.

**Identity Risk Score Weight Configuration**
Flag: `feat.identity.risk_weight_config`
Entitlement gate: `identity_advanced`
Control scope: tenant-admin
What it does: Adjusts the weighting of the 10 identity risk score components. Useful for organisations where some risk factors are more material than others (e.g. a financial services firm might weight standing access penalties higher).
Default: SDR-defined default weights.
Reset to defaults: available as one-click action.
Note: Shown with each weight's current value and the SDR default. Changes take effect on next risk score recomputation.

**High-Risk Watchlist**
Flag: `feat.identity.high_risk_watchlist`
Entitlement gate: `identity_advanced`
Control scope: tenant-admin (can disable if not needed)
Configuration: Watchlist threshold (minimum risk score to appear), notification recipients, review cadence.

**Offboarding Detection**
Flag: `feat.identity.offboarding_detection`
Entitlement gate: `identity_advanced`
Control scope: tenant-admin
Configuration: Offboarding signal sources (HR connector if available, manual offboarding date field), grace period before finding is raised, escalation path.

---

### 2.7 Compliance and Posture

**Compliance Framework Selection**
Flag: `feat.compliance.framework_mapping`
Entitlement gate: `compliance`
Control scope: tenant-admin
What it does: Selects which compliance frameworks are active for this tenant.
Available frameworks: ISO 27001, SOC 2, PCI-DSS, HIPAA, NIST CSF, CIS Controls, NIS2, DORA, FCA, and others.
Multiple frameworks can be active simultaneously.
Note: When a new framework version is released (e.g. CIS v8.1), the platform notifies the tenant admin and asks them to confirm adoption. Old version remains active until tenant confirms migration.

**Evidence Pack Export**
Flag: `feat.compliance.evidence_export`
Entitlement gate: `compliance`
Control scope: tenant-admin
Configuration: Which personas can export evidence packs (all compliance users / L2+ only), export format (PDF / structured JSON), scheduled exports.

**Exception and Waiver Management**
Flag: `feat.compliance.exception_waiver`
Entitlement gate: `compliance`
Control scope: tenant-admin
Configuration: Exception approval workflow (who approves exceptions — L3 only / CISO role only), maximum exception duration, mandatory review schedule.

**Regulatory Calendar**
Flag: `feat.compliance.regulatory_calendar`
Entitlement gate: `compliance`
Control scope: tenant-admin
Configuration: Which regulatory deadlines appear, notification lead times, notification recipients.

---

### 2.8 Reporting and Dashboards

**CISO View**
Flag: `feat.report.ciso_view`
Control scope: operator-only (shown as active — no toggle)

**Domain Security Dashboards**
Flag: `feat.report.domain_dashboards`
Control scope: operator-only (shown as active — no toggle)

**PDF Report Export**
Flag: `feat.report.pdf_export`
Control scope: tenant-admin
Configuration: Which report types are available for export, which RBAC roles can export.

**Scheduled Report Generation**
Flag: `feat.report.scheduled_generation`
Control scope: tenant-admin
Configuration: Which reports run on schedule, cadence (weekly/monthly), recipients, delivery method (email / in-app only).

---

### 2.9 Platform Configuration

**Safe View Mode**
Flag: `feat.asset.safe_view_mode`
Control scope: operator-sets-tenant-configures
Operator enables: Safe View Mode capability for this tenant.
Tenant admin configures: Whether Safe View Mode is active, which user roles see masked data, which fields are masked (hostname / IP address / username / email address — individual toggles per field type).

**Asset Rationalisation Tracking**
Flag: `feat.asset.rationalisation`
Control scope: tenant-admin
Configuration: Assets flagged for rationalisation review, review cadence, responsible owner.

**Notification and Escalation Rules**
Flag: `feat.notification.auto_escalation`
Control scope: tenant-admin
Configuration: Custom escalation rules per case type and severity, notification destinations (in-app / email / Teams / Slack), escalation delay thresholds, on-call contact rotation.

**Maintenance Window Configuration**
Flag: `feat.notification.maintenance_window`
Control scope: tenant-admin
Configuration: Recurring maintenance windows (day, time, duration), which case types are suppressed during maintenance windows, push action blocking during maintenance windows.

**Admin Alert Queue**
Flag: Implicit — always active for tenant admins
What it shows: Unowned assets, unclassified assets, pending trust boundary enrichments, stale ownership, configuration review reminders.
Configuration: Which admin alert types are active, batch action permissions (batch tag / batch assign owner / batch classify).

---

## 3. Billing & Licence Panel (Read-Only)

This panel gives tenant admins visibility into their commercial position. It is read-only — no changes can be made from here. Changes require contacting the account manager.

### What It Shows

**Licence Summary**
- Licence tier (Core / Professional / Enterprise / Custom)
- Contract start and end dates
- Support tier (Standard / Priority / Premium)

**Active Entitlements**
A list of all entitlement modules in the manifest, each showing: module name, activation date, whether it is in trial (with expiry countdown), status (Active / Trial / Inactive).

For inactive (not-entitled) modules: module name, description, "Not included in your licence — contact your account manager."

**Usage Against Limits**
Bar charts per metric:
- Assets: current / limit — with trend arrow (growing / stable / shrinking)
- Connectors: current / limit
- Users: current / limit
- Commander AI requests this month: current / limit — with daily burn rate
- Push actions this month: current / limit
- Storage: current / limit (GB)

Warning state (80%+): amber bar, warning icon, text "You are approaching your [metric] limit."
Exceeded state (100%): red bar, alert icon, text "You have reached your [metric] limit. Some actions are blocked. Contact your account manager."

**Usage History**
Monthly trend charts for each metric over the last 12 months. Shows whether usage is growing and at what rate — useful for renewal planning conversations.

**Trial Expiry (if applicable)**
For any module in trial state: days remaining, what happens on expiry (features lock), upgrade path.

**Version Information**
Current platform version (git SHA), last deployed date. Both environments (if multiple are registered). Confirms tenant is up to date.

---

## 4. Entitlement Enforcement in the UI

### 4.1 Locked Feature Presentation

When a tenant admin views a feature their instance is not entitled to:

```
┌─────────────────────────────────────────────────────┐
│  🔒  Connected Architecture                          │
│                                                     │
│  Unlimited chained environments, group CISO view    │
│  across subsidiaries, cross-entity posture          │
│  comparison, and M&A analyst mode.                  │
│                                                     │
│  This module is not included in your current        │
│  licence.                                           │
│                                                     │
│  [Contact your account manager]                     │
└─────────────────────────────────────────────────────┘
```

No toggle. No configuration. No error message. Just a clear, non-aggressive locked state with an upgrade path.

### 4.2 Trial State Presentation

When a module is in trial:

```
┌─────────────────────────────────────────────────────┐
│  🔵  Identity Advanced Intelligence    TRIAL: 14 days remaining │
│                                                     │
│  [ON] ●━━━━━━━━━━━━━━━━━━━━━━━━━━○                 │
│                                                     │
│  Stage 2/3 identity chain computation, access       │
│  path risk scoring, group intelligence.             │
│                                                     │
│  Your trial ends 26 May 2026. After that, this      │
│  module will be deactivated unless added to your    │
│  licence.                                           │
│                                                     │
│  [Contact your account manager to convert]          │
└─────────────────────────────────────────────────────┘
```

### 4.3 Operator-Controlled Feature Presentation

```
┌─────────────────────────────────────────────────────┐
│  🔒  Immutable Audit Trail              ACTIVE       │
│                                                     │
│  All platform events written to an append-only      │
│  tamper-evident audit trail.                        │
│                                                     │
│  This feature is managed by the SDR platform and    │
│  cannot be disabled. Contact support if you have    │
│  questions.                                         │
└─────────────────────────────────────────────────────┘
```

---

## 5. Configuration Change Audit

Every change made in the Tenant Admin Panel is logged in the tenant's own audit trail with:
- Which admin user made the change
- What feature or setting was changed
- Old value and new value
- Timestamp

This is distinct from the Operator Audit Trail (which logs your team's actions). The tenant's configuration audit trail is accessible to the tenant admin and is included in audit exports.

Tenant admins cannot modify or delete their configuration audit trail. It uses the same append-only mechanism as the security case audit trail.

---

## 6. Relationship to Control Plane

The Tenant Admin Panel enforces what the Control Plane says the tenant is entitled to. The sequence on every settings page load:

```
Tenant admin loads /settings/features
    ↓
Application reads entitlement manifest from Redis cache
(refreshed from Control Plane hourly)
    ↓
For each feature in the registry:
  if manifest.entitlements[module] === true AND feature.scope includes 'tenant-admin':
    render feature as configurable
  elif manifest.entitlements[module] === true AND feature.scope === 'operator-only':
    render feature as operator-controlled (lock icon, status display)
  elif manifest.entitlements[module] === false:
    render feature as locked (upgrade prompt)
    ↓
Tenant admin changes a setting:
  Save to tenant configuration in database
  Log to tenant configuration audit trail
  Apply immediately (no restart required)
```

The Tenant Admin Panel never calls the Control Plane directly. It reads the locally cached manifest. The manifest is the single source of commercial truth delivered by the Control Plane.

---

## 7. Phase Delivery

**Phase 1 — Minimum viable admin panel (before first pilot goes live)**
- Overview panel with entitlement status and usage gauges
- Features panel for all entitled tenant-admin-configurable features
- Connectors panel
- Users & RBAC panel
- Commander AI model provider configuration
- SLA Policies
- Communication Channels (Teams configuration)
- Billing & Licence read-only panel

**Phase 2 — Extended configuration**
- Compliance Frameworks panel
- Scheduled reporting
- Advanced notification rules
- Slack integration configuration
- Strategic and tactical priority framework configuration
- Extended SOM configuration


---

# DOCUMENT-SPECIFIC REVISION PATCH — TAP_Tenant_Admin_Panel_Spec_v1_0.md

**Patch date:** 2026-05-13  
**Patch type:** Functional review remediation  
**Authority:** Closed-loop doctrine patch v2.0  

## Required Update Applied

This TAP specification is updated so tenant settings cannot create unbound actionable findings or disable mandatory case binding.

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



## v2.2 Tenant Admin Update — P0 Zero-Day Policy

Tenant Admin must include a P0 Zero-Day Priority Policy page controlling: role authority, approval mode, auto-trigger thresholds, SLA profile, routing profile, communication profile, validation cadence, audit retention, emergency swarm rules, and dashboard visibility.
## v2.3 Tenant Admin UI Doctrine Update
Tenant Admin uses controlled administrative styling under the Commander UI doctrine. It must expose P0 policy configuration, SLA/routing/validation/automation policy editors, connector controls, feature activation within entitlement, AI guardrails, communication settings, audit/export, and read-only licence state. It must not expose internal commercial licence allocation.

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
