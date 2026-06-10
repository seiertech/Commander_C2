/**
 * Notification Entity — Commander C2 Canonical Model
 *
 * Source: Spec #26 Case Communication and Broadcast Channel
 *
 * Models in-app notifications delivered to analysts. Covers SLA warnings,
 * case updates, escalations, assignment changes, and approval requests.
 * Phase 1 is intent/status only — no live push notification infrastructure.
 *
 * Constraints:
 * - Notifications are system-generated (no manual creation)
 * - Read/unread state tracked per user
 * - Deep link to originating entity surface
 */

import type { CommonFields } from './common';

// ─── Notification Type ───────────────────────────────────────────────────────

export const NOTIFICATION_TYPES = [
  'sla_warning',
  'case_update',
  'escalation',
  'assignment',
  'approval_required',
  'system_alert',
] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];

// ─── Notification Severity ───────────────────────────────────────────────────

export const NOTIFICATION_SEVERITIES = ['critical', 'warning', 'info'] as const;
export type NotificationSeverity = typeof NOTIFICATION_SEVERITIES[number];

// ─── Notification Entity ─────────────────────────────────────────────────────

export interface Notification extends CommonFields {
  entityType: 'notification';
  /** Target user */
  recipientUserId: string;
  /** Notification category */
  notificationType: NotificationType;
  /** Urgency level */
  severity: NotificationSeverity;
  /** Short title */
  title: string;
  /** Notification body */
  message: string;
  /** Related entity reference */
  entityRef: string;
  /** Related entity type (case, war-room, etc) */
  relatedEntityType: string;
  /** Read state */
  read: boolean;
  /** When read (null if unread) */
  readAt: string | null;
  /** Deep link URL */
  actionUrl: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface NotificationValidation {
  valid: boolean;
  errors: string[];
}

export function validateNotification(record: Notification): NotificationValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') errors.push('id: required');
  if (!record.tenant || !record.tenant.tenantId) errors.push('tenant.tenantId: required');
  if (!record.recipientUserId || record.recipientUserId.trim() === '') errors.push('recipientUserId: required');
  if (!record.notificationType || !NOTIFICATION_TYPES.includes(record.notificationType)) errors.push(`notificationType: must be one of: ${NOTIFICATION_TYPES.join(', ')}`);
  if (!record.severity || !NOTIFICATION_SEVERITIES.includes(record.severity)) errors.push(`severity: must be one of: ${NOTIFICATION_SEVERITIES.join(', ')}`);
  if (!record.title || record.title.trim() === '') errors.push('title: required');
  if (!record.message || record.message.trim() === '') errors.push('message: required');
  if (!record.entityRef || record.entityRef.trim() === '') errors.push('entityRef: required');
  if (!record.relatedEntityType || record.relatedEntityType.trim() === '') errors.push('relatedEntityType: required');

  return { valid: errors.length === 0, errors };
}
