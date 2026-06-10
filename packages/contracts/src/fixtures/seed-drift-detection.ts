/**
 * Seed Drift Detection — Commander C2 Test Fixtures
 *
 * Synthetic drift detection records for engine intelligence surfaces.
 * 4 records covering configuration, version, policy and access drift types.
 * Source: Spec #58 Security OODA Loop §Drift Detection
 */

import type { DriftDetection } from '../entities/drift-detection-engine';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, source_system: 'commander-engine-layer' };

export const seedDriftDetections: DriftDetection[] = [
  {
    id: seedId('drift', 1),
    entity_type: 'drift-detection',
    tenant: SEED_TENANT,
    created_at: '2026-01-15T10:00:00.000Z',
    updated_at: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-drift-001',
    name: 'Firewall rule permissiveness increase',
    driftType: 'configuration',
    sourceConnectorRef: 'connector-mock-fw-001',
    baseline_ref: 'baseline-fw-rules-2026-01',
    current_state: 'Rule FW-042 changed from deny-all to allow TCP/443,8080 from 0.0.0.0/0',
    driftSeverity: 8,
    detected_at: '2026-01-15T10:00:00.000Z',
    resolved_at: null,
    status: 'open',
    affected_entity_type: 'asset',
    affected_entity_ref: 'asset-0001',
    remediationSuggestion: 'Revert FW-042 to deny-all and apply least-privilege ingress rules',
  },
  {
    id: seedId('drift', 2),
    entity_type: 'drift-detection',
    tenant: SEED_TENANT,
    created_at: '2026-01-14T14:00:00.000Z',
    updated_at: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-drift-001',
    name: 'EDR agent version lag detected',
    driftType: 'version',
    sourceConnectorRef: 'connector-mock-edr-001',
    baseline_ref: 'baseline-edr-version-2026-01',
    current_state: 'Agent v4.2.1 deployed; baseline requires v4.5.0 minimum',
    driftSeverity: 5,
    detected_at: '2026-01-14T14:00:00.000Z',
    resolved_at: '2026-01-17T09:00:00.000Z',
    status: 'resolved',
    affected_entity_type: 'asset',
    affected_entity_ref: 'asset-0004',
    remediationSuggestion: null,
  },
  {
    id: seedId('drift', 3),
    entity_type: 'drift-detection',
    tenant: SEED_TENANT,
    created_at: '2026-01-16T08:30:00.000Z',
    updated_at: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-drift-001',
    name: 'Password policy weakened below baseline',
    driftType: 'policy',
    sourceConnectorRef: 'connector-mock-idp-001',
    baseline_ref: 'baseline-password-policy-2026-01',
    current_state: 'Minimum length reduced from 14 to 8 characters; complexity requirement disabled',
    driftSeverity: 9,
    detected_at: '2026-01-16T08:30:00.000Z',
    resolved_at: null,
    status: 'acknowledged',
    affected_entity_type: 'identity',
    affected_entity_ref: 'identity-0001',
    remediationSuggestion: 'Restore minimum 14-char length and enable complexity requirement',
  },
  {
    id: seedId('drift', 4),
    entity_type: 'drift-detection',
    tenant: SEED_TENANT,
    created_at: '2026-01-17T11:00:00.000Z',
    updated_at: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-drift-001',
    name: 'Service account privilege escalation',
    driftType: 'access',
    sourceConnectorRef: 'connector-mock-iam-001',
    baseline_ref: 'baseline-rbac-2026-01',
    current_state: 'svc-deploy-pipeline granted Global Admin role without change ticket',
    driftSeverity: 10,
    detected_at: '2026-01-17T11:00:00.000Z',
    resolved_at: null,
    status: 'open',
    affected_entity_type: 'identity',
    affected_entity_ref: 'identity-0003',
    remediationSuggestion: 'Remove Global Admin, apply least-privilege deployment role',
  },
];
