/**
 * Entitlement Manifest Entity — Commander C2 Canonical Model
 *
 * Source: Spec #38 Commander Internal Control Plane UI Surface,
 *         Spec #36 Commercial Model Architecture
 *
 * Entitlement manifests define what modules, connectors, and capabilities
 * a tenant is permitted to use under their commercial agreement.
 *
 * Ownership: Seiertech Operator
 * Boundary: control-plane
 * Unlocks: /control-plane/entitlements (UC-158)
 */

import type { CommonFields } from './common';

// ─── Entitlement Status ──────────────────────────────────────────────────────

export const ENTITLEMENT_STATUSES = ['active', 'suspended', 'trial', 'expired'] as const;
export type EntitlementStatus = typeof ENTITLEMENT_STATUSES[number];

// ─── Reporting Tier ──────────────────────────────────────────────────────────

export const REPORTING_TIERS = ['basic', 'standard', 'premium'] as const;
export type ReportingTier = typeof REPORTING_TIERS[number];

// ─── Module Category ─────────────────────────────────────────────────────────

export const MODULE_CATEGORIES = ['core', 'advanced', 'premium'] as const;
export type ModuleCategory = typeof MODULE_CATEGORIES[number];

// ─── Entitlement Module ──────────────────────────────────────────────────────

export interface EntitlementModule {
  /** Unique module identifier */
  module_id: string;
  /** Module display name */
  name: string;
  /** Module tier category */
  category: ModuleCategory;
  /** Whether this module is enabled for the tenant */
  enabled: boolean;
  /** Optional usage limit (e.g. max connectors of this type) */
  limit?: number;
}

// ─── Entitlement Manifest Entity ─────────────────────────────────────────────

export interface EntitlementManifest extends CommonFields {
  entity_type: 'entitlement-manifest';
  /** Unique manifest identifier */
  manifest_id: string;
  /** Tenant this manifest applies to */
  tenant_id: string;
  /** Entitled modules with their state */
  modules: EntitlementModule[];
  /** Maximum number of connectors allowed */
  connectorLimit: number;
  /** Whether Commander AI features are enabled */
  aiEnabled: boolean;
  /** Whether automation features are enabled */
  automationEnabled: boolean;
  /** Whether Fusion Map visualisation is enabled */
  fusionMapEnabled: boolean;
  /** Reporting tier level */
  reportingTier: ReportingTier;
  /** Entitlement effective from date */
  effective_from: string;
  /** Entitlement effective until date */
  effective_until: string;
  /** Current entitlement status */
  status: EntitlementStatus;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface EntitlementManifestValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate an EntitlementManifest entity for structural correctness.
 */
export function validateEntitlementManifest(manifest: EntitlementManifest): EntitlementManifestValidation {
  const errors: string[] = [];

  if (!manifest.id || manifest.id.trim() === '') {
    errors.push('id: required');
  }
  if (!manifest.tenant || !manifest.tenant.tenant_id || manifest.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }
  if (!manifest.manifest_id || manifest.manifest_id.trim() === '') {
    errors.push('manifest_id: required');
  }
  if (!manifest.tenant_id || manifest.tenant_id.trim() === '') {
    errors.push('tenant_id: required');
  }
  if (!Array.isArray(manifest.modules)) {
    errors.push('modules: must be an array');
  } else {
    for (const mod of manifest.modules) {
      if (!mod.module_id || mod.module_id.trim() === '') {
        errors.push('modules[].module_id: required');
      }
      if (!mod.name || mod.name.trim() === '') {
        errors.push('modules[].name: required');
      }
      if (!MODULE_CATEGORIES.includes(mod.category)) {
        errors.push(`modules[].category: must be one of: ${MODULE_CATEGORIES.join(', ')}`);
      }
      if (typeof mod.enabled !== 'boolean') {
        errors.push('modules[].enabled: must be a boolean');
      }
    }
  }
  if (typeof manifest.connectorLimit !== 'number' || manifest.connectorLimit < 0) {
    errors.push('connectorLimit: must be a non-negative number');
  }
  if (typeof manifest.aiEnabled !== 'boolean') {
    errors.push('aiEnabled: must be a boolean');
  }
  if (typeof manifest.automationEnabled !== 'boolean') {
    errors.push('automationEnabled: must be a boolean');
  }
  if (typeof manifest.fusionMapEnabled !== 'boolean') {
    errors.push('fusionMapEnabled: must be a boolean');
  }
  if (!REPORTING_TIERS.includes(manifest.reportingTier)) {
    errors.push(`reportingTier: must be one of: ${REPORTING_TIERS.join(', ')}`);
  }
  if (!manifest.effective_from || manifest.effective_from.trim() === '') {
    errors.push('effective_from: required');
  }
  if (!manifest.effective_until || manifest.effective_until.trim() === '') {
    errors.push('effective_until: required');
  }
  if (!ENTITLEMENT_STATUSES.includes(manifest.status)) {
    errors.push(`status: must be one of: ${ENTITLEMENT_STATUSES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
