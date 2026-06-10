/**
 * Seed Cloud Security Posture — Commander SDR Test Fixtures
 *
 * Synthetic multi-cloud security posture with drift detection.
 * Source: Spec #22 Architecture Intelligence
 * No real customer data, secrets, or vendor credentials.
 */

import type { CloudSecurityPosture } from '../entities/cloud-security-posture';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const CSP_SOURCE = { ...SEED_SOURCE, sourceSystem: 'cloud-posture-scanner' };

export const seedCloudSecurityPosture: CloudSecurityPosture[] = [
  {
    id: seedId('csp', 1),
    entityType: 'cloud-security-posture',
    tenant: SEED_TENANT,
    createdAt: '2026-02-01T06:00:00.000Z',
    updatedAt: '2026-02-01T06:00:00.000Z',
    source: CSP_SOURCE,
    cloudProvider: 'aws',
    accountId: '123456789012',
    region: 'eu-west-1',
    adherenceScore: 82,
    driftCount: 7,
    criticalFindings: 2,
    lastScanAt: '2026-02-01T06:00:00.000Z',
    frameworks: ['CIS AWS v2.0', 'SOC 2 Type II', 'ISO 27001'],
    driftDetails: [
      { driftId: 'drift-001', resource: 'sg-0abc123 (web-tier)', rule: 'CIS 5.2.1 — No ingress from 0.0.0.0/0 to port 22', severity: 'critical', detectedAt: '2026-01-30T14:00:00.000Z', description: 'SSH port 22 open to the internet on production web-tier security group' },
      { driftId: 'drift-002', resource: 's3://acme-logs-prod', rule: 'CIS 2.1.1 — S3 bucket public access block', severity: 'high', detectedAt: '2026-01-31T08:00:00.000Z', description: 'Public access block not enabled on production logging bucket' },
      { driftId: 'drift-003', resource: 'iam-user/deploy-bot', rule: 'CIS 1.4 — No root access keys', severity: 'critical', detectedAt: '2026-01-29T10:00:00.000Z', description: 'Service account has root-level access keys that have not been rotated in 180 days' },
    ],
  },
  {
    id: seedId('csp', 2),
    entityType: 'cloud-security-posture',
    tenant: SEED_TENANT,
    createdAt: '2026-02-01T06:30:00.000Z',
    updatedAt: '2026-02-01T06:30:00.000Z',
    source: CSP_SOURCE,
    cloudProvider: 'azure',
    accountId: 'sub-acme-prod-001',
    region: 'uksouth',
    adherenceScore: 91,
    driftCount: 3,
    criticalFindings: 0,
    lastScanAt: '2026-02-01T06:30:00.000Z',
    frameworks: ['CIS Azure v2.0', 'NIST 800-53'],
    driftDetails: [
      { driftId: 'drift-004', resource: 'nsg-corp-vnet', rule: 'CIS 6.2 — NSG flow logs enabled', severity: 'medium', detectedAt: '2026-01-28T09:00:00.000Z', description: 'Network Security Group flow logs not enabled on corporate VNet' },
      { driftId: 'drift-005', resource: 'kv-acme-secrets', rule: 'CIS 8.4 — Key Vault soft-delete', severity: 'medium', detectedAt: '2026-01-29T11:00:00.000Z', description: 'Key Vault soft-delete not enabled for production secrets vault' },
    ],
  },
  {
    id: seedId('csp', 3),
    entityType: 'cloud-security-posture',
    tenant: SEED_TENANT,
    createdAt: '2026-02-01T07:00:00.000Z',
    updatedAt: '2026-02-01T07:00:00.000Z',
    source: CSP_SOURCE,
    cloudProvider: 'gcp',
    accountId: 'acme-prod-gcp-001',
    region: 'europe-west2',
    adherenceScore: 76,
    driftCount: 5,
    criticalFindings: 1,
    lastScanAt: '2026-02-01T07:00:00.000Z',
    frameworks: ['CIS GCP v2.0', 'SOC 2 Type II'],
    driftDetails: [
      { driftId: 'drift-006', resource: 'gke-cluster-prod', rule: 'CIS 6.7 — Network policy enabled', severity: 'high', detectedAt: '2026-01-27T16:00:00.000Z', description: 'GKE production cluster does not have network policy enforcement enabled' },
      { driftId: 'drift-007', resource: 'iam/svc-cicd', rule: 'CIS 1.6 — Service account key rotation', severity: 'critical', detectedAt: '2026-01-26T10:00:00.000Z', description: 'CI/CD service account key has not been rotated in 120 days' },
    ],
  },
];
