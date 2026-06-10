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
    createdAt: '2026-01-16T09:30:00.000Z',
    updatedAt: '2026-01-16T09:45:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-phishing-pipeline (Mock)' },
    reportId: seedId('phishreport', 1),
    tenantId: SEED_TENANT.tenantId,
    reportedBy: 'employee-042@acme.example',
    reportedAt: '2026-01-16T09:30:00.000Z',
    originalEmailRef: 'msg-malicious-001@acme.example',
    detonationVerdictId: seedId('detverd', 3),
    triageVerdict: 'malicious',
    observablesEmitted: [seedId('obs', 101), seedId('obs', 102)],
    riskObjectId: seedId('risk', 50),
    caseId: seedId('case', 10),
    employeeNotificationStatus: 'sent',
    status: 'verdicted',
  },
  {
    id: seedId('phishreport', 2),
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T10:00:00.000Z',
    updatedAt: '2026-01-16T10:15:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-phishing-pipeline (Mock)' },
    reportId: seedId('phishreport', 2),
    tenantId: SEED_TENANT.tenantId,
    reportedBy: 'employee-087@acme.example',
    reportedAt: '2026-01-16T10:00:00.000Z',
    originalEmailRef: 'msg-suspicious-001@acme.example',
    detonationVerdictId: seedId('detverd', 2),
    triageVerdict: 'suspicious',
    observablesEmitted: [seedId('obs', 103)],
    riskObjectId: null,
    caseId: null,
    employeeNotificationStatus: 'pending',
    status: 'triaging',
  },
  {
    id: seedId('phishreport', 3),
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T11:00:00.000Z',
    updatedAt: '2026-01-16T11:10:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-phishing-pipeline (Mock)' },
    reportId: seedId('phishreport', 3),
    tenantId: SEED_TENANT.tenantId,
    reportedBy: 'employee-003@acme.example',
    reportedAt: '2026-01-16T11:00:00.000Z',
    originalEmailRef: 'msg-clean-001@acme.example',
    detonationVerdictId: seedId('detverd', 1),
    triageVerdict: 'clean',
    observablesEmitted: [],
    riskObjectId: null,
    caseId: null,
    employeeNotificationStatus: 'sent',
    status: 'closed',
  },
];
