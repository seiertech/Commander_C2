/**
 * Mission Impact Engine — Commander C2 (Spec 37)
 * Source: Spec #37 Mission Objective Binding Model
 * Calculates how risk objects affect strategic missions through binding chains.
 */

import type { MissionBindingRule } from '../entities/mission';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RiskObjectInput {
  riskObjectId: string;
  severity: number;
  entityType: string;
  entityRef: string;
  tags?: string[];
}

export interface ImpactResult {
  missionId: string;
  totalImpactScore: number;
  affectedObjectives: string[];
  riskContributors: string[];
  recommendation: string;
}

export interface AffectedMission {
  missionId: string;
  impactScore: number;
  bindingPath: string[];
}

export interface SuggestedBinding {
  missionId: string;
  entityRef: string;
  bindingMethod: string;
  confidence: number;
  reason: string;
}

export interface EvaluatedBinding {
  missionId: string;
  entityRef: string;
  bindingMethod: string;
  confidence: number;
  matchedRule: string;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Calculate the aggregate impact of risk objects on a given mission.
 * Returns an ImpactResult with total score and affected objectives.
 */
export function calculateMissionImpact(
  missionId: string,
  riskObjects: RiskObjectInput[],
): ImpactResult {
  if (riskObjects.length === 0) {
    return {
      missionId,
      totalImpactScore: 0,
      affectedObjectives: [],
      riskContributors: [],
      recommendation: 'No active risk objects affecting this mission.',
    };
  }

  const totalImpactScore = Math.min(
    100,
    riskObjects.reduce((sum, ro) => sum + ro.severity * 20, 0),
  );

  const riskContributors = riskObjects.map((ro) => ro.riskObjectId);

  const recommendation =
    totalImpactScore >= 80
      ? 'Critical impact — escalate to mission owner immediately.'
      : totalImpactScore >= 50
        ? 'Significant impact — review mission objectives and adjust timelines.'
        : 'Low impact — monitor and reassess at next review cycle.';

  return {
    missionId,
    totalImpactScore,
    affectedObjectives: [],
    riskContributors,
    recommendation,
  };
}

/**
 * Traverse the impact chain from a risk object to find affected missions.
 * Returns an array of missions that could be affected by the risk object.
 */
export function traverseImpactChain(riskObject: RiskObjectInput): AffectedMission[] {
  // In production this would traverse the binding graph.
  // For now, return a computed impact based on severity.
  const impactScore = Math.min(100, riskObject.severity * 20);

  return [
    {
      missionId: 'mission-unknown',
      impactScore,
      bindingPath: [riskObject.entityRef, riskObject.riskObjectId],
    },
  ];
}

/**
 * Evaluate binding rules against an entity to determine if automatic binding should occur.
 */
export function evaluateBindingRules(
  entity: { entityRef: string; entityType: string; tags?: string[] },
  bindingRules: MissionBindingRule[],
  missionId: string,
): EvaluatedBinding[] {
  const results: EvaluatedBinding[] = [];

  for (const rule of bindingRules) {
    if (!rule.autoApply) continue;

    let matched = false;

    if (rule.ruleType === 'tag_match' && entity.tags) {
      matched = entity.tags.some((tag) => tag.toLowerCase().includes(rule.pattern.toLowerCase()));
    } else if (rule.ruleType === 'service_group') {
      matched = entity.entityRef.toLowerCase().includes(rule.pattern.toLowerCase());
    } else if (rule.ruleType === 'dependency') {
      const pattern = rule.pattern.replace(/\*/g, '.*');
      matched = new RegExp(pattern, 'i').test(entity.entityRef);
    }

    if (matched) {
      results.push({
        missionId,
        entityRef: entity.entityRef,
        bindingMethod: rule.ruleType,
        confidence: rule.ruleType === 'tag_match' ? 85 : rule.ruleType === 'service_group' ? 75 : 65,
        matchedRule: rule.pattern,
      });
    }
  }

  return results;
}

/**
 * Suggest potential bindings for an entity based on its attributes.
 * Returns suggested bindings with confidence scores.
 */
export function suggestBindings(entity: { entityRef: string; entityType: string; tags?: string[] }): SuggestedBinding[] {
  // In production, this would use the mission binding rules and entity attributes.
  // For now, return a baseline suggestion.
  return [
    {
      missionId: 'mission-suggested',
      entityRef: entity.entityRef,
      bindingMethod: 'commander_suggested',
      confidence: 60,
      reason: `Entity "${entity.entityRef}" (${entity.entityType}) may be relevant based on type classification.`,
    },
  ];
}
