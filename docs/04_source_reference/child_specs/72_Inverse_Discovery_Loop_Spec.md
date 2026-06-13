> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #72 — Inverse Discovery Loop Specification

**Document ID:** `72_Inverse_Discovery_Loop_Spec.md`
**Spec:** 72
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Foundational Capability
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `60_Internal_and_External_Attack_Surface_Framework_Spec.md`
- `61_Universal_Security_Signal_Connector_Contract_Spec.md`

## 1. Status

Binding capability specification. Defines the Inverse Discovery Loop — the closed loop that uses external signal to test Commander's own inventory completeness.

## 2. Capability Statement

When external signal (SOC case, verdict event, threat intel hit) references an entity Commander doesn't know about, the lookup failure is itself a finding. The Inverse Discovery Loop converts the lookup failure into a Coverage Blindspot case that drives entity onboarding and connector tuning.

This is the dual of Pre-Warned Classification. Pre-Warned says: "we knew, attack landed." Inverse Discovery says: "we didn't know, external signal told us we should have." Both classifications are auditable feedback loops that make Commander's intelligence picture more honest over time.

## 3. The Inverse Discovery Loop

### 3.1 Trigger Phase

The loop fires when any of the following occurs:

- A Class A SOC case references an affected entity (user, device, resource) that doesn't resolve in Commander's canonical entity model
- A Class B verdict event references an entity that doesn't resolve
- A Class D threat intelligence signal matches an entity reference that doesn't resolve
- Cross-reference within Commander signals an entity expected to exist but missing from inventory

### 3.2 Resolution Attempt Phase

Before generating a Coverage Blindspot case, the loop attempts secondary resolution:

- **Fuzzy match** — close name match, common transliteration, alternative spellings, case variations
- **Identifier translation** — UPN vs SAM-account-name vs object GUID translation, hostname vs FQDN translation
- **Recent change check** — was the entity recently renamed, recently created, recently deleted?
- **Cross-tenant reference** — for federated tenants, was the entity created in a peered tenant?
- **Source authority hierarchy** — was the entity authoritative in a system Commander doesn't yet observe?

If secondary resolution succeeds, the loop completes with no case generated (resolution updates the canonical model with the discovered match).

### 3.3 Case Generation Phase

If secondary resolution fails, a Coverage Blindspot case is generated (per Spec #08 v2.6) with the following attributes:

- **Trigger source** — which stream and which signal referenced the unknown entity
- **Entity references** — the entity identifier(s) from the source signal that failed to resolve
- **Root cause classification** — auto-classified into one of four buckets:
  - **Discovery gap** — entity exists in a system not yet observed by a Commander connector
  - **Staleness** — entity exists in an observed system but the connector hasn't pulled recently enough
  - **Shadow IT** — entity exists outside the customer's known security tooling (e.g. user-provisioned SaaS, unmanaged cloud account)
  - **Naming mismatch** — entity exists in Commander's model under a different identifier; canonical entity model match logic needs tuning
- **Severity** — based on signal source criticality (e.g. critical SOC case → high severity; routine verdict → medium severity)
- **Recommended action** — based on root cause classification

### 3.4 Routing Phase

The case routes based on root cause:

- **Discovery gap** → platform engineering for connector onboarding evaluation
- **Staleness** → platform engineering for connector tuning
- **Shadow IT** → security architecture for governance evaluation (and possibly Internal Risk where shadow IT use suggests policy violation)
- **Naming mismatch** → platform engineering and security architecture jointly for entity matching tuning

### 3.5 Resolution Phase

Cases close when:

- **Discovery gap** — new connector onboarded and entity now observable, or determination made that the system is intentionally out of scope
- **Staleness** — connector tuned and freshness restored
- **Shadow IT** — entity onboarded or governance decision recorded (acceptance, removal, migration)
- **Naming mismatch** — entity matching logic tuned and the unresolved reference now resolves

Closure requires validation that the inverse discovery trigger no longer fires for the same entity.

## 4. Metric Integration

Inverse Discovery feeds the Observe phase health metric (Spec #58):

- **Inverse Discovery rate** — count of Coverage Blindspot cases generated per time window
- **Inverse Discovery rate by root cause** — breakdown across the four buckets
- **Inverse Discovery resolution tempo** — average time from case generation to closure
- **Coverage completeness trend** — Inverse Discovery rate decreasing over time indicates inventory becoming more complete (a healthy trend)

The metric is visible on the Observe Phase Dashboard (Spec #67).

## 5. Closed-Loop Property

Inverse Discovery is what makes Commander's inventory get more honest the longer it runs. The closed loop:

1. External signal references unknown entity
2. Coverage Blindspot case fires
3. Platform engineering investigates
4. New connector deployed, or existing connector tuned, or entity onboarded
5. Future external signal references resolve correctly
6. Coverage Blindspot rate decreases for that root cause
7. Inventory completeness increases

The loop is auditable (every case has full trail), measurable (Inverse Discovery rate trend), and improving (the rate should decrease over time as the inventory matures).

## 6. False Positive Handling

Some Inverse Discovery triggers are legitimate noise rather than genuine blindspots:

- Test accounts created and destroyed quickly
- Entities legitimately out of Commander's scope (managed by a separate tenant, isolated environment, deliberately unmanaged)
- One-off references in case detail that aren't relevant entities (typos in case narrative, references to external organisations)

The Inverse Discovery engine includes:

- **Suppression rules** — patterns marked as known-noise, not generating cases
- **Out-of-scope classifications** — entities or entity classes deliberately excluded from inventory
- **Confidence thresholds** — single references with low confidence don't generate cases; patterns of references do

False positive tuning is an operational task during deployment and the first months of operation, after which Inverse Discovery rate becomes a meaningful signal.

## 7. Build Readiness

Inverse Discovery Loop is build-ready when:

- Trigger phase fires on lookup failures across all relevant streams
- Resolution attempt phase performs secondary resolution
- Case generation produces Coverage Blindspot cases with root cause classification
- Routing operates per Section 3.4
- Resolution phase validates closure
- Metric integration feeds Observe Phase Dashboard
- False positive handling per Section 6 operates
- Suppression rules and out-of-scope classifications are tenant-configurable

## 8. Configurability

Per Spec #55 v2.6:

- Trigger sensitivity (single reference vs pattern threshold)
- Out-of-scope classifications (entity classes or patterns excluded)
- Suppression rules
- Root cause classification weights (per-tenant tuning of auto-classification)
- Resolution tempo targets

## 9. Audit Events

- `INVERSE_DISCOVERY_TRIGGERED` — when external signal references unknown entity
- `INVERSE_DISCOVERY_RESOLVED_BY_SECONDARY_MATCH` — when secondary resolution succeeds
- `COVERAGE_BLINDSPOT_CASE_GENERATED` — when case generated
- `INVERSE_DISCOVERY_SUPPRESSED` — when suppression rule applies
- `COVERAGE_BLINDSPOT_RESOLVED` — when case closes with inventory updated

## 10. Relationship to Other v2.6 Specifications

- **Spec #59 (Intelligence Layer)** — cross-stream correlation generating Inverse Discovery
- **Spec #60 (Attack Surface Framework)** — applies to both attack surfaces
- **Spec #61 (Connector Contract)** — feeds connector tuning recommendations
- **Spec #71 (Pre-Warned Classification)** — fires Inverse Discovery on entity resolution failure
- **Spec #08 v2.6 (Case Management)** — Coverage Blindspot case type
- **Spec #58 (Security OODA Loop)** — Inverse Discovery rate is Observe phase metric
- **Spec #67 (OODA Dashboard Family)** — visible on Observe Phase Dashboard

## 11. Versioning

v1.0 — initial specification.
