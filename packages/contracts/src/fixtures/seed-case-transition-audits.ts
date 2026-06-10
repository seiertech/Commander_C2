/**
 * Seed Case Transition Audits — Commander C2 Test Fixtures
 *
 * Synthetic structured lifecycle audit trail for case transitions.
 * Source: Spec #06 Domain Requirements Req 6
 * No real customer data, secrets, or vendor credentials.
 */

import type { CaseTransitionAudit } from '../entities/case-transition-audit';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const AUDIT_SOURCE = { ...SEED_SOURCE, sourceSystem: 'case-lifecycle-engine' };

export const seedCaseTransitionAudits: CaseTransitionAudit[] = [
  {
    id: seedId('case-trans', 1),
    entityType: 'case-transition-audit',
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    source: AUDIT_SOURCE,
    caseRef: 'case-0001',
    fromState: 'detected',
    toState: 'bound',
    actor: { type: 'system', id: 'binding-engine', name: 'Case Binding Engine' },
    reason: 'Risk object bound to case — automatic transition per lifecycle rules',
    triggeredBy: 'engine',
    gatesPassed: ['risk_object_present', 'tenant_scope_valid'],
    transitionedAt: '2026-01-15T09:00:00.000Z',
    immutable: true,
  },
  {
    id: seedId('case-trans', 2),
    entityType: 'case-transition-audit',
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T09:05:00.000Z',
    updatedAt: '2026-01-15T09:05:00.000Z',
    source: AUDIT_SOURCE,
    caseRef: 'case-0001',
    fromState: 'bound',
    toState: 'routed',
    actor: { type: 'system', id: 'routing-engine', name: 'Case Routing Engine' },
    reason: 'Case routed to SOC Tier 2 — vulnerability case type, P0 priority override',
    triggeredBy: 'strategy',
    gatesPassed: ['routing_policy_resolved', 'team_capacity_available'],
    transitionedAt: '2026-01-15T09:05:00.000Z',
    immutable: true,
  },
  {
    id: seedId('case-trans', 3),
    entityType: 'case-transition-audit',
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T09:10:00.000Z',
    updatedAt: '2026-01-15T09:10:00.000Z',
    source: AUDIT_SOURCE,
    caseRef: 'case-0001',
    fromState: 'routed',
    toState: 'prioritised',
    actor: { type: 'system', id: 'prioritisation-engine', name: 'Case Prioritisation Engine' },
    reason: 'Priority resolved: P0 — CVSS 10.0 + KEV listed + external-facing asset + active exploitation',
    triggeredBy: 'engine',
    gatesPassed: ['priority_weights_resolved', 'strategy_binding_active'],
    transitionedAt: '2026-01-15T09:10:00.000Z',
    immutable: true,
  },
  {
    id: seedId('case-trans', 4),
    entityType: 'case-transition-audit',
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
    source: AUDIT_SOURCE,
    caseRef: 'case-0001',
    fromState: 'prioritised',
    toState: 'action_decomposed',
    actor: { type: 'system', id: 'action-decomposition-engine', name: 'Action Decomposition Engine' },
    reason: 'Actions decomposed: 2 actions, 5 sub-actions generated from D3FEND countermeasure mapping',
    triggeredBy: 'engine',
    gatesPassed: ['priority_resolved', 'action_template_matched'],
    transitionedAt: '2026-01-15T10:00:00.000Z',
    immutable: true,
  },
  {
    id: seedId('case-trans', 5),
    entityType: 'case-transition-audit',
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T10:30:00.000Z',
    updatedAt: '2026-01-15T10:30:00.000Z',
    source: AUDIT_SOURCE,
    caseRef: 'case-0001',
    fromState: 'action_decomposed',
    toState: 'in_progress',
    actor: { type: 'system', id: 'case-lifecycle-engine', name: 'Case Lifecycle Engine' },
    reason: 'Sub-action execution commenced — analyst acknowledged assignment',
    triggeredBy: 'engine',
    gatesPassed: ['actions_decomposed', 'owner_assigned'],
    transitionedAt: '2026-01-15T10:30:00.000Z',
    immutable: true,
  },
];
