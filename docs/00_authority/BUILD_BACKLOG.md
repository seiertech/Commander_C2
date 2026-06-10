# BUILD BACKLOG — Commander C2

**Purpose:** SINGLE ordered work queue. Strategy in REBASE_STRATEGY_v2.md. Debt in debt-register.md.
**Status:** Active

## Phase 0: Foundation
- [x] Repo + directory structure
- [x] Steering files (10)
- [x] BUILD_BACKLOG + debt-register + PAGE_SCHEDULE
- [x] Pre-commit hook

## Phase 1: Governance Scaffold
- [x] DATA_DICTIONARY.md — full field-level specification (35 thesis entities)
- [x] USE_CASE_REGISTER.md — 22 use cases across all layers
- [x] KNOWLEDGE_GRAPH.md — entity relationships, standard bindings, page bindings
- [x] governance-check.cjs v2 — 10 automated checks
- [x] pre-commit hook v2 — hard gates
- [x] Steering updates (tech.md, traceability-chain-v2.md, conveyor-discipline.md)

## Phase 2: Thesis Entity Build (L1→L11)
- [x] L1: Schema_Compliance (thesis §5) — 14 fixtures
- [x] L2: Architecture_Classification, Topology_Node, Topology_Edge (thesis §6) — 12 fixtures
- [x] L3: Signal, Finding_Event, Remediation_Event, Intelligence_Assessment (thesis §7) — 14 fixtures
- [x] L4: Asset, Software_Instance, Service, Asset_Service_Map (thesis §8) — 15 fixtures
- [x] L5: Asset_Classification, Asset_Security_Posture, Posture_Dimension (thesis §9)
- [x] L6+L7: Case + CTEM overlay, Remediation_Workflow, Remediation_Action, Action_Template (thesis §10+§11)
- [x] L8: 9 entities — Capacity/Maturity/Performance/Improvement (thesis §12)
- [x] L9: Mission, Mission_Indicator, Mission_Case_Link (thesis §14)
- [x] L10: Risk_Snapshot, Control_Reference, Control_State, Adherence_Assertion (thesis §15)
- [x] L11: Reporting views (no standalone entities — thesis §16)

## Phase 3: UI Migration Pass (per layer, batched)
- [x] Create thesis-adapters.ts (bridge SDR fixtures → thesis entity shapes)
- [x] Mission Overview page — thesis entities (delta_score, risk_reduction_value, mission_type)
- [x] Architecture page — thesis entities (togaf_domain, zachman_aspect, topology nodes)
- [x] External Operating Picture — Intelligence Confidence Grading (NATO/Admiralty)
- [x] Posture page — thesis §9 NIST CSF attribution
- [x] Cases page — thesis §11 ITIL+OODA+CTEM attribution
- [x] Assets page — thesis §8 ISO 19770 attribution
- [x] Governance page — thesis §15 UC-CTRL-001, UC-GOV-001
- [x] SOM page — thesis §12 UC-CAP-002
- [x] Batch header migration — 28 pages (Unit/Spec → Thesis)
- [x] Controls + Team Pulse — thesis §15 and §12
- [x] Complete 'Commander SDR' → 'Commander C2' rename (298 files)
- [ ] Remaining pages: individual field reference updates (ongoing)

## Phase 4: Fixture Rewrite
- [ ] Rewrite all 82 SDR fixtures to thesis field names
- [ ] Validate all fixtures pass thesis validate_* functions

## Phase 5: Test Suite Update
- [ ] Update 60+ test files to thesis entity shapes

**Last Updated:** 2026-06-10
**Current Phase:** 3 IN PROGRESS — core pages migrated, headers thesis-attributed
