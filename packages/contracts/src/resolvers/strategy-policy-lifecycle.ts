/**
 * Strategy Policy Lifecycle — Commander C2
 *
 * Source: Spec #32 Strategy Layer Runtime Surface Specification
 * Baseline: docs/99_source_archive/baseline_v2_6_2/docs/02_child_specs/32_Strategy_Layer_Runtime_Surface_Spec.md
 *
 * Implements:
 * - Policy authoring state machine (draft → pending-approval → approved → active)
 * - Approval workflow enforcement
 * - Semantic versioning validation
 * - Effective date range enforcement
 * - Simulation framework (dry-run before activation)
 * - Policy supersession (active → superseded when new version activates)
 *
 * All strategy values consumed by case lifecycle come through this layer.
 * No hardcoded SLA/routing/priority values.
 */

import type { StrategyPolicy, StrategyPolicyStatus, StrategyApproval } from '../entities/strategy';

// ─── Policy Status State Machine ─────────────────────────────────────────────

/**
 * Valid status transitions for strategy policies per Spec #32.
 */
export const VALID_POLICY_TRANSITIONS: Record<StrategyPolicyStatus, StrategyPolicyStatus[]> = {
  'draft': ['pending-approval', 'rejected'],
  'pending-approval': ['approved', 'rejected'],
  'approved': ['active', 'rejected'],
  'active': ['superseded'],
  'superseded': [], // terminal
  'rejected': ['draft'], // can be reworked back to draft
};

/**
 * Check whether a policy status transition is valid.
 */
export function isValidPolicyTransition(from: StrategyPolicyStatus, to: StrategyPolicyStatus): boolean {
  return VALID_POLICY_TRANSITIONS[from].includes(to);
}

/**
 * Attempt a policy status transition. Returns the new status if valid, throws if invalid.
 */
export function transitionPolicyStatus(
  policy: Pick<StrategyPolicy, 'id' | 'status'>,
  newStatus: StrategyPolicyStatus,
): StrategyPolicyStatus {
  if (!isValidPolicyTransition(policy.status, newStatus)) {
    throw new Error(
      `Invalid policy status transition: ${policy.status} → ${newStatus} (policy ${policy.id}). ` +
      `Valid transitions from '${policy.status}': [${VALID_POLICY_TRANSITIONS[policy.status].join(', ')}]`
    );
  }
  return newStatus;
}

// ─── Approval Workflow ───────────────────────────────────────────────────────

/**
 * Validate that an approval record is complete before allowing approved → active.
 */
export function validateApproval(approval: StrategyApproval | null): { valid: boolean; reason: string } {
  if (!approval) {
    return { valid: false, reason: 'No approval record present. Policy must be approved before activation.' };
  }
  if (!approval.approved_by || !approval.approved_at) {
    return { valid: false, reason: 'Approval record incomplete: approvedBy and approvedAt are required.' };
  }
  if (!approval.rationale) {
    return { valid: false, reason: 'Approval record incomplete: rationale is required.' };
  }
  return { valid: true, reason: 'Approval valid.' };
}

/**
 * Check whether a policy can be activated (must be approved with valid approval record).
 */
export function canActivate(policy: StrategyPolicy): { allowed: boolean; reason: string } {
  if (policy.status !== 'approved') {
    return { allowed: false, reason: `Policy status is '${policy.status}', must be 'approved' to activate.` };
  }
  const approvalCheck = validateApproval(policy.approval);
  if (!approvalCheck.valid) {
    return { allowed: false, reason: approvalCheck.reason };
  }
  return { allowed: true, reason: 'Policy is approved and can be activated.' };
}

// ─── Semantic Versioning ─────────────────────────────────────────────────────

/**
 * Validate that a policy version string follows semantic versioning (major.minor.patch).
 */
export function isValidSemver(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version);
}

/**
 * Compare two semver strings. Returns -1, 0, or 1.
 */
export function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

/**
 * Validate that a new policy version is greater than the current active version.
 */
export function validateVersionIncrement(
  currentActiveVersion: string | null,
  newVersion: string,
): { valid: boolean; reason: string } {
  if (!isValidSemver(newVersion)) {
    return { valid: false, reason: `Version '${newVersion}' is not valid semver (expected major.minor.patch).` };
  }
  if (!currentActiveVersion) {
    return { valid: true, reason: 'No current active version — any valid semver is accepted.' };
  }
  if (!isValidSemver(currentActiveVersion)) {
    return { valid: true, reason: 'Current active version is not valid semver — accepting new version.' };
  }
  if (compareSemver(newVersion, currentActiveVersion) <= 0) {
    return { valid: false, reason: `New version '${newVersion}' must be greater than current active '${currentActiveVersion}'.` };
  }
  return { valid: true, reason: `Version increment valid: ${currentActiveVersion} → ${newVersion}.` };
}

// ─── Effective Date Range Enforcement ────────────────────────────────────────

/**
 * Check whether a policy is currently effective (within its date range).
 */
export function isPolicyEffective(policy: StrategyPolicy, asOf?: string): boolean {
  if (policy.status !== 'active') return false;

  const now = asOf ? new Date(asOf) : new Date();

  if (policy.effective_from) {
    const from = new Date(policy.effective_from);
    if (now < from) return false;
  }

  if (policy.effective_until) {
    const until = new Date(policy.effective_until);
    if (now > until) return false;
  }

  return true;
}

/**
 * Find the currently effective policy for a given surface type from a list of policies.
 * Returns null if no effective policy exists.
 */
export function findEffectivePolicy(
  policies: StrategyPolicy[],
  surface_type: string,
  asOf?: string,
): StrategyPolicy | null {
  const candidates = policies.filter(
    (p) => p.surface_type === surface_type && isPolicyEffective(p, asOf),
  );
  if (candidates.length === 0) return null;
  // If multiple effective policies (shouldn't happen with proper supersession), take highest version
  candidates.sort((a, b) => compareSemver(b.policy_version, a.policy_version));
  return candidates[0];
}

// ─── Simulation Framework ────────────────────────────────────────────────────

export interface SimulationResult {
  policy_id: string;
  policy_version: string;
  surface_type: string;
  simulatedAt: string;
  outcome: 'pass' | 'fail' | 'warning';
  affectedCaseCount: number;
  details: string;
}

/**
 * Simulate a policy activation (dry-run).
 * In Phase 1, this produces a deterministic mock result.
 * Real simulation (against live case data) is a Phase 2 deliverable.
 *
 * Per Spec #32: simulation must run before activation to preview impact.
 */
export function simulatePolicy(
  policy: StrategyPolicy,
  existingCaseCount: number,
): SimulationResult {
  if (policy.status !== 'approved') {
    return {
      policy_id: policy.id,
      policy_version: policy.policy_version,
      surface_type: policy.surface_type,
      simulatedAt: new Date().toISOString(),
      outcome: 'fail',
      affectedCaseCount: 0,
      details: `Cannot simulate: policy status is '${policy.status}', must be 'approved'.`,
    };
  }

  // Phase 1: deterministic simulation — all approved policies pass
  // Phase 2: real simulation against live case data
  return {
    policy_id: policy.id,
    policy_version: policy.policy_version,
    surface_type: policy.surface_type,
    simulatedAt: new Date().toISOString(),
    outcome: 'pass',
    affectedCaseCount: existingCaseCount,
    details: `Simulation passed. ${existingCaseCount} existing cases would be affected by this policy change.`,
  };
}

// ─── Policy Supersession ─────────────────────────────────────────────────────

/**
 * When a new policy version is activated, the previous active policy for the same
 * surface type must be superseded. Returns the IDs of policies to supersede.
 */
export function findPoliciesToSupersede(
  policies: StrategyPolicy[],
  newActivePolicy: StrategyPolicy,
): string[] {
  return policies
    .filter(
      (p) =>
        p.id !== newActivePolicy.id &&
        p.surface_type === newActivePolicy.surface_type &&
        p.status === 'active' &&
        p.tenant.tenant_id === newActivePolicy.tenant.tenant_id,
    )
    .map((p) => p.id);
}
