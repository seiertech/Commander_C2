/**
 * Seed Verdicts — Commander SDR Test Fixtures
 *
 * Synthetic verdict data conforming to canonical entity shape.
 * Source: COIM v1.0 §6; Spec #62 Verdict Semantics
 * Build unit: COIM-C (Verdict Entity Promotion)
 *
 * Five seed verdicts covering all disposition severity levels:
 * 1. BLOCK — WAF blocking exploit attempt on PROD-WEB-01
 * 2. QUARANTINE — EDR quarantining suspicious process
 * 3. REQUIRE_MFA — IAM requiring MFA for privileged access
 * 4. MONITOR — UEBA monitoring anomalous behaviour
 * 5. ALLOW — Firewall allowing legitimate traffic (expired verdict)
 *
 * All tenant-scoped, deterministic IDs, source provenance.
 * Disposition semantics and severity ordering unchanged (Spec #62).
 */

import type { Verdict } from '../entities/verdict';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

export const seedVerdicts: Verdict[] = [
  {
    id: seedId('verdict', 1),
    entityType: 'verdict',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T06:01:00.000Z',
    updatedAt: '2026-01-18T06:01:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-verdict-001', sourceSystem: 'waf-connector' },
    disposition: 'BLOCK',
    sourceProduct: {
      vendor: 'Cloudflare',
      name: 'WAF',
      version: '4.2',
      connectorClass: 'B',
    },
    confidence: 98,
    observedAt: '2026-01-18T05:59:00.000Z',
    targetEntityId: seedId('asset', 1),
    targetEntityType: 'asset',
    policyRef: {
      policyId: 'waf-rule-CVE-2026-9999',
      policyName: 'CVE-2026-9999 Exploit Pattern',
      policyVersion: '1.0.3',
      policySource: 'Cloudflare Managed Rules',
    },
    timeBound: true,
    expiresAt: '2026-01-25T05:59:00.000Z',
  },
  {
    id: seedId('verdict', 2),
    entityType: 'verdict',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T06:03:00.000Z',
    updatedAt: '2026-01-18T06:03:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-verdict-002', sourceSystem: 'crowdstrike-connector' },
    disposition: 'QUARANTINE',
    sourceProduct: {
      vendor: 'CrowdStrike',
      name: 'Falcon',
      version: '7.1',
      connectorClass: 'A',
    },
    confidence: 92,
    observedAt: '2026-01-18T06:00:00.000Z',
    targetEntityId: seedId('asset', 1),
    targetEntityType: 'asset',
    policyRef: {
      policyId: 'falcon-ml-suspicious-process',
      policyName: 'ML Suspicious Process Detection',
      policyVersion: '2.4.1',
      policySource: 'CrowdStrike ML Engine',
    },
    timeBound: true,
    expiresAt: '2026-01-19T06:00:00.000Z',
  },
  {
    id: seedId('verdict', 3),
    entityType: 'verdict',
    tenant: SEED_TENANT,
    createdAt: '2026-01-17T14:00:00.000Z',
    updatedAt: '2026-01-17T14:00:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-verdict-003', sourceSystem: 'azure-ad-connector' },
    disposition: 'REQUIRE_MFA',
    sourceProduct: {
      vendor: 'Microsoft',
      name: 'Entra ID',
      version: '2.0',
      connectorClass: 'B',
    },
    confidence: 85,
    observedAt: '2026-01-17T13:55:00.000Z',
    targetEntityId: seedId('identity', 17),
    targetEntityType: 'identity',
    policyRef: {
      policyId: 'ca-policy-privileged-mfa',
      policyName: 'Conditional Access: Privileged MFA Required',
      policyVersion: '3.1.0',
      policySource: 'Microsoft Entra Conditional Access',
    },
    timeBound: true,
    expiresAt: '2026-01-18T13:55:00.000Z',
  },
  {
    id: seedId('verdict', 4),
    entityType: 'verdict',
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T10:00:00.000Z',
    updatedAt: '2026-01-16T10:00:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-verdict-004', sourceSystem: 'ueba-connector' },
    disposition: 'MONITOR',
    sourceProduct: {
      vendor: 'Exabeam',
      name: 'Advanced Analytics',
      version: '5.3',
      connectorClass: 'A',
    },
    confidence: 65,
    observedAt: '2026-01-16T09:50:00.000Z',
    targetEntityId: seedId('identity', 16),
    targetEntityType: 'identity',
    policyRef: {
      policyId: 'ueba-anomaly-score-threshold',
      policyName: 'UEBA Anomaly Score > 70',
      policyVersion: '1.2.0',
      policySource: 'Exabeam Behavioural Model',
    },
    timeBound: false,
    expiresAt: null,
  },
  {
    id: seedId('verdict', 5),
    entityType: 'verdict',
    tenant: SEED_TENANT,
    createdAt: '2026-01-14T08:00:00.000Z',
    updatedAt: '2026-01-14T08:00:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-verdict-005', sourceSystem: 'firewall-connector' },
    disposition: 'ALLOW',
    sourceProduct: {
      vendor: 'Palo Alto',
      name: 'NGFW',
      version: '11.1',
      connectorClass: 'B',
    },
    confidence: 99,
    observedAt: '2026-01-14T07:55:00.000Z',
    targetEntityId: seedId('asset', 8),
    targetEntityType: 'asset',
    policyRef: {
      policyId: 'fw-rule-allow-https-egress',
      policyName: 'Allow HTTPS Egress',
      policyVersion: '2.0.0',
      policySource: 'Palo Alto Security Policy',
    },
    timeBound: true,
    expiresAt: '2026-01-15T07:55:00.000Z',
  },
];
