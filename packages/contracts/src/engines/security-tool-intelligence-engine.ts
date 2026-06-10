/**
 * Security Tool Intelligence Engine — Commander SDR (Unit 45)
 * Source: Spec #59 Intelligence Layer Architecture (Posture stream)
 * Assesses security tool effectiveness, identifies blind spots, recommends actions.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ToolMetrics {
  toolId: string;
  toolName: string;
  detectionRate: number;    // 0-1
  falsePositiveRate: number; // 0-1
  coveragePercent: number;   // 0-100
  meanTimeToDetect: number;  // seconds
  lastEvaluated: string;
}

export interface ToolCapability {
  toolId: string;
  capabilities: string[]; // e.g. ['endpoint_detection', 'network_monitoring']
}

export interface EstateAsset {
  assetId: string;
  assetType: string;
  requiredCapabilities: string[];
}

export interface BlindSpot {
  assetId: string;
  assetType: string;
  missingCapability: string;
  severity: number; // 1-5
  description: string;
}

export interface RecommendedAction {
  toolId: string;
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  rationale: string;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Assess tool effectiveness from operational metrics.
 * Score factors: detection rate, false positive rate, coverage, and detection speed.
 * Returns a score 0-100 where higher = more effective.
 */
export function assessToolEffectiveness(metrics: ToolMetrics): number {
  // Detection rate contribution (0-40)
  const detectionScore = metrics.detectionRate * 40;

  // False positive penalty (0-20 penalty)
  const fpPenalty = metrics.falsePositiveRate * 20;

  // Coverage contribution (0-30)
  const coverageScore = (metrics.coveragePercent / 100) * 30;

  // Speed bonus: under 60s = full 10pts, degrades linearly to 0 at 3600s
  const speedScore =
    metrics.meanTimeToDetect <= 60
      ? 10
      : Math.max(0, 10 - (metrics.meanTimeToDetect / 3600) * 10);

  const total = detectionScore - fpPenalty + coverageScore + speedScore;
  return Math.min(100, Math.max(0, Math.round(total)));
}

/**
 * Identify blind spots by comparing tool capabilities against estate requirements.
 * A blind spot exists when an asset requires a capability that no tool provides.
 */
export function identifyBlindSpots(
  capabilities: ToolCapability[],
  estate: EstateAsset[],
): BlindSpot[] {
  // Build a set of all provided capabilities
  const providedCapabilities = new Set<string>();
  for (const tool of capabilities) {
    for (const cap of tool.capabilities) {
      providedCapabilities.add(cap);
    }
  }

  const blindSpots: BlindSpot[] = [];

  for (const asset of estate) {
    for (const required of asset.requiredCapabilities) {
      if (!providedCapabilities.has(required)) {
        // Severity based on asset type criticality
        const criticalTypes = new Set(['database', 'identity_provider', 'firewall', 'domain_controller']);
        const severity = criticalTypes.has(asset.assetType) ? 5 : 3;

        blindSpots.push({
          assetId: asset.assetId,
          assetType: asset.assetType,
          missingCapability: required,
          severity,
          description: `Asset "${asset.assetId}" (${asset.assetType}) requires "${required}" — no tool provides this capability.`,
        });
      }
    }
  }

  return blindSpots.sort((a, b) => b.severity - a.severity);
}

/**
 * Recommend actions for a tool based on identified blind spots.
 * Actions may include expanding coverage, adding detection rules, or deploying new capabilities.
 */
export function recommendActions(
  tool: ToolCapability,
  blindSpots: BlindSpot[],
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  // Find blind spots that are adjacent to the tool's existing capabilities
  for (const spot of blindSpots) {
    // A tool is a candidate if it already covers related capabilities
    const isRelated = tool.capabilities.some((cap) => {
      // Simple heuristic: same category prefix (e.g., 'endpoint_' tools might cover 'endpoint_isolation')
      const capPrefix = cap.split('_')[0];
      const spotPrefix = spot.missingCapability.split('_')[0];
      return capPrefix === spotPrefix;
    });

    if (isRelated) {
      const priority: RecommendedAction['priority'] =
        spot.severity >= 5 ? 'critical' : spot.severity >= 4 ? 'high' : 'medium';

      actions.push({
        toolId: tool.toolId,
        action: `Extend ${tool.toolId} to cover "${spot.missingCapability}" for asset "${spot.assetId}".`,
        priority,
        rationale: `Blind spot severity ${spot.severity}: ${spot.description}`,
      });
    }
  }

  // If no related blind spots, recommend general effectiveness improvement
  if (actions.length === 0 && blindSpots.length > 0) {
    actions.push({
      toolId: tool.toolId,
      action: `Evaluate ${tool.toolId} for capability expansion to address ${blindSpots.length} blind spot(s).`,
      priority: 'low',
      rationale: `${blindSpots.length} blind spot(s) exist in estate, but none directly adjacent to current capabilities.`,
    });
  }

  return actions;
}
