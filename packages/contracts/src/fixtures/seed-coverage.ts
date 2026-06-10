/**
 * Seed Coverage — Commander C2 Test Fixtures
 *
 * Synthetic coverage assessment data for security tool deployment tracking.
 * 6 coverage records: one per type, mix of coverage levels and trends.
 * Source: Master Technical Specification §Coverage Management
 */

import type { Coverage } from '../entities/coverage';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const COVERAGE_SOURCE = { ...SEED_SOURCE, source_system: 'commander-coverage-assessor' };

export const seedCoverage: Coverage[] = [
  {
    id: seedId('coverage', 1),
    entity_type: 'coverage',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: COVERAGE_SOURCE,
    coverageType: 'edr',
    domain: 'endpoint',
    totalAssets: 120,
    coveredAssets: 108,
    coverage_percent: 90,
    gaps: [
      { asset_ref: 'asset-dev-001', reason: 'not_deployed' },
      { asset_ref: 'asset-dev-002', reason: 'not_deployed' },
      { asset_ref: 'asset-legacy-001', reason: 'unsupported' },
      { asset_ref: 'asset-0004', reason: 'agent_stale', staleDays: 7 },
    ],
    last_assessed_at: '2026-01-18T06:00:00.000Z',
    trend: 'improving',
  },
  {
    id: seedId('coverage', 2),
    entity_type: 'coverage',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: COVERAGE_SOURCE,
    coverageType: 'vulnerability_scanner',
    domain: 'endpoint',
    totalAssets: 120,
    coveredAssets: 115,
    coverage_percent: 96,
    gaps: [
      { asset_ref: 'asset-legacy-001', reason: 'unsupported' },
      { asset_ref: 'asset-iot-001', reason: 'excluded' },
    ],
    last_assessed_at: '2026-01-18T06:00:00.000Z',
    trend: 'stable',
  },
  {
    id: seedId('coverage', 3),
    entity_type: 'coverage',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: COVERAGE_SOURCE,
    coverageType: 'siem',
    domain: 'network',
    totalAssets: 45,
    coveredAssets: 38,
    coverage_percent: 84,
    gaps: [
      { asset_ref: 'asset-switch-003', reason: 'not_deployed' },
      { asset_ref: 'asset-switch-004', reason: 'not_deployed' },
      { asset_ref: 'asset-router-002', reason: 'agent_stale', staleDays: 14 },
    ],
    last_assessed_at: '2026-01-17T12:00:00.000Z',
    trend: 'degrading',
  },
  {
    id: seedId('coverage', 4),
    entity_type: 'coverage',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: COVERAGE_SOURCE,
    coverageType: 'identity_provider',
    domain: 'identity',
    totalAssets: 250,
    coveredAssets: 245,
    coverage_percent: 98,
    gaps: [
      { asset_ref: 'identity-svc-legacy-001', reason: 'excluded' },
    ],
    last_assessed_at: '2026-01-18T06:00:00.000Z',
    trend: 'stable',
  },
  {
    id: seedId('coverage', 5),
    entity_type: 'coverage',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: COVERAGE_SOURCE,
    coverageType: 'cloud_posture',
    domain: 'cloud',
    totalAssets: 35,
    coveredAssets: 28,
    coverage_percent: 80,
    gaps: [
      { asset_ref: 'cloud-sandbox-001', reason: 'excluded' },
      { asset_ref: 'cloud-dev-002', reason: 'not_deployed' },
      { asset_ref: 'cloud-dr-001', reason: 'not_deployed' },
    ],
    last_assessed_at: '2026-01-17T00:00:00.000Z',
    trend: 'improving',
  },
  {
    id: seedId('coverage', 6),
    entity_type: 'coverage',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: COVERAGE_SOURCE,
    coverageType: 'network_monitor',
    domain: 'network',
    totalAssets: 45,
    coveredAssets: 42,
    coverage_percent: 93,
    gaps: [
      { asset_ref: 'asset-switch-005', reason: 'agent_stale', staleDays: 21 },
    ],
    last_assessed_at: '2026-01-18T06:00:00.000Z',
    trend: 'stable',
  },
];
