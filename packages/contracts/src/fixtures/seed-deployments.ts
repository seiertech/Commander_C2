/**
 * Seed Deployments — Commander C2 Control Plane Fixtures
 * 3 deployment records. Source: Master Technical Specification §Commercial Control Plane
 */

import type { Deployment } from '../entities/deployment';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const CP_SOURCE = { ...SEED_SOURCE, source_system: 'commander-control-plane' };

export const seedDeployments: Deployment[] = [
  {
    id: seedId('deploy', 1), entity_type: 'deployment', tenant: SEED_TENANT,
    created_at: '2026-01-15T00:00:00.000Z', updated_at: '2026-01-15T10:00:00.000Z', source: CP_SOURCE,
    tenant_id: seedId('tc', 1), environment: 'production',
    version: 'v1.3.1', previousVersion: 'v1.3.0',
    status: 'deployed', deployed_at: '2026-01-15T10:00:00.000Z',
    deployed_by: 'operator-deploy-pipeline (Mock)',
    releaseNotes: 'Patch release: case lifecycle stability fixes, performance improvements.',
    healthCheck: 'passing',
  },
  {
    id: seedId('deploy', 2), entity_type: 'deployment', tenant: SEED_TENANT,
    created_at: '2026-01-18T00:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    tenant_id: seedId('tc', 1), environment: 'staging',
    version: 'v1.4.0-rc.1', previousVersion: 'v1.3.1',
    status: 'rolling_out', deployed_at: '2026-01-18T06:00:00.000Z',
    deployed_by: 'operator-deploy-pipeline (Mock)',
    releaseNotes: 'Release candidate: Security C2 OODA loop, Direction Boards, enhanced reporting.',
    healthCheck: 'pending',
  },
  {
    id: seedId('deploy', 3), entity_type: 'deployment', tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z', updated_at: '2026-01-10T14:00:00.000Z', source: CP_SOURCE,
    tenant_id: seedId('tc', 3), environment: 'production',
    version: 'v1.3.1', previousVersion: 'v1.3.0',
    status: 'scheduled', deployed_at: '2026-01-20T06:00:00.000Z',
    deployed_by: 'operator-deploy-pipeline (Mock)',
    releaseNotes: 'Initial deployment for NovaCare Health trial tenant.',
    healthCheck: 'pending',
  },
];
