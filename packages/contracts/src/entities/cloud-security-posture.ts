/**
 * Cloud Security Posture Entity — Commander C2 Canonical Model
 *
 * Source: Spec #22 Architecture Intelligence
 *
 * Models multi-cloud security posture with drift detection.
 * Tracks adherence scores, drift findings, and framework adherence
 * across AWS, Azure, and GCP accounts/subscriptions/projects.
 *
 * Constraints:
 * - Read-only consumption of cloud posture data (SOC boundary, Doctrine #8)
 * - Multi-cloud support: AWS, Azure, GCP
 * - Drift items are observations, not remediation actions
 */

import type { CommonFields } from './common';

// ─── Cloud Provider ──────────────────────────────────────────────────────────

export const CLOUD_PROVIDERS = ['aws', 'azure', 'gcp'] as const;
export type CloudProvider = typeof CLOUD_PROVIDERS[number];

// ─── Drift Severity ──────────────────────────────────────────────────────────

export const DRIFT_SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
export type DriftSeverity = typeof DRIFT_SEVERITIES[number];

// ─── Drift Detail ────────────────────────────────────────────────────────────

export interface DriftDetail {
  /** Drift item identifier */
  driftId: string;
  /** Resource affected */
  resource: string;
  /** Rule or benchmark that detected the drift */
  rule: string;
  /** Severity of the drift */
  severity: DriftSeverity;
  /** When the drift was first detected */
  detectedAt: string;
  /** Brief description */
  description: string;
}

// ─── Cloud Security Posture Entity ───────────────────────────────────────────

export interface CloudSecurityPosture extends CommonFields {
  entityType: 'cloud-security-posture';
  /** Cloud provider */
  cloudProvider: CloudProvider;
  /** Cloud account/subscription/project identifier */
  accountId: string;
  /** Cloud region */
  region: string;
  /** Overall adherence percentage (0-100) */
  adherenceScore: number;
  /** Active drift finding count */
  driftCount: number;
  /** Critical-severity finding count */
  criticalFindings: number;
  /** Last posture scan timestamp */
  lastScanAt: string;
  /** Applicable adherence frameworks */
  frameworks: string[];
  /** Specific drift items */
  driftDetails: DriftDetail[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface CloudSecurityPostureValidation {
  valid: boolean;
  errors: string[];
}

export function validateCloudSecurityPosture(record: CloudSecurityPosture): CloudSecurityPostureValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') errors.push('id: required');
  if (!record.tenant || !record.tenant.tenantId) errors.push('tenant.tenantId: required');
  if (!record.cloudProvider || !CLOUD_PROVIDERS.includes(record.cloudProvider)) errors.push(`cloudProvider: must be one of: ${CLOUD_PROVIDERS.join(', ')}`);
  if (!record.accountId || record.accountId.trim() === '') errors.push('accountId: required');
  if (!record.region || record.region.trim() === '') errors.push('region: required');
  if (typeof record.adherenceScore !== 'number' || record.adherenceScore < 0 || record.adherenceScore > 100) errors.push('adherenceScore: must be 0-100');
  if (typeof record.driftCount !== 'number' || record.driftCount < 0) errors.push('driftCount: must be non-negative');
  if (typeof record.criticalFindings !== 'number' || record.criticalFindings < 0) errors.push('criticalFindings: must be non-negative');
  if (!record.lastScanAt || record.lastScanAt.trim() === '') errors.push('lastScanAt: required');
  if (!Array.isArray(record.frameworks)) errors.push('frameworks: must be an array');
  if (!Array.isArray(record.driftDetails)) errors.push('driftDetails: must be an array');

  return { valid: errors.length === 0, errors };
}
