/**
 * Topology Edge Entity — Commander C2
 *
 * Governed by:
 *   - TOGAF 10: Technology Architecture relationship modelling
 *   - Zachman Framework: "How" aspect (process/flow connections)
 *
 * Purpose: Define directional relationships between TopologyNodes.
 * Edges model data flow, dependency, containment, and network connectivity.
 * Together with TopologyNode, they form the enterprise topology graph.
 */

import type { CommonFields } from './common';

// ─── Edge Types ──────────────────────────────────────────────────────────────

export type TopologyEdgeType =
  | 'data_flow'
  | 'dependency'
  | 'containment'
  | 'network_link'
  | 'api_call'
  | 'authentication'
  | 'replication'
  | 'failover'
  | 'load_balance'
  | 'logical_group';

// ─── Edge Status ─────────────────────────────────────────────────────────────

export type TopologyEdgeStatus = 'active' | 'inactive' | 'degraded' | 'unknown';

// ─── Protocol ────────────────────────────────────────────────────────────────

export type EdgeProtocol =
  | 'tcp'
  | 'udp'
  | 'http'
  | 'https'
  | 'grpc'
  | 'amqp'
  | 'mqtt'
  | 'websocket'
  | 'tls'
  | 'ssh'
  | 'custom'
  | 'unknown';

// ─── Topology Edge Entity ────────────────────────────────────────────────────

export interface TopologyEdge extends CommonFields {
  entityType: 'topology-edge';

  /** Unique edge identifier */
  edgeId: string;

  // ─── Endpoints ─────────────────────────────────────────────────────
  /** Source node ID (TopologyNode.nodeId) */
  sourceNodeId: string;
  /** Target node ID (TopologyNode.nodeId) */
  targetNodeId: string;

  // ─── Classification ────────────────────────────────────────────────
  /** Relationship type */
  edgeType: TopologyEdgeType;
  /** Communication protocol */
  protocol: EdgeProtocol;
  /** Port number (null for logical relationships) */
  port: number | null;
  /** Whether the relationship is bidirectional */
  bidirectional: boolean;

  // ─── Operational ───────────────────────────────────────────────────
  /** Current operational status */
  status: TopologyEdgeStatus;
  /** Bandwidth capacity (Mbps, null if not applicable) */
  bandwidthMbps: number | null;
  /** Latency SLA (ms, null if not measured) */
  latencyMs: number | null;
  /** Whether this edge is encrypted in transit */
  encrypted: boolean;

  // ─── Governance ────────────────────────────────────────────────────
  /** Human-readable description of this relationship */
  description: string;
  /** Last time this edge was verified */
  lastVerifiedAt: string;
  /** Tags for cross-referencing */
  tags: string[];

  // ─── Commander extensions ──────────────────────────────────────────
  /** commander_: Risk contribution from this edge */
  commander_riskContribution: number | null;
  /** commander_: Data classification level traversing this edge */
  commander_dataClassification: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface TopologyEdgeValidation {
  valid: boolean;
  errors: string[];
}

const EDGE_TYPES: TopologyEdgeType[] = [
  'data_flow', 'dependency', 'containment', 'network_link', 'api_call',
  'authentication', 'replication', 'failover', 'load_balance', 'logical_group',
];
const EDGE_STATUSES: TopologyEdgeStatus[] = ['active', 'inactive', 'degraded', 'unknown'];
const EDGE_PROTOCOLS: EdgeProtocol[] = [
  'tcp', 'udp', 'http', 'https', 'grpc', 'amqp', 'mqtt', 'websocket', 'tls', 'ssh', 'custom', 'unknown',
];

export function validateTopologyEdge(e: TopologyEdge): TopologyEdgeValidation {
  const errors: string[] = [];

  if (!e.id || e.id.trim() === '') errors.push('id: required');
  if (!e.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!e.edgeId || e.edgeId.trim() === '') errors.push('edgeId: required');
  if (!e.sourceNodeId || e.sourceNodeId.trim() === '') errors.push('sourceNodeId: required');
  if (!e.targetNodeId || e.targetNodeId.trim() === '') errors.push('targetNodeId: required');
  if (e.sourceNodeId === e.targetNodeId) errors.push('sourceNodeId/targetNodeId: must differ (no self-loops)');
  if (!EDGE_TYPES.includes(e.edgeType)) {
    errors.push('edgeType: must be valid TopologyEdgeType');
  }
  if (!EDGE_PROTOCOLS.includes(e.protocol)) {
    errors.push('protocol: must be valid EdgeProtocol');
  }
  if (!EDGE_STATUSES.includes(e.status)) {
    errors.push('status: must be active | inactive | degraded | unknown');
  }
  if (typeof e.bidirectional !== 'boolean') errors.push('bidirectional: must be boolean');
  if (typeof e.encrypted !== 'boolean') errors.push('encrypted: must be boolean');
  if (!e.description || e.description.trim() === '') errors.push('description: required');
  if (!e.lastVerifiedAt || e.lastVerifiedAt.trim() === '') errors.push('lastVerifiedAt: required');
  if (!Array.isArray(e.tags)) errors.push('tags: must be array');

  return { valid: errors.length === 0, errors };
}
