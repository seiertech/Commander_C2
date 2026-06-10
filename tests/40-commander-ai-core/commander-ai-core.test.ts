import { describe, it, expect } from 'vitest';
import {
  groundReferences,
  checkRefusal,
  REFUSAL_REASONS,
  draftCaseSummary,
  explainCaseRouting,
  summarizeRiskTreatment,
  navigateToEntity,
  logAiExecution,
  type GroundingCorpus,
} from '../../packages/contracts/src/engines/commander-ai-core';
import { seedCases } from '../../packages/contracts/src/fixtures/seed-cases';
import { seedRiskObjects } from '../../packages/contracts/src/fixtures/seed-risk-objects';
import { seedAssets } from '../../packages/contracts/src/fixtures/seed-assets';
import { seedIdentities } from '../../packages/contracts/src/fixtures/seed-identities';
import { SEED_TENANT } from '../../packages/contracts/src/fixtures/seed-tenant';

/**
 * Unit 40 — Commander AI Core (Grounding & Refusal)
 *
 * Source: Spec #13 Commander AI Architecture and Grounding Rules; ai-grounding steering.
 *
 * Validates: grounding, refusal framework (no estate-fact invention, no external
 * writes, no approval bypass, no authority override), drafting, explanation,
 * summarization, navigation, and execution logging — all deterministic, no live model.
 */

const corpus: GroundingCorpus = {
  cases: seedCases,
  riskObjects: seedRiskObjects,
  assets: seedAssets,
  identities: seedIdentities,
};

const AT = '2026-06-02T00:00:00.000Z';

// ─── 1. Grounding ─────────────────────────────────────────────────────────────

describe('Unit 40 — Grounding framework', () => {
  it('grounds references that exist in Commander data', () => {
    const r = groundReferences([{ entity_type: 'case', entity_id: seedCases[0].id }], corpus);
    expect(r.grounded).toBe(true);
    expect(r.unresolved).toEqual([]);
  });

  it('fails to ground references that do not exist (no estate-fact invention)', () => {
    const r = groundReferences([{ entity_type: 'case', entity_id: 'case-DOES-NOT-EXIST' }], corpus);
    expect(r.grounded).toBe(false);
    expect(r.unresolved).toHaveLength(1);
  });
});

// ─── 2. Refusal framework ──────────────────────────────────────────────────────

describe('Unit 40 — Refusal framework', () => {
  it('enumerates exactly four refusal reasons', () => {
    expect(REFUSAL_REASONS).toEqual([
      'ungrounded-estate-fact', 'external-write', 'approval-bypass', 'authority-override',
    ]);
  });

  it('refuses external writes', () => {
    const c = checkRefusal({ intent: 'execute-external' }, corpus);
    expect(c.allowed).toBe(false);
    expect(c.reasons).toContain('external-write');
  });

  it('refuses approval-chain bypass', () => {
    const c = checkRefusal({ intent: 'bypass-approval' }, corpus);
    expect(c.allowed).toBe(false);
    expect(c.reasons).toContain('approval-bypass');
  });

  it('refuses baseline authority override', () => {
    const c = checkRefusal({ intent: 'override-authority' }, corpus);
    expect(c.allowed).toBe(false);
    expect(c.reasons).toContain('authority-override');
  });

  it('refuses read-only actions referencing ungrounded estate facts', () => {
    const c = checkRefusal(
      { intent: 'draft', references: [{ entity_type: 'case', entity_id: 'nope' }] },
      corpus,
    );
    expect(c.allowed).toBe(false);
    expect(c.reasons).toContain('ungrounded-estate-fact');
  });

  it('allows read-only actions fully grounded in Commander data', () => {
    const c = checkRefusal(
      { intent: 'explain', references: [{ entity_type: 'case', entity_id: seedCases[0].id }] },
      corpus,
    );
    expect(c.allowed).toBe(true);
    expect(c.reasons).toEqual([]);
  });
});

// ─── 3-6. Drafting / Explanation / Summarization / Navigation ─────────────────

describe('Unit 40 — Grounded capabilities', () => {
  it('drafts a case summary grounded in the real case', () => {
    const out = draftCaseSummary(seedCases[0].id, corpus);
    expect(out.refused).toBe(false);
    expect(out.text).toContain(seedCases[0].case_ref);
    expect(out.groundedIn).toEqual([{ entity_type: 'case', entity_id: seedCases[0].id }]);
  });

  it('refuses to draft a summary for a non-existent case', () => {
    const out = draftCaseSummary('case-9999', corpus);
    expect(out.refused).toBe(true);
    expect(out.refusalReasons).toContain('ungrounded-estate-fact');
    expect(out.text).toBe('');
  });

  it('explains case routing from the recorded rationale (not invented)', () => {
    const out = explainCaseRouting(seedCases[0].id, corpus);
    expect(out.refused).toBe(false);
    expect(out.text).toContain(seedCases[0].routingRationale);
  });

  it('summarizes risk-object treatment grounded in the real risk object', () => {
    const out = summarizeRiskTreatment(seedRiskObjects[0].id, corpus);
    expect(out.refused).toBe(false);
    expect(out.text).toContain(seedRiskObjects[0].type);
  });

  it('navigation only returns existing entities', () => {
    const out = navigateToEntity(seedAssets[0].name, corpus);
    expect(out.groundedIn.every((ref) =>
      seedAssets.some((a) => a.id === ref.entity_id) ||
      seedCases.some((c) => c.id === ref.entity_id) ||
      seedIdentities.some((i) => i.id === ref.entity_id),
    )).toBe(true);
  });

  it('navigation returns nothing for an unknown query (no invented targets)', () => {
    const out = navigateToEntity('zzz-nonexistent-zzz', corpus);
    expect(out.groundedIn).toEqual([]);
  });
});

// ─── 7. Execution logging ──────────────────────────────────────────────────────

describe('Unit 40 — Execution logging', () => {
  it('logs an AI output as an immutable commander-ai audit record', () => {
    const out = draftCaseSummary(seedCases[0].id, corpus);
    const audit = logAiExecution(out, SEED_TENANT, AT, 'audit-ai-001');
    expect(audit.entity_type).toBe('audit-event');
    expect(audit.actor.type).toBe('commander-ai');
    expect(audit.immutable).toBe(true);
    expect(audit.action).toBe('ai-draft');
  });

  it('logs refusals too (refused outputs are still execution records)', () => {
    const out = draftCaseSummary('case-9999', corpus);
    const audit = logAiExecution(out, SEED_TENANT, AT, 'audit-ai-002');
    expect(audit.action).toBe('ai-draft-refused');
    expect(audit.rationale).toContain('refused');
  });
});
