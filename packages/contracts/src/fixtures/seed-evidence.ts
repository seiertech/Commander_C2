/**
 * Seed Evidence — Commander C2 Test Fixtures
 *
 * Synthetic evidence data conforming to canonical entity shape.
 * Source: COIM v1.0 §4.4; 04_EVIDENCE_MODEL.md
 * Build unit: COIM-B (Evidence Entity)
 *
 * Five seed evidence artifacts covering:
 * 1. Vulnerability scan result (bound to case-0001, P0 active exploitation)
 * 2. Network capture (bound to case-0001, corroborating evidence)
 * 3. Configuration snapshot (bound to case-0003, drift evidence)
 * 4. AI analysis (bound to case-0001, Commander AI grounding)
 * 5. Log evidence (bound to case-0002, OODA degradation evidence)
 *
 * All tenant-scoped, deterministic IDs, source provenance.
 * Content stored externally — contentRef is a synthetic S3 URI.
 */

import type { Evidence } from '../entities/evidence';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

export const seedEvidence: Evidence[] = [
  {
    id: seedId('evidence', 1),
    entityType: 'evidence',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T06:05:00.000Z',
    updatedAt: '2026-01-18T06:05:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-evidence-001', sourceSystem: 'tenable-nessus-connector' },
    evidenceType: 'scan',
    evidenceSource: 'connector',
    collectedAt: '2026-01-18T05:55:00.000Z',
    contentRef: 's3://commander-evidence-demo/tenant-001/2026/01/18/scan-CVE-2026-9999-prod-web-01.json',
    immutabilityHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    confidence: 95,
    expiresAt: '2026-01-19T05:55:00.000Z',
    freshnessStatus: 'fresh',
    caseId: seedId('case', 1),
    subActionId: undefined,
    validationDecisionId: undefined,
    riskObjectId: seedId('risk-object', 3),
  },
  {
    id: seedId('evidence', 2),
    entityType: 'evidence',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T06:10:00.000Z',
    updatedAt: '2026-01-18T06:10:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-evidence-002', sourceSystem: 'network-tap-connector' },
    evidenceType: 'network_capture',
    evidenceSource: 'connector',
    collectedAt: '2026-01-18T06:02:00.000Z',
    contentRef: 's3://commander-evidence-demo/tenant-001/2026/01/18/pcap-exploit-attempt-prod-web-01.pcap',
    immutabilityHash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    confidence: 90,
    expiresAt: '2026-01-19T06:02:00.000Z',
    freshnessStatus: 'fresh',
    caseId: seedId('case', 1),
    subActionId: undefined,
    validationDecisionId: undefined,
    riskObjectId: undefined,
  },
  {
    id: seedId('evidence', 3),
    entityType: 'evidence',
    tenant: SEED_TENANT,
    createdAt: '2026-01-17T14:30:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-evidence-003', sourceSystem: 'config-state-connector' },
    evidenceType: 'config',
    evidenceSource: 'connector',
    collectedAt: '2026-01-17T14:25:00.000Z',
    contentRef: 's3://commander-evidence-demo/tenant-001/2026/01/17/config-snapshot-firewall-rule-drift.json',
    immutabilityHash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    confidence: 70,
    expiresAt: '2026-01-20T14:25:00.000Z',
    freshnessStatus: 'aging',
    caseId: seedId('case', 3),
    subActionId: undefined,
    validationDecisionId: undefined,
    riskObjectId: undefined,
  },
  {
    id: seedId('evidence', 4),
    entityType: 'evidence',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T06:20:00.000Z',
    updatedAt: '2026-01-18T06:20:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-evidence-004', sourceSystem: 'commander-ai' },
    evidenceType: 'ai_analysis',
    evidenceSource: 'system',
    collectedAt: '2026-01-18T06:18:00.000Z',
    contentRef: 's3://commander-evidence-demo/tenant-001/2026/01/18/ai-analysis-case-0001-correlation.json',
    immutabilityHash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    confidence: 75,
    expiresAt: '2026-01-19T06:18:00.000Z',
    freshnessStatus: 'fresh',
    caseId: seedId('case', 1),
    subActionId: undefined,
    validationDecisionId: undefined,
    riskObjectId: undefined,
  },
  {
    id: seedId('evidence', 5),
    entityType: 'evidence',
    tenant: SEED_TENANT,
    createdAt: '2026-01-18T06:15:00.000Z',
    updatedAt: '2026-01-18T06:15:00.000Z',
    source: { ...SEED_SOURCE, importRunId: 'run-evidence-005', sourceSystem: 'siem-log-connector' },
    evidenceType: 'log',
    evidenceSource: 'connector',
    collectedAt: '2026-01-18T06:08:00.000Z',
    contentRef: 's3://commander-evidence-demo/tenant-001/2026/01/18/siem-ooda-stall-events.json',
    immutabilityHash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    confidence: 85,
    expiresAt: '2026-01-19T06:08:00.000Z',
    freshnessStatus: 'fresh',
    caseId: seedId('case', 2),
    subActionId: undefined,
    validationDecisionId: undefined,
    riskObjectId: seedId('risk-object', 2),
  },
];
