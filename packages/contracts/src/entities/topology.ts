/**
 * Topology Entity — Commander SDR Canonical Model
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
  nodeId: string;
  /** Type of entity this node represents */
  entityType: TopologyNodeType;
  /** Reference to the source entity ID */
  entityRef: string;
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
  edgeId: string;
  /** Source node ID */
  sourceNodeId: string;
  /** Target node ID */
  targetNodeId: string;
  /** Type of relationship */
  relationshipType: TopologyRelationshipType;
  /** Relationship weight/strength (0-1) */
  weight: number;
  /** Whether relationship applies in both directions */
  bidirectional: boolean;
}

// ─── Blast Radius Result ─────────────────────────────────────────────────────

export interface BlastRadiusResult {
  /** Origin node from which blast radius is computed */
  originNodeId: string;
  /** Node IDs within the blast radius */
  affectedNodes: string[];
  /** Maximum traversal depth reached */
  depth: number;
  /** Aggregate impact score */
  totalImpactScore: number;
}

// ─── Topology Snapshot (top-level entity for persistence) ────────────────────

export interface TopologySnapshot extends CommonFields {
  entityType: 'topology-snapshot';
  /** All nodes in this topology snapshot */
  nodes: TopologyNode[];
  /** All edges in this topology snapshot */
  edges: TopologyEdge[];
  /** Pre-computed blast radius results */
  blastRadiusResults: BlastRadiusResult[];
  /** Snapshot computation timestamp */
  computedAt: string;
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
  if (!snapshot.tenant || !snapshot.tenant.tenantId || snapshot.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!Array.isArray(snapshot.nodes)) {
    errors.push('nodes: must be an array');
  } else {
    const nodeIds = new Set<string>();
    for (const node of snapshot.nodes) {
      if (!node.nodeId || node.nodeId.trim() === '') {
        errors.push('nodes[].nodeId: required');
      }
      if (nodeIds.has(node.nodeId)) {
        errors.push(`nodes[].nodeId: duplicate '${node.nodeId}'`);
      }
      nodeIds.add(node.nodeId);
      if (!TOPOLOGY_NODE_TYPES.includes(node.entityType)) {
        errors.push(`nodes[].entityType: must be one of: ${TOPOLOGY_NODE_TYPES.join(', ')}`);
      }
      if (!node.entityRef || node.entityRef.trim() === '') {
        errors.push('nodes[].entityRef: required');
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
      if (!edge.edgeId || edge.edgeId.trim() === '') {
        errors.push('edges[].edgeId: required');
      }
      if (!edge.sourceNodeId || edge.sourceNodeId.trim() === '') {
        errors.push('edges[].sourceNodeId: required');
      }
      if (!edge.targetNodeId || edge.targetNodeId.trim() === '') {
        errors.push('edges[].targetNodeId: required');
      }
      if (!TOPOLOGY_RELATIONSHIP_TYPES.includes(edge.relationshipType)) {
        errors.push(`edges[].relationshipType: must be one of: ${TOPOLOGY_RELATIONSHIP_TYPES.join(', ')}`);
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
      if (!br.originNodeId || br.originNodeId.trim() === '') {
        errors.push('blastRadiusResults[].originNodeId: required');
      }
      if (!Array.isArray(br.affectedNodes)) {
        errors.push('blastRadiusResults[].affectedNodes: must be an array');
      }
      if (typeof br.depth !== 'number' || br.depth < 0) {
        errors.push('blastRadiusResults[].depth: must be >= 0');
      }
      if (typeof br.totalImpactScore !== 'number' || br.totalImpactScore < 0) {
        errors.push('blastRadiusResults[].totalImpactScore: must be >= 0');
      }
    }
  }
  if (!snapshot.computedAt || snapshot.computedAt.trim() === '') {
    errors.push('computedAt: required');
  }

  return { valid: errors.length === 0, errors };
}
