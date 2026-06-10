/**
 * Seed Detonation Verdicts — Deterministic Fixtures
 *
 * Feature: communications-excellence
 * 3 verdicts covering clean/suspicious/malicious outcomes.
 * Connector class A (read-only consumption from SOC tooling).
 * Synthetic data. No real Microsoft Defender verdicts.
 */

import type { DetonationVerdict } from '../entities/detonation-verdict';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

export const seedDetonationVerdicts: DetonationVerdict[] = [
  {
    id: seedId('detverd', 1),
    tenant: SEED_TENANT,
    created_at: '2026-01-16T07:00:00.000Z',
    updated_at: '2026-01-16T07:05:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'microsoft-defender-connector (Mock)' },
    verdict_id: seedId('detverd', 1),
    tenant_id: SEED_TENANT.tenant_id,
    emailMessageId: 'msg-clean-001@acme.example',
    detonationSource: 'microsoft_defender',
    overallVerdict: 'clean',
    checks: [
      { checkType: 'url_detonation', result: 'pass', confidence: 95, detail: 'All URLs resolved to known safe domains (Mock)' },
      { checkType: 'attachment_sandboxing', result: 'pass', confidence: 92, detail: 'PDF attachment clean — no malicious payload (Mock)' },
      { checkType: 'header_anomaly', result: 'pass', confidence: 98, detail: 'SPF/DKIM/DMARC all pass (Mock)' },
    ],
    received_at: '2026-01-16T07:00:00.000Z',
    processed_at: '2026-01-16T07:05:00.000Z',
  },
  {
    id: seedId('detverd', 2),
    tenant: SEED_TENANT,
    created_at: '2026-01-16T08:00:00.000Z',
    updated_at: '2026-01-16T08:10:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'microsoft-defender-connector (Mock)' },
    verdict_id: seedId('detverd', 2),
    tenant_id: SEED_TENANT.tenant_id,
    emailMessageId: 'msg-suspicious-001@acme.example',
    detonationSource: 'microsoft_defender',
    overallVerdict: 'suspicious',
    checks: [
      { checkType: 'url_detonation', result: 'suspicious', confidence: 60, detail: 'URL redirects to newly registered domain (Mock)' },
      { checkType: 'impersonation_scoring', result: 'suspicious', confidence: 55, detail: 'Display name resembles internal executive (Mock)' },
      { checkType: 'header_anomaly', result: 'pass', confidence: 85, detail: 'SPF pass but DMARC relaxed (Mock)' },
      { checkType: 'reply_chain_hijacking', result: 'pass', confidence: 90, detail: 'No reply chain manipulation detected (Mock)' },
    ],
    received_at: '2026-01-16T08:00:00.000Z',
    processed_at: '2026-01-16T08:10:00.000Z',
  },
  {
    id: seedId('detverd', 3),
    tenant: SEED_TENANT,
    created_at: '2026-01-16T09:00:00.000Z',
    updated_at: '2026-01-16T09:08:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'microsoft-defender-connector (Mock)' },
    verdict_id: seedId('detverd', 3),
    tenant_id: SEED_TENANT.tenant_id,
    emailMessageId: 'msg-malicious-001@acme.example',
    detonationSource: 'microsoft_defender',
    overallVerdict: 'malicious',
    checks: [
      { checkType: 'url_detonation', result: 'fail', confidence: 97, detail: 'URL leads to credential harvesting page (Mock)' },
      { checkType: 'attachment_sandboxing', result: 'fail', confidence: 94, detail: 'Macro-enabled document drops stage-2 payload (Mock)' },
      { checkType: 'header_anomaly', result: 'fail', confidence: 88, detail: 'SPF fail — sender domain spoofed (Mock)' },
      { checkType: 'impersonation_scoring', result: 'fail', confidence: 91, detail: 'Exact impersonation of CEO display name (Mock)' },
      { checkType: 'reply_chain_hijacking', result: 'fail', confidence: 85, detail: 'Thread injected into legitimate reply chain (Mock)' },
    ],
    received_at: '2026-01-16T09:00:00.000Z',
    processed_at: '2026-01-16T09:08:00.000Z',
  },
];
