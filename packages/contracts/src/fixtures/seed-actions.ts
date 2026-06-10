/**
 * Seed Actions / Sub-Actions — Commander SDR Test Fixtures
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
    entityType: 'action',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T07:00:00.000Z',
    updatedAt: '2026-01-18T08:30:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-action-001', sourceSystem: 'commander-routing-engine' },
    caseId: seedId('case', 1),
    title: 'Immediate Containment — prod-web-01',
    description: 'Isolate compromised asset prod-web-01 from production network to contain active exploitation of CVE-2026-9999.',
    estimatedEffortHours: 2,
    actualEffortHours: 1.5,
    status: 'completed',
    approvalRef: 'approval-auto-p0-contain-001',
    owner: 'soc-team-alpha',
  },
  {
    id: seedId('action', 2),
    entityType: 'action',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T08:00:00.000Z',
    updatedAt: '2026-01-18T12:00:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-action-002', sourceSystem: 'commander-routing-engine' },
    caseId: seedId('case', 1),
    title: 'Vulnerability Remediation — CVE-2026-9999',
    description: 'Apply emergency patch for CVE-2026-9999 and harden web server configuration to prevent recurrence.',
    estimatedEffortHours: 6,
    actualEffortHours: 4,
    status: 'in_progress',
    approvalRef: 'approval-auto-p0-remediate-001',
    owner: 'infra-team-bravo',
  },
  {
    id: seedId('action', 3),
    entityType: 'action',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T09:00:00.000Z',
    updatedAt: '2026-01-18T09:00:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-action-003', sourceSystem: 'commander-routing-engine' },
    caseId: seedId('case', 1),
    title: 'Detection Enhancement — Post-Incident',
    description: 'Improve detection coverage for exploitation patterns similar to CVE-2026-9999 lateral movement.',
    estimatedEffortHours: 4,
    actualEffortHours: 0,
    status: 'planned',
    approvalRef: 'approval-auto-p0-detect-001',
    owner: 'detection-engineering',
  },
];

export const seedSubActions: SubAction[] = [
  // ─── Action 1: Containment sub-actions ──────────────────────────────────────
  {
    id: seedId('sub-action', 1),
    entityType: 'sub_action',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T07:05:00.000Z',
    updatedAt: '2026-01-18T07:35:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-subaction-001', sourceSystem: 'commander-routing-engine' },
    actionId: seedId('action', 1),
    caseId: seedId('case', 1),
    targetEntity: seedId('asset', 1),
    targetEntityType: 'asset',
    executionMethod: 'network-isolation-vlan-quarantine',
    outcomeClassification: 'successful',
    estimatedEffortHours: 1,
    actualEffortHours: 0.5,
    approvalRef: 'approval-auto-p0-contain-001-sub1',
    owner: 'soc-team-alpha',
    sequenceOrder: 1,
    tacticType: 'isolate',
    countermeasures: [
      { techniqueId: 'D3-NI', techniqueName: 'Network Isolation', artifactRef: 'D3FEND-v0.15.0' },
      { techniqueId: 'D3-OTF', techniqueName: 'Outbound Traffic Filtering', artifactRef: 'D3FEND-v0.15.0' },
    ],
  },
  {
    id: seedId('sub-action', 2),
    entityType: 'sub_action',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T07:40:00.000Z',
    updatedAt: '2026-01-18T08:10:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-subaction-002', sourceSystem: 'commander-routing-engine' },
    actionId: seedId('action', 1),
    caseId: seedId('case', 1),
    targetEntity: seedId('asset', 1),
    targetEntityType: 'asset',
    executionMethod: 'process-termination-malicious-pid',
    outcomeClassification: 'successful',
    estimatedEffortHours: 1,
    actualEffortHours: 1,
    approvalRef: 'approval-auto-p0-contain-001-sub2',
    owner: 'soc-team-alpha',
    sequenceOrder: 2,
    tacticType: 'evict',
    countermeasures: [
      { techniqueId: 'D3-PT', techniqueName: 'Process Termination', artifactRef: 'D3FEND-v0.15.0' },
    ],
  },

  // ─── Action 2: Remediation sub-actions ──────────────────────────────────────
  {
    id: seedId('sub-action', 3),
    entityType: 'sub_action',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T08:30:00.000Z',
    updatedAt: '2026-01-18T10:00:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-subaction-003', sourceSystem: 'commander-routing-engine' },
    actionId: seedId('action', 2),
    caseId: seedId('case', 1),
    targetEntity: seedId('asset', 1),
    targetEntityType: 'asset',
    executionMethod: 'emergency-patch-application',
    outcomeClassification: 'successful',
    estimatedEffortHours: 3,
    actualEffortHours: 2,
    approvalRef: 'approval-auto-p0-remediate-001-sub1',
    owner: 'infra-team-bravo',
    sequenceOrder: 1,
    tacticType: 'restore',
    countermeasures: [
      { techniqueId: 'D3-SU', techniqueName: 'Software Update', artifactRef: 'D3FEND-v0.15.0' },
      { techniqueId: 'D3-FV', techniqueName: 'File Verification', artifactRef: 'D3FEND-v0.15.0' },
    ],
  },
  {
    id: seedId('sub-action', 4),
    entityType: 'sub_action',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T10:00:00.000Z',
    updatedAt: '2026-01-18T12:00:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-subaction-004', sourceSystem: 'commander-routing-engine' },
    actionId: seedId('action', 2),
    caseId: seedId('case', 1),
    targetEntity: seedId('asset', 1),
    targetEntityType: 'asset',
    executionMethod: 'configuration-hardening-web-server',
    outcomeClassification: 'partial',
    estimatedEffortHours: 3,
    actualEffortHours: 2,
    approvalRef: 'approval-auto-p0-remediate-001-sub2',
    owner: 'infra-team-bravo',
    sequenceOrder: 2,
    tacticType: 'harden',
    countermeasures: [
      { techniqueId: 'D3-ACL', techniqueName: 'Access Control List', artifactRef: 'D3FEND-v0.15.0' },
      { techniqueId: 'D3-SSCH', techniqueName: 'System Configuration Hardening' },
    ],
  },

  // ─── Action 3: Detection enhancement sub-actions ────────────────────────────
  {
    id: seedId('sub-action', 5),
    entityType: 'sub_action',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T09:05:00.000Z',
    updatedAt: '2026-01-18T09:05:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-subaction-005', sourceSystem: 'commander-routing-engine' },
    actionId: seedId('action', 3),
    caseId: seedId('case', 1),
    targetEntity: 'detection-rule-set-web-exploit',
    targetEntityType: 'analytic',
    executionMethod: 'detection-rule-creation',
    outcomeClassification: 'pending',
    estimatedEffortHours: 4,
    actualEffortHours: 0,
    approvalRef: 'approval-auto-p0-detect-001-sub1',
    owner: 'detection-engineering',
    sequenceOrder: 1,
    tacticType: 'detect',
    countermeasures: [
      { techniqueId: 'D3-DA', techniqueName: 'Dynamic Analysis', artifactRef: 'D3FEND-v0.15.0' },
      { techniqueId: 'D3-NTA', techniqueName: 'Network Traffic Analysis', artifactRef: 'D3FEND-v0.15.0' },
      { techniqueId: 'D3-PA', techniqueName: 'Process Analysis', artifactRef: 'D3FEND-v0.15.0' },
    ],
  },
];
