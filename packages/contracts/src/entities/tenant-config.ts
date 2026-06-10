/**
 * Tenant Config Entity — Commander C2 Canonical Model (Control Plane)
 *
 * Source: Master Technical Specification §Commercial Control Plane
 *
 * Tenant configurations as viewed from the operator Control Plane.
 * Each tenant belongs to a customer and has deployment, feature, and capacity settings.
 *
 * Ownership: Seiertech Operator
 * Build Unit: Unit 23 (Control Plane)
 * Unlocks: /control-plane/tenants
 */

import type { CommonFields } from './common';

export const TENANT_CONFIG_STATUSES = ['active', 'suspended', 'provisioning', 'decommissioned'] as const;
export type TenantConfigStatus = typeof TENANT_CONFIG_STATUSES[number];

export const DEPLOYMENT_REGIONS = ['eu-west-1', 'us-east-1', 'ap-southeast-1', 'uk-south-1'] as const;
export type DeploymentRegion = typeof DEPLOYMENT_REGIONS[number];

export interface TenantConfig extends CommonFields {
  entityType: 'tenant-config';
  tenantDisplayName: string;
  customerId: string;
  status: TenantConfigStatus;
  deploymentRegion: DeploymentRegion;
  maxUsers: number;
  currentUsers: number;
  maxAssets: number;
  currentAssets: number;
  featuresEnabled: string[];
  provisionedAt: string;
  lastActivityAt: string;
}

export interface TenantConfigValidation { valid: boolean; errors: string[]; }

export function validateTenantConfig(tc: TenantConfig): TenantConfigValidation {
  const errors: string[] = [];
  if (!tc.id || tc.id.trim() === '') errors.push('id: required');
  if (!tc.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!tc.tenantDisplayName || tc.tenantDisplayName.trim() === '') errors.push('tenantDisplayName: required');
  if (!tc.customerId || tc.customerId.trim() === '') errors.push('customerId: required');
  if (!TENANT_CONFIG_STATUSES.includes(tc.status)) errors.push(`status: must be one of: ${TENANT_CONFIG_STATUSES.join(', ')}`);
  if (!DEPLOYMENT_REGIONS.includes(tc.deploymentRegion)) errors.push(`deploymentRegion: must be one of: ${DEPLOYMENT_REGIONS.join(', ')}`);
  if (typeof tc.maxUsers !== 'number' || tc.maxUsers < 0) errors.push('maxUsers: must be >= 0');
  if (typeof tc.currentUsers !== 'number' || tc.currentUsers < 0) errors.push('currentUsers: must be >= 0');
  return { valid: errors.length === 0, errors };
}
