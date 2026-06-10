/**
 * Seed Topology Nodes & Edges — Commander C2 Fixtures
 *
 * Representative topology graph covering Commander's core infrastructure.
 * Nodes span all 4 TOGAF domains; edges model real dependency/flow patterns.
 *
 * Standards adherence:
 *   - TOGAF 10 domain classification on every node
 *   - commander_ prefix on all extension fields
 */

import type { TopologyNode } from '../entities/topology-node';
import type { TopologyEdge } from '../entities/topology-edge';
import { validateTopologyNode } from '../entities/topology-node';
import { validateTopologyEdge } from '../entities/topology-edge';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

// ─── Helper ──────────────────────────────────────────────────────────────────

const now = '2026-06-10T00:00:00.000Z';

function makeNode(seq: number, overrides: Partial<TopologyNode>): TopologyNode {
  const id = seedId('topology-node', seq);
  return {
    id,
    entityType: 'topology-node',
    tenant: SEED_TENANT,
    createdAt: now,
    updatedAt: now,
    source: SEED_SOURCE,
    nodeId: id,
    nodeName: '',
    fqdn: null,
    ipAddresses: [],
    cloudResourceId: null,
    nodeType: 'application',
    togafDomain: 'Technology',
    environment: 'production',
    zone: 'default',
    region: 'eu-west-1',
    status: 'active',
    discoveryMethod: 'manual',
    lastSeenAt: now,
    criticalityTier: 3,
    owner: 'Platform Team',
    costCentre: null,
    tags: [],
    commander_classificationId: null,
    commander_riskScore: null,
    ...overrides,
  } as TopologyNode;
}

function makeEdge(seq: number, overrides: Partial<TopologyEdge>): TopologyEdge {
  const id = seedId('topology-edge', seq);
  return {
    id,
    entityType: 'topology-edge',
    tenant: SEED_TENANT,
    createdAt: now,
    updatedAt: now,
    source: SEED_SOURCE,
    edgeId: id,
    sourceNodeId: '',
    targetNodeId: '',
    edgeType: 'dependency',
    protocol: 'https',
    port: 443,
    bidirectional: false,
    status: 'active',
    bandwidthMbps: null,
    latencyMs: null,
    encrypted: true,
    description: '',
    lastVerifiedAt: now,
    tags: [],
    commander_riskContribution: null,
    commander_dataClassification: null,
    ...overrides,
  } as TopologyEdge;
}

// ─── Seed Topology Nodes ─────────────────────────────────────────────────────

export const SEED_TOPOLOGY_NODES: TopologyNode[] = [
  // Core services
  makeNode(1, {
    nodeName: 'Signal Processor',
    nodeType: 'application',
    togafDomain: 'Application',
    fqdn: 'signal-processor.commander.internal',
    ipAddresses: ['10.0.1.10'],
    criticalityTier: 1,
    owner: 'Event Pipeline Team',
    tags: ['ocsf', 'ingestion', 'critical'],
    commander_classificationId: seedId('architecture-classification', 7),
  }),
  makeNode(2, {
    nodeName: 'AI Orchestrator',
    nodeType: 'application',
    togafDomain: 'Application',
    fqdn: 'ai-orchestrator.commander.internal',
    ipAddresses: ['10.0.1.20'],
    criticalityTier: 1,
    owner: 'AI Platform Team',
    tags: ['ai', 'orchestration', 'critical'],
    commander_classificationId: seedId('architecture-classification', 8),
  }),
  makeNode(3, {
    nodeName: 'Approval Engine',
    nodeType: 'application',
    togafDomain: 'Application',
    fqdn: 'approval-engine.commander.internal',
    ipAddresses: ['10.0.1.30'],
    criticalityTier: 2,
    owner: 'Workflow Team',
    tags: ['approval', 'ooda', 'workflow'],
    commander_classificationId: seedId('architecture-classification', 9),
  }),

  // Data tier
  makeNode(4, {
    nodeName: 'Event Store (Primary)',
    nodeType: 'database',
    togafDomain: 'Data',
    fqdn: 'event-store-primary.commander.internal',
    ipAddresses: ['10.0.2.10'],
    criticalityTier: 1,
    owner: 'Data Platform Team',
    tags: ['database', 'events', 'primary'],
    commander_classificationId: seedId('architecture-classification', 4),
    commander_riskScore: 15,
  }),
  makeNode(5, {
    nodeName: 'Standards Evidence DB',
    nodeType: 'database',
    togafDomain: 'Data',
    fqdn: 'standards-db.commander.internal',
    ipAddresses: ['10.0.2.20'],
    criticalityTier: 2,
    owner: 'Data Platform Team',
    tags: ['database', 'standards', 'evidence'],
    commander_classificationId: seedId('architecture-classification', 5),
  }),
  makeNode(6, {
    nodeName: 'Graph Database (Topology)',
    nodeType: 'database',
    togafDomain: 'Data',
    fqdn: 'graph-db.commander.internal',
    ipAddresses: ['10.0.2.30'],
    criticalityTier: 2,
    owner: 'Data Platform Team',
    tags: ['database', 'graph', 'topology'],
    commander_classificationId: seedId('architecture-classification', 6),
  }),

  // Infrastructure
  makeNode(7, {
    nodeName: 'AWS Bedrock Endpoint',
    nodeType: 'serverless',
    togafDomain: 'Technology',
    cloudResourceId: 'arn:aws:bedrock:eu-west-1:123456789:inference-profile/commander',
    ipAddresses: [],
    criticalityTier: 1,
    owner: 'AI Platform Team',
    environment: 'production',
    zone: 'aws-managed',
    tags: ['bedrock', 'llm', 'internal'],
    commander_classificationId: seedId('architecture-classification', 10),
  }),
  makeNode(8, {
    nodeName: 'Event Bus',
    nodeType: 'service',
    togafDomain: 'Technology',
    fqdn: 'event-bus.commander.internal',
    ipAddresses: ['10.0.3.10'],
    criticalityTier: 1,
    owner: 'Platform Team',
    tags: ['messaging', 'event-bus', 'critical'],
    commander_classificationId: seedId('architecture-classification', 11),
  }),
  makeNode(9, {
    nodeName: 'API Gateway',
    nodeType: 'network',
    togafDomain: 'Technology',
    fqdn: 'api.commander.io',
    ipAddresses: ['10.0.0.1'],
    criticalityTier: 1,
    owner: 'Platform Team',
    zone: 'dmz',
    tags: ['gateway', 'ingress', 'public'],
  }),
  makeNode(10, {
    nodeName: 'Identity Provider',
    nodeType: 'identity_provider',
    togafDomain: 'Technology',
    fqdn: 'auth.commander.io',
    ipAddresses: ['10.0.0.5'],
    criticalityTier: 1,
    owner: 'Security Team',
    zone: 'dmz',
    tags: ['auth', 'identity', 'critical'],
  }),
];

// ─── Seed Topology Edges ─────────────────────────────────────────────────────

export const SEED_TOPOLOGY_EDGES: TopologyEdge[] = [
  // API Gateway → Services
  makeEdge(1, {
    sourceNodeId: seedId('topology-node', 9),
    targetNodeId: seedId('topology-node', 1),
    edgeType: 'api_call',
    protocol: 'https',
    port: 443,
    description: 'API Gateway routes signal ingestion requests to Signal Processor',
    tags: ['ingress', 'signals'],
  }),
  makeEdge(2, {
    sourceNodeId: seedId('topology-node', 9),
    targetNodeId: seedId('topology-node', 3),
    edgeType: 'api_call',
    protocol: 'https',
    port: 443,
    description: 'API Gateway routes approval actions to Approval Engine',
    tags: ['ingress', 'approval'],
  }),

  // Signal Processor → Event Store
  makeEdge(3, {
    sourceNodeId: seedId('topology-node', 1),
    targetNodeId: seedId('topology-node', 4),
    edgeType: 'data_flow',
    protocol: 'tcp',
    port: 5432,
    description: 'Signal Processor writes normalised OCSF events to Event Store',
    tags: ['events', 'persistence'],
    commander_dataClassification: 'confidential',
  }),

  // Signal Processor → Event Bus
  makeEdge(4, {
    sourceNodeId: seedId('topology-node', 1),
    targetNodeId: seedId('topology-node', 8),
    edgeType: 'data_flow',
    protocol: 'amqp',
    port: 5672,
    description: 'Signal Processor publishes events to Event Bus for async consumers',
    tags: ['events', 'async', 'pub-sub'],
  }),

  // AI Orchestrator → Bedrock
  makeEdge(5, {
    sourceNodeId: seedId('topology-node', 2),
    targetNodeId: seedId('topology-node', 7),
    edgeType: 'api_call',
    protocol: 'https',
    port: 443,
    description: 'AI Orchestrator invokes Bedrock for inference (internal, invisible to customer)',
    tags: ['ai', 'inference', 'internal'],
    commander_dataClassification: 'internal',
  }),

  // Event Bus → AI Orchestrator
  makeEdge(6, {
    sourceNodeId: seedId('topology-node', 8),
    targetNodeId: seedId('topology-node', 2),
    edgeType: 'data_flow',
    protocol: 'amqp',
    port: 5672,
    description: 'Event Bus delivers events to AI Orchestrator for analysis',
    tags: ['events', 'ai', 'async'],
  }),

  // Approval Engine → Event Bus
  makeEdge(7, {
    sourceNodeId: seedId('topology-node', 3),
    targetNodeId: seedId('topology-node', 8),
    edgeType: 'data_flow',
    protocol: 'amqp',
    port: 5672,
    description: 'Approval Engine publishes decision events to Event Bus',
    tags: ['approval', 'events', 'async'],
  }),

  // Identity Provider → API Gateway (auth)
  makeEdge(8, {
    sourceNodeId: seedId('topology-node', 10),
    targetNodeId: seedId('topology-node', 9),
    edgeType: 'authentication',
    protocol: 'https',
    port: 443,
    bidirectional: true,
    description: 'Identity Provider validates tokens for API Gateway',
    tags: ['auth', 'security'],
  }),

  // Event Bus → Standards Evidence DB (audit trail)
  makeEdge(9, {
    sourceNodeId: seedId('topology-node', 8),
    targetNodeId: seedId('topology-node', 5),
    edgeType: 'data_flow',
    protocol: 'tcp',
    port: 5432,
    description: 'Event Bus persists standards adherence evidence',
    tags: ['standards', 'audit', 'persistence'],
    commander_dataClassification: 'internal',
  }),

  // Signal Processor → Graph DB (topology updates)
  makeEdge(10, {
    sourceNodeId: seedId('topology-node', 1),
    targetNodeId: seedId('topology-node', 6),
    edgeType: 'data_flow',
    protocol: 'tcp',
    port: 7687,
    description: 'Signal Processor updates topology graph on asset discovery events',
    tags: ['topology', 'discovery', 'graph'],
  }),
];

// ─── Validation Gates ────────────────────────────────────────────────────────

export function validateAllSeedTopologyNodes(): { index: number; errors: string[] }[] {
  const failures: { index: number; errors: string[] }[] = [];
  SEED_TOPOLOGY_NODES.forEach((node, index) => {
    const result = validateTopologyNode(node);
    if (!result.valid) {
      failures.push({ index, errors: result.errors });
    }
  });
  return failures;
}

export function validateAllSeedTopologyEdges(): { index: number; errors: string[] }[] {
  const failures: { index: number; errors: string[] }[] = [];
  SEED_TOPOLOGY_EDGES.forEach((edge, index) => {
    const result = validateTopologyEdge(edge);
    if (!result.valid) {
      failures.push({ index, errors: result.errors });
    }
  });
  return failures;
}
