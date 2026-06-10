/**
 * Direction Board Entity — Commander C2 Canonical Model
 *
 * Source: Spec #58 Security OODA Loop §Decide Phase,
 *         Master Technical Specification §Direction Boards
 *
 * Direction Board records model strategic decisions, priority changes,
 * blockers, risk acceptances and resource requests that flow through
 * the security programme's decision governance layer.
 *
 * Ownership: All authenticated (read), Authorised decision-makers (create/resolve)
 * Build Unit: Tier 3 batch (phase1-engine-entities)
 * Unlocks: /direction-boards, strategic decision surfaces
 */

import type { CommonFields } from './common';

// ─── Board Categories ────────────────────────────────────────────────────────

export const DIRECTION_BOARD_CATEGORIES = [
  'strategic_decision',
  'priority_change',
  'blocker',
  'risk_acceptance',
  'resource_request',
] as const;
export type DirectionBoardCategory = typeof DIRECTION_BOARD_CATEGORIES[number];

// ─── Board Status ────────────────────────────────────────────────────────────

export const DIRECTION_BOARD_STATUSES = ['proposed', 'active', 'resolved', 'deferred'] as const;
export type DirectionBoardStatus = typeof DIRECTION_BOARD_STATUSES[number];

// ─── Direction Board Entity ──────────────────────────────────────────────────

export interface DirectionBoard extends CommonFields {
  entity_type: 'direction-board';
  /** Unique board identifier */
  board_id: string;
  /** Title of the direction board item */
  title: string;
  /** Category classification */
  category: DirectionBoardCategory;
  /** Current lifecycle status */
  status: DirectionBoardStatus;
  /** Priority level (1 = highest) */
  priority: number;
  /** Owner responsible for resolution */
  owner: string;
  /** Due date for resolution (null if open-ended) */
  due_date: string | null;
  /** Detailed description of the item */
  description: string;
  /** Assessment of impact if unresolved */
  impact_assessment: string;
  /** References to linked cases */
  linkedCaseRefs: string[];
  /** References to linked risk objects */
  linkedRiskObjectRefs: string[];
  /** Resolution text (null if unresolved) */
  resolution: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface DirectionBoardValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a DirectionBoard entity for structural correctness.
 */
export function validateDirectionBoard(record: DirectionBoard): DirectionBoardValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') {
    errors.push('id: required');
  }
  if (!record.tenant || !record.tenant.tenant_id || record.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }
  if (!record.board_id || record.board_id.trim() === '') {
    errors.push('board_id: required');
  }
  if (!record.title || record.title.trim() === '') {
    errors.push('title: required');
  }
  if (!record.category || !DIRECTION_BOARD_CATEGORIES.includes(record.category)) {
    errors.push(`category: must be one of: ${DIRECTION_BOARD_CATEGORIES.join(', ')}`);
  }
  if (!record.status || !DIRECTION_BOARD_STATUSES.includes(record.status)) {
    errors.push(`status: must be one of: ${DIRECTION_BOARD_STATUSES.join(', ')}`);
  }
  if (typeof record.priority !== 'number' || record.priority < 1) {
    errors.push('priority: must be a positive number');
  }
  if (!record.owner || record.owner.trim() === '') {
    errors.push('owner: required');
  }
  if (!record.description || record.description.trim() === '') {
    errors.push('description: required');
  }
  if (!record.impact_assessment || record.impact_assessment.trim() === '') {
    errors.push('impact_assessment: required');
  }
  if (!Array.isArray(record.linkedCaseRefs)) {
    errors.push('linkedCaseRefs: must be an array');
  }
  if (!Array.isArray(record.linkedRiskObjectRefs)) {
    errors.push('linkedRiskObjectRefs: must be an array');
  }

  return { valid: errors.length === 0, errors };
}
