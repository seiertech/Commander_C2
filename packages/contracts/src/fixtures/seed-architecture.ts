/**
 * Layer 2 Fixtures — Architecture Classification & Topology
 *
 * Thesis §6: Architecture_Classification, Topology_Node, Topology_Edge
 * Standard marker: 'TOGAF/Zachman' for classifications, 'TOGAF' for topology
 */

import type { ArchitectureClassification } from '../entities/architecture-classification';
import type { TopologyNode } from '../entities/topology-node';
import type { TopologyEdge } from '../entities/topology-edge';

// ─── Architecture_Classification Fixtures ────────────────────────────────────

export const ARCHITECTURE_CLASSIFICATION_FIXTURES: ArchitectureClassification[] = [
  {
    architecture_id: 'arch-001',
    togaf_domain: 'application',
    zachman_aspect: 'what',
    zachman_perspective: 'designer',
    logical_layer: 'presentation',
    physical_layer: 'web-tier',
    service_tier: 'tier_1',
    topology_type: 'application',
    standard_marker: 'TOGAF/Zachman',
  },
  {
    architecture_id: 'arch-002',
    togaf_domain: 'data',
    zachman_aspect: 'what',
    zachman_perspective: 'builder',
    logical_layer: 'persistence',
    physical_layer: 'database-tier',
    service_tier: 'tier_2',
    topology_type: 'data_flow',
    standard_marker: 'TOGAF/Zachman',
  },
  {
    architecture_id: 'arch-003',
    togaf_domain: 'technology',
    zachman_aspect: 'where',
    zachman_perspective: 'planner',
    logical_layer: 'infrastructure',
    physical_layer: 'cloud-compute',
    service_tier: 'tier_0',
    topology_type: 'network',
    standard_marker: 'TOGAF/Zachman',
  },
  {
    architecture_id: 'arch-004',
    togaf_domain: 'business',
    zachman_aspect: 'why',
    zachman_perspective: 'owner',
    logical_layer: 'business-process',
    physical_layer: 'organisational',
    service_tier: 'tier_1',
    topology_type: 'service',
    standard_marker: 'TOGAF/Zachman',
  },
];

// ─── Topology_Node Fixtures ──────────────────────────────────────────────────

export const TOPOLOGY_NODE_FIXTURES: TopologyNode[] = [
  {
    topology_node_id: 'tnode-001',
    asset_id: 'asset-web-server-01',
    node_type: 'compute',
    topology_type: 'application',
    architectural_zone: 'dmz',
    standard_marker: 'TOGAF',
  },
  {
    topology_node_id: 'tnode-002',
    asset_id: 'asset-db-primary-01',
    node_type: 'database',
    topology_type: 'data_flow',
    architectural_zone: 'internal',
    standard_marker: 'TOGAF',
  },
  {
    topology_node_id: 'tnode-003',
    asset_id: 'asset-api-gateway-01',
    node_type: 'gateway',
    topology_type: 'network',
    architectural_zone: 'perimeter',
    standard_marker: 'TOGAF',
  },
  {
    topology_node_id: 'tnode-004',
    asset_id: 'asset-identity-provider-01',
    node_type: 'identity',
    topology_type: 'identity',
    architectural_zone: 'trust',
    standard_marker: 'TOGAF',
  },
];

// ─── Topology_Edge Fixtures ──────────────────────────────────────────────────

export const TOPOLOGY_EDGE_FIXTURES: TopologyEdge[] = [
  {
    topology_edge_id: 'tedge-001',
    source_node_id: 'tnode-003',
    target_node_id: 'tnode-001',
    relationship_type: 'routes_to',
    topology_type: 'network',
    direction: 'unidirectional',
    dependency_strength: 0.9,
    standard_marker: 'TOGAF',
  },
  {
    topology_edge_id: 'tedge-002',
    source_node_id: 'tnode-001',
    target_node_id: 'tnode-002',
    relationship_type: 'depends_on',
    topology_type: 'data_flow',
    direction: 'unidirectional',
    dependency_strength: 0.95,
    standard_marker: 'TOGAF',
  },
  {
    topology_edge_id: 'tedge-003',
    source_node_id: 'tnode-001',
    target_node_id: 'tnode-004',
    relationship_type: 'authenticates_via',
    topology_type: 'identity',
    direction: 'unidirectional',
    dependency_strength: 1.0,
    standard_marker: 'TOGAF',
  },
  {
    topology_edge_id: 'tedge-004',
    source_node_id: 'tnode-002',
    target_node_id: 'tnode-001',
    relationship_type: 'serves_data_to',
    topology_type: 'data_flow',
    direction: 'bidirectional',
    dependency_strength: 0.8,
    standard_marker: 'TOGAF',
  },
];
