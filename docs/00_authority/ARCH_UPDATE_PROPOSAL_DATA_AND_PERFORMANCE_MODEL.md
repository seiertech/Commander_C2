# Architectural Update Proposal: Data & Performance Model

**Status:** PROPOSED — Requires owner approval before implementation  
**Proposal ID:** ARCH-UPDATE-001  
**Date:** 2026-06-13  
**Owner:** Johann / Commander C2 Architecture  
**Triggered by:** CRAW Engine stress test — ingestion layer adds strain at entity matching, posture computation, reporting queries, audit volume, and AI/RAG export  
**Governing specs:** MTS v7.0 §11; Specs #05, #06, #12, #16; Thesis Data Dictionary  
**Impact:** Schema additions (non-breaking), worker configuration, new tables, CDC pipeline design  
**Risk:** LOW — all changes are additive. No existing columns/tables modified or dropped.

---

## 1. Problem Statement

The CRAW Engine introduces 90+ connectors pulling at 5-tier cadence (5min to monthly). This produces:
- 500-2,000 pull operations per tenant per day
- 10,000-100,000 signal records per tenant per day
- Continuous entity enrichment across 15+ entity types simultaneously
- High-volume verdict ingestion (email security alone = thousands/day)
- Append-only audit events on every material action
- Posture score recomputation on every state change
- Dashboard/reporting queries against live operational data

The current schema was designed to handle this (tenant-leading keys, data classification, partition-ready structures, JSONB for bounded objects, cross-plane separation). However, four specific patterns need architectural reinforcement before the CRAW Engine goes live.

---

## 2. Proposed Changes

### 2.1 Entity Match Signal Index

**Problem:** Entity matching (cross-source resolution) currently requires scanning `source_refs` JSONB arrays on the assets and identities tables. With 90+ connectors, each pull needs to answer "does this hostname/IP/ARN already exist?" — JSONB array scanning is O(n) per entity.

**Proposal:** Dedicated denormalised lookup table for match signals.

```sql
CREATE TABLE asset_match_signals (
  tenant_id       TEXT NOT NULL,
  signal_type     TEXT NOT NULL,  -- 'hostname', 'ip', 'cloud_resource_id', 'fqdn', 'mac', 'serial', 'edr_host_id', 'scanner_asset_id'
  signal_value    TEXT NOT NULL,
  asset_id        TEXT NOT NULL,  -- FK to assets.id
  connector_id    TEXT NOT NULL,  -- which connector reported this signal
  confidence      INTEGER NOT NULL DEFAULT 100,  -- match confidence 0-100
  last_seen_at    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (tenant_id, signal_type, signal_value)
);

CREATE INDEX ams_asset_idx ON asset_match_signals(asset_id);
CREATE INDEX ams_connector_idx ON asset_match_signals(connector_id);
```

```sql
CREATE TABLE identity_match_signals (
  tenant_id       TEXT NOT NULL,
  signal_type     TEXT NOT NULL,  -- 'entra_object_id', 'upn', 'email', 'employee_id', 'service_principal_id', 'aws_arn'
  signal_value    TEXT NOT NULL,
  identity_id     TEXT NOT NULL,  -- FK to identities.id
  connector_id    TEXT NOT NULL,
  confidence      INTEGER NOT NULL DEFAULT 100,
  last_seen_at    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (tenant_id, signal_type, signal_value)
);

CREATE INDEX ims_identity_idx ON identity_match_signals(identity_id);
CREATE INDEX ims_connector_idx ON identity_match_signals(connector_id);
```

**Performance gain:** O(1) primary key lookup on match instead of JSONB array scan. Handles multi-million entity estates.

**Write overhead:** One additional INSERT/UPDATE per match signal per pull. Negligible compared to the query savings.

**Spec alignment:** Spec #05 §14 (Asset Matching) defines signal weights (cloud_resource_id, hostname, FQDN, MAC, IP, serial). This table stores exactly those signals. Spec #05 §15 (Identity Matching) defines identity signals. Same pattern.

---

### 2.2 Event-Driven Posture Recomputation

**Problem:** Every enrichment signal updates entity state. If posture score (6 NIST CSF functions × per-asset) is recomputed inline on every update, the ingestion pipeline blocks on expensive aggregation queries.

**Proposal:** Decouple posture computation from the ingestion hot-path.

**Architecture:**

```
Signal arrives → Entity enriched (fast write)
                      │
                      ▼
              Emit event to posture.recompute queue
                      │
                      ▼ (debounced — wait 5s for batch to settle)
              Posture Worker picks up batch
                      │
                      ▼
              Recomputes posture for affected entities
                      │
                      ▼
              Writes to asset_security_posture + posture_dimension tables
                      │
                      ▼
              Dashboard reads from these tables (pre-computed)
```

**Implementation:**

```sql
-- Posture recompute request queue (BullMQ job payload, not a table)
-- Job: { tenant_id, asset_ids: [...], triggered_by: 'connector_pull', debounce_key: 'tenant_id:batch_window' }
```

**Worker behaviour:**
- Debounce: 5 seconds after last event for same tenant (batches rapid-fire updates)
- Idempotent: Same asset recomputed = same result (no side effects from duplicate jobs)
- Scope: Only recomputes affected assets, not entire tenant estate
- Metrics: `posture_recompute_duration_ms`, `posture_recompute_batch_size`

**Spec alignment:** Spec #06 §4.1 defines `normalisation.process` queue. This adds a `posture.recompute` queue following the same worker base class pattern (§6), idempotency model (§7), retry strategy (§8).

**SLO:** Posture score reflects latest state within 30 seconds of entity update (5s debounce + 25s compute budget).

---

### 2.3 Metrics Cache for Dashboard Queries

**Problem:** Dashboard pages (Command Centre, CISO, Domain Pulse, Team Pulse) query aggregate metrics: total open cases by priority, posture score trends, OODA phase health, coverage percentages. Computing these on every page load from transactional tables is expensive at scale.

**Proposal:** Pre-aggregated metrics cache table, refreshed on schedule and on material events.

```sql
CREATE TABLE metrics_cache (
  tenant_id           TEXT NOT NULL,
  metric_domain       TEXT NOT NULL,  -- 'posture', 'cases', 'coverage', 'ooda', 'identity', 'vulnerability'
  metric_name         TEXT NOT NULL,  -- 'total_open_p1_cases', 'avg_posture_score', 'edr_coverage_pct'
  metric_scope        TEXT NOT NULL,  -- 'tenant', 'team:security-ops', 'asset_class:server'
  current_value       NUMERIC NOT NULL,
  previous_value      NUMERIC,        -- previous period for trend
  trend_direction     TEXT,           -- 'improving', 'degrading', 'stable'
  measurement_period  TEXT NOT NULL,  -- ISO 8601 interval
  computed_at         TIMESTAMPTZ NOT NULL,
  valid_until         TIMESTAMPTZ NOT NULL,  -- cache TTL
  standard_marker     TEXT NOT NULL DEFAULT 'ITIL 4',
  PRIMARY KEY (tenant_id, metric_domain, metric_name, metric_scope)
);

CREATE INDEX mc_domain_idx ON metrics_cache(tenant_id, metric_domain);
CREATE INDEX mc_valid_idx ON metrics_cache(valid_until);
```

**Refresh strategy:**
- **Scheduled:** Every 5 minutes for Tier 1 metrics (P0/P1 counts, connector health)
- **Scheduled:** Every 15 minutes for Tier 2 metrics (posture scores, coverage)
- **Scheduled:** Hourly for Tier 3 metrics (trends, comparisons)
- **Event-driven:** Immediate refresh on P0 case creation, connector failure, priority change

**Worker:** `metrics.refresh` queue (per Spec #06 pattern). Computes from transactional tables, writes to cache. Dashboards read ONLY from cache.

**SLO:** Dashboard loads < 2 seconds (per Spec #16 §2). Cache ensures no heavy joins on page render.

**Spec alignment:** Thesis Layer 8 defines `Case_Management_Metric` entity. This cache is the persistence layer for those metrics plus operational dashboard needs.

---

### 2.4 Audit Cold-Path & AI/RAG Export Pipeline

**Problem:** Audit events are the highest-volume table (every material action across every entity). They're also the most valuable corpus for AI/RAG (full history of what happened to every entity). Keeping all audit in hot PostgreSQL indefinitely is expensive and unnecessary.

**Proposal:** Dual-write pattern with cold-path export for AI/RAG.

**Architecture:**

```
Material action occurs
        │
        ├──▶ PostgreSQL audit_events table (HOT — queryable, 90-day retention)
        │
        └──▶ S3 append-only store (COLD — partitioned by tenant/date, unlimited retention)
                    │
                    ▼ (scheduled CDC export — daily)
              Vector indexing pipeline
                    │
                    ▼
              Bedrock Knowledge Base / Stargate
                    │
                    ▼
              Commander AI (RAG-grounded responses)
```

**Implementation — Phase 1 (S3 cold-path):**

```sql
-- No schema change needed. Add worker that:
-- 1. Reads audit_events older than 90 days
-- 2. Writes to S3 as partitioned Parquet: s3://commander-audit/{tenant_id}/{year}/{month}/{day}/
-- 3. Deletes from PostgreSQL (or moves to partition that gets dropped)
-- 4. Maintains pointer table for cross-reference
```

```sql
CREATE TABLE audit_archive_pointers (
  tenant_id       TEXT NOT NULL,
  archive_date    DATE NOT NULL,
  s3_path         TEXT NOT NULL,
  record_count    INTEGER NOT NULL,
  archived_at     TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (tenant_id, archive_date)
);
```

**Implementation — Phase 2 (AI/RAG export):**

```sql
-- CDC pipeline (Change Data Capture) exports to vector store:
-- Source: audit_events + entity snapshots (asset, identity, case state changes)
-- Target: Bedrock Knowledge Base (or Stargate vector store)
-- Schedule: Daily batch (or near-real-time if needed)
-- Format: Structured documents with metadata (tenant, entity_type, entity_id, action, timestamp)
```

**What feeds AI/RAG (the corpus):**
| Data Source | What It Provides for RAG | Volume |
|---|---|---|
| Audit events | Full change history per entity | Highest |
| Risk object history | What risks were found and how they were treated | High |
| Case lifecycle | Detection → remediation → closure narrative | Medium |
| Posture snapshots | How posture changed over time | Medium |
| Intelligence assessments | Graded signal quality and source reliability | Low |
| Entity relationships | Graph context for connected risk | Medium |

**Existing readiness:**
- `source_classification` JSONB on assets/identities — structured for export
- `attacks` JSONB on cases — ATT&CK bindings ready
- `prior_state` / `new_state` on audit events — full delta capture
- Dormant RAG fields noted in architecture (from learnings)
- Dormant telemetry pipeline designed for both paths

**Spec alignment:** 
- MTS §11.1 data classification: audit data has its own retention policy
- Spec #13 (Commander AI): grounding in available Commander data
- Spec #16 §7: audit has "zero or near-zero data loss expectation"
- Learnings: "Dormant RAG fields in data model. Dormant telemetry pipeline built both paths."

---

## 3. What Does NOT Change

| Existing Architecture | Status |
|---|---|
| All existing tables | UNCHANGED — no column drops, renames, or type changes |
| Tenant-leading keys | PRESERVED — new tables follow same pattern |
| Data classification enum | PRESERVED — new tables use it |
| JSONB bounded objects | PRESERVED — still used for coverage, attacks, etc. |
| Cross-plane no-FK pattern | PRESERVED — new tables follow same pattern |
| Drizzle ORM | PRESERVED — new tables defined in Drizzle |
| BullMQ worker pattern | PRESERVED — new workers follow Spec #06 base class |
| Connector state machine | PRESERVED — no changes |
| Case 12-state lifecycle | PRESERVED — no changes |

---

## 4. Migration Strategy

All changes are **additive only**. No downtime required.

| Step | Action | Risk |
|---|---|---|
| 1 | Create `asset_match_signals` table | Zero — new table, no FK dependencies |
| 2 | Create `identity_match_signals` table | Zero — new table |
| 3 | Backfill match signals from existing `source_refs` JSONB | Low — read-only scan of existing data |
| 4 | Create `metrics_cache` table | Zero — new table |
| 5 | Deploy posture recompute worker | Zero — new worker, doesn't replace anything |
| 6 | Deploy metrics refresh worker | Zero — new worker |
| 7 | Create `audit_archive_pointers` table | Zero — new table |
| 8 | Deploy audit archival worker (Phase 2) | Low — only moves old records after validation |
| 9 | Deploy CDC → vector store pipeline (Phase 2+) | Low — separate infrastructure, no impact on operational path |

---

## 5. Capacity Impact

| Metric | Before CRAW Engine | After CRAW Engine | With This Proposal |
|---|---|---|---|
| Entity match query time | ~50ms (small dataset) | ~500ms+ (JSONB scan at scale) | **<5ms** (PK lookup) |
| Posture score freshness | Inline (blocks ingestion) | Would block pipeline | **<30s** (async, debounced) |
| Dashboard page load | ~1s (small dataset) | ~5s+ (aggregate queries at scale) | **<2s** (cache read) |
| Audit table size (1yr) | Manageable | 50-100M rows/tenant | **90-day hot + unlimited cold** |
| AI/RAG corpus availability | Not available | Not available | **Daily refresh to vector store** |

---

## 6. New Workers Required

| Worker | Queue | Trigger | Spec #06 Compliant |
|---|---|---|---|
| Posture Recompute | `posture.recompute` | Entity enrichment event (debounced) | Yes — follows §6 base class |
| Metrics Refresh | `metrics.refresh` | Scheduled (5/15/60 min) + event-driven | Yes — follows §6 base class |
| Audit Archival | `audit.archive` | Scheduled (daily) | Yes — follows §6 base class |
| RAG Export | `ai.rag_export` | Scheduled (daily) or CDC stream | Yes — follows §6 base class |

All workers: tenant-scoped, idempotent, retry-aware, dead-lettered, observable (per Spec #06 §3-9).

---

## 7. Standards Traceability

| Change | Governing Standard | standard_marker |
|---|---|---|
| asset_match_signals | Spec #05 §14 (Asset Matching) | `Spec #05` |
| identity_match_signals | Spec #05 §15 (Identity Matching) | `Spec #05` |
| metrics_cache | ITIL 4 (Case_Management_Metric from thesis L8) | `ITIL 4` |
| posture.recompute worker | NIST CSF 2.0 (posture dimensions) | `NIST CSF 2.0` |
| audit cold-path | MTS §11.1 (audit retention policy) | `MTS §11.1` |
| AI/RAG export | Spec #13 (Commander AI grounding) | `Spec #13` |

---

## 8. Acceptance Criteria

- [ ] Entity matching completes in <5ms for 100K+ entities per tenant
- [ ] Posture score reflects latest state within 30 seconds of entity update
- [ ] Dashboard pages load in <2 seconds with 1M+ records per tenant
- [ ] Audit table stays under 90 days hot (older records archived to S3)
- [ ] AI/RAG corpus refreshes daily with structured entity + change history
- [ ] All new workers follow Spec #06 base class (tenant-safe, idempotent, observable)
- [ ] No existing tests break (all changes additive)
- [ ] Migrations run without downtime

---

## 9. Decision Required

**Approve this proposal** to proceed with schema additions and worker deployment as Step 1 of the CRAW Engine build sequence.

Once approved:
- Step 2: CRAW Engine typed contracts
- Step 3: Ingestion orchestrator
- Step 4: First connector adapter (AWS Security Hub)
- Step 5: Case Workflow Workbench data model
- Step 6: Case Workflow Workbench UI

---

**Proposed by:** Kiro (AI Architecture Assistant)  
**Requires approval by:** Johann (Architecture Owner)  
**Last updated:** 2026-06-13
