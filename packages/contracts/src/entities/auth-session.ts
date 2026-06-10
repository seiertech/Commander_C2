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
  entityType: 'auth-session';
  sessionId: string;
  userId: string;
  tenantId: string;
  createdAt: string;
  expiresAt: string;
  mfaVerified: boolean;
  ipAddress: string;
  userAgent: string;
  status: AuthSessionStatus;
}
