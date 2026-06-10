/**
 * Seed Coverage — Commander C2 Test Fixtures
 *
 * Synthetic coverage assessment data for security tool deployment tracking.
 * 6 coverage records: one per type, mix of coverage levels and trends.
 * Source: Master Technical Specification §Coverage Management
 */

import type { Coverage } from '../entities/coverage';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const COVERAGE_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-coverage-assessor' };

export const seedCoverage: Coverage[] = [
  {
    id: seedId('coverage', 1),
    entityType: 'coverage',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: COVERAGE_SOURCE,
    coverageType: 'edr',
    domain: 'endpoint',
    totalAssets: 120,
    coveredAssets: 108,
    coveragePercent: 90,
    gaps: [
      { assetRef: 'asset-dev-001', reason: 'not_deployed' },
      { assetRef: 'asset-dev-002', reason: 'not_deployed' },
      { assetRef: 'asset-legacy-001', reason: 'unsupported' },
      { assetRef: 'asset-0004', reason: 'agent_stale', staleDays: 7 },
    ],
    lastAssessedAt: '2026-01-18T06:00:00.000Z',
    trend: 'improving',
  },
  {
    id: seedId('coverage', 2),
    entityType: 'coverage',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: COVERAGE_SOURCE,
    coverageType: 'vulnerability_scanner',
    domain: 'endpoint',
    totalAssets: 120,
    coveredAssets: 115,
    coveragePercent: 96,
    gaps: [
      { assetRef: 'asset-legacy-001', reason: 'unsupported' },
      { assetRef: 'asset-iot-001', reason: 'excluded' },
    ],
    lastAssessedAt: '2026-01-18T06:00:00.000Z',
    trend: 'stable',
  },
  {
    id: seedId('coverage', 3),
    entityType: 'coverage',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: COVERAGE_SOURCE,
    coverageType: 'siem',
    domain: 'network',
    totalAssets: 45,
    coveredAssets: 38,
    coveragePercent: 84,
    gaps: [
      { assetRef: 'asset-switch-003', reason: 'not_deployed' },
      { assetRef: 'asset-switch-004', reason: 'not_deployed' },
      { assetRef: 'asset-router-002', reason: 'agent_stale', staleDays: 14 },
    ],
    lastAssessedAt: '2026-01-17T12:00:00.000Z',
    trend: 'degrading',
  },
  {
    id: seedId('coverage', 4),
    entityType: 'coverage',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: COVERAGE_SOURCE,
    coverageType: 'identity_provider',
    domain: 'identity',
    totalAssets: 250,
    coveredAssets: 245,
    coveragePercent: 98,
    gaps: [
      { assetRef: 'identity-svc-legacy-001', reason: 'excluded' },
    ],
    lastAssessedAt: '2026-01-18T06:00:00.000Z',
    trend: 'stable',
  },
  {
    id: seedId('coverage', 5),
    entityType: 'coverage',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: COVERAGE_SOURCE,
    coverageType: 'cloud_posture',
    domain: 'cloud',
    totalAssets: 35,
    coveredAssets: 28,
    coveragePercent: 80,
    gaps: [
      { assetRef: 'cloud-sandbox-001', reason: 'excluded' },
      { assetRef: 'cloud-dev-002', reason: 'not_deployed' },
      { assetRef: 'cloud-dr-001', reason: 'not_deployed' },
    ],
    lastAssessedAt: '2026-01-17T00:00:00.000Z',
    trend: 'improving',
  },
  {
    id: seedId('coverage', 6),
    entityType: 'coverage',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: COVERAGE_SOURCE,
    coverageType: 'network_monitor',
    domain: 'network',
    totalAssets: 45,
    coveredAssets: 42,
    coveragePercent: 93,
    gaps: [
      { assetRef: 'asset-switch-005', reason: 'agent_stale', staleDays: 21 },
    ],
    lastAssessedAt: '2026-01-18T06:00:00.000Z',
    trend: 'stable',
  },
];
