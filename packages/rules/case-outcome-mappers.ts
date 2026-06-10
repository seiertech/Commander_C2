// @ts-nocheck
/**
 * Case/Action Outcome Mappers (C10)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 13.1, 13.2, 13.3, 13.4, 16.1, 16.2, 16.3, 16.4
 *
 * Pure mappers producing IOC_Case_Link and Vulnerability_Case_Link records
 * plus action recommendations. Never create/transition cases directly.
 */

import type { IocCaseLink } from '../contracts/src/entities/ioc-case-link';
import type { VulnerabilityCaseLink } from '../contracts/src/entities/vulnerability-case-link';
import type { IocCaseLinkType } from '../contracts/src/entities/intelligence-common';

/** Action follow-up types (Req 16.3) */
export const ACTION_FOLLOW_UPS = [
  'validate_block',
  'verify_no_business_impact',
  'rescan_requery',
  'monitor_for_recurrence',
  'close_or_reopen_case',
  'capture_evidence',
] as const;

export type ActionFollowUp = typeof ACTION_FOLLOW_UPS[number];

export interface ActionRecommendation {
  action_type: string;
  followUps: ActionFollowUp[];
  d3fendAlignment?: string;
}

/**
 * Build an IOC Case Link (type: threat-intelligence-estate-match).
 * Never creates or transitions a case — emits binding only (Req 13.2).
 */
export function buildIocCaseLink(params: {
  id: string;
  tenant_id: string;
  iocMatchId: string;
  case_id: string;
  linkType: IocCaseLinkType;
  linkedAt: string;
}): IocCaseLink {
  return {
    id: params.id,
    tenant: { tenant_id: params.tenant_id, tenant_name: `Tenant ${params.tenant_id}` },
    created_at: params.linkedAt,
    updated_at: params.linkedAt,
    source: {
      connector_id: 'case-mapper',
      import_run_id: `link-run-${params.id}`,
      source_system: 'intelligence-case-binding',
      source_timestamp: params.linkedAt,
    },
    tenant_id: params.tenant_id,
    iocMatchId: params.iocMatchId,
    case_id: params.case_id,
    linkType: params.linkType,
    linkedAt: params.linkedAt,
    status: 'active',
  };
}

/**
 * Build a Vulnerability Case Link (type: vulnerability).
 * Never creates or transitions a case — emits binding only.
 */
export function buildVulnerabilityCaseLink(params: {
  id: string;
  tenant_id: string;
  evaluationId: string;
  case_id: string;
  linkedAt: string;
}): VulnerabilityCaseLink {
  return {
    id: params.id,
    tenant: { tenant_id: params.tenant_id, tenant_name: `Tenant ${params.tenant_id}` },
    created_at: params.linkedAt,
    updated_at: params.linkedAt,
    source: {
      connector_id: 'case-mapper',
      import_run_id: `link-run-${params.id}`,
      source_system: 'vulnerability-case-binding',
      source_timestamp: params.linkedAt,
    },
    tenant_id: params.tenant_id,
    evaluationId: params.evaluationId,
    case_id: params.case_id,
    linkType: 'vulnerability',
    linkedAt: params.linkedAt,
    status: 'active',
  };
}

/**
 * Generate action recommendations for an IOC match action.
 * Includes D3FEND alignment where applicable (Req 16.2).
 */
export function generateActionRecommendation(params: {
  action_type: 'block' | 'alert' | 'quarantine' | 'investigate';
}): ActionRecommendation {
  const followUps: ActionFollowUp[] = ['capture_evidence'];

  switch (params.action_type) {
    case 'block':
      followUps.unshift('validate_block', 'verify_no_business_impact', 'monitor_for_recurrence');
      return { action_type: params.action_type, followUps, d3fendAlignment: 'D3-NI (Network Isolation)' };
    case 'quarantine':
      followUps.unshift('validate_block', 'rescan_requery');
      return { action_type: params.action_type, followUps, d3fendAlignment: 'D3-FE (File Encryption / Quarantine)' };
    case 'alert':
      followUps.unshift('rescan_requery', 'monitor_for_recurrence');
      return { action_type: params.action_type, followUps, d3fendAlignment: 'D3-DA (Dynamic Analysis)' };
    case 'investigate':
      followUps.unshift('rescan_requery', 'monitor_for_recurrence', 'close_or_reopen_case');
      return { action_type: params.action_type, followUps };
    default:
      return { action_type: params.action_type, followUps };
  }
}
