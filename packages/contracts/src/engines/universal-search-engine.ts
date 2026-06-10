/**
 * Universal Search Engine — Commander C2 (Spec 42)
 * Source: Universal Search
 * Use Cases: UC-154, UC-155, UC-156
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  entityType: string;
  entityId: string;
  title: string;
  snippet: string;
  relevanceScore: number;
  route: string;
  tenantId: string;
  lastUpdated: string;
}

export interface SearchQuery {
  query: string;
  tenantId: string;
  userRole: string;
  entityTypeFilter?: string[];
  limit?: number;
  offset?: number;
}

export interface SearchPlan {
  originalQuery: string;
  normalisedQuery: string;
  targetEntityTypes: string[];
  rbacFilters: string[];
  auditRequired: boolean;
  sensitiveFieldsAccessed: string[];
}

export interface SearchAuditRecord {
  timestamp: string;
  userId: string;
  query: string;
  resultCount: number;
  sensitiveFieldsAccessed: string[];
  tenantId: string;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Execute a universal search across all governed entities.
 * Results are tenant-scoped and RBAC-filtered.
 */
export function search(query: SearchQuery): SearchResult[] {
  // In production this would query an index; for now returns empty results
  // This is the contract — implementation will back onto search infrastructure
  const plan = planQuery(query);

  if (!plan.normalisedQuery || plan.normalisedQuery.trim().length < 2) {
    return [];
  }

  // Placeholder: real implementation would query search index
  return [];
}

/**
 * Resolve a search result to its canonical object route.
 */
export function resolveCanonicalObject(result: SearchResult): string {
  const routeMap: Record<string, string> = {
    'case': '/cases',
    'risk-object': '/cases', // risk objects surface via their parent case
    'asset': '/assets',
    'identity': '/identity',
    'vulnerability-intelligence-record': '/vulnerabilities',
    'indicator-of-compromise': '/vulnerabilities',
    'connector': '/tool-health/connectors',
    'strategy-policy': '/strategy/centre',
    'control-framework': '/controls',
    'architecture-component': '/architecture',
    'direction-board': '/direction-boards',
    'audit-event': '/platform/audit',
  };

  const baseRoute = routeMap[result.entityType] ?? '/search';
  return `${baseRoute}/${result.entityId}`;
}

/**
 * Plan a search query — determines which entity types to search,
 * what RBAC filters apply, and whether audit logging is required.
 */
export function planQuery(query: SearchQuery): SearchPlan {
  const normalisedQuery = query.query.trim().toLowerCase();

  // Determine target entity types (all if no filter, otherwise use filter)
  const targetEntityTypes = query.entityTypeFilter && query.entityTypeFilter.length > 0
    ? query.entityTypeFilter
    : ['case', 'risk-object', 'asset', 'identity', 'vulnerability-intelligence-record',
       'indicator-of-compromise', 'connector', 'strategy-policy', 'control-framework',
       'architecture-component', 'direction-board', 'audit-event'];

  // RBAC filters based on role
  const rbacFilters: string[] = [`tenantId=${query.tenantId}`];
  if (query.userRole === 'Security Analyst') {
    rbacFilters.push('scope=team-assigned');
  }
  if (query.userRole === 'Read-Only Observer') {
    rbacFilters.push('exclude=audit-event');
  }

  // Determine if sensitive fields are being accessed
  const sensitivePatterns = ['identity', 'risk', 'credential', 'secret', 'password', 'key'];
  const sensitiveFieldsAccessed = sensitivePatterns.filter((p) => normalisedQuery.includes(p));
  const auditRequired = sensitiveFieldsAccessed.length > 0;

  return {
    originalQuery: query.query,
    normalisedQuery,
    targetEntityTypes,
    rbacFilters,
    auditRequired,
    sensitiveFieldsAccessed,
  };
}

/**
 * Filter search results by RBAC role permissions.
 */
export function filterByRbac(results: SearchResult[], userRole: string): SearchResult[] {
  // Role-based entity type visibility
  const restrictedByRole: Record<string, string[]> = {
    'Read-Only Observer': ['audit-event', 'strategy-policy'],
    'Security Analyst': [], // no restrictions beyond team scope
  };

  const restricted = restrictedByRole[userRole] ?? [];
  if (restricted.length === 0) return results;

  return results.filter((r) => !restricted.includes(r.entityType));
}

/**
 * Audit a sensitive search query — logs the query for adherence.
 */
export function auditSensitiveSearch(
  query: string,
  userId: string,
  tenantId: string,
  resultCount: number,
  sensitiveFieldsAccessed: string[]
): SearchAuditRecord {
  return {
    timestamp: new Date().toISOString(),
    userId,
    query,
    resultCount,
    sensitiveFieldsAccessed,
    tenantId,
  };
}
