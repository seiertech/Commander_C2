---
inclusion: always
---
# Performance Discipline — Commander C2
## No Red units. Workload class on every DB call. No cross-workload FK. Postgres-family portability.
## Tenant-leading composites. Cursor pagination. GIN on JSONB. Schema-per-domain. Designed T3, deployed T1.
## Classes: operational-read (<100ms), operational-write (<30ms), analytics-read (<250ms), reporting-read (<1s), ingestion-write (<50ms)
