/**
 * Tenant Isolation Guard — Commander C2 (Spec 35)
 * Source: Platform Security and Hardening
 * Use Cases: UC-150
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TenantScopedQuery {
  entityType: string;
  filters: Record<string, unknown>;
  tenantId: string;
}

export interface IsolationViolation {
  timestamp: string;
  attemptedTenantId: string;
  actualTenantId: string;
  entityType: string;
  userId: string;
  action: string;
}

export interface CrossTenantAccessResult {
  allowed: false;
  reason: string;
  violation: IsolationViolation;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Enforce tenant scope on a query — ensures all data access is scoped to the user's tenant.
 * Injects tenantId filter into every query, preventing cross-tenant data leakage.
 */
export function enforceTenantScope(
  query: Record<string, unknown>,
  tenantId: string
): TenantScopedQuery {
  return {
    entityType: (query.entityType as string) ?? 'unknown',
    filters: { ...query, tenantId },
    tenantId,
  };
}

/**
 * Validate cross-tenant access attempt — always denied.
 * Commander enforces strict tenant isolation with no cross-tenant reads permitted.
 */
export function validateCrossTenantAccess(
  requestingTenantId: string,
  targetTenantId: string,
  userId: string,
  action: string
): CrossTenantAccessResult {
  return {
    allowed: false,
    reason: `Cross-tenant access denied. Requesting tenant ${requestingTenantId} cannot access tenant ${targetTenantId}.`,
    violation: {
      timestamp: new Date().toISOString(),
      attemptedTenantId: targetTenantId,
      actualTenantId: requestingTenantId,
      entityType: 'cross-tenant-attempt',
      userId,
      action,
    },
  };
}

/**
 * Log an isolation violation attempt for audit purposes.
 */
export function logIsolationViolationAttempt(
  userId: string,
  requestingTenantId: string,
  targetTenantId: string,
  action: string
): IsolationViolation {
  return {
    timestamp: new Date().toISOString(),
    attemptedTenantId: targetTenantId,
    actualTenantId: requestingTenantId,
    entityType: 'isolation-violation',
    userId,
    action,
  };
}
