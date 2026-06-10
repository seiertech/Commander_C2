/**
 * RBAC Policy Entity — Commander SDR (Spec 35)
 * Source: Platform Security and Hardening
 * Use Cases: UC-152
 */

import type { CommonFields } from './common';

/** RBAC policy — role-based access control rule */
export interface RbacPolicy extends CommonFields {
  entityType: 'rbac-policy';
  policyId: string;
  tenantId: string;
  role: string;
  permissions: string[];
  resourceScope: string;
  condition: string | null;
  active: boolean;
}
