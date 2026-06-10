// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
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
  tenantId: string;
  platformRecordId: string;
  evaluationType: EvaluationType;
  evaluationState: TenantExposureState;
  matchedAssets: string[];
  matchedIdentities: string[];
  matchedObservables: string[];
  evidenceReferences: string[];
  evaluatedAt: string;
  sourceConnectorId: string;
}

export interface BuildMatchInput {
  id: string;
  tenantId: string;
  iocId: string;
  matchedObservableId: string;
  matchType: IocMatchType;
  matchConfidence: number;
  matchedAt: string;
  matchSource: string;
  evidenceReferences: string[];
  sourceConnectorId: string;
}

/**
 * Build a Tenant_Intelligence_Evaluation record.
 * Risk is only created when evaluationState confirms exposure (Req 11.5).
 */
export function buildTenantEvaluation(input: BuildEvaluationInput): TenantIntelligenceEvaluation {
  return {
    id: input.id,
    tenant: { tenantId: input.tenantId, tenantName: `Tenant ${input.tenantId}` },
    createdAt: input.evaluatedAt,
    updatedAt: input.evaluatedAt,
    source: {
      connectorId: input.sourceConnectorId,
      importRunId: `eval-run-${input.id}`,
      sourceSystem: 'intelligence-evaluation',
      sourceTimestamp: input.evaluatedAt,
    },
    tenantId: input.tenantId,
    platformRecordId: input.platformRecordId,
    evaluationType: input.evaluationType,
    evaluationState: input.evaluationState,
    matchedAssets: input.matchedAssets,
    matchedIdentities: input.matchedIdentities,
    matchedObservables: input.matchedObservables,
    evidenceReferences: input.evidenceReferences,
    evaluatedAt: input.evaluatedAt,
  };
}

/**
 * Build a Tenant_IOC_Match referencing an existing Observable (COIM-D) by ID.
 * Preserves dedup model — references, not duplicates (Req 12.2).
 */
export function buildTenantIocMatch(input: BuildMatchInput): TenantIocMatch {
  return {
    id: input.id,
    tenant: { tenantId: input.tenantId, tenantName: `Tenant ${input.tenantId}` },
    createdAt: input.matchedAt,
    updatedAt: input.matchedAt,
    source: {
      connectorId: input.sourceConnectorId,
      importRunId: `match-run-${input.id}`,
      sourceSystem: 'ioc-matching',
      sourceTimestamp: input.matchedAt,
    },
    tenantId: input.tenantId,
    iocId: input.iocId,
    matchedObservableId: input.matchedObservableId,
    matchType: input.matchType,
    matchConfidence: input.matchConfidence,
    matchedAt: input.matchedAt,
    matchSource: input.matchSource,
    evidenceReferences: input.evidenceReferences,
  };
}
