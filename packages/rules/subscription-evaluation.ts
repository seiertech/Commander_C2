/**
 * Subscription Evaluation Engine — Commander SDR
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 10.1, 10.2, 11.1
 *
 * Pure functions that evaluate platform intelligence records against tenant
 * subscriptions' applicabilityFilters. No live API calls — operates on in-memory data.
 *
 * Filter criteria evaluated:
 * - sourceType match
 * - iocCategory inclusion/exclusion
 * - severity threshold
 * - TLP threshold
 * - affectedProducts overlap
 */

import type { TenantIntelligenceSubscription } from '../contracts/src/entities/tenant-intelligence-subscription';
import type { PlatformIntelligenceRecord } from '../contracts/src/entities/platform-intelligence-record';
import type { TlpMarking, IocCategory, PlatformIntelligenceSourceType } from '../contracts/src/entities/intelligence-common';
import { TLP_MARKINGS } from '../contracts/src/entities/intelligence-common';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SubscriptionEvaluationResult {
  /** Whether the platform record is relevant to this subscription */
  relevant: boolean;
  /** Reasons why the record was deemed relevant (or not) */
  reasons: string[];
}

export interface TenantEvaluationInput {
  /** Tenant ID from the subscription */
  tenantId: string;
  /** Subscription ID that matched */
  subscriptionId: string;
  /** Platform record ID being evaluated */
  platformRecordId: string;
  /** Reasons the record is relevant */
  reasons: string[];
}

// ─── Filter Shapes ───────────────────────────────────────────────────────────

interface SourceTypeFilter {
  sourceType?: PlatformIntelligenceSourceType;
}

interface IocCategoryInclusionFilter {
  iocCategoryInclusion?: IocCategory[];
}

interface IocCategoryExclusionFilter {
  iocCategoryExclusion?: IocCategory[];
}

interface SeverityThresholdFilter {
  severityThreshold?: number;
}

interface TlpThresholdFilter {
  tlpThreshold?: TlpMarking;
}

interface AffectedProductsFilter {
  affectedProducts?: string[];
}

type ApplicabilityFilter =
  | SourceTypeFilter
  | IocCategoryInclusionFilter
  | IocCategoryExclusionFilter
  | SeverityThresholdFilter
  | TlpThresholdFilter
  | AffectedProductsFilter;

// ─── Extended Record Shape (optional fields for IOC/vuln records) ────────────

interface EvaluableRecord extends PlatformIntelligenceRecord {
  /** IOC category if this is an IOC-related record */
  iocCategory?: IocCategory;
  /** TLP marking if present */
  tlpMarking?: TlpMarking;
  /** Affected products (from Vulnerability or Advisory records) */
  affectedProducts?: string[];
  /** Source type from the originating Platform_Intelligence_Source */
  sourceType?: PlatformIntelligenceSourceType;
}

// ─── TLP Ordering ────────────────────────────────────────────────────────────

const TLP_ORDER: Record<TlpMarking, number> = {
  white: 0,
  green: 1,
  amber: 2,
  amber_strict: 3,
  red: 4,
};

/**
 * Returns true if the record's TLP marking is at or below the threshold
 * (i.e., the tenant is willing to receive records up to this sensitivity level).
 */
function isTlpWithinThreshold(recordTlp: TlpMarking | undefined, threshold: TlpMarking): boolean {
  if (!recordTlp) return true; // No TLP on record = most permissive, allow through
  return TLP_ORDER[recordTlp] <= TLP_ORDER[threshold];
}

// ─── Core Evaluation Function ────────────────────────────────────────────────

/**
 * Evaluates a platform intelligence record against a single tenant subscription's
 * applicabilityFilters.
 *
 * Returns { relevant: true, reasons: [...] } if the record passes all filters,
 * or { relevant: false, reasons: [...] } if any filter excludes it.
 *
 * Semantics:
 * - A subscription with empty applicabilityFilters matches everything.
 * - Each filter is evaluated independently; ALL must pass for relevance.
 * - Missing fields on the record are treated permissively (pass the filter).
 */
export function evaluateSubscription(
  platformRecord: EvaluableRecord,
  subscription: TenantIntelligenceSubscription,
): SubscriptionEvaluationResult {
  const reasons: string[] = [];
  const filters = (subscription.applicabilityFilters ?? []) as ApplicabilityFilter[];

  // No filters = everything is relevant
  if (filters.length === 0) {
    return { relevant: true, reasons: ['No applicability filters — record accepted by default'] };
  }

  for (const filter of filters) {
    const f = filter as Record<string, unknown>;

    // Source type match
    if ('sourceType' in f && f.sourceType) {
      const requiredSource = f.sourceType as PlatformIntelligenceSourceType;
      if (platformRecord.sourceType && platformRecord.sourceType !== requiredSource) {
        return {
          relevant: false,
          reasons: [`sourceType filter: record sourceType '${platformRecord.sourceType}' does not match required '${requiredSource}'`],
        };
      }
      reasons.push(`sourceType filter: matched '${requiredSource}'`);
    }

    // IOC category inclusion
    if ('iocCategoryInclusion' in f && Array.isArray(f.iocCategoryInclusion)) {
      const included = f.iocCategoryInclusion as IocCategory[];
      if (platformRecord.iocCategory) {
        if (!included.includes(platformRecord.iocCategory)) {
          return {
            relevant: false,
            reasons: [`iocCategoryInclusion filter: record category '${platformRecord.iocCategory}' not in inclusion list`],
          };
        }
        reasons.push(`iocCategoryInclusion filter: category '${platformRecord.iocCategory}' is included`);
      }
      // No iocCategory on record = skip this filter (permissive)
    }

    // IOC category exclusion
    if ('iocCategoryExclusion' in f && Array.isArray(f.iocCategoryExclusion)) {
      const excluded = f.iocCategoryExclusion as IocCategory[];
      if (platformRecord.iocCategory) {
        if (excluded.includes(platformRecord.iocCategory)) {
          return {
            relevant: false,
            reasons: [`iocCategoryExclusion filter: record category '${platformRecord.iocCategory}' is in exclusion list`],
          };
        }
        reasons.push(`iocCategoryExclusion filter: category '${platformRecord.iocCategory}' is not excluded`);
      }
    }

    // Severity threshold
    if ('severityThreshold' in f && typeof f.severityThreshold === 'number') {
      const threshold = f.severityThreshold as number;
      if (platformRecord.severity < threshold) {
        return {
          relevant: false,
          reasons: [`severityThreshold filter: record severity ${platformRecord.severity} below threshold ${threshold}`],
        };
      }
      reasons.push(`severityThreshold filter: record severity ${platformRecord.severity} meets threshold ${threshold}`);
    }

    // TLP threshold
    if ('tlpThreshold' in f && f.tlpThreshold) {
      const threshold = f.tlpThreshold as TlpMarking;
      if (!isTlpWithinThreshold(platformRecord.tlpMarking, threshold)) {
        return {
          relevant: false,
          reasons: [`tlpThreshold filter: record TLP '${platformRecord.tlpMarking}' exceeds threshold '${threshold}'`],
        };
      }
      reasons.push(`tlpThreshold filter: record TLP within threshold '${threshold}'`);
    }

    // Affected products overlap
    if ('affectedProducts' in f && Array.isArray(f.affectedProducts)) {
      const requiredProducts = f.affectedProducts as string[];
      if (platformRecord.affectedProducts && platformRecord.affectedProducts.length > 0) {
        const overlap = platformRecord.affectedProducts.some(p => requiredProducts.includes(p));
        if (!overlap) {
          return {
            relevant: false,
            reasons: [`affectedProducts filter: no overlap between record products and subscription products`],
          };
        }
        reasons.push(`affectedProducts filter: product overlap found`);
      }
      // No affectedProducts on record = permissive pass
    }
  }

  return { relevant: true, reasons };
}

// ─── Distribution Function ───────────────────────────────────────────────────

/**
 * Evaluates a platform intelligence record against all provided subscriptions
 * and produces TenantEvaluationInput records for each relevant subscription.
 *
 * Only active subscriptions are evaluated. Paused/cancelled are skipped.
 *
 * Pure function — no I/O, no live API calls.
 */
export function distributeToTenants(
  platformRecord: EvaluableRecord,
  subscriptions: TenantIntelligenceSubscription[],
): TenantEvaluationInput[] {
  const results: TenantEvaluationInput[] = [];

  for (const sub of subscriptions) {
    // Only evaluate active subscriptions
    if (sub.subscriptionState !== 'active') {
      continue;
    }

    const evaluation = evaluateSubscription(platformRecord, sub);

    if (evaluation.relevant) {
      results.push({
        tenantId: sub.tenantId,
        subscriptionId: sub.id,
        platformRecordId: platformRecord.id,
        reasons: evaluation.reasons,
      });
    }
  }

  return results;
}
