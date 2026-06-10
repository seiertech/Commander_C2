/**
 * Configuration Item (CI) Entity — Commander C2
 *
 * Governed by:
 *   - ITIL 4: Service Configuration Management practice
 *   - ISO 19770-1:2017: Configuration tracking
 *
 * Purpose: Track configuration state of IT components. CIs are the logical
 * configuration view of assets — an asset may have multiple CIs (e.g. a server
 * has OS CI, application CI, network CI). CIs feed into change management
 * and drift detection.
 *
 * Standards adherence:
 *   - ITIL 4 CI types and relationship model
 *   - Configuration baseline concept from ITIL
 *   - commander_ prefix on ALL extension fields
 */

import type { CommonFields } from './common';

// ─── CI Type (ITIL 4 taxonomy) ───────────────────────────────────────────────

export type CiType =
  | 'service'
  | 'application'
  | 'infrastructure'
  | 'platform'
  | 'documentation'
  | 'sla'
  | 'policy'
  | 'network_component'
  | 'database'
  | 'security_control';

// ─── CI Status ───────────────────────────────────────────────────────────────

export type CiStatus =
  | 'registered'
  | 'accepted'
  | 'installed'
  | 'active'
  | 'inactive'
  | 'withdrawn';

// ─── Configuration Drift Status ──────────────────────────────────────────────

export type DriftStatus = 'compliant' | 'drifted' | 'unknown' | 'exempt';

// ─── Configuration Item Entity ───────────────────────────────────────────────

export interface ConfigurationItem extends CommonFields {
  entityType: 'configuration-item';

  /** Unique CI identifier */
  ciId: string;

  // ─── Identification ────────────────────────────────────────────────
  /** CI name */
  ciName: string;
  /** CI description */
  description: string;
  /** CI type per ITIL 4 taxonomy */
  ciType: CiType;
  /** CI version */
  version: string;

  // ─── Configuration state ───────────────────────────────────────────
  /** Current CI status */
  status: CiStatus;
  /** Current configuration as JSON-serialisable object */
  currentConfiguration: Record<string, unknown>;
  /** Baseline (approved) configuration */
  baselineConfiguration: Record<string, unknown>;
  /** Drift status relative to baseline */
  driftStatus: DriftStatus;
  /** Last drift check timestamp */
  lastDriftCheck: string;
  /** Fields that have drifted (empty if compliant) */
  driftedFields: string[];

  // ─── Ownership ─────────────────────────────────────────────────────
  /** Service owner */
  owner: string;
  /** Responsible team */
  managedBy: string;
  /** Environment */
  environment: string;

  // ─── Relationships ─────────────────────────────────────────────────
  /** Parent CI ID (for hierarchical decomposition) */
  parentCiId: string | null;
  /** Related asset record ID */
  assetId: string | null;
  /** Dependent CI IDs (CIs that depend on this one) */
  dependentCiIds: string[];
  /** Dependency CI IDs (CIs this one depends on) */
  dependencyCiIds: string[];

  // ─── Change management ─────────────────────────────────────────────
  /** Last change record ID */
  lastChangeId: string | null;
  /** Last change timestamp */
  lastChangeAt: string | null;
  /** Change count in last 30 days */
  changeCount30d: number;

  // ─── Tags ──────────────────────────────────────────────────────────
  tags: string[];

  // ─── Commander extensions ──────────────────────────────────────────
  /** commander_: Linked topology node ID */
  commander_topologyNodeId: string | null;
  /** commander_: Configuration risk score based on drift and criticality */
  commander_configRiskScore: number | null;
  /** commander_: Automated remediation eligible */
  commander_autoRemediationEligible: boolean;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ConfigurationItemValidation {
  valid: boolean;
  errors: string[];
}

const CI_TYPES: CiType[] = [
  'service', 'application', 'infrastructure', 'platform', 'documentation',
  'sla', 'policy', 'network_component', 'database', 'security_control',
];
const CI_STATUSES: CiStatus[] = ['registered', 'accepted', 'installed', 'active', 'inactive', 'withdrawn'];
const DRIFT_STATUSES: DriftStatus[] = ['compliant', 'drifted', 'unknown', 'exempt'];

export function validateConfigurationItem(ci: ConfigurationItem): ConfigurationItemValidation {
  const errors: string[] = [];

  if (!ci.id || ci.id.trim() === '') errors.push('id: required');
  if (!ci.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!ci.ciId || ci.ciId.trim() === '') errors.push('ciId: required');
  if (!ci.ciName || ci.ciName.trim() === '') errors.push('ciName: required');
  if (!ci.description || ci.description.trim() === '') errors.push('description: required');
  if (!CI_TYPES.includes(ci.ciType)) errors.push('ciType: must be valid CiType');
  if (!ci.version || ci.version.trim() === '') errors.push('version: required');
  if (!CI_STATUSES.includes(ci.status)) errors.push('status: must be valid CiStatus');

  // Configuration state
  if (typeof ci.currentConfiguration !== 'object' || ci.currentConfiguration === null) {
    errors.push('currentConfiguration: must be object');
  }
  if (typeof ci.baselineConfiguration !== 'object' || ci.baselineConfiguration === null) {
    errors.push('baselineConfiguration: must be object');
  }
  if (!DRIFT_STATUSES.includes(ci.driftStatus)) {
    errors.push('driftStatus: must be compliant | drifted | unknown | exempt');
  }
  if (!ci.lastDriftCheck || ci.lastDriftCheck.trim() === '') errors.push('lastDriftCheck: required');
  if (!Array.isArray(ci.driftedFields)) errors.push('driftedFields: must be array');

  // Ownership
  if (!ci.owner || ci.owner.trim() === '') errors.push('owner: required');
  if (!ci.managedBy || ci.managedBy.trim() === '') errors.push('managedBy: required');
  if (!ci.environment || ci.environment.trim() === '') errors.push('environment: required');

  // Relationships
  if (!Array.isArray(ci.dependentCiIds)) errors.push('dependentCiIds: must be array');
  if (!Array.isArray(ci.dependencyCiIds)) errors.push('dependencyCiIds: must be array');
  if (!Array.isArray(ci.tags)) errors.push('tags: must be array');

  // Change count
  if (typeof ci.changeCount30d !== 'number' || ci.changeCount30d < 0) {
    errors.push('changeCount30d: must be >= 0');
  }

  // Commander extensions
  if (typeof ci.commander_autoRemediationEligible !== 'boolean') {
    errors.push('commander_autoRemediationEligible: must be boolean');
  }

  return { valid: errors.length === 0, errors };
}
