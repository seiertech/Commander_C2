/**
 * Vendor Advisory IOC Extraction — Pure Function
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 5.2, 5.3
 *
 * Extracts/normalises each contained IOC into a distinct first-class IOC
 * and creates one IOC_Relationship per IOC with state linked_to_vendor_advisory.
 * Preserves advisory→CVE one-to-many.
 */

import type { VendorAdvisory } from '../contracts/src/entities/vendor-advisory';
import type { IndicatorOfCompromise } from '../contracts/src/entities/indicator-of-compromise';
import type { IocRelationship } from '../contracts/src/entities/ioc-relationship';
import type { IocCategory } from '../contracts/src/entities/intelligence-common';
import { normaliseIoc } from './ioc-normalisation';

export interface ExtractionInput {
  advisory: VendorAdvisory;
  /** IOC values with their categories to extract */
  iocEntries: Array<{ value: string; category: IocCategory; confidence: number; severity: number }>;
  baseIdPrefix: string;
  timestamp: string;
}

export interface ExtractionResult {
  iocs: IndicatorOfCompromise[];
  relationships: IocRelationship[];
}

/**
 * Extract IOCs from a vendor advisory, creating first-class IOC records
 * and linking each to the advisory with state 'linked_to_vendor_advisory' (Req 5.3).
 */
export function extractAdvisoryIocs(input: ExtractionInput): ExtractionResult {
  const iocs: IndicatorOfCompromise[] = [];
  const relationships: IocRelationship[] = [];

  for (let i = 0; i < input.iocEntries.length; i++) {
    const entry = input.iocEntries[i];
    const { normalisedValue, originalRawValue } = normaliseIoc(entry.category, entry.value);
    const iocId = `${input.baseIdPrefix}-ioc-${String(i + 1).padStart(4, '0')}`;

    const ioc: IndicatorOfCompromise = {
      id: iocId,
      tenant: input.advisory.tenant,
      createdAt: input.timestamp,
      updatedAt: input.timestamp,
      source: input.advisory.source,
      iocCategory: entry.category,
      value: entry.value,
      normalisedValue,
      originalRawValue,
      confidence: entry.confidence,
      severity: entry.severity,
      tlpMarking: 'amber',
      expiresAt: null,
      sourceAttribution: [{
        sourceId: input.advisory.source.connectorId,
        reportedConfidence: entry.confidence,
        reportedSeverity: entry.severity,
        originalRawValue,
        firstSeenAt: input.timestamp,
        lastSeenAt: input.timestamp,
      }],
      firstSeenAt: input.timestamp,
      lastSeenAt: input.timestamp,
      active: true,
    };

    const relationship: IocRelationship = {
      id: `${iocId}-rel`,
      tenant: input.advisory.tenant,
      createdAt: input.timestamp,
      updatedAt: input.timestamp,
      source: input.advisory.source,
      iocId,
      relatedEntityId: input.advisory.id,
      relatedEntityType: 'advisory',
      relationshipState: 'linked_to_vendor_advisory',
      confidence: entry.confidence,
      establishedAt: input.timestamp,
      lastUpdatedAt: input.timestamp,
      evidenceRef: `advisory-${input.advisory.advisoryId}`,
      stateHistory: [],
    };

    iocs.push(ioc);
    relationships.push(relationship);
  }

  return { iocs, relationships };
}
