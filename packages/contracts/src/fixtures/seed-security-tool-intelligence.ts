/**
 * Seed Security Tool Intelligence — Commander C2 Test Fixtures
 *
 * Synthetic security tool intelligence records for tool effectiveness surfaces.
 * 4 records covering EDR, SIEM, vulnerability scanner and identity provider categories.
 * Source: Spec #61 Universal Security Signal Connector Contract
 */

import type { SecurityToolIntelligence } from '../entities/security-tool-intelligence';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, source_system: 'commander-engine-layer' };

export const seedSecurityToolIntelligence: SecurityToolIntelligence[] = [
  {
    id: seedId('tool-intel', 1),
    entity_type: 'security-tool-intelligence',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-tool-intel-001',
    connectorRef: 'connector-mock-edr-001',
    toolCategory: 'edr',
    effectivenessScore: 78,
    coverageContribution: 65,
    detectionCapabilities: ['malware_detection', 'lateral_movement', 'process_injection', 'credential_theft'],
    knownBlindSpots: ['fileless_attacks_in_memory', 'legacy_os_endpoints'],
    last_assessed_at: '2026-01-18T06:00:00.000Z',
    trend: 'stable',
    recommendedActions: ['Deploy agent to uncovered legacy endpoints', 'Enable memory scanning module'],
  },
  {
    id: seedId('tool-intel', 2),
    entity_type: 'security-tool-intelligence',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-tool-intel-001',
    connectorRef: 'connector-mock-siem-001',
    toolCategory: 'siem',
    effectivenessScore: 85,
    coverageContribution: 82,
    detectionCapabilities: ['log_correlation', 'anomaly_detection', 'adherence_monitoring', 'threat_hunting'],
    knownBlindSpots: ['encrypted_traffic_analysis', 'cloud_native_workload_logs'],
    last_assessed_at: '2026-01-18T06:00:00.000Z',
    trend: 'improving',
    recommendedActions: ['Onboard cloud-native workload log sources', 'Tune correlation rules for false positive reduction'],
  },
  {
    id: seedId('tool-intel', 3),
    entity_type: 'security-tool-intelligence',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-tool-intel-001',
    connectorRef: 'connector-mock-vuln-scanner-001',
    toolCategory: 'vulnerability_scanner',
    effectivenessScore: 62,
    coverageContribution: 55,
    detectionCapabilities: ['cve_detection', 'misconfiguration_scan', 'adherence_check'],
    knownBlindSpots: ['container_vulnerabilities', 'runtime_dependencies', 'zero_day_detection'],
    last_assessed_at: '2026-01-18T06:00:00.000Z',
    trend: 'degrading',
    recommendedActions: ['Add container scanning capability', 'Integrate software composition analysis', 'Increase scan frequency for internet-facing assets'],
  },
  {
    id: seedId('tool-intel', 4),
    entity_type: 'security-tool-intelligence',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-tool-intel-001',
    connectorRef: 'connector-mock-idp-001',
    toolCategory: 'identity_provider',
    effectivenessScore: 71,
    coverageContribution: 40,
    detectionCapabilities: ['authentication_monitoring', 'mfa_enforcement', 'conditional_access', 'session_management'],
    knownBlindSpots: ['service_account_monitoring', 'legacy_protocol_auth', 'cross_tenant_federation'],
    last_assessed_at: '2026-01-18T06:00:00.000Z',
    trend: 'stable',
    recommendedActions: ['Enable service account activity monitoring', 'Block legacy authentication protocols', 'Implement cross-tenant access reviews'],
  },
];
