> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy. See `GUIDANCE_NOTICE.md` for precedence rules.

# Case Workflow Workbench — Control Plane Specification

**Status:** Design Authority — Pre-Build Specification  
**Version:** 1.0  
**Date:** 2026-06-13  
**Owner:** Johann / Commander C2 Architecture  
**Location:** Control Plane (Seiertech internal application)  
**Thesis conformance:** snake_case, standard_marker, ITIL 4 + CTEM workflow governance  
**Governing specs:** MTS v7.0 §12; Specs #08, #14, #17, #29, #55; Control Plane Spec v1.1  
**Dependencies:** CRAW Engine v2.0, Connector Registry, Remediation Action Matrix  
**Build phase:** Built AFTER the CRAW Engine contracts are in place; first test workbench used to validate the engine end-to-end

---

## 1. Purpose

The Case Workflow Workbench is the **editable workspace in the Control Plane** where Seiertech configures:

1. **API Functions** — what each connector endpoint does and what it returns
2. **Case Type Mappings** — what findings from that function mean, and which case type they create
3. **Remediation Actions** — stacked actions per workflow (manual, data display, push, AI-enriched)
4. **AI Enhancements** — where Commander AI adds value (summary, enrichment, technical detail)

It is NOT a tenant-facing tool. Tenants see the RESULTS of workbench configuration (available workflows, execution mode choices). Seiertech BUILDS the workflows here.

The workbench grows over time:
- Day 1: Pull connectors only → manual remediation actions
- Day N: Push connectors added → push actions become available on existing workflows
- Day N+1: AI wired → AI tick-boxes light up on existing workflows

---

## 2. Workbench Structure — Three Panels

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     CASE WORKFLOW WORKBENCH                                  │
├────────────────────┬─────────────────────────┬─────────────────────────────┤
│  PANEL 1           │  PANEL 2                │  PANEL 3                    │
│  API FUNCTION      │  CASE TYPE MAPPING      │  REMEDIATION ACTIONS        │
│  REGISTRY          │  & TRIGGER CONDITIONS   │  (stacked, ordered)         │
│                    │                         │                             │
│  What we pull      │  What it means          │  What to do about it        │
│  from where        │  which case type        │  manual / display / push    │
└────────────────────┴─────────────────────────┴─────────────────────────────┘
```

---

## 3. Panel 1: API Function Registry

### 3.1 Purpose

Register every API endpoint/function that Commander can call, with its schema, description, and classification.

### 3.2 Fields Per API Function

| Field | Type | Required | Description |
|---|---|---|---|
| api_function_id | string | Yes | Unique identifier |
| connector_definition_id | string | Yes | Which connector this belongs to |
| vendor | string | Yes | Vendor name (AWS, CrowdStrike, Tenable, Microsoft) |
| product | string | Yes | Product (Security Hub, Falcon, Tenable.io, Entra ID) |
| function_name | string | Yes | Human-readable name ("Get Security Findings") |
| api_endpoint | string | Yes | Actual endpoint (e.g. `SecurityHub:GetFindings`) |
| api_method | string | Yes | HTTP method or SDK call |
| description | string | Yes | What this function returns in plain English |
| sample_output_schema | json | Yes | Example response structure |
| signal_category | SignalCategory | Yes | Which of 7 categories (inventory / config_state / vulnerability / detection / verdict / threat_intel / tool_health) |
| entity_types_produced | EntityType[] | Yes | What canonical entities this enriches |
| data_fields_available | DataFieldDescriptor[] | Yes | What usable data comes back (see §3.3) |
| connector_class | ConnectorClass[] | Yes | A/B/C/D |
| ingestion_tier | IngestionTier | Yes | 1-5 |
| auth_required | AuthMethod | Yes | oauth2 / api_key / bearer / certificate |
| rate_limit_notes | string | No | Vendor rate limit details |
| standard_marker | string | Yes | Governing standard |

### 3.3 Data Fields Available (per API Function)

Each function declares what data it provides that can be used in case workflows:

| Field | Type | Description |
|---|---|---|
| field_path | string | JSON path in the response (e.g. `Findings[].Title`) |
| field_label | string | Human-readable label ("Finding Title") |
| field_type | string | text / url / severity / identifier / timestamp / json |
| use_in_case | boolean | Can this be shown in the case detail? |
| use_in_remediation | boolean | Can this be referenced in remediation actions? |
| maps_to_entity | string | Which canonical entity field this maps to (if any) |
| example_value | string | Example for the workbench UI |

**AWS Security Hub example:**

| field_path | field_label | field_type | use_in_case | maps_to_entity |
|---|---|---|---|---|
| `Findings[].Title` | Finding Title | text | Yes | Finding_Event.title |
| `Findings[].Description` | Description | text | Yes | Finding_Event.description |
| `Findings[].Severity.Label` | Severity | severity | Yes | Signal.severity |
| `Findings[].Remediation.Recommendation.Url` | Fix Guide URL | url | Yes | (display only) |
| `Findings[].Remediation.Recommendation.Text` | Fix Guide Text | text | Yes | Remediation_Action.action_definition |
| `Findings[].Resources[].Id` | Resource ARN | identifier | Yes | Asset.asset_id (via matching) |
| `Findings[].Resources[].Type` | Resource Type | text | Yes | Asset.asset_class |
| `Findings[].Compliance.Status` | Adherence Status | text | Yes | Control_State.effectiveness_state |
| `Findings[].Standards[].StandardsArn` | Standard Reference | identifier | Yes | Control_Reference.control_reference_id |
| `Findings[].ProductFields.aws/securityhub/FindingId` | Finding ID | identifier | Yes | Signal.source_event_id |
| `Findings[].CreatedAt` | Created | timestamp | Yes | Signal.time_observed |
| `Findings[].UpdatedAt` | Updated | timestamp | Yes | (freshness tracking) |

---

## 4. Panel 2: Case Type Mapping & Trigger Conditions

### 4.1 Purpose

Map API function output → conditions → case type. One API function can produce MULTIPLE case types based on conditions.

### 4.2 Trigger Condition Model

| Field | Type | Required | Description |
|---|---|---|---|
| trigger_condition_id | string | Yes | Unique identifier |
| api_function_id | string | Yes | Which API function this applies to |
| condition_name | string | Yes | Human-readable name ("Critical Misconfiguration") |
| condition_logic | ConditionRule[] | Yes | Array of field-value conditions (AND/OR) |
| case_type | CaseType | Yes | Which of 12 case types this creates |
| default_priority | Priority | Yes | P0-P5 default (context modulation adjusts) |
| ctem_phase_at_creation | CtemPhase | Yes | scoping / discovery / prioritization |
| risk_object_type | RiskObjectType | Yes | Which risk object type to generate |
| description | string | Yes | Explains what this condition means |
| standard_marker | string | Yes | Governing standard |

### 4.3 Condition Rule Structure

```typescript
interface ConditionRule {
  field_path: string;        // e.g. "Findings[].Severity.Label"
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value: string | string[];  // e.g. "CRITICAL" or ["HIGH", "CRITICAL"]
  logic_gate: 'AND' | 'OR'; // how this connects to next condition
}
```

### 4.4 Example: AWS Security Hub → Multiple Case Types

| Condition | Case Type | Risk Object | Priority |
|---|---|---|---|
| Severity = CRITICAL + Compliance.Status = FAILED | drift | configuration_drift | P1 |
| Severity = HIGH + Type contains "Software and Configuration Checks" | drift | control_gap | P2 |
| Severity = CRITICAL + Type contains "Patch" | vulnerability | vulnerability | P1 |
| Resources not in Commander asset registry | coverage | coverage_blindspot | P2 |
| Severity = HIGH + Standards contains "CIS" | drift | control_gap | P3 |
| Severity = MEDIUM + Compliance.Status = WARNING | drift | drift | P4 |

### 4.5 Data Selection for Case

When creating the trigger, you select which fields from the API function to include in the case:

```
☑ Title → Case.title (auto-populated)
☑ Description → Case.description
☑ Severity → feeds priority computation
☑ Remediation.Recommendation.Url → displayed in case detail
☑ Resources[].Id → Asset binding (entity matching runs)
☑ Standards → Control_Reference binding
☐ ProductFields → (not needed for this workflow)
```

---

## 5. Panel 3: Remediation Actions (Stacked, Ordered)

### 5.1 Purpose

Define what happens once a case is created. Actions are **stacked** — multiple actions per workflow, executed in sequence or parallel. Each action has a type.

### 5.2 Action Types

| Action Type | What It Does | Requires Push Connector? | Phase 1 Ready? |
|---|---|---|---|
| `manual_instruction` | Show human-readable instruction for manual action | No | Yes |
| `data_display` | Show specific data fields from the finding in case UI | No | Yes |
| `system_update` | Update Commander internal data (asset owner, classification) | No | Yes |
| `push_with_confirmation` | Propose push to target system, human approves | Yes | Phase 2 |
| `push_autopilot` | Auto-execute push to target system | Yes | Phase 2 |
| `ai_generate` | Use Commander AI to generate content | No (AI required) | Phase 2+ |
| `notification` | Send notification to role/team | No | Yes |
| `escalation` | Escalate to higher authority if not resolved | No | Yes |

### 5.3 Action Definition Model

| Field | Type | Required | Description |
|---|---|---|---|
| action_id | string | Yes | Unique identifier |
| workflow_id | string | Yes | Parent workflow |
| action_sequence | number | Yes | Execution order (1, 2, 3...) |
| action_type | ActionType | Yes | One of 8 types above |
| action_title | string | Yes | Human-readable title |
| action_description | string | Yes | What this action does |
| assigned_to_role | string | No | Which RBAC role handles this |
| target_system | string | No | For push actions — which system |
| target_connector_id | string | No | For push actions — which connector |
| push_technical_detail | string | No | Technical steps for the push |
| push_reversible | boolean | No | Can this be undone? |
| execution_mode | ExecutionMode | Yes | autopilot / human_confirmation / always_manual |
| tenant_override_permitted | boolean | Yes | Can tenant change the mode? |
| validation_method | ValidationMethod | Yes | How to confirm it worked |
| validation_connector_id | string | No | Which connector validates |
| data_fields_to_show | string[] | No | For data_display type — which fields |
| ai_capability | AiCapability | No | For ai_generate — what AI does |
| condition_for_action | ConditionRule[] | No | Optional — action only fires if condition met |
| standard_marker | string | Yes | Governing standard |

### 5.4 AI Capabilities Available

| AI Capability | What It Does | When Available |
|---|---|---|
| `generate_summary` | Summarise the finding for the case assignee | When AI wired |
| `enrich_threat_context` | Add threat intel context from estate data | When AI wired |
| `generate_technical_detail` | Produce step-by-step technical remediation | When AI wired |
| `draft_communication` | Draft notification/email for stakeholder | When AI wired |
| `explain_impact` | Explain blast radius and business impact | When AI wired |
| `suggest_priority` | Suggest priority based on estate context | When AI wired |

### 5.5 Example: Full Workflow for AWS Security Hub Critical Finding

```
WORKFLOW: aws_securityhub_critical_misconfiguration
TRIGGER: Severity=CRITICAL + Compliance.Status=FAILED
CASE TYPE: drift
RISK OBJECT: configuration_drift
PRIORITY: P1 (subject to 5-dimension modulation)
CTEM PHASE: discovery

ACTIONS:
┌─────────────────────────────────────────────────────────┐
│ Seq 1: DATA DISPLAY                                      │
│ Title: "Finding Detail"                                  │
│ Show: Title, Description, Severity, Resource ARN         │
│ Show: Remediation.Recommendation.Url (clickable link)    │
│ Show: Standards reference                                │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Seq 2: AI GENERATE (when available)                      │
│ Title: "AI Summary & Context"                            │
│ Capability: generate_summary + enrich_threat_context     │
│ Output: Plain English explanation + estate relevance     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Seq 3: MANUAL INSTRUCTION                                │
│ Title: "Review IAM Policy"                               │
│ Instruction: "Review the IAM policy attached to this     │
│  resource. Remove unused permissions. Apply least-       │
│  privilege. Document changes in change control."         │
│ Assigned to: Asset Owner                                 │
│ Validation: Next Security Hub pull shows PASSED          │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Seq 4: PUSH WITH CONFIRMATION (when push connector live) │
│ Title: "Update IAM Policy"                               │
│ Target system: AWS IAM                                   │
│ Technical detail: (AI-generated OR manually written)     │
│   "Remove Action 's3:*' from policy arn:aws:iam::...,   │
│    replace with s3:GetObject, s3:PutObject on specific   │
│    bucket ARN only"                                      │
│ Mode: Human Confirmation                                 │
│ Reversible: Yes (policy version rollback)                │
│ Tenant override: Can change to Always Manual             │
│ Validation: Next pull → Compliance.Status = PASSED       │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Seq 5: PUSH AUTOPILOT (mandatory control)                │
│ Title: "Ensure EDR Coverage"                             │
│ Target system: CrowdStrike Falcon                        │
│ Condition: IF asset.coverage.edr = false                 │
│ Action: Deploy CrowdStrike sensor to asset               │
│ Mode: Autopilot (mandatory coverage policy)              │
│ Tenant override: Can change to Confirm                   │
│ Validation: Next CrowdStrike pull shows sensor active    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Seq 6: PUSH AUTOPILOT (mandatory control)                │
│ Title: "Ensure Vulnerability Scan Coverage"              │
│ Target system: Tenable                                   │
│ Condition: IF asset.coverage.vuln_scan = false           │
│ Action: Add asset to scan cycle                          │
│ Mode: Autopilot (mandatory coverage policy)              │
│ Tenant override: Can change to Confirm                   │
│ Validation: Next Tenable pull shows asset in scope       │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Seq 7: NOTIFICATION                                      │
│ Title: "Notify Security Team"                            │
│ Channel: Configured notification channel                 │
│ Content: Case reference + severity + asset + owner       │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Workflow Lifecycle — How Workflows Grow

### 6.1 Day 1 (Pull Only, No Push, No AI)

```
API Function registered ✅
Trigger conditions set ✅
Actions available:
  ✅ manual_instruction
  ✅ data_display
  ✅ system_update
  ✅ notification
  ✅ escalation
  ❌ push_with_confirmation (no push connector yet)
  ❌ push_autopilot (no push connector yet)
  ❌ ai_generate (AI not wired yet)
```

### 6.2 Day N (Push Connector Added)

You go back to the workbench, open the existing workflow, and ADD push actions:
```
  ✅ push_with_confirmation → NOW AVAILABLE
  ✅ push_autopilot → NOW AVAILABLE
```

Existing manual actions stay. Push actions are ADDITIVE — they don't replace manual options. Tenant can still choose "always manual" and ignore the push.

### 6.3 Day N+1 (AI Wired)

You go back to the workbench, tick the AI boxes:
```
  ✅ ai_generate → NOW AVAILABLE
  ☑ Generate summary for case assignee
  ☑ Enrich with threat intel context
  ☑ Generate technical detail for push actions
```

Again ADDITIVE. Nothing breaks. Workflows just get richer.

---

## 7. Workbench UI Interactions

### 7.1 Creating a New Workflow

```
1. Select connector → shows available API functions
2. Select API function → shows sample schema + available data fields
3. Define trigger condition(s) → field/operator/value rules
4. Select case type → dropdown of 12 types
5. Select data to include in case → tick boxes from available fields
6. Add remediation actions (one by one, drag to reorder):
   - Choose action type
   - Fill in details per type
   - Set execution mode
   - Set validation method
7. [Optional] Tick AI capabilities
8. Save → workflow template created
9. Publish → available to entitled tenants
```

### 7.2 Editing an Existing Workflow

```
1. Open workflow from list
2. All panels editable
3. Add/remove/reorder actions
4. Enable newly available capabilities (push, AI)
5. Save → version incremented
6. Publish → tenant sees updated workflow on next load
```

### 7.3 Testing a Workflow (Dry Run)

```
1. Select workflow
2. Provide sample input (or use stored sample_output_schema)
3. System shows:
   - Which trigger condition matched
   - Which case type would be created
   - Which entities would be enriched
   - Which actions would fire
   - What the case would look like
4. No real case created — preview only
```

---

## 8. Data Model

### 8.1 Entities Required

| Entity | Purpose | Stored In |
|---|---|---|
| `ApiFunction` | Registered API endpoint + schema | Control Plane |
| `DataFieldDescriptor` | Available data fields per function | Control Plane |
| `TriggerCondition` | Condition rules → case type mapping | Control Plane |
| `CaseWorkflowTemplate` | The workflow itself (groups trigger + actions) | Control Plane |
| `WorkflowAction` | Individual action within a workflow | Control Plane |
| `WorkflowVersion` | Version tracking for audit | Control Plane |
| `TenantWorkflowConfig` | Tenant's execution mode choices | Tenant scope |

### 8.2 Relationships

```
Connector Definition
    └── has many → ApiFunction
                       └── has many → TriggerCondition
                                          └── creates → CaseWorkflowTemplate
                                                            └── has many → WorkflowAction (ordered)
                                                            └── has many → WorkflowVersion
                                                            └── configured per → TenantWorkflowConfig
```

---

## 9. What the System Does Automatically (NOT in the Workbench)

The workbench controls **case flow and remediation actions**. The following happen AUTOMATICALLY regardless of workbench configuration:

| System Behaviour | Happens Because | Configured In Workbench? |
|---|---|---|
| Entity enrichment (asset, identity, posture updates) | Normalisation layer | No — always runs |
| Entity matching (cross-source resolution) | Matching engine | No — always runs |
| Authority resolution (C>B>A>D) | Authority engine | No — always runs |
| Surface attribution (internal/external) | Surface engine | No — always runs |
| Posture score computation | Posture engine | No — always runs |
| Risk snapshot creation | Risk engine | No — always runs |
| Intelligence layer routing (4 streams) | Intelligence engine | No — always runs |
| Cross-stream correlations (6 types) | Correlation engine | No — always runs |
| OODA tempo measurement | OODA engine | No — always runs |
| Coverage score computation | Coverage engine | No — always runs |
| Relationship graph updates | Normalisation | No — always runs |
| **Case type assignment** | Trigger conditions | **YES — workbench** |
| **Remediation actions** | Action definitions | **YES — workbench** |
| **Execution mode** | Action configuration | **YES — workbench** |
| **AI enhancement** | AI tick-boxes | **YES — workbench** |
| **Data shown in case** | Field selection | **YES — workbench** |
| Priority computation (5-dimension) | Priority engine | Partially — default priority set in workbench, modulation automatic |
| CTEM phase progression | Case lifecycle engine | No — automatic after initial assignment |
| Closure gates | Spec #17 doctrine | No — system-owned |
| Reopening triggers | Spec #17 doctrine | No — system-owned |
| Routing | Routing engine | No — automatic |

---

## 10. Tenant Admin View (What the Customer Sees)

The tenant does NOT see the workbench. They see the RESULTS:

```
┌─────────────────────────────────────────────────────────┐
│  TENANT ADMIN: Workflow Configuration                    │
│                                                          │
│  Available Workflows (enabled for your tier):           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ AWS Security Hub — Critical Misconfiguration      │   │
│  │ Case type: drift | Actions: 7                     │   │
│  │                                                    │   │
│  │ Execution modes (your choice):                     │   │
│  │  Action 3 (Review IAM): [Always Manual ▼]         │   │
│  │  Action 4 (Update IAM): [Human Confirmation ▼]    │   │
│  │  Action 5 (EDR Coverage): [Autopilot ▼]           │   │
│  │  Action 6 (Scan Coverage): [Autopilot ▼]          │   │
│  │                                                    │   │
│  │ Approval role: [Security Manager ▼]                │   │
│  │                                                    │   │
│  │ [View workflow detail]  [View audit trail]         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ CrowdStrike — Sensor Offline                      │   │
│  │ Case type: tool-health | Actions: 3               │   │
│  │ ...                                                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

The tenant can:
- ✅ Change execution mode (within permitted bounds)
- ✅ Assign approval roles
- ✅ View what each workflow does
- ✅ View audit trail
- ❌ Edit trigger conditions
- ❌ Add/remove actions
- ❌ Create new workflows
- ❌ Modify API function registry

---

## 11. Audit & Versioning

| Event | Audit Record |
|---|---|
| Workflow created | WHO, WHEN, version 1 |
| Action added/modified | WHO, WHEN, version incremented |
| Workflow published | WHO, WHEN, which tenants affected |
| Push action added to existing workflow | WHO, WHEN, version incremented |
| AI capability enabled | WHO, WHEN, which capabilities |
| Tenant changes execution mode | WHO, WHEN, from/to mode |
| Workflow dry-run executed | WHO, WHEN, sample input, result |

All versions preserved. Rollback available.

---

## 12. Build Sequence

| Phase | Deliverable | Depends On |
|---|---|---|
| **1** | Data model (entities in §8) | CRAW Engine contracts |
| **2** | API Function Registry UI (Panel 1) | Data model |
| **3** | Trigger Condition Builder UI (Panel 2) | Panel 1 |
| **4** | Remediation Action Builder UI (Panel 3) | Panel 2 |
| **5** | Workflow preview/dry-run | All panels |
| **6** | Publish to tenants | Entitlement layer |
| **7** | Tenant Admin view (read + mode config) | Published workflows |
| **8** | Push action support (when push connectors live) | Phase 2 connectors |
| **9** | AI capability wiring (when AI live) | Commander AI core |

### First Test Case

The FIRST workflow built in this workbench will be:
- **Connector:** AWS Security Hub
- **Function:** GetFindings
- **Trigger:** Severity=CRITICAL + Compliance.Status=FAILED
- **Actions:** Data display + Manual instruction + (push stubs for when connectors arrive)
- **Validates:** The entire CRAW Engine pipeline end-to-end (pull → normalise → case → actions)

---

## 13. Decision Log

| Decision | Rationale | Date |
|---|---|---|
| Workbench lives in Control Plane only | Tenants consume workflows, don't build them. Separation of authority per CPS v1.1 | 2026-06-13 |
| Actions are stacked and ordered | One case often needs multiple remediation steps (manual + push + notify) | 2026-06-13 |
| Workflows grow over time | Pull-first, push-additive, AI-additive. Nothing breaks when capabilities arrive. | 2026-06-13 |
| Tenant sees execution mode choices only | Customer controls HOW (auto/confirm/manual) but not WHAT (which actions exist) | 2026-06-13 |
| Dry-run testing before publish | Avoid publishing broken workflows to production tenants | 2026-06-13 |
| Every workflow versioned | Audit trail, rollback, change control per Spec #55 | 2026-06-13 |
| AI is tick-box additive | AI enhances but doesn't block. Workflow works without AI. | 2026-06-13 |
| AWS Security Hub as first test | Rich schema, multiple case types, validates full pipeline | 2026-06-13 |

---

**Next step:** Build Phase 1 — the data model entities supporting this workbench, then the first workflow for AWS Security Hub GetFindings.
