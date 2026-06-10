/**
 * Tenant IOC Allow/Block Entry — Commander C2 Canonical Entity
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 23.1, 23.2, 23.3, 23.4, 23.5
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * Tenant-specific IOC allow/block list entry.
 * - Allow entries suppress matches with a recorded suppression reference.
 * - Block entries force malicious regardless of platform confidence.
 * - Block overrides allow (DEC-allowblock-block-wins).
 */

import type { CommonFields } from './common';
import type { IocCategory, AllowBlockListType } from './intelligence-common';
import { IOC_CATEGORIES, ALLOW_BLOCK_LIST_TYPES } from './intelligence-common';

// ─── Tenant IOC Allow/Block Entry Entity ─────────────────────────────────────

export interface TenantIocAllowBlockEntry extends CommonFields {
  /** Customer tenant ID (Req 23.5) */
  tenant_id: string;
  /** IOC category from taxonomy (Req 23.5) */
  ioc_category: IocCategory;
  /** Indicator value (Req 23.5) */
  value: string;
  /** List type: allow or block (Req 23.5) */
  listType: AllowBlockListType;
  /** Who added this entry (Req 23.5) */
  added_by: string;
  /** When this entry was added (Req 23.5) */
  added_at: string;
  /** Reason for adding (Req 23.5) */
  reason: string;
  /** Optional expiry (Req 23.5) */
  expires_at: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface TenantIocAllowBlockEntryValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Tenant_IOC_AllowBlock_Entry for structural correctness.
 */
export function validateTenantIocAllowBlockEntry(
  entry: TenantIocAllowBlockEntry,
): TenantIocAllowBlockEntryValidation {
  const errors: string[] = [];

  if (!entry.tenant_id || entry.tenant_id.trim() === '') {
    errors.push('tenant_id: required');
  }

  if (!entry.ioc_category || !IOC_CATEGORIES.includes(entry.ioc_category)) {
    errors.push('ioc_category: must be a known taxonomy value');
  }

  if (!entry.value || entry.value.trim() === '') {
    errors.push('value: required, must be a non-empty string');
  }

  if (!entry.listType || !ALLOW_BLOCK_LIST_TYPES.includes(entry.listType)) {
    errors.push(`listType: must be one of: ${ALLOW_BLOCK_LIST_TYPES.join(', ')}`);
  }

  if (!entry.added_by || entry.added_by.trim() === '') {
    errors.push('added_by: required');
  }

  if (!entry.id || entry.id.trim() === '') {
    errors.push('id: required');
  }

  if (!entry.tenant || !entry.tenant.tenant_id || entry.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }

  return { valid: errors.length === 0, errors };
}
