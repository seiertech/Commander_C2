/**
 * Mission Binding Entity — Commander C2 Canonical Model
 *
 * Source: Spec #37 Mission Objective Binding Model,
 *         Master Technical Specification §Mission Control
 *
 * Mission bindings link entities (assets, identities, cases, risk objects,
 * connectors, components) to strategic missions via various binding methods.
 *
 * Ownership: SOM, CISO
 * Boundary: operational
 * Unlocks: /settings/missions (UC-162, UC-163)
 */

import type { CommonFields } from './common';

// ─── Binding Entity Type ─────────────────────────────────────────────────────

export const BINDING_ENTITY_TYPES = ['asset', 'identity', 'case', 'risk_object', 'connector', 'component'] as const;
export type BindingEntityType = typeof BINDING_ENTITY_TYPES[number];

// ─── Binding Method ──────────────────────────────────────────────────────────

export const BINDING_METHODS = ['manual', 'tag_based', 'business_service', 'dependency_graph', 'rule_based', 'commander_suggested'] as const;
export type BindingMethod = typeof BINDING_METHODS[number];

// ─── Bound By ────────────────────────────────────────────────────────────────

export const BOUND_BY_OPTIONS = ['system', 'analyst'] as const;
export type BoundBy = typeof BOUND_BY_OPTIONS[number];

// ─── Mission Binding Entity ──────────────────────────────────────────────────

export interface MissionBinding extends CommonFields {
  entityType: 'mission-binding';
  /** Unique binding identifier */
  bindingId: string;
  /** Mission this binding belongs to */
  missionId: string;
  /** Type of entity being bound */
  boundEntityType: BindingEntityType;
  /** Reference to the bound entity */
  entityRef: string;
  /** Method used to create this binding */
  bindingMethod: BindingMethod;
  /** Confidence score (0-100) */
  confidence: number;
  /** When the binding was created */
  boundAt: string;
  /** Who/what created the binding */
  boundBy: BoundBy;
  /** Whether this binding is currently active */
  active: boolean;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface MissionBindingValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a MissionBinding entity for structural correctness.
 */
export function validateMissionBinding(binding: MissionBinding): MissionBindingValidation {
  const errors: string[] = [];

  if (!binding.id || binding.id.trim() === '') {
    errors.push('id: required');
  }
  if (!binding.tenant || !binding.tenant.tenantId || binding.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!binding.bindingId || binding.bindingId.trim() === '') {
    errors.push('bindingId: required');
  }
  if (!binding.missionId || binding.missionId.trim() === '') {
    errors.push('missionId: required');
  }
  if (!BINDING_ENTITY_TYPES.includes(binding.boundEntityType)) {
    errors.push(`boundEntityType: must be one of: ${BINDING_ENTITY_TYPES.join(', ')}`);
  }
  if (!binding.entityRef || binding.entityRef.trim() === '') {
    errors.push('entityRef: required');
  }
  if (!BINDING_METHODS.includes(binding.bindingMethod)) {
    errors.push(`bindingMethod: must be one of: ${BINDING_METHODS.join(', ')}`);
  }
  if (typeof binding.confidence !== 'number' || binding.confidence < 0 || binding.confidence > 100) {
    errors.push('confidence: must be 0-100');
  }
  if (!binding.boundAt || binding.boundAt.trim() === '') {
    errors.push('boundAt: required');
  }
  if (!BOUND_BY_OPTIONS.includes(binding.boundBy)) {
    errors.push(`boundBy: must be one of: ${BOUND_BY_OPTIONS.join(', ')}`);
  }
  if (typeof binding.active !== 'boolean') {
    errors.push('active: must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}
