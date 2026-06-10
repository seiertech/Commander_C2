/**
 * Seed Push Action Intents — Deterministic Fixtures
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 20.4, 21.6, 26.5, 15.2
 *
 * 4 push intents covering all mock statuses. Synthetic data.
 * No live push — intent/status only (Phase 1).
 */

import type { PushActionIntent } from '../entities/push-action-intent';
import type { PushIntentStatus, PushActionType, IocCategory } from '../entities/intelligence-common';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

const INTENT_FIXTURES: Array<{
  intentStatus: PushIntentStatus;
  actionType: PushActionType;
  iocCategory: IocCategory;
  targetSystem: string;
  iocIdx: number;
}> = [
  { intentStatus: 'recommended', actionType: 'block', iocCategory: 'file_hash_sha256', targetSystem: 'EDR (Mock)', iocIdx: 3 },
  { intentStatus: 'approved', actionType: 'block', iocCategory: 'domain', targetSystem: 'proxy (Mock)', iocIdx: 5 },
  { intentStatus: 'pushed_mock', actionType: 'alert', iocCategory: 'ip_address', targetSystem: 'firewall (Mock)', iocIdx: 8 },
  { intentStatus: 'failed_mock', actionType: 'quarantine', iocCategory: 'email_address', targetSystem: 'email_security (Mock)', iocIdx: 10 },
];

export const seedPushActionIntents: PushActionIntent[] = INTENT_FIXTURES.map(
  (fixture, index) => ({
    id: seedId('pai', index + 1),
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    tenantId: SEED_TENANT.tenantId,
    iocId: seedId('ioc', fixture.iocIdx),
    iocCategory: fixture.iocCategory,
    targetSystemType: fixture.targetSystem,
    actionType: fixture.actionType,
    intentStatus: fixture.intentStatus,
    requestedBy: 'system-mock-evaluator',
    requestedAt: '2026-01-15T09:00:00.000Z',
    approvedBy: fixture.intentStatus === 'approved' || fixture.intentStatus === 'pushed_mock' ? 'analyst-mock-001' : null,
    approvedAt: fixture.intentStatus === 'approved' || fixture.intentStatus === 'pushed_mock' ? '2026-01-15T09:30:00.000Z' : null,
    executionReference: fixture.intentStatus === 'pushed_mock' ? 'mock-exec-ref-001' : fixture.intentStatus === 'failed_mock' ? 'mock-exec-ref-failed-001' : '',
  }),
);
