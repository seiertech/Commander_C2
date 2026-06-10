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
  manifestId: string | null;
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
    return { allowed: false, reason: 'No entitlement manifest found for tenant.', manifestId: null };
  }

  if (manifest.status === 'expired') {
    return { allowed: false, reason: 'Entitlement manifest has expired.', manifestId: manifest.manifestId };
  }

  if (manifest.status === 'suspended') {
    return { allowed: false, reason: 'Entitlement manifest is suspended.', manifestId: manifest.manifestId };
  }

  // Check feature-level flags
  if (feature === 'ai' && !manifest.aiEnabled) {
    return { allowed: false, reason: 'AI features are not enabled for this entitlement.', manifestId: manifest.manifestId };
  }
  if (feature === 'automation' && !manifest.automationEnabled) {
    return { allowed: false, reason: 'Automation features are not enabled for this entitlement.', manifestId: manifest.manifestId };
  }
  if (feature === 'fusion-map' && !manifest.fusionMapEnabled) {
    return { allowed: false, reason: 'Fusion Map is not enabled for this entitlement.', manifestId: manifest.manifestId };
  }

  // Check module-level access
  const module = manifest.modules.find((m) => m.moduleId === feature || m.name.toLowerCase().replace(/\s+/g, '-') === feature);
  if (module && !module.enabled) {
    return { allowed: false, reason: `Module "${module.name}" is not enabled for this entitlement.`, manifestId: manifest.manifestId };
  }

  return { allowed: true, reason: 'Entitlement check passed.', manifestId: manifest.manifestId };
}

/**
 * Check whether a specific module is accessible under the manifest.
 */
export function checkModuleAccess(manifest: EntitlementManifest, moduleId: string): boolean {
  const module = manifest.modules.find((m) => m.moduleId === moduleId);
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
  const expiry = new Date(manifest.effectiveUntil);
  return now > expiry;
}
