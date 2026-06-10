/**
 * Exposure Engine — Commander C2 (Unit 28)
 * Source: Spec #60 Internal and External Attack Surface Framework
 * Computes attack surface metrics, identifies blast zones, assesses coverage gaps.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Exposure {
  id: string;
  surface: 'external' | 'internal';
  category: string;
  severity: number; // 1-5
  asset_ref: string;
  coveredBy: string[]; // tool/control IDs covering this exposure
}

export interface AttackSurfaceMetrics {
  externalCount: number;
  internalCount: number;
  totalScore: number;
}

export interface BlastZone {
  zoneId: string;
  exposures: string[];
  combinedSeverity: number;
  surface: 'external' | 'internal' | 'mixed';
  description: string;
}

export interface CoverageGap {
  exposureId: string;
  asset_ref: string;
  surface: 'external' | 'internal';
  severity: number;
  description: string;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Compute attack surface metrics from a list of exposures.
 * Total score is weighted: external exposures count 1.5x, internal 1.0x, scaled by severity.
 */
export function computeAttackSurface(exposures: Exposure[]): AttackSurfaceMetrics {
  let externalCount = 0;
  let internalCount = 0;
  let totalScore = 0;

  for (const exposure of exposures) {
    if (exposure.surface === 'external') {
      externalCount++;
      totalScore += exposure.severity * 1.5;
    } else {
      internalCount++;
      totalScore += exposure.severity * 1.0;
    }
  }

  return {
    externalCount,
    internalCount,
    totalScore: Math.round(totalScore * 10) / 10,
  };
}

/**
 * Identify blast zones by grouping exposures on the same asset.
 * A blast zone represents the combined impact if a single asset is compromised.
 */
export function identifyBlastZones(exposures: Exposure[]): BlastZone[] {
  const assetMap = new Map<string, Exposure[]>();

  for (const exposure of exposures) {
    const existing = assetMap.get(exposure.asset_ref) ?? [];
    existing.push(exposure);
    assetMap.set(exposure.asset_ref, existing);
  }

  const zones: BlastZone[] = [];

  for (const [assetRef, assetExposures] of assetMap.entries()) {
    if (assetExposures.length < 2) continue; // Single exposure doesn't form a zone

    const surfaces = new Set(assetExposures.map((e) => e.surface));
    const surface: BlastZone['surface'] =
      surfaces.size > 1 ? 'mixed' : assetExposures[0].surface;

    const combinedSeverity = assetExposures.reduce((sum, e) => sum + e.severity, 0);

    zones.push({
      zoneId: `zone-${assetRef}`,
      exposures: assetExposures.map((e) => e.id),
      combinedSeverity: Math.min(25, combinedSeverity),
      surface,
      description: `Blast zone on asset "${assetRef}" — ${assetExposures.length} exposures, combined severity ${combinedSeverity}.`,
    });
  }

  return zones.sort((a, b) => b.combinedSeverity - a.combinedSeverity);
}

/**
 * Assess coverage gaps — exposures with no covering control/tool.
 * Uncovered exposures represent gaps in the security posture.
 */
export function assessCoverageGaps(exposures: Exposure[]): CoverageGap[] {
  return exposures
    .filter((e) => e.coveredBy.length === 0)
    .map((e) => ({
      exposureId: e.id,
      asset_ref: e.asset_ref,
      surface: e.surface,
      severity: e.severity,
      description: `Exposure "${e.id}" on asset "${e.asset_ref}" (${e.surface}) has no covering control.`,
    }))
    .sort((a, b) => b.severity - a.severity);
}
