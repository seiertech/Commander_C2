/**
 * Seed Case Strategy Bindings — Commander SDR Test Fixtures
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
    caseId: seedId('case', 1),
    routingStrategy: {
      surfaceType: 'routing',
      policyId: seedId('strategy', 4),
      policyVersion: '2.0.0',
      evaluatedAt: '2026-01-16T08:30:00.000Z',
    },
    slaStrategy: {
      surfaceType: 'sla',
      policyId: seedId('strategy', 1),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-16T08:30:00.000Z',
    },
    prioritisationWeightStrategy: {
      surfaceType: 'prioritisation-weight',
      policyId: seedId('strategy', 9),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-16T08:30:00.000Z',
    },
    closureGateStrategy: {
      surfaceType: 'closure-gate',
      policyId: seedId('strategy', 11),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-16T08:30:00.000Z',
    },
    reopeningTriggerStrategy: {
      surfaceType: 'reopening-trigger',
      policyId: seedId('strategy', 12),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-16T08:30:00.000Z',
    },
    validationWindowStrategy: {
      surfaceType: 'validation-window',
      policyId: seedId('strategy', 10),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-16T08:30:00.000Z',
    },
  },
  {
    caseId: seedId('case', 2),
    routingStrategy: {
      surfaceType: 'routing',
      policyId: seedId('strategy', 4),
      policyVersion: '2.0.0',
      evaluatedAt: '2026-01-17T10:00:00.000Z',
    },
    slaStrategy: {
      surfaceType: 'sla',
      policyId: seedId('strategy', 1),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-17T10:00:00.000Z',
    },
    prioritisationWeightStrategy: {
      surfaceType: 'prioritisation-weight',
      policyId: seedId('strategy', 9),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-17T10:00:00.000Z',
    },
    closureGateStrategy: {
      surfaceType: 'closure-gate',
      policyId: seedId('strategy', 11),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-17T10:00:00.000Z',
    },
    reopeningTriggerStrategy: {
      surfaceType: 'reopening-trigger',
      policyId: seedId('strategy', 12),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-17T10:00:00.000Z',
    },
    validationWindowStrategy: {
      surfaceType: 'validation-window',
      policyId: seedId('strategy', 10),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-17T10:00:00.000Z',
    },
  },
  {
    caseId: seedId('case', 3),
    routingStrategy: {
      surfaceType: 'routing',
      policyId: seedId('strategy', 4),
      policyVersion: '2.0.0',
      evaluatedAt: '2026-01-18T06:00:00.000Z',
    },
    slaStrategy: {
      surfaceType: 'sla',
      policyId: seedId('strategy', 1),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-18T06:00:00.000Z',
    },
    prioritisationWeightStrategy: {
      surfaceType: 'prioritisation-weight',
      policyId: seedId('strategy', 9),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-18T06:00:00.000Z',
    },
    closureGateStrategy: {
      surfaceType: 'closure-gate',
      policyId: seedId('strategy', 11),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-18T06:00:00.000Z',
    },
    reopeningTriggerStrategy: {
      surfaceType: 'reopening-trigger',
      policyId: seedId('strategy', 12),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-18T06:00:00.000Z',
    },
    validationWindowStrategy: {
      surfaceType: 'validation-window',
      policyId: seedId('strategy', 10),
      policyVersion: '1.0.0',
      evaluatedAt: '2026-01-18T06:00:00.000Z',
    },
  },
];
