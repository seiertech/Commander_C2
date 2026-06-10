/**
 * Seed Inbound Email Submissions — Deterministic Fixtures
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 20.4, 21.6, 26.5, 24.1, 24.4
 *
 * 2 inbound email submission value objects. Modelled only, no mailbox client.
 * Synthetic data, .example domains, (Mock) markers.
 */

import type { InboundEmailSubmission } from '../entities/inbound-email-submission';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

export const seedInboundEmailSubmissions: InboundEmailSubmission[] = [
  {
    id: seedId('ies', 1),
    tenant: SEED_TENANT,
    created_at: '2026-01-15T09:00:00.000Z',
    updated_at: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    sender_address: 'threat-intel@partner-org.example.com',
    sourceOrganisation: 'Partner SOC Team (Mock)',
    receivedTimestamp: '2026-01-15T08:30:00.000Z',
    attachmentReferences: ['attachment-ref-mock-001.csv'],
    parsedIocValues: [
      { value: 'malicious-c2.example.com', detectedCategory: 'domain', parserConfidence: 92 },
      { value: '198.51.100.55', detectedCategory: 'ip_address', parserConfidence: 88 },
      { value: 'e3b0c44298fc1c149afbf4c8996fb924', detectedCategory: 'file_hash_md5', parserConfidence: 75 },
    ],
    rawBodyReference: 'raw-email-body-ref-mock-001',
    submissionMetadata: { forwardedBy: 'analyst-mock-001', urgency: 'high' },
  },
  {
    id: seedId('ies', 2),
    tenant: SEED_TENANT,
    created_at: '2026-01-15T09:00:00.000Z',
    updated_at: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    sender_address: 'vendor-alerts@vendor-d.example.com',
    sourceOrganisation: 'Vendor D Security Response (Mock)',
    receivedTimestamp: '2026-01-15T07:45:00.000Z',
    attachmentReferences: [],
    parsedIocValues: [
      { value: 'https://phishing-landing.example.com/collect', detectedCategory: 'url', parserConfidence: 95 },
      { value: 'spoofed-sender.example.com', detectedCategory: 'sender_domain', parserConfidence: 80 },
    ],
    rawBodyReference: 'raw-email-body-ref-mock-002',
    submissionMetadata: { autoForwarded: true },
  },
];
