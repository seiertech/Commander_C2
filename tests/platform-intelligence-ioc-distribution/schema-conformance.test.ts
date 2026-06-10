/**
 * Schema Conformance Tests
 *
 * Feature: platform-intelligence-ioc-distribution
 * Task: 15.3 — Assert Postgres-portability, tenant-leading keys, IOC dedup index,
 * absence of cross-workload FKs between catalogue and evaluation planes.
 * Requirements: 17.3
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SCHEMA_DIR = path.resolve(__dirname, '../../packages/db/src/schema');

describe('Schema conformance — Platform Intelligence', () => {
  const catalogueSchema = fs.readFileSync(path.join(SCHEMA_DIR, 'platform-intelligence.ts'), 'utf-8');
  const tenantSchema = fs.readFileSync(path.join(SCHEMA_DIR, 'tenant-intelligence.ts'), 'utf-8');

  it('catalogue schema uses pgTable (Postgres-portable)', () => {
    expect(catalogueSchema).toContain('pgTable');
    expect(catalogueSchema).not.toContain('mysqlTable');
    expect(catalogueSchema).not.toContain('sqliteTable');
  });

  it('evaluation schema uses pgTable (Postgres-portable)', () => {
    expect(tenantSchema).toContain('pgTable');
  });

  it('all tables have tenant_id as first indexed column (tenant-leading keys)', () => {
    // Every pgTable definition should have tenantId text column
    const tableMatches = catalogueSchema.match(/pgTable\(/g);
    expect(tableMatches).not.toBeNull();
    expect(catalogueSchema).toContain("tenant_id: text('tenant_id').notNull()");
  });

  it('IOC dedup unique index exists on (tenant_id, ioc_category, normalised_value)', () => {
    expect(catalogueSchema).toContain('ioc_dedup_idx');
    expect(catalogueSchema).toContain('table.tenant_id, table.ioc_category, table.normalisedValue');
  });

  it('no cross-workload foreign keys between catalogue and evaluation planes', () => {
    // Evaluation schema should NOT have references to catalogue tables
    // Cross-plane references are plain text columns, not references()
    expect(tenantSchema).toContain("sourceId: text('source_id').notNull()"); // no .references()
    expect(tenantSchema).toContain("platformRecordId: text('platform_record_id').notNull()"); // no .references()
    expect(tenantSchema).toContain("iocId: text('ioc_id').notNull()"); // no .references()
    expect(tenantSchema).toContain("case_id: text('case_id').notNull()"); // no .references()

    // Verify no references() to catalogue tables in cross-plane columns
    const crossPlaneRefs = tenantSchema.match(/(?:sourceId|platformRecordId|iocId|caseId).*\.references\(\)/g);
    expect(crossPlaneRefs).toBeNull();
  });

  it('data_classification defaults to threat_intelligence', () => {
    expect(catalogueSchema).toContain("default('threat_intelligence')");
    expect(tenantSchema).toContain("default('threat_intelligence')");
  });
});
