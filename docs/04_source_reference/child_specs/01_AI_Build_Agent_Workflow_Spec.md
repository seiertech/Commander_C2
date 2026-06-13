> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# 01 — AI Build Agent Workflow Specification

## Status
ACTIVE BASELINE SPECIFICATION.

## Purpose
Defines how AI build agents, coding agents, review agents, and documentation agents must consume Commander SDR source documents before build-pack generation.

## Mandatory Read Order
1. `00_AUTHORITY_AND_PRECEDENCE_v2_4.md`
2. `00_SPECIFICATION_REGISTER_v2_4.md`
3. Master Proposition
4. Master Technical Specification
5. Relevant child specifications
6. Feature Registry
7. Active shell references

## Agent Constraints
- Do not implement manual case creation.
- Do not implement manual case closure.
- Do not implement manual case reopening.
- Do not implement freeform lifecycle progression controls.
- Do not redesign active shell geometry unless explicitly authorised.
- Do not treat P0 Zero-Day as case status.
- Do not merge Tenant Admin and Commander Internal Control Plane responsibilities.
- Do not implement unbound risks.

## Required Agent Output Checks
Each generated artefact must declare:
- source documents used;
- authority document version;
- affected application surface;
- affected lifecycle object;
- risk object binding;
- routing impact;
- validation impact;
- closure/reopening impact;
- UI surface impact;
- Fusion Map impact;
- audit impact.

## Build-Pack Transition
This specification governs the later build-pack stage. It does not itself define build packs; it defines how build packs must be derived from the baseline.
