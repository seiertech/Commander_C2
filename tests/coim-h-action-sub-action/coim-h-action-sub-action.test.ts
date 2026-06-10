import { describe, it, expect } from 'vitest';
import type { Action, SubAction } from '../../packages/contracts/src/entities/action';
import {
  ACTION_STATUSES,
  OUTCOME_CLASSIFICATIONS,
  D3FEND_TACTIC_TYPES,
  MAX_COUNTERMEASURES,
  validateAction,
  validateSubAction,
} from '../../packages/contracts/src/entities/action';
import { seedActions, seedSubActions } from '../../packages/contracts/src/fixtures/seed-actions';

/**
 * COIM-H: Action/Sub-Action + D3FEND
 *
 * Source: COIM v1.0 §4.3, §6 (Action/Sub-Action impact);
 *         03_REUSABLE_OBJECT_CATALOGUE §2.3; Spec #08 Case Management.
 * Resolves: ARCH-DEBT-044 (entity absence), ARCH-DEBT-046 (D3FEND gap).
 *
 * Validates:
 * - Action entity contract shape and required fields
 * - Sub-Action entity contract shape with D3FEND fields
 * - Validation functions reject invalid data
 * - Seed fixtures conform to contract types
 * - D3FEND tactic types are bounded and correct
 * - Countermeasures array respects MAX_COUNTERMEASURES bound
 * - Existing case lifecycle logic is NOT modified (additive-only check)
 *
 * ADDITIVE ONLY — no existing entities removed or changed.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const baseAction = (overrides: Partial<Action> = {}): Action => ({
  id: 'action-test-001',
  entityType: 'action',
  tenant: { tenantId: 'tenant-001-acme-corp', tenantName: 'Acme Corp' },
  createdAt: '2026-01-18T07:00:00.000Z',
  updatedAt: '2026-01-18T07:00:00.000Z',
  source: {
    connectorId: 'conn-test',
    importRunId: 'run-test',
    sourceSystem: 'commander-test',
    sourceTimestamp: '2026-01-18T07:00:00.000Z',
  },
  caseId: 'case-0001',
  title: 'Test Action',
  description: 'Test action description',
  estimatedEffortHours: 4,
  actualEffortHours: 2,
  status: 'planned',
  approvalRef: 'approval-test-001',
  owner: 'test-team',
  ...overrides,
});

const baseSubAction = (overrides: Partial<SubAction> = {}): SubAction => ({
  id: 'sub-action-test-001',
  entityType: 'sub_action',
  tenant: { tenantId: 'tenant-001-acme-corp', tenantName: 'Acme Corp' },
  createdAt: '2026-01-18T07:05:00.000Z',
  updatedAt: '2026-01-18T07:05:00.000Z',
  source: {
    connectorId: 'conn-test',
    importRunId: 'run-test',
    sourceSystem: 'commander-test',
    sourceTimestamp: '2026-01-18T07:05:00.000Z',
  },
  actionId: 'action-test-001',
  caseId: 'case-0001',
  targetEntity: 'asset-0001',
  targetEntityType: 'asset',
  executionMethod: 'network-isolation',
  outcomeClassification: 'pending',
  estimatedEffortHours: 2,
  actualEffortHours: 0,
  approvalRef: 'approval-test-001-sub1',
  owner: 'test-team',
  sequenceOrder: 1,
  tacticType: 'isolate',
  countermeasures: [
    { techniqueId: 'D3-NI', techniqueName: 'Network Isolation' },
  ],
  ...overrides,
});

// ─── Type-Level Conformance ───────────────────────────────────────────────────

describe('COIM-H: Action/Sub-Action Entity Contract', () => {
  describe('Action type shape', () => {
    it('has all required COIM-H fields', () => {
      const action = baseAction();
      expect(action.entityType).toBe('action');
      expect(action.caseId).toBeDefined();
      expect(action.title).toBeDefined();
      expect(action.description).toBeDefined();
      expect(action.estimatedEffortHours).toBeTypeOf('number');
      expect(action.actualEffortHours).toBeTypeOf('number');
      expect(action.status).toBeDefined();
      expect(action.approvalRef).toBeDefined();
      expect(action.owner).toBeDefined();
    });

    it('extends CommonFields (tenant, timestamps, source)', () => {
      const action = baseAction();
      expect(action.id).toBeDefined();
      expect(action.tenant.tenantId).toBeDefined();
      expect(action.tenant.tenantName).toBeDefined();
      expect(action.createdAt).toBeDefined();
      expect(action.updatedAt).toBeDefined();
      expect(action.source.connectorId).toBeDefined();
      expect(action.source.importRunId).toBeDefined();
      expect(action.source.sourceSystem).toBeDefined();
      expect(action.source.sourceTimestamp).toBeDefined();
    });

    it('defines four action statuses', () => {
      expect(ACTION_STATUSES).toEqual(['planned', 'in_progress', 'completed', 'cancelled']);
      expect(ACTION_STATUSES).toHaveLength(4);
    });
  });

  describe('Sub-Action type shape', () => {
    it('has all required COIM-H fields including D3FEND', () => {
      const sub = baseSubAction();
      expect(sub.entityType).toBe('sub_action');
      expect(sub.actionId).toBeDefined();
      expect(sub.caseId).toBeDefined();
      expect(sub.targetEntity).toBeDefined();
      expect(sub.targetEntityType).toBeDefined();
      expect(sub.executionMethod).toBeDefined();
      expect(sub.outcomeClassification).toBeDefined();
      expect(sub.estimatedEffortHours).toBeTypeOf('number');
      expect(sub.actualEffortHours).toBeTypeOf('number');
      expect(sub.approvalRef).toBeDefined();
      expect(sub.owner).toBeDefined();
      expect(sub.sequenceOrder).toBeTypeOf('number');
      // D3FEND fields (ARCH-DEBT-046)
      expect(sub.tacticType).toBeDefined();
      expect(sub.countermeasures).toBeDefined();
      expect(Array.isArray(sub.countermeasures)).toBe(true);
    });

    it('D3FEND tactic types are five canonical values', () => {
      expect(D3FEND_TACTIC_TYPES).toEqual(['isolate', 'evict', 'restore', 'harden', 'detect']);
      expect(D3FEND_TACTIC_TYPES).toHaveLength(5);
    });

    it('outcome classifications cover five states', () => {
      expect(OUTCOME_CLASSIFICATIONS).toEqual(['successful', 'partial', 'failed', 'cancelled', 'pending']);
      expect(OUTCOME_CLASSIFICATIONS).toHaveLength(5);
    });

    it('countermeasures are bounded at MAX_COUNTERMEASURES = 10', () => {
      expect(MAX_COUNTERMEASURES).toBe(10);
    });
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe('COIM-H: Action Validation', () => {
  it('validates a well-formed action', () => {
    const result = validateAction(baseAction());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects missing caseId', () => {
    const result = validateAction(baseAction({ caseId: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('caseId is required.');
  });

  it('rejects missing title', () => {
    const result = validateAction(baseAction({ title: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('title is required.');
  });

  it('rejects negative estimatedEffortHours', () => {
    const result = validateAction(baseAction({ estimatedEffortHours: -1 }));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('estimatedEffortHours must be >= 0');
  });

  it('rejects negative actualEffortHours', () => {
    const result = validateAction(baseAction({ actualEffortHours: -5 }));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('actualEffortHours must be >= 0');
  });

  it('rejects invalid action status', () => {
    const result = validateAction(baseAction({ status: 'invalid' as any }));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Invalid action status');
  });
});

describe('COIM-H: Sub-Action Validation', () => {
  it('validates a well-formed sub-action', () => {
    const result = validateSubAction(baseSubAction());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects missing actionId', () => {
    const result = validateSubAction(baseSubAction({ actionId: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('actionId is required.');
  });

  it('rejects missing caseId', () => {
    const result = validateSubAction(baseSubAction({ caseId: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('caseId is required.');
  });

  it('rejects missing targetEntity', () => {
    const result = validateSubAction(baseSubAction({ targetEntity: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('targetEntity is required.');
  });

  it('rejects missing executionMethod', () => {
    const result = validateSubAction(baseSubAction({ executionMethod: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('executionMethod is required.');
  });

  it('rejects invalid outcomeClassification', () => {
    const result = validateSubAction(baseSubAction({ outcomeClassification: 'invalid' as any }));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Invalid outcomeClassification');
  });

  it('rejects negative estimatedEffortHours', () => {
    const result = validateSubAction(baseSubAction({ estimatedEffortHours: -1 }));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('estimatedEffortHours must be >= 0');
  });

  it('rejects negative actualEffortHours', () => {
    const result = validateSubAction(baseSubAction({ actualEffortHours: -2 }));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('actualEffortHours must be >= 0');
  });

  it('rejects invalid D3FEND tacticType', () => {
    const result = validateSubAction(baseSubAction({ tacticType: 'invalid' as any }));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Invalid D3FEND tacticType');
  });

  it('rejects countermeasures exceeding MAX_COUNTERMEASURES', () => {
    const overflowed = Array.from({ length: 11 }, (_, i) => ({
      techniqueId: `D3-${i}`,
      techniqueName: `Technique ${i}`,
    }));
    const result = validateSubAction(baseSubAction({ countermeasures: overflowed }));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('countermeasures[] exceeds max 10');
  });

  it('rejects countermeasure with empty techniqueId', () => {
    const result = validateSubAction(baseSubAction({
      countermeasures: [{ techniqueId: '', techniqueName: 'Valid Name' }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('countermeasure.techniqueId is required.');
  });

  it('rejects countermeasure with empty techniqueName', () => {
    const result = validateSubAction(baseSubAction({
      countermeasures: [{ techniqueId: 'D3-NI', techniqueName: '' }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('countermeasure.techniqueName is required.');
  });
});

// ─── Seed Fixture Conformance ─────────────────────────────────────────────────

describe('COIM-H: Seed Fixture Conformance', () => {
  it('seed actions are valid', () => {
    expect(seedActions).toHaveLength(3);
    for (const action of seedActions) {
      const result = validateAction(action);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it('seed sub-actions are valid', () => {
    expect(seedSubActions).toHaveLength(5);
    for (const sub of seedSubActions) {
      const result = validateSubAction(sub);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it('all seed actions are bound to case-0001', () => {
    for (const action of seedActions) {
      expect(action.caseId).toBe('case-0001');
    }
  });

  it('all seed sub-actions reference valid parent action IDs', () => {
    const actionIds = new Set(seedActions.map(a => a.id));
    for (const sub of seedSubActions) {
      expect(actionIds.has(sub.actionId)).toBe(true);
    }
  });

  it('seed sub-actions cover all five D3FEND tactic types', () => {
    const tactics = new Set(seedSubActions.map(s => s.tacticType));
    expect(tactics.size).toBe(5);
    for (const t of D3FEND_TACTIC_TYPES) {
      expect(tactics.has(t)).toBe(true);
    }
  });

  it('no seed sub-action exceeds MAX_COUNTERMEASURES', () => {
    for (const sub of seedSubActions) {
      expect(sub.countermeasures.length).toBeLessThanOrEqual(MAX_COUNTERMEASURES);
    }
  });

  it('all seed sub-actions have well-formed countermeasures', () => {
    for (const sub of seedSubActions) {
      for (const cm of sub.countermeasures) {
        expect(cm.techniqueId).toBeTruthy();
        expect(cm.techniqueName).toBeTruthy();
      }
    }
  });

  it('seed actions have deterministic IDs', () => {
    expect(seedActions[0].id).toBe('action-0001');
    expect(seedActions[1].id).toBe('action-0002');
    expect(seedActions[2].id).toBe('action-0003');
  });

  it('seed sub-actions have deterministic IDs', () => {
    expect(seedSubActions[0].id).toBe('sub-action-0001');
    expect(seedSubActions[1].id).toBe('sub-action-0002');
    expect(seedSubActions[2].id).toBe('sub-action-0003');
    expect(seedSubActions[3].id).toBe('sub-action-0004');
    expect(seedSubActions[4].id).toBe('sub-action-0005');
  });

  it('seed actions have varied statuses', () => {
    const statuses = seedActions.map(a => a.status);
    expect(statuses).toContain('completed');
    expect(statuses).toContain('in_progress');
    expect(statuses).toContain('planned');
  });

  it('seed sub-actions have varied outcome classifications', () => {
    const outcomes = seedSubActions.map(s => s.outcomeClassification);
    expect(outcomes).toContain('successful');
    expect(outcomes).toContain('partial');
    expect(outcomes).toContain('pending');
  });
});

// ─── Additive-Only Gate ───────────────────────────────────────────────────────

describe('COIM-H: Additive-Only Gate', () => {
  it('does not modify case-lifecycle.ts exports', async () => {
    // Import case-lifecycle to confirm all existing exports still work
    const lifecycle = await import('../../packages/contracts/src/entities/case-lifecycle');
    expect(lifecycle.ALLOWED_TRANSITIONS).toBeDefined();
    expect(lifecycle.isTransitionAllowed).toBeTypeOf('function');
    expect(lifecycle.executeTransition).toBeTypeOf('function');
    expect(lifecycle.LIFECYCLE_ACTORS).toBeDefined();
  });

  it('case entity still has action_decomposed in its lifecycle', async () => {
    const { LEGACY_STATUS_MAP } = await import('../../packages/contracts/src/entities/case');
    // action_decomposed is in the CaseStatus type — verify via lifecycle transitions
    const { ALLOWED_TRANSITIONS } = await import('../../packages/contracts/src/entities/case-lifecycle');
    const fromActionDecomposed = ALLOWED_TRANSITIONS.filter(t => t.from === 'action_decomposed');
    expect(fromActionDecomposed.length).toBeGreaterThan(0);
  });
});
