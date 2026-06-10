// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Push Governance Engine — Commander C2 (Unit 42)
 * Source: Spec #32 Strategy Layer (Automation Boundary Strategy)
 * Simulates push actions, detects conflicts, assesses push impact.
 * Push governance remains dry-run until separately approved.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PushRule {
  id: string;
  action: string;
  scope: string;
  conditions: string[];
  escalationTarget: string | null;
}

export interface PushEntity {
  id: string;
  type: string;
  current_state: string;
}

export interface DryRunResult {
  ruleId: string;
  wouldBlock: string[];
  wouldAllow: string[];
  would_escalate: string[];
  conflicts: PushConflict[];
}

export interface PushConflict {
  ruleA: string;
  ruleB: string;
  conflictType: 'scope_overlap' | 'action_contradiction' | 'escalation_loop';
  description: string;
}

export interface PushImpactAssessment {
  severity: number; // 1-5
  affectedCount: number;
  hasConflicts: boolean;
  rationale: string;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Simulate a push rule against a scope and set of entities (dry-run only).
 * Determines which entities would be blocked, allowed, or escalated.
 */
export function simulatePush(
  rule: PushRule,
  scope: string,
  entities: PushEntity[],
): DryRunResult {
  const wouldBlock: string[] = [];
  const wouldAllow: string[] = [];
  const would_escalate: string[] = [];

  for (const entity of entities) {
    // Only evaluate entities in scope
    if (entity.type !== scope && scope !== '*') continue;

    // Check conditions against entity state
    const conditionsMet = rule.conditions.length === 0 ||
      rule.conditions.some((c) => entity.current_state.includes(c));

    if (conditionsMet && rule.escalationTarget) {
      wouldEscalate.push(entity.id);
    } else if (conditionsMet) {
      wouldAllow.push(entity.id);
    } else {
      wouldBlock.push(entity.id);
    }
  }

  return {
    ruleId: rule.id,
    wouldBlock,
    wouldAllow,
    would_escalate,
    conflicts: [],
  };
}

/**
 * Detect conflicts between a new rule and existing rules.
 * Conflicts arise from scope overlaps, contradictory actions, or escalation loops.
 */
export function detectConflicts(rule: PushRule, existingRules: PushRule[]): PushConflict[] {
  const conflicts: PushConflict[] = [];

  for (const existing of existingRules) {
    if (existing.id === rule.id) continue;

    // Scope overlap
    if (rule.scope === existing.scope || rule.scope === '*' || existing.scope === '*') {
      // Action contradiction
      if (rule.action !== existing.action) {
        conflicts.push({
          ruleA: rule.id,
          ruleB: existing.id,
          conflictType: 'action_contradiction',
          description: `Rule "${rule.id}" (${rule.action}) contradicts "${existing.id}" (${existing.action}) on scope "${rule.scope}".`,
        });
      } else {
        conflicts.push({
          ruleA: rule.id,
          ruleB: existing.id,
          conflictType: 'scope_overlap',
          description: `Rule "${rule.id}" overlaps scope with "${existing.id}" on "${rule.scope}".`,
        });
      }
    }

    // Escalation loop: A escalates to B's target, B escalates to A's target
    if (
      rule.escalationTarget &&
      existing.escalationTarget &&
      rule.escalationTarget === existing.id &&
      existing.escalationTarget === rule.id
    ) {
      conflicts.push({
        ruleA: rule.id,
        ruleB: existing.id,
        conflictType: 'escalation_loop',
        description: `Escalation loop detected between "${rule.id}" and "${existing.id}".`,
      });
    }
  }

  return conflicts;
}

/**
 * Assess the severity/impact of a dry-run push result.
 * Severity 1 = minimal impact, 5 = critical (many affected + conflicts).
 */
export function assessPushImpact(result: DryRunResult): PushImpactAssessment {
  const affectedCount =
    result.wouldBlock.length + result.wouldAllow.length + result.would_escalate.length;
  const hasConflicts = result.conflicts.length > 0;

  let severity: number;
  if (hasConflicts && affectedCount >= 10) {
    severity = 5;
  } else if (hasConflicts || affectedCount >= 10) {
    severity = 4;
  } else if (result.would_escalate.length > 0) {
    severity = 3;
  } else if (affectedCount >= 5) {
    severity = 2;
  } else {
    severity = 1;
  }

  const rationale =
    `Push rule "${result.ruleId}" affects ${affectedCount} entities ` +
    `(${result.wouldBlock.length} blocked, ${result.wouldAllow.length} allowed, ${result.would_escalate.length} escalated). ` +
    `Conflicts: ${result.conflicts.length}.`;

  return { severity, affectedCount, hasConflicts, rationale };
}
