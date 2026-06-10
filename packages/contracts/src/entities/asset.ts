// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Asset Entity — Commander C2 Canonical Model
 *
 * Source: Spec #05 §6.4.2 Asset, Spec #46 Canonical Terminology
 * v1.3 Requirement 3: Asset fixture completeness
 * COIM-F: COIM operational-intelligence augmentation (additive optional fields)
 * Source: COIM v1.0 §6.1; 05_ATTRIBUTE_AND_DATA_EFFICIENCY_MODEL §13
 */

import type { CommonFields, SurfaceAttribution } from './common';
import type { SourceClassification } from './coim';

export interface Asset extends CommonFields {
  /** Canonical entity type discriminator */
  entity_type: 'asset';
  /** Asset display name */
  name: string;
  /** Asset classification */
  classification: AssetClassification;
  /** Ownership */
  owner: string;
  /** Environment (production, staging, development, etc.) */
  environment: string;
  /** Source system references */
  source_refs: string[];
  /** Attack surface attribution (Spec #60) */
  surface_attribution: SurfaceAttribution;
  /** Coverage-relevant fields */
  coverage: {
    has_edr: boolean;
    has_vuln_scan: boolean;
    has_patch_management: boolean;
    has_backup: boolean;
  };
  /** Business criticality (1-5) */
  criticality: number;
  /** Tags for grouping */
  tags: string[];

  // ─── COIM-F: Operational Intelligence Augmentation (additive optional) ───
  // Source: COIM v1.0 §6.1; 05_ATTRIBUTE_AND_DATA_EFFICIENCY_MODEL §13.
  // These fields are recommended where sources provide them. Optional at type
  // level for full backward-compatibility with existing fixtures and tests.

  /** Asset lifecycle state (COIM-F). Commander-tracked. */
  lifecycle_state?: AssetLifecycleState;

  /** Structured platform information (COIM-F). Source-provided. */
  platform?: AssetPlatform;

  /** Network position classification (COIM-F). Source-provided. */
  network_position?: AssetNetworkPosition;

  /**
   * Data classification for the asset (COIM-F).
   * Note: field name `assetDataClassification` to avoid collision with
   * the DB infrastructure `dataClassification` enum column.
   */
  assetDataClassification?: AssetDataClassification;

  /** When this asset was last confirmed active by a source (COIM-F timeline). */
  last_confirmed_at?: string;

  /** Which connector/source first discovered this asset (COIM-F timeline). */
  firstDiscoveredBy?: string;

  /**
   * Optional source classification for discovery signals (COIM-F).
   * Recommended where source provides structured discovery metadata.
   * Immutable after write; informs but never governs lifecycle/priority.
   */
  source_classification?: SourceClassification;
}

// ─── COIM-F: Asset Lifecycle State ──────────────────────────────────────────

/**
 * Asset lifecycle state — Commander-tracked.
 * COIM-F operational-intelligence field.
 */
export type AssetLifecycleState =
  | 'active'
  | 'decommissioned'
  | 'maintenance'
  | 'unknown';

export const ASSET_LIFECYCLE_STATES: AssetLifecycleState[] = [
  'active',
  'decommissioned',
  'maintenance',
  'unknown',
];

// ─── COIM-F: Asset Platform ──────────────────────────────────────────────────

/**
 * Structured platform information — source-provided.
 * COIM-F operational-intelligence field. OCSF influence: device.json.
 */
export interface AssetPlatform {
  /** Operating system or platform name (e.g. "Windows Server 2022", "Ubuntu 22.04") */
  os?: string;
  /** Platform version */
  version?: string;
  /** Cloud provider if applicable (e.g. "aws", "azure", "gcp") */
  cloud_provider?: string;
  /** Architecture (e.g. "x86_64", "arm64") */
  architecture?: string;
}

// ─── COIM-F: Asset Network Position ─────────────────────────────────────────

/**
 * Network position classification.
 * COIM-F operational-intelligence field.
 */
export type AssetNetworkPosition =
  | 'internet-facing'
  | 'dmz'
  | 'internal'
  | 'isolated'
  | 'unknown';

export const ASSET_NETWORK_POSITIONS: AssetNetworkPosition[] = [
  'internet-facing',
  'dmz',
  'internal',
  'isolated',
  'unknown',
];

// ─── COIM-F: Asset Data Classification ───────────────────────────────────────

/**
 * Data classification for data held by or processed by this asset.
 * Distinct from the DB infrastructure data_classification column.
 * COIM-F operational-intelligence field.
 */
export type AssetDataClassification =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted';

export const ASSET_DATA_CLASSIFICATIONS: AssetDataClassification[] = [
  'public',
  'internal',
  'confidential',
  'restricted',
];

// ─── Existing type (unchanged) ───────────────────────────────────────────────

export type AssetClassification =
  | 'endpoint'
  | 'server'
  | 'cloud-instance'
  | 'container'
  | 'network-device'
  | 'application'
  | 'database'
  | 'iot-device'
  | 'mobile-device';
