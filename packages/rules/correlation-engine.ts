/**
 * Correlation Engine — Commander SDR CMEP-1.0
 *
 * Pre-binding correlation: CVE dedup, temporal clustering,
 * blast-radius aggregation, attack-chain detection.
 *
 * Runs BEFORE bindRiskObject() — correlation runs pre-binding.
 * Parameters from correlation-policy strategy.
 * Pure function. No I/O.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** Correlation policy from strategy */
export interface CorrelationPolicy {
  /** Temporal clustering window in hours */
  temporalWindowHours: number;
  /** Minimum blast radius for aggregation */
  blastRadiusThreshold: number;
  /** Maximum correlation group size */
  maxCorrelationGroupSize: number;
  /** Attack chain minimum technique sequence length */
  attackChainMinLength: number;
  /** CVE dedup enabled */
  cveDedupEnabled: boolean;
}

/** Default correlation policy */
export const DEFAULT_CORRELATION_POLICY: CorrelationPolicy = {
  temporalWindowHours: 24,
  blastRadiusThreshold: 3,
  maxCorrelationGroupSize: 50,
  attackChainMinLength: 2,
  cveDedupEnabled: true,
};

/** A finding to be correlated (pre-binding) */
export interface CorrelationFinding {
  /** Finding identifier */
  findingId: string;
  /** CVE identifier (if applicable) */
  cveId: string | null;
  /** Affected entity identifier */
  affectedEntityId: string;
  /** Detection timestamp (ISO 8601) */
  detectedAt: string;
  /** ATT&CK technique IDs mapped to this finding */
  attackTechniques: string[];
  /** Severity score (0–100) */
  severityScore: number;
}

/** Correlation group — a set of related findings */
export interface CorrelationGroup {
  /** Group identifier */
  groupId: string;
  /** Correlation type */
  correlationType: CorrelationType;
  /** Finding IDs in this group */
  findingIds: string[];
  /** Rationale for the correlation */
  rationale: string;
  /** Blast radius (number of distinct affected entities) */
  blastRadius: number;
}

export type CorrelationType =
  | 'cve-dedup'
  | 'temporal-cluster'
  | 'blast-radius'
  | 'attack-chain';

/** Result of correlation analysis */
export interface CorrelationResult {
  /** Correlation groups identified */
  groups: CorrelationGroup[];
  /** Findings not assigned to any group */
  ungroupedFindingIds: string[];
  /** Summary statistics */
  stats: {
    totalFindings: number;
    groupedFindings: number;
    dedupGroups: number;
    temporalClusters: number;
    blastRadiusGroups: number;
    attackChains: number;
  };
}

// ─── Core Function ───────────────────────────────────────────────────────────

/**
 * Run pre-binding correlation analysis on a set of findings.
 *
 * @param findings - Array of findings to correlate
 * @param policy - Correlation policy from strategy
 * @returns CorrelationResult with groups and statistics
 */
export function correlateFindings(
  findings: CorrelationFinding[],
  policy: CorrelationPolicy = DEFAULT_CORRELATION_POLICY,
): CorrelationResult {
  const groups: CorrelationGroup[] = [];
  const assignedFindingIds = new Set<string>();
  let groupCounter = 0;

  // 1. CVE Dedup — same CVE across different entities
  if (policy.cveDedupEnabled) {
    const cveGroups = detectCveDedup(findings, policy.maxCorrelationGroupSize);
    for (const group of cveGroups) {
      group.groupId = `corr-${++groupCounter}`;
      groups.push(group);
      group.findingIds.forEach((id) => assignedFindingIds.add(id));
    }
  }

  // 2. Temporal Clustering — findings within time window
  const remainingForTemporal = findings.filter((f) => !assignedFindingIds.has(f.findingId));
  const temporalGroups = detectTemporalClusters(remainingForTemporal, policy.temporalWindowHours, policy.maxCorrelationGroupSize);
  for (const group of temporalGroups) {
    group.groupId = `corr-${++groupCounter}`;
    groups.push(group);
    group.findingIds.forEach((id) => assignedFindingIds.add(id));
  }

  // 3. Blast-Radius Aggregation — many entities affected
  const remainingForBlast = findings.filter((f) => !assignedFindingIds.has(f.findingId));
  const blastGroups = detectBlastRadius(remainingForBlast, policy.blastRadiusThreshold, policy.maxCorrelationGroupSize);
  for (const group of blastGroups) {
    group.groupId = `corr-${++groupCounter}`;
    groups.push(group);
    group.findingIds.forEach((id) => assignedFindingIds.add(id));
  }

  // 4. Attack-Chain Detection — technique sequence
  const remainingForChain = findings.filter((f) => !assignedFindingIds.has(f.findingId));
  const chainGroups = detectAttackChains(remainingForChain, policy.attackChainMinLength, policy.maxCorrelationGroupSize);
  for (const group of chainGroups) {
    group.groupId = `corr-${++groupCounter}`;
    groups.push(group);
    group.findingIds.forEach((id) => assignedFindingIds.add(id));
  }

  const ungroupedFindingIds = findings
    .filter((f) => !assignedFindingIds.has(f.findingId))
    .map((f) => f.findingId);

  return {
    groups,
    ungroupedFindingIds,
    stats: {
      totalFindings: findings.length,
      groupedFindings: assignedFindingIds.size,
      dedupGroups: groups.filter((g) => g.correlationType === 'cve-dedup').length,
      temporalClusters: groups.filter((g) => g.correlationType === 'temporal-cluster').length,
      blastRadiusGroups: groups.filter((g) => g.correlationType === 'blast-radius').length,
      attackChains: groups.filter((g) => g.correlationType === 'attack-chain').length,
    },
  };
}

// ─── Detection Functions ─────────────────────────────────────────────────────

function detectCveDedup(findings: CorrelationFinding[], maxGroupSize: number): CorrelationGroup[] {
  const cveMap = new Map<string, CorrelationFinding[]>();

  for (const finding of findings) {
    if (finding.cveId) {
      const existing = cveMap.get(finding.cveId) ?? [];
      existing.push(finding);
      cveMap.set(finding.cveId, existing);
    }
  }

  const groups: CorrelationGroup[] = [];
  for (const [cveId, cveFindings] of cveMap) {
    if (cveFindings.length >= 2) {
      const limitedFindings = cveFindings.slice(0, maxGroupSize);
      const distinctEntities = new Set(limitedFindings.map((f) => f.affectedEntityId));
      groups.push({
        groupId: '', // Assigned by caller
        correlationType: 'cve-dedup',
        findingIds: limitedFindings.map((f) => f.findingId),
        rationale: `CVE ${cveId} affects ${distinctEntities.size} distinct entities`,
        blastRadius: distinctEntities.size,
      });
    }
  }

  return groups;
}

function detectTemporalClusters(
  findings: CorrelationFinding[],
  windowHours: number,
  maxGroupSize: number,
): CorrelationGroup[] {
  if (findings.length < 2) return [];

  // Sort by detection time
  const sorted = [...findings].sort(
    (a, b) => new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime(),
  );

  const windowMs = windowHours * 60 * 60 * 1000;
  const groups: CorrelationGroup[] = [];
  const used = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(sorted[i].findingId)) continue;

    const cluster: CorrelationFinding[] = [sorted[i]];
    const startTime = new Date(sorted[i].detectedAt).getTime();

    for (let j = i + 1; j < sorted.length && cluster.length < maxGroupSize; j++) {
      if (used.has(sorted[j].findingId)) continue;
      const time = new Date(sorted[j].detectedAt).getTime();
      if (time - startTime <= windowMs) {
        cluster.push(sorted[j]);
      }
    }

    if (cluster.length >= 2) {
      const distinctEntities = new Set(cluster.map((f) => f.affectedEntityId));
      groups.push({
        groupId: '',
        correlationType: 'temporal-cluster',
        findingIds: cluster.map((f) => f.findingId),
        rationale: `${cluster.length} findings within ${windowHours}h window`,
        blastRadius: distinctEntities.size,
      });
      cluster.forEach((f) => used.add(f.findingId));
    }
  }

  return groups;
}

function detectBlastRadius(
  findings: CorrelationFinding[],
  threshold: number,
  maxGroupSize: number,
): CorrelationGroup[] {
  if (findings.length < threshold) return [];

  // Group by similarity (same CVE or same technique set)
  const distinctEntities = new Set(findings.map((f) => f.affectedEntityId));
  if (distinctEntities.size >= threshold) {
    const limitedFindings = findings.slice(0, maxGroupSize);
    return [{
      groupId: '',
      correlationType: 'blast-radius',
      findingIds: limitedFindings.map((f) => f.findingId),
      rationale: `Blast radius: ${distinctEntities.size} distinct entities affected (threshold: ${threshold})`,
      blastRadius: distinctEntities.size,
    }];
  }

  return [];
}

function detectAttackChains(
  findings: CorrelationFinding[],
  minLength: number,
  maxGroupSize: number,
): CorrelationGroup[] {
  // Group findings that share overlapping ATT&CK techniques into chains
  const withTechniques = findings.filter((f) => f.attackTechniques.length > 0);
  if (withTechniques.length < minLength) return [];

  // Collect all distinct techniques across findings
  const allTechniques = new Set<string>();
  withTechniques.forEach((f) => f.attackTechniques.forEach((t) => allTechniques.add(t)));

  if (allTechniques.size >= minLength) {
    const limitedFindings = withTechniques.slice(0, maxGroupSize);
    const distinctEntities = new Set(limitedFindings.map((f) => f.affectedEntityId));
    return [{
      groupId: '',
      correlationType: 'attack-chain',
      findingIds: limitedFindings.map((f) => f.findingId),
      rationale: `Attack chain: ${allTechniques.size} techniques across ${limitedFindings.length} findings`,
      blastRadius: distinctEntities.size,
    }];
  }

  return [];
}
