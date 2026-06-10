// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Entitlement Enforcement Engine — Commander C2 (Spec 38)
 * Source: Spec #38 Commander Internal Control Plane UI Surface
 * Evaluates whether a tenant is entitled to use a specific feature or module.
 */

import type { EntitlementManifest } from '../entities/entitlement-manifest';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EntitlementResult {
  allowed: boolean;
  reason: string;
  manifest_id: string | null;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Evaluate whether a tenant is entitled to access a specific feature.
 * Returns an EntitlementResult indicating access decision and reason.
 */
export function evaluateEntitlement(
  manifest: EntitlementManifest | null,
  feature: string,
): EntitlementResult {
  if (!manifest) {
    return { allowed: false, reason: 'No entitlement manifest found for tenant.', manifest_id: null };
  }

  if (manifest.status === 'expired') {
    return { allowed: false, reason: 'Entitlement manifest has expired.', manifest_id: manifest.manifest_id };
  }

  if (manifest.status === 'suspended') {
    return { allowed: false, reason: 'Entitlement manifest is suspended.', manifest_id: manifest.manifest_id };
  }

  // Check feature-level flags
  if (feature === 'ai' && !manifest.aiEnabled) {
    return { allowed: false, reason: 'AI features are not enabled for this entitlement.', manifest_id: manifest.manifest_id };
  }
  if (feature === 'automation' && !manifest.automationEnabled) {
    return { allowed: false, reason: 'Automation features are not enabled for this entitlement.', manifest_id: manifest.manifest_id };
  }
  if (feature === 'fusion-map' && !manifest.fusionMapEnabled) {
    return { allowed: false, reason: 'Fusion Map is not enabled for this entitlement.', manifest_id: manifest.manifest_id };
  }

  // Check module-level access
  const module = manifest.modules.find((m) => m.module_id === feature || m.name.toLowerCase().replace(/\s+/g, '-') === feature);
  if (module && !module.enabled) {
    return { allowed: false, reason: `Module "${module.name}" is not enabled for this entitlement.`, manifest_id: manifest.manifest_id };
  }

  return { allowed: true, reason: 'Entitlement check passed.', manifest_id: manifest.manifest_id };
}

/**
 * Check whether a specific module is accessible under the manifest.
 */
export function checkModuleAccess(manifest: EntitlementManifest, module_id: string): boolean {
  const module = manifest.modules.find((m) => m.module_id === moduleId);
  if (!module) return false;
  return module.enabled;
}

/**
 * Check whether adding another connector would exceed the manifest's connector limit.
 */
export function checkConnectorLimit(manifest: EntitlementManifest, currentCount: number): boolean {
  return currentCount < manifest.connectorLimit;
}

/**
 * Check whether a trial entitlement has expired based on effectiveUntil date.
 */
export function isTrialExpired(manifest: EntitlementManifest): boolean {
  if (manifest.status !== 'trial') return false;
  const now = new Date();
  const expiry = new Date(manifest.effective_until);
  return now > expiry;
}
