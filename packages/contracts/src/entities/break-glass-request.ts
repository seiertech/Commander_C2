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
  entity_type: 'break-glass-request';
  request_id: string;
  requestorId: string;
  tenant_id: string;
  reason: string;
  scope: string;
  status: BreakGlassStatus;
  approved_by: string | null;
  approved_at: string | null;
  expires_at: string;
  audit_ref: string;
}
