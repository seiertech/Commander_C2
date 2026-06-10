/**
 * Seed Exposure Engine — Commander C2 Test Fixtures
 *
 * Synthetic exposure computation records for blast zone analysis surfaces.
 * 4 records covering external/internal surfaces with varying trends and scores.
 * Source: Spec #60 Internal and External Attack Surface Framework
 */

import type { ExposureComputation } from '../entities/exposure-engine';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, source_system: 'commander-engine-layer' };

export const seedExposureComputations: ExposureComputation[] = [
  {
    id: seedId('exp-comp', 1),
    entity_type: 'exposure-computation',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-exposure-001',
    surface_type: 'external',
    exposure_vector: 'Internet-facing web tier with unpatched CVEs and missing WAF coverage',
    assetRefs: ['asset-0001', 'asset-0005'],
    identityRefs: [],
    blastZoneId: 'blast-zone-dmz-web',
    exposureScore: 82,
    attackPathCount: 4,
    coverageGapCount: 2,
    computed_at: '2026-01-18T06:00:00.000Z',
    trend: 'increasing',
    mitigationRefs: [],
  },
  {
    id: seedId('exp-comp', 2),
    entity_type: 'exposure-computation',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-exposure-001',
    surface_type: 'external',
    exposure_vector: 'Cloud storage with overly permissive IAM and cross-account access',
    assetRefs: ['asset-0003'],
    identityRefs: ['identity-0003'],
    blastZoneId: 'blast-zone-cloud-storage',
    exposureScore: 65,
    attackPathCount: 2,
    coverageGapCount: 1,
    computed_at: '2026-01-18T06:00:00.000Z',
    trend: 'stable',
    mitigationRefs: ['control-iam-review-001'],
  },
  {
    id: seedId('exp-comp', 3),
    entity_type: 'exposure-computation',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-exposure-001',
    surface_type: 'internal',
    exposure_vector: 'Privileged identity lateral movement path via unmonitored endpoints',
    assetRefs: ['asset-0002', 'asset-0004'],
    identityRefs: ['identity-0001', 'identity-0003'],
    blastZoneId: 'blast-zone-privileged-identity',
    exposureScore: 91,
    attackPathCount: 7,
    coverageGapCount: 3,
    computed_at: '2026-01-18T06:00:00.000Z',
    trend: 'increasing',
    mitigationRefs: [],
  },
  {
    id: seedId('exp-comp', 4),
    entity_type: 'exposure-computation',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-exposure-001',
    surface_type: 'internal',
    exposure_vector: 'Developer workstation segment with EDR gaps — contained by network isolation',
    assetRefs: ['asset-0004'],
    identityRefs: [],
    blastZoneId: null,
    exposureScore: 35,
    attackPathCount: 1,
    coverageGapCount: 1,
    computed_at: '2026-01-18T06:00:00.000Z',
    trend: 'decreasing',
    mitigationRefs: ['control-network-isolation-007', 'control-edr-deploy-002'],
  },
];
