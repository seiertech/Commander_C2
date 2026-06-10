/**
 * Break-Glass Request Entity — Commander C2 (Spec 35)
 * Source: Platform Security and Hardening
 * Use Cases: UC-151
 */

import type { CommonFields } from './common';

/** Break-glass request status lifecycle */
export type BreakGlassStatus = 'pending' | 'approved' | 'denied' | 'expired';

/** Break-glass request — emergency access elevation */
export interface BreakGlassRequest extends CommonFields {
  entityType: 'break-glass-request';
  requestId: string;
  requestorId: string;
  tenantId: string;
  reason: string;
  scope: string;
  status: BreakGlassStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  expiresAt: string;
  auditRef: string;
}
