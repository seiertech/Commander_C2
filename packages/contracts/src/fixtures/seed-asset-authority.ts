/**
 * Layer 4 Fixtures — Asset Authority
 *
 * Thesis §8: Asset, Software_Instance, Service, Asset_Service_Map
 * Standard: ISO/IEC 19770-1:2017
 */

import type { AssetThesis, SoftwareInstance, ServiceEntity, AssetServiceMap } from '../entities/asset-authority';

export const ASSET_THESIS_FIXTURES: AssetThesis[] = [
  { asset_id: 'asset-001', asset_name: 'ws-fin-042', asset_class: 'endpoint', asset_subclass: 'workstation', platform: 'Windows 11 Enterprise', environment: 'production', location: 'London HQ - Floor 3', owner: 'Finance Team', lifecycle_state: 'deployed', source_of_truth: 'CrowdStrike Falcon', first_seen: '2024-03-15T00:00:00Z', last_seen: '2026-06-10T08:00:00Z', standard_marker: 'ISO/IEC 19770-1:2017' },
  { asset_id: 'asset-002', asset_name: 'db-prod-01', asset_class: 'server', asset_subclass: 'database', platform: 'Ubuntu 22.04 LTS', environment: 'production', location: 'AWS eu-west-1a', owner: 'Platform Engineering', lifecycle_state: 'deployed', source_of_truth: 'AWS Config', first_seen: '2023-11-01T00:00:00Z', last_seen: '2026-06-10T02:30:00Z', standard_marker: 'ISO/IEC 19770-1:2017' },
  { asset_id: 'asset-003', asset_name: 'api-gateway-01', asset_class: 'network', asset_subclass: 'gateway', platform: 'AWS API Gateway', environment: 'production', location: 'AWS eu-west-1', owner: 'Platform Engineering', lifecycle_state: 'deployed', source_of_truth: 'AWS Config', first_seen: '2023-08-20T00:00:00Z', last_seen: '2026-06-10T09:00:00Z', standard_marker: 'ISO/IEC 19770-1:2017' },
  { asset_id: 'asset-004', asset_name: 'idp-prod-01', asset_class: 'identity', asset_subclass: 'identity_provider', platform: 'Entra ID', environment: 'production', location: 'Microsoft Cloud', owner: 'Identity Team', lifecycle_state: 'deployed', source_of_truth: 'Microsoft Entra', first_seen: '2022-06-01T00:00:00Z', last_seen: '2026-06-10T09:22:00Z', standard_marker: 'ISO/IEC 19770-1:2017' },
];

export const SOFTWARE_INSTANCE_FIXTURES: SoftwareInstance[] = [
  { software_id: 'sw-001', asset_id: 'asset-001', software_name: 'Microsoft Office 365', software_version: '16.0.17928', publisher: 'Microsoft', install_state: 'installed', software_type: 'application', package_reference: 'cpe:2.3:a:microsoft:office:2024:*:*:*:*:*:*:*', standard_marker: 'ISO/IEC 19770-1:2017' },
  { software_id: 'sw-002', asset_id: 'asset-001', software_name: 'CrowdStrike Falcon Sensor', software_version: '7.14.17409', publisher: 'CrowdStrike', install_state: 'installed', software_type: 'agent', package_reference: null, standard_marker: 'ISO/IEC 19770-1:2017' },
  { software_id: 'sw-003', asset_id: 'asset-002', software_name: 'PostgreSQL', software_version: '16.3', publisher: 'PostgreSQL Global Development Group', install_state: 'installed', software_type: 'application', package_reference: 'cpe:2.3:a:postgresql:postgresql:16.3:*:*:*:*:*:*:*', standard_marker: 'ISO/IEC 19770-1:2017' },
  { software_id: 'sw-004', asset_id: 'asset-002', software_name: 'Ubuntu Linux', software_version: '22.04.4 LTS', publisher: 'Canonical', install_state: 'installed', software_type: 'os', package_reference: 'cpe:2.3:o:canonical:ubuntu_linux:22.04:*:*:*:lts:*:*:*', standard_marker: 'ISO/IEC 19770-1:2017' },
];

export const SERVICE_ENTITY_FIXTURES: ServiceEntity[] = [
  { service_id: 'svc-001', service_name: 'Financial Reporting Platform', service_owner: 'CFO Office', service_tier: 'tier_0', business_dependency: 'Monthly financial close, regulatory reporting', standard_marker: 'ITIL 4' },
  { service_id: 'svc-002', service_name: 'Customer API Gateway', service_owner: 'Platform Engineering', service_tier: 'tier_1', business_dependency: 'All customer-facing API traffic', standard_marker: 'ITIL 4' },
  { service_id: 'svc-003', service_name: 'Identity & Access Management', service_owner: 'Identity Team', service_tier: 'tier_0', business_dependency: 'Authentication and authorisation for all services', standard_marker: 'ITIL 4' },
];

export const ASSET_SERVICE_MAP_FIXTURES: AssetServiceMap[] = [
  { asset_service_map_id: 'asm-001', asset_id: 'asset-002', service_id: 'svc-001', relationship_type: 'hosts', critical_dependency_flag: true, standard_marker: 'ISO 19770 + ITIL' },
  { asset_service_map_id: 'asm-002', asset_id: 'asset-003', service_id: 'svc-002', relationship_type: 'hosts', critical_dependency_flag: true, standard_marker: 'ISO 19770 + ITIL' },
  { asset_service_map_id: 'asm-003', asset_id: 'asset-004', service_id: 'svc-003', relationship_type: 'hosts', critical_dependency_flag: true, standard_marker: 'ISO 19770 + ITIL' },
  { asset_service_map_id: 'asm-004', asset_id: 'asset-001', service_id: 'svc-001', relationship_type: 'consumes', critical_dependency_flag: false, standard_marker: 'ISO 19770 + ITIL' },
];
