/**
 * Seed Tenant — Commander SDR Test Fixtures
 *
 * Deterministic tenant context for repeatable tests (v1.3 Req 20).
 * Synthetic values only — no real customer data (Domain Req 1, v1.3 Req 19).
 */

import type { TenantContext, SourceMetadata } from '../entities/common';

export const SEED_TENANT: TenantContext = {
  tenantId: 'tenant-001-acme-corp',
  tenantName: 'Acme Corporation (Demo)',
};

export const SEED_SOURCE: SourceMetadata = {
  connectorId: 'connector-mock-001',
  importRunId: 'run-seed-001',
  sourceSystem: 'commander-seed-generator',
  sourceTimestamp: '2026-01-15T09:00:00.000Z',
};

/** Generate deterministic ID for fixtures */
export function seedId(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(4, '0')}`;
}
