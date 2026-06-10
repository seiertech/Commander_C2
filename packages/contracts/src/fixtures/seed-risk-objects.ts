/**
 * Seed Risk Objects — Commander C2 Test Fixtures
 *
 * Synthetic risk object data conforming to canonical entity shape.
 * Source: Spec #29 Universal Risk Object and Case Binding
 * v1.3.1 lineage closure: coverage_blindspot (Spec #72), ooda_phase_degradation (Spec #58)
 *
 * Three seed risk objects:
 * 1. coverage_blindspot — linked to asset-0003, detected by inverse discovery
 * 2. ooda_phase_degradation — linked to case-0003 P0 case
 * 3. vulnerability_drift — linked to case-0001
 *
 * All tenant-scoped, deterministic IDs, source provenance.
 */

import type { RiskObject } from '../entities/risk-object';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

export const seedRiskObjects: RiskObject[] = [
  {
    id: seedId('risk-object', 1),
    entity_type: 'risk-object',
    tenant: SEED_TENANT,
    created_at: '2026-01-16T09:00:00.000Z',
    updated_at: '2026-01-16T09:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-risk-001', source_system: 'commander-inverse-discovery-loop' },
    type: 'coverage_blindspot',
    affected_entity_id: seedId('asset', 3),
    affected_entity_type: 'asset',
    affected_entities: [seedId('asset', 3)],
    justification: 'Inverse Discovery Loop detected asset-0003 has no scanner coverage for external attack surface. No vulnerability assessment has been performed in 90+ days.',
    owner: 'Security Operations',
    treatment_state: 'open',
    expiry_or_review_trigger: 'Review when scanner coverage is confirmed active for asset-0003 or after 14 days.',
    first_detected_at: '2026-01-16T08:55:00.000Z',
    last_confirmed_at: '2026-01-16T08:55:00.000Z',
    normalised_at: '2026-01-16T09:00:00.000Z',
    source_classification: {
      finding_class: 'detection',
      source_severity: { severity_level: 'medium', severity_id: 3 },
      source_confidence: { confidence_level: 'medium', confidence_score: 60 },
      source_product: {
        vendor: 'Commander',
        name: 'Inverse Discovery Loop',
        connector_class: 'D',
      },
      source_finding_uid: 'idl-coverage-asset-0003-0001',
      source_activity: 'Coverage Assessment',
      attacks: [],
      observables: [],
    },
  },
  {
    id: seedId('risk-object', 2),
    entity_type: 'risk-object',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:15:00.000Z',
    updated_at: '2026-01-18T06:15:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-risk-002', source_system: 'commander-ooda-health-monitor' },
    type: 'ooda_phase_degradation',
    affected_entity_id: seedId('case', 3),
    affected_entity_type: 'case',
    affected_entities: [seedId('case', 3)],
    justification: 'OODA Observe phase health degraded below threshold (< 60%) due to P0 zero-day condition. Decision latency exceeds 4-hour SLA target.',
    owner: 'CISO',
    treatment_state: 'open',
    expiry_or_review_trigger: 'Review when OODA phase health returns above 80% threshold or P0 condition is resolved.',
    first_detected_at: '2026-01-18T06:10:00.000Z',
    last_confirmed_at: '2026-01-18T06:10:00.000Z',
    normalised_at: '2026-01-18T06:15:00.000Z',
    source_classification: {
      finding_class: 'incident',
      source_severity: { severity_level: 'critical', severity_id: 5 },
      source_confidence: { confidence_level: 'high', confidence_score: 90 },
      source_product: {
        vendor: 'Commander',
        name: 'OODA Health Monitor',
        connector_class: 'A',
      },
      source_finding_uid: 'ooda-observe-degraded-case-0003-0001',
      source_activity: 'Posture Measurement',
      attacks: [],
      observables: [],
    },
  },
  {
    id: seedId('risk-object', 3),
    entity_type: 'risk-object',
    tenant: SEED_TENANT,
    created_at: '2026-01-16T08:45:00.000Z',
    updated_at: '2026-01-16T14:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-risk-003', source_system: 'commander-drift-engine' },
    type: 'vulnerability_drift',
    affected_entity_id: seedId('case', 1),
    affected_entity_type: 'case',
    affected_entities: [seedId('case', 1)],
    justification: 'Critical CVE-2026-1234 remains unpatched on PROD-WEB-01 beyond SLA window. Vulnerability drift detected between expected and actual patch state.',
    owner: 'Alice Security-Analyst',
    treatment_state: 'open',
    expiry_or_review_trigger: 'Review when patch is confirmed applied or compensating control is validated.',
    first_detected_at: '2026-01-14T22:30:00.000Z',
    last_confirmed_at: '2026-01-16T08:40:00.000Z',
    normalised_at: '2026-01-16T08:45:00.000Z',
    source_classification: {
      finding_class: 'vulnerability',
      source_severity: { severity_level: 'critical', severity_id: 5 },
      source_confidence: { confidence_level: 'high', confidence_score: 95 },
      source_product: {
        vendor: 'Tenable',
        name: 'Nessus',
        version: '10.7',
        connector_class: 'C',
      },
      source_finding_uid: 'nessus-CVE-2026-1234-prod-web-01',
      source_activity: 'Vulnerability Drift',
      attacks: [
        {
          tactic: 'Initial Access',
          technique: 'T1190',
          technique_name: 'Exploit Public-Facing Application',
          version: 'v14.1',
        },
      ],
      observables: [
        { observable_type: 'hash', value: 'cve-2026-1234' },
      ],
    },
  },
];
