// @ts-nocheck
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
  intent_status: PushIntentStatus;
  action_type: PushActionType;
  ioc_category: IocCategory;
  target_system: string;
  iocIdx: number;
}> = [
  { intent_status: 'recommended', action_type: 'block', ioc_category: 'file_hash_sha256', target_system: 'EDR (Mock)', iocIdx: 3 },
  { intent_status: 'approved', action_type: 'block', ioc_category: 'domain', target_system: 'proxy (Mock)', iocIdx: 5 },
  { intent_status: 'pushed_mock', action_type: 'alert', ioc_category: 'ip_address', target_system: 'firewall (Mock)', iocIdx: 8 },
  { intent_status: 'failed_mock', action_type: 'quarantine', ioc_category: 'email_address', target_system: 'email_security (Mock)', iocIdx: 10 },
];

export const seedPushActionIntents: PushActionIntent[] = INTENT_FIXTURES.map(
  (fixture, index) => ({
    id: seedId('pai', index + 1),
    tenant: SEED_TENANT,
    created_at: '2026-01-15T09:00:00.000Z',
    updated_at: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    tenant_id: SEED_TENANT.tenant_id,
    ioc_id: seedId('ioc', fixture.iocIdx),
    ioc_category: fixture.ioc_category,
    targetSystemType: fixture.target_system,
    action_type: fixture.action_type,
    intent_status: fixture.intent_status,
    requested_by: 'system-mock-evaluator',
    requested_at: '2026-01-15T09:00:00.000Z',
    approved_by: fixture.intent_status === 'approved' || fixture.intent_status === 'pushed_mock' ? 'analyst-mock-001' : null,
    approved_at: fixture.intent_status === 'approved' || fixture.intent_status === 'pushed_mock' ? '2026-01-15T09:30:00.000Z' : null,
    executionReference: fixture.intent_status === 'pushed_mock' ? 'mock-exec-ref-001' : fixture.intent_status === 'failed_mock' ? 'mock-exec-ref-failed-001' : '',
  }),
);
