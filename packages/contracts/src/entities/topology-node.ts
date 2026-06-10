/**
 * Topology_Node — Commander C2 Thesis Layer 2
 *
 * Governed by: Thesis §6 — Architecture Classification & Topology Layer
 * Purpose: Represent nodes in the architecture topology graph.
 * Each node references a canonical asset and carries architectural zone context.
 *
 * Standard: TOGAF (§4 ADM — architectural zones)
 * Naming: snake_case (thesis-literal)
 */

// ─── Topology_Node Entity ────────────────────────────────────────────────────

export interface TopologyNode {
  /** Unique node identifier */
  topology_node_id: string;
  /** Reference to canonical asset */
  asset_id: string;
  /** Type of node */
  node_type: string;
  /** Topology this node belongs to */
  topology_type: string;
  /** TOGAF architecture zone placement */
  architectural_zone: string;
  /** Governing standard */
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface TopologyNodeValidation {
  valid: boolean;
  errors: string[];
}

export function validate_topology_node(n: TopologyNode): TopologyNodeValidation {
  const errors: string[] = [];

  if (!n.topology_node_id || n.topology_node_id.trim() === '') errors.push('topology_node_id: required');
  if (!n.asset_id || n.asset_id.trim() === '') errors.push('asset_id: required');
  if (!n.node_type || n.node_type.trim() === '') errors.push('node_type: required');
  if (!n.topology_type || n.topology_type.trim() === '') errors.push('topology_type: required');
  if (!n.architectural_zone || n.architectural_zone.trim() === '') errors.push('architectural_zone: required');
  if (!n.standard_marker || n.standard_marker.trim() === '') errors.push('standard_marker: required');

  return { valid: errors.length === 0, errors };
}
