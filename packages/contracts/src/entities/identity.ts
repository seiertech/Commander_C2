// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Identity Entity — Commander C2 Canonical Model
 *
 * Source: Spec #05 §6.4.3 Identity, Spec #18 Unified Identity Architecture
 * v1.3 Requirement 4: Identity fixture completeness
 * COIM-F: COIM operational-intelligence augmentation (additive optional fields)
 * Source: COIM v1.0 §6.2; 05_ATTRIBUTE_AND_DATA_EFFICIENCY_MODEL §13
 */

import type { CommonFields, SurfaceAttribution } from './common';
import type { SourceClassification } from './coim';

export interface Identity extends CommonFields {
  entity_type: 'identity';
  /** Display name */
  display_name: string;
  /** Identity classification per Spec #18 */
  classification: IdentityClassification;
  /** Source system lineage */
  source_system_lineage: string[];
  /** Email (synthetic — never real) */
  email: string;
  /** Department or team */
  department: string;
  /** Role title */
  role: string;
  /** Risk score (0-100) */
  risk_score: number;
  /** Surface attribution */
  surface_attribution: SurfaceAttribution;
  /** Associated asset IDs */
  associated_assets: string[];
  /** Account status */
  status: 'active' | 'suspended' | 'disabled' | 'orphaned';

  // ─── COIM-F: Operational Intelligence Augmentation (additive optional) ───
  // Source: COIM v1.0 §6.2; 05_ATTRIBUTE_AND_DATA_EFFICIENCY_MODEL §13.
  // These fields are recommended where sources provide them. Optional at type
  // level for full backward-compatibility with existing fixtures and tests.

  /** Privilege level of this identity (COIM-F). Source-assessed. */
  privilege_level?: IdentityPrivilegeLevel;

  /** Authentication strength classification (COIM-F). Source-assessed. */
  authenticationStrength?: IdentityAuthStrength;

  /** When this identity last authenticated (COIM-F timeline). Source-provided. */
  lastAuthenticatedAt?: string;

  /**
   * Entitlement summary — high-level summary of what this identity can access
   * (COIM-F). Commander-computed from entitlement scanning.
   */
  entitlementSummary?: IdentityEntitlementSummary;

  /**
   * Risk factors contributing to the overall risk score (COIM-F).
   * Commander-computed. Used to explain riskScore to analysts.
   */
  riskFactors?: IdentityRiskFactor[];

  /**
   * Optional source classification for IAM signals (COIM-F).
   * Recommended where source provides structured IAM signal metadata.
   * Immutable after write; informs but never governs lifecycle/priority.
   */
  source_classification?: SourceClassification;
}

// ─── COIM-F: Identity Privilege Level ───────────────────────────────────────

/**
 * Privilege level classification.
 * COIM-F operational-intelligence field.
 */
export type IdentityPrivilegeLevel =
  | 'standard'
  | 'elevated'
  | 'privileged'
  | 'super-privileged';

export const IDENTITY_PRIVILEGE_LEVELS: IdentityPrivilegeLevel[] = [
  'standard',
  'elevated',
  'privileged',
  'super-privileged',
];

// ─── COIM-F: Identity Authentication Strength ───────────────────────────────

/**
 * Authentication strength classification.
 * COIM-F operational-intelligence field.
 */
export type IdentityAuthStrength =
  | 'password-only'
  | 'mfa-enabled'
  | 'phishing-resistant-mfa'
  | 'certificate-based'
  | 'unknown';

export const IDENTITY_AUTH_STRENGTHS: IdentityAuthStrength[] = [
  'password-only',
  'mfa-enabled',
  'phishing-resistant-mfa',
  'certificate-based',
  'unknown',
];

// ─── COIM-F: Identity Entitlement Summary ───────────────────────────────────

/**
 * High-level summary of identity entitlements.
 * COIM-F operational-intelligence field. Commander-computed.
 */
export interface IdentityEntitlementSummary {
  /** Total count of entitlements/permissions granted */
  totalEntitlements: number;
  /** Count of privileged/sensitive entitlements */
  privilegedEntitlements: number;
  /** Count of entitlements that are stale (last reviewed >90 days ago) */
  staleEntitlements: number;
  /** Whether this identity has admin/root equivalent access */
  hasAdminAccess: boolean;
}

// ─── COIM-F: Identity Risk Factor ───────────────────────────────────────────

/**
 * Individual risk factor contributing to the identity risk score.
 * COIM-F operational-intelligence field.
 */
export type IdentityRiskFactorType =
  | 'stale_credentials'
  | 'excessive_privileges'
  | 'no_mfa'
  | 'anomalous_activity'
  | 'third_party_access'
  | 'shared_account'
  | 'dormant_account';

export interface IdentityRiskFactor {
  /** Type of risk factor */
  type: IdentityRiskFactorType;
  /** Severity contribution (0-100) */
  contribution: number;
  /** Human-readable description */
  description: string;
}

export const IDENTITY_RISK_FACTOR_TYPES: IdentityRiskFactorType[] = [
  'stale_credentials',
  'excessive_privileges',
  'no_mfa',
  'anomalous_activity',
  'third_party_access',
  'shared_account',
  'dormant_account',
];

// ─── Existing type (unchanged) ───────────────────────────────────────────────

export type IdentityClassification =
  | 'human'
  | 'service-account'
  | 'workload-identity'
  | 'third-party';
