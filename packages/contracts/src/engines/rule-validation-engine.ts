/**
 * Rule Validation Engine — Commander SDR (Spec 34)
 *
 * Source: Spec #34 Drift and Rule Engine
 *
 * Validates an authored drift/detection rule (parsed from its YAML form) BEFORE
 * activation (UC-168). Enforces the security envelope:
 *   - structural schema correctness
 *   - operator whitelist (no arbitrary operators)
 *   - hard rejection of any code-execution construct (rules are declarative
 *     data, never executable code)
 *   - tenant-scope presence (no unscoped rules)
 *
 * Pure functions over a parsed RuleSpec — no I/O, no rule activation here.
 */

// ─── Parsed Rule Spec (YAML → object) ────────────────────────────────────────

export interface RuleConditionSpec {
  /** Field/path the condition evaluates */
  field: string;
  /** Comparison operator (must be on the whitelist) */
  operator: string;
  /** Comparison value */
  value: unknown;
}

export interface RuleSpec {
  /** Optional identifier (assigned on activation if absent) */
  ruleId?: string;
  /** Rule display name */
  name: string;
  /** Rule type (detection | drift | correlation | suppression | custom) */
  ruleType: string;
  /** Tenant scope — a tenant id, list of tenant ids, or 'all' (platform-wide) */
  tenantScope: string | string[];
  /** Declarative conditions */
  conditions: RuleConditionSpec[];
  /** Severity when matched (1–5) */
  severity: number;
  /** Optional proposed action keys */
  actions?: string[];
}

export interface RuleValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ─── Operator Whitelist ──────────────────────────────────────────────────────

export const OPERATOR_WHITELIST = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'not_in',
  'contains',
  'not_contains',
  'matches',
  'exists',
  'not_exists',
] as const;
export type WhitelistedOperator = typeof OPERATOR_WHITELIST[number];

const VALID_RULE_TYPES = ['detection', 'drift', 'correlation', 'suppression', 'custom'];

/**
 * Patterns that indicate an attempt to embed executable code in a declarative
 * rule. Rules are data, never code — any match is a hard rejection.
 */
const CODE_EXECUTION_PATTERNS: RegExp[] = [
  /\beval\s*\(/i,
  /\bexec\s*\(/i,
  /\bFunction\s*\(/,
  /\brequire\s*\(/i,
  /\bimport\s*\(/i,
  /\bprocess\./i,
  /\bchild_process\b/i,
  /=>/,
  /\$\{/,
  /<script\b/i,
  /\bsystem\s*\(/i,
  /\bsubprocess\b/i,
  /`/,
];

const ok = (): RuleValidationResult => ({ valid: true, errors: [], warnings: [] });

// ─── validateRuleSchema ──────────────────────────────────────────────────────

/**
 * Validate the structural schema of a parsed rule spec.
 */
export function validateRuleSchema(rule: RuleSpec): RuleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rule || typeof rule !== 'object') {
    return { valid: false, errors: ['rule: must be an object'], warnings };
  }
  if (!rule.name || rule.name.trim() === '') {
    errors.push('name: required');
  }
  if (!rule.ruleType || !VALID_RULE_TYPES.includes(rule.ruleType)) {
    errors.push(`ruleType: must be one of: ${VALID_RULE_TYPES.join(', ')}`);
  }
  if (typeof rule.severity !== 'number' || rule.severity < 1 || rule.severity > 5) {
    errors.push('severity: must be a number between 1 and 5');
  }
  if (!Array.isArray(rule.conditions) || rule.conditions.length === 0) {
    errors.push('conditions: must be a non-empty array');
  } else {
    rule.conditions.forEach((c, i) => {
      if (!c.field || String(c.field).trim() === '') {
        errors.push(`conditions[${i}].field: required`);
      }
      if (!c.operator || String(c.operator).trim() === '') {
        errors.push(`conditions[${i}].operator: required`);
      }
    });
  }
  if (Array.isArray(rule.actions) && rule.actions.length === 0) {
    warnings.push('actions: empty — rule will emit findings with no proposed actions');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─── checkOperatorWhitelist ──────────────────────────────────────────────────

/**
 * Ensure every condition operator is on the whitelist. Arbitrary operators are
 * rejected to keep rule evaluation bounded and safe.
 */
export function checkOperatorWhitelist(rule: RuleSpec): RuleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const allowed = OPERATOR_WHITELIST as readonly string[];

  if (!Array.isArray(rule.conditions)) {
    return { valid: false, errors: ['conditions: must be an array'], warnings };
  }
  rule.conditions.forEach((c, i) => {
    if (!allowed.includes(c.operator)) {
      errors.push(`conditions[${i}].operator: "${c.operator}" is not whitelisted (allowed: ${OPERATOR_WHITELIST.join(', ')})`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

// ─── rejectCodeExecution ─────────────────────────────────────────────────────

/**
 * Scan the rule for any embedded code-execution construct. Rules are
 * declarative data — any executable pattern is a hard rejection.
 */
export function rejectCodeExecution(rule: RuleSpec): RuleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const scan = (value: unknown, path: string): void => {
    if (typeof value === 'string') {
      for (const pattern of CODE_EXECUTION_PATTERNS) {
        if (pattern.test(value)) {
          errors.push(`${path}: rejected — contains code-execution construct (${pattern.source})`);
          break;
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => scan(v, `${path}[${i}]`));
    } else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        scan(v, `${path}.${k}`);
      }
    }
  };

  scan(rule, 'rule');

  return { valid: errors.length === 0, errors, warnings };
}

// ─── validateTenantScope ─────────────────────────────────────────────────────

/**
 * Ensure the rule declares a tenant scope. A rule must be scoped either to a
 * specific tenant (or tenants) or explicitly to 'all' for platform-wide rules.
 */
export function validateTenantScope(rule: RuleSpec): RuleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const scope = rule.tenantScope;
  if (scope === undefined || scope === null) {
    errors.push('tenantScope: required');
  } else if (typeof scope === 'string') {
    if (scope.trim() === '') {
      errors.push('tenantScope: must not be empty');
    } else if (scope === 'all') {
      warnings.push('tenantScope: "all" — rule applies platform-wide; confirm this is intended');
    }
  } else if (Array.isArray(scope)) {
    if (scope.length === 0) {
      errors.push('tenantScope: must list at least one tenant');
    } else if (scope.some((t) => !t || String(t).trim() === '')) {
      errors.push('tenantScope: contains an empty tenant id');
    }
  } else {
    errors.push('tenantScope: must be a tenant id, a list of tenant ids, or "all"');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─── Convenience: full validation pass ───────────────────────────────────────

/**
 * Run all validation stages and merge the results. A rule is activatable only
 * when every stage passes.
 */
export function validateRule(rule: RuleSpec): RuleValidationResult {
  const stages = [
    validateRuleSchema(rule),
    checkOperatorWhitelist(rule),
    rejectCodeExecution(rule),
    validateTenantScope(rule),
  ];
  const merged = stages.reduce<RuleValidationResult>(
    (acc, r) => ({
      valid: acc.valid && r.valid,
      errors: [...acc.errors, ...r.errors],
      warnings: [...acc.warnings, ...r.warnings],
    }),
    ok(),
  );
  return merged;
}
