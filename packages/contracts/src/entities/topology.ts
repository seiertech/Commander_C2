/**
 * Topology Entity — Commander C2 Canonical Model
 *
 * Source: Master Technical Specification §Fusion Map,
 *         Spec #60 Internal and External Attack Surface Framework (blast radius)
 *
 * Topology models the relationship graph for the Fusion Map surface.
 * Nodes represent estate entities (assets, identities, connectors, cases, etc.)
 * Edges represent typed relationships between them.
 * Blast radius results are pre-computed impact assessments from a given origin.
 *
 * Ownership: All authenticated (read), System (compute)
 * Build Unit: Tier 3 batch (phase1-entity-creation)
 * Unlocks: /fusion-map, /fusion-map/blast-radius, /fusion-map/mission, /fusion-map/p0
 */

import type { CommonFields } from './common';

// ─── Node Entity Types ───────────────────────────────────────────────────────

export const TOPOLOGY_NODE_TYPES = ['asset', 'identity', 'case', 'risk_object', 'connector', 'control'] as const;
export type TopologyNodeType = typeof TOPOLOGY_NODE_TYPES[number];

// ─── Relationship Types ──────────────────────────────────────────────────────

export const TOPOLOGY_RELATIONSHIP_TYPES = [
  'owns', 'accesses', 'depends_on', 'communicates_with', 'impacts', 'mitigates', 'monitors',
] as const;
export type TopologyRelationshipType = typeof TOPOLOGY_RELATIONSHIP_TYPES[number];

// ─── Topology Node ───────────────────────────────────────────────────────────

export interface TopologyNode {
  /** Unique node identifier */
  node_id: string;
  /** Type of entity this node represents */
  entity_type: TopologyNodeType;
  /** Reference to the source entity ID */
  entity_ref: string;
  /** Human-readable label */
  label: string;
  /** Security domain */
  domain: string;
  /** Criticality 1 (highest) to 5 (lowest) */
  criticality: number;
  /** Optional rendering position */
  position?: { x: number; y: number };
}

// ─── Topology Edge ───────────────────────────────────────────────────────────

export interface TopologyEdge {
  /** Unique edge identifier */
  edge_id: string;
  /** Source node ID */
  source_node_id: string;
  /** Target node ID */
  target_node_id: string;
  /** Type of relationship */
  relationship_type: TopologyRelationshipType;
  /** Relationship weight/strength (0-1) */
  weight: number;
  /** Whether relationship applies in both directions */
  bidirectional: boolean;
}

// ─── Blast Radius Result ─────────────────────────────────────────────────────

export interface BlastRadiusResult {
  /** Origin node from which blast radius is computed */
  origin_node_id: string;
  /** Node IDs within the blast radius */
  affected_nodes: string[];
  /** Maximum traversal depth reached */
  depth: number;
  /** Aggregate impact score */
  total_impact_score: number;
}

// ─── Topology Snapshot (top-level entity for persistence) ────────────────────

export interface TopologySnapshot extends CommonFields {
  entity_type: 'topology-snapshot';
  /** All nodes in this topology snapshot */
  nodes: TopologyNode[];
  /** All edges in this topology snapshot */
  edges: TopologyEdge[];
  /** Pre-computed blast radius results */
  blastRadiusResults: BlastRadiusResult[];
  /** Snapshot computation timestamp */
  computed_at: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface TopologyValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a TopologySnapshot entity for structural correctness.
 */
export function validateTopologySnapshot(snapshot: TopologySnapshot): TopologyValidation {
  const errors: string[] = [];

  if (!snapshot.id || snapshot.id.trim() === '') {
    errors.push('id: required');
  }
  if (!snapshot.tenant || !snapshot.tenant.tenant_id || snapshot.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }
  if (!Array.isArray(snapshot.nodes)) {
    errors.push('nodes: must be an array');
  } else {
    const nodeIds = new Set<string>();
    for (const node of snapshot.nodes) {
      if (!node.node_id || node.node_id.trim() === '') {
        errors.push('nodes[].node_id: required');
      }
      if (nodeIds.has(node.node_id)) {
        errors.push(`nodes[].node_id: duplicate '${node.node_id}'`);
      }
      nodeIds.add(node.node_id);
      if (!TOPOLOGY_NODE_TYPES.includes(node.entity_type)) {
        errors.push(`nodes[].entity_type: must be one of: ${TOPOLOGY_NODE_TYPES.join(', ')}`);
      }
      if (!node.entity_ref || node.entity_ref.trim() === '') {
        errors.push('nodes[].entity_ref: required');
      }
      if (!node.label || node.label.trim() === '') {
        errors.push('nodes[].label: required');
      }
      if (typeof node.criticality !== 'number' || node.criticality < 1 || node.criticality > 5) {
        errors.push('nodes[].criticality: must be 1-5');
      }
    }
  }
  if (!Array.isArray(snapshot.edges)) {
    errors.push('edges: must be an array');
  } else {
    for (const edge of snapshot.edges) {
      if (!edge.edge_id || edge.edge_id.trim() === '') {
        errors.push('edges[].edge_id: required');
      }
      if (!edge.source_node_id || edge.source_node_id.trim() === '') {
        errors.push('edges[].source_node_id: required');
      }
      if (!edge.target_node_id || edge.target_node_id.trim() === '') {
        errors.push('edges[].target_node_id: required');
      }
      if (!TOPOLOGY_RELATIONSHIP_TYPES.includes(edge.relationship_type)) {
        errors.push(`edges[].relationship_type: must be one of: ${TOPOLOGY_RELATIONSHIP_TYPES.join(', ')}`);
      }
      if (typeof edge.weight !== 'number' || edge.weight < 0 || edge.weight > 1) {
        errors.push('edges[].weight: must be 0-1');
      }
    }
  }
  if (!Array.isArray(snapshot.blastRadiusResults)) {
    errors.push('blastRadiusResults: must be an array');
  } else {
    for (const br of snapshot.blastRadiusResults) {
      if (!br.origin_node_id || br.origin_node_id.trim() === '') {
        errors.push('blastRadiusResults[].origin_node_id: required');
      }
      if (!Array.isArray(br.affected_nodes)) {
        errors.push('blastRadiusResults[].affected_nodes: must be an array');
      }
      if (typeof br.depth !== 'number' || br.depth < 0) {
        errors.push('blastRadiusResults[].depth: must be >= 0');
      }
      if (typeof br.total_impact_score !== 'number' || br.total_impact_score < 0) {
        errors.push('blastRadiusResults[].total_impact_score: must be >= 0');
      }
    }
  }
  if (!snapshot.computed_at || snapshot.computed_at.trim() === '') {
    errors.push('computed_at: required');
  }

  return { valid: errors.length === 0, errors };
}
