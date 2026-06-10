# GOVERNANCE PROPOSAL — Commander C2

**Purpose:** Define the two governance chains that ensure the application remains valid to the proposition throughout the thesis-conformance rebuild.

**Context:** The old SDR had a governance runner (`scripts/governance-check.cjs`) that enforced ARCH-005→009 checks against a build sequence and debt register. The new C2 repo has 10 steering files defining principles. Neither is complete. This proposal synthesises both into two explicit chains.

---

## The Two Chains

### Chain 1: Build & Pipeline Governance
**Question it answers:** "Is the build process producing valid, traceable, standards-evidenced code?"

### Chain 2: Application & Data Integrity
**Question it answers:** "Is the running application faithful to the thesis proposition — data model, use cases, UI, knowledge graph, and data dictionary?"

---

## Chain 1: Build & Pipeline Governance

### What It Controls

Every commit. Every push. Every entity creation. The mechanical process of turning thesis requirements into code.

### The Lineage (in order — each step gates the next)

```
1. Thesis Layer Reference
   ↓ (which standard? which section? which fields?)
2. Standards Declaration (StandardsDeclaration entity)
   ↓ (what does Commander claim about this standard?)
3. Standards Field Mapping (StandardsFieldMapping entity)
   ↓ (field-for-field proof of conformance)
4. Entity Definition (TypeScript interface in thesis/ directory)
   ↓ (the actual code — snake_case, standard_marker, all fields)
5. Validation Function (validate_* function)
   ↓ (runtime proof the shape is correct)
6. Fixture (seed data proving the entity works)
   ↓ (at least 3 records per entity)
7. TypeScript Compilation (tsc --noEmit)
   ↓ (hard gate — must pass)
8. Commit (conventional format, one concern)
   ↓
9. Push
   ↓
10. Backlog Update (mark item done)
```

### Gates (Hard = blocks commit, Soft = logged debt)

| Gate | Type | Check |
|------|------|-------|
| G1: Standards before entity | **Hard** | Entity file MUST import or reference a StandardsDeclaration ID |
| G2: Entity before fixture | **Hard** | Fixture file MUST import the entity type |
| G3: Fixture before page | **Soft** | Page SHOULD consume fixture data (logged if not) |
| G4: tsc --noEmit | **Hard** | TypeScript must compile clean |
| G5: validate_* passes | **Hard** | All fixture records must pass validation |
| G6: standard_marker present | **Hard** | Every entity interface MUST have `standard_marker: string` |
| G7: Commit format | **Hard** | `type(scope): description` — conventional commits |
| G8: One concern per commit | **Soft** | No multi-entity commits unless they're the same thesis layer |

### Artefacts Updated Per Build Cycle

| Artefact | Updated When | Updated By |
|----------|-------------|-----------|
| BUILD_BACKLOG.md | Item started / completed | Builder |
| PAGE_SCHEDULE.md | Page built or updated | Builder |
| debt-register.md | Soft gate violated / tech debt discovered | Builder |
| DATA_DICTIONARY.md | Entity created or modified | Builder |
| USE_CASE_REGISTER.md | Use case identified or page completed | Builder |
| KNOWLEDGE_GRAPH.md | Entity relationships change | Builder |

### Enforcement Mechanism

The old SDR governance-check.cjs was sound in principle but checked the wrong things (old build sequence, old debt model). The new version should:

```
scripts/governance-check.cjs (v2)
├── CHECK-001: standard_marker on all entities (scan *.ts in thesis/ dir)
├── CHECK-002: StandardsFieldMapping exists for every governed entity
├── CHECK-003: validate_* function exists for every entity
├── CHECK-004: fixture exists for every entity (min 3 records)
├── CHECK-005: tsc --noEmit passes
├── CHECK-006: DATA_DICTIONARY.md has entry for every entity
├── CHECK-007: USE_CASE_REGISTER.md has at least 1 use case per page
├── CHECK-008: BUILD_BACKLOG.md has no stale items (started but not done >7 days)
├── CHECK-009: debt-register.md items have resolution dates
├── CHECK-010: KNOWLEDGE_GRAPH.md entity count matches entity file count
└── SCORE: Green (100%) / Yellow (90-99%) / Amber (70-89%) / Red (<70%)
```

### Pre-Commit Hook

```bash
#!/bin/sh
# Hard gates only — must pass to commit
node scripts/governance-check.cjs --pre-commit
# Checks: tsc, standard_marker presence, validate_* for changed entities
```

---

## Chain 2: Application & Data Integrity

### What It Controls

The truth of the application. Is what the user sees faithful to what the thesis says? Is the data model provably correct? Can an external reviewer trace any UI element back to a standard?

### The Integrity Artefacts

#### 1. DATA_DICTIONARY.md

| What It Contains | Purpose |
|---|---|
| Every entity name | Exhaustive catalogue |
| Every field on every entity | Field-level completeness |
| Data type per field | Type correctness |
| Governing standard per field | Standards traceability |
| Standard clause reference per field | Audit trail |
| Constraints (required/optional, enums, ranges) | Validation spec |
| Relationships (FK-like references to other entities) | Graph integrity |

**Rule:** No entity exists in code that isn't in the data dictionary. No field exists in code that isn't in the data dictionary. The dictionary IS the schema specification.

#### 2. USE_CASE_REGISTER.md

| What It Contains | Purpose |
|---|---|
| Use case ID | Trackable |
| Use case title | Human readable |
| Actor (who) | RBAC traceability |
| Trigger (what starts it) | Flow definition |
| Precondition | Data readiness |
| Main flow (steps) | Behavioural spec |
| Postcondition | Success criteria |
| UI page(s) served | Page traceability |
| Entities consumed | Data model traceability |
| Standards referenced | Thesis traceability |

**Rule:** Every UI page has at least one use case. Every use case references its backing entities. Every entity referenced must exist in the data dictionary.

#### 3. KNOWLEDGE_GRAPH.md

| What It Contains | Purpose |
|---|---|
| Entity → Entity relationships | Referential integrity map |
| Entity → Standard relationships | Standards conformance map |
| Entity → UI Page relationships | Presentation traceability |
| Entity → Use Case relationships | Behavioural traceability |
| Entity → Thesis Layer relationships | Architecture traceability |

**Rule:** This is the master relationship map. If an entity references another entity's ID, that relationship MUST be in the knowledge graph. If a page consumes an entity, that relationship MUST be here.

#### 4. Standards Evidence Model (already exists)

- StandardsDeclaration → proves what standards govern what
- StandardsFieldMapping → proves field-by-field conformance
- StandardsVersionHistory → proves version transitions are tracked

#### 5. UI Integrity Checks

| Check | Method |
|---|---|
| Every page imports from thesis entities | Static analysis |
| Every page has PageContainer wrapper | Static analysis |
| Every data point displayed traces to an entity field | Manual review / use case register |
| Every label/header uses thesis terminology | Manual review / use case register |
| No page displays data not backed by an entity | Cross-reference against data dictionary |

---

## How The Two Chains Work Together

```
                    ┌─────────────────────────────────────┐
                    │         THESIS (LAW)                 │
                    └──────────────┬──────────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                        │
           ▼                       ▼                        ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ CHAIN 1           │   │ Standards        │   │ CHAIN 2           │
│ Build & Pipeline  │   │ Evidence Model   │   │ App & Data        │
│ Governance        │   │ (bridge)         │   │ Integrity         │
└────────┬─────────┘   └──────────────────┘   └────────┬─────────┘
         │                                               │
         ▼                                               ▼
┌──────────────────┐                           ┌──────────────────┐
│ Controls:         │                           │ Controls:         │
│ - Commit process  │                           │ - Data dictionary │
│ - Gate checks     │                           │ - Use cases       │
│ - Build sequence  │                           │ - Knowledge graph │
│ - Debt register   │                           │ - UI integrity    │
│ - Backlog state   │                           │ - Entity validity │
└──────────────────┘                           └──────────────────┘
```

---

## The "End of Layer" Ceremony

After each thesis layer (L1→L11) is rebuilt:

1. **All entities in that layer** exist with snake_case + standard_marker ✅
2. **Data dictionary entries** exist for every entity and field ✅
3. **Standards declarations + field mappings** exist for every governed entity ✅
4. **Fixtures** exist (min 3 records per entity) and pass validation ✅
5. **Use cases** exist for every UI page that consumes layer entities ✅
6. **Knowledge graph** updated with all new relationships ✅
7. **tsc --noEmit** passes ✅
8. **governance-check.cjs** scores Green ✅
9. **BUILD_BACKLOG** item marked done ✅
10. **PAGE_SCHEDULE** updated for any new/changed pages ✅

Only then does the next layer begin.

---

## What We Keep From The Old SDR Governance

| Old Artefact | Keep? | Notes |
|---|---|---|
| governance-check.cjs | **REWRITE** — keep concept, rewrite checks for thesis model |
| ARCH-005 (data dictionary completeness) | **YES** → becomes CHECK-006 |
| ARCH-006 (build sequence) | **RETIRE** — replaced by L1→L11 sequential thesis layers |
| ARCH-007 (blocking debt) | **YES** → becomes CHECK-009 (debt register resolution dates) |
| ARCH-008 (readiness machine) | **SIMPLIFY** — becomes CHECK-008 (stale backlog items) |
| ARCH-009 (verification before done) | **YES** → becomes the "End of Layer Ceremony" |
| Score register | **YES** — keep scoring bands |
| Run log creation | **YES** — keep audit trail of governance runs |

## What We Keep From The New C2 Steering

| Steering File | Keep? | Notes |
|---|---|---|
| authority-and-precedence.md | **YES** — still correct |
| conveyor-discipline.md | **YES** — still correct |
| traceability-chain-v2.md | **UPDATE** — add data dictionary + use case + knowledge graph steps |
| standards-fidelity-doctrine.md | **YES** — still correct (this IS the thesis rebuild) |
| security-and-testing.md | **YES** — still correct |
| performance-discipline.md | **YES** — still correct |
| design-system-contract.md | **YES** — still correct |
| page-layout-standard.md | **YES** — still correct |
| system-first-doctrine.md | **YES** — still correct |
| product.md | **YES** — still correct |
| tech.md | **UPDATE** — add snake_case decision, thesis/ directory |

---

## Efficiency Considerations

### The "Many Changes At The End" Problem

You're right that UI pages will need updating after entities are rebuilt. The most efficient approach:

1. **Do NOT update UI pages during entity rebuild** — just ensure tsc compiles
2. **Accumulate a UI debt log** — every entity rename/restructure gets a line item
3. **Do one concentrated UI pass per thesis layer** at the end of each layer
4. **Use cases drive the UI pass** — run each use case against the page, update data points

This means:
- Entity work = fast (one concern, one commit, push, next)
- UI work = batched (per layer, driven by use cases, all at once)

### The "Run Use Cases Against Pages" Process

After each layer's entities are done:
1. Open each use case for that layer
2. Walk through the main flow on the corresponding page
3. Verify every data point displayed maps to a thesis entity field
4. Update the page to use new field names / new entities
5. Verify PageContainer + shell + design system adherence
6. Commit per page (or per 3 pages per conveyor discipline)

---

## New Artefacts To Create (Before Execution Begins)

| Artefact | Purpose | Location |
|---|---|---|
| DATA_DICTIONARY.md | Field-level entity catalogue | docs/01_data_model/ |
| USE_CASE_REGISTER.md | Behavioural specification | docs/02_use_cases/ |
| KNOWLEDGE_GRAPH.md | Relationship map | docs/03_knowledge/ |
| governance-check.cjs (v2) | Automated enforcement | scripts/ |
| pre-commit hook (v2) | Hard gate enforcement | .githooks/ |

---

## Summary: My Recommendation

1. **Keep both chains.** They serve different purposes and both are needed.
2. **Chain 1 runs automatically** (pre-commit hook + governance runner).
3. **Chain 2 is maintained manually** (data dictionary, use cases, knowledge graph) but CHECKED automatically (CHECK-006, CHECK-007, CHECK-010).
4. **UI updates are batched** per layer, not per entity. Driven by use cases.
5. **The old governance-check.cjs is rewritten** to check thesis-model concerns instead of old build-sequence concerns.
6. **The new C2 steering files are mostly correct** — just need minor updates to tech.md and traceability-chain-v2.md.
7. **Create the three new artefacts** (data dictionary, use case register, knowledge graph) BEFORE starting L1 execution.

---

## Your Decision

Do you agree with this two-chain model? If so, I'll:
1. Create the artefact scaffolds (data dictionary, use case register, knowledge graph)
2. Rewrite governance-check.cjs v2
3. Update the pre-commit hook
4. Update tech.md and traceability-chain-v2.md
5. Then we're ready to execute L1→L11

**Last Updated:** 2026-06-10
