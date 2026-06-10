/**
 * Rule Execution Engine — Commander C2 (Spec 34)
 *
 * Source: Spec #34 Drift and Rule Engine
 *
 * Executes ACTIVE rules against a tenant-scoped execution context and emits
 * Findings for matched entities (UC-169). Doctrine:
 *   - Only active rules execute (guardActiveOnly).
 *   - Execution is tenant-scoped — a rule never evaluates outside its tenant
 *     context (v1.3 Req 7).
 *   - Findings are recommendations/observations; proposedActions are not
 *     executed here (SOC boundary, Assertion 8; AI/automation grounding).
 *
 * Pure functions — no I/O. The condition matcher is injected so the engine
 * stays free of a bespoke expression interpreter and remains testable.
 */

import type { TenantContext, SourceMetadata } from '../entities/common';
import type { RuleDefinition } from '../entities/platform-management';
import type { Finding, ProposedAction, AffectedEntityType } from '../entities/finding';

// ─── Evaluable Entity + Execution Context ────────────────────────────────────

export interface EvaluableEntity {
  /** Canonical reference to the entity */
  entity_ref: string;
  /** Kind of entity */
  entity_type: AffectedEntityType;
  /** Attributes the rule conditions evaluate against */
  attributes: Record<string, unknown>;
}

export interface TenantExecutionContext {
  /** Tenant the execution is scoped to */
  tenant_id: string;
  /** Full tenant context for emitted findings */
  tenant: TenantContext;
  /** Candidate entities within this tenant */
  entities: EvaluableEntity[];
  /** Provenance for emitted findings */
  source: SourceMetadata;
  /** Evaluation timestamp (used as detectedAt) */
  evaluated_at: string;
}

/** Predicate deciding whether a rule matches a given entity. */
export type RuleMatcher = (entity: EvaluableEntity, rule: RuleDefinition) => boolean;

export interface RuleExecutionResult {
  rule_ref: string;
  executed: boolean;
  reason: string;
  findings: Finding[];
}

// ─── buildTenantContext ──────────────────────────────────────────────────────

/**
 * Assemble a tenant-scoped execution context. Entities are filtered defensively
 * so callers cannot smuggle in cross-tenant data via attributes carrying a
 * different tenantId.
 */
export function buildTenantContext(
  tenant: TenantContext,
  entities: EvaluableEntity[],
  source: SourceMetadata,
  evaluated_at: string,
): TenantExecutionContext {
  const scoped = entities.filter((e) => {
    const t = e.attributes?.['tenantId'];
    return t === undefined || t === tenant.tenant_id;
  });
  return {
    tenant_id: tenant.tenant_id,
    tenant,
    entities: scoped,
    source,
    evaluated_at,
  };
}

// ─── guardActiveOnly ─────────────────────────────────────────────────────────

/**
 * Return true only when the rule is active and may execute. Draft, disabled and
 * deprecated rules never run.
 */
export function guardActiveOnly(rule: RuleDefinition): boolean {
  return rule.status === 'active';
}

// ─── emitFinding ─────────────────────────────────────────────────────────────

/**
 * Construct a Finding for a rule/entity match. Deterministic dedupe_key:
 *   drift:<ruleRef>:<entityRef>
 */
export function emitFinding(
  rule: RuleDefinition,
  entity: EvaluableEntity,
  ctx: TenantExecutionContext,
  options?: { confidence?: number; proposedActions?: ProposedAction[]; sequence?: number },
): Finding {
  const seq = options?.sequence ?? 1;
  return {
    id: `finding-${rule.id}-${entity.entity_ref}`,
    entity_type: 'finding',
    tenant: ctx.tenant,
    created_at: ctx.evaluated_at,
    updated_at: ctx.evaluated_at,
    source: ctx.source,
    finding_id: `find-${rule.id}-${String(seq).padStart(4, '0')}`,
    rule_ref: rule.id,
    tenant_id: ctx.tenant_id,
    severity: rule.severity,
    confidence: options?.confidence ?? 75,
    dedupe_key: `drift:${rule.id}:${entity.entity_ref}`,
    affected_entity_type: entity.entity_type,
    affected_entity_ref: entity.entity_ref,
    proposedActions: options?.proposedActions ?? [],
    status: 'new',
    detected_at: ctx.evaluated_at,
  };
}

// ─── executeRule ─────────────────────────────────────────────────────────────

/**
 * Execute a single rule against the tenant context. Returns the emitted
 * findings (one per matched entity). Inactive rules produce no findings.
 */
export function executeRule(
  rule: RuleDefinition,
  ctx: TenantExecutionContext,
  matcher: RuleMatcher,
  options?: { confidence?: number; proposedActions?: ProposedAction[] },
): RuleExecutionResult {
  if (!guardActiveOnly(rule)) {
    return {
      rule_ref: rule.id,
      executed: false,
      reason: `Rule is "${rule.status}" — only active rules execute.`,
      findings: [],
    };
  }

  const findings: Finding[] = [];
  let seq = 1;
  for (const entity of ctx.entities) {
    if (matcher(entity, rule)) {
      findings.push(emitFinding(rule, entity, ctx, { ...options, sequence: seq }));
      seq += 1;
    }
  }

  return {
    rule_ref: rule.id,
    executed: true,
    reason: `Executed against ${ctx.entities.length} entit${ctx.entities.length === 1 ? 'y' : 'ies'} — ${findings.length} match(es).`,
    findings,
  };
}

/**
 * Execute a batch of rules against the same context, returning per-rule results.
 */
export function executeRules(
  rules: RuleDefinition[],
  ctx: TenantExecutionContext,
  matcher: RuleMatcher,
  options?: { confidence?: number; proposedActions?: ProposedAction[] },
): RuleExecutionResult[] {
  return rules.map((rule) => executeRule(rule, ctx, matcher, options));
}
