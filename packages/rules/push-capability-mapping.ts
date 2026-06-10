/**
 * Push Capability Mapping — Pure Total Function
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 15.1, 15.3, 15.4
 *
 * Total map from iocCategory family → target system types.
 * Intent constructor restricted to mock/intent statuses (Phase 1).
 */

import type { IocCategory, PushActionType, PushIntentStatus } from '../contracts/src/entities/intelligence-common';
import type { PushActionIntent } from '../contracts/src/entities/push-action-intent';

/** Target system types by IOC category family (Req 15.3) */
export const PUSH_CAPABILITY_MAP: Record<string, string[]> = {
  // File hashes → EDR/AV/SIEM/SOAR
  file_hash_md5: ['edr', 'av', 'siem', 'soar'],
  file_hash_sha1: ['edr', 'av', 'siem', 'soar'],
  file_hash_sha256: ['edr', 'av', 'siem', 'soar'],
  file_path: ['edr', 'av', 'siem', 'soar'],

  // Domains/URLs → proxy/DNS/email_security/SOAR
  domain: ['proxy', 'dns', 'email_security', 'soar'],
  fqdn: ['proxy', 'dns', 'email_security', 'soar'],
  url: ['proxy', 'dns', 'email_security', 'soar'],
  sender_domain: ['proxy', 'dns', 'email_security', 'soar'],

  // IPs/CIDRs → firewall/NDR/SIEM/SOAR
  ip_address: ['firewall', 'ndr', 'siem', 'soar'],
  cidr_range: ['firewall', 'ndr', 'siem', 'soar'],

  // Email senders/subjects → email_security/SIEM/SOAR
  email_address: ['email_security', 'siem', 'soar'],
  email_subject: ['email_security', 'siem', 'soar'],

  // Detection rules → detection_engineering/SIEM/NDR/EDR
  yara_rule: ['detection_engineering', 'siem', 'ndr', 'edr'],
  sigma_rule: ['detection_engineering', 'siem', 'ndr', 'edr'],
  snort_suricata_rule: ['detection_engineering', 'siem', 'ndr', 'edr'],

  // Cloud resource IDs → cloud_security_tooling
  cloud_resource_id: ['cloud_security_tooling'],
  azure_ad_object_id: ['cloud_security_tooling'],
  aws_account_id: ['cloud_security_tooling'],

  // Other categories → SIEM (general telemetry)
  registry_key: ['siem', 'edr'],
  process_name: ['siem', 'edr'],
  mutex: ['siem', 'edr'],
  certificate_thumbprint: ['siem', 'soar'],
  user_agent: ['proxy', 'siem'],
  container_image: ['cloud_security_tooling', 'siem'],
  package_name: ['siem', 'soar'],
  other: ['siem'],
};

/**
 * Get target system types for a given IOC category.
 * Total: returns at least one target for every category (Req 15.3).
 */
export function getTargetSystems(iocCategory: IocCategory): string[] {
  return PUSH_CAPABILITY_MAP[iocCategory] ?? ['siem'];
}

/** Phase 1 allowed intent statuses (no live push — Req 15.4) */
export const PHASE1_ALLOWED_STATUSES: PushIntentStatus[] = [
  'recommended',
  'requires_approval',
  'approved',
  'queued',
  'pushed_mock',
  'failed_mock',
  'live_push_deferred',
];

/**
 * Build a Push_Action_Intent (Phase 1: mock/intent statuses only).
 * Never live-executed (Req 15.4).
 */
export function buildPushActionIntent(params: {
  id: string;
  tenantId: string;
  iocId: string;
  iocCategory: IocCategory;
  targetSystemType: string;
  actionType: PushActionType;
  intentStatus: PushIntentStatus;
  requestedBy: string;
  requestedAt: string;
}): PushActionIntent {
  return {
    id: params.id,
    tenant: { tenantId: params.tenantId, tenantName: `Tenant ${params.tenantId}` },
    createdAt: params.requestedAt,
    updatedAt: params.requestedAt,
    source: {
      connectorId: 'push-intent-builder',
      importRunId: `push-run-${params.id}`,
      sourceSystem: 'intelligence-push',
      sourceTimestamp: params.requestedAt,
    },
    tenantId: params.tenantId,
    iocId: params.iocId,
    iocCategory: params.iocCategory,
    targetSystemType: params.targetSystemType,
    actionType: params.actionType,
    intentStatus: params.intentStatus,
    requestedBy: params.requestedBy,
    requestedAt: params.requestedAt,
    approvedBy: null,
    approvedAt: null,
    executionReference: `mock-execution-${params.id}`,
  };
}
