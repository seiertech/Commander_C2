/**
 * Seed Posture Accountability — Commander SDR Test Fixtures
 *
 * 5 records demonstrating the temporal posture accountability model:
 * - 2 PRE_WARNED (asset with known vuln not patched, identity with access drift)
 * - 2 PROTECTED (asset with EDR active, identity with MFA enforced)
 * - 1 NOVEL (newly discovered shadow IT asset)
 *
 * Source: Spec #71, DEC-spec39-dual-model
 * No real customer data — synthetic values only.
 */

import type { PostureAccountability } from '../entities/posture-accountability';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const PA_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-posture-accountability-engine' };
const BASE_DATE = '2026-01-18T06:00:00.000Z';

export const seedPostureAccountability: PostureAccountability[] = [
  // ─── PRE_WARNED: Asset with known vulnerability not patched ─────────────────
  {
    id: seedId('pa', 1),
    entityType: 'posture-accountability',
    tenant: SEED_TENANT,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    source: PA_SOURCE,
    accountabilityId: 'pa-acc-001',
    accountableEntityType: 'asset',
    entityRef: 'asset-0001',
    classification: 'PRE_WARNED',
    previousClassification: null,
    classifiedAt: '2026-01-10T08:00:00.000Z',
    classifiedBy: 'system',
    reason: 'CVE-2025-12345 (CVSS 9.1) identified on this asset 8 days ago. No patch applied, no compensating control deployed. Drift finding DRIFT-0042 remains open.',
    evidenceRefs: ['drift-0042', 'vuln-intel-0015', 'coverage-gap-0003'],
    durationInState: 8,
    escalationThreshold: 14,
    status: 'active',
    linkedRiskObjectRef: 'ro-0012',
    linkedCaseRef: null,
  },
  // ─── PRE_WARNED: Identity with access drift not addressed ──────────────────
  {
    id: seedId('pa', 2),
    entityType: 'posture-accountability',
    tenant: SEED_TENANT,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    source: PA_SOURCE,
    accountabilityId: 'pa-acc-002',
    accountableEntityType: 'identity',
    entityRef: 'identity-0003',
    classification: 'PRE_WARNED',
    previousClassification: 'PROTECTED',
    classifiedAt: '2026-01-15T14:00:00.000Z',
    classifiedBy: 'system',
    reason: 'Privilege escalation drift detected — identity gained Global Admin without approval. Identity risk factor added but not remediated. 3 days in PRE_WARNED state.',
    evidenceRefs: ['drift-0058', 'identity-risk-factor-0007'],
    durationInState: 3,
    escalationThreshold: 7,
    status: 'active',
    linkedRiskObjectRef: 'ro-0018',
    linkedCaseRef: 'case-0005',
  },
  // ─── PROTECTED: Asset with EDR active and patched ──────────────────────────
  {
    id: seedId('pa', 3),
    entityType: 'posture-accountability',
    tenant: SEED_TENANT,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    source: PA_SOURCE,
    accountabilityId: 'pa-acc-003',
    accountableEntityType: 'asset',
    entityRef: 'asset-0002',
    classification: 'PROTECTED',
    previousClassification: 'PRE_WARNED',
    classifiedAt: '2026-01-17T10:00:00.000Z',
    classifiedBy: 'system',
    reason: 'All known vulnerabilities patched. EDR agent active and reporting. No open drift findings. Coverage confirmed across all control domains.',
    evidenceRefs: ['patch-confirmation-0012', 'edr-health-0002', 'coverage-check-0044'],
    durationInState: 1,
    escalationThreshold: 30,
    status: 'active',
    linkedRiskObjectRef: null,
    linkedCaseRef: null,
  },
  // ─── PROTECTED: Identity with MFA enforced ─────────────────────────────────
  {
    id: seedId('pa', 4),
    entityType: 'posture-accountability',
    tenant: SEED_TENANT,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    source: PA_SOURCE,
    accountabilityId: 'pa-acc-004',
    accountableEntityType: 'identity',
    entityRef: 'identity-0001',
    classification: 'PROTECTED',
    previousClassification: null,
    classifiedAt: '2026-01-05T09:00:00.000Z',
    classifiedBy: 'system',
    reason: 'MFA enforced, Conditional Access policies active, no privilege drift detected. Identity posture baseline established and current.',
    evidenceRefs: ['mfa-status-0001', 'conditional-access-0001', 'posture-baseline-0001'],
    durationInState: 13,
    escalationThreshold: 30,
    status: 'active',
    linkedRiskObjectRef: null,
    linkedCaseRef: null,
  },
  // ─── NOVEL: Newly discovered shadow IT asset ───────────────────────────────
  {
    id: seedId('pa', 5),
    entityType: 'posture-accountability',
    tenant: SEED_TENANT,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    source: PA_SOURCE,
    accountabilityId: 'pa-acc-005',
    accountableEntityType: 'asset',
    entityRef: 'asset-unresolved-001',
    classification: 'NOVEL',
    previousClassification: null,
    classifiedAt: '2026-01-18T04:00:00.000Z',
    classifiedBy: 'system',
    reason: 'Entity discovered via network scan but cannot be resolved to canonical asset register. No baseline established. Pending inverse discovery resolution.',
    evidenceRefs: ['discovery-scan-0001'],
    durationInState: 0,
    escalationThreshold: 3,
    status: 'active',
    linkedRiskObjectRef: null,
    linkedCaseRef: 'case-0008',
  },
];
