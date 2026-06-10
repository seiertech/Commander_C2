/**
 * Cross-Plane Reference Resolver
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 17.3, 17.4
 *
 * Pure application-layer resolver for platformRecordId / iocId / sourceId.
 * Returns Admin-owned record without materialising a tenant-side copy.
 * Dangling reference surfaces as a resolution error (no cross-workload FK).
 */

export interface ResolutionResult<T> {
  resolved: boolean;
  record?: T;
  error?: string;
}

/**
 * Resolve a cross-plane reference from the Admin_Tenant catalogue.
 * No duplication — returns the original record by reference.
 * Dangling references produce a resolution error (Req 17.4).
 */
export function resolveReference<T>(
  referenceId: string,
  catalogue: Map<string, T>,
): ResolutionResult<T> {
  if (!referenceId || referenceId.trim() === '') {
    return { resolved: false, error: 'Reference ID is empty' };
  }

  const record = catalogue.get(referenceId);
  if (!record) {
    return { resolved: false, error: `Dangling reference: "${referenceId}" not found in catalogue` };
  }

  return { resolved: true, record };
}

/**
 * Batch resolve multiple cross-plane references.
 * Returns all resolved records and any dangling reference errors.
 */
export function batchResolveReferences<T>(
  referenceIds: string[],
  catalogue: Map<string, T>,
): { resolved: Map<string, T>; errors: string[] } {
  const resolved = new Map<string, T>();
  const errors: string[] = [];

  for (const id of referenceIds) {
    const result = resolveReference(id, catalogue);
    if (result.resolved && result.record) {
      resolved.set(id, result.record);
    } else {
      errors.push(result.error ?? `Failed to resolve: ${id}`);
    }
  }

  return { resolved, errors };
}
