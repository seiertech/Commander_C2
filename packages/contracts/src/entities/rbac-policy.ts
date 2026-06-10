/**
 * RBAC Policy Entity — Commander C2 (Spec 35)
 * Source: Platform Security and Hardening
 * Use Cases: UC-152
 */

import type { CommonFields } from './common';

/** RBAC policy — role-based access control rule */
export interface RbacPolicy extends CommonFields {
  entity_type: 'rbac-policy';
  policy_id: string;
  tenant_id: string;
  role: string;
  permissions: string[];
  resourceScope: string;
  condition: string | null;
  active: boolean;
}
