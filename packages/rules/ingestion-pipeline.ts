// @ts-nocheck
/**
 * Modelled Ingestion Pipeline Orchestrator (C1 + C2 + C7 composed)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 9.1, 9.2
 *
 * Runs every ingestion path through the same normalise → dedup → relationship
 * flow. All against seed/mock data; no live external call.
 */

import type { IocCategory, SourceAttributionEntry, IocRelationshipState } from '../contracts/src/entities/intelligence-common';
import type { IndicatorOfCompromise } from '../contracts/src/entities/indicator-of-compromise';
import type { IocRelationship } from '../contracts/src/entities/ioc-relationship';
import { normaliseIoc } from './ioc-normalisation';
import { dedupAndMerge, buildDedupKey } from './ioc-dedup';

/** Ingestion path types (all 7 + inbound email) */
export type IngestionPath =
  | 'direct_feed'
  | 'vendor_advisory'
  | 'cve_embedded'
  | 'inbound_email'
  | 'manual_submission'
  | 'commercial_feed'
  | 'misp_stix_taxii';

export interface IngestionInput {
  path: IngestionPath;
  ioc_category: IocCategory;
  rawValue: string;
  source_id: string;
  confidence: number;
  severity: number;
  timestamp: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  relationshipState?: IocRelationshipState;
}

export interface IngestionOutput {
  ioc: IndicatorOfCompromise;
  action: 'create' | 'merge';
  relationship?: IocRelationship;
}

/**
 * Process an IOC through the standard ingestion pipeline.
 * Same flow regardless of ingestion path (Req 9.2).
 */
export function processIngestion(
  input: IngestionInput,
  catalogue: Map<string, IndicatorOfCompromise>,
  baseId: string,
): IngestionOutput {
  // Step 1: Normalise
  const { normalisedValue, originalRawValue } = normaliseIoc(input.ioc_category, input.rawValue);

  // Step 2: Build incoming IOC record
  const attribution: SourceAttributionEntry = {
    source_id: input.source_id,
    reportedConfidence: input.confidence,
    reportedSeverity: input.severity,
    originalRawValue,
    first_seen_at: input.timestamp,
    last_seen_at: input.timestamp,
  };

  const incoming: IndicatorOfCompromise = {
    id: baseId,
    tenant: { tenant_id: 'admin-tenant', tenant_name: 'Admin (Platform)' },
    created_at: input.timestamp,
    updated_at: input.timestamp,
    source: { connector_id: input.source_id, import_run_id: `run-${input.source_id}`, source_system: input.path, source_timestamp: input.timestamp },
    ioc_category: input.ioc_category,
    value: input.rawValue,
    normalisedValue,
    originalRawValue,
    confidence: input.confidence,
    severity: input.severity,
    tlpMarking: 'amber',
    expires_at: null,
    sourceAttribution: [attribution],
    first_seen_at: input.timestamp,
    last_seen_at: input.timestamp,
    active: true,
  };

  // Step 3: Dedup
  const key = buildDedupKey(normalisedValue, input.ioc_category);
  const existing = catalogue.get(key);
  const dedupResult = dedupAndMerge(incoming, existing);

  // Update catalogue
  catalogue.set(key, dedupResult.record);

  // Step 4: Create relationship if specified
  let relationship: IocRelationship | undefined;
  if (input.relatedEntityId && input.relationshipState) {
    relationship = {
      id: `${baseId}-rel`,
      tenant: { tenant_id: 'admin-tenant', tenant_name: 'Admin (Platform)' },
      created_at: input.timestamp,
      updated_at: input.timestamp,
      source: { connector_id: input.source_id, import_run_id: `run-${input.source_id}`, source_system: input.path, source_timestamp: input.timestamp },
      ioc_id: dedupResult.record.id,
      relatedEntityId: input.relatedEntityId,
      relatedEntityType: input.relatedEntityType ?? 'unknown',
      relationshipState: input.relationshipState,
      confidence: input.confidence,
      establishedAt: input.timestamp,
      lastUpdatedAt: input.timestamp,
      evidence_ref: `${input.path}-evidence`,
      stateHistory: [],
    };
  }

  return { ioc: dedupResult.record, action: dedupResult.action, relationship };
}
