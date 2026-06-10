/**
 * Seed Tenant & Source — Commander C2 Fixtures
 *
 * Provides deterministic tenant context and source metadata for all seed fixtures.
 * Every fixture record uses SEED_TENANT and SEED_SOURCE for consistency.
 */

import type { TenantContext, SourceMetadata } from '../entities/common';

// ─── Seed Tenant ─────────────────────────────────────────────────────────────

export const SEED_TENANT: TenantContext = {
  tenantId: 'tenant-seed-001',
  tenantName: 'Commander Seed Tenant',
};

// ─── Seed Source ─────────────────────────────────────────────────────────────

export const SEED_SOURCE: SourceMetadata = {
  connectorId: 'connector-seed-bootstrap',
  importRunId: 'import-seed-initial-001',
  sourceSystem: 'commander-bootstrap',
  sourceTimestamp: '2026-06-10T00:00:00.000Z',
};

// ─── Deterministic ID Helper ─────────────────────────────────────────────────

/**
 * Generate a deterministic seed ID for fixtures.
 * Format: seed-{entityType}-{sequence}
 *
 * @param entityType - The entity type discriminator
 * @param sequence - Numeric sequence (zero-padded to 3 digits)
 */
export function seedId(entityType: string, sequence: number): string {
  const padded = String(sequence).padStart(3, '0');
  return `seed-${entityType}-${padded}`;
}
