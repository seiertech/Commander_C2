import { describe, it, expect } from 'vitest';
import {
  validateFinding,
  FINDING_STATUSES,
  type Finding,
} from '../../packages/contracts/src/entities/finding';
import {
  validateRiskScore,
  type RiskScore,
} from '../../packages/contracts/src/entities/risk-scoring-engine';
import {
  validateBlastRadius,
  type BlastRadius,
} from '../../packages/contracts/src/entities/blast-radius-engine';
import { seedFindings } from '../../packages/contracts/src/fixtures/seed-findings';
import { seedRiskScores } from '../../packages/contracts/src/fixtures/seed-risk-scores';
import { seedBlastRadius } from '../../packages/contracts/src/fixtures/seed-blast-radius';
import {
  validateRuleSchema,
  checkOperatorWhitelist,
  rejectCodeExecution,
  validateTenantScope,
  validateRule,
  type RuleSpec,
} from '../../packages/contracts/src/engines/rule-validation-engine';
import {
  buildTenantContext,
  guardActiveOnly,
  emitFinding,
  executeRule,
  type EvaluableEntity,
} from '../../packages/contracts/src/engines/rule-execution-engine';
import {
  checkDedupeKey,
  deduplicateFinding,
  suppressByRule,
} from '../../packages/contracts/src/engines/suppression-engine';
import { SEED_TENANT, SEED_SOURCE } from '../../packages/contracts/src/fixtures/seed-tenant';
import type { RuleDefinition } from '../../packages/contracts/src/entities/platform-management';

/**
 * Spec #34 — Drift and Rule Engine
 *
 * Covers finding/risk-score/blast-radius entity validation, fixture
 * conformance, and the three engines (validation, execution, suppression).
 */

// ─── Fixture Conformance ─────────────────────────────────────────────────────

describe('Spec 34 — fixture conformance', () => {
  it('seedFindings has 5 records, all valid', () => {
    expect(seedFindings).toHaveLength(5);
    for (const f of seedFindings) {
      expect(validateFinding(f).valid).toBe(true);
    }
  });

  it('seedRiskScores has 4 records, all valid', () => {
    expect(seedRiskScores).toHaveLength(4);
    for (const s of seedRiskScores) {
      expect(validateRiskScore(s).valid).toBe(true);
    }
  });

  it('seedBlastRadius has 3 records, all valid', () => {
    expect(seedBlastRadius).toHaveLength(3);
    for (const b of seedBlastRadius) {
      expect(validateBlastRadius(b).valid).toBe(true);
    }
  });

  it('seed findings cover the full lifecycle', () => {
    const statuses = new Set(seedFindings.map((f) => f.status));
    for (const s of FINDING_STATUSES) {
      expect(statuses.has(s)).toBe(true);
    }
  });
});

// ─── Entity Validation ───────────────────────────────────────────────────────

describe('Spec 34 — validateFinding', () => {
  const base = seedFindings[0];

  it('rejects severity outside 1–5', () => {
    const bad: Finding = { ...base, severity: 9 };
    expect(validateFinding(bad).valid).toBe(false);
  });

  it('rejects confidence outside 0–100', () => {
    const bad: Finding = { ...base, confidence: 150 };
    expect(validateFinding(bad).valid).toBe(false);
  });

  it('requires a suppressionReason when status is suppressed', () => {
    const bad: Finding = { ...base, status: 'suppressed', suppressionReason: undefined };
    const res = validateFinding(bad);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('suppressionReason'))).toBe(true);
  });
});

describe('Spec 34 — validateRiskScore', () => {
  it('rejects total factor contribution above 100', () => {
    const bad: RiskScore = {
      ...seedRiskScores[0],
      factors: [
        { factorId: 'a', name: 'A', weight: 0.5, contribution: 70, rationale: 'x' },
        { factorId: 'b', name: 'B', weight: 0.5, contribution: 60, rationale: 'y' },
      ],
    };
    expect(validateRiskScore(bad).valid).toBe(false);
  });
});

describe('Spec 34 — validateBlastRadius', () => {
  it('rejects totalImpactScore outside 0–100', () => {
    const bad: BlastRadius = { ...seedBlastRadius[0], total_impact_score: 120 };
    expect(validateBlastRadius(bad).valid).toBe(false);
  });
});

// ─── Rule Validation Engine ──────────────────────────────────────────────────

const validSpec: RuleSpec = {
  name: 'MFA drift',
  rule_type: 'drift',
  tenantScope: 'tenant-001-acme-corp',
  severity: 5,
  conditions: [{ field: 'identity.mfaEnabled', operator: 'eq', value: false }],
  actions: ['create-case'],
};

describe('Spec 34 — rule validation engine', () => {
  it('validateRuleSchema passes a well-formed rule', () => {
    expect(validateRuleSchema(validSpec).valid).toBe(true);
  });

  it('validateRuleSchema rejects missing conditions', () => {
    expect(validateRuleSchema({ ...validSpec, conditions: [] }).valid).toBe(false);
  });

  it('checkOperatorWhitelist rejects a non-whitelisted operator', () => {
    const res = checkOperatorWhitelist({
      ...validSpec,
      conditions: [{ field: 'x', operator: 'regex_eval', value: '.*' }],
    });
    expect(res.valid).toBe(false);
  });

  it('rejectCodeExecution blocks embedded code', () => {
    const res = rejectCodeExecution({
      ...validSpec,
      conditions: [{ field: 'x', operator: 'matches', value: 'eval(process.exit(1))' }],
    });
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('validateTenantScope rejects empty scope', () => {
    expect(validateTenantScope({ ...validSpec, tenantScope: '' }).valid).toBe(false);
  });

  it('validateTenantScope warns on platform-wide "all"', () => {
    const res = validateTenantScope({ ...validSpec, tenantScope: 'all' });
    expect(res.valid).toBe(true);
    expect(res.warnings.length).toBeGreaterThan(0);
  });

  it('validateRule aggregates all stages', () => {
    expect(validateRule(validSpec).valid).toBe(true);
    expect(validateRule({ ...validSpec, tenantScope: '' }).valid).toBe(false);
  });
});

// ─── Rule Execution Engine ───────────────────────────────────────────────────

const activeRule: RuleDefinition = {
  id: 'rule-drift-mfa-001',
  entity_type: 'rule-definition',
  tenant: SEED_TENANT,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  source: SEED_SOURCE,
  name: 'MFA drift',
  rule_type: 'drift',
  status: 'active',
  version: '1.0.0',
  domain: 'D-04',
  severity: 5,
  origin: 'platform',
  last_triggered_at: null,
  trigger_count: 0,
  description: 'MFA disabled on privileged identity',
};

const entities: EvaluableEntity[] = [
  { entity_ref: 'identity-1', entity_type: 'identity', attributes: { tenant_id: SEED_TENANT.tenant_id, mfaEnabled: false } },
  { entity_ref: 'identity-2', entity_type: 'identity', attributes: { tenant_id: SEED_TENANT.tenant_id, mfaEnabled: true } },
  { entity_ref: 'identity-x', entity_type: 'identity', attributes: { tenant_id: 'other-tenant', mfaEnabled: false } },
];

describe('Spec 34 — rule execution engine', () => {
  it('guardActiveOnly only permits active rules', () => {
    expect(guardActiveOnly(activeRule)).toBe(true);
    expect(guardActiveOnly({ ...activeRule, status: 'draft' })).toBe(false);
  });

  it('buildTenantContext filters cross-tenant entities', () => {
    const ctx = buildTenantContext(SEED_TENANT, entities, SEED_SOURCE, '2026-02-01T00:00:00.000Z');
    expect(ctx.entities).toHaveLength(2);
    expect(ctx.entities.every((e) => e.attributes.tenant_id === SEED_TENANT.tenant_id)).toBe(true);
  });

  it('executeRule emits findings for matched entities only', () => {
    const ctx = buildTenantContext(SEED_TENANT, entities, SEED_SOURCE, '2026-02-01T00:00:00.000Z');
    const res = executeRule(activeRule, ctx, (e) => e.attributes.mfaEnabled === false);
    expect(res.executed).toBe(true);
    expect(res.findings).toHaveLength(1);
    expect(res.findings[0].affected_entity_ref).toBe('identity-1');
    expect(validateFinding(res.findings[0]).valid).toBe(true);
  });

  it('executeRule does not run inactive rules', () => {
    const ctx = buildTenantContext(SEED_TENANT, entities, SEED_SOURCE, '2026-02-01T00:00:00.000Z');
    const res = executeRule({ ...activeRule, status: 'disabled' }, ctx, () => true);
    expect(res.executed).toBe(false);
    expect(res.findings).toHaveLength(0);
  });

  it('emitFinding produces a deterministic dedupeKey', () => {
    const ctx = buildTenantContext(SEED_TENANT, entities, SEED_SOURCE, '2026-02-01T00:00:00.000Z');
    const f = emitFinding(activeRule, entities[0], ctx);
    expect(f.dedupe_key).toBe('drift:rule-drift-mfa-001:identity-1');
  });
});

// ─── Suppression Engine ──────────────────────────────────────────────────────

describe('Spec 34 — suppression engine', () => {
  const a: Finding = { ...seedFindings[0], id: 'a', status: 'new', dedupe_key: 'k1', tenant_id: SEED_TENANT.tenant_id };
  const b: Finding = { ...seedFindings[0], id: 'b', status: 'new', dedupe_key: 'k1', tenant_id: SEED_TENANT.tenant_id };

  it('checkDedupeKey detects an existing active duplicate', () => {
    expect(checkDedupeKey(b, [a])).toBe(true);
    expect(checkDedupeKey(b, [{ ...a, status: 'resolved' }])).toBe(false);
  });

  it('deduplicateFinding merges into the existing active finding', () => {
    const res = deduplicateFinding({ ...b, severity: 5 }, [{ ...a, severity: 2 }]);
    expect(res.isDuplicate).toBe(true);
    expect(res.mergedInto).toBe('a');
    expect(res.finding.severity).toBe(5);
  });

  it('deduplicateFinding keeps a unique finding', () => {
    const res = deduplicateFinding({ ...b, dedupe_key: 'k2' }, [a]);
    expect(res.isDuplicate).toBe(false);
    expect(res.mergedInto).toBeNull();
  });

  it('suppressByRule suppresses on a matching rule ref', () => {
    const res = suppressByRule(a, [{ matchRuleRef: a.rule_ref, reason: 'maintenance window' }]);
    expect(res.status).toBe('suppressed');
    expect(res.suppressionReason).toBe('maintenance window');
  });

  it('suppressByRule leaves resolved findings untouched', () => {
    const resolved: Finding = { ...a, status: 'resolved' };
    const res = suppressByRule(resolved, [{ matchRuleRef: a.rule_ref, reason: 'x' }]);
    expect(res.status).toBe('resolved');
  });
});
