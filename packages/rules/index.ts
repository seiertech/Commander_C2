/**
 * Commander SDR Rules Package — Platform Intelligence & IOC Distribution
 *
 * Pure functions: normalisation, deduplication, confidence aggregation,
 * freshness evaluation, allow/block, relationship state, ingestion pipeline,
 * advisory extraction, tenant builders, push mapping, case mappers,
 * threat hunts, compliance enrichment, cross-plane resolution.
 */

export { normaliseIoc } from './ioc-normalisation';
export type { NormalisationResult } from './ioc-normalisation';

export { dedupAndMerge, buildDedupKey } from './ioc-dedup';
export type { DedupKey, DedupResult } from './ioc-dedup';

export { aggregateConfidence, WEAK_SOURCE_CEILING, WEAK_SOURCE_THRESHOLD, FRESHNESS_WEIGHTS, TENANT_OBSERVATION_BOOST, ANALYST_CONFIRMATION_BOOST } from './confidence-aggregation';
export type { ConfidenceSource } from './confidence-aggregation';

export { evaluateFreshness } from './feed-freshness';

export { applySyncResult } from './feed-sync';
export type { FeedScheduleState, SyncResult, SyncSuccess, SyncFailure } from './feed-sync';

export { transitionRelationship } from './relationship-state';
export type { TransitionResult } from './relationship-state';

export { evaluateAllowBlock } from './allow-block';
export type { AllowBlockDecision, AllowBlockSuppressDecision, AllowBlockForceDecision, AllowBlockProceedDecision } from './allow-block';

export { processIngestion } from './ingestion-pipeline';
export type { IngestionPath, IngestionInput, IngestionOutput } from './ingestion-pipeline';

export { extractAdvisoryIocs } from './advisory-ioc-extraction';
export type { ExtractionInput, ExtractionResult } from './advisory-ioc-extraction';

export { buildTenantEvaluation, buildTenantIocMatch } from './tenant-evaluation-builders';
export type { BuildEvaluationInput, BuildMatchInput } from './tenant-evaluation-builders';

export { getTargetSystems, buildPushActionIntent, PUSH_CAPABILITY_MAP, PHASE1_ALLOWED_STATUSES } from './push-capability-mapping';

export { buildIocCaseLink, buildVulnerabilityCaseLink, generateActionRecommendation, ACTION_FOLLOW_UPS } from './case-outcome-mappers';
export type { ActionRecommendation, ActionFollowUp } from './case-outcome-mappers';

export { buildThreatHuntRecord, transitionHuntStatus } from './threat-hunt-builder';
export type { BuildHuntInput } from './threat-hunt-builder';

export { mapCveToEnrichmentEvidence, mapIocMatchToEnrichmentEvidence, assertNeverCreatesComplianceState } from './compliance-enrichment';
export type { IntelligenceEnrichmentEvidence } from './compliance-enrichment';

export { resolveReference, batchResolveReferences } from './cross-plane-resolver';
export type { ResolutionResult } from './cross-plane-resolver';

export { evaluateSubscription, distributeToTenants } from './subscription-evaluation';
export type { SubscriptionEvaluationResult, TenantEvaluationInput } from './subscription-evaluation';

export { computeIntelligencePrioritySignal } from './priority-signal';
export type { PrioritySignal, VulnerabilitySignalInput, TenantEvaluationContext, UrgencyLevel } from './priority-signal';

// ─── CMEP-1.0: Case Management Excellence Engines ────────────────────────────

export { computeRoutingDecision, DEFAULT_ROUTING_WEIGHTS } from './multi-factor-routing';
export type { RoutingWeights, RoutingCandidate, RoutingDecision, ScoredCandidate } from './multi-factor-routing';

export { evaluateReassessment, scoreToPriority, DEFAULT_PRIORITY_THRESHOLDS } from './priority-reassessment';
export type { ReassessmentInput, ReassessmentResult, PriorityLevel, PriorityThresholds } from './priority-reassessment';

export { computeAdaptiveSla, DEFAULT_ADAPTIVE_SLA_CONFIG } from './adaptive-sla';
export type { AdaptiveSlaInput, AdaptiveSlaResult, AdaptiveSlaConfig, ActiveSlaModifier } from './adaptive-sla';

export { correlateFindings, DEFAULT_CORRELATION_POLICY } from './correlation-engine';
export type { CorrelationPolicy, CorrelationFinding, CorrelationGroup, CorrelationType, CorrelationResult } from './correlation-engine';

export { computeEffectivenessMetrics, DEFAULT_EFFECTIVENESS_TARGETS } from './effectiveness-metrics';
export type { EffectivenessTargets, CaseResolutionRecord, EffectivenessMetrics, ThresholdBreach, EffectivenessResult } from './effectiveness-metrics';

// ─── Communications Excellence Phase 1 ──────────────────────────────────────

export { evaluatePlaybookTrigger, evaluateStepCondition, computeNextStep, advanceExecution } from './playbook-engine';
export type { PlaybookCaseData, PlaybookConditionContext, NextStepResult, StepResult } from './playbook-engine';

export { computeThreadEffectiveness, computeCaseEffectiveness, aggregateEffectiveness, EFFECTIVENESS_WEIGHTS } from './communication-effectiveness';
export type { EffectivenessSignals, ThreadEffectivenessResult, CaseEffectivenessResult, EffectivenessAggregation } from './communication-effectiveness';

export { parseStixBundle, mapStixToCommander, scoreRelevance } from './stix-bundle-parser';
export type { StixObject, StixParseResult, ObservableMapping, IocMapping, AttackPatternMapping, StixMappingResult, EstateAsset, EstateIdentity, RelevanceScoreResult } from './stix-bundle-parser';

export { routeDetonationVerdict } from './detonation-router';
export type { DetonationRoute, DetonationRoutingResult } from './detonation-router';

export { processPhishingReport } from './phishing-report-pipeline';
export type { ObservableInventoryEntry, RiskObjectRecommendation, CaseRecommendation, PhishingPipelineResult } from './phishing-report-pipeline';

// ─── WRCEP-1.0: War Room Communication Excellence Phase 1 ───────────────────

export { transitionWarRoom, isWarRoomTransitionAllowed, getWarRoomNextStatuses, WAR_ROOM_TRANSITIONS } from './war-room-lifecycle';
export type { WarRoomTransitionDef, WarRoomTransitionResult } from './war-room-lifecycle';

export { evaluateActivationCondition, createWarRoom, bindCaseToWarRoom, DEFAULT_CADENCE_PROFILE } from './war-room-activation';
export type { WarRoomPrioritySignal, ActivationConditionResult } from './war-room-activation';

export { computeNextUpdateTime, getCadenceForStatus, detectStalling, generateStructuredUpdate } from './war-room-cadence';
export type { NextUpdateResult, StallingResult, WarRoomUpdate, ActionSummary, OpenBlocker, RecentAction, BoundCaseSummary } from './war-room-cadence';

export { generateOrientationBriefing, updateBriefingOnEvent, deriveConfidence, WAR_ROOM_AI_ACTOR } from './war-room-ai-orientation';
export type { OrientationBriefing, OrientationEvent, OrientationCaseSummary, OrientationRiskObject, OrientationIntelligence, OrientationPrioritySignal, ExploitAnalysis, BlastRadius, RecommendedAction, UncertaintyGap, ConfidenceLevel } from './war-room-ai-orientation';

export { generateCloseOutReport } from './war-room-closeout';
export type { CloseOutReport, CloseOutCaseSummary, AuditTimelineEntry, MemberParticipation, CommunicationRecord, AiRecord, DecisionRecord, EvidenceChainEntry, LessonRecommendation } from './war-room-closeout';
