// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Unit Tests — Playbook Engine
 *
 * Feature: communications-excellence
 * Tests: trigger evaluation, condition parsing, step advancement, bounded grammar enforcement
 */

import { describe, it, expect } from 'vitest';
import {
  evaluatePlaybookTrigger,
  evaluateStepCondition,
  computeNextStep,
  advanceExecution,
} from '../../packages/rules/playbook-engine';
import type { PlaybookConditionContext } from '../../packages/rules/playbook-engine';
import type { CommunicationPlaybook } from '../../packages/contracts/src/entities/communication-playbook';
import type { PlaybookExecution } from '../../packages/contracts/src/entities/playbook-execution';
import { isValidBoundedCondition } from '../../packages/contracts/src/entities/communication-playbook';
import { seedCommunicationPlaybooks } from '../../packages/contracts/src/fixtures/seed-communication-playbooks';

describe('Playbook Engine — Trigger Evaluation', () => {
  const playbook = seedCommunicationPlaybooks[0]; // vuln-notification-response

  it('activates when case type matches and conditions are met', () => {
    expect(evaluatePlaybookTrigger(playbook, { case_type: 'vulnerability' })).toBe(true);
  });

  it('does not activate when case type does not match', () => {
    expect(evaluatePlaybookTrigger(playbook, { case_type: 'identity' })).toBe(false);
  });

  it('does not activate when trigger conditions fail', () => {
    const playbookWithCondition = seedCommunicationPlaybooks[1]; // has condition case.priority == 'P1'
    expect(evaluatePlaybookTrigger(playbookWithCondition, { case_type: 'threat-intelligence-estate-match', priority: 'P3' })).toBe(false);
  });

  it('activates when trigger conditions pass', () => {
    const playbookWithCondition = seedCommunicationPlaybooks[1];
    expect(evaluatePlaybookTrigger(playbookWithCondition, { case_type: 'threat-intelligence-estate-match', priority: 'P1' })).toBe(true);
  });
});

describe('Playbook Engine — Condition Evaluation', () => {
  const baseContext: PlaybookConditionContext = {
    case: { case_type: 'vulnerability', priority: 'P1', status: 'in_progress', team: 'Security Operations' },
    stepStatuses: [],
    timestamps: {},
  };

  it('evaluates "always" to true', () => {
    expect(evaluateStepCondition('always', baseContext)).toBe(true);
  });

  it('evaluates "never" to false', () => {
    expect(evaluateStepCondition('never', baseContext)).toBe(false);
  });

  it('evaluates equality condition correctly', () => {
    expect(evaluateStepCondition("case.priority == 'P1'", baseContext)).toBe(true);
    expect(evaluateStepCondition("case.priority == 'P3'", baseContext)).toBe(false);
  });

  it('evaluates IN condition correctly', () => {
    expect(evaluateStepCondition("case.priority IN ['P0', 'P1']", baseContext)).toBe(true);
    expect(evaluateStepCondition("case.priority IN ['P2', 'P3']", baseContext)).toBe(false);
  });

  it('evaluates no_response_to_step_N condition', () => {
    const contextWithExecutedStep: PlaybookConditionContext = {
      ...baseContext,
      stepStatuses: [{ stepNumber: 2, status: 'executed', executedAt: '2026-01-16T10:00:00.000Z', reason: null }],
    };
    expect(evaluateStepCondition('no_response_to_step_2', contextWithExecutedStep)).toBe(true);
  });

  it('evaluates time_since_step_N > duration condition', () => {
    const pastTime = new Date(Date.now() - 3600000 * 25).toISOString(); // 25 hours ago
    const contextWithTimestamp: PlaybookConditionContext = {
      ...baseContext,
      stepStatuses: [],
      timestamps: { 1: pastTime },
    };
    expect(evaluateStepCondition('time_since_step_1 > 24h', contextWithTimestamp)).toBe(true);
    expect(evaluateStepCondition('time_since_step_1 > 48h', contextWithTimestamp)).toBe(false);
  });

  it('returns false for invalid/unrecognised conditions', () => {
    expect(evaluateStepCondition('some_random_thing', baseContext)).toBe(false);
    expect(evaluateStepCondition('DROP TABLE cases;', baseContext)).toBe(false);
  });
});

describe('Playbook Engine — Bounded Grammar Enforcement', () => {
  it('accepts valid bounded conditions', () => {
    expect(isValidBoundedCondition('always')).toBe(true);
    expect(isValidBoundedCondition('never')).toBe(true);
    expect(isValidBoundedCondition("case.priority == 'P1'")).toBe(true);
    expect(isValidBoundedCondition("case.status IN ['open', 'in_progress']")).toBe(true);
    expect(isValidBoundedCondition('no_response_to_step_2')).toBe(true);
    expect(isValidBoundedCondition('time_since_step_1 > PT24H')).toBe(true);
  });

  it('rejects invalid conditions', () => {
    expect(isValidBoundedCondition('SELECT * FROM cases')).toBe(false);
    expect(isValidBoundedCondition('')).toBe(false);
    expect(isValidBoundedCondition('case.field LIKE "%test%"')).toBe(false);
    expect(isValidBoundedCondition('case.field > 5 AND case.other < 3')).toBe(false);
  });
});

describe('Playbook Engine — Step Advancement', () => {
  it('computes next step correctly', () => {
    const playbook = seedCommunicationPlaybooks[0];
    const execution: PlaybookExecution = {
      id: 'exec-001',
      tenant: { tenant_id: 'tenant-001', tenant_name: 'Test' },
      created_at: '2026-01-16T08:00:00.000Z',
      updated_at: '2026-01-16T08:00:00.000Z',
      source: { connector_id: 'test', import_run_id: 'test', source_system: 'test', source_timestamp: '2026-01-16T08:00:00.000Z' },
      executionId: 'exec-001',
      playbookId: playbook.playbookId,
      case_id: 'case-001',
      tenant_id: 'tenant-001',
      currentStep: 1,
      stepStatuses: [
        { stepNumber: 1, status: 'executed', executedAt: '2026-01-16T08:00:00.000Z', reason: null },
        { stepNumber: 2, status: 'pending', executedAt: null, reason: null },
        { stepNumber: 3, status: 'pending', executedAt: null, reason: null },
        { stepNumber: 4, status: 'pending', executedAt: null, reason: null },
      ],
      startedAt: '2026-01-16T08:00:00.000Z',
      completed_at: null,
      status: 'running',
    };

    const context: PlaybookConditionContext = {
      case: { case_type: 'vulnerability' },
      stepStatuses: execution.stepStatuses,
      timestamps: { 1: '2026-01-16T08:00:00.000Z' },
    };

    const result = computeNextStep(execution, playbook, context);
    expect(result.nextStepNumber).toBe(2);
    expect(result.action?.action).toBe('send_remediation_request');
  });

  it('advances execution after step success', () => {
    const execution: PlaybookExecution = {
      id: 'exec-001',
      tenant: { tenant_id: 'tenant-001', tenant_name: 'Test' },
      created_at: '2026-01-16T08:00:00.000Z',
      updated_at: '2026-01-16T08:00:00.000Z',
      source: { connector_id: 'test', import_run_id: 'test', source_system: 'test', source_timestamp: '2026-01-16T08:00:00.000Z' },
      executionId: 'exec-001',
      playbookId: 'pb-001',
      case_id: 'case-001',
      tenant_id: 'tenant-001',
      currentStep: 0,
      stepStatuses: [
        { stepNumber: 1, status: 'pending', executedAt: null, reason: null },
        { stepNumber: 2, status: 'pending', executedAt: null, reason: null },
      ],
      startedAt: '2026-01-16T08:00:00.000Z',
      completed_at: null,
      status: 'running',
    };

    const advanced = advanceExecution(execution, { stepNumber: 1, success: true });
    expect(advanced.currentStep).toBe(1);
    expect(advanced.stepStatuses[0].status).toBe('executed');
    expect(advanced.status).toBe('running'); // step 2 still pending
  });

  it('aborts execution after step failure', () => {
    const execution: PlaybookExecution = {
      id: 'exec-001',
      tenant: { tenant_id: 'tenant-001', tenant_name: 'Test' },
      created_at: '2026-01-16T08:00:00.000Z',
      updated_at: '2026-01-16T08:00:00.000Z',
      source: { connector_id: 'test', import_run_id: 'test', source_system: 'test', source_timestamp: '2026-01-16T08:00:00.000Z' },
      executionId: 'exec-001',
      playbookId: 'pb-001',
      case_id: 'case-001',
      tenant_id: 'tenant-001',
      currentStep: 0,
      stepStatuses: [
        { stepNumber: 1, status: 'pending', executedAt: null, reason: null },
      ],
      startedAt: '2026-01-16T08:00:00.000Z',
      completed_at: null,
      status: 'running',
    };

    const advanced = advanceExecution(execution, { stepNumber: 1, success: false, failureReason: 'Email delivery failed' });
    expect(advanced.status).toBe('aborted');
    expect(advanced.stepStatuses[0].status).toBe('failed');
    expect(advanced.completed_at).not.toBeNull();
  });
});
