/**
 * Seed Topology — Commander C2 Test Fixtures
 *
 * Synthetic topology graph data for Fusion Map surface.
 * 8 nodes (mix of assets, identities, connectors) + 10 edges + 2 blast radius results.
 * Source: Master Technical Specification §Fusion Map
 */

import type { TopologySnapshot, TopologyNode, TopologyEdge, BlastRadiusResult } from '../entities/topology';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const TOPOLOGY_SOURCE = { ...SEED_SOURCE, source_system: 'commander-topology-engine' };

const seedNodes: TopologyNode[] = [
  { node_id: 'node-001', entity_type: 'asset', entity_ref: 'asset-0001', label: 'Web Server — prod-web-01.acme.example', domain: 'network', criticality: 1 },
  { node_id: 'node-002', entity_type: 'asset', entity_ref: 'asset-0002', label: 'Database Server — prod-db-01.acme.example', domain: 'network', criticality: 1 },
  { node_id: 'node-003', entity_type: 'identity', entity_ref: 'identity-0001', label: 'Alice Security-Analyst (Mock)', domain: 'identity', criticality: 3 },
  { node_id: 'node-004', entity_type: 'identity', entity_ref: 'identity-0003', label: 'SVC-Deploy Service Account (Mock)', domain: 'identity', criticality: 2 },
  { node_id: 'node-005', entity_type: 'connector', entity_ref: 'connector-mock-001', label: 'CrowdStrike EDR Connector (Mock)', domain: 'endpoint', criticality: 2 },
  { node_id: 'node-006', entity_type: 'connector', entity_ref: 'connector-mock-002', label: 'Azure AD Connector (Mock)', domain: 'identity', criticality: 2 },
  { node_id: 'node-007', entity_type: 'case', entity_ref: 'case-0001', label: 'CASE-001 — Critical CVE on prod-web-01', domain: 'vulnerability', criticality: 1 },
  { node_id: 'node-008', entity_type: 'control', entity_ref: 'ctrl-fw-001', label: 'Perimeter Firewall — fw-edge-01.acme.example', domain: 'network', criticality: 1 },
];

const seedEdges: TopologyEdge[] = [
  { edge_id: 'edge-001', source_node_id: 'node-003', target_node_id: 'node-001', relationship_type: 'accesses', weight: 0.8, bidirectional: false },
  { edge_id: 'edge-002', source_node_id: 'node-004', target_node_id: 'node-002', relationship_type: 'accesses', weight: 0.9, bidirectional: false },
  { edge_id: 'edge-003', source_node_id: 'node-001', target_node_id: 'node-002', relationship_type: 'depends_on', weight: 0.95, bidirectional: false },
  { edge_id: 'edge-004', source_node_id: 'node-001', target_node_id: 'node-008', relationship_type: 'communicates_with', weight: 0.7, bidirectional: true },
  { edge_id: 'edge-005', source_node_id: 'node-005', target_node_id: 'node-001', relationship_type: 'monitors', weight: 0.85, bidirectional: false },
  { edge_id: 'edge-006', source_node_id: 'node-005', target_node_id: 'node-002', relationship_type: 'monitors', weight: 0.85, bidirectional: false },
  { edge_id: 'edge-007', source_node_id: 'node-006', target_node_id: 'node-003', relationship_type: 'monitors', weight: 0.9, bidirectional: false },
  { edge_id: 'edge-008', source_node_id: 'node-006', target_node_id: 'node-004', relationship_type: 'monitors', weight: 0.9, bidirectional: false },
  { edge_id: 'edge-009', source_node_id: 'node-007', target_node_id: 'node-001', relationship_type: 'impacts', weight: 1.0, bidirectional: false },
  { edge_id: 'edge-010', source_node_id: 'node-008', target_node_id: 'node-001', relationship_type: 'mitigates', weight: 0.6, bidirectional: false },
];

const seedBlastRadiusResults: BlastRadiusResult[] = [
  { origin_node_id: 'node-001', affected_nodes: ['node-002', 'node-003', 'node-004', 'node-007', 'node-008'], depth: 2, total_impact_score: 87 },
  { origin_node_id: 'node-004', affected_nodes: ['node-002', 'node-001'], depth: 2, total_impact_score: 62 },
];

export const seedTopology: TopologySnapshot = {
  id: seedId('topology', 1),
  entity_type: 'topology-snapshot',
  tenant: SEED_TENANT,
  created_at: '2026-01-18T06:00:00.000Z',
  updated_at: '2026-01-18T06:00:00.000Z',
  source: TOPOLOGY_SOURCE,
  nodes: seedNodes,
  edges: seedEdges,
  blastRadiusResults: seedBlastRadiusResults,
  computed_at: '2026-01-18T06:00:00.000Z',
};
