/**
 * Seed Actions / Sub-Actions — Commander C2 Test Fixtures
 *
 * Synthetic action/sub-action data conforming to canonical entity shape.
 * Source: COIM v1.0 §4.3, §6; 03_REUSABLE_OBJECT_CATALOGUE §2.3; Spec #08
 * Build unit: COIM-H (Action/Sub-Action + D3FEND)
 *
 * Three seed actions bound to case-0001 (P0 active exploitation):
 * 1. Immediate containment (isolate compromised asset)
 * 2. Vulnerability remediation (patch + harden)
 * 3. Detection improvement (post-incident detection enhancement)
 *
 * Sub-actions carry D3FEND tactic classification and countermeasures.
 * All tenant-scoped, deterministic IDs, source provenance.
 */

import type { Action, SubAction } from '../entities/action';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

export const seedActions: Action[] = [
  {
    id: seedId('action', 1),
    entity_type: 'action',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T07:00:00.000Z',
    updated_at: '2026-01-18T08:30:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-action-001', source_system: 'commander-routing-engine' },
    case_id: seedId('case', 1),
    title: 'Immediate Containment — prod-web-01',
    description: 'Isolate compromised asset prod-web-01 from production network to contain active exploitation of CVE-2026-9999.',
    estimated_effort_hours: 2,
    actual_effort_hours: 1.5,
    status: 'completed',
    approvalRef: 'approval-auto-p0-contain-001',
    owner: 'soc-team-alpha',
  },
  {
    id: seedId('action', 2),
    entity_type: 'action',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T08:00:00.000Z',
    updated_at: '2026-01-18T12:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-action-002', source_system: 'commander-routing-engine' },
    case_id: seedId('case', 1),
    title: 'Vulnerability Remediation — CVE-2026-9999',
    description: 'Apply emergency patch for CVE-2026-9999 and harden web server configuration to prevent recurrence.',
    estimated_effort_hours: 6,
    actual_effort_hours: 4,
    status: 'in_progress',
    approvalRef: 'approval-auto-p0-remediate-001',
    owner: 'infra-team-bravo',
  },
  {
    id: seedId('action', 3),
    entity_type: 'action',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T09:00:00.000Z',
    updated_at: '2026-01-18T09:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-action-003', source_system: 'commander-routing-engine' },
    case_id: seedId('case', 1),
    title: 'Detection Enhancement — Post-Incident',
    description: 'Improve detection coverage for exploitation patterns similar to CVE-2026-9999 lateral movement.',
    estimated_effort_hours: 4,
    actual_effort_hours: 0,
    status: 'planned',
    approvalRef: 'approval-auto-p0-detect-001',
    owner: 'detection-engineering',
  },
];

export const seedSubActions: SubAction[] = [
  // ─── Action 1: Containment sub-actions ──────────────────────────────────────
  {
    id: seedId('sub-action', 1),
    entity_type: 'sub_action',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T07:05:00.000Z',
    updated_at: '2026-01-18T07:35:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-subaction-001', source_system: 'commander-routing-engine' },
    action_id: seedId('action', 1),
    case_id: seedId('case', 1),
    targetEntity: seedId('asset', 1),
    targetEntityType: 'asset',
    executionMethod: 'network-isolation-vlan-quarantine',
    outcomeClassification: 'successful',
    estimated_effort_hours: 1,
    actual_effort_hours: 0.5,
    approvalRef: 'approval-auto-p0-contain-001-sub1',
    owner: 'soc-team-alpha',
    sequence_order: 1,
    tactic_type: 'isolate',
    countermeasures: [
      { technique_id: 'D3-NI', technique_name: 'Network Isolation', artifactRef: 'D3FEND-v0.15.0' },
      { technique_id: 'D3-OTF', technique_name: 'Outbound Traffic Filtering', artifactRef: 'D3FEND-v0.15.0' },
    ],
  },
  {
    id: seedId('sub-action', 2),
    entity_type: 'sub_action',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T07:40:00.000Z',
    updated_at: '2026-01-18T08:10:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-subaction-002', source_system: 'commander-routing-engine' },
    action_id: seedId('action', 1),
    case_id: seedId('case', 1),
    targetEntity: seedId('asset', 1),
    targetEntityType: 'asset',
    executionMethod: 'process-termination-malicious-pid',
    outcomeClassification: 'successful',
    estimated_effort_hours: 1,
    actual_effort_hours: 1,
    approvalRef: 'approval-auto-p0-contain-001-sub2',
    owner: 'soc-team-alpha',
    sequence_order: 2,
    tactic_type: 'evict',
    countermeasures: [
      { technique_id: 'D3-PT', technique_name: 'Process Termination', artifactRef: 'D3FEND-v0.15.0' },
    ],
  },

  // ─── Action 2: Remediation sub-actions ──────────────────────────────────────
  {
    id: seedId('sub-action', 3),
    entity_type: 'sub_action',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T08:30:00.000Z',
    updated_at: '2026-01-18T10:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-subaction-003', source_system: 'commander-routing-engine' },
    action_id: seedId('action', 2),
    case_id: seedId('case', 1),
    targetEntity: seedId('asset', 1),
    targetEntityType: 'asset',
    executionMethod: 'emergency-patch-application',
    outcomeClassification: 'successful',
    estimated_effort_hours: 3,
    actual_effort_hours: 2,
    approvalRef: 'approval-auto-p0-remediate-001-sub1',
    owner: 'infra-team-bravo',
    sequence_order: 1,
    tactic_type: 'restore',
    countermeasures: [
      { technique_id: 'D3-SU', technique_name: 'Software Update', artifactRef: 'D3FEND-v0.15.0' },
      { technique_id: 'D3-FV', technique_name: 'File Verification', artifactRef: 'D3FEND-v0.15.0' },
    ],
  },
  {
    id: seedId('sub-action', 4),
    entity_type: 'sub_action',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T10:00:00.000Z',
    updated_at: '2026-01-18T12:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-subaction-004', source_system: 'commander-routing-engine' },
    action_id: seedId('action', 2),
    case_id: seedId('case', 1),
    targetEntity: seedId('asset', 1),
    targetEntityType: 'asset',
    executionMethod: 'configuration-hardening-web-server',
    outcomeClassification: 'partial',
    estimated_effort_hours: 3,
    actual_effort_hours: 2,
    approvalRef: 'approval-auto-p0-remediate-001-sub2',
    owner: 'infra-team-bravo',
    sequence_order: 2,
    tactic_type: 'harden',
    countermeasures: [
      { technique_id: 'D3-ACL', technique_name: 'Access Control List', artifactRef: 'D3FEND-v0.15.0' },
      { technique_id: 'D3-SSCH', technique_name: 'System Configuration Hardening' },
    ],
  },

  // ─── Action 3: Detection enhancement sub-actions ────────────────────────────
  {
    id: seedId('sub-action', 5),
    entity_type: 'sub_action',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T09:05:00.000Z',
    updated_at: '2026-01-18T09:05:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-subaction-005', source_system: 'commander-routing-engine' },
    action_id: seedId('action', 3),
    case_id: seedId('case', 1),
    targetEntity: 'detection-rule-set-web-exploit',
    targetEntityType: 'analytic',
    executionMethod: 'detection-rule-creation',
    outcomeClassification: 'pending',
    estimated_effort_hours: 4,
    actual_effort_hours: 0,
    approvalRef: 'approval-auto-p0-detect-001-sub1',
    owner: 'detection-engineering',
    sequence_order: 1,
    tactic_type: 'detect',
    countermeasures: [
      { technique_id: 'D3-DA', technique_name: 'Dynamic Analysis', artifactRef: 'D3FEND-v0.15.0' },
      { technique_id: 'D3-NTA', technique_name: 'Network Traffic Analysis', artifactRef: 'D3FEND-v0.15.0' },
      { technique_id: 'D3-PA', technique_name: 'Process Analysis', artifactRef: 'D3FEND-v0.15.0' },
    ],
  },
];
