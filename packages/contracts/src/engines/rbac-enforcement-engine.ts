/**
 * RBAC Enforcement Engine — Commander C2 (Spec 35)
 * Source: Platform Security and Hardening
 * Use Cases: UC-152, UC-153
 */

import type { RbacPolicy } from '../entities/rbac-policy';
import type { BreakGlassRequest } from '../entities/break-glass-request';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PermissionResult {
  allowed: boolean;
  user_id: string;
  action: string;
  resource: string;
  matchedPolicy: string | null;
  reason: string;
  breakGlassActive: boolean;
}

export interface BreakGlassEnforcementResult {
  granted: boolean;
  request_id: string;
  scope: string;
  expires_at: string;
  audit_ref: string;
}

export interface SensitiveAccessAudit {
  timestamp: string;
  user_id: string;
  action: string;
  resource: string;
  granted: boolean;
  policy_ref: string;
  sensitiveReason: string;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Evaluate whether a user has permission for an action on a resource.
 * Checks active RBAC policies for the user's role.
 */
export function evaluatePermission(
  user_id: string,
  userRole: string,
  action: string,
  resource: string,
  policies: RbacPolicy[],
  activeBreakGlass: BreakGlassRequest | null
): PermissionResult {
  // Check break-glass override first
  if (activeBreakGlass && activeBreakGlass.status === 'approved') {
    const now = new Date().toISOString();
    if (activeBreakGlass.expires_at > now) {
      return {
        allowed: true,
        user_id,
        action,
        resource,
        matchedPolicy: null,
        reason: `Break-glass access active (${activeBreakGlass.request_id}).`,
        breakGlassActive: true,
      };
    }
  }

  // Find matching policy for role
  const matchingPolicy = policies.find(
    (p) => p.role === userRole && p.active && p.permissions.includes(action)
  );

  if (matchingPolicy) {
    return {
      allowed: true,
      user_id,
      action,
      resource,
      matchedPolicy: matchingPolicy.policy_id,
      reason: `Permitted by policy ${matchingPolicy.policy_id} (role: ${userRole}).`,
      breakGlassActive: false,
    };
  }

  return {
    allowed: false,
    user_id,
    action,
    resource,
    matchedPolicy: null,
    reason: `No matching policy for role ${userRole} and action ${action}.`,
    breakGlassActive: false,
  };
}

/**
 * Enforce break-glass access — validates and grants emergency elevated access.
 */
export function enforceBreakGlass(request: BreakGlassRequest): BreakGlassEnforcementResult {
  const now = new Date().toISOString();
  const granted = request.status === 'approved' && request.expires_at > now;

  return {
    granted,
    request_id: request.request_id,
    scope: request.scope,
    expires_at: request.expires_at,
    audit_ref: request.audit_ref,
  };
}

/**
 * Audit sensitive access — logs access to sensitive resources for adherence.
 */
export function auditSensitiveAccess(
  user_id: string,
  action: string,
  resource: string,
  granted: boolean,
  policy_ref: string,
  sensitiveReason: string
): SensitiveAccessAudit {
  return {
    timestamp: new Date().toISOString(),
    user_id,
    action,
    resource,
    granted,
    policy_ref,
    sensitiveReason,
  };
}
