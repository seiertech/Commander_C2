/**
 * Support Operation Entity — Commander SDR Canonical Model (Control Plane)
 *
 * Source: Master Technical Specification §Commercial Control Plane
 *
 * Support operations track operator-initiated support actions for tenants.
 *
 * Ownership: Seiertech Operator
 * Build Unit: Unit 23 (Control Plane)
 * Unlocks: /control-plane/support
 */

import type { CommonFields } from './common';

export const SUPPORT_OPERATION_STATUSES = ['open', 'in_progress', 'resolved', 'escalated', 'closed'] as const;
export type SupportOperationStatus = typeof SUPPORT_OPERATION_STATUSES[number];

export const SUPPORT_PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;
export type SupportPriority = typeof SUPPORT_PRIORITIES[number];

export const SUPPORT_CATEGORIES = ['platform_issue', 'configuration', 'onboarding', 'data_query', 'incident_support', 'feature_request'] as const;
export type SupportCategory = typeof SUPPORT_CATEGORIES[number];

export interface SupportOperation extends CommonFields {
  entityType: 'support-operation';
  customerId: string;
  tenantId: string;
  title: string;
  description: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportOperationStatus;
  assignedTo: string;
  openedAt: string;
  resolvedAt: string | null;
  resolutionNotes: string | null;
}

export interface SupportOperationValidation { valid: boolean; errors: string[]; }

export function validateSupportOperation(s: SupportOperation): SupportOperationValidation {
  const errors: string[] = [];
  if (!s.id || s.id.trim() === '') errors.push('id: required');
  if (!s.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!s.customerId || s.customerId.trim() === '') errors.push('customerId: required');
  if (!s.title || s.title.trim() === '') errors.push('title: required');
  if (!SUPPORT_OPERATION_STATUSES.includes(s.status)) errors.push(`status: must be one of: ${SUPPORT_OPERATION_STATUSES.join(', ')}`);
  if (!SUPPORT_PRIORITIES.includes(s.priority)) errors.push(`priority: must be one of: ${SUPPORT_PRIORITIES.join(', ')}`);
  if (!SUPPORT_CATEGORIES.includes(s.category)) errors.push(`category: must be one of: ${SUPPORT_CATEGORIES.join(', ')}`);
  return { valid: errors.length === 0, errors };
}
