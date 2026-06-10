/**
 * Auth Session Entity — Commander C2 (Spec 35)
 * Source: Platform Security and Hardening
 * Use Cases: UC-148, UC-149
 */

import type { CommonFields } from './common';

/** Session status lifecycle */
export type AuthSessionStatus = 'active' | 'expired' | 'revoked';

/** Auth session — server-side session record */
export interface AuthSession extends CommonFields {
  entity_type: 'auth-session';
  session_id: string;
  user_id: string;
  tenant_id: string;
  created_at: string;
  expires_at: string;
  mfaVerified: boolean;
  ip_address: string;
  user_agent: string;
  status: AuthSessionStatus;
}
