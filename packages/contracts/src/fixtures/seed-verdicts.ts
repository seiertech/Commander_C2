/**
 * Seed Verdicts — Commander C2 Test Fixtures
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
    entity_type: 'verdict',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:01:00.000Z',
    updated_at: '2026-01-18T06:01:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-verdict-001', source_system: 'waf-connector' },
    disposition: 'BLOCK',
    source_product: {
      vendor: 'Cloudflare',
      name: 'WAF',
      version: '4.2',
      connector_class: 'B',
    },
    confidence: 98,
    observed_at: '2026-01-18T05:59:00.000Z',
    targetEntityId: seedId('asset', 1),
    targetEntityType: 'asset',
    policy_ref: {
      policy_id: 'waf-rule-CVE-2026-9999',
      policy_name: 'CVE-2026-9999 Exploit Pattern',
      policy_version: '1.0.3',
      policySource: 'Cloudflare Managed Rules',
    },
    timeBound: true,
    expires_at: '2026-01-25T05:59:00.000Z',
  },
  {
    id: seedId('verdict', 2),
    entity_type: 'verdict',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:03:00.000Z',
    updated_at: '2026-01-18T06:03:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-verdict-002', source_system: 'crowdstrike-connector' },
    disposition: 'QUARANTINE',
    source_product: {
      vendor: 'CrowdStrike',
      name: 'Falcon',
      version: '7.1',
      connector_class: 'A',
    },
    confidence: 92,
    observed_at: '2026-01-18T06:00:00.000Z',
    targetEntityId: seedId('asset', 1),
    targetEntityType: 'asset',
    policy_ref: {
      policy_id: 'falcon-ml-suspicious-process',
      policy_name: 'ML Suspicious Process Detection',
      policy_version: '2.4.1',
      policySource: 'CrowdStrike ML Engine',
    },
    timeBound: true,
    expires_at: '2026-01-19T06:00:00.000Z',
  },
  {
    id: seedId('verdict', 3),
    entity_type: 'verdict',
    tenant: SEED_TENANT,
    created_at: '2026-01-17T14:00:00.000Z',
    updated_at: '2026-01-17T14:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-verdict-003', source_system: 'azure-ad-connector' },
    disposition: 'REQUIRE_MFA',
    source_product: {
      vendor: 'Microsoft',
      name: 'Entra ID',
      version: '2.0',
      connector_class: 'B',
    },
    confidence: 85,
    observed_at: '2026-01-17T13:55:00.000Z',
    targetEntityId: seedId('identity', 17),
    targetEntityType: 'identity',
    policy_ref: {
      policy_id: 'ca-policy-privileged-mfa',
      policy_name: 'Conditional Access: Privileged MFA Required',
      policy_version: '3.1.0',
      policySource: 'Microsoft Entra Conditional Access',
    },
    timeBound: true,
    expires_at: '2026-01-18T13:55:00.000Z',
  },
  {
    id: seedId('verdict', 4),
    entity_type: 'verdict',
    tenant: SEED_TENANT,
    created_at: '2026-01-16T10:00:00.000Z',
    updated_at: '2026-01-16T10:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-verdict-004', source_system: 'ueba-connector' },
    disposition: 'MONITOR',
    source_product: {
      vendor: 'Exabeam',
      name: 'Advanced Analytics',
      version: '5.3',
      connector_class: 'A',
    },
    confidence: 65,
    observed_at: '2026-01-16T09:50:00.000Z',
    targetEntityId: seedId('identity', 16),
    targetEntityType: 'identity',
    policy_ref: {
      policy_id: 'ueba-anomaly-score-threshold',
      policy_name: 'UEBA Anomaly Score > 70',
      policy_version: '1.2.0',
      policySource: 'Exabeam Behavioural Model',
    },
    timeBound: false,
    expires_at: null,
  },
  {
    id: seedId('verdict', 5),
    entity_type: 'verdict',
    tenant: SEED_TENANT,
    created_at: '2026-01-14T08:00:00.000Z',
    updated_at: '2026-01-14T08:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-verdict-005', source_system: 'firewall-connector' },
    disposition: 'ALLOW',
    source_product: {
      vendor: 'Palo Alto',
      name: 'NGFW',
      version: '11.1',
      connector_class: 'B',
    },
    confidence: 99,
    observed_at: '2026-01-14T07:55:00.000Z',
    targetEntityId: seedId('asset', 8),
    targetEntityType: 'asset',
    policy_ref: {
      policy_id: 'fw-rule-allow-https-egress',
      policy_name: 'Allow HTTPS Egress',
      policy_version: '2.0.0',
      policySource: 'Palo Alto Security Policy',
    },
    timeBound: true,
    expires_at: '2026-01-15T07:55:00.000Z',
  },
];
