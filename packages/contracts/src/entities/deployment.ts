/**
 * Deployment Entity — Commander C2 Canonical Model (Control Plane)
 *
 * Source: Master Technical Specification §Commercial Control Plane
 *
 * Deployments track releases, versions, and rollout status per tenant/environment.
 *
 * Ownership: Seiertech Operator
 * Build Unit: Unit 23 (Control Plane)
 * Unlocks: /control-plane/deployment
 */

import type { CommonFields } from './common';

export const DEPLOYMENT_STATUSES = ['deployed', 'rolling_out', 'scheduled', 'rolled_back', 'failed'] as const;
export type DeploymentStatus = typeof DEPLOYMENT_STATUSES[number];

export const DEPLOYMENT_ENVIRONMENTS = ['production', 'staging', 'canary'] as const;
export type DeploymentEnvironment = typeof DEPLOYMENT_ENVIRONMENTS[number];

export interface Deployment extends CommonFields {
  entity_type: 'deployment';
  tenant_id: string;
  environment: DeploymentEnvironment;
  version: string;
  previousVersion: string;
  status: DeploymentStatus;
  deployed_at: string;
  deployed_by: string;
  releaseNotes: string;
  healthCheck: 'passing' | 'degraded' | 'failing' | 'pending';
}

export interface DeploymentValidation { valid: boolean; errors: string[]; }

export function validateDeployment(d: Deployment): DeploymentValidation {
  const errors: string[] = [];
  if (!d.id || d.id.trim() === '') errors.push('id: required');
  if (!d.tenant?.tenant_id) errors.push('tenant.tenant_id: required');
  if (!d.tenant_id || d.tenant_id.trim() === '') errors.push('tenant_id: required');
  if (!DEPLOYMENT_STATUSES.includes(d.status)) errors.push(`status: must be one of: ${DEPLOYMENT_STATUSES.join(', ')}`);
  if (!DEPLOYMENT_ENVIRONMENTS.includes(d.environment)) errors.push(`environment: must be one of: ${DEPLOYMENT_ENVIRONMENTS.join(', ')}`);
  if (!d.version || d.version.trim() === '') errors.push('version: required');
  if (!d.deployed_at) errors.push('deployed_at: required');
  return { valid: errors.length === 0, errors };
}
