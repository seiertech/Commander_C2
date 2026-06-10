/**
 * Asset Authority Layer — Commander C2 Thesis Layer 4 (§8)
 *
 * Governed by: ISO/IEC 19770-1:2017
 * Purpose: Authoritative, trustworthy asset and software truth.
 * This is the non-negotiable single source of truth for technology entities.
 *
 * Entities: Asset, Software_Instance, Service, Asset_Service_Map
 * Naming: snake_case (thesis-literal)
 */

// ─── Asset Lifecycle State (ISO 19770 §8) ────────────────────────────────────

export const ASSET_LIFECYCLE_STATES_THESIS = ['planned', 'acquired', 'deployed', 'maintained', 'retired', 'disposed'] as const;
export type AssetLifecycleStateThesis = typeof ASSET_LIFECYCLE_STATES_THESIS[number];

// ─── Asset Entity ────────────────────────────────────────────────────────────

export interface AssetThesis {
  /** Unique asset identifier */
  asset_id: string;
  /** Asset display name */
  asset_name: string;
  /** Primary asset classification */
  asset_class: string;
  /** Secondary classification */
  asset_subclass: string;
  /** Platform/OS */
  platform: string;
  /** Deployment environment */
  environment: string;
  /** Physical or logical location */
  location: string;
  /** Asset owner */
  owner: string;
  /** Current lifecycle state (ISO 19770 §8) */
  lifecycle_state: AssetLifecycleStateThesis;
  /** Authoritative source system */
  source_of_truth: string;
  /** When first observed (ISO 8601) */
  first_seen: string;
  /** When last observed (ISO 8601) */
  last_seen: string;
  /** Governing standard */
  standard_marker: string;
}

// ─── Software_Instance Entity ────────────────────────────────────────────────

export const SOFTWARE_TYPES = ['os', 'application', 'agent', 'library', 'firmware'] as const;
export type SoftwareType = typeof SOFTWARE_TYPES[number];

export const SOFTWARE_INSTALL_STATES = ['installed', 'pending', 'removed'] as const;
export type SoftwareInstallState = typeof SOFTWARE_INSTALL_STATES[number];

export interface SoftwareInstance {
  /** Unique software instance ID */
  software_id: string;
  /** Host asset */
  asset_id: string;
  /** Software product name */
  software_name: string;
  /** Installed version */
  software_version: string;
  /** Software publisher */
  publisher: string;
  /** Installation state */
  install_state: SoftwareInstallState;
  /** Type classification */
  software_type: SoftwareType;
  /** Package/CPE reference */
  package_reference: string | null;
  /** Governing standard */
  standard_marker: string;
}

// ─── Service Entity ──────────────────────────────────────────────────────────

export const SERVICE_TIERS = ['tier_0', 'tier_1', 'tier_2', 'tier_3'] as const;
export type ServiceTier = typeof SERVICE_TIERS[number];

export interface ServiceEntity {
  /** Unique service identifier */
  service_id: string;
  /** Service name */
  service_name: string;
  /** Service owner */
  service_owner: string;
  /** Service tier */
  service_tier: ServiceTier;
  /** Business process dependency */
  business_dependency: string;
  /** Governing standard */
  standard_marker: string;
}

// ─── Asset_Service_Map Entity ────────────────────────────────────────────────

export const ASSET_SERVICE_RELATIONSHIPS = ['hosts', 'supports', 'consumes', 'depends_on'] as const;
export type AssetServiceRelationship = typeof ASSET_SERVICE_RELATIONSHIPS[number];

export interface AssetServiceMap {
  /** Unique mapping ID */
  asset_service_map_id: string;
  /** Asset in the relationship */
  asset_id: string;
  /** Service in the relationship */
  service_id: string;
  /** How asset relates to service */
  relationship_type: AssetServiceRelationship;
  /** Whether this is a critical dependency */
  critical_dependency_flag: boolean;
  /** Governing standard */
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface AssetThesisValidation { valid: boolean; errors: string[]; }
export interface SoftwareInstanceValidation { valid: boolean; errors: string[]; }
export interface ServiceEntityValidation { valid: boolean; errors: string[]; }
export interface AssetServiceMapValidation { valid: boolean; errors: string[]; }

export function validate_asset_thesis(a: AssetThesis): AssetThesisValidation {
  const errors: string[] = [];
  if (!a.asset_id || a.asset_id.trim() === '') errors.push('asset_id: required');
  if (!a.asset_name || a.asset_name.trim() === '') errors.push('asset_name: required');
  if (!a.asset_class || a.asset_class.trim() === '') errors.push('asset_class: required');
  if (!a.asset_subclass || a.asset_subclass.trim() === '') errors.push('asset_subclass: required');
  if (!a.platform || a.platform.trim() === '') errors.push('platform: required');
  if (!a.environment || a.environment.trim() === '') errors.push('environment: required');
  if (!a.location || a.location.trim() === '') errors.push('location: required');
  if (!a.owner || a.owner.trim() === '') errors.push('owner: required');
  if (!(ASSET_LIFECYCLE_STATES_THESIS as readonly string[]).includes(a.lifecycle_state)) {
    errors.push('lifecycle_state: must be planned | acquired | deployed | maintained | retired | disposed');
  }
  if (!a.source_of_truth || a.source_of_truth.trim() === '') errors.push('source_of_truth: required');
  if (!a.first_seen || a.first_seen.trim() === '') errors.push('first_seen: required');
  if (!a.last_seen || a.last_seen.trim() === '') errors.push('last_seen: required');
  if (!a.standard_marker || a.standard_marker.trim() === '') errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_software_instance(s: SoftwareInstance): SoftwareInstanceValidation {
  const errors: string[] = [];
  if (!s.software_id || s.software_id.trim() === '') errors.push('software_id: required');
  if (!s.asset_id || s.asset_id.trim() === '') errors.push('asset_id: required');
  if (!s.software_name || s.software_name.trim() === '') errors.push('software_name: required');
  if (!s.software_version || s.software_version.trim() === '') errors.push('software_version: required');
  if (!s.publisher || s.publisher.trim() === '') errors.push('publisher: required');
  if (!(SOFTWARE_INSTALL_STATES as readonly string[]).includes(s.install_state)) {
    errors.push('install_state: must be installed | pending | removed');
  }
  if (!(SOFTWARE_TYPES as readonly string[]).includes(s.software_type)) {
    errors.push('software_type: must be os | application | agent | library | firmware');
  }
  if (!s.standard_marker || s.standard_marker.trim() === '') errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_service_entity(sv: ServiceEntity): ServiceEntityValidation {
  const errors: string[] = [];
  if (!sv.service_id || sv.service_id.trim() === '') errors.push('service_id: required');
  if (!sv.service_name || sv.service_name.trim() === '') errors.push('service_name: required');
  if (!sv.service_owner || sv.service_owner.trim() === '') errors.push('service_owner: required');
  if (!(SERVICE_TIERS as readonly string[]).includes(sv.service_tier)) {
    errors.push('service_tier: must be tier_0 | tier_1 | tier_2 | tier_3');
  }
  if (!sv.business_dependency || sv.business_dependency.trim() === '') errors.push('business_dependency: required');
  if (!sv.standard_marker || sv.standard_marker.trim() === '') errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_asset_service_map(m: AssetServiceMap): AssetServiceMapValidation {
  const errors: string[] = [];
  if (!m.asset_service_map_id || m.asset_service_map_id.trim() === '') errors.push('asset_service_map_id: required');
  if (!m.asset_id || m.asset_id.trim() === '') errors.push('asset_id: required');
  if (!m.service_id || m.service_id.trim() === '') errors.push('service_id: required');
  if (!(ASSET_SERVICE_RELATIONSHIPS as readonly string[]).includes(m.relationship_type)) {
    errors.push('relationship_type: must be hosts | supports | consumes | depends_on');
  }
  if (typeof m.critical_dependency_flag !== 'boolean') errors.push('critical_dependency_flag: must be boolean');
  if (!m.standard_marker || m.standard_marker.trim() === '') errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}
