/**
 * Seed Analytics — Commander C2 Test Fixtures
 *
 * Synthetic analytic data conforming to canonical entity shape.
 * Source: COIM v1.0 §4.8; 03_REUSABLE_OBJECT_CATALOGUE.md §2.7
 * Build unit: COIM-E (Analytic Entity)
 *
 * Eight seed analytics covering all 8 analytic types:
 * 1. detection_rule  — SIEM correlation rule detecting brute-force login attempts
 * 2. analytic_rule   — Scheduled query analytic for privilege escalation
 * 3. sigma_rule      — Open Sigma rule for lateral movement detection
 * 4. yara_rule       — YARA pattern for known malware family (file/memory)
 * 5. ml_model        — ML anomaly detection model for user behaviour
 * 6. ueba_model      — UEBA baseline model for identity risk scoring
 * 7. vendor_model    — Vendor proprietary risk scoring model (e.g. CrowdStrike)
 * 8. security_control_analytic — Policy evaluation logic for firewall rule adherence
 *
 * All tenant-scoped, deterministic IDs, source provenance.
 * Mix of active/deprecated/testing states and scored/unscored false-positive rates.
 */

import type { Analytic } from '../entities/analytic';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

export const seedAnalytics: Analytic[] = [
  {
    id: seedId('analytic', 1),
    entity_type: 'analytic',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T08:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-analytic-001', source_system: 'siem-connector' },
    analyticId: 'RULE-SIEM-BruteForceLogin-v2',
    analyticName: 'Brute Force Login Detection',
    analyticType: 'detection_rule',
    version: '2.1.0',
    state: 'active',
    false_positive_rate: 8,
    attacks: [
      { tactic: 'Credential Access', technique: 'T1110', technique_name: 'Brute Force', version: 'v14.1' },
    ],
  },
  {
    id: seedId('analytic', 2),
    entity_type: 'analytic',
    tenant: SEED_TENANT,
    created_at: '2026-01-05T10:00:00.000Z',
    updated_at: '2026-01-15T09:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-analytic-002', source_system: 'siem-connector' },
    analyticId: 'RULE-ANALYTIC-PrivEsc-ScheduledQuery-v1',
    analyticName: 'Privilege Escalation Scheduled Query',
    analyticType: 'analytic_rule',
    version: '1.0.0',
    state: 'active',
    false_positive_rate: 15,
    attacks: [
      { tactic: 'Privilege Escalation', technique: 'T1548', technique_name: 'Abuse Elevation Control Mechanism', version: 'v14.1' },
    ],
  },
  {
    id: seedId('analytic', 3),
    entity_type: 'analytic',
    tenant: SEED_TENANT,
    created_at: '2026-01-08T07:30:00.000Z',
    updated_at: '2026-01-18T05:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-analytic-003', source_system: 'sigma-feed-connector' },
    analyticId: 'SIGMA-LateralMovement-SMB-T1021-v3',
    analyticName: 'Lateral Movement via SMB (Sigma)',
    analyticType: 'sigma_rule',
    version: '3.0.0',
    state: 'active',
    false_positive_rate: 22,
    attacks: [
      { tactic: 'Lateral Movement', technique: 'T1021', technique_name: 'Remote Services', subTechnique: 'T1021.002', subTechniqueName: 'SMB/Windows Admin Shares', version: 'v14.1' },
    ],
  },
  {
    id: seedId('analytic', 4),
    entity_type: 'analytic',
    tenant: SEED_TENANT,
    created_at: '2026-01-12T11:00:00.000Z',
    updated_at: '2026-01-12T11:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-analytic-004', source_system: 'edr-connector' },
    analyticId: 'YARA-Malware-Dropper-FamilyX-v1',
    analyticName: 'Malware Dropper Family X (YARA)',
    analyticType: 'yara_rule',
    version: '1.2.0',
    state: 'active',
    false_positive_rate: 2,
    attacks: [
      { tactic: 'Execution', technique: 'T1204', technique_name: 'User Execution', version: 'v14.1' },
      { tactic: 'Defense Evasion', technique: 'T1036', technique_name: 'Masquerading', version: 'v14.1' },
    ],
  },
  {
    id: seedId('analytic', 5),
    entity_type: 'analytic',
    tenant: SEED_TENANT,
    created_at: '2025-11-01T09:00:00.000Z',
    updated_at: '2026-01-15T08:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-analytic-005', source_system: 'ueba-connector' },
    analyticId: 'ML-UserBehaviourAnomaly-v4',
    analyticName: 'User Behaviour Anomaly Detection (ML)',
    analyticType: 'ml_model',
    version: '4.0.0',
    state: 'active',
    false_positive_rate: 12,
    attacks: [
      { tactic: 'Initial Access', technique: 'T1078', technique_name: 'Valid Accounts', version: 'v14.1' },
    ],
  },
  {
    id: seedId('analytic', 6),
    entity_type: 'analytic',
    tenant: SEED_TENANT,
    created_at: '2025-10-15T09:00:00.000Z',
    updated_at: '2026-01-10T07:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-analytic-006', source_system: 'ueba-connector' },
    analyticId: 'UEBA-IdentityRiskBaseline-v2',
    analyticName: 'Identity Risk Baseline Model (UEBA)',
    analyticType: 'ueba_model',
    version: '2.3.0',
    state: 'active',
    false_positive_rate: 18,
    attacks: undefined,
  },
  {
    id: seedId('analytic', 7),
    entity_type: 'analytic',
    tenant: SEED_TENANT,
    created_at: '2025-12-01T10:00:00.000Z',
    updated_at: '2026-01-01T10:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-analytic-007', source_system: 'crowdstrike-connector' },
    analyticId: 'VENDOR-CS-ZeroDayProtection-v1',
    analyticName: 'CrowdStrike Zero-Day Prevention Model',
    analyticType: 'vendor_model',
    version: '1.0.0',
    state: 'deprecated',
    false_positive_rate: undefined,
    attacks: undefined,
  },
  {
    id: seedId('analytic', 8),
    entity_type: 'analytic',
    tenant: SEED_TENANT,
    created_at: '2026-01-14T14:00:00.000Z',
    updated_at: '2026-01-14T14:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-analytic-008', source_system: 'config-state-connector' },
    analyticId: 'CTRL-FirewallRuleAdherence-CIS-v1',
    analyticName: 'Firewall Rule Adherence (CIS Benchmark)',
    analyticType: 'security_control_analytic',
    version: '1.0.0',
    state: 'testing',
    false_positive_rate: undefined,
    attacks: undefined,
  },
];
