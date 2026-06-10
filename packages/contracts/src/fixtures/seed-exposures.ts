/**
 * Seed Exposures — Commander C2 Test Fixtures
 *
 * Synthetic exposure records for attack surface management.
 * 5 exposures: 2 external network, 1 external cloud, 1 internal identity, 1 internal endpoint.
 * Source: Spec #60 Internal and External Attack Surface Framework
 */

import type { Exposure } from '../entities/exposure';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const EXPOSURE_SOURCE = { ...SEED_SOURCE, source_system: 'commander-exposure-engine' };

export const seedExposures: Exposure[] = [
  {
    id: seedId('exposure', 1),
    entity_type: 'exposure',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: EXPOSURE_SOURCE,
    surface_type: 'external_attack_surface',
    category: 'network',
    asset_ref: 'asset-0001',
    exposure_vector: 'Internet-facing web server with outdated TLS configuration (TLS 1.0 enabled)',
    severity: 2,
    discovered_at: '2026-01-10T00:00:00.000Z',
    lastValidatedAt: '2026-01-18T06:00:00.000Z',
    status: 'open',
    blast_zone: 'dmz-web-tier',
    coverage_gaps: [
      { gap_type: 'no_monitoring', affected_entity_ref: 'asset-0001' },
    ],
  },
  {
    id: seedId('exposure', 2),
    entity_type: 'exposure',
    tenant: SEED_TENANT,
    created_at: '2026-01-11T00:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: EXPOSURE_SOURCE,
    surface_type: 'external_attack_surface',
    category: 'network',
    asset_ref: 'asset-0005',
    exposure_vector: 'Publicly accessible API endpoint without rate limiting or WAF protection',
    severity: 1,
    discovered_at: '2026-01-11T00:00:00.000Z',
    lastValidatedAt: '2026-01-17T12:00:00.000Z',
    status: 'monitoring',
    blast_zone: 'dmz-api-tier',
    coverage_gaps: [],
  },
  {
    id: seedId('exposure', 3),
    entity_type: 'exposure',
    tenant: SEED_TENANT,
    created_at: '2026-01-12T00:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: EXPOSURE_SOURCE,
    surface_type: 'external_attack_surface',
    category: 'cloud',
    asset_ref: 'asset-0003',
    exposure_vector: 'S3 bucket with overly permissive IAM policy allowing cross-account access',
    severity: 2,
    discovered_at: '2026-01-12T00:00:00.000Z',
    lastValidatedAt: '2026-01-18T06:00:00.000Z',
    status: 'open',
    blast_zone: 'cloud-storage-tier',
    coverage_gaps: [
      { gap_type: 'no_scanner', affected_entity_ref: 'asset-0003' },
      { gap_type: 'stale_data', affected_entity_ref: 'asset-0003', staleDays: 14 },
    ],
  },
  {
    id: seedId('exposure', 4),
    entity_type: 'exposure',
    tenant: SEED_TENANT,
    created_at: '2026-01-14T00:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: EXPOSURE_SOURCE,
    surface_type: 'internal_attack_surface',
    category: 'identity',
    asset_ref: 'asset-0002',
    identityRef: 'identity-0003',
    exposure_vector: 'Service account with persistent admin privileges and no credential rotation (Mock)',
    severity: 1,
    discovered_at: '2026-01-14T00:00:00.000Z',
    lastValidatedAt: '2026-01-18T06:00:00.000Z',
    status: 'open',
    blast_zone: 'privileged-identity-zone',
    coverage_gaps: [
      { gap_type: 'no_monitoring', affected_entity_ref: 'identity-0003' },
    ],
  },
  {
    id: seedId('exposure', 5),
    entity_type: 'exposure',
    tenant: SEED_TENANT,
    created_at: '2026-01-15T00:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: EXPOSURE_SOURCE,
    surface_type: 'internal_attack_surface',
    category: 'endpoint',
    asset_ref: 'asset-0004',
    exposure_vector: 'Developer workstation without EDR agent — lateral movement risk',
    severity: 3,
    discovered_at: '2026-01-15T00:00:00.000Z',
    lastValidatedAt: '2026-01-17T00:00:00.000Z',
    status: 'mitigated',
    blast_zone: 'internal-endpoint-zone',
    coverage_gaps: [
      { gap_type: 'no_edr', affected_entity_ref: 'asset-0004' },
    ],
  },
];
