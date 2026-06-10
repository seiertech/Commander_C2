/**
 * Seed Architecture Intelligence — Commander C2 Test Fixtures
 *
 * Synthetic architecture intelligence records for topology analysis surfaces.
 * 4 records covering policy conflict, coverage gap, dependency risk and topology anomaly.
 * Source: Spec #59 Intelligence Layer Architecture §Posture Stream
 */

import type { ArchitectureIntelligence } from '../entities/architecture-intelligence-engine';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, source_system: 'commander-engine-layer' };

export const seedArchitectureIntelligence: ArchitectureIntelligence[] = [
  {
    id: seedId('arch-intel', 1),
    entity_type: 'architecture-intelligence',
    tenant: SEED_TENANT,
    created_at: '2026-01-15T08:00:00.000Z',
    updated_at: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-architecture-001',
    component_ref: 'component-fw-dmz',
    analysisType: 'policy_conflict',
    severity: 8,
    confidence: 0.92,
    detected_at: '2026-01-15T08:00:00.000Z',
    description: 'Firewall DMZ zone permits ingress from internal network on ports that violate segmentation policy SEC-POL-012',
    affectedComponents: ['component-fw-dmz', 'component-internal-zone', 'component-web-tier'],
    recommendedAction: 'Remove internal-to-DMZ rules conflicting with SEC-POL-012 segmentation requirements',
    resolved_at: null,
    status: 'open',
  },
  {
    id: seedId('arch-intel', 2),
    entity_type: 'architecture-intelligence',
    tenant: SEED_TENANT,
    created_at: '2026-01-14T12:00:00.000Z',
    updated_at: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-architecture-001',
    component_ref: 'component-endpoint-fleet',
    analysisType: 'coverage_gap',
    severity: 7,
    confidence: 0.88,
    detected_at: '2026-01-14T12:00:00.000Z',
    description: '23% of endpoint fleet has no EDR agent deployed — lateral movement path unmonitored',
    affectedComponents: ['component-endpoint-fleet', 'component-siem-collector'],
    recommendedAction: 'Deploy EDR agent to uncovered endpoints; prioritise those in privileged network segments',
    resolved_at: null,
    status: 'acknowledged',
  },
  {
    id: seedId('arch-intel', 3),
    entity_type: 'architecture-intelligence',
    tenant: SEED_TENANT,
    created_at: '2026-01-16T09:30:00.000Z',
    updated_at: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-architecture-001',
    component_ref: 'component-auth-service',
    analysisType: 'dependency_risk',
    severity: 6,
    confidence: 0.75,
    detected_at: '2026-01-16T09:30:00.000Z',
    description: 'Authentication service depends on single IdP with no failover — total auth failure if IdP unavailable',
    affectedComponents: ['component-auth-service', 'component-idp-primary'],
    recommendedAction: 'Configure secondary IdP federation or local fallback authentication path',
    resolved_at: '2026-01-17T14:00:00.000Z',
    status: 'resolved',
  },
  {
    id: seedId('arch-intel', 4),
    entity_type: 'architecture-intelligence',
    tenant: SEED_TENANT,
    created_at: '2026-01-17T07:00:00.000Z',
    updated_at: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-architecture-001',
    component_ref: 'component-db-cluster',
    analysisType: 'topology_anomaly',
    severity: 5,
    confidence: 0.81,
    detected_at: '2026-01-17T07:00:00.000Z',
    description: 'Database cluster exposes management port to application subnet — should only be accessible from admin bastion',
    affectedComponents: ['component-db-cluster', 'component-app-subnet'],
    recommendedAction: 'Restrict database management port access to admin bastion security group only',
    resolved_at: null,
    status: 'open',
  },
];
