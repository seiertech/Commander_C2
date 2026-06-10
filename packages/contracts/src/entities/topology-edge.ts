/**
 * Topology_Edge — Commander C2 Thesis Layer 2
 *
 * Governed by: Thesis §6 — Architecture Classification & Topology Layer
 * Purpose: Represent edges (relationships) between topology nodes.
 * Carries direction, dependency strength, and topology classification.
 *
 * Standard: TOGAF (§4 ADM — dependency modelling)
 * Naming: snake_case (thesis-literal)
 */

// ─── Direction ───────────────────────────────────────────────────────────────

export const EDGE_DIRECTIONS = ['unidirectional', 'bidirectional'] as const;
export type EdgeDirection = typeof EDGE_DIRECTIONS[number];

// ─── Topology_Edge Entity ────────────────────────────────────────────────────

export interface TopologyEdge {
  /** Unique edge identifier */
  topology_edge_id: string;
  /** Source node */
  source_node_id: string;
  /** Target node */
  target_node_id: string;
  /** Type of relationship */
  relationship_type: string;
  /** Topology this edge belongs to */
  topology_type: string;
  /** Direction of relationship */
  direction: EdgeDirection;
  /** Strength of dependency (0.0 - 1.0) */
  dependency_strength: number;
  /** Governing standard */
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface TopologyEdgeValidation {
  valid: boolean;
  errors: string[];
}

export function validate_topology_edge(e: TopologyEdge): TopologyEdgeValidation {
  const errors: string[] = [];

  if (!e.topology_edge_id || e.topology_edge_id.trim() === '') errors.push('topology_edge_id: required');
  if (!e.source_node_id || e.source_node_id.trim() === '') errors.push('source_node_id: required');
  if (!e.target_node_id || e.target_node_id.trim() === '') errors.push('target_node_id: required');
  if (!e.relationship_type || e.relationship_type.trim() === '') errors.push('relationship_type: required');
  if (!e.topology_type || e.topology_type.trim() === '') errors.push('topology_type: required');
  if (!(EDGE_DIRECTIONS as readonly string[]).includes(e.direction)) {
    errors.push('direction: must be unidirectional | bidirectional');
  }
  if (typeof e.dependency_strength !== 'number' || e.dependency_strength < 0 || e.dependency_strength > 1) {
    errors.push('dependency_strength: must be 0.0 - 1.0');
  }
  if (!e.standard_marker || e.standard_marker.trim() === '') errors.push('standard_marker: required');

  return { valid: errors.length === 0, errors };
}
