/**
 * Seed War Rooms — Commander SDR Test Fixtures
 *
 * WRCEP-1.0 War Room Communication Excellence Phase 1.
 * Synthetic War Room data with membership, subscribers, and bound cases.
 * No real customer data, secrets, or vendor credentials.
 */

import type { WarRoom } from '../entities/war-room';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

export const seedWarRooms: WarRoom[] = [
  // ─── War Room 1: Activated (Active incident) ────────────────────────────────
  {
    id: seedId('war-room', 1),
    entityType: 'war-room',
    tenant: SEED_TENANT,
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-02-01T09:30:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'war-room-activation-engine' },
    warRoomRef: 'WR-CASE-0001-2026-02-01',
    status: 'activated',
    activationReason: 'System rule: P0 + KEV listed + CVSS 10.0 (≥9.5) + external-facing. Automatic War Room activation.',
    activationSource: 'system_rule',
    boundCaseIds: [seedId('case', 1), seedId('case', 2)],
    membership: [
      {
        userId: 'user-senior-001',
        role: 'senior_owner',
        joinedAt: '2026-02-01T08:00:00.000Z',
        acknowledgedAt: '2026-02-01T08:02:00.000Z',
        leftAt: null,
      },
      {
        userId: 'user-coord-001',
        role: 'coordinator',
        joinedAt: '2026-02-01T08:05:00.000Z',
        acknowledgedAt: '2026-02-01T08:06:00.000Z',
        leftAt: null,
      },
      {
        userId: 'user-analyst-001',
        role: 'analyst',
        joinedAt: '2026-02-01T08:10:00.000Z',
        acknowledgedAt: null,
        leftAt: null,
      },
    ],
    subscribers: [
      {
        userId: 'user-ciso-001',
        channels: ['teams_adaptive_card', 'email_summary'],
        cadence: 'live',
        subscribedAt: '2026-02-01T08:00:00.000Z',
        unsubscribedAt: null,
      },
      {
        userId: 'user-exec-001',
        channels: ['email_structured'],
        cadence: 'hourly',
        subscribedAt: '2026-02-01T08:15:00.000Z',
        unsubscribedAt: null,
      },
    ],
    communicationCadence: {
      activatedCadenceMinutes: 30,
      monitoringCadenceMinutes: 60,
      windingDownCadenceMinutes: 240,
      execUpdateCadenceMinutes: 120,
    },
    seniorOwnerId: 'user-senior-001',
    aiOrientationState: 'active',
    closeOutReportRef: null,
    auditTrailRef: 'audit-war-room-WR-CASE-0001-2026-02-01',
  },

  // ─── War Room 2: Monitoring (Stabilised) ────────────────────────────────────
  {
    id: seedId('war-room', 2),
    entityType: 'war-room',
    tenant: SEED_TENANT,
    createdAt: '2026-01-25T14:00:00.000Z',
    updatedAt: '2026-01-26T10:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'war-room-activation-engine' },
    warRoomRef: 'WR-CASE-0010-2026-01-25',
    status: 'monitoring',
    activationReason: 'System rule: P0 + active exploitation confirmed. Automatic War Room activation.',
    activationSource: 'system_rule',
    boundCaseIds: [seedId('case', 10)],
    membership: [
      {
        userId: 'user-senior-002',
        role: 'senior_owner',
        joinedAt: '2026-01-25T14:00:00.000Z',
        acknowledgedAt: '2026-01-25T14:01:00.000Z',
        leftAt: null,
      },
      {
        userId: 'user-analyst-002',
        role: 'analyst',
        joinedAt: '2026-01-25T14:10:00.000Z',
        acknowledgedAt: '2026-01-25T14:12:00.000Z',
        leftAt: null,
      },
      {
        userId: 'user-observer-001',
        role: 'observer',
        joinedAt: '2026-01-25T15:00:00.000Z',
        acknowledgedAt: null,
        leftAt: null,
      },
    ],
    subscribers: [
      {
        userId: 'user-ciso-001',
        channels: ['in_app', 'email_summary'],
        cadence: 'four_hourly',
        subscribedAt: '2026-01-25T14:00:00.000Z',
        unsubscribedAt: null,
      },
    ],
    communicationCadence: {
      activatedCadenceMinutes: 30,
      monitoringCadenceMinutes: 60,
      windingDownCadenceMinutes: 240,
      execUpdateCadenceMinutes: 120,
    },
    seniorOwnerId: 'user-senior-002',
    aiOrientationState: 'paused',
    closeOutReportRef: null,
    auditTrailRef: 'audit-war-room-WR-CASE-0010-2026-01-25',
  },

  // ─── War Room 3: Closed (Historical) ───────────────────────────────────────
  {
    id: seedId('war-room', 3),
    entityType: 'war-room',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T06:00:00.000Z',
    updatedAt: '2026-01-12T18:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'war-room-activation-engine' },
    warRoomRef: 'WR-CASE-0005-2026-01-10',
    status: 'closed',
    activationReason: 'Senior decision: P0 critical vulnerability with business-critical exposure requiring coordination.',
    activationSource: 'senior_decision',
    boundCaseIds: [seedId('case', 5), seedId('case', 6), seedId('case', 7)],
    membership: [
      {
        userId: 'user-senior-001',
        role: 'senior_owner',
        joinedAt: '2026-01-10T06:00:00.000Z',
        acknowledgedAt: '2026-01-10T06:01:00.000Z',
        leftAt: '2026-01-12T18:00:00.000Z',
      },
      {
        userId: 'user-coord-002',
        role: 'coordinator',
        joinedAt: '2026-01-10T06:30:00.000Z',
        acknowledgedAt: '2026-01-10T06:32:00.000Z',
        leftAt: '2026-01-12T18:00:00.000Z',
      },
      {
        userId: 'user-analyst-003',
        role: 'analyst',
        joinedAt: '2026-01-10T07:00:00.000Z',
        acknowledgedAt: '2026-01-10T07:05:00.000Z',
        leftAt: '2026-01-12T16:00:00.000Z',
      },
    ],
    subscribers: [
      {
        userId: 'user-ciso-001',
        channels: ['teams_adaptive_card', 'email_structured'],
        cadence: 'on_state_change',
        subscribedAt: '2026-01-10T06:00:00.000Z',
        unsubscribedAt: '2026-01-12T18:00:00.000Z',
      },
      {
        userId: 'user-board-001',
        channels: ['email_summary'],
        cadence: 'end_of_day',
        subscribedAt: '2026-01-10T08:00:00.000Z',
        unsubscribedAt: '2026-01-12T18:00:00.000Z',
      },
    ],
    communicationCadence: {
      activatedCadenceMinutes: 15,
      monitoringCadenceMinutes: 60,
      windingDownCadenceMinutes: 120,
      execUpdateCadenceMinutes: 60,
    },
    seniorOwnerId: 'user-senior-001',
    aiOrientationState: 'complete',
    closeOutReportRef: 'closeout-WR-CASE-0005-2026-01-10',
    auditTrailRef: 'audit-war-room-WR-CASE-0005-2026-01-10',
  },
];
