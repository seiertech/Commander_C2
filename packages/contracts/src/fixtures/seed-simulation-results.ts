/**
 * Seed Simulation Results — Commander SDR Test Fixtures
 *
 * 3 records: clean (no conflicts), with conflicts, failed.
 * Source: Spec #36 Rule/Model/Decision Governance Surface
 */

import type { SimulationResult } from '../entities/simulation-result';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const SIM_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-simulation' };

export const seedSimulationResults: SimulationResult[] = [
  {
    id: seedId('simulation-result', 1),
    entityType: 'simulation-result',
    tenant: SEED_TENANT,
    createdAt: '2026-02-06T10:00:00.000Z',
    updatedAt: '2026-02-06T10:00:00.000Z',
    source: SIM_SOURCE,
    simulationId: 'sim-0001',
    ruleRef: 'rule-drift-mfa-001',
    simulatedAt: '2026-02-06T10:00:00.000Z',
    simulatedBy: 'operator-som-01',
    scope: 'tenant',
    impactedEntities: 12,
    wouldTrigger: 3,
    wouldSuppress: 1,
    blastRadius: 42,
    conflicts: [],
    status: 'completed',
    approvedForLive: true,
  },
  {
    id: seedId('simulation-result', 2),
    entityType: 'simulation-result',
    tenant: SEED_TENANT,
    createdAt: '2026-02-06T10:30:00.000Z',
    updatedAt: '2026-02-06T10:30:00.000Z',
    source: SIM_SOURCE,
    simulationId: 'sim-0002',
    ruleRef: 'rule-drift-public-bucket-002',
    policyRef: 'policy-storage-baseline',
    simulatedAt: '2026-02-06T10:30:00.000Z',
    simulatedBy: 'operator-som-01',
    scope: 'asset_group',
    impactedEntities: 45,
    wouldTrigger: 18,
    wouldSuppress: 4,
    blastRadius: 78,
    conflicts: [
      { entityRef: 'asset-s3-public-archive', conflictType: 'intended_public', description: 'Asset is intentionally public (documentation bucket). Rule would generate false positive.' },
      { entityRef: 'asset-cdn-origin', conflictType: 'coverage_overlap', description: 'Asset already covered by CDN-specific rule set. Dual-coverage would generate duplicates.' },
    ],
    status: 'completed',
    approvedForLive: false,
  },
  {
    id: seedId('simulation-result', 3),
    entityType: 'simulation-result',
    tenant: SEED_TENANT,
    createdAt: '2026-02-06T11:00:00.000Z',
    updatedAt: '2026-02-06T11:00:00.000Z',
    source: SIM_SOURCE,
    simulationId: 'sim-0003',
    ruleRef: 'rule-correlation-lateral-move-005',
    simulatedAt: '2026-02-06T11:00:00.000Z',
    simulatedBy: 'operator-som-02',
    scope: 'role',
    impactedEntities: 0,
    wouldTrigger: 0,
    wouldSuppress: 0,
    blastRadius: 0,
    conflicts: [],
    status: 'failed',
    approvedForLive: false,
  },
];
