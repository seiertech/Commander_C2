/**
 * Seed Asset & Configuration Fixtures — Commander C2
 *
 * ITIL 4 asset records and configuration items with lifecycle management.
 * ISO 19770 software identification where applicable.
 */

import type { AssetRecord } from '../entities/asset-record';
import type { ConfigurationItem } from '../entities/configuration-item';
import { validateAssetRecord } from '../entities/asset-record';
import { validateConfigurationItem } from '../entities/configuration-item';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const now = '2026-06-10T00:00:00.000Z';

// ─── Asset Record Fixtures ───────────────────────────────────────────────────

function makeAsset(seq: number, overrides: Partial<AssetRecord>): AssetRecord {
  const id = seedId('asset-record', seq);
  return {
    id,
    entityType: 'asset-record',
    tenant: SEED_TENANT,
    createdAt: now,
    updatedAt: now,
    source: SEED_SOURCE,
    assetId: id,
    assetName: '',
    description: '',
    assetType: 'software',
    serialNumber: null,
    manufacturer: null,
    model: null,
    version: null,
    swidTag: null,
    licenseType: null,
    licenseExpiry: null,
    entitlementCount: null,
    usageCount: null,
    lifecycleStatus: 'operational',
    acquiredDate: null,
    deployedDate: now,
    endOfLifeDate: null,
    endOfSupportDate: null,
    owner: 'Platform Team',
    assignedTo: null,
    location: 'eu-west-1',
    environment: 'production',
    criticality: 'high',
    dataClassification: null,
    tags: [],
    parentAssetId: null,
    relatedConfigItemIds: [],
    commander_topologyNodeId: null,
    purchaseCost: null,
    currency: null,
    costCentre: null,
    commander_riskScore: null,
    commander_lastScanDate: null,
    commander_vulnerabilityCount: null,
    ...overrides,
  } as AssetRecord;
}

export const SEED_ASSET_RECORDS: AssetRecord[] = [
  makeAsset(1, {
    assetName: 'Event Store PostgreSQL Cluster',
    description: 'Primary PostgreSQL cluster for OCSF event persistence',
    assetType: 'software',
    manufacturer: 'PostgreSQL Global Development Group',
    model: 'PostgreSQL',
    version: '16.2',
    licenseType: 'open_source',
    lifecycleStatus: 'operational',
    criticality: 'critical',
    dataClassification: 'confidential',
    commander_topologyNodeId: seedId('topology-node', 4),
    commander_riskScore: 15,
    commander_lastScanDate: now,
    commander_vulnerabilityCount: 2,
    tags: ['database', 'events', 'critical'],
  }),
  makeAsset(2, {
    assetName: 'Commander AI Orchestrator Service',
    description: 'AI persona routing and channel orchestration microservice',
    assetType: 'software',
    manufacturer: 'Seiertech',
    model: 'Commander AI Orchestrator',
    version: '1.0.0',
    licenseType: 'perpetual',
    lifecycleStatus: 'operational',
    criticality: 'critical',
    commander_topologyNodeId: seedId('topology-node', 2),
    tags: ['ai', 'orchestration', 'internal'],
  }),
  makeAsset(3, {
    assetName: 'Graph Database (Neo4j)',
    description: 'Topology graph database for infrastructure relationship modelling',
    assetType: 'software',
    manufacturer: 'Neo4j Inc',
    model: 'Neo4j Enterprise',
    version: '5.18',
    swidTag: 'swid:neo4j-enterprise-5.18',
    licenseType: 'subscription',
    licenseExpiry: '2027-06-10T00:00:00.000Z',
    entitlementCount: 1,
    usageCount: 1,
    lifecycleStatus: 'operational',
    criticality: 'high',
    commander_topologyNodeId: seedId('topology-node', 6),
    tags: ['database', 'graph', 'topology'],
  }),
  makeAsset(4, {
    assetName: 'API Gateway (Kong)',
    description: 'Ingress API gateway with rate limiting and auth integration',
    assetType: 'software',
    manufacturer: 'Kong Inc',
    model: 'Kong Gateway Enterprise',
    version: '3.6',
    swidTag: 'swid:kong-enterprise-3.6',
    licenseType: 'subscription',
    licenseExpiry: '2027-01-01T00:00:00.000Z',
    entitlementCount: 5,
    usageCount: 2,
    lifecycleStatus: 'operational',
    criticality: 'critical',
    commander_topologyNodeId: seedId('topology-node', 9),
    tags: ['gateway', 'ingress', 'security'],
  }),
  makeAsset(5, {
    assetName: 'Event Bus (RabbitMQ)',
    description: 'Async message broker for event distribution',
    assetType: 'software',
    manufacturer: 'Broadcom / VMware',
    model: 'RabbitMQ',
    version: '3.13',
    licenseType: 'open_source',
    lifecycleStatus: 'operational',
    criticality: 'critical',
    commander_topologyNodeId: seedId('topology-node', 8),
    commander_riskScore: 12,
    tags: ['messaging', 'event-bus', 'critical'],
  }),
  makeAsset(6, {
    assetName: 'Identity Provider (Keycloak)',
    description: 'Multi-tenant identity and access management platform',
    assetType: 'software',
    manufacturer: 'Red Hat / CNCF',
    model: 'Keycloak',
    version: '24.0',
    licenseType: 'open_source',
    lifecycleStatus: 'operational',
    criticality: 'critical',
    commander_topologyNodeId: seedId('topology-node', 10),
    tags: ['identity', 'auth', 'critical'],
  }),
];

// ─── Configuration Item Fixtures ─────────────────────────────────────────────

function makeCi(seq: number, overrides: Partial<ConfigurationItem>): ConfigurationItem {
  const id = seedId('configuration-item', seq);
  return {
    id,
    entityType: 'configuration-item',
    tenant: SEED_TENANT,
    createdAt: now,
    updatedAt: now,
    source: SEED_SOURCE,
    ciId: id,
    ciName: '',
    description: '',
    ciType: 'application',
    version: '1.0.0',
    status: 'active',
    currentConfiguration: {},
    baselineConfiguration: {},
    driftStatus: 'compliant',
    lastDriftCheck: now,
    driftedFields: [],
    owner: 'Platform Team',
    managedBy: 'Platform Team',
    environment: 'production',
    parentCiId: null,
    assetId: null,
    dependentCiIds: [],
    dependencyCiIds: [],
    lastChangeId: null,
    lastChangeAt: null,
    changeCount30d: 0,
    tags: [],
    commander_topologyNodeId: null,
    commander_configRiskScore: null,
    commander_autoRemediationEligible: false,
    ...overrides,
  } as ConfigurationItem;
}

export const SEED_CONFIGURATION_ITEMS: ConfigurationItem[] = [
  makeCi(1, {
    ciName: 'Event Store — Connection Pool Config',
    description: 'PostgreSQL connection pool settings for event store',
    ciType: 'database',
    version: '2.1.0',
    assetId: seedId('asset-record', 1),
    currentConfiguration: {
      max_connections: 200,
      idle_timeout_ms: 30000,
      ssl_mode: 'require',
      statement_timeout_ms: 60000,
    },
    baselineConfiguration: {
      max_connections: 200,
      idle_timeout_ms: 30000,
      ssl_mode: 'require',
      statement_timeout_ms: 60000,
    },
    driftStatus: 'compliant',
    commander_topologyNodeId: seedId('topology-node', 4),
    commander_autoRemediationEligible: true,
    tags: ['database', 'performance', 'connection-pool'],
  }),
  makeCi(2, {
    ciName: 'API Gateway — Rate Limiting Policy',
    description: 'Kong rate limiting configuration per tenant tier',
    ciType: 'policy',
    version: '1.3.0',
    assetId: seedId('asset-record', 4),
    currentConfiguration: {
      tier_standard: { requests_per_minute: 100, burst: 20 },
      tier_premium: { requests_per_minute: 1000, burst: 200 },
      tier_enterprise: { requests_per_minute: 10000, burst: 2000 },
    },
    baselineConfiguration: {
      tier_standard: { requests_per_minute: 100, burst: 20 },
      tier_premium: { requests_per_minute: 1000, burst: 200 },
      tier_enterprise: { requests_per_minute: 10000, burst: 2000 },
    },
    driftStatus: 'compliant',
    commander_topologyNodeId: seedId('topology-node', 9),
    tags: ['gateway', 'rate-limiting', 'policy'],
  }),
  makeCi(3, {
    ciName: 'Event Bus — Queue Configuration',
    description: 'RabbitMQ queue declarations and routing configuration',
    ciType: 'infrastructure',
    version: '3.2.0',
    assetId: seedId('asset-record', 5),
    currentConfiguration: {
      durable: true,
      auto_delete: false,
      max_length: 1000000,
      message_ttl_ms: 86400000,
      dead_letter_exchange: 'commander.dlx',
      ha_policy: 'all',
    },
    baselineConfiguration: {
      durable: true,
      auto_delete: false,
      max_length: 1000000,
      message_ttl_ms: 86400000,
      dead_letter_exchange: 'commander.dlx',
      ha_policy: 'all',
    },
    driftStatus: 'compliant',
    commander_topologyNodeId: seedId('topology-node', 8),
    commander_autoRemediationEligible: true,
    tags: ['messaging', 'queues', 'infrastructure'],
  }),
  makeCi(4, {
    ciName: 'Identity Provider — OIDC Configuration',
    description: 'Keycloak OIDC realm and client configuration for Commander',
    ciType: 'security_control',
    version: '2.0.0',
    assetId: seedId('asset-record', 6),
    currentConfiguration: {
      realm: 'commander',
      token_lifespan_minutes: 15,
      refresh_lifespan_hours: 8,
      mfa_required: true,
      password_policy: 'length(12) and upperCase(1) and specialChars(1)',
      brute_force_detection: true,
    },
    baselineConfiguration: {
      realm: 'commander',
      token_lifespan_minutes: 15,
      refresh_lifespan_hours: 8,
      mfa_required: true,
      password_policy: 'length(12) and upperCase(1) and specialChars(1)',
      brute_force_detection: true,
    },
    driftStatus: 'compliant',
    commander_topologyNodeId: seedId('topology-node', 10),
    tags: ['identity', 'oidc', 'security'],
  }),
  makeCi(5, {
    ciName: 'AI Orchestrator — Model Routing Table',
    description: 'Routing configuration for AI persona-to-model mapping',
    ciType: 'application',
    version: '1.1.0',
    assetId: seedId('asset-record', 2),
    currentConfiguration: {
      default_provider: 'bedrock',
      default_model: 'anthropic.claude-3-5-sonnet',
      byok_override_enabled: true,
      max_tokens: 4096,
      temperature: 0.3,
      fallback_model: 'anthropic.claude-3-haiku',
    },
    baselineConfiguration: {
      default_provider: 'bedrock',
      default_model: 'anthropic.claude-3-5-sonnet',
      byok_override_enabled: true,
      max_tokens: 4096,
      temperature: 0.3,
      fallback_model: 'anthropic.claude-3-haiku',
    },
    driftStatus: 'compliant',
    commander_topologyNodeId: seedId('topology-node', 2),
    changeCount30d: 3,
    tags: ['ai', 'routing', 'model-config'],
  }),
];

// ─── Validation Gates ────────────────────────────────────────────────────────

export function validateAllSeedAssetRecords(): { index: number; errors: string[] }[] {
  const failures: { index: number; errors: string[] }[] = [];
  SEED_ASSET_RECORDS.forEach((a, index) => {
    const result = validateAssetRecord(a);
    if (!result.valid) failures.push({ index, errors: result.errors });
  });
  return failures;
}

export function validateAllSeedConfigurationItems(): { index: number; errors: string[] }[] {
  const failures: { index: number; errors: string[] }[] = [];
  SEED_CONFIGURATION_ITEMS.forEach((ci, index) => {
    const result = validateConfigurationItem(ci);
    if (!result.valid) failures.push({ index, errors: result.errors });
  });
  return failures;
}
