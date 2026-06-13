> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #49 — Admin Control Surface Information Architecture

## Status
Active baseline authority for Commander SDR v2.5.

## Purpose
Define the complete administration and control information architecture across the Commander SDR Operational Application, Tenant Admin, Commander Commercial Control Plane, and Build Pipeline Control layer.

## Binding Doctrine
- Administration is not one generic settings page.
- Admin surfaces must be split by authority boundary.
- Tenant Admin controls tenant-operating configuration within commercial entitlement.
- Commander Commercial Control Plane controls customers, tenants, licences, entitlements, feature allocation, baseline templates, rule/model packs, deployment rings, support access, and commercial/platform controls.
- Build Pipeline Control is outside the customer product and is operated through n8n, Microsoft Lists/Teams, VS Code and the repository.
- Operational users see outputs, rationale and governed actions; they do not see full configuration unless authorised.

## Application Surface Split

### Commander SDR Operational App
Purpose: operate security drift and remediation.

Admin/control-adjacent surfaces visible in the Operational App:
- Platform
- System Pulse
- Data Quality summary
- Rule hit explainability
- Model decision explainability
- Feature unavailable reasons
- Case audit/evidence chains

### Commander SDR Tenant Admin
Purpose: configure a customer tenant.

Top-level menu:
- Overview
- Baseline Configuration
- Users & Access
- Connectors & Data Sources
- Strategy & Operating Model
- Rules & Models
- AI Configuration
- Automation Boundaries
- Communications
- Exceptions & Suppressions
- Audit, Compliance & Exports
- Feature Availability

### Commander Commercial Control Plane
Purpose: internal commercial, entitlement, feature and tenant control for Seiertech/Commander operators.

Top-level menu:
- Command Overview
- Customers
- Tenants
- Licences & Entitlements
- Product & Feature Control
- AI & Model Control
- Rule & Policy Packs
- Baseline Profile Management
- Deployment & Release
- Support Operations
- Billing / Usage Evidence
- Operator Audit

### Build Pipeline Control
Purpose: orchestrate baseline-to-build-pack-to-implementation-to-test-to-release.

Control surfaces:
- Phase Control Board
- Build Control Queue
- Decision Register
- Agent Register
- Skill Register
- Playbook Register
- n8n workflow runs
- Agent failure queue
- Clarification queue
- Build-pack approval queue
- Implementation approval queue
- Deployment approval queue

## Tenant Admin Full Menu Tree

### Overview
- Configuration Health
- Licensed/Enabled Feature Summary
- Connector Health
- Data Freshness
- RBAC Health
- AI Usage
- Rule Pack Status
- Automation Boundary Status
- Open Admin Actions
- Pending Approvals
- Recent Admin Changes

### Baseline Configuration
- Active Baseline Profile
- Baseline Templates
- Operational Defaults
- Risk Baseline
- SLA Defaults
- Routing Defaults
- Validation Defaults
- Closure & Reopening Defaults
- P0 Zero-Day Defaults
- Automation Defaults
- Communication Defaults
- Control Framework Baselines
- Compliance Mapping Defaults
- CTEM Model Defaults
- MITRE ATT&CK Mapping Defaults
- Cloud Security Baselines
- Rule Pack Defaults
- Model Defaults
- AI Defaults
- RBAC Role Templates
- Baseline Drift
- Baseline Change History

### Users & Access
- Users
- Groups
- Roles
- Permission Sets
- RBAC Matrix
- Approval Matrix
- Sensitive Permissions
- P0 Authority
- Automation Approval Authority
- Support Access Requests

### Connectors & Data Sources
- Connector Registry
- Credentials & API Keys
- Connection Health
- Source Authority
- Data Freshness
- Rate Limits
- Field Mapping
- Test Data Sources

### Strategy & Operating Model
- Operating Mode
- SLA Profiles
- Routing Profiles
- Prioritisation Profiles
- Mission Objectives
- Operational Tempo
- Domain Strategy
- Escalation Policy

### Rules & Models
- Rule Engine
- Rule Packs
- Rule Simulation
- Rule Versioning
- Risk Scoring Model
- Prioritisation Model
- Routing Model
- SLA Model
- Validation Model
- Closure & Reopening Model
- P0 Trigger Model
- Fusion Map Relationship Model
- Decision Explainability Settings

### AI Configuration
- Commander AI Enablement
- AI Guardrails
- Allowed AI Actions
- Data Access Boundaries
- Case Context Access
- Prompt / Grounding Packs
- Model Routing Policy
- Usage Limits
- Token / Cost Budget
- Human Approval Rules
- AI Audit Log

### Automation Boundaries
- Automation Overview
- Allowed Automations
- Approval-Required Automations
- Forbidden Automations
- P0 Emergency Automation
- Push Action Boundaries
- Rollback Requirements
- Automation Audit

### Communications
- Mailboxes
- Email Integration
- Templates
- Notification Rules
- Stakeholder Groups
- External Notifier Settings
- P0 Communication Cadence
- Approval Chains

### Exceptions & Suppressions
- Exception Register
- Suppression Register
- Residual Risk Approvals
- Expiring Exceptions
- Suppression Rules
- Review Calendar

### Audit, Compliance & Exports
- Configuration Audit
- User Activity
- Rule Change History
- Model Change History
- AI Audit
- Connector Audit
- Export Centre
- Compliance Mapping

### Feature Availability
- Licensed Features
- Enabled Features
- Disabled Features
- Trial Features
- Feature Limits
- Usage Limits

## Platform Menu Tree

Platform in the Operational App presents tenant platform health and governed control entry points:
- Platform Overview
- System Pulse
- Connectors & Data Sources
- Data Quality
- Rule Engine
- Model Management
- Commander AI
- Automation
- Feature Availability
- Environment
- Notifications & Integrations
- Audit & Logs
- Platform Administration

## Commercial Control Plane Menu Tree

### Command Overview
- Platform estate summary
- Tenant health summary
- Expiring licences
- Trial conversion risks
- Entitlement exceptions
- Release ring warnings
- Support access warnings

### Customers
- Customer Register
- Account Status
- Commercial Owner
- Customer Health

### Tenants
- Tenant Register
- Tenant Instances
- Tenant Environments
- Tenant Health
- Tenant Support Mode

### Licences & Entitlements
- Licence Allocation
- Entitlement Manifests
- Module Allocation
- Feature Flags
- Trial Management
- Renewals / Expiry
- Usage Limits

### Product & Feature Control
- Feature Registry
- Module Registry
- Tenant Feature Availability
- Beta Features
- Emergency Disable
- Feature Rollout Status

### AI & Model Control
- AI Provider Registry
- Model Routing
- Model Usage Limits
- Tenant AI Budgets
- Prompt Pack Registry
- Agent / Skill Registry
- Model Audit

### Rule & Policy Packs
- Rule Pack Registry
- Policy Pack Registry
- Tenant Rule Allocation
- Rule Versioning
- Simulation Lab
- Rollback

### Baseline Profile Management
- Baseline Template Registry
- Operational Baseline Templates
- Risk Baseline Templates
- Control Framework Templates
- Compliance Mapping Templates
- Rule Pack Templates
- Model Templates
- AI / Model Routing Templates
- Industry Baseline Packs
- Military / Intelligence Baseline Packs
- Demo / Trial Baseline Packs
- Tenant Template Allocation
- Template Versioning
- Template Rollback

### Deployment & Release
- Deployment Rings
- Release Eligibility
- Tenant Version
- Environment Status
- Rollback Status
- Release Audit

### Support Operations
- Support Access
- Time-Bound Access
- Break-Glass Access
- Operator Actions
- Support Audit

### Billing / Usage Evidence
- Usage Metering
- Licence Utilisation
- AI Usage
- Connector Usage
- Billing Evidence Export

### Operator Audit
- Commercial Changes
- Entitlement Changes
- Support Access Audit
- Emergency Actions
- Operator Activity

## Build Rule
Every build pack that introduces a page, panel, route, action, model, rule, feature, admin item or commercial control must declare its menu/route registration, permission metadata, entitlement mapping, feature flag and audit requirements.
