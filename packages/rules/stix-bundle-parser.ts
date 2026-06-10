/**
 * STIX Bundle Parser Contract — Commander C2
 *
 * Communications Excellence Phase 1.
 * Pure functions for parsing STIX bundles, mapping to Commander entities,
 * and scoring relevance against estate assets/identities.
 *
 * No I/O. No live STIX/TAXII feeds. No side effects.
 */

import type { StixObjectType } from '../contracts/src/entities/stix-bundle-ingest';
import { STIX_OBJECT_TYPES } from '../contracts/src/entities/stix-bundle-ingest';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Parsed STIX object */
export interface StixObject {
  /** STIX object type */
  type: StixObjectType;
  /** STIX identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** STIX pattern (indicators only) */
  pattern?: string;
  /** Labels/tags */
  labels?: string[];
}

/** Parse result */
export interface StixParseResult {
  /** Whether the bundle was valid */
  valid: boolean;
  /** STIX bundle version */
  version: string;
  /** Parsed objects */
  objects: StixObject[];
  /** Parse errors */
  errors: string[];
}

/** Observable mapping from STIX to Commander */
export interface ObservableMapping {
  /** Source STIX object ID */
  stixId: string;
  /** Commander observable type */
  observableType: string;
  /** Observable value */
  value: string;
  /** Confidence from source (0-100) */
  confidence: number;
}

/** IOC mapping from STIX to Commander */
export interface IocMapping {
  /** Source STIX object ID */
  stixId: string;
  /** IOC category */
  category: string;
  /** IOC value */
  value: string;
  /** Labels from source */
  labels: string[];
}

/** Attack pattern mapping from STIX to Commander */
export interface AttackPatternMapping {
  /** Source STIX object ID */
  stixId: string;
  /** ATT&CK technique ID */
  techniqueId: string;
  /** Technique name */
  name: string;
}

/** Result of mapping STIX to Commander entities */
export interface StixMappingResult {
  observables: ObservableMapping[];
  iocs: IocMapping[];
  attackPatterns: AttackPatternMapping[];
}

/** Estate asset for relevance scoring */
export interface EstateAsset {
  id: string;
  hostname?: string;
  ipAddress?: string;
  software?: string[];
}

/** Estate identity for relevance scoring */
export interface EstateIdentity {
  id: string;
  email?: string;
  username?: string;
}

/** Relevance score result */
export interface RelevanceScoreResult {
  /** Overall relevance score 0-100 */
  relevanceScore: number;
  /** Count of affected assets */
  affectedAssetCount: number;
  /** Count of affected identities */
  affectedIdentityCount: number;
  /** Whether a case should be created */
  recommendCaseCreation: boolean;
}

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Parse a STIX bundle from raw JSON.
 *
 * @param rawJson - Raw JSON string of the STIX bundle
 * @returns StixParseResult with valid flag, version, objects, and errors
 */
export function parseStixBundle(rawJson: string): StixParseResult {
  const errors: string[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    return { valid: false, version: '', objects: [], errors: ['Invalid JSON'] };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, version: '', objects: [], errors: ['Root must be an object'] };
  }

  const bundle = parsed as Record<string, unknown>;

  // Check bundle type
  if (bundle.type !== 'bundle') {
    errors.push(`Expected type 'bundle', got '${bundle.type}'`);
  }

  // Extract version
  const version = typeof bundle.spec_version === 'string' ? bundle.spec_version : '';
  if (!version) {
    errors.push('spec_version is required');
  }

  // Extract objects
  const rawObjects = Array.isArray(bundle.objects) ? bundle.objects : [];
  if (rawObjects.length === 0) {
    errors.push('Bundle contains no objects');
  }

  const objects: StixObject[] = [];
  for (let i = 0; i < rawObjects.length; i++) {
    const raw = rawObjects[i] as Record<string, unknown>;
    if (!raw || typeof raw !== 'object') {
      errors.push(`objects[${i}]: not an object`);
      continue;
    }

    const type = raw.type as string;
    if (!type || !STIX_OBJECT_TYPES.includes(type as StixObjectType)) {
      // Skip non-supported object types silently (STIX has many object types)
      continue;
    }

    const obj: StixObject = {
      type: type as StixObjectType,
      id: String(raw.id ?? ''),
      name: String(raw.name ?? ''),
      pattern: typeof raw.pattern === 'string' ? raw.pattern : undefined,
      labels: Array.isArray(raw.labels) ? raw.labels.map(String) : undefined,
    };

    objects.push(obj);
  }

  return { valid: errors.length === 0, version, objects, errors };
}

/**
 * Map parsed STIX objects to Commander entity mappings.
 *
 * @param stixObjects - Parsed STIX objects
 * @returns Mappings for observables, IOCs, and attack patterns
 */
export function mapStixToCommander(stixObjects: StixObject[]): StixMappingResult {
  const observables: ObservableMapping[] = [];
  const iocs: IocMapping[] = [];
  const attackPatterns: AttackPatternMapping[] = [];

  for (const obj of stixObjects) {
    switch (obj.type) {
      case 'indicator':
        // Indicators map to both observables and IOCs
        if (obj.pattern) {
          const extracted = extractFromPattern(obj.pattern);
          if (extracted) {
            observables.push({
              stixId: obj.id,
              observableType: extracted.type,
              value: extracted.value,
              confidence: 70,
            });
            iocs.push({
              stixId: obj.id,
              category: extracted.iocCategory,
              value: extracted.value,
              labels: obj.labels ?? [],
            });
          }
        }
        break;

      case 'attack-pattern':
        // Extract technique ID from external references or name
        const techniqueId = extractTechniqueId(obj);
        if (techniqueId) {
          attackPatterns.push({
            stixId: obj.id,
            techniqueId,
            name: obj.name,
          });
        }
        break;

      case 'malware':
      case 'tool':
        // Map to IOCs with malware/tool labels
        iocs.push({
          stixId: obj.id,
          category: 'process_name',
          value: obj.name,
          labels: [...(obj.labels ?? []), obj.type],
        });
        break;

      case 'campaign':
      case 'threat-actor':
        // Informational — map as observables for context
        observables.push({
          stixId: obj.id,
          observableType: obj.type,
          value: obj.name,
          confidence: 50,
        });
        break;

      case 'vulnerability':
        // Map vulnerability as IOC
        iocs.push({
          stixId: obj.id,
          category: 'other',
          value: obj.name,
          labels: [...(obj.labels ?? []), 'vulnerability'],
        });
        break;
    }
  }

  return { observables, iocs, attackPatterns };
}

/**
 * Score relevance of STIX mappings against estate assets and identities.
 *
 * @param mappings - Mapped STIX entities
 * @param estateAssets - Estate assets to match against
 * @param estateIdentities - Estate identities to match against
 * @returns RelevanceScoreResult with score, affected counts, and case recommendation
 */
export function scoreRelevance(
  mappings: StixMappingResult,
  estateAssets: EstateAsset[],
  estateIdentities: EstateIdentity[],
): RelevanceScoreResult {
  let affectedAssetCount = 0;
  let affectedIdentityCount = 0;

  // Check IOC/observable values against assets
  const allValues = [
    ...mappings.observables.map((o) => o.value.toLowerCase()),
    ...mappings.iocs.map((i) => i.value.toLowerCase()),
  ];

  for (const asset of estateAssets) {
    const assetValues = [
      asset.hostname?.toLowerCase(),
      asset.ipAddress?.toLowerCase(),
      ...(asset.software?.map((s) => s.toLowerCase()) ?? []),
    ].filter(Boolean) as string[];

    if (assetValues.some((av) => allValues.some((v) => v.includes(av) || av.includes(v)))) {
      affectedAssetCount++;
    }
  }

  // Check against identities
  for (const identity of estateIdentities) {
    const identityValues = [
      identity.email?.toLowerCase(),
      identity.username?.toLowerCase(),
    ].filter(Boolean) as string[];

    if (identityValues.some((iv) => allValues.some((v) => v.includes(iv) || iv.includes(v)))) {
      affectedIdentityCount++;
    }
  }

  // Compute relevance score
  const totalMappings = mappings.observables.length + mappings.iocs.length + mappings.attackPatterns.length;
  const totalMatches = affectedAssetCount + affectedIdentityCount;

  let relevanceScore: number;
  if (totalMappings === 0) {
    relevanceScore = 0;
  } else if (totalMatches === 0) {
    // Base score from having intelligence — no estate match
    relevanceScore = Math.min(totalMappings * 5, 30);
  } else {
    // Significant relevance when estate matches exist
    const matchRatio = totalMatches / (estateAssets.length + estateIdentities.length || 1);
    relevanceScore = Math.min(Math.round(30 + matchRatio * 70 + totalMappings * 2), 100);
  }

  // Recommend case creation if relevance >= 70 (configurable via strategy)
  const recommendCaseCreation = relevanceScore >= 70;

  return { relevanceScore, affectedAssetCount, affectedIdentityCount, recommendCaseCreation };
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

interface PatternExtraction {
  type: string;
  value: string;
  iocCategory: string;
}

function extractFromPattern(pattern: string): PatternExtraction | null {
  // STIX patterns: [ipv4-addr:value = '1.2.3.4']
  const ipMatch = pattern.match(/ipv4-addr:value\s*=\s*'([^']+)'/);
  if (ipMatch) {
    return { type: 'ip-address', value: ipMatch[1], iocCategory: 'ip_address' };
  }

  const domainMatch = pattern.match(/domain-name:value\s*=\s*'([^']+)'/);
  if (domainMatch) {
    return { type: 'domain', value: domainMatch[1], iocCategory: 'domain' };
  }

  const urlMatch = pattern.match(/url:value\s*=\s*'([^']+)'/);
  if (urlMatch) {
    return { type: 'url', value: urlMatch[1], iocCategory: 'url' };
  }

  const hashMatch = pattern.match(/file:hashes\.'SHA-256'\s*=\s*'([^']+)'/);
  if (hashMatch) {
    return { type: 'file-hash', value: hashMatch[1], iocCategory: 'file_hash_sha256' };
  }

  const emailMatch = pattern.match(/email-addr:value\s*=\s*'([^']+)'/);
  if (emailMatch) {
    return { type: 'email', value: emailMatch[1], iocCategory: 'email_address' };
  }

  return null;
}

function extractTechniqueId(obj: StixObject): string | null {
  // Try to extract MITRE ATT&CK technique ID from name (e.g., "T1566.001 - Spearphishing Attachment")
  const nameMatch = obj.name.match(/(T\d{4}(?:\.\d{3})?)/);
  if (nameMatch) return nameMatch[1];

  // Try from labels
  if (obj.labels) {
    for (const label of obj.labels) {
      const labelMatch = label.match(/(T\d{4}(?:\.\d{3})?)/);
      if (labelMatch) return labelMatch[1];
    }
  }

  return null;
}
