/**
 * Normalisation Layer — Commander C2 Canonical Entity Model
 *
 * Source: Spec #60 Internal and External Attack Surface Framework
 * Source: Spec #61 Universal Security Signal Connector Contract
 * Source: Spec #62 Verdict Semantics Specification
 *
 * Unit 5 Deliverables:
 * 1. Entity matching engine (cross-source identity resolution)
 * 2. Authority resolution (multi-source attribute conflict resolution)
 * 3. Verdict semantics processing (8 dispositions per Spec #62)
 * 4. Inverse discovery routing (threat intel → estate entity matching)
 * 5. Surface attribution (internal/external attack surface assignment)
 *
 * Doctrinal Assertions:
 * - Assertion 10: Surface attribution must be preserved on relevant records.
 * - Assertion 11: Connector classes are A/B/C/D only; verdicts preserve semantic disposition.
 */

import type { ConnectorClass, SurfaceAttribution, VerdictDisposition } from '../entities/common';

// ─── 1. Entity Matching Engine ───────────────────────────────────────────────

/** Entity match candidate from a connector source */
export interface EntityMatchCandidate {
  entityId: string;
  entityType: 'asset' | 'identity' | 'connector';
  sourceConnectorId: string;
  connectorClass: ConnectorClass;
  attributes: Record<string, string>; // key-value pairs for matching (hostname, ip, email, etc.)
  confidence: number; // 0-100
  lastSeenAt: string; // ISO 8601
}

/** Entity match result */
export interface EntityMatchResult {
  matched: boolean;
  canonicalEntityId: string | null;
  matchedCandidates: EntityMatchCandidate[];
  matchScore: number; // 0-100
  matchMethod: 'exact' | 'fuzzy' | 'composite' | 'none';
  rationale: string;
}

/**
 * Match entities across sources using attribute comparison.
 *
 * Matching logic:
 * - Exact match: same entityType + any shared attribute value → score 100
 * - Composite match: same entityType + 2+ partial attribute overlaps → score 75
 * - Fuzzy match: same entityType + 1 partial attribute overlap → score 50
 * - No match: score 0
 */
export function matchEntities(candidates: EntityMatchCandidate[]): EntityMatchResult {
  if (candidates.length === 0) {
    return {
      matched: false,
      canonicalEntityId: null,
      matchedCandidates: [],
      matchScore: 0,
      matchMethod: 'none',
      rationale: 'No candidates provided.',
    };
  }

  if (candidates.length === 1) {
    return {
      matched: false,
      canonicalEntityId: null,
      matchedCandidates: [candidates[0]],
      matchScore: 0,
      matchMethod: 'none',
      rationale: 'Single candidate — no cross-source matching possible.',
    };
  }

  // Group candidates by entityType
  const byType = new Map<string, EntityMatchCandidate[]>();
  for (const c of candidates) {
    const group = byType.get(c.entityType) || [];
    group.push(c);
    byType.set(c.entityType, group);
  }

  // Find best match across groups of same entityType
  let bestScore = 0;
  let bestMethod: EntityMatchResult['matchMethod'] = 'none';
  let bestMatched: EntityMatchCandidate[] = [];
  let bestRationale = 'No matching entities found across sources.';

  for (const [entityType, group] of byType) {
    if (group.length < 2) continue;

    // Compare all pairs within the same entityType group
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i];
        const b = group[j];
        const { score, method, rationale } = compareAttributes(a, b);

        if (score > bestScore) {
          bestScore = score;
          bestMethod = method;
          bestMatched = [a, b];
          bestRationale = rationale;
        }
      }
    }
  }

  if (bestScore === 0) {
    return {
      matched: false,
      canonicalEntityId: null,
      matchedCandidates: candidates,
      matchScore: 0,
      matchMethod: 'none',
      rationale: bestRationale,
    };
  }

  // Use the first matched candidate's entityId as canonical (highest confidence wins)
  const sorted = [...bestMatched].sort((a, b) => b.confidence - a.confidence);
  const canonicalEntityId = sorted[0].entityId;

  return {
    matched: true,
    canonicalEntityId,
    matchedCandidates: bestMatched,
    matchScore: bestScore,
    matchMethod: bestMethod,
    rationale: bestRationale,
  };
}

/** Compare attributes between two candidates and determine match type */
function compareAttributes(
  a: EntityMatchCandidate,
  b: EntityMatchCandidate,
): { score: number; method: EntityMatchResult['matchMethod']; rationale: string } {
  const aKeys = Object.keys(a.attributes);
  const bKeys = Object.keys(b.attributes);

  let exactMatches = 0;
  let partialOverlaps = 0;
  const matchedKeys: string[] = [];

  for (const key of aKeys) {
    if (bKeys.includes(key)) {
      if (a.attributes[key] === b.attributes[key]) {
        exactMatches++;
        matchedKeys.push(key);
      } else {
        // Check partial overlap (case-insensitive or substring)
        const aVal = a.attributes[key].toLowerCase();
        const bVal = b.attributes[key].toLowerCase();
        if (aVal === bVal || aVal.includes(bVal) || bVal.includes(aVal)) {
          partialOverlaps++;
          matchedKeys.push(key);
        }
      }
    }
  }

  if (exactMatches > 0) {
    return {
      score: 100,
      method: 'exact',
      rationale: `Exact match on attribute(s): ${matchedKeys.join(', ')}. Entities ${a.entityId} and ${b.entityId} are the same ${a.entityType}.`,
    };
  }

  if (partialOverlaps >= 2) {
    return {
      score: 75,
      method: 'composite',
      rationale: `Composite match: ${partialOverlaps} partial attribute overlaps on ${matchedKeys.join(', ')}. Entities ${a.entityId} and ${b.entityId} likely the same ${a.entityType}.`,
    };
  }

  if (partialOverlaps === 1) {
    return {
      score: 50,
      method: 'fuzzy',
      rationale: `Fuzzy match: 1 partial attribute overlap on ${matchedKeys.join(', ')}. Entities ${a.entityId} and ${b.entityId} may be the same ${a.entityType}.`,
    };
  }

  return {
    score: 0,
    method: 'none',
    rationale: `No attribute overlap between ${a.entityId} and ${b.entityId}.`,
  };
}

// ─── 2. Authority Resolution ─────────────────────────────────────────────────

/** Authority claim from a source */
export interface AuthorityClaim {
  entityId: string;
  sourceConnectorId: string;
  connectorClass: ConnectorClass;
  claimedAttributes: Record<string, unknown>;
  confidence: number; // 0-100
  lastUpdatedAt: string; // ISO 8601
}

/** Authority resolution result */
export interface AuthorityResolutionResult {
  winningClaim: AuthorityClaim;
  resolvedAttributes: Record<string, unknown>;
  rationale: string;
}

/**
 * Connector class priority order per Spec #61:
 * C (Configuration State) > B (Operational Verdict) > A (SOC Telemetry) > D (Threat Intelligence)
 */
const CONNECTOR_CLASS_PRIORITY: Record<ConnectorClass, number> = {
  C: 4, // highest
  B: 3,
  A: 2,
  D: 1, // lowest
};

/**
 * Resolve which source has authority over an entity's attributes.
 *
 * Resolution rules (priority order):
 * 1. Connector class priority: C > B > A > D
 * 2. Within same class: higher confidence wins
 * 3. Within same confidence: most recent (lastUpdatedAt) wins
 */
export function resolveAuthority(claims: AuthorityClaim[]): AuthorityResolutionResult {
  if (claims.length === 0) {
    throw new Error('Cannot resolve authority: no claims provided.');
  }

  if (claims.length === 1) {
    return {
      winningClaim: claims[0],
      resolvedAttributes: { ...claims[0].claimedAttributes },
      rationale: `Single claim from connector ${claims[0].sourceConnectorId} (class ${claims[0].connectorClass}). No conflict to resolve.`,
    };
  }

  const sorted = [...claims].sort((a, b) => {
    // 1. Connector class priority (higher = wins)
    const classDiff = CONNECTOR_CLASS_PRIORITY[b.connectorClass] - CONNECTOR_CLASS_PRIORITY[a.connectorClass];
    if (classDiff !== 0) return classDiff;

    // 2. Confidence (higher = wins)
    const confDiff = b.confidence - a.confidence;
    if (confDiff !== 0) return confDiff;

    // 3. Freshness (more recent = wins)
    return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
  });

  const winner = sorted[0];
  const runner = sorted[1];

  let rationale: string;
  if (CONNECTOR_CLASS_PRIORITY[winner.connectorClass] > CONNECTOR_CLASS_PRIORITY[runner.connectorClass]) {
    rationale = `Connector class priority: ${winner.connectorClass} (${CONNECTOR_CLASS_PRIORITY[winner.connectorClass]}) > ${runner.connectorClass} (${CONNECTOR_CLASS_PRIORITY[runner.connectorClass]}). Winner: ${winner.sourceConnectorId}.`;
  } else if (winner.confidence > runner.confidence) {
    rationale = `Same class ${winner.connectorClass}. Confidence tiebreak: ${winner.confidence} > ${runner.confidence}. Winner: ${winner.sourceConnectorId}.`;
  } else {
    rationale = `Same class ${winner.connectorClass}, same confidence ${winner.confidence}. Freshness tiebreak: ${winner.lastUpdatedAt} > ${runner.lastUpdatedAt}. Winner: ${winner.sourceConnectorId}.`;
  }

  return {
    winningClaim: winner,
    resolvedAttributes: { ...winner.claimedAttributes },
    rationale,
  };
}

// ─── 3. Verdict Semantics Processing ─────────────────────────────────────────

/** Verdict from a connector */
export interface VerdictRecord {
  id: string;
  entityId: string;
  sourceConnectorId: string;
  disposition: VerdictDisposition;
  confidence: number; // 0-100
  policyRef: string;
  issuedAt: string; // ISO 8601
  expiresAt: string | null;
  timeBound: boolean;
}

/** Processed verdict result */
export interface VerdictProcessingResult {
  effectiveDisposition: VerdictDisposition;
  isExpired: boolean;
  confidenceWeighted: number;
  actionRequired: boolean;
  rationale: string;
}

/**
 * Disposition severity order (highest to lowest):
 * BLOCK > QUARANTINE > REQUIRE_MFA > REQUIRE_COMPLIANT > COACH > MONITOR > AUDIT > ALLOW
 */
const DISPOSITION_SEVERITY: Record<VerdictDisposition, number> = {
  BLOCK: 8,
  QUARANTINE: 7,
  REQUIRE_MFA: 6,
  REQUIRE_COMPLIANT: 5,
  COACH: 4,
  MONITOR: 3,
  AUDIT: 2,
  ALLOW: 1,
};

/** Dispositions that require action (not passive) */
const ACTION_REQUIRED_DISPOSITIONS: VerdictDisposition[] = [
  'BLOCK',
  'QUARANTINE',
  'REQUIRE_MFA',
  'REQUIRE_COMPLIANT',
  'COACH',
];

/**
 * Process a verdict record — check expiry, validate disposition, determine action.
 *
 * Per Spec #62: Verdicts are time-bound, confidence-weighted claims.
 * Expired verdicts fall back to ALLOW.
 */
export function processVerdict(verdict: VerdictRecord, currentTime: string): VerdictProcessingResult {
  const now = new Date(currentTime).getTime();
  const isExpired = verdict.timeBound && verdict.expiresAt !== null && new Date(verdict.expiresAt).getTime() <= now;

  if (isExpired) {
    return {
      effectiveDisposition: 'ALLOW',
      isExpired: true,
      confidenceWeighted: 0,
      actionRequired: false,
      rationale: `Verdict ${verdict.id} expired at ${verdict.expiresAt}. Disposition reverts to ALLOW.`,
    };
  }

  const confidenceWeighted = (verdict.confidence / 100) * DISPOSITION_SEVERITY[verdict.disposition];
  const actionRequired = ACTION_REQUIRED_DISPOSITIONS.includes(verdict.disposition);

  return {
    effectiveDisposition: verdict.disposition,
    isExpired: false,
    confidenceWeighted,
    actionRequired,
    rationale: `Verdict ${verdict.id}: ${verdict.disposition} (confidence ${verdict.confidence}%, policy ${verdict.policyRef}). Action required: ${actionRequired}.`,
  };
}

/**
 * Resolve effective disposition when multiple verdicts exist for same entity.
 *
 * When conflicting: highest severity wins (if not expired).
 * Per Spec #62: Verdicts preserve semantic disposition, not binary pass/fail.
 */
export function resolveVerdictConflict(verdicts: VerdictRecord[], currentTime: string): VerdictProcessingResult {
  if (verdicts.length === 0) {
    return {
      effectiveDisposition: 'ALLOW',
      isExpired: false,
      confidenceWeighted: 0,
      actionRequired: false,
      rationale: 'No verdicts provided. Default disposition: ALLOW.',
    };
  }

  // Process all verdicts, filter out expired ones
  const processed = verdicts.map((v) => ({
    verdict: v,
    result: processVerdict(v, currentTime),
  }));

  const active = processed.filter((p) => !p.result.isExpired);

  if (active.length === 0) {
    return {
      effectiveDisposition: 'ALLOW',
      isExpired: true,
      confidenceWeighted: 0,
      actionRequired: false,
      rationale: 'All verdicts expired. Default disposition: ALLOW.',
    };
  }

  // Sort by severity (highest first)
  active.sort(
    (a, b) => DISPOSITION_SEVERITY[b.result.effectiveDisposition] - DISPOSITION_SEVERITY[a.result.effectiveDisposition],
  );

  const winner = active[0];
  const actionRequired = ACTION_REQUIRED_DISPOSITIONS.includes(winner.result.effectiveDisposition);

  return {
    effectiveDisposition: winner.result.effectiveDisposition,
    isExpired: false,
    confidenceWeighted: winner.result.confidenceWeighted,
    actionRequired,
    rationale: `Conflict resolved: ${winner.verdict.id} wins with ${winner.result.effectiveDisposition} (severity ${DISPOSITION_SEVERITY[winner.result.effectiveDisposition]}). ${active.length} active verdict(s) evaluated.`,
  };
}

// ─── 4. Inverse Discovery Routing ────────────────────────────────────────────

/** Threat indicator from external intelligence */
export interface ThreatIndicator {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'email' | 'cve' | 'url';
  value: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  sourceConnectorId: string;
  firstSeenAt: string;
}

/** Estate entity for matching against threat indicators */
export interface EstateEntity {
  entityId: string;
  entityType: 'asset' | 'identity';
  attributes: Record<string, string[]>; // e.g., { ips: ['1.2.3.4'], domains: ['example.com'] }
  surfaceAttribution: SurfaceAttribution;
}

/** Inverse discovery match result */
export interface InverseDiscoveryMatch {
  threatIndicatorId: string;
  matchedEntityId: string;
  matchedEntityType: string;
  matchedAttribute: string;
  matchedValue: string;
  severity: string;
  surfaceAttribution: SurfaceAttribution;
  rationale: string;
}

/** Mapping from threat indicator type to estate entity attribute keys */
const INDICATOR_TO_ATTRIBUTE_MAP: Record<ThreatIndicator['type'], string[]> = {
  ip: ['ips', 'ip_addresses', 'addresses'],
  domain: ['domains', 'hostnames', 'fqdns'],
  hash: ['hashes', 'file_hashes', 'sha256'],
  email: ['emails', 'email_addresses'],
  cve: ['cves', 'vulnerabilities'],
  url: ['urls', 'endpoints'],
};

/**
 * Route threat indicators against estate entities — find matches.
 *
 * For each indicator, checks all estate entities for matching attribute values.
 * Returns all matches found (an indicator can match multiple entities).
 */
export function routeInverseDiscovery(
  indicators: ThreatIndicator[],
  estate: EstateEntity[],
): InverseDiscoveryMatch[] {
  const matches: InverseDiscoveryMatch[] = [];

  for (const indicator of indicators) {
    const attributeKeys = INDICATOR_TO_ATTRIBUTE_MAP[indicator.type];

    for (const entity of estate) {
      for (const attrKey of attributeKeys) {
        const values = entity.attributes[attrKey];
        if (!values) continue;

        for (const value of values) {
          if (value.toLowerCase() === indicator.value.toLowerCase()) {
            matches.push({
              threatIndicatorId: indicator.id,
              matchedEntityId: entity.entityId,
              matchedEntityType: entity.entityType,
              matchedAttribute: attrKey,
              matchedValue: value,
              severity: indicator.severity,
              surfaceAttribution: entity.surfaceAttribution,
              rationale: `Threat indicator ${indicator.id} (${indicator.type}: ${indicator.value}, severity: ${indicator.severity}) matched estate entity ${entity.entityId} on attribute '${attrKey}' with value '${value}'.`,
            });
          }
        }
      }
    }
  }

  return matches;
}

// ─── 5. Surface Attribution ──────────────────────────────────────────────────

/** Surface attribution input */
export interface SurfaceAttributionInput {
  entityId: string;
  entityType: 'asset' | 'identity';
  isExternallyAccessible: boolean;
  hasExternalExposure: boolean;
  networkZone: 'dmz' | 'internal' | 'cloud-public' | 'cloud-private' | 'unknown';
}

/**
 * Assign surface attribution based on entity characteristics.
 *
 * Rules per Spec #60:
 * - DMZ or cloud-public or externally accessible → external_attack_surface
 * - Internal or cloud-private and not externally accessible → internal_attack_surface
 * - Unknown + hasExternalExposure → external_attack_surface
 * - Unknown + no external exposure → internal_attack_surface
 */
export function assignSurfaceAttribution(input: SurfaceAttributionInput): SurfaceAttribution {
  // Externally accessible always means external
  if (input.isExternallyAccessible) {
    return 'external_attack_surface';
  }

  // Network zone rules
  switch (input.networkZone) {
    case 'dmz':
    case 'cloud-public':
      return 'external_attack_surface';
    case 'internal':
    case 'cloud-private':
      return 'internal_attack_surface';
    case 'unknown':
      return input.hasExternalExposure ? 'external_attack_surface' : 'internal_attack_surface';
  }
}
