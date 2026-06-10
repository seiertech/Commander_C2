/**
 * Seed Exposure Engine — Commander C2 Test Fixtures
 *
 * Synthetic exposure computation records for blast zone analysis surfaces.
 * 4 records covering external/internal surfaces with varying trends and scores.
 * Source: Spec #60 Internal and External Attack Surface Framework
 */

import type { ExposureComputation } from '../entities/exposure-engine';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-engine-layer' };

export const seedExposureComputations: ExposureComputation[] = [
  {
    id: seedId('exp-comp', 1),
    entityType: 'exposure-computation',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T06:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: ENGINE_SOURCE,
    engineId: 'engine-exposure-001',
    surfaceType: 'external',
    exposureVector: 'Internet-facing web tier with unpatched CVEs and missing WAF coverage',
    assetRefs: ['asset-0001', 'asset-0005'],
    identityRefs: [],
    blastZoneId: 'blast-zone-dmz-web',
    exposureScore: 82,
    attackPathCount: 4,
    coverageGapCount: 2,
    computedAt: '2026-01-18T06:00:00.000Z',
    trend: 'increasing',
    mitigationRefs: [],
  },
  {
    id: seedId('exp-comp', 2),
    entityType: 'exposure-computation',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T06:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: ENGINE_SOURCE,
    engineId: 'engine-exposure-001',
    surfaceType: 'external',
    exposureVector: 'Cloud storage with overly permissive IAM and cross-account access',
    assetRefs: ['asset-0003'],
    identityRefs: ['identity-0003'],
    blastZoneId: 'blast-zone-cloud-storage',
    exposureScore: 65,
    attackPathCount: 2,
    coverageGapCount: 1,
    computedAt: '2026-01-18T06:00:00.000Z',
    trend: 'stable',
    mitigationRefs: ['control-iam-review-001'],
  },
  {
    id: seedId('exp-comp', 3),
    entityType: 'exposure-computation',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T06:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: ENGINE_SOURCE,
    engineId: 'engine-exposure-001',
    surfaceType: 'internal',
    exposureVector: 'Privileged identity lateral movement path via unmonitored endpoints',
    assetRefs: ['asset-0002', 'asset-0004'],
    identityRefs: ['identity-0001', 'identity-0003'],
    blastZoneId: 'blast-zone-privileged-identity',
    exposureScore: 91,
    attackPathCount: 7,
    coverageGapCount: 3,
    computedAt: '2026-01-18T06:00:00.000Z',
    trend: 'increasing',
    mitigationRefs: [],
  },
  {
    id: seedId('exp-comp', 4),
    entityType: 'exposure-computation',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T06:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: ENGINE_SOURCE,
    engineId: 'engine-exposure-001',
    surfaceType: 'internal',
    exposureVector: 'Developer workstation segment with EDR gaps — contained by network isolation',
    assetRefs: ['asset-0004'],
    identityRefs: [],
    blastZoneId: null,
    exposureScore: 35,
    attackPathCount: 1,
    coverageGapCount: 1,
    computedAt: '2026-01-18T06:00:00.000Z',
    trend: 'decreasing',
    mitigationRefs: ['control-network-isolation-007', 'control-edr-deploy-002'],
  },
];
