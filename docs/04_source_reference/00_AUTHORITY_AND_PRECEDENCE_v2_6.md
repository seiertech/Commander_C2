> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Authority and Precedence — v2.6 Baseline

**Document ID:** `00_AUTHORITY_AND_PRECEDENCE_v2_6.md`
**Version:** v2.6
**Status:** Authoritative
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture

## 1. Purpose

This document defines the authority hierarchy and precedence rules for Commander SDR specifications at the v2.6 baseline. All build operations, audit operations, and conformance evaluations are governed by this hierarchy. Conflicts between specifications are resolved by precedence.

## 2. Authority Hierarchy

Top-down authority order for v2.6:

### Tier 1 — Master Authority

1. **Master Proposition v5.0** (`Commander_SDR_Master_Proposition_v5_0.md`)
2. **Master Technical Specification v7.0** (`Commander_SDR_Master_Technical_Specification_v7_0.md`)
3. **SDR Control Plane Specification v1.1** (`SDR_Control_Plane_Specification_v1_1.md`)
4. **SDR Specification Schedule and Folder Structure v1.9** (`SDR_Specification_Schedule_and_Folder_Structure_v1_9.md`)

### Tier 2 — Authority Documents

5. **Authority and Precedence v2.6** (this document)
6. **Specification Register v2.6** (`00_SPECIFICATION_REGISTER_v2_6.md`)
7. **Current Baseline Manifest v2.6** (`CURRENT_BASELINE_MANIFEST_v2_6.md`)
8. **Release Notes v2.6** (`RELEASE_NOTES_v2_6.md`)

### Tier 3 — Binding Child Specifications (#01 through #75)

All numbered child specifications in `docs/02_child_specs/` are binding. Where a child spec conflicts with the Master Proposition or Master Technical Specification, the **child spec governs** (per the established v2.5.2 doctrine that child specs are authoritative on their subject matter).

### Tier 4 — Implementation References

- HTML shell references in `docs/04_shells/` (per Spec #56 Shell Reference vs Build Authority Doctrine)
- v2.5.2 baseline references in `docs/05_reference/`

### Tier 5 — Reference Inputs (outside binding precedence)

- `docs/03_api_specs/` — vendor API specifications governed by `API_SPEC_INTAKE_RULES.md`
- `docs/03_api_specs/INDEX.md` — catalogue of vendor specifications with class declarations and conformance tiers

Reference inputs **inform** but do not **govern** build operations. The connector contract specified in Spec #61 governs what connectors must do; the schedule of named platforms in `INDEX.md` governs which connectors exist at any baseline.

## 3. Precedence Rules

### Rule 1 — Newer baseline supersedes older within same authority tier

The v2.6 baseline supersedes v2.5.2. All v2.6 documents replace their v2.5.2 predecessors:

- Master Proposition v5.0 supersedes v4.7
- Master Technical Specification v7.0 supersedes v6.8
- Authority documents v2.6 supersede v2.5.2 versions
- Release Notes v2.6 supersedes prior release notes (which remain as historical record)

### Rule 2 — Child spec governs over Master on its subject matter

A binding child spec governs over the Master Proposition or Master Technical Specification on its subject area. The Masters provide framework; child specs provide binding detail.

Example: where Spec #71 (Pre-Warned Classification) differs from Master Proposition v5.0 Section 2.3, Spec #71 governs the technical implementation.

### Rule 3 — Foundational doctrine specs govern over capability specs

The v2.6 foundational doctrine specs (#57 Security C2 Doctrine, #58 OODA Loop, #59 Intelligence Layer, #60 Attack Surface Framework, #61 Connector Contract, #62 Verdict Semantics) govern over subordinate capability specs (#65-#75).

Where a capability spec contradicts foundational doctrine, the doctrine spec governs.

### Rule 4 — Binding specs govern over implementation references

Binding specifications govern over HTML shell references. Per Spec #56 (Shell Reference vs Build Authority Doctrine), shells are reference implementations subordinate to binding specs.

### Rule 5 — Reference inputs do not govern build

Reference inputs in `docs/03_api_specs/` and other reference trees inform but do not govern build operations. The binding specs define what must be built; reference inputs provide vendor-specific guidance.

### Rule 6 — Authority Notice top-of-document declarations are binding

Where a document includes an "Authority Notice" at the top (typically supersession declarations and governing references), the notice is binding doctrine for that document's interpretation.

## 4. Application Boundaries

Per the v2.5.2 doctrine (carried forward unchanged), Commander operates under three distinct application boundaries:

- **Operational App** (`app.commander-sdr.com`) — production tenant use
- **Tenant Admin** (`admin.commander-sdr.com`) — tenant configuration
- **Commercial Control Plane** — internal cross-tenant operations

All v2.6 specifications respect these boundaries. Where a spec introduces capability, it specifies which application boundary the capability operates under.

## 5. v2.6 New Authority

The v2.6 release adds the following authority elements:

- **Security Command and Control Doctrine** (Spec #57) — establishes the category framing
- **Security OODA Loop Specification** (Spec #58) — establishes the operational tempo framework
- **Intelligence Layer Architecture** (Spec #59) — establishes the four-stream integration architecture
- **Internal and External Attack Surface Framework** (Spec #60) — establishes the dual surface model
- **Universal Security Signal Connector Contract** (Spec #61) — establishes the four-class connector architecture
- **Verdict Semantics Specification** (Spec #62) — establishes verdict signal treatment

These six specifications form the v2.6 doctrinal foundation. All subordinate v2.6 specifications operate within this foundation.

## 6. Conformance with this Authority

The v2.6 baseline is correctly applied when:

- All authority documents (Tier 2) reference v2.6 versions
- All Master documents (Tier 1) at v2.6 versions
- All child specs operating under v2.6 authority notice
- Reference inputs catalogued per v2.6 INDEX.md
- Build operations conformant to v2.6 binding doctrine
- Audit operations evaluate against v2.6 conformance criteria

## 7. v2.5.2 Carry-Forward

All v2.5.2 specifications (#01 through #56) carry forward unchanged to v2.6 except where explicitly extended by v2.6 addendum sections. Existing v2.5.2 doctrine (closed-loop lifecycle, P0 priority overlay, application boundaries, active shell authority, no-manual-case-lifecycle doctrine, Shell Reference vs Build Authority doctrine) continues to apply unchanged.

## 8. Versioning

This is v2.6 of the Authority and Precedence document. It supersedes v2.5.2 in full. Future versions will be issued under successive baseline increments.
