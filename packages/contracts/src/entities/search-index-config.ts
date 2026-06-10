/**
 * Search Index Config Entity — Commander C2 (Spec 42)
 * Source: Universal Search
 * Use Cases: UC-154, UC-156
 */

import type { CommonFields } from './common';

/** Search index configuration — defines how entities are indexed for universal search */
export interface SearchIndexConfig extends CommonFields {
  entity_type: 'search-index-config';
  indexId: string;
  /** Which entity types are included in this index */
  entity_types: string[];
  /** Whether search results are scoped per-tenant */
  tenantScoped: boolean;
  /** Whether RBAC filtering is applied to results */
  rbacFiltered: boolean;
  /** Fields that require audit logging when searched */
  sensitiveFields: string[];
  /** Whether search queries are audit-logged */
  auditEnabled: boolean;
  /** Last time the index was rebuilt */
  lastReindexedAt: string;
}
