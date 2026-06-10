/**
 * Seed Governed Compose — Commander C2 Test Fixtures
 *
 * Synthetic outbound draft communications with approval chain.
 * Source: Spec #25 Case Communication Req 3/5
 * No real customer data, secrets, or vendor credentials.
 */

import type { GovernedCompose } from '../entities/governed-compose';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, sourceSystem: 'communication-compose-engine' };

export const seedGovernedCompose: GovernedCompose[] = [
  {
    id: seedId('gov-compose', 1),
    entityType: 'governed-compose',
    tenant: SEED_TENANT,
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-02-01T09:45:00.000Z',
    source: ENGINE_SOURCE,
    caseRef: 'case-0001',
    draftSubject: 'P0 Escalation: CVE-2026-0001 — Immediate remediation required',
    draftBody: 'This communication is to formally notify all stakeholders of the P0 escalation for CVE-2026-0001. Immediate patching of affected internet-facing systems is required within the 4-hour SLA window.',
    recipients: ['ciso@acme-corp.example', 'vuln-manager@acme-corp.example'],
    channel: 'email',
    approvalStatus: 'approved',
    approverRef: 'user-senior-001',
    approvedAt: '2026-02-01T09:30:00.000Z',
    expiresAt: '2026-02-01T13:00:00.000Z',
    playbookRef: 'playbook-p0-escalation',
  },
  {
    id: seedId('gov-compose', 2),
    entityType: 'governed-compose',
    tenant: SEED_TENANT,
    createdAt: '2026-02-02T11:00:00.000Z',
    updatedAt: '2026-02-02T11:00:00.000Z',
    source: ENGINE_SOURCE,
    caseRef: 'case-0002',
    draftSubject: 'Vendor notification: Firewall configuration drift detected',
    draftBody: 'Commander has detected configuration drift on perimeter firewall rules. This notification requests vendor acknowledgement and remediation timeline.',
    recipients: ['vendor-support@example-vendor.com'],
    channel: 'email',
    approvalStatus: 'pending',
    approverRef: 'user-coord-001',
    approvedAt: null,
    expiresAt: '2026-02-03T11:00:00.000Z',
    playbookRef: 'playbook-vendor-notification',
  },
  {
    id: seedId('gov-compose', 3),
    entityType: 'governed-compose',
    tenant: SEED_TENANT,
    createdAt: '2026-01-28T15:00:00.000Z',
    updatedAt: '2026-01-29T09:00:00.000Z',
    source: ENGINE_SOURCE,
    caseRef: 'case-0003',
    draftSubject: 'Teams Bridge: Credential exposure — War Room coordination',
    draftBody: 'Requesting Teams bridge activation for War Room coordination on the credential exposure incident. All SOC and SOM personnel should join.',
    recipients: ['soc-team@acme-corp.example', 'som-leads@acme-corp.example'],
    channel: 'teams',
    approvalStatus: 'rejected',
    approverRef: 'user-senior-002',
    approvedAt: null,
    expiresAt: '2026-01-29T15:00:00.000Z',
    playbookRef: null,
  },
];
