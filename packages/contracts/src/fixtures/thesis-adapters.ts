/**
 * Thesis Adapters — Commander C2 Phase 3
 *
 * Transform existing SDR fixture data into thesis-canonical entity shapes.
 * This allows UI pages to consume thesis entities immediately while the
 * full fixture rewrite (Phase 4) happens separately.
 *
 * Pattern: SDR fixture → thesis-shaped export
 * Convention: snake_case fields, standard_marker present
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
