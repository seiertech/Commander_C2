/**
 * Architecture Component Entity — Commander SDR Canonical Model
 *
 * Source: Master Technical Specification §Architecture Management,
 *         Spec #57 Security Command and Control Doctrine (drift detection)
 *
 * Architecture components model infrastructure elements with their
 * drift state, baseline versions, dependencies, and scanning metadata.
 * Used for the Architecture surface: overview, drift detection, dependency mapping.
 *
 * Ownership: Security Architect, SOM
 * Build Unit: Tier 3 batch (phase1-entity-creation)
 * Unlocks: /architecture, /architecture/drift, /architecture/dependencies
 */

import type { CommonFields } from './common';

// ─── Component Type ──────────────────────────────────────────────────────────

export const ARCHITECTURE_COMPONENT_TYPES = [
  'server', 'database', 'network_device', 'cloud_service',
  'application', 'container', 'load_balancer', 'firewall',
] as const;
export type ArchitectureComponentType = typeof ARCHITECTURE_COMPONENT_TYPES[number];

// ─── Environment ─────────────────────────────────────────────────────────────

export const ARCHITECTURE_ENVIRONMENTS = ['production', 'staging', 'development', 'dr'] as const;
export type ArchitectureEnvironment = typeof ARCHITECTURE_ENVIRONMENTS[number];

// ─── Component Status ────────────────────────────────────────────────────────

export const ARCHITECTURE_COMPONENT_STATUSES = ['healthy', 'degraded', 'drifted', 'unknown'] as const;
export type ArchitectureComponentStatus = typeof ARCHITECTURE_COMPONENT_STATUSES[number];

// ─── Drift State ─────────────────────────────────────────────────────────────

export const DRIFT_STATES = ['compliant', 'minor_drift', 'major_drift', 'unknown'] as const;
export type DriftState = typeof DRIFT_STATES[number];

// ─── Architecture Component Entity ──────────────────────────────────────────

export interface ArchitectureComponent extends CommonFields {
  entityType: 'architecture-component';
  /** Component display name */
  name: string;
  /** Type of infrastructure component */
  componentType: ArchitectureComponentType;
  /** Deployment environment */
  environment: ArchitectureEnvironment;
  /** Owning team or role */
  owner: string;
  /** Current operational status */
  status: ArchitectureComponentStatus;
  /** Expected baseline version/configuration */
  baselineVersion: string;
  /** Currently observed version/configuration */
  currentVersion: string;
  /** Drift state relative to baseline */
  driftState: DriftState;
  /** When this component was last scanned/assessed */
  lastScannedAt: string;
  /** Component IDs this depends on */
  dependencies: string[];
  /** Criticality 1 (highest) to 5 (lowest) */
  criticality: number;
  /** Arbitrary key-value tags for grouping/filtering */
  tags: Record<string, string>;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ArchitectureComponentValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate an ArchitectureComponent entity for structural correctness.
 */
export function validateArchitectureComponent(component: ArchitectureComponent): ArchitectureComponentValidation {
  const errors: string[] = [];

  if (!component.id || component.id.trim() === '') {
    errors.push('id: required');
  }
  if (!component.tenant || !component.tenant.tenantId || component.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!component.name || component.name.trim() === '') {
    errors.push('name: required');
  }
  if (!component.componentType || !ARCHITECTURE_COMPONENT_TYPES.includes(component.componentType)) {
    errors.push(`componentType: must be one of: ${ARCHITECTURE_COMPONENT_TYPES.join(', ')}`);
  }
  if (!component.environment || !ARCHITECTURE_ENVIRONMENTS.includes(component.environment)) {
    errors.push(`environment: must be one of: ${ARCHITECTURE_ENVIRONMENTS.join(', ')}`);
  }
  if (!component.owner || component.owner.trim() === '') {
    errors.push('owner: required');
  }
  if (!component.status || !ARCHITECTURE_COMPONENT_STATUSES.includes(component.status)) {
    errors.push(`status: must be one of: ${ARCHITECTURE_COMPONENT_STATUSES.join(', ')}`);
  }
  if (!component.baselineVersion || component.baselineVersion.trim() === '') {
    errors.push('baselineVersion: required');
  }
  if (!component.currentVersion || component.currentVersion.trim() === '') {
    errors.push('currentVersion: required');
  }
  if (!component.driftState || !DRIFT_STATES.includes(component.driftState)) {
    errors.push(`driftState: must be one of: ${DRIFT_STATES.join(', ')}`);
  }
  if (!component.lastScannedAt || component.lastScannedAt.trim() === '') {
    errors.push('lastScannedAt: required');
  }
  if (!Array.isArray(component.dependencies)) {
    errors.push('dependencies: must be an array');
  }
  if (typeof component.criticality !== 'number' || component.criticality < 1 || component.criticality > 5) {
    errors.push('criticality: must be 1-5');
  }
  if (!component.tags || typeof component.tags !== 'object') {
    errors.push('tags: must be an object');
  }

  return { valid: errors.length === 0, errors };
}
