/**
 * Tenant Intelligence Subscription — Commander C2 Canonical Entity
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 10.1, 10.3, 10.4
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * A tenant's subscription to specific platform intelligence sources,
 * defining applicability and evaluation preferences. Does NOT duplicate
 * the full raw catalogue into the tenant's data store (Req 10.2).
 */

import type { CommonFields } from './common';
import type { TenantSubscriptionState } from './intelligence-common';
import { TENANT_SUBSCRIPTION_STATES } from './intelligence-common';

// ─── Tenant Intelligence Subscription Entity ─────────────────────────────────

export interface TenantIntelligenceSubscription extends CommonFields {
  /** Customer tenant ID — non-empty (Req 10.4) */
  tenant_id: string;
  /** Reference to Platform_Intelligence_Source by ID (Req 10.1) */
  source_id: string;
  /** Subscription state (Req 10.1/10.4) */
  subscriptionState: TenantSubscriptionState;
  /** Applicability filter criteria (valid array, Req 10.1/10.4) */
  applicabilityFilters: Record<string, unknown>[];
  /** Evaluation preferences */
  evaluationPreferences: Record<string, unknown>;
  /** When the subscription was created */
  subscribed_at: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface TenantIntelligenceSubscriptionValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Tenant_Intelligence_Subscription for structural correctness.
 * Checks: tenantId/sourceId non-empty, state membership, filters array (Req 10.4).
 */
export function validateTenantIntelligenceSubscription(
  sub: TenantIntelligenceSubscription,
): TenantIntelligenceSubscriptionValidation {
  const errors: string[] = [];

  if (!sub.tenant_id || sub.tenant_id.trim() === '') {
    errors.push('tenant_id: required, must be a non-empty string');
  }

  if (!sub.source_id || sub.source_id.trim() === '') {
    errors.push('source_id: required, must reference a Platform_Intelligence_Source');
  }

  if (!sub.subscriptionState || !TENANT_SUBSCRIPTION_STATES.includes(sub.subscriptionState)) {
    errors.push(
      `subscriptionState: must be one of: ${TENANT_SUBSCRIPTION_STATES.join(', ')}`,
    );
  }

  if (!Array.isArray(sub.applicabilityFilters)) {
    errors.push('applicabilityFilters: must be a valid array structure');
  }

  if (!sub.id || sub.id.trim() === '') {
    errors.push('id: required');
  }

  if (!sub.tenant || !sub.tenant.tenant_id || sub.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }

  return { valid: errors.length === 0, errors };
}
