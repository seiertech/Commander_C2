/**
 * Seed Communication Threads — Deterministic Fixtures
 *
 * Feature: communications-excellence
 * 4 threads covering email/teams channels and various statuses.
 * Synthetic data. No real customer data.
 */

import type { CaseCommunicationThread } from '../entities/case-communication-thread';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

export const seedCommunicationThreads: CaseCommunicationThread[] = [
  {
    id: seedId('comthread', 1),
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T08:00:00.000Z',
    updatedAt: '2026-01-16T10:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-communication-engine (Mock)' },
    threadId: seedId('comthread', 1),
    caseId: seedId('case', 1),
    tenantId: SEED_TENANT.tenantId,
    channel: 'email',
    participants: [
      { participantId: 'analyst-001@acme.example', displayName: 'Alice Security-Analyst (Mock)', role: 'sender' },
      { participantId: 'asset-owner-001@acme.example', displayName: 'Bob Asset-Owner (Mock)', role: 'recipient' },
    ],
    status: 'responded',
    communicationSla: { targetResponseHours: 24, breached: false },
    sentAt: '2026-01-16T08:00:00.000Z',
    lastResponseAt: '2026-01-16T10:00:00.000Z',
    messageCount: 3,
    escalationCount: 0,
  },
  {
    id: seedId('comthread', 2),
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T09:00:00.000Z',
    updatedAt: '2026-01-17T09:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-communication-engine (Mock)' },
    threadId: seedId('comthread', 2),
    caseId: seedId('case', 2),
    tenantId: SEED_TENANT.tenantId,
    channel: 'teams',
    participants: [
      { participantId: 'commander-bot@acme.example', displayName: 'Commander Bot (Mock)', role: 'sender' },
      { participantId: 'team-lead-001@acme.example', displayName: 'Carol Team-Lead (Mock)', role: 'recipient' },
      { participantId: 'analyst-002@acme.example', displayName: 'Dave Analyst (Mock)', role: 'cc' },
    ],
    status: 'awaiting_response',
    communicationSla: { targetResponseHours: 4, breached: false },
    sentAt: '2026-01-17T08:00:00.000Z',
    lastResponseAt: null,
    messageCount: 1,
    escalationCount: 0,
  },
  {
    id: seedId('comthread', 3),
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T14:00:00.000Z',
    updatedAt: '2026-01-17T14:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-communication-engine (Mock)' },
    threadId: seedId('comthread', 3),
    caseId: seedId('case', 3),
    tenantId: SEED_TENANT.tenantId,
    channel: 'email',
    participants: [
      { participantId: 'commander-system@acme.example', displayName: 'Commander System (Mock)', role: 'sender' },
      { participantId: 'vendor-contact@vendor.example', displayName: 'Vendor Contact (Mock)', role: 'recipient' },
    ],
    status: 'stale',
    communicationSla: { targetResponseHours: 48, breached: true },
    sentAt: '2026-01-15T14:00:00.000Z',
    lastResponseAt: null,
    messageCount: 2,
    escalationCount: 1,
  },
  {
    id: seedId('comthread', 4),
    tenant: SEED_TENANT,
    createdAt: '2026-01-14T10:00:00.000Z',
    updatedAt: '2026-01-14T16:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-communication-engine (Mock)' },
    threadId: seedId('comthread', 4),
    caseId: seedId('case', 1),
    tenantId: SEED_TENANT.tenantId,
    channel: 'teams',
    participants: [
      { participantId: 'commander-bot@acme.example', displayName: 'Commander Bot (Mock)', role: 'sender' },
      { participantId: 'ciso@acme.example', displayName: 'CISO (Mock)', role: 'recipient' },
    ],
    status: 'closed',
    communicationSla: { targetResponseHours: 2, breached: false },
    sentAt: '2026-01-14T10:00:00.000Z',
    lastResponseAt: '2026-01-14T11:30:00.000Z',
    messageCount: 4,
    escalationCount: 0,
  },
];
