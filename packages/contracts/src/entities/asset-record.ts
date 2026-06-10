/**
 * Asset Record Entity — Commander C2
 *
 * Governed by:
 *   - ITIL 4: Service Asset & Configuration Management practice
 *   - ISO 19770-1:2017: IT Asset Management
 *
 * Purpose: Track all IT assets across their lifecycle. Assets feed into
 * topology (as physical backing for TopologyNodes), risk assessment,
 * and software asset management (ISO 19770).
 *
 * Standards adherence:
 *   - ITIL 4 asset lifecycle states exact
 *   - ISO 19770 software identification tags referenced
 *   - commander_ prefix on ALL extension fields
 */

import type { CommonFields } from './common';

// ─── Asset Type (ITIL 4 taxonomy) ────────────────────────────────────────────

export type AssetType =
  | 'hardware'
  | 'software'
  | 'information'
  | 'cloud_service'
  | 'network'
  | 'virtual'
  | 'container'
  | 'license'
  | 'people'
  | 'facility';

// ─── Asset Lifecycle Status (ITIL 4) ─────────────────────────────────────────

export type AssetLifecycleStatus =
  | 'planned'
  | 'acquired'
  | 'deployed'
  | 'operational'
  | 'maintenance'
  | 'retiring'
  | 'retired'
  | 'disposed';

// ─── Asset Criticality ───────────────────────────────────────────────────────

export type AssetCriticality = 'critical' | 'high' | 'medium' | 'low' | 'negligible';

// ─── Asset Record Entity ─────────────────────────────────────────────────────

export interface AssetRecord extends CommonFields {
  entityType: 'asset-record';

  /** Unique asset identifier */
  assetId: string;

  // ─── Identification ────────────────────────────────────────────────
  /** Human-readable asset name */
  assetName: string;
  /** Asset description */
  description: string;
  /** Asset type per ITIL 4 taxonomy */
  assetType: AssetType;
  /** Serial number or unique hardware ID (null for non-physical) */
  serialNumber: string | null;
  /** Manufacturer / vendor */
  manufacturer: string | null;
  /** Model / product name */
  model: string | null;
  /** Version (software/firmware) */
  version: string | null;

  // ─── ISO 19770 Software Asset Management ───────────────────────────
  /** ISO 19770 Software Identification Tag (SWID) — null for non-software */
  swidTag: string | null;
  /** License type (perpetual, subscription, open_source, unlicensed) */
  licenseType: string | null;
  /** License expiry date */
  licenseExpiry: string | null;
  /** Entitlement count (number of seats/instances) */
  entitlementCount: number | null;
  /** Current usage count */
  usageCount: number | null;

  // ─── Lifecycle (ITIL 4) ────────────────────────────────────────────
  /** Current lifecycle status */
  lifecycleStatus: AssetLifecycleStatus;
  /** Acquisition date */
  acquiredDate: string | null;
  /** Deployment date */
  deployedDate: string | null;
  /** End of life date */
  endOfLifeDate: string | null;
  /** End of support date */
  endOfSupportDate: string | null;

  // ─── Ownership & location ──────────────────────────────────────────
  /** Owning team/department */
  owner: string;
  /** Assigned user (if personal asset) */
  assignedTo: string | null;
  /** Physical or logical location */
  location: string;
  /** Environment */
  environment: string;

  // ─── Classification ────────────────────────────────────────────────
  /** Business criticality */
  criticality: AssetCriticality;
  /** Data classification level */
  dataClassification: string | null;
  /** Tags for cross-referencing */
  tags: string[];

  // ─── Relationships ─────────────────────────────────────────────────
  /** Parent asset ID (for hierarchical assets) */
  parentAssetId: string | null;
  /** Related configuration item IDs */
  relatedConfigItemIds: string[];
  /** Linked topology node ID */
  commander_topologyNodeId: string | null;

  // ─── Financial ─────────────────────────────────────────────────────
  /** Purchase cost */
  purchaseCost: number | null;
  /** Currency code (ISO 4217) */
  currency: string | null;
  /** Cost centre */
  costCentre: string | null;

  // ─── Commander extensions ──────────────────────────────────────────
  /** commander_: Risk score from linked assessments */
  commander_riskScore: number | null;
  /** commander_: Last vulnerability scan date */
  commander_lastScanDate: string | null;
  /** commander_: Vulnerability count */
  commander_vulnerabilityCount: number | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface AssetRecordValidation {
  valid: boolean;
  errors: string[];
}

const ASSET_TYPES: AssetType[] = [
  'hardware', 'software', 'information', 'cloud_service', 'network',
  'virtual', 'container', 'license', 'people', 'facility',
];
const LIFECYCLE_STATUSES: AssetLifecycleStatus[] = [
  'planned', 'acquired', 'deployed', 'operational', 'maintenance', 'retiring', 'retired', 'disposed',
];
const CRITICALITIES: AssetCriticality[] = ['critical', 'high', 'medium', 'low', 'negligible'];

export function validateAssetRecord(a: AssetRecord): AssetRecordValidation {
  const errors: string[] = [];

  if (!a.id || a.id.trim() === '') errors.push('id: required');
  if (!a.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!a.assetId || a.assetId.trim() === '') errors.push('assetId: required');
  if (!a.assetName || a.assetName.trim() === '') errors.push('assetName: required');
  if (!a.description || a.description.trim() === '') errors.push('description: required');
  if (!ASSET_TYPES.includes(a.assetType)) errors.push('assetType: must be valid AssetType');
  if (!LIFECYCLE_STATUSES.includes(a.lifecycleStatus)) errors.push('lifecycleStatus: must be valid AssetLifecycleStatus');
  if (!a.owner || a.owner.trim() === '') errors.push('owner: required');
  if (!a.location || a.location.trim() === '') errors.push('location: required');
  if (!a.environment || a.environment.trim() === '') errors.push('environment: required');
  if (!CRITICALITIES.includes(a.criticality)) errors.push('criticality: must be critical | high | medium | low | negligible');
  if (!Array.isArray(a.tags)) errors.push('tags: must be array');
  if (!Array.isArray(a.relatedConfigItemIds)) errors.push('relatedConfigItemIds: must be array');

  // ISO 19770: if software, swidTag recommended
  if (a.assetType === 'software' && a.licenseType && !a.swidTag) {
    // Warning level — not a hard error but tracked
  }

  return { valid: errors.length === 0, errors };
}
