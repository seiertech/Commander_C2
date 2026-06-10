/**
 * Seed Drift Detection — Commander SDR Test Fixtures
 *
 * Synthetic drift detection records for engine intelligence surfaces.
 * 4 records covering configuration, version, policy and access drift types.
 * Source: Spec #58 Security OODA Loop §Drift Detection
 */

import type { DriftDetection } from '../entities/drift-detection-engine';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-engine-layer' };

export const seedDriftDetections: DriftDetection[] = [
  {
    id: seedId('drift', 1),
    entityType: 'drift-detection',
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engineId: 'engine-drift-001',
    name: 'Firewall rule permissiveness increase',
    driftType: 'configuration',
    sourceConnectorRef: 'connector-mock-fw-001',
    baselineRef: 'baseline-fw-rules-2026-01',
    currentState: 'Rule FW-042 changed from deny-all to allow TCP/443,8080 from 0.0.0.0/0',
    driftSeverity: 8,
    detectedAt: '2026-01-15T10:00:00.000Z',
    resolvedAt: null,
    status: 'open',
    affectedEntityType: 'asset',
    affectedEntityRef: 'asset-0001',
    remediationSuggestion: 'Revert FW-042 to deny-all and apply least-privilege ingress rules',
  },
  {
    id: seedId('drift', 2),
    entityType: 'drift-detection',
    tenant: SEED_TENANT,
    createdAt: '2026-01-14T14:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engineId: 'engine-drift-001',
    name: 'EDR agent version lag detected',
    driftType: 'version',
    sourceConnectorRef: 'connector-mock-edr-001',
    baselineRef: 'baseline-edr-version-2026-01',
    currentState: 'Agent v4.2.1 deployed; baseline requires v4.5.0 minimum',
    driftSeverity: 5,
    detectedAt: '2026-01-14T14:00:00.000Z',
    resolvedAt: '2026-01-17T09:00:00.000Z',
    status: 'resolved',
    affectedEntityType: 'asset',
    affectedEntityRef: 'asset-0004',
    remediationSuggestion: null,
  },
  {
    id: seedId('drift', 3),
    entityType: 'drift-detection',
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T08:30:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engineId: 'engine-drift-001',
    name: 'Password policy weakened below baseline',
    driftType: 'policy',
    sourceConnectorRef: 'connector-mock-idp-001',
    baselineRef: 'baseline-password-policy-2026-01',
    currentState: 'Minimum length reduced from 14 to 8 characters; complexity requirement disabled',
    driftSeverity: 9,
    detectedAt: '2026-01-16T08:30:00.000Z',
    resolvedAt: null,
    status: 'acknowledged',
    affectedEntityType: 'identity',
    affectedEntityRef: 'identity-0001',
    remediationSuggestion: 'Restore minimum 14-char length and enable complexity requirement',
  },
  {
    id: seedId('drift', 4),
    entityType: 'drift-detection',
    tenant: SEED_TENANT,
    createdAt: '2026-01-17T11:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engineId: 'engine-drift-001',
    name: 'Service account privilege escalation',
    driftType: 'access',
    sourceConnectorRef: 'connector-mock-iam-001',
    baselineRef: 'baseline-rbac-2026-01',
    currentState: 'svc-deploy-pipeline granted Global Admin role without change ticket',
    driftSeverity: 10,
    detectedAt: '2026-01-17T11:00:00.000Z',
    resolvedAt: null,
    status: 'open',
    affectedEntityType: 'identity',
    affectedEntityRef: 'identity-0003',
    remediationSuggestion: 'Remove Global Admin, apply least-privilege deployment role',
  },
];
