# BUILD BACKLOG — Commander C2

**Purpose:** SINGLE ordered work queue. Strategy in REBASE_STRATEGY_v2.md. Debt in debt-register.md.
**Status:** Active

## Phase 0: Foundation
- [x] Repo + directory structure
- [x] Steering files (10)
- [x] BUILD_BACKLOG + debt-register + PAGE_SCHEDULE
- [x] Pre-commit hook

## Phase 1: Standards Evidence Model
- [x] CommonFields entity
- [x] StandardsDeclaration entity + validation
- [x] StandardsFieldMapping entity + validation
- [x] StandardsVersionHistory entity + validation
- [x] 13 declaration fixtures
- [x] Initial field mapping fixtures

## Phase 2-11: See REBASE_STRATEGY_v2.md for full breakdown

## Phase 2: Architecture Classification & Topology
- [x] ArchitectureClassification entity (TOGAF 10 + Zachman 3.0)
- [x] TopologyNode entity
- [x] TopologyEdge entity
- [x] Architecture classification fixtures (12 records)
- [x] Topology fixtures (10 nodes, 10 edges)
- [x] TOGAF/Zachman StandardsFieldMapping fixtures (18 mappings)

## Phase 3-11: See REBASE_STRATEGY_v2.md for full breakdown

## Phase 3: Event & Intelligence (OCSF 1.3.0)
- [x] ocsf-types.ts (base event, severity, status, metadata, NATO/Admiralty, commander_ extensions)
- [x] Signal entity (class_uid 2004, Detection Finding)
- [x] FindingEvent entity (class_uid 2001, Security Finding + MITRE ATT&CK)
- [x] RemediationEvent entity (class_uid 2002, Remediation Activity + OODA tempo)
- [x] IntelligenceAssessment entity (class_uid 2005, Incident Finding + NATO grading)
- [x] OCSF/NATO/MITRE StandardsFieldMapping fixtures (50 mappings)

## Phase 4-11: See REBASE_STRATEGY_v2.md for full breakdown

**Last Updated:** 2026-06-10
**Current Phase:** 3 COMPLETE — moving to Phase 4 (Risk & Posture)
