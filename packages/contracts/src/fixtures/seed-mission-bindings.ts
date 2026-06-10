/**
 * Seed Mission Bindings — Commander C2 Test Fixtures
 *
 * Synthetic mission binding data linking entities to missions.
 * Source: Spec #37 Mission Objective Binding Model
 *
 * 5 bindings: manual asset, tag-based identity, dependency-graph case,
 * rule-based risk object, commander-suggested connector.
 */

import type { MissionBinding } from '../entities/mission-binding';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const BINDING_SOURCE = { ...SEED_SOURCE, source_system: 'commander-mission-engine' };

export const seedMissionBindings: MissionBinding[] = [
  {
    id: seedId('mission-binding', 1),
    entity_type: 'mission-binding',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
    source: BINDING_SOURCE,
    binding_id: 'bind-001',
    mission_id: seedId('mission', 1),
    boundEntityType: 'asset',
    entity_ref: seedId('asset', 1),
    bindingMethod: 'manual',
    confidence: 100,
    bound_at: '2026-01-10T00:00:00.000Z',
    bound_by: 'analyst',
    active: true,
  },
  {
    id: seedId('mission-binding', 2),
    entity_type: 'mission-binding',
    tenant: SEED_TENANT,
    created_at: '2026-01-11T00:00:00.000Z',
    updated_at: '2026-01-11T00:00:00.000Z',
    source: BINDING_SOURCE,
    binding_id: 'bind-002',
    mission_id: seedId('mission', 1),
    boundEntityType: 'identity',
    entity_ref: seedId('identity', 1),
    bindingMethod: 'tag_based',
    confidence: 85,
    bound_at: '2026-01-11T00:00:00.000Z',
    bound_by: 'system',
    active: true,
  },
  {
    id: seedId('mission-binding', 3),
    entity_type: 'mission-binding',
    tenant: SEED_TENANT,
    created_at: '2026-01-12T00:00:00.000Z',
    updated_at: '2026-01-12T00:00:00.000Z',
    source: BINDING_SOURCE,
    binding_id: 'bind-003',
    mission_id: seedId('mission', 2),
    boundEntityType: 'case',
    entity_ref: 'case-0001',
    bindingMethod: 'dependency_graph',
    confidence: 72,
    bound_at: '2026-01-12T00:00:00.000Z',
    bound_by: 'system',
    active: true,
  },
  {
    id: seedId('mission-binding', 4),
    entity_type: 'mission-binding',
    tenant: SEED_TENANT,
    created_at: '2026-01-13T00:00:00.000Z',
    updated_at: '2026-01-13T00:00:00.000Z',
    source: BINDING_SOURCE,
    binding_id: 'bind-004',
    mission_id: seedId('mission', 2),
    boundEntityType: 'risk_object',
    entity_ref: seedId('risk-object', 1),
    bindingMethod: 'rule_based',
    confidence: 90,
    bound_at: '2026-01-13T00:00:00.000Z',
    bound_by: 'system',
    active: true,
  },
  {
    id: seedId('mission-binding', 5),
    entity_type: 'mission-binding',
    tenant: SEED_TENANT,
    created_at: '2026-01-14T00:00:00.000Z',
    updated_at: '2026-01-14T00:00:00.000Z',
    source: BINDING_SOURCE,
    binding_id: 'bind-005',
    mission_id: seedId('mission', 3),
    boundEntityType: 'connector',
    entity_ref: 'connector-mock-001',
    bindingMethod: 'commander_suggested',
    confidence: 65,
    bound_at: '2026-01-14T00:00:00.000Z',
    bound_by: 'system',
    active: false,
  },
];
