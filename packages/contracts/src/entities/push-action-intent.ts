/**
 * Push Action Intent — Commander C2 Canonical Entity
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 15.1, 15.2, 15.4, 15.5
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * A declared intent to push an IOC block/allow action to an external system.
 * Represented as status only in Phase 1 — NO live push to EDR, proxy,
 * firewall, SIEM or SOAR (Req 15.4).
 */

import type { CommonFields } from './common';
import type { IocCategory, PushActionType, PushIntentStatus } from './intelligence-common';
import { IOC_CATEGORIES, PUSH_ACTION_TYPES, PUSH_INTENT_STATUSES } from './intelligence-common';

// ─── Push Action Intent Entity ───────────────────────────────────────────────

export interface PushActionIntent extends CommonFields {
  /** Customer tenant ID */
  tenantId: string;
  /** IOC entity ID */
  iocId: string;
  /** IOC category (for push mapping) */
  iocCategory: IocCategory;
  /** Target system type */
  targetSystemType: string;
  /** Action type (Req 15.1) */
  actionType: PushActionType;
  /** Intent status — mock/intent only in Phase 1 (Req 15.2) */
  intentStatus: PushIntentStatus;
  /** Who requested the push */
  requestedBy: string;
  /** When requested */
  requestedAt: string;
  /** Who approved (null if not approved) */
  approvedBy: string | null;
  /** When approved (null if not approved) */
  approvedAt: string | null;
  /** Execution reference (mock only in Phase 1) */
  executionReference: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface PushActionIntentValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Push_Action_Intent for structural correctness.
 * Checks: iocCategory known, targetSystemType non-empty, actionType known,
 * intentStatus known (Req 15.5).
 */
export function validatePushActionIntent(intent: PushActionIntent): PushActionIntentValidation {
  const errors: string[] = [];

  if (!intent.tenantId || intent.tenantId.trim() === '') {
    errors.push('tenantId: required');
  }

  if (!intent.iocId || intent.iocId.trim() === '') {
    errors.push('iocId: required');
  }

  if (!intent.iocCategory || !IOC_CATEGORIES.includes(intent.iocCategory)) {
    errors.push('iocCategory: must be a known taxonomy value');
  }

  if (!intent.targetSystemType || intent.targetSystemType.trim() === '') {
    errors.push('targetSystemType: required, must be a non-empty string');
  }

  if (!intent.actionType || !PUSH_ACTION_TYPES.includes(intent.actionType)) {
    errors.push(`actionType: must be one of: ${PUSH_ACTION_TYPES.join(', ')}`);
  }

  if (!intent.intentStatus || !PUSH_INTENT_STATUSES.includes(intent.intentStatus)) {
    errors.push(`intentStatus: must be one of: ${PUSH_INTENT_STATUSES.join(', ')}`);
  }

  if (!intent.id || intent.id.trim() === '') {
    errors.push('id: required');
  }

  if (!intent.tenant || !intent.tenant.tenantId || intent.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }

  return { valid: errors.length === 0, errors };
}
