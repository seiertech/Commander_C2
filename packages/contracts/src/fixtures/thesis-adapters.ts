/**
 * Thesis Adapters — Commander C2 Phase 3
 *
 * Transform existing SDR fixture data into thesis-canonical entity shapes.
 * This allows UI pages to consume thesis entities immediately while the
 * full fixture rewrite (Phase 4) happens separately.
 *
 * Pattern: SDR fixture → thesis-shaped export
 * Convention: snake_case fields, standard_marker present
 *
 * Phase 3 Extension: Re-export all seeds that are ALREADY in canonical shape
 * under thesis naming convention. Entities that needed transformation (missions,
 * assets, cases) get mapped adapters. Everything else is a passthrough re-export.
 */

import { seedMissions } from './seed-missions';
import { seedAssets } from './seed-assets';
import { seedCases } from './seed-cases';
import type { MissionThesis } from '../entities/mission-portfolio';
import type { AssetThesis } from '../entities/asset-authority';
import type { CaseThesis } from '../entities/case-remediation';
import type { Signal } from '../entities/signal';
import type { IntelligenceAssessment } from '../entities/intelligence-assessment';
import type { AssetSecurityPosture } from '../entities/asset-posture';

// ─── Mission Adapter (L9) ────────────────────────────────────────────────────

export const thesisMissions: MissionThesis[] = seedMissions.map((m) => ({
  mission_id: m.id,
  mission_name: m.name,
  capability_domain: m.domain ?? 'security_operations',
  derived_from_model: 'CBP',
  current_state_score: m.progressPercent,
  target_state_score: 100,
  delta_score: 100 - m.progressPercent,
  priority_score: (6 - m.priority) * 20, // P1=100, P2=80, P3=60, P4=40, P5=20
  impact_weighting: m.priority <= 2 ? 8 : m.priority <= 3 ? 5 : 3,
  risk_reduction_value: Math.round((100 - m.progressPercent) * 0.7),
  mission_type: 'posture' as const,
  owner: m.owner,
  timeframe: m.targetDate,
  status: m.status as 'draft' | 'active' | 'completed' | 'archived',
  standard_marker: 'CBP + OKR',
}));

// ─── Asset Adapter (L4) ─────────────────────────────────────────────────────

export const thesisAssets: AssetThesis[] = seedAssets.map((a) => ({
  asset_id: a.id,
  asset_name: a.name,
  asset_class: a.classification,
  asset_subclass: a.classification,
  platform: a.platform?.os ?? 'unknown',
  environment: a.environment,
  location: a.surfaceAttribution === 'external_attack_surface' ? 'Internet-facing' : 'Internal',
  owner: a.owner,
  lifecycle_state: (a.lifecycleState as any) ?? 'deployed',
  source_of_truth: a.source?.sourceSystem ?? 'commander',
  first_seen: a.createdAt,
  last_seen: a.updatedAt,
  standard_marker: 'ISO/IEC 19770-1:2017',
}));

// ─── Case Adapter (L7) ──────────────────────────────────────────────────────

export const thesisCases: CaseThesis[] = seedCases.map((c) => ({
  case_id: c.id,
  created_time: c.createdAt,
  case_type: c.caseType,
  related_signal_id: null,
  related_asset_id: c.relatedEntities?.[0] ?? null,
  related_vulnerability_id: null,
  impact_scope: c.priority === 'P0' ? 'organisation' as const : c.priority === 'P1' ? 'business_unit' as const : 'service' as const,
  urgency: c.priority === 'P0' ? 'critical' as const : c.priority === 'P1' ? 'high' as const : c.priority === 'P2' ? 'medium' as const : 'low' as const,
  priority_level: parseInt(c.priority.replace('P', '')) + 1,
  status: c.status,
  itil_stage: mapStatusToItilStage(c.status),
  owner_team: c.team,
  target_resolution_date: c.sla?.targetDate ?? c.updatedAt,
  ctem_phase: 'mobilization' as const,
  ooda_state: mapStatusToOoda(c.status),
  standard_marker: 'ITIL 4 + OODA + CTEM',
}));

function mapStatusToItilStage(status: string): 'identified' | 'logged' | 'categorized' | 'prioritized' | 'assigned' | 'resolved' | 'closed' {
  const map: Record<string, any> = {
    'open': 'logged', 'detected': 'identified', 'new': 'identified',
    'triage': 'categorized', 'prioritised': 'prioritized',
    'in_progress': 'assigned', 'in-progress': 'assigned',
    'action_decomposed': 'assigned',
    'awaiting-validation': 'resolved', 'validation': 'resolved',
    'awaiting-closure': 'resolved', 'closure': 'resolved',
    'closed': 'closed', 'reopened': 'assigned',
  };
  return map[status] ?? 'logged';
}

function mapStatusToOoda(status: string): 'observe' | 'orient' | 'decide' | 'act' {
  const map: Record<string, any> = {
    'open': 'observe', 'detected': 'observe', 'new': 'observe',
    'triage': 'orient', 'prioritised': 'orient',
    'in_progress': 'decide', 'in-progress': 'decide',
    'action_decomposed': 'act',
    'awaiting-validation': 'act', 'validation': 'act',
    'awaiting-closure': 'act', 'closure': 'act',
    'closed': 'act', 'reopened': 'orient',
  };
  return map[status] ?? 'observe';
}

// ─── Signal Adapter (L3) — from seed-events ──────────────────────────────────

import { seedEvents } from './seed-events';

export const thesisSignals: Signal[] = seedEvents.slice(0, 20).map((e, i) => ({
  signal_id: `sig-${String(i + 1).padStart(3, '0')}`,
  source_system: e.source ?? 'unknown',
  source_event_id: e.id,
  ocsf_category: e.category ?? 'Security Finding',
  ocsf_class: e.eventType ?? 'Detection Finding',
  signal_type: e.severity === 'critical' ? 'critical_detection' : 'detection',
  severity: e.severity === 'critical' ? 5 : e.severity === 'warning' ? 3 : e.severity === 'info' ? 2 : 1,
  time_observed: e.timestamp,
  raw_payload: JSON.stringify({ id: e.id, message: e.message }),
  normalized_payload: JSON.stringify({ class_uid: 2001, category_uid: 2, severity_id: e.severity === 'critical' ? 5 : 3 }),
  asset_resolution_status: 'resolved' as const,
  standard_marker: 'OCSF 1.3',
}));

// ─── Intelligence_Assessment Adapter (L3) ────────────────────────────────────

export const thesisIntelligenceAssessments: IntelligenceAssessment[] = thesisSignals.slice(0, 10).map((s, i) => ({
  intelligence_assessment_id: `ia-${String(i + 1).padStart(3, '0')}`,
  signal_id: s.signal_id,
  source_reliability: (['A', 'A', 'B', 'B', 'C', 'A', 'B', 'C', 'D', 'A'] as const)[i],
  information_credibility: ([1, 1, 2, 2, 3, 1, 2, 3, 4, 1] as const)[i],
  combined_rating: `${(['A', 'A', 'B', 'B', 'C', 'A', 'B', 'C', 'D', 'A'])[i]}${([1, 1, 2, 2, 3, 1, 2, 3, 4, 1])[i]}`,
  analytic_note: null,
  graded_by: 'system',
  graded_time: s.time_observed,
  standard_marker: 'NATO/Admiralty',
}));

// ─── Asset_Security_Posture Adapter (L5) ─────────────────────────────────────

export const thesisPostures: AssetSecurityPosture[] = seedAssets.slice(0, 10).map((a, i) => ({
  posture_id: `posture-${String(i + 1).padStart(3, '0')}`,
  asset_id: a.id,
  posture_status: a.coverage.hasEdr && a.coverage.hasVulnScan ? 'healthy' as const : a.coverage.hasEdr || a.coverage.hasVulnScan ? 'degraded' as const : 'critical' as const,
  posture_score: (a.coverage.hasEdr ? 25 : 0) + (a.coverage.hasVulnScan ? 25 : 0) + (a.coverage.hasPatchManagement ? 25 : 0) + (a.coverage.hasBackup ? 25 : 0),
  assessment_time: a.updatedAt,
  patch_status: a.coverage.hasPatchManagement ? 'current' as const : 'behind' as const,
  vulnerability_exposure: a.coverage.hasVulnScan ? 'low' as const : 'high' as const,
  monitoring_coverage: a.coverage.hasEdr ? 'full' as const : 'minimal' as const,
  response_readiness: 'ready' as const,
  recovery_readiness: a.coverage.hasBackup ? 'ready' as const : 'not_ready' as const,
  governance_status: 'governed' as const,
  standard_marker: 'NIST CSF 2.0',
}));



// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3 EXTENSION: Passthrough Re-exports for Already-Canonical Entities
// ═══════════════════════════════════════════════════════════════════════════════
// These seeds are ALREADY in thesis-canonical shape (snake_case, standard entity
// structure). They are re-exported here so all UI pages import from one source:
// thesis-adapters.ts — the single authority for fixture data.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Connector (L2 — Ingestion & Normalisation) ──────────────────────────────
export { seedConnectors as thesisConnectors } from './seed-connectors';

// ─── Identity (L6 — Identity Intelligence) ───────────────────────────────────
export { seedIdentities as thesisIdentities } from './seed-identities';

// ─── Strategy Policy (L10 — Strategy & Governance) ───────────────────────────
export { seedStrategies as thesisStrategies } from './seed-strategies';

// ─── Risk Object (L5 — Risk & Exposure) ──────────────────────────────────────
export { seedRiskObjects as thesisRiskObjects } from './seed-risk-objects';

// ─── Event / Activity (L3 — Signal Pipeline) ─────────────────────────────────
export { seedEvents as thesisEvents } from './seed-events';

// ─── Exposure (L5 — Attack Surface) ──────────────────────────────────────────
export { seedExposures as thesisExposures } from './seed-exposures';

// ─── Pulse (L8 — Operational Health) ─────────────────────────────────────────
export { seedTeamPulse as thesisTeamPulse } from './seed-pulse';
export { seedDomainPulse as thesisDomainPulse } from './seed-pulse';
export { seedSystemPulse as thesisSystemPulse } from './seed-pulse';

// ─── Platform Management (L11 — Platform & Automation) ───────────────────────
export { seedRules as thesisRules } from './seed-platform';
export { seedModels as thesisModels } from './seed-platform';
export { seedAutomationRules as thesisAutomationRules } from './seed-platform';
export { seedFeatureRegistry as thesisFeatureRegistry } from './seed-platform';

// ─── Action / Sub-Action (L7 — Remediation) ──────────────────────────────────
export { seedActions as thesisActions, seedSubActions as thesisSubActions } from './seed-actions';

// ─── Control Framework (L10 — Governance & Adherence) ────────────────────────
export { seedControlFrameworks as thesisControlFrameworks } from './seed-control-frameworks';
export { seedFrameworkControls as thesisFrameworkControls } from './seed-control-frameworks';
export { seedControlRequirements as thesisControlRequirements } from './seed-control-frameworks';
export { seedControlEvaluations as thesisControlEvaluations } from './seed-control-frameworks';
export { seedControlMappings as thesisControlMappings } from './seed-control-frameworks';

// ─── Topology (L4 — Architecture) ───────────────────────────────────────────
export { seedTopology as thesisTopology } from './seed-topology';

// ─── Architecture Components (L4 — Architecture Intelligence) ────────────────
export { seedArchitectureComponents as thesisArchitectureComponents } from './seed-architecture';
export { ARCHITECTURE_CLASSIFICATION_FIXTURES as thesisArchitectureClassifications } from './seed-architecture';
export { TOPOLOGY_NODE_FIXTURES as thesisTopologyNodes } from './seed-architecture';
export { TOPOLOGY_EDGE_FIXTURES as thesisTopologyEdges } from './seed-architecture';

// ─── Vulnerability Intelligence (L3 — Threat Intelligence) ───────────────────
export { seedVulnerabilityIntelligence as thesisVulnerabilityIntelligence } from './seed-vulnerability-intelligence';

// ─── Report (L8 — Reporting & Communication) ─────────────────────────────────
export { seedReports as thesisReports } from './seed-reports';

// ─── Decision Records (L10 — Strategy & Governance) ──────────────────────────
export { seedDecisionRecords as thesisDecisionRecords } from './seed-decision-records';

// ─── Simulation Results (L10 — Strategy Simulation) ──────────────────────────
export { seedSimulationResults as thesisSimulationResults } from './seed-simulation-results';

// ─── Mission (L9 — raw seed re-export for pages needing original shape) ──────
export { seedMissions as thesisMissionSeeds } from './seed-missions';

// ─── Evidence (L7 — Case & Remediation) ──────────────────────────────────────
export { seedEvidence as thesisEvidence } from './seed-evidence';

// ─── War Room (L1 — Command & Control) ───────────────────────────────────────
export { seedWarRooms as thesisWarRooms } from './seed-war-rooms';

// ─── Customer (L11 — Control Plane) ──────────────────────────────────────────
export { seedCustomers as thesisCustomers } from './seed-customers';

// ─── Deployment (L11 — Control Plane) ────────────────────────────────────────
export { seedDeployments as thesisDeployments } from './seed-deployments';

// ─── Licence (L11 — Commercial Control Plane) ────────────────────────────────
export { seedLicences as thesisLicences } from './seed-licences';

// ─── Entitlement (L11 — Commercial Control Plane) ────────────────────────────
export { seedEntitlements as thesisEntitlements } from './seed-entitlements';

// ─── Tenant Config (L11 — Platform Administration) ───────────────────────────
export { seedTenantConfigs as thesisTenantConfigs } from './seed-tenant-configs';

// ─── Support Operations (L11 — Control Plane) ────────────────────────────────
export { seedSupportOperations as thesisSupportOperations } from './seed-support-operations';

// ─── Posture Metrics (L5 — Posture Aggregate) ────────────────────────────────
export { seedPostureMetrics as thesisPostureMetrics } from './seed-posture-metrics';

// ─── Posture Accountability (L5 — Dual-Model Posture) ────────────────────────
export { seedPostureAccountability as thesisPostureAccountability } from './seed-posture-accountability';

// ─── CISO Summary (L1 — Executive Surface) ───────────────────────────────────
export { seedCisoSummary as thesisCisoSummary } from './seed-ciso';

// ─── Mission Bindings (L9 — Mission Binding) ─────────────────────────────────
export { seedMissionBindings as thesisMissionBindings } from './seed-mission-bindings';

// ─── Notifications (L8 — Operational Communication) ──────────────────────────
export { seedNotifications as thesisNotifications } from './seed-notifications';

// ─── Auth Sessions (L6 — Identity & Access) ──────────────────────────────────
export { seedAuthSessions as thesisAuthSessions } from './seed-auth-sessions';

// ─── RBAC Policies (L6 — Access Control) ─────────────────────────────────────
export { seedRbacPolicies as thesisRbacPolicies } from './seed-rbac-policies';

// ─── Case Follows (L7 — Case Communication) ──────────────────────────────────
export { seedCaseFollows as thesisCaseFollows } from './seed-case-follows';

// ─── Case Transition Audits (L7 — Case Audit Trail) ──────────────────────────
export { seedCaseTransitionAudits as thesisCaseTransitionAudits } from './seed-case-transition-audits';

// ─── Case Strategy Bindings (L7/L10 — Strategy Binding) ──────────────────────
export { seedCaseStrategyBindings as thesisCaseStrategyBindings } from './seed-case-strategy-bindings';

// ─── Communication Threads (L7 — Case Communication) ─────────────────────────
export { seedCommunicationThreads as thesisCommunicationThreads } from './seed-communication-threads';

// ─── Communication Playbooks (L7 — Communication Excellence) ─────────────────
export { seedCommunicationPlaybooks as thesisCommunicationPlaybooks } from './seed-communication-playbooks';

// ─── Email Communications (L7 — Case Communication) ──────────────────────────
export { seedEmailCommunications as thesisEmailCommunications } from './seed-email-communications';

// ─── Teams Decision Events (L10 — Governance) ────────────────────────────────
export { seedTeamsDecisionEvents as thesisTeamsDecisionEvents } from './seed-teams-decision-events';

// ─── Cloud Security Posture (L5 — Cloud Posture) ─────────────────────────────
export { seedCloudSecurityPosture as thesisCloudSecurityPosture } from './seed-cloud-security-posture';

// ─── Findings (L3 — Detection Output) ────────────────────────────────────────
export { seedFindings as thesisFindings } from './seed-findings';

// ─── Risk Scores (L5 — Risk Scoring) ─────────────────────────────────────────
export { seedRiskScores as thesisRiskScores } from './seed-risk-scores';

// ─── Blast Radius (L5 — Impact Assessment) ───────────────────────────────────
export { seedBlastRadius as thesisBlastRadius } from './seed-blast-radius';

// ─── Search Config (L11 — Platform) ──────────────────────────────────────────
export { seedSearchConfigs as thesisSearchConfigs } from './seed-search-config';

// ─── Break Glass (L6 — Emergency Access) ─────────────────────────────────────
export { seedBreakGlassRequests as thesisBreakGlass } from './seed-break-glass';

// ─── Governed Compose (L7 — Outbound Communication) ──────────────────────────
export { seedGovernedCompose as thesisGovernedCompose } from './seed-governed-compose';

// ─── IOC / Threat Intelligence (L3 — Threat Intel) ───────────────────────────
export { seedIocs as thesisIocs } from './seed-iocs';

// ─── Architecture Intelligence (L4) ──────────────────────────────────────────
export { seedArchitectureIntelligence as thesisArchitectureIntelligence } from './seed-architecture-intelligence';

// ─── Security Tool Intelligence (L2 — Connector Intelligence) ────────────────
export { seedSecurityToolIntelligence as thesisSecurityToolIntelligence } from './seed-security-tool-intelligence';

// ─── Drift Detection (L4 — Configuration Drift) ──────────────────────────────
export { seedDriftDetections as thesisDriftDetection } from './seed-drift-detection';

// ─── Identity Intelligence (L6 — Identity Behaviour) ─────────────────────────
export { seedIdentityIntelligence as thesisIdentityIntelligence } from './seed-identity-intelligence';

// ─── Event Intelligence (L3 — Signal Enrichment) ─────────────────────────────
export { SIGNAL_FIXTURES as thesisEventIntelligence } from './seed-event-intelligence';

// ─── Exposure Engine (L5 — Exposure Computation) ─────────────────────────────
export { seedExposureComputations as thesisExposureEngine } from './seed-exposure-engine';

// ─── Vulnerability Engine (L5 — Vulnerability Computation) ───────────────────
export { seedVulnerabilityCorrelations as thesisVulnerabilityEngine } from './seed-vulnerability-engine';

// ─── Direction Boards (L10 — Strategic Direction) ────────────────────────────
export { seedDirectionBoards as thesisDirectionBoards } from './seed-direction-boards';

// ─── Push Governance (L11 — Governed Push) ───────────────────────────────────
export { seedPushGovernanceRuns as thesisPushGovernance } from './seed-push-governance';

// ─── Tenant (L11 — Tenant Context) ──────────────────────────────────────────
export { SEED_TENANT as thesisTenant, seedId as thesisSeedId } from './seed-tenant';

// ─── Standards Declarations (L10 — Governance) ───────────────────────────────
export { STANDARDS_DECLARATIONS as thesisStandardsDeclarations } from './seed-standards-declarations';

// ─── Asset Authority (L4 — thesis-wrapped assets) ────────────────────────────
export { ASSET_THESIS_FIXTURES as thesisAssetAuthority } from './seed-asset-authority';
