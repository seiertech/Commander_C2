/**
 * Licence Entity — Commander C2 Canonical Model (Control Plane)
 *
 * Source: Master Technical Specification §Commercial Control Plane
 *
 * Licences track entitlements, usage caps, and billing evidence per customer/tenant.
 * Phase 1 is read-only (no live billing implementation).
 *
 * Ownership: Seiertech Operator
 * Build Unit: Unit 23 (Control Plane)
 * Unlocks: /control-plane/licences, /control-plane/billing
 */

import type { CommonFields } from './common';

export const LICENCE_STATUSES = ['active', 'expired', 'suspended', 'trial'] as const;
export type LicenceStatus = typeof LICENCE_STATUSES[number];

export const LICENCE_TYPES = ['enterprise', 'professional', 'starter', 'trial', 'addon'] as const;
export type LicenceType = typeof LICENCE_TYPES[number];

export interface Licence extends CommonFields {
  entity_type: 'licence';
  customer_id: string;
  tenant_id: string;
  licence_type: LicenceType;
  status: LicenceStatus;
  startDate: string;
  endDate: string;
  max_users: number;
  max_assets: number;
  current_usage: { users: number; assets: number; connectors: number };
  features: string[];
  billingCycle: 'monthly' | 'annual';
  renewalDate: string | null;
}

export interface LicenceValidation { valid: boolean; errors: string[]; }

export function validateLicence(l: Licence): LicenceValidation {
  const errors: string[] = [];
  if (!l.id || l.id.trim() === '') errors.push('id: required');
  if (!l.tenant?.tenant_id) errors.push('tenant.tenant_id: required');
  if (!l.customer_id || l.customer_id.trim() === '') errors.push('customer_id: required');
  if (!LICENCE_STATUSES.includes(l.status)) errors.push(`status: must be one of: ${LICENCE_STATUSES.join(', ')}`);
  if (!LICENCE_TYPES.includes(l.licence_type)) errors.push(`licence_type: must be one of: ${LICENCE_TYPES.join(', ')}`);
  if (!l.startDate) errors.push('startDate: required');
  if (!l.endDate) errors.push('endDate: required');
  return { valid: errors.length === 0, errors };
}
