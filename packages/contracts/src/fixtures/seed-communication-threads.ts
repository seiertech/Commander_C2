// @ts-nocheck
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
    created_at: '2026-01-16T08:00:00.000Z',
    updated_at: '2026-01-16T10:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-communication-engine (Mock)' },
    thread_id: seedId('comthread', 1),
    case_id: seedId('case', 1),
    tenant_id: SEED_TENANT.tenant_id,
    channel: 'email',
    participants: [
      { participantId: 'analyst-001@acme.example', display_name: 'Alice Security-Analyst (Mock)', role: 'sender' },
      { participantId: 'asset-owner-001@acme.example', display_name: 'Bob Asset-Owner (Mock)', role: 'recipient' },
    ],
    status: 'responded',
    communicationSla: { targetResponseHours: 24, breached: false },
    sent_at: '2026-01-16T08:00:00.000Z',
    lastResponseAt: '2026-01-16T10:00:00.000Z',
    message_count: 3,
    escalationCount: 0,
  },
  {
    id: seedId('comthread', 2),
    tenant: SEED_TENANT,
    created_at: '2026-01-16T09:00:00.000Z',
    updated_at: '2026-01-17T09:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-communication-engine (Mock)' },
    thread_id: seedId('comthread', 2),
    case_id: seedId('case', 2),
    tenant_id: SEED_TENANT.tenant_id,
    channel: 'teams',
    participants: [
      { participantId: 'commander-bot@acme.example', display_name: 'Commander Bot (Mock)', role: 'sender' },
      { participantId: 'team-lead-001@acme.example', display_name: 'Carol Team-Lead (Mock)', role: 'recipient' },
      { participantId: 'analyst-002@acme.example', display_name: 'Dave Analyst (Mock)', role: 'cc' },
    ],
    status: 'awaiting_response',
    communicationSla: { targetResponseHours: 4, breached: false },
    sent_at: '2026-01-17T08:00:00.000Z',
    lastResponseAt: null,
    message_count: 1,
    escalationCount: 0,
  },
  {
    id: seedId('comthread', 3),
    tenant: SEED_TENANT,
    created_at: '2026-01-15T14:00:00.000Z',
    updated_at: '2026-01-17T14:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-communication-engine (Mock)' },
    thread_id: seedId('comthread', 3),
    case_id: seedId('case', 3),
    tenant_id: SEED_TENANT.tenant_id,
    channel: 'email',
    participants: [
      { participantId: 'commander-system@acme.example', display_name: 'Commander System (Mock)', role: 'sender' },
      { participantId: 'vendor-contact@vendor.example', display_name: 'Vendor Contact (Mock)', role: 'recipient' },
    ],
    status: 'stale',
    communicationSla: { targetResponseHours: 48, breached: true },
    sent_at: '2026-01-15T14:00:00.000Z',
    lastResponseAt: null,
    message_count: 2,
    escalationCount: 1,
  },
  {
    id: seedId('comthread', 4),
    tenant: SEED_TENANT,
    created_at: '2026-01-14T10:00:00.000Z',
    updated_at: '2026-01-14T16:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-communication-engine (Mock)' },
    thread_id: seedId('comthread', 4),
    case_id: seedId('case', 1),
    tenant_id: SEED_TENANT.tenant_id,
    channel: 'teams',
    participants: [
      { participantId: 'commander-bot@acme.example', display_name: 'Commander Bot (Mock)', role: 'sender' },
      { participantId: 'ciso@acme.example', display_name: 'CISO (Mock)', role: 'recipient' },
    ],
    status: 'closed',
    communicationSla: { targetResponseHours: 2, breached: false },
    sent_at: '2026-01-14T10:00:00.000Z',
    lastResponseAt: '2026-01-14T11:30:00.000Z',
    message_count: 4,
    escalationCount: 0,
  },
];
