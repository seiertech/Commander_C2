/**
 * Seed Email Communications — Commander SDR Test Fixtures
 *
 * Synthetic email case communication records for case communication surfaces.
 * 4 records covering inbound/outbound, varying binding confidence and statuses.
 * Source: Master Technical Specification §Case Communication
 */

import type { EmailCaseCommunication } from '../entities/email-case-communication';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-engine-layer' };

export const seedEmailCommunications: EmailCaseCommunication[] = [
  {
    id: seedId('email-comm', 1),
    entityType: 'email-case-communication',
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T10:30:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    communicationId: 'comm-email-001',
    caseRef: 'case-0001',
    direction: 'inbound',
    senderAddress: 'vendor-support@example-vendor.com',
    recipientAddresses: ['security-team@acme-corp.example'],
    subject: 'RE: Firewall rule change ticket FW-042 — approval required',
    bodyPreview: 'Hi team, the requested firewall rule change FW-042 requires additional justification before we can approve. Please provide the business case...',
    receivedAt: '2026-01-15T10:30:00.000Z',
    processedAt: '2026-01-15T10:31:00.000Z',
    bindingConfidence: 0.92,
    status: 'bound',
    threadId: 'thread-fw-042',
    attachmentCount: 1,
  },
  {
    id: seedId('email-comm', 2),
    entityType: 'email-case-communication',
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T14:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    communicationId: 'comm-email-002',
    caseRef: 'case-0002',
    direction: 'outbound_notification',
    senderAddress: 'commander-noreply@acme-corp.example',
    recipientAddresses: ['vuln-manager@acme-corp.example', 'ciso@acme-corp.example'],
    subject: 'P0 Alert: CVE-2026-0001 active exploitation detected',
    bodyPreview: 'Commander has escalated CVE-2026-0001 to P0 status. Active exploitation confirmed across 3 internet-facing assets. Immediate patching required...',
    receivedAt: '2026-01-16T14:00:00.000Z',
    processedAt: '2026-01-16T14:00:30.000Z',
    bindingConfidence: 1.0,
    status: 'bound',
    threadId: null,
    attachmentCount: 0,
  },
  {
    id: seedId('email-comm', 3),
    entityType: 'email-case-communication',
    tenant: SEED_TENANT,
    createdAt: '2026-01-17T08:45:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    communicationId: 'comm-email-003',
    caseRef: 'case-0003',
    direction: 'inbound',
    senderAddress: 'external-reporter@unknown-domain.example',
    recipientAddresses: ['security-team@acme-corp.example'],
    subject: 'Possible credential leak found on paste site',
    bodyPreview: 'I found what appears to be credentials for your organisation on a public paste site. The paste contains what looks like API keys and...',
    receivedAt: '2026-01-17T08:45:00.000Z',
    processedAt: '2026-01-17T08:46:00.000Z',
    bindingConfidence: 0.64,
    status: 'pending_binding',
    threadId: null,
    attachmentCount: 2,
  },
  {
    id: seedId('email-comm', 4),
    entityType: 'email-case-communication',
    tenant: SEED_TENANT,
    createdAt: '2026-01-17T12:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    communicationId: 'comm-email-004',
    caseRef: 'case-0001',
    direction: 'inbound',
    senderAddress: 'vendor-support@example-vendor.com',
    recipientAddresses: ['security-team@acme-corp.example'],
    subject: 'RE: Firewall rule change ticket FW-042 — approval required',
    bodyPreview: 'This is a duplicate of our earlier correspondence regarding the same ticket. No new information...',
    receivedAt: '2026-01-17T12:00:00.000Z',
    processedAt: '2026-01-17T12:01:00.000Z',
    bindingConfidence: 0.92,
    status: 'duplicate',
    threadId: 'thread-fw-042',
    attachmentCount: 0,
  },
];
