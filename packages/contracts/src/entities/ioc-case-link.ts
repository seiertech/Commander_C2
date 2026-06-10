/**
 * IOC Case Link — Commander SDR Canonical Entity
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
  tenantId: string;
  /** Reference to Tenant_IOC_Match */
  iocMatchId: string;
  /** Reference to Case — application-layer, no cross-workload FK (Req 13.5) */
  caseId: string;
  /** Link type (Req 13.5) */
  linkType: IocCaseLinkType;
  /** When this link was created */
  linkedAt: string;
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

  if (!link.tenantId || link.tenantId.trim() === '') {
    errors.push('tenantId: required');
  }

  if (!link.iocMatchId || link.iocMatchId.trim() === '') {
    errors.push('iocMatchId: required');
  }

  if (!link.caseId || link.caseId.trim() === '') {
    errors.push('caseId: required');
  }

  if (!link.linkType || !IOC_CASE_LINK_TYPES.includes(link.linkType)) {
    errors.push(`linkType: must be one of: ${IOC_CASE_LINK_TYPES.join(', ')}`);
  }

  if (!link.id || link.id.trim() === '') {
    errors.push('id: required');
  }

  if (!link.tenant || !link.tenant.tenantId || link.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }

  return { valid: errors.length === 0, errors };
}
