/**
 * Unit Tests — Entity Validators (Communications Excellence)
 *
 * Feature: communications-excellence
 * Tests: all 7 new entity validators for structural correctness
 */

import { describe, it, expect } from 'vitest';
import { validateCaseCommunicationThread } from '../../packages/contracts/src/entities/case-communication-thread';
import { validateCommunicationPlaybook } from '../../packages/contracts/src/entities/communication-playbook';
import { validatePlaybookExecution } from '../../packages/contracts/src/entities/playbook-execution';
import { validateDetonationVerdict } from '../../packages/contracts/src/entities/detonation-verdict';
import { validatePhishingReport } from '../../packages/contracts/src/entities/phishing-report';
import { validateStixBundleIngest } from '../../packages/contracts/src/entities/stix-bundle-ingest';
import { validateTeamsDecisionEvent } from '../../packages/contracts/src/entities/teams-decision-event';
import { seedCommunicationThreads } from '../../packages/contracts/src/fixtures/seed-communication-threads';
import { seedCommunicationPlaybooks } from '../../packages/contracts/src/fixtures/seed-communication-playbooks';
import { seedDetonationVerdicts } from '../../packages/contracts/src/fixtures/seed-detonation-verdicts';
import { seedPhishingReports } from '../../packages/contracts/src/fixtures/seed-phishing-reports';
import { seedStixBundleIngests } from '../../packages/contracts/src/fixtures/seed-stix-bundles';
import { seedTeamsDecisionEvents } from '../../packages/contracts/src/fixtures/seed-teams-decision-events';

describe('Entity Validators — CaseCommunicationThread', () => {
  it('validates all seed threads as valid', () => {
    for (const thread of seedCommunicationThreads) {
      const result = validateCaseCommunicationThread(thread);
      expect(result.valid, `Thread ${thread.id} should be valid: ${result.errors.join(', ')}`).toBe(true);
    }
  });

  it('rejects thread with missing tenantId', () => {
    const invalid = { ...seedCommunicationThreads[0], tenantId: '' };
    const result = validateCaseCommunicationThread(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('tenantId'))).toBe(true);
  });

  it('rejects thread with invalid channel', () => {
    const invalid = { ...seedCommunicationThreads[0], channel: 'sms' as any };
    const result = validateCaseCommunicationThread(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('channel'))).toBe(true);
  });

  it('rejects thread with negative messageCount', () => {
    const invalid = { ...seedCommunicationThreads[0], messageCount: -1 };
    const result = validateCaseCommunicationThread(invalid);
    expect(result.valid).toBe(false);
  });
});

describe('Entity Validators — CommunicationPlaybook', () => {
  it('validates all seed playbooks as valid', () => {
    for (const playbook of seedCommunicationPlaybooks) {
      const result = validateCommunicationPlaybook(playbook);
      expect(result.valid, `Playbook ${playbook.id} should be valid: ${result.errors.join(', ')}`).toBe(true);
    }
  });

  it('rejects playbook with empty steps', () => {
    const invalid = { ...seedCommunicationPlaybooks[0], steps: [] };
    const result = validateCommunicationPlaybook(invalid);
    expect(result.valid).toBe(false);
  });

  it('rejects playbook with invalid step action', () => {
    const invalid = {
      ...seedCommunicationPlaybooks[0],
      steps: [{ ...seedCommunicationPlaybooks[0].steps[0], action: 'invalid_action' as any }],
    };
    const result = validateCommunicationPlaybook(invalid);
    expect(result.valid).toBe(false);
  });

  it('rejects playbook with invalid condition grammar', () => {
    const invalid = {
      ...seedCommunicationPlaybooks[0],
      steps: [{ ...seedCommunicationPlaybooks[0].steps[0], condition: 'SELECT * FROM cases' }],
    };
    const result = validateCommunicationPlaybook(invalid);
    expect(result.valid).toBe(false);
  });
});

describe('Entity Validators — PlaybookExecution', () => {
  it('validates a well-formed execution', () => {
    const execution = {
      id: 'exec-001',
      tenant: { tenantId: 'tenant-001', tenantName: 'Test' },
      createdAt: '2026-01-16T08:00:00.000Z',
      updatedAt: '2026-01-16T08:00:00.000Z',
      source: { connectorId: 'test', importRunId: 'test', sourceSystem: 'test', sourceTimestamp: '2026-01-16T08:00:00.000Z' },
      executionId: 'exec-001',
      playbookId: 'pb-001',
      caseId: 'case-001',
      tenantId: 'tenant-001',
      currentStep: 1,
      stepStatuses: [{ stepNumber: 1, status: 'executed' as const, executedAt: '2026-01-16T08:00:00.000Z', reason: null }],
      startedAt: '2026-01-16T08:00:00.000Z',
      completedAt: null,
      status: 'running' as const,
    };
    const result = validatePlaybookExecution(execution);
    expect(result.valid).toBe(true);
  });

  it('rejects execution with invalid status', () => {
    const invalid = {
      id: 'exec-001',
      tenant: { tenantId: 'tenant-001', tenantName: 'Test' },
      createdAt: '2026-01-16T08:00:00.000Z',
      updatedAt: '2026-01-16T08:00:00.000Z',
      source: { connectorId: 'test', importRunId: 'test', sourceSystem: 'test', sourceTimestamp: '2026-01-16T08:00:00.000Z' },
      executionId: 'exec-001',
      playbookId: 'pb-001',
      caseId: 'case-001',
      tenantId: 'tenant-001',
      currentStep: 1,
      stepStatuses: [],
      startedAt: '2026-01-16T08:00:00.000Z',
      completedAt: null,
      status: 'invalid' as any,
    };
    const result = validatePlaybookExecution(invalid);
    expect(result.valid).toBe(false);
  });
});

describe('Entity Validators — DetonationVerdict', () => {
  it('validates all seed verdicts as valid', () => {
    for (const verdict of seedDetonationVerdicts) {
      const result = validateDetonationVerdict(verdict);
      expect(result.valid, `Verdict ${verdict.id} should be valid: ${result.errors.join(', ')}`).toBe(true);
    }
  });

  it('rejects verdict with invalid overallVerdict', () => {
    const invalid = { ...seedDetonationVerdicts[0], overallVerdict: 'unknown' as any };
    const result = validateDetonationVerdict(invalid);
    expect(result.valid).toBe(false);
  });

  it('rejects verdict with check confidence out of range', () => {
    const invalid = {
      ...seedDetonationVerdicts[0],
      checks: [{ checkType: 'url_detonation' as const, result: 'pass' as const, confidence: 150, detail: 'test' }],
    };
    const result = validateDetonationVerdict(invalid);
    expect(result.valid).toBe(false);
  });
});

describe('Entity Validators — PhishingReport', () => {
  it('validates all seed reports as valid', () => {
    for (const report of seedPhishingReports) {
      const result = validatePhishingReport(report);
      expect(result.valid, `Report ${report.id} should be valid: ${result.errors.join(', ')}`).toBe(true);
    }
  });

  it('rejects report with missing reportedBy', () => {
    const invalid = { ...seedPhishingReports[0], reportedBy: '' };
    const result = validatePhishingReport(invalid);
    expect(result.valid).toBe(false);
  });
});

describe('Entity Validators — StixBundleIngest', () => {
  it('validates all seed ingests as valid', () => {
    for (const ingest of seedStixBundleIngests) {
      const result = validateStixBundleIngest(ingest);
      expect(result.valid, `Ingest ${ingest.id} should be valid: ${result.errors.join(', ')}`).toBe(true);
    }
  });

  it('rejects ingest with relevanceScore > 100', () => {
    const invalid = { ...seedStixBundleIngests[0], relevanceScore: 150 };
    const result = validateStixBundleIngest(invalid);
    expect(result.valid).toBe(false);
  });

  it('rejects ingest with unknown object type', () => {
    const invalid = { ...seedStixBundleIngests[0], objectTypes: ['unknown_type' as any] };
    const result = validateStixBundleIngest(invalid);
    expect(result.valid).toBe(false);
  });
});

describe('Entity Validators — TeamsDecisionEvent', () => {
  it('validates all seed events as valid', () => {
    for (const event of seedTeamsDecisionEvents) {
      const result = validateTeamsDecisionEvent(event);
      expect(result.valid, `Event ${event.id} should be valid: ${result.errors.join(', ')}`).toBe(true);
    }
  });

  it('rejects event with invalid requestType', () => {
    const invalid = { ...seedTeamsDecisionEvents[0], requestType: 'invalid' as any };
    const result = validateTeamsDecisionEvent(invalid);
    expect(result.valid).toBe(false);
  });

  it('rejects event with non-boolean validatedByCommander', () => {
    const invalid = { ...seedTeamsDecisionEvents[0], validatedByCommander: 'yes' as any };
    const result = validateTeamsDecisionEvent(invalid);
    expect(result.valid).toBe(false);
  });
});
