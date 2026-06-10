// @ts-nocheck
/**
 * Seed Phishing Reports — Deterministic Fixtures
 *
 * Feature: communications-excellence
 * 3 reports covering malicious/suspicious/clean verdicts.
 * Synthetic data. No real employee data.
 */

import type { PhishingReport } from '../entities/phishing-report';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

export const seedPhishingReports: PhishingReport[] = [
  {
    id: seedId('phishreport', 1),
    tenant: SEED_TENANT,
    created_at: '2026-01-16T09:30:00.000Z',
    updated_at: '2026-01-16T09:45:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-phishing-pipeline (Mock)' },
    reportId: seedId('phishreport', 1),
    tenant_id: SEED_TENANT.tenant_id,
    reported_by: 'employee-042@acme.example',
    reported_at: '2026-01-16T09:30:00.000Z',
    originalEmailRef: 'msg-malicious-001@acme.example',
    detonationVerdictId: seedId('detverd', 3),
    triageVerdict: 'malicious',
    observablesEmitted: [seedId('obs', 101), seedId('obs', 102)],
    risk_object_id: seedId('risk', 50),
    case_id: seedId('case', 10),
    employeeNotificationStatus: 'sent',
    status: 'verdicted',
  },
  {
    id: seedId('phishreport', 2),
    tenant: SEED_TENANT,
    created_at: '2026-01-16T10:00:00.000Z',
    updated_at: '2026-01-16T10:15:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-phishing-pipeline (Mock)' },
    reportId: seedId('phishreport', 2),
    tenant_id: SEED_TENANT.tenant_id,
    reported_by: 'employee-087@acme.example',
    reported_at: '2026-01-16T10:00:00.000Z',
    originalEmailRef: 'msg-suspicious-001@acme.example',
    detonationVerdictId: seedId('detverd', 2),
    triageVerdict: 'suspicious',
    observablesEmitted: [seedId('obs', 103)],
    risk_object_id: null,
    case_id: null,
    employeeNotificationStatus: 'pending',
    status: 'triaging',
  },
  {
    id: seedId('phishreport', 3),
    tenant: SEED_TENANT,
    created_at: '2026-01-16T11:00:00.000Z',
    updated_at: '2026-01-16T11:10:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-phishing-pipeline (Mock)' },
    reportId: seedId('phishreport', 3),
    tenant_id: SEED_TENANT.tenant_id,
    reported_by: 'employee-003@acme.example',
    reported_at: '2026-01-16T11:00:00.000Z',
    originalEmailRef: 'msg-clean-001@acme.example',
    detonationVerdictId: seedId('detverd', 1),
    triageVerdict: 'clean',
    observablesEmitted: [],
    risk_object_id: null,
    case_id: null,
    employeeNotificationStatus: 'sent',
    status: 'closed',
  },
];
