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
  tenant_id: string;
  /** IOC entity ID */
  ioc_id: string;
  /** IOC category (for push mapping) */
  ioc_category: IocCategory;
  /** Target system type */
  targetSystemType: string;
  /** Action type (Req 15.1) */
  action_type: PushActionType;
  /** Intent status — mock/intent only in Phase 1 (Req 15.2) */
  intent_status: PushIntentStatus;
  /** Who requested the push */
  requested_by: string;
  /** When requested */
  requested_at: string;
  /** Who approved (null if not approved) */
  approved_by: string | null;
  /** When approved (null if not approved) */
  approved_at: string | null;
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

  if (!intent.tenant_id || intent.tenant_id.trim() === '') {
    errors.push('tenant_id: required');
  }

  if (!intent.ioc_id || intent.ioc_id.trim() === '') {
    errors.push('ioc_id: required');
  }

  if (!intent.ioc_category || !IOC_CATEGORIES.includes(intent.ioc_category)) {
    errors.push('ioc_category: must be a known taxonomy value');
  }

  if (!intent.targetSystemType || intent.targetSystemType.trim() === '') {
    errors.push('targetSystemType: required, must be a non-empty string');
  }

  if (!intent.action_type || !PUSH_ACTION_TYPES.includes(intent.action_type)) {
    errors.push(`action_type: must be one of: ${PUSH_ACTION_TYPES.join(', ')}`);
  }

  if (!intent.intent_status || !PUSH_INTENT_STATUSES.includes(intent.intent_status)) {
    errors.push(`intent_status: must be one of: ${PUSH_INTENT_STATUSES.join(', ')}`);
  }

  if (!intent.id || intent.id.trim() === '') {
    errors.push('id: required');
  }

  if (!intent.tenant || !intent.tenant.tenant_id || intent.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }

  return { valid: errors.length === 0, errors };
}
