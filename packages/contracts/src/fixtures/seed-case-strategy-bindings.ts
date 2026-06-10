/**
 * Seed Case Strategy Bindings — Commander C2 Test Fixtures
 *
 * Links seed cases to their governing strategy policies.
 * Source: Spec #32 Strategy Layer Runtime Surface, Spec #08 Case Management
 *
 * All values derived from strategy layer; none hardcoded.
 * Deterministic, repeatable (v1.3 Req 20).
 */

import type { CaseStrategyBinding } from '../entities/case-strategy-binding';
import { seedId } from './seed-tenant';

/**
 * Seed case strategy bindings — one per seed case.
 * Maps each case to the six strategy surfaces it consumes.
 *
 * Strategy policy IDs (from seed-strategies.ts):
 * - strategy-0001 = sla (v1.0.0, active)
 * - strategy-0004 = routing (v2.0.0, active)
 * - strategy-0009 = prioritisation-weight (v1.0.0, active)
 * - strategy-0010 = validation-window (v1.0.0, active)
 * - strategy-0011 = closure-gate (v1.0.0, active)
 * - strategy-0012 = reopening-trigger (v1.0.0, active)
 */
export const seedCaseStrategyBindings: CaseStrategyBinding[] = [
  {
    case_id: seedId('case', 1),
    routingStrategy: {
      surface_type: 'routing',
      policy_id: seedId('strategy', 4),
      policy_version: '2.0.0',
      evaluated_at: '2026-01-16T08:30:00.000Z',
    },
    slaStrategy: {
      surface_type: 'sla',
      policy_id: seedId('strategy', 1),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-16T08:30:00.000Z',
    },
    prioritisationWeightStrategy: {
      surface_type: 'prioritisation-weight',
      policy_id: seedId('strategy', 9),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-16T08:30:00.000Z',
    },
    closureGateStrategy: {
      surface_type: 'closure-gate',
      policy_id: seedId('strategy', 11),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-16T08:30:00.000Z',
    },
    reopeningTriggerStrategy: {
      surface_type: 'reopening-trigger',
      policy_id: seedId('strategy', 12),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-16T08:30:00.000Z',
    },
    validationWindowStrategy: {
      surface_type: 'validation-window',
      policy_id: seedId('strategy', 10),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-16T08:30:00.000Z',
    },
  },
  {
    case_id: seedId('case', 2),
    routingStrategy: {
      surface_type: 'routing',
      policy_id: seedId('strategy', 4),
      policy_version: '2.0.0',
      evaluated_at: '2026-01-17T10:00:00.000Z',
    },
    slaStrategy: {
      surface_type: 'sla',
      policy_id: seedId('strategy', 1),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-17T10:00:00.000Z',
    },
    prioritisationWeightStrategy: {
      surface_type: 'prioritisation-weight',
      policy_id: seedId('strategy', 9),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-17T10:00:00.000Z',
    },
    closureGateStrategy: {
      surface_type: 'closure-gate',
      policy_id: seedId('strategy', 11),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-17T10:00:00.000Z',
    },
    reopeningTriggerStrategy: {
      surface_type: 'reopening-trigger',
      policy_id: seedId('strategy', 12),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-17T10:00:00.000Z',
    },
    validationWindowStrategy: {
      surface_type: 'validation-window',
      policy_id: seedId('strategy', 10),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-17T10:00:00.000Z',
    },
  },
  {
    case_id: seedId('case', 3),
    routingStrategy: {
      surface_type: 'routing',
      policy_id: seedId('strategy', 4),
      policy_version: '2.0.0',
      evaluated_at: '2026-01-18T06:00:00.000Z',
    },
    slaStrategy: {
      surface_type: 'sla',
      policy_id: seedId('strategy', 1),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-18T06:00:00.000Z',
    },
    prioritisationWeightStrategy: {
      surface_type: 'prioritisation-weight',
      policy_id: seedId('strategy', 9),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-18T06:00:00.000Z',
    },
    closureGateStrategy: {
      surface_type: 'closure-gate',
      policy_id: seedId('strategy', 11),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-18T06:00:00.000Z',
    },
    reopeningTriggerStrategy: {
      surface_type: 'reopening-trigger',
      policy_id: seedId('strategy', 12),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-18T06:00:00.000Z',
    },
    validationWindowStrategy: {
      surface_type: 'validation-window',
      policy_id: seedId('strategy', 10),
      policy_version: '1.0.0',
      evaluated_at: '2026-01-18T06:00:00.000Z',
    },
  },
];
