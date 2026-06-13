> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #51 — Rule, Model and Decision Governance Surface

## Status
Active baseline authority for Commander SDR v2.5.

## Purpose
Make Rule Engine Management, Model Management, Rule/Model Simulation, Versioning, Rollback and Decision Explainability first-class governance surfaces.

## Binding Doctrine
- Commander SDR must not make important decisions as an unexplained black box.
- Rules and models must be visible, versioned, testable, auditable and rollback-capable.
- Operational users require decision rationale.
- Tenant Admin users configure tenant-level rule/model behaviour within entitlement.
- Commander Commercial Control Plane owns product rule/model packs, baseline templates and tenant allocation.

## Rule Engine Surfaces

### Operational App
Read-only/explainability surfaces:
- Case Detail → Rule Hits
- Case Detail → Decision Rationale
- Fusion Map → rule-derived relationships
- Command Centre → rule-triggered changes
- P0 War Room → P0 trigger rules

### Tenant Admin
Configuration surfaces:
- Rule Engine Overview
- Rule Packs
- Rule Simulation
- Rule Versioning
- Drift Rules
- Exposure Rules
- Vulnerability Rules
- Identity Rules
- Control Rules
- Coverage Rules
- P0 Zero-Day Trigger Rules
- Validation Rules
- Closure Gate Rules
- Reopening Rules
- Suppression Rules
- Rule Audit

### Commercial Control Plane
Platform rule governance:
- Rule Pack Registry
- Policy Pack Registry
- Tenant Rule Allocation
- Rule Versioning
- Simulation Lab
- Rollback
- Industry Packs
- Military/Intelligence Packs
- Trial/Demo Packs

## Model Management Surfaces

### Tenant Admin Model Configuration
- Risk Scoring Model
- Prioritisation Model
- Routing Model
- SLA Model
- Validation Model
- Closure & Reopening Model
- P0 Zero-Day Model
- Fusion Map Relationship Model
- Mission Impact Model
- Source Confidence Model
- Data Freshness Model

### Commercial Control Plane Model Control
- AI Provider Registry
- Model Routing
- Model Usage Limits
- Tenant AI Budgets
- Prompt Pack Registry
- Agent / Skill Registry
- Model Audit
- Model Pack Allocation
- Model Version Rollback

## Decision Explainability
Every automated decision must be explainable.

Required decision rationale fields:
- decision_id
- decision_type
- affected_case_id
- affected_risk_object_id
- rule_ids
- model_ids
- evidence_refs
- source_freshness
- confidence
- previous_state
- new_state
- priority_effect
- SLA_effect
- routing_effect
- validation_effect
- audit_event_id

Decision types include:
- case binding
- priority assignment
- P0 application
- SLA profile selection
- routing decision
- validation pass/fail
- closure gate pass/fail
- reopening trigger
- suppression application
- exception requirement
- mission impact calculation

## Simulation
Rule/model simulation must support:
- current versus proposed comparison
- affected cases count
- affected P0 count
- affected SLA profile count
- affected routing decisions
- affected closure gates
- affected mission objectives
- tenant blast radius of change
- rollback readiness

## Versioning
Rules and models must have:
- active version
- draft version
- previous version
- effective date
- author
- approver
- change rationale
- simulation report
- rollback state
- tenant allocation

## Build Requirement
No rule/model feature may be built without:
- registry entry
- route/menu registration
- RBAC permission
- simulation requirement
- versioning requirement
- audit event
- decision explainability path
