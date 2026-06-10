/**
 * Commander C2 Canonical Entities — Central Export
 *
 * All entities exported from this index. Import from '@commander/contracts'.
 * Merges: Commander C2 Standards Evidence Model + full SDR entity catalogue.
 */

// ─── Layer 1: Standards Declaration (Thesis §5 — Schema_Compliance) ──────────
export type {
  SchemaCompliance,
  ConformanceLevel,
  SchemaComplianceValidation,
} from './standards-declaration';
export { CONFORMANCE_LEVELS, validate_schema_compliance } from './standards-declaration';

// ─── Layer 2: Architecture Classification & Topology (Thesis §6) ─────────────
export type {
  ArchitectureClassification,
  TogafDomain,
  ZachmanAspect,
  ZachmanPerspective,
  ArchitectureClassificationValidation,
} from './architecture-classification';
export { TOGAF_DOMAINS, ZACHMAN_ASPECTS, ZACHMAN_PERSPECTIVES, validate_architecture_classification } from './architecture-classification';

export type {
  TopologyNode,
  TopologyNodeValidation,
} from './topology-node';
export { validate_topology_node } from './topology-node';

export type {
  TopologyEdge,
  EdgeDirection,
  TopologyEdgeValidation,
} from './topology-edge';
export { EDGE_DIRECTIONS, validate_topology_edge } from './topology-edge';

// ─── Layer 3: Event & Intelligence (Thesis §7) ──────────────────────────────
export type {
  Signal,
  AssetResolutionStatus,
  SignalValidation,
} from './signal';
export { ASSET_RESOLUTION_STATUSES, validate_signal } from './signal';

export type {
  FindingEvent,
  FindingEventValidation,
} from './finding-event';
export { validate_finding_event } from './finding-event';

export type {
  RemediationEvent,
  RemediationOutcome,
  RemediationEventValidation,
} from './remediation-event';
export { REMEDIATION_OUTCOMES, validate_remediation_event } from './remediation-event';

export type {
  IntelligenceAssessment,
  SourceReliabilityGrade,
  InformationCredibilityGrade,
  IntelligenceAssessmentValidation,
} from './intelligence-assessment';
export { SOURCE_RELIABILITY_GRADES, INFORMATION_CREDIBILITY_GRADES, validate_intelligence_assessment } from './intelligence-assessment';

export type {
  StandardsFieldMapping,
  ConformanceType,
  StandardRequirement,
  StandardsFieldMappingValidation,
} from './standards-field-mapping';
export { validateStandardsFieldMapping } from './standards-field-mapping';

export type {
  StandardsVersionHistory,
  VersionChangeType,
  StandardsVersionHistoryValidation,
} from './standards-version-history';
export { validateStandardsVersionHistory } from './standards-version-history';

// ─── Foundation ──────────────────────────────────────────────────────────────
export type {
  CommonFields,
  TenantContext,
  SourceMetadata,
  ConnectorClass,
  SignalPurpose,
  VerdictDisposition,
  SurfaceAttribution,
  BuildStatus,
} from './common';

export { CONNECTOR_CLASS_LABELS } from './common';

export type { Asset, AssetClassification, AssetLifecycleState, AssetPlatform, AssetNetworkPosition, AssetDataClassification } from './asset';
export { ASSET_LIFECYCLE_STATES, ASSET_NETWORK_POSITIONS, ASSET_DATA_CLASSIFICATIONS } from './asset';
export type { Identity, IdentityClassification, IdentityPrivilegeLevel, IdentityAuthStrength, IdentityEntitlementSummary, IdentityRiskFactor, IdentityRiskFactorType } from './identity';
export { IDENTITY_PRIVILEGE_LEVELS, IDENTITY_AUTH_STRENGTHS, IDENTITY_RISK_FACTOR_TYPES } from './identity';
export type { Connector, ConnectorState } from './connector';
export type { AuditEvent, AuditActor } from './audit-event';
export type { Case, CaseType, CaseTypeExtended, LegacyCaseType, CaseStatus, LegacyCaseStatus, CaseStatusExtended } from './case';
export { CASE_TYPES, LEGACY_STATUS_MAP } from './case';
export type { RiskObject, RiskObjectType, TreatmentState } from './risk-object';
export { RISK_OBJECT_TYPES } from './risk-object';
export type {
  FindingClass,
  SourceSeverityLevel,
  SourceSeverity,
  SourceConfidenceLevel,
  SourceConfidence,
  SourceProduct,
  AttackMapping,
  ObservableType,
  ObservableRef,
  SourceClassification,
  SourceClassificationValidation,
} from './coim';
export {
  FINDING_CLASSES,
  SEVERITY_ID,
  MAX_ATTACK_BINDINGS,
  MAX_OBSERVABLES,
  validateSourceClassification,
} from './coim';
export type { LifecycleActor, CaseTransition, TransitionRequest, TransitionResult, CaseTransitionRecord, CaseLifecycleHistory } from './case-lifecycle';
export { LIFECYCLE_ACTORS, ALLOWED_TRANSITIONS, isTransitionAllowed, getNextStates, getPermittedActors, executeTransition, appendTransitionRecord, getCurrentStatusFromHistory } from './case-lifecycle';
export type { CaseStrategyBinding, StrategyPolicyRef } from './case-strategy-binding';
export { CASE_STRATEGY_SURFACES } from './case-strategy-binding';
export type {
  StrategySurfaceType,
  StrategyPolicy,
  StrategyPolicyStatus,
  StrategyApproval,
  RuntimeBindingEvent,
  RuntimeBindingTrigger,
  StrategyCentreView,
} from './strategy';
export {
  STRATEGY_SURFACE_TYPES,
  STRATEGY_SURFACE_LABELS,
  RUNTIME_BINDING_EVENTS,
  STRATEGY_CENTRE_VIEWS,
  STRATEGY_CENTRE_VIEW_LABELS,
} from './strategy';
export type {
  Evidence,
  EvidenceType,
  EvidenceSource,
  FreshnessStatus,
  EvidenceValidation,
} from './evidence';
export {
  EVIDENCE_TYPES,
  EVIDENCE_SOURCES,
  FRESHNESS_STATUSES,
  MAX_CONFIDENCE,
  MIN_CONFIDENCE,
  validateEvidence,
} from './evidence';
export type {
  Verdict,
  VerdictPolicyRef,
  VerdictValidation,
} from './verdict';
export {
  DISPOSITION_SEVERITY,
  DISPOSITIONS_BY_SEVERITY,
  validateVerdict,
} from './verdict';
export type {
  Observable,
  ObservableRiskObjectBinding,
  ObservableValidation,
} from './observable';
export {
  OBSERVABLE_TYPES,
  MAX_REPUTATION,
  MIN_REPUTATION,
  validateObservable,
} from './observable';
export type {
  Analytic,
  AnalyticType,
  AnalyticState,
  AnalyticRef,
  AnalyticValidation,
} from './analytic';
export {
  ANALYTIC_TYPES,
  ANALYTIC_STATES,
  MAX_FALSE_POSITIVE_RATE,
  MIN_FALSE_POSITIVE_RATE,
  MAX_ANALYTIC_ATTACK_BINDINGS,
  validateAnalytic,
} from './analytic';
export type {
  Action,
  ActionStatus,
  SubAction,
  OutcomeClassification,
  D3FENDTacticType,
  D3FENDCountermeasure,
  ActionValidation,
} from './action';
export {
  ACTION_STATUSES,
  OUTCOME_CLASSIFICATIONS,
  D3FEND_TACTIC_TYPES,
  MAX_COUNTERMEASURES,
  validateAction,
  validateSubAction,
} from './action';
export type {
  ControlFramework,
  FrameworkCategory,
  LicenceStatus,
  FrameworkControl,
  ControlTier,
  ControlRequirement,
  RequirementTargetType,
  EvaluationRule,
  EvaluationOperator,
  ControlEvaluation,
  AdherenceVerdict,
  ExceptionState,
  ControlMapping,
  MappedEntityType,
  MappingSource,
  CoverageContribution,
  ControlFrameworkValidation,
} from './control-framework';
export {
  FRAMEWORK_CATEGORIES,
  LICENCE_STATUSES,
  CONTROL_TIERS,
  REQUIREMENT_TARGET_TYPES,
  EVALUATION_OPERATORS,
  ADHERENCE_VERDICTS,
  EXCEPTION_STATES,
  MAPPED_ENTITY_TYPES,
  MAPPING_SOURCES,
  COVERAGE_CONTRIBUTIONS,
  validateControlFramework,
  validateFrameworkControl,
  validateControlRequirement,
  validateControlEvaluation,
  validateControlMapping,
} from './control-framework';

// ─── Intelligence Common (Platform Intelligence & IOC Distribution) ──────────
export type {
  PlatformIntelligenceSourceType,
  PlatformRecordType,
  IocCategory,
  IocRelationshipState,
  TlpMarking,
  CveState,
  SourceFreshnessState,
  TenantSubscriptionState,
  EvaluationType,
  TenantExposureState,
  IocMatchType,
  IocCaseLinkType,
  ThreatHuntStatus,
  PushActionType,
  PushIntentStatus,
  AllowBlockListType,
  SourceAttributionEntry,
  RelationshipStateTransition,
} from './intelligence-common';
export {
  PLATFORM_INTELLIGENCE_SOURCE_TYPES,
  PLATFORM_RECORD_TYPES,
  IOC_CATEGORIES,
  IOC_RELATIONSHIP_STATES,
  TLP_MARKINGS,
  CVE_STATES,
  SOURCE_FRESHNESS_STATES,
  TENANT_SUBSCRIPTION_STATES,
  EVALUATION_TYPES,
  TENANT_EXPOSURE_STATES,
  IOC_MATCH_TYPES,
  IOC_CASE_LINK_TYPES,
  THREAT_HUNT_STATUSES,
  PUSH_ACTION_TYPES,
  PUSH_INTENT_STATUSES,
  ALLOW_BLOCK_LIST_TYPES,
} from './intelligence-common';

// ─── Platform Intelligence Source ────────────────────────────────────────────
export type { PlatformIntelligenceSource, FeedFailureState, PlatformIntelligenceSourceValidation } from './platform-intelligence-source';
export { validatePlatformIntelligenceSource } from './platform-intelligence-source';

// ─── Platform Intelligence Record ────────────────────────────────────────────
export type { PlatformIntelligenceRecord, PlatformIntelligenceRecordValidation } from './platform-intelligence-record';
export { validatePlatformIntelligenceRecord } from './platform-intelligence-record';

// ─── Vulnerability Intelligence Record ───────────────────────────────────────
export type { VulnerabilityIntelligenceRecord, VulnerabilityIntelligenceRecordValidation } from './vulnerability-intelligence-record';
export { validateVulnerabilityIntelligenceRecord } from './vulnerability-intelligence-record';

// ─── Vendor Advisory ─────────────────────────────────────────────────────────
export type { VendorAdvisory, VendorAdvisoryValidation } from './vendor-advisory';
export { validateVendorAdvisory } from './vendor-advisory';

// ─── Indicator of Compromise ─────────────────────────────────────────────────
export type { IndicatorOfCompromise, IndicatorOfCompromiseValidation } from './indicator-of-compromise';
export { validateIndicatorOfCompromise } from './indicator-of-compromise';

// ─── IOC Relationship ────────────────────────────────────────────────────────
export type { IocRelationship, IocRelationshipValidation } from './ioc-relationship';
export { validateIocRelationship } from './ioc-relationship';

// ─── Tenant Intelligence Subscription ────────────────────────────────────────
export type { TenantIntelligenceSubscription, TenantIntelligenceSubscriptionValidation } from './tenant-intelligence-subscription';
export { validateTenantIntelligenceSubscription } from './tenant-intelligence-subscription';

// ─── Tenant IOC Allow/Block Entry ────────────────────────────────────────────
export type { TenantIocAllowBlockEntry, TenantIocAllowBlockEntryValidation } from './tenant-ioc-allowblock-entry';
export { validateTenantIocAllowBlockEntry } from './tenant-ioc-allowblock-entry';

// ─── Tenant Intelligence Evaluation ──────────────────────────────────────────
export type { TenantIntelligenceEvaluation, TenantIntelligenceEvaluationValidation } from './tenant-intelligence-evaluation';
export { validateTenantIntelligenceEvaluation } from './tenant-intelligence-evaluation';

// ─── Tenant IOC Match ────────────────────────────────────────────────────────
export type { TenantIocMatch, TenantIocMatchValidation } from './tenant-ioc-match';
export { validateTenantIocMatch } from './tenant-ioc-match';

// ─── IOC Case Link ───────────────────────────────────────────────────────────
export type { IocCaseLink, IocCaseLinkValidation } from './ioc-case-link';
export { validateIocCaseLink } from './ioc-case-link';

// ─── Vulnerability Case Link ─────────────────────────────────────────────────
export type { VulnerabilityCaseLink, VulnerabilityCaseLinkValidation } from './vulnerability-case-link';
export { validateVulnerabilityCaseLink } from './vulnerability-case-link';

// ─── Threat Hunt Record ──────────────────────────────────────────────────────
export type { ThreatHuntRecord, ThreatHuntRecordValidation } from './threat-hunt-record';
export { validateThreatHuntRecord } from './threat-hunt-record';

// ─── Push Action Intent ──────────────────────────────────────────────────────
export type { PushActionIntent, PushActionIntentValidation } from './push-action-intent';
export { validatePushActionIntent } from './push-action-intent';

// ─── Inbound Email Submission ────────────────────────────────────────────────
export type { InboundEmailSubmission, ParsedEmailIoc, InboundEmailSubmissionValidation } from './inbound-email-submission';
export { validateInboundEmailSubmission } from './inbound-email-submission';

// ─── Communications Excellence (Phase 1) ─────────────────────────────────────
export type {
  CaseCommunicationThread,
  CommunicationChannel,
  CommunicationThreadStatus,
  CommunicationSla,
  ThreadParticipant,
  CaseCommunicationThreadValidation,
} from './case-communication-thread';
export {
  COMMUNICATION_CHANNELS,
  COMMUNICATION_THREAD_STATUSES,
  validateCaseCommunicationThread,
} from './case-communication-thread';

export type {
  CommunicationPlaybook,
  PlaybookStatus,
  PlaybookStepAction,
  PlaybookCondition,
  PlaybookTrigger,
  PlaybookStep,
  CommunicationPlaybookValidation,
} from './communication-playbook';
export {
  PLAYBOOK_STATUSES,
  PLAYBOOK_STEP_ACTIONS,
  isValidBoundedCondition,
  validateCommunicationPlaybook,
} from './communication-playbook';

export type {
  PlaybookExecution,
  PlaybookStepExecutionStatus,
  PlaybookExecutionStatus,
  StepExecutionStatus,
  PlaybookExecutionValidation,
} from './playbook-execution';
export {
  PLAYBOOK_STEP_EXECUTION_STATUSES,
  PLAYBOOK_EXECUTION_STATUSES,
  validatePlaybookExecution,
} from './playbook-execution';

export type {
  DetonationVerdict,
  DetonationSource,
  DetonationOverallVerdict,
  DetonationCheckType,
  DetonationCheckResult,
  DetonationCheck,
  DetonationVerdictValidation,
} from './detonation-verdict';
export {
  DETONATION_SOURCES,
  DETONATION_OVERALL_VERDICTS,
  DETONATION_CHECK_TYPES,
  DETONATION_CHECK_RESULTS,
  validateDetonationVerdict,
} from './detonation-verdict';

export type {
  PhishingReport,
  PhishingTriageVerdict,
  PhishingNotificationStatus,
  PhishingReportStatus,
  PhishingReportValidation,
} from './phishing-report';
export {
  PHISHING_TRIAGE_VERDICTS,
  PHISHING_NOTIFICATION_STATUSES,
  PHISHING_REPORT_STATUSES,
  validatePhishingReport,
} from './phishing-report';

export type {
  StixBundleIngest,
  StixObjectType,
  StixIngestStatus,
  StixBundleIngestValidation,
} from './stix-bundle-ingest';
export {
  STIX_OBJECT_TYPES,
  STIX_INGEST_STATUSES,
  validateStixBundleIngest,
} from './stix-bundle-ingest';

export type {
  TeamsDecisionEvent,
  TeamsRequestType,
  TeamsDecision,
  TeamsDecisionEventValidation,
} from './teams-decision-event';
export {
  TEAMS_REQUEST_TYPES,
  TEAMS_DECISIONS,
  validateTeamsDecisionEvent,
} from './teams-decision-event';

// ─── War Room Communication Excellence (WRCEP-1.0 Phase 1) ──────────────────
export type {
  WarRoom,
  WarRoomStatus,
  WarRoomMemberRole,
  WarRoomMember,
  SubscriptionChannel,
  SubscriptionCadence,
  WarRoomSubscriber,
  CommunicationCadenceProfile,
  WarRoomActivationSource,
  WarRoomAiOrientationState,
  WarRoomValidation,
} from './war-room';
export {
  WAR_ROOM_STATUSES,
  WAR_ROOM_MEMBER_ROLES,
  SUBSCRIPTION_CHANNELS,
  SUBSCRIPTION_CADENCES,
  validateWarRoom,
} from './war-room';

// ─── Pulse Entities (Team/Domain/System health snapshots) ────────────────────
export type {
  PulseDomain,
  WorkloadBand,
  TeamPulseEntry,
  DomainHealth,
  DomainPulseEntry,
  EngineHealth,
  SystemPulseEntry,
} from './pulse';
export { PULSE_DOMAINS } from './pulse';

// ─── Posture Metrics Config (Aggregate/Posture Command Centre — Unit 16b) ───
export type {
  PostureTimePeriod,
  TrendDirection,
  ThresholdBand,
  PostureMetricDomain,
  PostureMetricDataPoint,
  StrategyThresholdRef,
  PostureMetricPeriodSnapshot,
  PostureMetricConfig,
} from './posture-metrics-config';
export {
  POSTURE_TIME_PERIODS,
  POSTURE_TIME_PERIOD_LABELS,
  POSTURE_METRIC_DOMAINS,
} from './posture-metrics-config';

// ─── Posture Accountability (Spec 39 — Temporal Posture Model) ───────────────
export type {
  PostureAccountabilityClassification,
  AccountableEntityType,
  AccountabilityStatus,
  ClassifierSource,
  PostureAccountability,
  PostureAccountabilityValidation,
} from './posture-accountability';
export {
  POSTURE_ACCOUNTABILITY_CLASSIFICATIONS,
  ACCOUNTABLE_ENTITY_TYPES,
  ACCOUNTABILITY_STATUSES,
  CLASSIFIER_SOURCES,
  validatePostureAccountability,
} from './posture-accountability';

// ─── Report Entity ───────────────────────────────────────────────────────────
export type { Report, ReportType, ReportStatus, ReportCadence } from './report';
export { REPORT_TYPES, REPORT_STATUSES, REPORT_CADENCES } from './report';

// ─── Platform Management Entities ────────────────────────────────────────────
export type {
  RuleDefinition, RuleStatus, RuleType,
  ModelDefinition, ModelStatus, ModelType,
  AutomationRule, AutomationStatus, AutomationTrigger,
  FeatureRegistryEntry, FeatureState,
} from './platform-management';
export {
  RULE_STATUSES, RULE_TYPES,
  MODEL_STATUSES, MODEL_TYPES,
  AUTOMATION_STATUSES, AUTOMATION_TRIGGERS,
  FEATURE_STATES,
} from './platform-management';

// ─── Entitlement Manifest (Spec 38 — Commercial Control Plane) ──────────────
export type {
  EntitlementManifest,
  EntitlementModule,
  EntitlementStatus,
  ReportingTier,
  ModuleCategory,
  EntitlementManifestValidation,
} from './entitlement-manifest';
export {
  ENTITLEMENT_STATUSES,
  REPORTING_TIERS,
  MODULE_CATEGORIES,
  validateEntitlementManifest,
} from './entitlement-manifest';

// ─── Mission Binding (Spec 37 — Mission Objective Binding Model) ─────────────
export type {
  MissionBinding,
  BindingEntityType,
  BindingMethod,
  BoundBy,
  MissionBindingValidation,
} from './mission-binding';
export {
  BINDING_ENTITY_TYPES,
  BINDING_METHODS,
  BOUND_BY_OPTIONS,
  validateMissionBinding,
} from './mission-binding';

// ─── Finding (Spec 34 — Drift & Rule Engine) ─────────────────────────────────
export type {
  Finding,
  FindingStatus,
  AffectedEntityType,
  ProposedAction,
  ProposedActionType,
  FindingValidation,
} from './finding';
export {
  FINDING_STATUSES,
  AFFECTED_ENTITY_TYPES,
  PROPOSED_ACTION_TYPES,
  validateFinding,
} from './finding';

// ─── Risk Score (Spec 34 — Drift & Rule Engine) ──────────────────────────────
export type {
  RiskScore,
  RiskFactor,
  ScoredEntityType,
  RiskScoreValidation,
} from './risk-scoring-engine';
export {
  SCORED_ENTITY_TYPES,
  validateRiskScore,
} from './risk-scoring-engine';

// ─── Blast Radius (Spec 34 — Drift & Rule Engine) ────────────────────────────
export type {
  BlastRadius,
  AffectedEntity,
  BlastAffectedEntityType,
  BlastRadiusValidation,
} from './blast-radius-engine';
export {
  BLAST_AFFECTED_ENTITY_TYPES,
  validateBlastRadius,
} from './blast-radius-engine';

// ─── Decision Record (Spec 36 — Governance) ──────────────────────────────────
export type { DecisionRecord, DecisionType, DecisionFactor, DecisionRecordValidation } from './decision-record';
export { DECISION_TYPES, validateDecisionRecord } from './decision-record';

// ─── Simulation Result (Spec 36 — Governance) ────────────────────────────────
export type { SimulationResult as RuleSimulationResult, SimulationConflict, SimulationStatus, SimulationScope, SimulationResultValidation } from './simulation-result';
export { SIMULATION_STATUSES, SIMULATION_SCOPES, validateSimulationResult } from './simulation-result';

// ─── Inverse Discovery Event (Spec 40) ──────────────────────────────────────
export type { InverseDiscoveryEvent, LookupEntityType, LookupResult, RootCause, InverseDiscoveryEventValidation } from './inverse-discovery-event';
export { LOOKUP_ENTITY_TYPES, LOOKUP_RESULTS, ROOT_CAUSES, validateInverseDiscoveryEvent } from './inverse-discovery-event';

// ─── Attack Classification Audit (Spec 39) ──────────────────────────────────
export type { AttackClassificationAudit, AttackClassification, PostureSnapshot, AttackClassificationAuditValidation } from './attack-classification-audit';
export { ATTACK_CLASSIFICATIONS, validateAttackClassificationAudit } from './attack-classification-audit';

// ─── Verdict Pattern Case (Spec 41) ─────────────────────────────────────────
export type { VerdictPatternCase, PatternType, VerdictPatternPhase, OutcomeCategory, EvidenceGrade, VerdictPatternCaseValidation } from './verdict-pattern-case';
export { PATTERN_TYPES, VERDICT_PATTERN_PHASES, OUTCOME_CATEGORIES, EVIDENCE_GRADES, validateVerdictPatternCase } from './verdict-pattern-case';

// ─── Governed Compose (Spec 25 — Outbound Draft & Approval) ──────────────────
export type { GovernedCompose, ComposeChannel, ApprovalStatus, GovernedComposeValidation } from './governed-compose';
export { COMPOSE_CHANNELS, APPROVAL_STATUSES, validateGovernedCompose } from './governed-compose';

// ─── Notification (Spec 26 — Analyst Notifications) ──────────────────────────
export type { Notification, NotificationType, NotificationSeverity, NotificationValidation } from './notification';
export { NOTIFICATION_TYPES, NOTIFICATION_SEVERITIES, validateNotification } from './notification';

// ─── Case Follow (Analyst Subscription) ──────────────────────────────────────
export type { CaseFollow, FollowEventType, CaseFollowValidation } from './case-follow';
export { FOLLOW_EVENT_TYPES, validateCaseFollow } from './case-follow';

// ─── Cloud Security Posture (Spec 22 — Architecture Intelligence) ────────────
export type { CloudSecurityPosture, CloudProvider, DriftSeverity, DriftDetail, CloudSecurityPostureValidation } from './cloud-security-posture';
export { CLOUD_PROVIDERS, DRIFT_SEVERITIES, validateCloudSecurityPosture } from './cloud-security-posture';

// ─── Case Transition Audit (Spec 06 Req 6 — Structured Lifecycle Audit) ──────
export type { CaseTransitionAudit, TransitionTrigger, CaseTransitionAuditValidation } from './case-transition-audit';
export { TRANSITION_TRIGGERS, validateCaseTransitionAudit } from './case-transition-audit';

// ─── Email Case Communication (Spec 25 — Email Thread) ──────────────────────
export type { EmailCaseCommunication, CommunicationDirection, CommunicationStatus, EmailCaseCommunicationValidation } from './email-case-communication';
export { COMMUNICATION_DIRECTIONS, COMMUNICATION_STATUSES, validateEmailCaseCommunication } from './email-case-communication';

// ─── Journey Intelligence Enumerations (JI-1.0 — Domain D-47) ────────────────
export type {
  OodaStage,
  DeliveryMode,
  JourneyStatus,
  JourneyOutcome,
  JourneyAnchorType,
  LifecycleCheckpoint,
} from './journey-enums';
export {
  OODA_STAGES,
  OODA_STAGE_LABELS,
  DELIVERY_MODES,
  DELIVERY_MODE_LABELS,
  JOURNEY_STATUSES,
  TERMINAL_STATUSES,
  JOURNEY_OUTCOMES,
  TERMINAL_OUTCOMES,
  JOURNEY_ANCHOR_TYPES,
  LIFECYCLE_CHECKPOINTS,
  ALL_LIFECYCLE_CHECKPOINTS,
  LIFECYCLE_CHECKPOINT_COUNT,
  getStageForCheckpoint,
} from './journey-enums';
