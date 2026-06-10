/**
 * Seed Exposures — Commander SDR Test Fixtures
 *
 * Synthetic exposure records for attack surface management.
 * 5 exposures: 2 external network, 1 external cloud, 1 internal identity, 1 internal endpoint.
 * Source: Spec #60 Internal and External Attack Surface Framework
 */

import type { Exposure } from '../entities/exposure';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const EXPOSURE_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-exposure-engine' };

export const seedExposures: Exposure[] = [
  {
    id: seedId('exposure', 1),
    entityType: 'exposure',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: EXPOSURE_SOURCE,
    surfaceType: 'external_attack_surface',
    category: 'network',
    assetRef: 'asset-0001',
    exposureVector: 'Internet-facing web server with outdated TLS configuration (TLS 1.0 enabled)',
    severity: 2,
    discoveredAt: '2026-01-10T00:00:00.000Z',
    lastValidatedAt: '2026-01-18T06:00:00.000Z',
    status: 'open',
    blastZone: 'dmz-web-tier',
    coverageGaps: [
      { gapType: 'no_monitoring', affectedEntityRef: 'asset-0001' },
    ],
  },
  {
    id: seedId('exposure', 2),
    entityType: 'exposure',
    tenant: SEED_TENANT,
    createdAt: '2026-01-11T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: EXPOSURE_SOURCE,
    surfaceType: 'external_attack_surface',
    category: 'network',
    assetRef: 'asset-0005',
    exposureVector: 'Publicly accessible API endpoint without rate limiting or WAF protection',
    severity: 1,
    discoveredAt: '2026-01-11T00:00:00.000Z',
    lastValidatedAt: '2026-01-17T12:00:00.000Z',
    status: 'monitoring',
    blastZone: 'dmz-api-tier',
    coverageGaps: [],
  },
  {
    id: seedId('exposure', 3),
    entityType: 'exposure',
    tenant: SEED_TENANT,
    createdAt: '2026-01-12T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: EXPOSURE_SOURCE,
    surfaceType: 'external_attack_surface',
    category: 'cloud',
    assetRef: 'asset-0003',
    exposureVector: 'S3 bucket with overly permissive IAM policy allowing cross-account access',
    severity: 2,
    discoveredAt: '2026-01-12T00:00:00.000Z',
    lastValidatedAt: '2026-01-18T06:00:00.000Z',
    status: 'open',
    blastZone: 'cloud-storage-tier',
    coverageGaps: [
      { gapType: 'no_scanner', affectedEntityRef: 'asset-0003' },
      { gapType: 'stale_data', affectedEntityRef: 'asset-0003', staleDays: 14 },
    ],
  },
  {
    id: seedId('exposure', 4),
    entityType: 'exposure',
    tenant: SEED_TENANT,
    createdAt: '2026-01-14T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: EXPOSURE_SOURCE,
    surfaceType: 'internal_attack_surface',
    category: 'identity',
    assetRef: 'asset-0002',
    identityRef: 'identity-0003',
    exposureVector: 'Service account with persistent admin privileges and no credential rotation (Mock)',
    severity: 1,
    discoveredAt: '2026-01-14T00:00:00.000Z',
    lastValidatedAt: '2026-01-18T06:00:00.000Z',
    status: 'open',
    blastZone: 'privileged-identity-zone',
    coverageGaps: [
      { gapType: 'no_monitoring', affectedEntityRef: 'identity-0003' },
    ],
  },
  {
    id: seedId('exposure', 5),
    entityType: 'exposure',
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: EXPOSURE_SOURCE,
    surfaceType: 'internal_attack_surface',
    category: 'endpoint',
    assetRef: 'asset-0004',
    exposureVector: 'Developer workstation without EDR agent — lateral movement risk',
    severity: 3,
    discoveredAt: '2026-01-15T00:00:00.000Z',
    lastValidatedAt: '2026-01-17T00:00:00.000Z',
    status: 'mitigated',
    blastZone: 'internal-endpoint-zone',
    coverageGaps: [
      { gapType: 'no_edr', affectedEntityRef: 'asset-0004' },
    ],
  },
];
