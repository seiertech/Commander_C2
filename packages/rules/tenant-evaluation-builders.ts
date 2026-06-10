// @ts-nocheck
/**
 * Tenant Evaluation and IOC Match Builders (C9)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 11.1, 11.3, 11.5, 12.1, 12.2
 *
 * Pure constructors producing Tenant_Intelligence_Evaluation and Tenant_IOC_Match
 * records with evidence references and provenance. Risk produced only after
 * a confirming exposure state (KEV/EPSS alone never create risk).
 */

import type { TenantIntelligenceEvaluation } from '../contracts/src/entities/tenant-intelligence-evaluation';
import type { TenantIocMatch } from '../contracts/src/entities/tenant-ioc-match';
import type { EvaluationType, TenantExposureState, IocMatchType } from '../contracts/src/entities/intelligence-common';

export interface BuildEvaluationInput {
  id: string;
  tenant_id: string;
  platformRecordId: string;
  evaluationType: EvaluationType;
  evaluationState: TenantExposureState;
  matchedAssets: string[];
  matchedIdentities: string[];
  matchedObservables: string[];
  evidenceReferences: string[];
  evaluated_at: string;
  source_connector_id: string;
}

export interface BuildMatchInput {
  id: string;
  tenant_id: string;
  ioc_id: string;
  matchedObservableId: string;
  matchType: IocMatchType;
  matchConfidence: number;
  matchedAt: string;
  matchSource: string;
  evidenceReferences: string[];
  source_connector_id: string;
}

/**
 * Build a Tenant_Intelligence_Evaluation record.
 * Risk is only created when evaluationState confirms exposure (Req 11.5).
 */
export function buildTenantEvaluation(input: BuildEvaluationInput): TenantIntelligenceEvaluation {
  return {
    id: input.id,
    tenant: { tenant_id: input.tenant_id, tenant_name: `Tenant ${input.tenant_id}` },
    created_at: input.evaluated_at,
    updated_at: input.evaluated_at,
    source: {
      connector_id: input.source_connector_id,
      import_run_id: `eval-run-${input.id}`,
      source_system: 'intelligence-evaluation',
      source_timestamp: input.evaluated_at,
    },
    tenant_id: input.tenant_id,
    platformRecordId: input.platformRecordId,
    evaluationType: input.evaluationType,
    evaluationState: input.evaluationState,
    matchedAssets: input.matchedAssets,
    matchedIdentities: input.matchedIdentities,
    matchedObservables: input.matchedObservables,
    evidenceReferences: input.evidenceReferences,
    evaluated_at: input.evaluated_at,
  };
}

/**
 * Build a Tenant_IOC_Match referencing an existing Observable (COIM-D) by ID.
 * Preserves dedup model — references, not duplicates (Req 12.2).
 */
export function buildTenantIocMatch(input: BuildMatchInput): TenantIocMatch {
  return {
    id: input.id,
    tenant: { tenant_id: input.tenant_id, tenant_name: `Tenant ${input.tenant_id}` },
    created_at: input.matchedAt,
    updated_at: input.matchedAt,
    source: {
      connector_id: input.source_connector_id,
      import_run_id: `match-run-${input.id}`,
      source_system: 'ioc-matching',
      source_timestamp: input.matchedAt,
    },
    tenant_id: input.tenant_id,
    ioc_id: input.ioc_id,
    matchedObservableId: input.matchedObservableId,
    matchType: input.matchType,
    matchConfidence: input.matchConfidence,
    matchedAt: input.matchedAt,
    matchSource: input.matchSource,
    evidenceReferences: input.evidenceReferences,
  };
}
