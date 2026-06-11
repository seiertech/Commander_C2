/**
 * Pre-Warned Classification Engine — Commander C2
 *
 * Source: Spec #17 Closed-Loop Control Architecture,
 *         Master Technical Specification §Pre-Warned State
 *
 * Consumes outputs from Units 24-28 (drift, identity, architecture,
 * vulnerability, exposure) and classifies the combined signal into
 * a pre-warned state level.
 *
 * Build Unit: Unit 29
 * Dependencies: Units 24, 25, 26, 27, 28 (all DONE)
 *
 * Pure logic — no DB, no API. Contract-level processing only.
 */

import type { PreWarnedClassification, ClassificationLevel } from '../entities/pre-warned-classification';
import { CLASSIFICATION_LEVELS } from '../entities/pre-warned-classification';

// ─── Input Types ─────────────────────────────────────────────────────────────

export interface EngineSignal {
  /** Reference to the source engine output */
  source_ref: string;
  /** Which engine produced this signal */
  engineType: 'drift' | 'identity' | 'architecture' | 'vulnerability' | 'exposure';
  /** Signal severity (1-5, where 1 is most severe) */
  severity: number;
  /** Confidence in this signal (0-100) */
  confidence: number;
  /** Affected entity references */
  affectedEntityRefs: string[];
}

// ─── Output Types ────────────────────────────────────────────────────────────

export interface ClassificationResult {
  classificationLevel: ClassificationLevel;
  confidence: number;
  triggerSources: string[];
  affectedEntityRefs: string[];
  recommendedActions: string[];
}

export interface EscalationDecision {
  shouldEscalate: boolean;
  reason: string;
  targetLevel: 'war_room' | 'ciso_notification' | 'team_lead' | 'none';
}

// ─── Engine Functions ────────────────────────────────────────────────────────

/**
 * Classify pre-warned state from combined engine signals.
 *
 * Classification logic:
 * - imminent: 3+ high-severity signals from different engines, confidence > 90
 * - critical: 2+ high-severity signals OR 1 severity-1 with confidence > 85
 * - elevated: 1+ medium-severity signals from 2+ engines
 * - pre_warned: any signal combination below elevated threshold
 */
export function classifyPreWarnedState(signals: EngineSignal[]): ClassificationResult {
  if (signals.length === 0) {
    return {
      classificationLevel: 'pre_warned',
      confidence: 0,
      triggerSources: [],
      affectedEntityRefs: [],
      recommendedActions: [],
    };
  }

  const triggerSources = signals.map((s) => s.source_ref);
  const affectedEntityRefs = Array.from(new Set(signals.flatMap((s) => s.affectedEntityRefs)));
  const confidence = computeConfidence(signals);

  const highSeveritySignals = signals.filter((s) => s.severity <= 2);
  const uniqueEngineTypes = new Set(signals.map((s) => s.engineType));
  const hasCriticalSeverity = signals.some((s) => s.severity === 1 && s.confidence > 85);

  let classificationLevel: ClassificationLevel;

  if (highSeveritySignals.length >= 3 && uniqueEngineTypes.size >= 3 && confidence > 90) {
    classificationLevel = 'imminent';
  } else if (highSeveritySignals.length >= 2 || hasCriticalSeverity) {
    classificationLevel = 'critical';
  } else if (signals.length >= 2 && uniqueEngineTypes.size >= 2) {
    classificationLevel = 'elevated';
  } else {
    classificationLevel = 'pre_warned';
  }

  const recommendedActions = generateRecommendedActions(classificationLevel, signals);

  return {
    classificationLevel,
    confidence,
    triggerSources,
    affectedEntityRefs,
    recommendedActions,
  };
}

/**
 * Compute aggregate confidence from multiple engine signals.
 * Uses weighted average based on signal severity (higher severity = higher weight).
 */
export function computeConfidence(signals: EngineSignal[]): number {
  if (signals.length === 0) return 0;

  const totalWeight = signals.reduce((acc, s) => acc + (6 - s.severity), 0); // severity 1 = weight 5, severity 5 = weight 1
  const weightedConfidence = signals.reduce((acc, s) => acc + s.confidence * (6 - s.severity), 0);

  return Math.round(weightedConfidence / totalWeight);
}

/**
 * Determine whether the classification should trigger escalation.
 */
export function escalateIfThreshold(classification: ClassificationResult): EscalationDecision {
  if (classification.classificationLevel === 'imminent') {
    return { shouldEscalate: true, reason: 'Imminent threat classification — immediate response required', targetLevel: 'war_room' };
  }
  if (classification.classificationLevel === 'critical' && classification.confidence >= 85) {
    return { shouldEscalate: true, reason: 'Critical classification with high confidence', targetLevel: 'ciso_notification' };
  }
  if (classification.classificationLevel === 'elevated' && classification.affectedEntityRefs.length >= 5) {
    return { shouldEscalate: true, reason: 'Elevated classification with wide blast radius', targetLevel: 'team_lead' };
  }
  return { shouldEscalate: false, reason: 'Below escalation threshold', targetLevel: 'none' };
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function generateRecommendedActions(level: ClassificationLevel, signals: EngineSignal[]): string[] {
  const actions: string[] = [];

  switch (level) {
    case 'imminent':
      actions.push('Activate War Room immediately');
      actions.push('Block lateral movement paths');
      actions.push('Engage incident response');
      actions.push('Notify CISO');
      break;
    case 'critical':
      actions.push('Escalate to senior owner');
      actions.push('Assess blast radius');
      actions.push('Initiate containment planning');
      break;
    case 'elevated':
      actions.push('Monitor affected entities closely');
      actions.push('Review access controls');
      actions.push('Assess remediation timeline');
      break;
    case 'pre_warned':
      actions.push('Continue monitoring');
      actions.push('Review next scheduled assessment');
      break;
  }

  // Add engine-specific actions
  const engineTypes = new Set(signals.map((s) => s.engineType));
  if (engineTypes.has('drift')) actions.push('Investigate configuration drift');
  if (engineTypes.has('identity')) actions.push('Review identity behaviour anomalies');
  if (engineTypes.has('vulnerability')) actions.push('Prioritise vulnerability remediation');

  return actions;
}
