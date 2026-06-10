/**
 * Topology Node Entity — Commander C2
 *
 * Governed by:
 *   - TOGAF 10: Technology Architecture component modelling
 *   - Zachman Framework: "Where" aspect (network/location topology)
 *
 * Purpose: Represent a node in Commander's enterprise topology graph.
 * Nodes are any addressable infrastructure, application, or logical component.
 * Edges (topology-edge.ts) define relationships between nodes.
 *
 * Supports: auto-discovery, manual declaration, import from CMDB connectors.
 */

import type { CommonFields } from './common';
import type { TogafDomain } from './architecture-classification';

// ─── Node Types ──────────────────────────────────────────────────────────────

export type TopologyNodeType =
  | 'compute'
  | 'storage'
  | 'network'
  | 'application'
  | 'service'
  | 'database'
  | 'container'
  | 'serverless'
  | 'endpoint'
  | 'identity_provider'
  | 'logical_group'
  | 'external';

// ─── Node Status ─────────────────────────────────────────────────────────────

export type TopologyNodeStatus =
  | 'active'
  | 'inactive'
  | 'degraded'
  | 'decommissioned'
  | 'unknown';

// ─── Discovery Method ────────────────────────────────────────────────────────

export type DiscoveryMethod =
  | 'auto_discovery'
  | 'manual'
  | 'cmdb_import'
  | 'agent_reported'
  | 'api_registration';

// ─── Topology Node Entity ────────────────────────────────────────────────────

export interface TopologyNode extends CommonFields {
  entityType: 'topology-node';

  /** Unique node identifier */
  nodeId: string;

  // ─── Identity ──────────────────────────────────────────────────────
  /** Human-readable node name */
  nodeName: string;
  /** Fully qualified domain name or address */
  fqdn: string | null;
  /** IP addresses (IPv4/IPv6) */
  ipAddresses: string[];
  /** Cloud provider resource ID (ARN, resource URI, etc.) */
  cloudResourceId: string | null;

  // ─── Classification ────────────────────────────────────────────────
  /** Node type */
  nodeType: TopologyNodeType;
  /** TOGAF domain this node belongs to */
  togafDomain: TogafDomain;
  /** Environment (production, staging, development, etc.) */
  environment: string;
  /** Logical zone or segment */
  zone: string;
  /** Region / data centre location */
  region: string;

  // ─── Operational ───────────────────────────────────────────────────
  /** Current operational status */
  status: TopologyNodeStatus;
  /** How this node was discovered */
  discoveryMethod: DiscoveryMethod;
  /** Last time this node reported or was verified */
  lastSeenAt: string;
  /** Criticality tier (1=highest, 5=lowest) */
  criticalityTier: number;

  // ─── Ownership ─────────────────────────────────────────────────────
  /** Owning team or business unit */
  owner: string;
  /** Cost centre or billing tag */
  costCentre: string | null;
  /** Tags for cross-referencing */
  tags: string[];

  // ─── Commander extensions ──────────────────────────────────────────
  /** commander_: Architecture classification ID (link to ArchitectureClassification) */
  commander_classificationId: string | null;
  /** commander_: Risk score derived from posture assessment */
  commander_riskScore: number | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface TopologyNodeValidation {
  valid: boolean;
  errors: string[];
}

const NODE_TYPES: TopologyNodeType[] = [
  'compute', 'storage', 'network', 'application', 'service',
  'database', 'container', 'serverless', 'endpoint',
  'identity_provider', 'logical_group', 'external',
];
const NODE_STATUSES: TopologyNodeStatus[] = ['active', 'inactive', 'degraded', 'decommissioned', 'unknown'];
const DISCOVERY_METHODS: DiscoveryMethod[] = [
  'auto_discovery', 'manual', 'cmdb_import', 'agent_reported', 'api_registration',
];
const TOGAF_DOMAINS: TogafDomain[] = ['Business', 'Data', 'Application', 'Technology'];

export function validateTopologyNode(n: TopologyNode): TopologyNodeValidation {
  const errors: string[] = [];

  if (!n.id || n.id.trim() === '') errors.push('id: required');
  if (!n.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!n.nodeId || n.nodeId.trim() === '') errors.push('nodeId: required');
  if (!n.nodeName || n.nodeName.trim() === '') errors.push('nodeName: required');
  if (!NODE_TYPES.includes(n.nodeType)) {
    errors.push('nodeType: must be valid TopologyNodeType');
  }
  if (!TOGAF_DOMAINS.includes(n.togafDomain)) {
    errors.push('togafDomain: must be Business | Data | Application | Technology');
  }
  if (!n.environment || n.environment.trim() === '') errors.push('environment: required');
  if (!n.zone || n.zone.trim() === '') errors.push('zone: required');
  if (!n.region || n.region.trim() === '') errors.push('region: required');
  if (!NODE_STATUSES.includes(n.status)) {
    errors.push('status: must be active | inactive | degraded | decommissioned | unknown');
  }
  if (!DISCOVERY_METHODS.includes(n.discoveryMethod)) {
    errors.push('discoveryMethod: must be valid DiscoveryMethod');
  }
  if (!n.lastSeenAt || n.lastSeenAt.trim() === '') errors.push('lastSeenAt: required');
  if (typeof n.criticalityTier !== 'number' || n.criticalityTier < 1 || n.criticalityTier > 5) {
    errors.push('criticalityTier: must be 1-5');
  }
  if (!n.owner || n.owner.trim() === '') errors.push('owner: required');
  if (!Array.isArray(n.ipAddresses)) errors.push('ipAddresses: must be array');
  if (!Array.isArray(n.tags)) errors.push('tags: must be array');

  return { valid: errors.length === 0, errors };
}
