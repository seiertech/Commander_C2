/**
 * RBAC Enforcement Engine — Commander SDR (Spec 35)
 * Source: Platform Security and Hardening
 * Use Cases: UC-152, UC-153
 */

import type { RbacPolicy } from '../entities/rbac-policy';
import type { BreakGlassRequest } from '../entities/break-glass-request';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PermissionResult {
  allowed: boolean;
  userId: string;
  action: string;
  resource: string;
  matchedPolicy: string | null;
  reason: string;
  breakGlassActive: boolean;
}

export interface BreakGlassEnforcementResult {
  granted: boolean;
  requestId: string;
  scope: string;
  expiresAt: string;
  auditRef: string;
}

export interface SensitiveAccessAudit {
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  granted: boolean;
  policyRef: string;
  sensitiveReason: string;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Evaluate whether a user has permission for an action on a resource.
 * Checks active RBAC policies for the user's role.
 */
export function evaluatePermission(
  userId: string,
  userRole: string,
  action: string,
  resource: string,
  policies: RbacPolicy[],
  activeBreakGlass: BreakGlassRequest | null
): PermissionResult {
  // Check break-glass override first
  if (activeBreakGlass && activeBreakGlass.status === 'approved') {
    const now = new Date().toISOString();
    if (activeBreakGlass.expiresAt > now) {
      return {
        allowed: true,
        userId,
        action,
        resource,
        matchedPolicy: null,
        reason: `Break-glass access active (${activeBreakGlass.requestId}).`,
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
      userId,
      action,
      resource,
      matchedPolicy: matchingPolicy.policyId,
      reason: `Permitted by policy ${matchingPolicy.policyId} (role: ${userRole}).`,
      breakGlassActive: false,
    };
  }

  return {
    allowed: false,
    userId,
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
  const granted = request.status === 'approved' && request.expiresAt > now;

  return {
    granted,
    requestId: request.requestId,
    scope: request.scope,
    expiresAt: request.expiresAt,
    auditRef: request.auditRef,
  };
}

/**
 * Audit sensitive access — logs access to sensitive resources for compliance.
 */
export function auditSensitiveAccess(
  userId: string,
  action: string,
  resource: string,
  granted: boolean,
  policyRef: string,
  sensitiveReason: string
): SensitiveAccessAudit {
  return {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    granted,
    policyRef,
    sensitiveReason,
  };
}
