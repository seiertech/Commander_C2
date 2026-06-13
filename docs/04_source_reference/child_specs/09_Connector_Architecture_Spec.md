> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# 09 — Connector Architecture Specification

## Status
ACTIVE BASELINE SPECIFICATION.

## Purpose
Defines the common connector architecture for Commander SDR ingestion, normalisation, tool health, risk object binding, validation freshness, and Fusion Map emission.

## Connector Lifecycle
1. Registered
2. Configured
3. Authenticated
4. Scheduled
5. Ingesting
6. Normalising
7. Emitting canonical objects
8. Health evaluated
9. Freshness evaluated
10. Degraded / failed / disabled / retired

## Required Connector Outputs
Every connector must emit one or more of:
- canonical entities;
- risk objects;
- coverage objects;
- control objects;
- drift objects;
- exposure objects;
- vulnerability objects;
- identity objects;
- tool-health objects;
- Fusion Map nodes;
- Fusion Map edges;
- validation freshness signals.

## Case Binding Rule
Any actionable connector finding must create or bind to a canonical `RiskObject`, which must create or bind to a case through the case-binding engine.

## Tool Health Rule
Connector failure, stale ingestion, authentication failure, API quota exhaustion, schema drift, or missing source coverage must emit tool-health signals and may generate tool-health risk objects.

## Security Requirements
- Credentials are stored only through the approved secret-management layer.
- Connector permissions must be least-privilege.
- All connector access and configuration changes are audited.
- Connector errors must never silently suppress actionable risk.

## MVP Connector Pattern
The first connector implementations should use a shared connector interface, test-data connector, Tenable/VM-style source, Microsoft Graph/Entra-style source, AWS posture source, and email-ingestion simulation.
