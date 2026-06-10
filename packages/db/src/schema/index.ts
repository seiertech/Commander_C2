/**
 * Commander SDR Database Schema — Central Export
 *
 * Drizzle ORM schema definitions for Postgres 16+.
 * All tables enforce tenant scope.
 *
 * Data classifications per Master Technical Specification §11.1:
 * - Configuration, State, Verdict, Detection, Case, Threat Intelligence, Audit
 *
 * Data residency per Master Technical Specification §11.2:
 * - UK and US boundaries honoured per tenant selection
 */

export {
  dataClassificationEnum,
  dataResidencyEnum,
  connectorClassEnum,
  surfaceAttributionEnum,
  caseStatusEnum,
  priorityEnum,
} from './common';

export { tenants } from './tenants';
export { assets } from './assets';
export { identities } from './identities';
export { cases } from './cases';
export { connectors, conformanceTierEnum, connectorStateEnum, lastRunStatusEnum } from './connectors';
export { auditEvents } from './audit-events';
export { riskObjects, riskObjectTypeEnum, treatmentStateEnum, findingClassEnum } from './risk-objects';
export { strategies, strategySurfaceTypeEnum, strategyPolicyStatusEnum } from './strategies';
export { caseStrategyBindings } from './case-strategy-bindings';
export { evidence, evidenceTypeEnum, evidenceSourceEnum, freshnessStatusEnum } from './evidence';
export { verdicts, verdictDispositionEnum } from './verdicts';
export { observables, observableRiskObjectBindings, observableTypeEnum } from './observables';
export { analytics, analyticTypeEnum, analyticStateEnum } from './analytics';
export { actions, subActions, actionStatusEnum, outcomeClassificationEnum, d3fendTacticTypeEnum } from './actions';
export { controlFrameworks, frameworkControls, controlRequirements, controlEvaluations, controlMappings, frameworkCategoryEnum, licenceStatusEnum, controlTierEnum, evaluationOperatorEnum, complianceVerdictEnum, exceptionStateEnum, mappingSourceEnum, coverageContributionEnum } from './control-frameworks';

// ─── Platform Intelligence & IOC Distribution ────────────────────────────────
export {
  platformIntelligenceSources,
  platformIntelligenceRecords,
  vulnerabilityIntelligenceRecords,
  vendorAdvisories,
  indicatorsOfCompromise,
  iocRelationships,
  platformSourceTypeEnum,
  platformRecordTypeEnum,
  iocCategoryEnum,
  iocRelationshipStateEnum,
  tlpMarkingEnum,
  cveStateEnum,
  sourceFreshnessEnum,
} from './platform-intelligence';
export {
  tenantIntelligenceSubscriptions,
  tenantIntelligenceEvaluations,
  tenantIocMatches,
  tenantIocAllowBlockEntries,
  iocCaseLinks,
  vulnerabilityCaseLinks,
  threatHuntRecords,
  pushActionIntents,
  tenantSubscriptionStateEnum,
  evaluationTypeEnum,
  tenantExposureStateEnum,
  iocMatchTypeEnum,
  allowBlockListTypeEnum,
  iocCaseLinkTypeEnum,
  threatHuntStatusEnum,
  pushActionTypeEnum,
  pushIntentStatusEnum,
} from './tenant-intelligence';
