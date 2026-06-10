/**
 * Seed Topology — Commander SDR Test Fixtures
 *
 * Synthetic topology graph data for Fusion Map surface.
 * 8 nodes (mix of assets, identities, connectors) + 10 edges + 2 blast radius results.
 * Source: Master Technical Specification §Fusion Map
 */

import type { TopologySnapshot, TopologyNode, TopologyEdge, BlastRadiusResult } from '../entities/topology';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const TOPOLOGY_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-topology-engine' };

const seedNodes: TopologyNode[] = [
  { nodeId: 'node-001', entityType: 'asset', entityRef: 'asset-0001', label: 'Web Server — prod-web-01.acme.example', domain: 'network', criticality: 1 },
  { nodeId: 'node-002', entityType: 'asset', entityRef: 'asset-0002', label: 'Database Server — prod-db-01.acme.example', domain: 'network', criticality: 1 },
  { nodeId: 'node-003', entityType: 'identity', entityRef: 'identity-0001', label: 'Alice Security-Analyst (Mock)', domain: 'identity', criticality: 3 },
  { nodeId: 'node-004', entityType: 'identity', entityRef: 'identity-0003', label: 'SVC-Deploy Service Account (Mock)', domain: 'identity', criticality: 2 },
  { nodeId: 'node-005', entityType: 'connector', entityRef: 'connector-mock-001', label: 'CrowdStrike EDR Connector (Mock)', domain: 'endpoint', criticality: 2 },
  { nodeId: 'node-006', entityType: 'connector', entityRef: 'connector-mock-002', label: 'Azure AD Connector (Mock)', domain: 'identity', criticality: 2 },
  { nodeId: 'node-007', entityType: 'case', entityRef: 'case-0001', label: 'CASE-001 — Critical CVE on prod-web-01', domain: 'vulnerability', criticality: 1 },
  { nodeId: 'node-008', entityType: 'control', entityRef: 'ctrl-fw-001', label: 'Perimeter Firewall — fw-edge-01.acme.example', domain: 'network', criticality: 1 },
];

const seedEdges: TopologyEdge[] = [
  { edgeId: 'edge-001', sourceNodeId: 'node-003', targetNodeId: 'node-001', relationshipType: 'accesses', weight: 0.8, bidirectional: false },
  { edgeId: 'edge-002', sourceNodeId: 'node-004', targetNodeId: 'node-002', relationshipType: 'accesses', weight: 0.9, bidirectional: false },
  { edgeId: 'edge-003', sourceNodeId: 'node-001', targetNodeId: 'node-002', relationshipType: 'depends_on', weight: 0.95, bidirectional: false },
  { edgeId: 'edge-004', sourceNodeId: 'node-001', targetNodeId: 'node-008', relationshipType: 'communicates_with', weight: 0.7, bidirectional: true },
  { edgeId: 'edge-005', sourceNodeId: 'node-005', targetNodeId: 'node-001', relationshipType: 'monitors', weight: 0.85, bidirectional: false },
  { edgeId: 'edge-006', sourceNodeId: 'node-005', targetNodeId: 'node-002', relationshipType: 'monitors', weight: 0.85, bidirectional: false },
  { edgeId: 'edge-007', sourceNodeId: 'node-006', targetNodeId: 'node-003', relationshipType: 'monitors', weight: 0.9, bidirectional: false },
  { edgeId: 'edge-008', sourceNodeId: 'node-006', targetNodeId: 'node-004', relationshipType: 'monitors', weight: 0.9, bidirectional: false },
  { edgeId: 'edge-009', sourceNodeId: 'node-007', targetNodeId: 'node-001', relationshipType: 'impacts', weight: 1.0, bidirectional: false },
  { edgeId: 'edge-010', sourceNodeId: 'node-008', targetNodeId: 'node-001', relationshipType: 'mitigates', weight: 0.6, bidirectional: false },
];

const seedBlastRadiusResults: BlastRadiusResult[] = [
  { originNodeId: 'node-001', affectedNodes: ['node-002', 'node-003', 'node-004', 'node-007', 'node-008'], depth: 2, totalImpactScore: 87 },
  { originNodeId: 'node-004', affectedNodes: ['node-002', 'node-001'], depth: 2, totalImpactScore: 62 },
];

export const seedTopology: TopologySnapshot = {
  id: seedId('topology', 1),
  entityType: 'topology-snapshot',
  tenant: SEED_TENANT,
  createdAt: '2026-01-18T06:00:00.000Z',
  updatedAt: '2026-01-18T06:00:00.000Z',
  source: TOPOLOGY_SOURCE,
  nodes: seedNodes,
  edges: seedEdges,
  blastRadiusResults: seedBlastRadiusResults,
  computedAt: '2026-01-18T06:00:00.000Z',
};
