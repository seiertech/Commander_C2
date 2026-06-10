/**
 * Seed Architecture Intelligence — Commander C2 Test Fixtures
 *
 * Synthetic architecture intelligence records for topology analysis surfaces.
 * 4 records covering policy conflict, coverage gap, dependency risk and topology anomaly.
 * Source: Spec #59 Intelligence Layer Architecture §Posture Stream
 */

import type { ArchitectureIntelligence } from '../entities/architecture-intelligence-engine';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-engine-layer' };

export const seedArchitectureIntelligence: ArchitectureIntelligence[] = [
  {
    id: seedId('arch-intel', 1),
    entityType: 'architecture-intelligence',
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engineId: 'engine-architecture-001',
    componentRef: 'component-fw-dmz',
    analysisType: 'policy_conflict',
    severity: 8,
    confidence: 0.92,
    detectedAt: '2026-01-15T08:00:00.000Z',
    description: 'Firewall DMZ zone permits ingress from internal network on ports that violate segmentation policy SEC-POL-012',
    affectedComponents: ['component-fw-dmz', 'component-internal-zone', 'component-web-tier'],
    recommendedAction: 'Remove internal-to-DMZ rules conflicting with SEC-POL-012 segmentation requirements',
    resolvedAt: null,
    status: 'open',
  },
  {
    id: seedId('arch-intel', 2),
    entityType: 'architecture-intelligence',
    tenant: SEED_TENANT,
    createdAt: '2026-01-14T12:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engineId: 'engine-architecture-001',
    componentRef: 'component-endpoint-fleet',
    analysisType: 'coverage_gap',
    severity: 7,
    confidence: 0.88,
    detectedAt: '2026-01-14T12:00:00.000Z',
    description: '23% of endpoint fleet has no EDR agent deployed — lateral movement path unmonitored',
    affectedComponents: ['component-endpoint-fleet', 'component-siem-collector'],
    recommendedAction: 'Deploy EDR agent to uncovered endpoints; prioritise those in privileged network segments',
    resolvedAt: null,
    status: 'acknowledged',
  },
  {
    id: seedId('arch-intel', 3),
    entityType: 'architecture-intelligence',
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T09:30:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engineId: 'engine-architecture-001',
    componentRef: 'component-auth-service',
    analysisType: 'dependency_risk',
    severity: 6,
    confidence: 0.75,
    detectedAt: '2026-01-16T09:30:00.000Z',
    description: 'Authentication service depends on single IdP with no failover — total auth failure if IdP unavailable',
    affectedComponents: ['component-auth-service', 'component-idp-primary'],
    recommendedAction: 'Configure secondary IdP federation or local fallback authentication path',
    resolvedAt: '2026-01-17T14:00:00.000Z',
    status: 'resolved',
  },
  {
    id: seedId('arch-intel', 4),
    entityType: 'architecture-intelligence',
    tenant: SEED_TENANT,
    createdAt: '2026-01-17T07:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engineId: 'engine-architecture-001',
    componentRef: 'component-db-cluster',
    analysisType: 'topology_anomaly',
    severity: 5,
    confidence: 0.81,
    detectedAt: '2026-01-17T07:00:00.000Z',
    description: 'Database cluster exposes management port to application subnet — should only be accessible from admin bastion',
    affectedComponents: ['component-db-cluster', 'component-app-subnet'],
    recommendedAction: 'Restrict database management port access to admin bastion security group only',
    resolvedAt: null,
    status: 'open',
  },
];
