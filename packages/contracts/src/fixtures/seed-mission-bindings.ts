/**
 * Seed Mission Bindings — Commander SDR Test Fixtures
 *
 * Synthetic mission binding data linking entities to missions.
 * Source: Spec #37 Mission Objective Binding Model
 *
 * 5 bindings: manual asset, tag-based identity, dependency-graph case,
 * rule-based risk object, commander-suggested connector.
 */

import type { MissionBinding } from '../entities/mission-binding';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const BINDING_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-mission-engine' };

export const seedMissionBindings: MissionBinding[] = [
  {
    id: seedId('mission-binding', 1),
    entityType: 'mission-binding',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-10T00:00:00.000Z',
    source: BINDING_SOURCE,
    bindingId: 'bind-001',
    missionId: seedId('mission', 1),
    boundEntityType: 'asset',
    entityRef: seedId('asset', 1),
    bindingMethod: 'manual',
    confidence: 100,
    boundAt: '2026-01-10T00:00:00.000Z',
    boundBy: 'analyst',
    active: true,
  },
  {
    id: seedId('mission-binding', 2),
    entityType: 'mission-binding',
    tenant: SEED_TENANT,
    createdAt: '2026-01-11T00:00:00.000Z',
    updatedAt: '2026-01-11T00:00:00.000Z',
    source: BINDING_SOURCE,
    bindingId: 'bind-002',
    missionId: seedId('mission', 1),
    boundEntityType: 'identity',
    entityRef: seedId('identity', 1),
    bindingMethod: 'tag_based',
    confidence: 85,
    boundAt: '2026-01-11T00:00:00.000Z',
    boundBy: 'system',
    active: true,
  },
  {
    id: seedId('mission-binding', 3),
    entityType: 'mission-binding',
    tenant: SEED_TENANT,
    createdAt: '2026-01-12T00:00:00.000Z',
    updatedAt: '2026-01-12T00:00:00.000Z',
    source: BINDING_SOURCE,
    bindingId: 'bind-003',
    missionId: seedId('mission', 2),
    boundEntityType: 'case',
    entityRef: 'case-0001',
    bindingMethod: 'dependency_graph',
    confidence: 72,
    boundAt: '2026-01-12T00:00:00.000Z',
    boundBy: 'system',
    active: true,
  },
  {
    id: seedId('mission-binding', 4),
    entityType: 'mission-binding',
    tenant: SEED_TENANT,
    createdAt: '2026-01-13T00:00:00.000Z',
    updatedAt: '2026-01-13T00:00:00.000Z',
    source: BINDING_SOURCE,
    bindingId: 'bind-004',
    missionId: seedId('mission', 2),
    boundEntityType: 'risk_object',
    entityRef: seedId('risk-object', 1),
    bindingMethod: 'rule_based',
    confidence: 90,
    boundAt: '2026-01-13T00:00:00.000Z',
    boundBy: 'system',
    active: true,
  },
  {
    id: seedId('mission-binding', 5),
    entityType: 'mission-binding',
    tenant: SEED_TENANT,
    createdAt: '2026-01-14T00:00:00.000Z',
    updatedAt: '2026-01-14T00:00:00.000Z',
    source: BINDING_SOURCE,
    bindingId: 'bind-005',
    missionId: seedId('mission', 3),
    boundEntityType: 'connector',
    entityRef: 'connector-mock-001',
    bindingMethod: 'commander_suggested',
    confidence: 65,
    boundAt: '2026-01-14T00:00:00.000Z',
    boundBy: 'system',
    active: false,
  },
];
