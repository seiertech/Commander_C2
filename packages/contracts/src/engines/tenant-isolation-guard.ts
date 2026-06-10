/**
 * Tenant Isolation Guard — Commander C2 (Spec 35)
 * Source: Platform Security and Hardening
 * Use Cases: UC-150
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TenantScopedQuery {
  entity_type: string;
  filters: Record<string, unknown>;
  tenant_id: string;
}

export interface IsolationViolation {
  timestamp: string;
  attemptedTenantId: string;
  actualTenantId: string;
  entity_type: string;
  user_id: string;
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
  tenant_id: string
): TenantScopedQuery {
  return {
    entity_type: (query.entity_type as string) ?? 'unknown',
    filters: { ...query, tenant_id },
    tenant_id,
  };
}

/**
 * Validate cross-tenant access attempt — always denied.
 * Commander enforces strict tenant isolation with no cross-tenant reads permitted.
 */
export function validateCrossTenantAccess(
  requestingTenantId: string,
  targetTenantId: string,
  user_id: string,
  action: string
): CrossTenantAccessResult {
  return {
    allowed: false,
    reason: `Cross-tenant access denied. Requesting tenant ${requestingTenantId} cannot access tenant ${targetTenantId}.`,
    violation: {
      timestamp: new Date().toISOString(),
      attemptedTenantId: targetTenantId,
      actualTenantId: requestingTenantId,
      entity_type: 'cross-tenant-attempt',
      user_id,
      action,
    },
  };
}

/**
 * Log an isolation violation attempt for audit purposes.
 */
export function logIsolationViolationAttempt(
  user_id: string,
  requestingTenantId: string,
  targetTenantId: string,
  action: string
): IsolationViolation {
  return {
    timestamp: new Date().toISOString(),
    attemptedTenantId: targetTenantId,
    actualTenantId: requestingTenantId,
    entity_type: 'isolation-violation',
    user_id,
    action,
  };
}
