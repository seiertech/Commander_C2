/**
 * Seed Push Governance — Commander SDR Test Fixtures
 *
 * Synthetic push governance run records for governance simulation surfaces.
 * 3 records covering pending, completed and failed simulation states.
 * Source: Master Technical Specification §Push Governance
 *
 * Note: Push governance remains dry-run only until separately approved.
 */

import type { PushGovernanceRun } from '../entities/push-governance';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-engine-layer' };

export const seedPushGovernanceRuns: PushGovernanceRun[] = [
  {
    id: seedId('push-gov', 1),
    entityType: 'push-governance-run',
    tenant: SEED_TENANT,
    createdAt: '2026-01-17T09:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    runId: 'run-push-001',
    ruleRef: 'rule-mfa-enforcement-001',
    targetScope: 'tenant',
    simulatedAt: '2026-01-17T09:00:00.000Z',
    impactedEntities: 142,
    wouldBlock: 12,
    wouldAllow: 118,
    wouldEscalate: 12,
    conflicts: [
      {
        entityRef: 'identity-0003',
        conflictType: 'service_account_exemption',
        description: 'Service account svc-deploy-pipeline has MFA exemption that conflicts with new enforcement rule',
      },
    ],
    status: 'completed',
    approvedForLive: false,
  },
  {
    id: seedId('push-gov', 2),
    entityType: 'push-governance-run',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T06:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    runId: 'run-push-002',
    ruleRef: 'rule-password-complexity-002',
    targetScope: 'role',
    simulatedAt: '2026-01-18T06:00:00.000Z',
    impactedEntities: 87,
    wouldBlock: 3,
    wouldAllow: 84,
    wouldEscalate: 0,
    conflicts: [],
    status: 'pending',
    approvedForLive: false,
  },
  {
    id: seedId('push-gov', 3),
    entityType: 'push-governance-run',
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T14:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    runId: 'run-push-003',
    ruleRef: 'rule-network-isolation-003',
    targetScope: 'asset_group',
    simulatedAt: '2026-01-16T14:00:00.000Z',
    impactedEntities: 0,
    wouldBlock: 0,
    wouldAllow: 0,
    wouldEscalate: 0,
    conflicts: [],
    status: 'failed',
    approvedForLive: false,
  },
];
