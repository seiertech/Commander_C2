/**
 * Seed Deployments — Commander C2 Control Plane Fixtures
 * 3 deployment records. Source: Master Technical Specification §Commercial Control Plane
 */

import type { Deployment } from '../entities/deployment';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const CP_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-control-plane' };

export const seedDeployments: Deployment[] = [
  {
    id: seedId('deploy', 1), entityType: 'deployment', tenant: SEED_TENANT,
    createdAt: '2026-01-15T00:00:00.000Z', updatedAt: '2026-01-15T10:00:00.000Z', source: CP_SOURCE,
    tenantId: seedId('tc', 1), environment: 'production',
    version: 'v1.3.1', previousVersion: 'v1.3.0',
    status: 'deployed', deployedAt: '2026-01-15T10:00:00.000Z',
    deployedBy: 'operator-deploy-pipeline (Mock)',
    releaseNotes: 'Patch release: case lifecycle stability fixes, performance improvements.',
    healthCheck: 'passing',
  },
  {
    id: seedId('deploy', 2), entityType: 'deployment', tenant: SEED_TENANT,
    createdAt: '2026-01-18T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    tenantId: seedId('tc', 1), environment: 'staging',
    version: 'v1.4.0-rc.1', previousVersion: 'v1.3.1',
    status: 'rolling_out', deployedAt: '2026-01-18T06:00:00.000Z',
    deployedBy: 'operator-deploy-pipeline (Mock)',
    releaseNotes: 'Release candidate: Security C2 OODA loop, Direction Boards, enhanced reporting.',
    healthCheck: 'pending',
  },
  {
    id: seedId('deploy', 3), entityType: 'deployment', tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z', updatedAt: '2026-01-10T14:00:00.000Z', source: CP_SOURCE,
    tenantId: seedId('tc', 3), environment: 'production',
    version: 'v1.3.1', previousVersion: 'v1.3.0',
    status: 'scheduled', deployedAt: '2026-01-20T06:00:00.000Z',
    deployedBy: 'operator-deploy-pipeline (Mock)',
    releaseNotes: 'Initial deployment for NovaCare Health trial tenant.',
    healthCheck: 'pending',
  },
];
