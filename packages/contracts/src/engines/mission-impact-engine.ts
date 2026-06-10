// @ts-nocheck
/**
 * Mission Impact Engine — Commander C2 (Spec 37)
 * Source: Spec #37 Mission Objective Binding Model
 * Calculates how risk objects affect strategic missions through binding chains.
 */

import type { MissionBindingRule } from '../entities/mission';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RiskObjectInput {
  risk_object_id: string;
  severity: number;
  entity_type: string;
  entity_ref: string;
  tags?: string[];
}

export interface ImpactResult {
  mission_id: string;
  total_impact_score: number;
  affectedObjectives: string[];
  riskContributors: string[];
  recommendation: string;
}

export interface AffectedMission {
  mission_id: string;
  impact_score: number;
  bindingPath: string[];
}

export interface SuggestedBinding {
  mission_id: string;
  entity_ref: string;
  bindingMethod: string;
  confidence: number;
  reason: string;
}

export interface EvaluatedBinding {
  mission_id: string;
  entity_ref: string;
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
  mission_id: string,
  riskObjects: RiskObjectInput[],
): ImpactResult {
  if (riskObjects.length === 0) {
    return {
      mission_id,
      total_impact_score: 0,
      affectedObjectives: [],
      riskContributors: [],
      recommendation: 'No active risk objects affecting this mission.',
    };
  }

  const totalImpactScore = Math.min(
    100,
    riskObjects.reduce((sum, ro) => sum + ro.severity * 20, 0),
  );

  const riskContributors = riskObjects.map((ro) => ro.risk_object_id);

  const recommendation =
    totalImpactScore >= 80
      ? 'Critical impact — escalate to mission owner immediately.'
      : totalImpactScore >= 50
        ? 'Significant impact — review mission objectives and adjust timelines.'
        : 'Low impact — monitor and reassess at next review cycle.';

  return {
    mission_id,
    total_impact_score: total_impact_score,
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
      mission_id: 'mission-unknown',
      impact_score: impact_score,
      bindingPath: [riskObject.entity_ref, riskObject.risk_object_id],
    },
  ];
}

/**
 * Evaluate binding rules against an entity to determine if automatic binding should occur.
 */
export function evaluateBindingRules(
  entity: { entity_ref: string; entity_type: string; tags?: string[] },
  bindingRules: MissionBindingRule[],
  mission_id: string,
): EvaluatedBinding[] {
  const results: EvaluatedBinding[] = [];

  for (const rule of bindingRules) {
    if (!rule.autoApply) continue;

    let matched = false;

    if (rule.rule_type === 'tag_match' && entity.tags) {
      matched = entity.tags.some((tag) => tag.toLowerCase().includes(rule.pattern.toLowerCase()));
    } else if (rule.rule_type === 'service_group') {
      matched = entity.entity_ref.toLowerCase().includes(rule.pattern.toLowerCase());
    } else if (rule.rule_type === 'dependency') {
      const pattern = rule.pattern.replace(/\*/g, '.*');
      matched = new RegExp(pattern, 'i').test(entity.entity_ref);
    }

    if (matched) {
      results.push({
        mission_id,
        entity_ref: entity.entity_ref,
        bindingMethod: rule.rule_type,
        confidence: rule.rule_type === 'tag_match' ? 85 : rule.rule_type === 'service_group' ? 75 : 65,
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
export function suggestBindings(entity: { entity_ref: string; entity_type: string; tags?: string[] }): SuggestedBinding[] {
  // In production, this would use the mission binding rules and entity attributes.
  // For now, return a baseline suggestion.
  return [
    {
      mission_id: 'mission-suggested',
      entity_ref: entity.entity_ref,
      bindingMethod: 'commander_suggested',
      confidence: 60,
      reason: `Entity "${entity.entity_ref}" (${entity.entity_type}) may be relevant based on type classification.`,
    },
  ];
}
