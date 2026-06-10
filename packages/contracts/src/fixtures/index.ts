// @ts-nocheck
/**
 * Commander C2 Seed Fixtures — Central Export
 *
 * All synthetic test data for local-first development.
 * No real customer data, secrets, or vendor credentials.
 */

export { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';
export { seedAssets } from './seed-assets';
export { seedIdentities } from './seed-identities';
export { seedCases } from './seed-cases';
export { seedConnectors } from './seed-connectors';
export { seedStrategies } from './seed-strategies';
export { seedRiskObjects } from './seed-risk-objects';
export { seedEvidence } from './seed-evidence';
export { seedVerdicts } from './seed-verdicts';
export { seedObservables, seedObservableBindings } from './seed-observables';
export { seedAnalytics } from './seed-analytics';
export { seedActions, seedSubActions } from './seed-actions';
export { seedControlFrameworks, seedFrameworkControls, seedControlRequirements, seedControlEvaluations, seedControlMappings } from './seed-control-frameworks';
export { seedEvents } from './seed-events';
export type { SeedEvent } from './seed-events';

// ─── Platform Intelligence & IOC Distribution Fixtures ───────────────────────
export { seedPlatformIntelligenceSources } from './seed-platform-intelligence-sources';
export { seedIocs } from './seed-iocs';
export { seedVulnerabilityIntelligence } from './seed-vulnerability-intelligence';
export { seedVendorAdvisories } from './seed-vendor-advisories';
export { seedIocRelationships } from './seed-ioc-relationships';
export { seedTenantIntelligenceSubscriptions } from './seed-tenant-intelligence-subscriptions';
export { seedTenantIntelligenceEvaluations } from './seed-tenant-intelligence-evaluations';
export { seedTenantIocMatches } from './seed-tenant-ioc-matches';
export { seedTenantAllowBlockEntries } from './seed-tenant-allowblock-entries';
export { seedIocCaseLinks } from './seed-ioc-case-links';
export { seedVulnerabilityCaseLinks } from './seed-vulnerability-case-links';
export { seedThreatHunts } from './seed-threat-hunts';
export { seedPushActionIntents } from './seed-push-action-intents';
export { seedInboundEmailSubmissions } from './seed-inbound-email-submissions';

// ─── Communications Excellence Fixtures ──────────────────────────────────────
export { seedCommunicationThreads } from './seed-communication-threads';
export { seedCommunicationPlaybooks } from './seed-communication-playbooks';
export { seedDetonationVerdicts } from './seed-detonation-verdicts';
export { seedPhishingReports } from './seed-phishing-reports';
export { seedStixBundleIngests } from './seed-stix-bundles';
export { seedTeamsDecisionEvents } from './seed-teams-decision-events';

// ─── War Room Communication Excellence Fixtures (WRCEP-1.0) ─────────────────
export { seedWarRooms } from './seed-war-rooms';


// ─── Pulse Fixtures ──────────────────────────────────────────────────────────
export { seedTeamPulse, seedDomainPulse, seedSystemPulse } from './seed-pulse';

// ─── Report Fixtures ─────────────────────────────────────────────────────────
export { seedReports } from './seed-reports';

// ─── Platform Management Fixtures ────────────────────────────────────────────
export { seedRules, seedModels, seedAutomationRules, seedFeatureRegistry } from './seed-platform';

// ─── Posture Metrics Fixtures (Unit 16b — Aggregate Command Centre) ──────────
export { seedPostureMetrics } from './seed-posture-metrics';

// ─── Posture Accountability Fixtures (Spec 39 — DEC-spec39-dual-model) ───────
export { seedPostureAccountability } from './seed-posture-accountability';

// ─── Entitlement Manifest Fixtures (Spec 38 — Commercial Control Plane) ──────
export { seedEntitlements } from './seed-entitlements';

// ─── Mission Binding Fixtures (Spec 37 — Mission Objective Binding Model) ────
export { seedMissionBindings } from './seed-mission-bindings';

// ─── Drift & Rule Engine Fixtures (Spec 34) ──────────────────────────────────
export { seedFindings } from './seed-findings';
export { seedRiskScores } from './seed-risk-scores';
export { seedBlastRadius } from './seed-blast-radius';

// ─── Decision Record Fixtures (Spec 36) ──────────────────────────────────────
export { seedDecisionRecords } from './seed-decision-records';
export { seedSimulationResults } from './seed-simulation-results';

// ─── Inverse Discovery Fixtures (Spec 40) ────────────────────────────────────
export { seedInverseDiscovery } from './seed-inverse-discovery';

// ─── Attack Classification Audit Fixtures (Spec 39) ──────────────────────────
export { seedAttackClassificationAudits } from './seed-attack-classification-audits';

// ─── Verdict Pattern Fixtures (Spec 41) ──────────────────────────────────────
export { seedVerdictPatterns } from './seed-verdict-patterns';

// ─── Governed Compose Fixtures (Spec 25 — Outbound Draft & Approval) ─────────
export { seedGovernedCompose } from './seed-governed-compose';

// ─── Notification Fixtures (Spec 26) ─────────────────────────────────────────
export { seedNotifications } from './seed-notifications';

// ─── Case Follow Fixtures ────────────────────────────────────────────────────
export { seedCaseFollows } from './seed-case-follows';

// ─── Cloud Security Posture Fixtures (Spec 22) ───────────────────────────────
export { seedCloudSecurityPosture } from './seed-cloud-security-posture';

// ─── Case Transition Audit Fixtures (Spec 06 Req 6) ──────────────────────────
export { seedCaseTransitionAudits } from './seed-case-transition-audits';

// ─── Email Case Communication Fixtures (Spec 25) ─────────────────────────────
export { seedEmailCommunications } from './seed-email-communications';


// ─── Standards Evidence Model Fixtures (Phase 1) ─────────────────────────────
export { SCHEMA_COMPLIANCE_FIXTURES as STANDARDS_DECLARATIONS } from './seed-standards-declarations';
export { STANDARDS_FIELD_MAPPINGS } from './seed-standards-field-mappings';
