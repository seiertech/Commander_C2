> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #26a — Closed-Loop Email & Case Communication Lifecycle
## Commander SDR Case-Native Email Communication Engine

**Document version:** v1.2  
**Status:** Approved Baseline — Build Package Derivation Ready  
**Governing documents:** Commander SDR Master Proposition v4.7, Commander SDR Master Technical Specification v6.7, Spec #8 Case Management & Workflow v1.6  
**Companion to:** Spec #26 — Case Communication & Broadcast Channel Spec  
**Source enhancement:** CHANGE-EMAIL-001, Closed-Loop Email & Case Communication Lifecycle Thesis v1.0, and v1.2 refinement decisions  
**Specification phase:** Phase 1

---

## 0. Purpose and Authority

This specification governs Commander SDR's closed-loop email capability for case-related communication. It converts email from an external notification channel into a case-native lifecycle function that is ingested, linked, state-driving, SLA-aware and audit-governed.

This spec does not replace the Teams/Slack communication model. Teams and Slack remain reference-and-import providers. Email is allowed to operate in closed-loop mode because email is threaded, externally addressable, audit-relevant and widely used for vulnerability notification, vendor correspondence, remediation ownership and governance communication.

---

## 1. Governing Principles

1. A case-related email is a first-class case event.
2. Outbound email sent from SDR SHALL be immediately represented in the case timeline.
3. Inbound email replies SHALL be ingested and correlated where tenant-configured.
4. Email communication SHALL update communication state and may trigger SLA reminders, no-response escalation and stakeholder engagement status.
5. Email provider failure SHALL NOT stop normal case handling.
6. SDR SHALL NOT become a general email client.
7. SDR SHALL only process tenant-approved mailboxes and case-related messages.
8. Every email action SHALL be tenant-scoped, RBAC-governed and audit-recorded.
9. Message-body storage SHALL be configurable and default to metadata/reference-first unless the tenant requires content retention for audit.
10. Microsoft Graph / Exchange Online is the first provider. Other providers are deferred.

---

## 2. Provider Model

### 2.1 First Provider

| Provider | API | Phase | Notes |
|---|---|---:|---|
| Microsoft Exchange Online / Outlook | Microsoft Graph API | Phase 1 | First supported provider for closed-loop case email. |

### 2.2 Provider Responsibilities

The email provider adapter SHALL support:

```text
EmailProviderAdapter:
  validate_connection(config) -> ConnectionResult
  validate_permissions(mailbox_id, actor_id) -> PermissionAssessment
  send_message(request) -> SendMessageResult
  get_message(message_id) -> EmailMessage
  get_thread(conversation_id) -> EmailThread
  subscribe_mailbox(mailbox_id) -> SubscriptionReference
  renew_subscription(subscription_id) -> RenewalResult
  delta_sync(mailbox_id, checkpoint) -> DeltaSyncResult
  build_message_deep_link(message_id) -> URL
```

### 2.3 Integration Modes

| Mode | Description | MVP recommendation |
|---|---|---|
| Outbound only | SDR sends and records case emails. Replies are manually imported/linked. | Optional fallback. |
| Closed-loop subscription | Graph change notifications trigger inbound ingestion. | Preferred. |
| Delta sync | Scheduled Graph delta query reconciles missed messages. | Required as safety net. |
| Manual link | Analyst links an email/thread when automated correlation fails. | Required. |

---

## 3. Mailbox Model

### 3.1 Supported Mailbox Types

| Mailbox type | Description | Use case |
|---|---|---|
| User mailbox | Individual analyst mailbox. | Direct one-to-one correspondence. |
| Shared mailbox | Team or function mailbox. | VM team, SOC operations, governance queue. |
| Group mailbox | Microsoft 365 group mailbox. | Group-owned remediation or platform queue. |

### 3.2 CommunicationMailbox Entity

```json
{
  "communicationMailboxId": "string",
  "tenantId": "string",
  "provider": "microsoft_graph",
  "mailboxType": "user|shared|group",
  "displayName": "string",
  "mailboxAddress": "string",
  "externalMailboxId": "string",
  "enabled": true,
  "defaultForCaseTypes": ["vulnerability_exposure", "engineering_health"],
  "allowedSenderRoles": ["L1", "L2", "SOM"],
  "allowedSendModes": ["send_as", "send_on_behalf"],
  "subscriptionStatus": "not_configured|active|degraded|failed|paused",
  "deltaCheckpoint": "string",
  "validatedAt": "datetime",
  "createdBy": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## 4. Outbound Email Lifecycle

### 4.1 Analyst Flow

1. Analyst opens a case.
2. Analyst selects **Send Email** from the case Communication Panel.
3. SDR displays approved mailbox options based on tenant configuration, Microsoft 365 permissions and SDR RBAC.
4. Analyst selects a template or writes free text.
5. SDR inserts the case token into the subject or headers.
6. Analyst previews and sends.
7. SDR sends via Microsoft Graph.
8. SDR creates or updates `CaseEmailThread`.
9. SDR creates `CaseEmailMessage` and `CommunicationEvent`.
10. SDR updates communication state and starts the relevant SLA checkpoint.

### 4.2 Required Capture

Outbound send SHALL capture:

```text
message_id
internet_message_id
conversation_id
case_id
mailbox_id
sender
recipients
subject
body_reference or body_snapshot
attachment_references
timestamp
actor
send_mode
```

---

## 5. Inbound Email Ingestion Lifecycle

### 5.1 Ingestion Sources

| Source | Use |
|---|---|
| Graph subscription notification | Near-real-time trigger that a mailbox changed. |
| Graph delta sync | Reconciliation path for missed notifications and subscription gaps. |
| Manual analyst import | Recovery path for uncorrelated or out-of-band email. |

### 5.2 Inbound Pipeline

1. Receive subscription event or run delta sync.
2. Retrieve message metadata and permitted content.
3. Classify mailbox and sender.
4. Attempt case/thread correlation.
5. Parse relevant security signals.
6. Attach to `CaseEmailThread`.
7. Create `CaseEmailMessage`.
8. Create `CommunicationEvent`.
9. Update communication state, SLA state and stakeholder engagement status.
10. If correlation confidence is below threshold, create `EmailCorrelationCandidate` for analyst review.

---

## 6. Threading and Correlation Model

### 6.1 Correlation Priority

| Priority | Signal | Behaviour |
|---:|---|---|
| 1 | Graph `conversationId` | Primary thread match. |
| 2 | `internetMessageId` / `inReplyTo` / `references` | Secondary message-chain match. |
| 3 | SDR case token `[SDR-CASE-{case_id}]` | Fallback deterministic match. |
| 4 | Sender/recipient and timestamp proximity | Confidence-scored candidate. |
| 5 | Analyst confirmation | Manual override. |

### 6.2 Correlation Confidence

| Confidence | Action |
|---:|---|
| >= 0.90 | Auto-link. |
| 0.70–0.89 | Link with visible warning and audit marker. |
| 0.40–0.69 | Create correlation candidate. |
| < 0.40 | Do not link; retain raw reference for review. |

---

## 7. Data Model

### 7.1 CaseEmailThread

```json
{
  "threadId": "string",
  "tenantId": "string",
  "caseId": "string",
  "externalConversationId": "string",
  "mailboxId": "string",
  "participants": [],
  "lastMessageAt": "datetime",
  "lastInboundAt": "datetime",
  "lastOutboundAt": "datetime",
  "direction": "inbound|outbound|mixed",
  "status": "not_started|initiated|awaiting_response|in_discussion|stale|escalated|closed",
  "slaState": "not_applicable|within_sla|warning|breached|paused",
  "correlationConfidence": 0.0,
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### 7.2 CaseEmailMessage

```json
{
  "messageId": "string",
  "tenantId": "string",
  "threadId": "string",
  "caseId": "string",
  "providerMessageId": "string",
  "internetMessageId": "string",
  "conversationId": "string",
  "direction": "inbound|outbound",
  "sender": {},
  "recipients": [],
  "cc": [],
  "bcc": [],
  "timestamp": "datetime",
  "subject": "string",
  "bodyReference": "string",
  "bodyStorageMode": "metadata_only|reference|snapshot|redacted_snapshot",
  "attachments": [],
  "parsedMetadata": {
    "cves": [],
    "assets": [],
    "intent": "acknowledgement|query|rejection|update|closure_confirmation|unknown"
  },
  "createdAt": "datetime"
}
```

### 7.3 CommunicationEvent

```json
{
  "eventId": "string",
  "tenantId": "string",
  "caseId": "string",
  "eventType": "email_sent|email_received|email_linked|email_unlinked|email_acknowledged|email_reminder_sent|email_escalated|email_correlation_failed",
  "triggerSource": "analyst|system|graph_subscription|delta_sync|manual_link",
  "relatedMessageId": "string",
  "actor": "string",
  "timestamp": "datetime",
  "auditHash": "string"
}
```

### 7.4 EmailCorrelationCandidate

```json
{
  "candidateId": "string",
  "tenantId": "string",
  "mailboxId": "string",
  "providerMessageId": "string",
  "candidateCaseIds": [],
  "confidenceScores": {},
  "reason": "string",
  "status": "pending|approved|rejected|expired",
  "reviewedBy": "string",
  "reviewedAt": "datetime",
  "createdAt": "datetime"
}
```

---

## 8. Communication State Machine

| State | Meaning |
|---|---|
| `not_started` | No case email has been sent or received. |
| `initiated` | Email thread created but no response requirement yet. |
| `awaiting_response` | SDR expects a response from stakeholder or external party. |
| `in_discussion` | Active email exchange is underway. |
| `stale` | Expected response has not arrived within configured threshold. |
| `escalated` | No-response or SLA breach escalation has triggered. |
| `closed` | Email loop is closed or case is closed. |

### 8.1 Transitions

| Event | Transition |
|---|---|
| Analyst sends first email | `not_started` → `awaiting_response` |
| Inbound reply received | `awaiting_response` → `in_discussion` |
| Analyst sends follow-up | `in_discussion` → `awaiting_response` if response required |
| No reply within threshold | `awaiting_response` → `stale` |
| SLA warning/breach | `stale` → `escalated` |
| Closure confirmation received | `in_discussion` → `closed` |
| Case closed | any state → `closed` |

---

## 9. SLA-Driven Communication Engine

### 9.1 Triggers

| Trigger | Action |
|---|---|
| Case created from inbound vulnerability email | Auto-acknowledge if enabled. |
| Outbound remediation request sent | Start response timer. |
| Response threshold approaching | Send reminder or notify analyst. |
| No response beyond threshold | Mark stale and recommend escalation. |
| SLA warning | Generate escalation draft. |
| SLA breach | Escalate to configured manager/stakeholder. |
| Case resolved | Send closure email if enabled. |

### 9.2 SLA Boundaries

Email state MAY influence:

- communication SLA;
- stakeholder response SLA;
- case escalation notes;
- Case Pulse stalling signals;
- closure-readiness checklist.

Email state SHALL NOT be the only determinant of technical remediation closure. Remediation closure still requires validation evidence from SDR's normal case lifecycle.

---

## 10. Templates

Minimum templates:

| Template | Purpose |
|---|---|
| Vulnerability notification acknowledgement | Confirms receipt and investigation start. |
| Remediation owner request | Requests fix/confirmation from asset owner. |
| Status update | Provides progress update to external notifier/stakeholder. |
| No-response reminder | Follows up before SLA escalation. |
| Escalation | Notifies manager or governance contact. |
| Dispute handling | Requests evidence where stakeholder rejects applicability. |
| Closure | Confirms resolution and closure evidence. |

Templates SHALL support case variables, affected assets, CVEs, SLA dates, owner names, validation status and audit-safe summaries.

---

## 11. API Contracts

```text
GET    /api/v1/cases/{case_id}/email/threads
POST   /api/v1/cases/{case_id}/email/send
GET    /api/v1/cases/{case_id}/email/messages
POST   /api/v1/email/inbound/webhook
POST   /api/v1/email/inbound/delta-sync
POST   /api/v1/email/messages/{message_id}/link-case
POST   /api/v1/email/messages/{message_id}/unlink-case
GET    /api/v1/email/correlation-candidates
POST   /api/v1/email/correlation-candidates/{id}/approve
POST   /api/v1/email/correlation-candidates/{id}/reject
GET    /api/v1/admin/communication-mailboxes
POST   /api/v1/admin/communication-mailboxes
PATCH  /api/v1/admin/communication-mailboxes/{mailbox_id}
GET    /api/v1/admin/email-templates
PATCH  /api/v1/admin/email-templates/{template_id}
```

All APIs SHALL require tenant context, RBAC enforcement, request IDs, audit context and standard SDR error responses.

---

## 12. Worker Contracts

```text
email.send
email.ingest.webhook
email.ingest.delta
email.correlate
email.parse
email.acknowledge
email.reminder
email.escalate
email.subscription.renew
email.deadletter.review
```

Every worker payload SHALL include:

```json
{
  "tenantId": "string",
  "jobId": "string",
  "idempotencyKey": "string",
  "mailboxId": "string",
  "caseId": "string|null",
  "triggerSource": "string",
  "requestedBy": "string|null",
  "createdAt": "datetime"
}
```

---

## 13. UI Requirements

### 13.1 Case Communication Panel

The case panel SHALL include:

- **Send Email** action.
- Mailbox selector.
- Template selector.
- Recipient selector from case stakeholders.
- Free-text editor with preview.
- Thread timeline.
- SLA communication state indicator.
- Manual link / unlink controls.
- Correlation warning banner when confidence is below auto-link threshold.

### 13.2 Timeline

The case timeline SHALL show:

- inbound email;
- outbound email;
- reminders;
- escalations;
- acknowledgements;
- manual correlation decisions;
- Graph ingestion failures where relevant.

---

## 14. Security, Privacy and Compliance

1. Mailbox access SHALL be tenant-approved.
2. Microsoft Graph permissions SHALL be least-privilege and documented during onboarding.
3. SendAs and SendOnBehalf SHALL require both Microsoft 365 permission and SDR RBAC permission.
4. Credential values SHALL never be stored in configuration, logs or raw payload fixtures.
5. Email body storage SHALL be configurable.
6. Attachments SHALL be stored only where explicitly permitted by tenant policy.
7. Every link/unlink/manual-correlation event SHALL be audit-recorded.
8. Email retention SHALL align to tenant policy and legal hold requirements.
9. Data access SHALL be tenant-scoped and subject to RBAC.
10. Sensitive message content SHALL be redacted from logs.

---

## 15. Failure Handling

| Failure | Behaviour |
|---|---|
| Graph API unavailable | Retry with backoff; queue remains durable; case handling unaffected. |
| Subscription expired | Run delta sync and renew subscription. |
| Permission revoked | Disable mailbox integration, alert administrator, preserve existing case references. |
| Correlation fails | Create manual correlation candidate. |
| Parsing fails | Store metadata/raw reference and mark parse status failed. |
| Send fails | Show analyst error, create failed CommunicationEvent, allow retry. |
| Mailbox unavailable | Mark mailbox degraded/failed and alert administrator. |

---

## 16. Vulnerability Management Use Cases

### 16.1 External Vulnerability Notification

1. Vendor or external notifier sends vulnerability email.
2. SDR ingests message from approved mailbox.
3. SDR extracts CVEs, assets, affected products and sender intent.
4. SDR creates or links case.
5. Auto-acknowledgement is sent if configured.
6. SLA starts.
7. Remediation owner correspondence is tracked in the case.
8. Validation evidence is collected.
9. Closure email is sent.

### 16.2 Internal Remediation Tracking

1. SDR identifies vulnerability or exposure.
2. Analyst emails asset owner from case panel.
3. Owner replies with status, dispute or completion note.
4. SDR ingests reply and updates communication state.
5. Case progresses through validation and closure.

### 16.3 Dispute Handling

1. Stakeholder rejects applicability.
2. SDR detects rejection intent.
3. Case state is updated to investigation/dispute review.
4. Analyst validates with scanner/source data.
5. Outcome is recorded and communicated.

---

## 17. Acceptance Criteria

| ID | Criterion |
|---|---|
| EML-AC-01 | Analyst can send email from a case using an approved mailbox. |
| EML-AC-02 | Outbound email creates `CaseEmailThread`, `CaseEmailMessage` and `CommunicationEvent`. |
| EML-AC-03 | Inbound reply is ingested and linked using Graph identifiers or case token. |
| EML-AC-04 | Failed correlation creates an analyst-reviewable candidate. |
| EML-AC-05 | Communication state transitions are deterministic and auditable. |
| EML-AC-06 | SLA reminders/escalations can be generated from communication state. |
| EML-AC-07 | Graph outage does not block case operations. |
| EML-AC-08 | Tenant isolation and RBAC are enforced on every email API and worker. |
| EML-AC-09 | Email body storage follows tenant configuration. |
| EML-AC-10 | Teams/Slack reference-and-import behaviour remains unchanged. |

---

## 18. Test Requirements

- Unit tests for correlation scoring.
- Unit tests for state transitions.
- Contract tests for Graph adapter methods.
- API tests for send/link/unlink/correlation candidate flows.
- Worker tests for retry, idempotency and dead-letter handling.
- Tenant isolation tests across all email repositories and workers.
- RBAC tests for mailbox send permissions.
- Security tests for log redaction and credential non-disclosure.
- UI tests for compose, mailbox selector and manual-link flow.

---

## 19. Closed Architecture Decisions

| ID | Decision | Binding Resolution |
|---|---|---|
| CAD-EMAIL-001 | Microsoft Graph permission and consent model | Least-privilege Graph permissions, tenant-admin consent, explicitly approved mailboxes only, constrained application access where application permissions are used. |
| CAD-EMAIL-002 | Default email body storage | Metadata/reference-first by default; body snapshots only where tenant policy, evidence capture, SIR generation, or regulated deployment configuration requires it. |
| CAD-EMAIL-003 | MVP mailbox type sequence | Shared mailboxes first; Microsoft 365 group mailboxes next; individual user mailbox delegation later. |
| CAD-SIR-001 | SIR acknowledgement mechanism | Email reply correlation, manual acknowledgement, and optional incident reference capture in Phase 1; full incident platform integration deferred. |
| CAD-VM-001 | VM closure gate default | Advisory closure checks by default; tenant-configurable enforcement; enforced gates recommended for external notification, KEV, SIR-linked and risk-accepted VM cases. |
| CAD-GOV-001 | Email approval model | Tenant-configured upward chain-of-command approval matrix; no hard-coded grade rules. |
| CAD-SIR-002 | SIR from sub-case/action | Permitted from parent case, sub-case, case action and swarm workstream with originating-object linkage and parent-case roll-up. |


---

## 20. Build Placement

This is a Phase 1 capability unless explicitly promoted by the owner. Phase 0 may include placeholder navigation labels or disabled UI affordances only if required for design continuity, but it SHALL NOT implement Graph email ingestion, mailbox send, or email worker runtime unless specifically approved.


---

# v1.2 Baseline Addendum — Communication Administration, Hierarchical Email, SIR and VM Workflows

## 21. Communication Administration & Case Intake Setup

SDR SHALL provide an intuitive setup function for operational communication. This is not a developer-only connector configuration. It is a tenant administration surface used by platform administrators, SOMs and authorised team leads.

Required setup areas:

| Setup area | Required capability |
|---|---|
| Provider setup | Connect Microsoft 365 / Exchange Online, validate Graph permissions, test webhook/delta sync capability. |
| Mailbox catalogue | Register user, shared and group mailboxes with owning team, allowed case types and health status. |
| Team mailbox mapping | Map VM, Architecture, Identity, Cloud, Governance, Tooling, Security Engineering and SIR functions to default mailboxes. |
| Case-type routing | Define default mailbox, templates, reminders, escalation path and closure rules per case type. |
| Communication playbooks | Define who to contact, when, from which mailbox, using which template, with which approval path and closure gate. |
| Permission and approval chain matrix | Configure who may draft, submit, approve and send from each mailbox and under which conditions. |
| SIR setup | Configure incident-team destination, sender mailbox, template, approval path, acknowledgement SLA and follow-up handling. |
| Inbound intake rules | Configure auto-link, auto-case-create, hold-for-review, trusted senders and parsing rules. |
| Manual allocation queue | Configure queue ownership, ageing thresholds and routing for uncorrelated inbound email. |
| Retention/evidence/redaction | Configure body storage, attachment handling, evidence promotion, safe-summary fields and legal hold behaviour. |
| Mailbox health | Monitor Graph subscription, token, permission, SendAs/SendOnBehalf, delta sync and backlog state. |

## 22. CommunicationMailbox v1.2 Extension

The `CommunicationMailbox` model SHALL include administrative routing and governance fields:

```json
{
  "communicationMailboxId": "string",
  "tenantId": "string",
  "provider": "microsoft_graph",
  "mailboxType": "user|shared|group",
  "displayName": "string",
  "mailboxAddress": "string",
  "owningTeamId": "string",
  "owningFunction": "vm|architecture|identity|cloud|governance|tooling|sir|custom",
  "defaultForCaseTypes": ["string"],
  "defaultForQueues": ["string"],
  "sendModesAllowed": ["send_as", "send_on_behalf"],
  "inboundIngestionEnabled": true,
  "autoCaseCreationEnabled": false,
  "autoAcknowledgementEnabled": false,
  "trustedSenderPolicyId": "string",
  "approvalPolicyId": "string",
  "retentionPolicyId": "string",
  "redactionPolicyId": "string",
  "healthState": "healthy|degraded|failed|paused",
  "lastHealthCheckAt": "datetime"
}
```

## 23. Communication Permission and Approval Chain Matrix

SDR SHALL not hard-code grade-based communication permissions. Admins SHALL configure communication authority.

The matrix SHALL answer:

```text
Who can draft?
Who can send directly?
Who can submit for approval?
Who approves?
What conditions trigger extra approval?
What happens if the approver is absent or does not respond?
```

Policy conditions SHALL include:

```text
mailbox
case type
priority
severity
communication classification
recipient class
sender team/user/role/grade
parent case owner
sub-case/action owner
case swarm/workstream owner
mailbox owner
attachment/evidence inclusion
SIR/non-SIR
external/internal recipient
regulated/compliance scope
```

Approval chain resolution SHALL support:

```text
case_owner_team_lead
sub_case_owner_team_lead
action_owner_team_lead
case_swarm_lead
queue_owner
mailbox_owner
domain_lead
SOM
CISO
incident_referral_approver
incident_team_lead
custom_named_approver
```

Before send, the UI SHALL show:

```text
Approval required: Yes/No
Reason approval is required
Approval chain to be used
Current approver and escalation path
```

## 24. Draft, Review, Approve, Send Lifecycle

Email and SIR communication SHALL support these states:

```text
DRAFT
PENDING_REVIEW
APPROVED_TO_SEND
SENT
SEND_FAILED
CANCELLED
SUPERSEDED
```

Admin policy SHALL determine which classifications, recipients, case priorities, evidence attachments or SIR actions require approval.

## 25. Communication Classification

Every outbound email SHALL have a communication classification:

```text
official_case_update
remediation_request
evidence_request
technical_clarification
escalation
sir_referral
closure_notice
internal_coordination
external_notifier_update
risk_acceptance_or_exception
```

The classification drives template, approval route, SLA effect, retention, audit, redaction and reporting.

## 26. Recipient Classification

Recipient classification SHALL include:

```text
internal_user
internal_group
asset_owner
technical_owner
vendor
third_party
regulator
incident_team
executive
unknown_external
personal_email_domain
```

Recipient class SHALL influence mailbox availability, approval requirements, evidence attachment rights, redaction and suppression rules.

## 27. Hierarchical Parent Case, Sub-Case, Action and Swarm Email

Communication SHALL attach to the lowest relevant case object and roll up to the parent case.

Supported send locations:

```text
parent case
sub-case
action
case swarm workstream
SIR referral flow
manual allocation item
```

Required linkage fields:

```text
parentCaseId
subCaseId nullable
actionId nullable
caseSwarmId nullable
workstreamId nullable
threadScope: parent_case|sub_case|action|swarm_workstream|sir_referral
```

No outbound email created inside SDR case management may be sent without `parentCaseId`. Sub-case/action-originated email SHALL preserve sub-case/action linkage and appear in both the sub-case/action timeline and the parent case communication roll-up.

Recommended subject token format:

```text
[SDR-CASE-1234][SUB-03]
[SDR-CASE-1234][ACT-03]
```

## 28. SIR — Security Incident Report / Referral

SIR is a governed hand-off action from SDR to the incident team. It is not an incident declaration by SDR and does not convert the originating SDR case into an incident record.

SIR may be raised from:

```text
parent case
sub-case
action
case swarm workstream
manual analyst review item
```

SIR SHALL preserve:

```text
originatingParentCaseId
originatingSubCaseId nullable
originatingActionId nullable
originatingSwarmId nullable
originatingWorkstreamId nullable
createdBy
createdAt
sirDestinationId
sirApprovalPolicyId
sirStatus
incidentRecordReference nullable
```

The SIR summary SHALL include parent case context and originating object context. If raised from a sub-case/action, the summary SHALL explain the specific control weakness, drift condition, exploitation evidence or workstream finding that triggered the referral.

SIR lifecycle states:

```text
SIR_CREATED
SIR_DRAFT_CREATED
SIR_APPROVAL_REQUESTED
SIR_APPROVED
SIR_SENT
SIR_ACKNOWLEDGED
SIR_ACCEPTED
SIR_REJECTED_OR_RETURNED
SIR_LINKED_TO_INCIDENT_RECORD
SIR_FOLLOW_UP_OVERDUE
SIR_CLOSED
```

A parent case may have multiple SIR referrals where separate sub-cases/actions identify separate incident concerns.

## 29. SIR Admin Setup

SIR setup SHALL include:

| Setting | Purpose |
|---|---|
| SIR destination mailbox/channel | Incident team destination. |
| SIR sender mailbox | Approved mailbox used for referral. |
| Secondary recipients | Duty manager, SOC manager, security leadership or other configured parties. |
| Required fields | Referral reason, suspected incident type, affected assets, evidence summary. |
| Approval policy | Direct send, team lead approval, SOM approval, Incident Commander approval or chained route. |
| SIR template | Structured hand-off body. |
| Evidence pack policy | Include none, summary only, selected evidence, or approved evidence pack. |
| Acknowledgement SLA | Expected incident-team acknowledgement window. |
| Follow-up behaviour | Reminder/escalation if not acknowledged. |

The SIR button SHALL be visible as a baseline action on all case panels, sub-case/action panels and case swarm workstream panels. It may be disabled with reason or require approval based on policy.

## 30. Inbound Allocation Queue

Uncorrelated inbound email SHALL appear in the operational case dashboard. The queue SHALL allow allocation to:

```text
parent case
sub-case/action
case swarm workstream
SIR referral thread
evidence-only record
new case
ignored/not relevant/spam/suspicious
```

The queue SHALL show:

```text
received time
from
to mailbox
subject
suggested parent case
suggested sub-case/action
confidence score
correlation reason
extracted CVEs/assets/domains/case tokens
available action
queue ageing
```

## 31. Thread Collision, Split, Move, Merge and Lock

Conversation correlation SHALL not blindly trust an existing thread forever. SDR SHALL detect possible collisions where a thread appears to introduce a different vulnerability, asset, case, incident concern or topic.

Analysts SHALL be able to:

```text
split a message into a new thread
move a message to another case/sub-case/action
merge two related threads
lock a thread to prevent further auto-linking
mark a thread as no longer case-relevant
```

Every operation SHALL be audit-recorded.

## 32. Redaction, Safe Summary and Attachment Policy

Admin policy SHALL govern whether generated emails and SIR summaries include:

```text
affected assets
hostnames
IP addresses
user identities
CVEs
exploit details
IOCs
internal control gaps
attachments
full timeline or summary timeline
```

Inbound attachments SHALL be evidence candidates. Outbound attachments SHALL be disabled by default unless permitted and explicitly selected or approved.

## 33. VM Mailbox and Vulnerability Workflow Enhancements

VM teams SHALL be able to operate a dedicated mailbox for:

```text
vendor advisories
CISA/industry notifications
internal forwarded vulnerability alerts
scanner export emails
patch platform notifications
asset owner responses
exception/risk acceptance requests
```

Inbound VM parsing SHOULD extract:

```text
CVE IDs
KEV status
CVSS
vendor/product names
affected versions
asset names
IP addresses
URLs/domains
patch references
workaround text
exploit references
deadlines
sender/notifier identity
```

Applicability handling SHALL distinguish:

```text
recognised vulnerability + matching assets → create/update VM case
recognised vulnerability + no matching assets → not currently applicable with evidence
unknown vulnerability → intake review item
low-confidence match → VM analyst review
```

Owner replies such as not applicable, false positive, compensating control exists, cannot patch, needs exception or business accepts risk SHALL route to validation, controls validator, exception, security debt or governance approval workflows as appropriate.

## 34. Communication Closure Gates

Case closure gates MAY require, by case type and policy:

```text
required stakeholders informed
external notifier updated
open sub-case/action threads closed or deliberately left open
unresolved inbound messages allocated
final update sent
closure communication suppressed with reason
SIR acknowledgement obtained or follow-up recorded
```

## 35. Communication Analytics

SDR SHALL expose communication analytics to authorised users:

```text
average stakeholder response time
cases blocked by no response
emails sent by case type
manual allocation queue age
top non-responsive teams
SIR referrals by domain
SIR acknowledgement time
VM owner response SLA
external notifier closure rate
mailbox health score
template usage
approval bottlenecks
```

## 36. Additional API Contracts

Child implementation SHALL define endpoints for:

```text
communication-mailboxes
communication-playbooks
approval-policies
email-drafts
email-approvals
inbound-allocation-candidates
sir-referrals
recipient-classifications
redaction-policies
template-versions
thread-split-merge-move-lock
mailbox-health
communication-analytics
```

## 37. Additional Worker Jobs

Worker jobs SHALL include:

```text
email.approval.request
email.approval.timeout
email.send.approved
email.allocation.age
email.thread.collision.detect
email.thread.split
email.thread.merge
sir.draft
sir.approval.request
sir.send
sir.acknowledgement.check
mailbox.health.check
template.version.audit
```

## 38. Additional Acceptance Criteria

| ID | Criterion |
|---|---|
| EML-AC-11 | Admin can map separate team mailboxes to VM, Architecture, Identity, Tooling, Governance and SIR functions. |
| EML-AC-12 | Admin can configure draft/send/approval rights without hard-coded grade logic. |
| EML-AC-13 | Approval routes can resolve upward chain of command using case, sub-case, action, team, queue and mailbox ownership. |
| EML-AC-14 | Sub-case/action email is visible in both the originating object timeline and parent case roll-up. |
| EML-AC-15 | SIR can be raised from a parent case, sub-case, action or swarm workstream. |
| EML-AC-16 | SIR generated summary includes parent context and originating object context. |
| EML-AC-17 | Uncorrelated inbound email appears in the case dashboard allocation queue. |
| EML-AC-18 | Manual allocation supports parent case, sub-case/action, swarm workstream, new case and evidence-only outcomes. |
| EML-AC-19 | Recipient classification and redaction policy affect generated email/SIR content. |
| EML-AC-20 | Mailbox health degradation generates a visible engineering-health signal. |


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

# DOCUMENT-SPECIFIC REVISION PATCH — 26a_Closed_Loop_Email_Case_Communication_Lifecycle_Spec_v1_2.md

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

