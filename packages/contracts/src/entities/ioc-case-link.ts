/**
 * IOC Case Link — Commander C2 Canonical Entity
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 13.5
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * A binding between an IOC match and a Commander case (via existing lifecycle).
 * caseId is an application-layer reference — no cross-workload FK.
 * IOC-created cases use 12-state lifecycle and threat-intelligence-estate-match type.
 */

import type { CommonFields } from './common';
import type { IocCaseLinkType } from './intelligence-common';
import { IOC_CASE_LINK_TYPES } from './intelligence-common';

// ─── IOC Case Link Entity ────────────────────────────────────────────────────

export interface IocCaseLink extends CommonFields {
  /** Customer tenant ID */
  tenant_id: string;
  /** Reference to Tenant_IOC_Match */
  iocMatchId: string;
  /** Reference to Case — application-layer, no cross-workload FK (Req 13.5) */
  case_id: string;
  /** Link type (Req 13.5) */
  linkType: IocCaseLinkType;
  /** When this link was created */
  linked_at: string;
  /** Link status */
  status: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface IocCaseLinkValidation {
  valid: boolean;
  errors: string[];
}

export function validateIocCaseLink(link: IocCaseLink): IocCaseLinkValidation {
  const errors: string[] = [];

  if (!link.tenant_id || link.tenant_id.trim() === '') {
    errors.push('tenant_id: required');
  }

  if (!link.iocMatchId || link.iocMatchId.trim() === '') {
    errors.push('iocMatchId: required');
  }

  if (!link.case_id || link.case_id.trim() === '') {
    errors.push('case_id: required');
  }

  if (!link.linkType || !IOC_CASE_LINK_TYPES.includes(link.linkType)) {
    errors.push(`linkType: must be one of: ${IOC_CASE_LINK_TYPES.join(', ')}`);
  }

  if (!link.id || link.id.trim() === '') {
    errors.push('id: required');
  }

  if (!link.tenant || !link.tenant.tenant_id || link.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }

  return { valid: errors.length === 0, errors };
}
