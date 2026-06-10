/**
 * Customer Entity — Commander C2 Canonical Model (Control Plane)
 *
 * Source: Master Technical Specification §Commercial Control Plane
 *
 * Customers are commercial entities that hold one or more tenants.
 * Managed exclusively by Seiertech Operators in the Control Plane boundary.
 *
 * Ownership: Seiertech Operator
 * Build Unit: Unit 23 (Control Plane)
 * Unlocks: /control-plane/customers
 */

import type { CommonFields } from './common';

export const CUSTOMER_STATUSES = ['active', 'suspended', 'churned', 'onboarding'] as const;
export type CustomerStatus = typeof CUSTOMER_STATUSES[number];

export const CUSTOMER_TIERS = ['enterprise', 'professional', 'starter', 'trial'] as const;
export type CustomerTier = typeof CUSTOMER_TIERS[number];

export interface Customer extends CommonFields {
  entityType: 'customer';
  name: string;
  status: CustomerStatus;
  tier: CustomerTier;
  primaryContact: string;
  tenantCount: number;
  contractStartDate: string;
  contractEndDate: string;
  region: string;
  industry: string;
}

export interface CustomerValidation { valid: boolean; errors: string[]; }

export function validateCustomer(c: Customer): CustomerValidation {
  const errors: string[] = [];
  if (!c.id || c.id.trim() === '') errors.push('id: required');
  if (!c.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!c.name || c.name.trim() === '') errors.push('name: required');
  if (!CUSTOMER_STATUSES.includes(c.status)) errors.push(`status: must be one of: ${CUSTOMER_STATUSES.join(', ')}`);
  if (!CUSTOMER_TIERS.includes(c.tier)) errors.push(`tier: must be one of: ${CUSTOMER_TIERS.join(', ')}`);
  if (!c.primaryContact || c.primaryContact.trim() === '') errors.push('primaryContact: required');
  if (typeof c.tenantCount !== 'number' || c.tenantCount < 0) errors.push('tenantCount: must be >= 0');
  if (!c.contractStartDate) errors.push('contractStartDate: required');
  if (!c.contractEndDate) errors.push('contractEndDate: required');
  return { valid: errors.length === 0, errors };
}
