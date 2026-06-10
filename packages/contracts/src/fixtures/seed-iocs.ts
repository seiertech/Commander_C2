/**
 * Seed Indicators of Compromise — Deterministic Fixtures
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 20.4, 21.6, 26.5, 6.2
 *
 * Covers all 26 IOC categories. Synthetic .example domains, (Mock) markers.
 */

import type { IndicatorOfCompromise } from '../entities/indicator-of-compromise';
import { IOC_CATEGORIES, TLP_MARKINGS } from '../entities/intelligence-common';
import { seedId, SEED_SOURCE } from './seed-tenant';

const ADMIN_TENANT = { tenant_id: 'admin-tenant-001', tenant_name: 'Commander Admin (Mock)' };

const SAMPLE_VALUES: Record<string, string> = {
  file_hash_md5: 'd41d8cd98f00b204e9800998ecf8427e',
  file_hash_sha1: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
  file_hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  file_path: 'C:\\Windows\\Temp\\malware.example.exe',
  domain: 'malicious.example.com',
  fqdn: 'c2.malicious.example.com',
  url: 'https://phish.example.com/login',
  ip_address: '192.0.2.100',
  cidr_range: '198.51.100.0/24',
  email_address: 'attacker@phish.example.com',
  email_subject: 'Urgent: Account Verification (Mock)',
  sender_domain: 'spoofed.example.com',
  registry_key: 'HKLM\\SOFTWARE\\MalwareExample\\Run',
  process_name: 'malware_mock.exe',
  mutex: 'Global\\MockMalwareMutex_001',
  certificate_thumbprint: 'A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
  user_agent: 'Mozilla/5.0 (Mock Malware Bot/1.0)',
  yara_rule: 'rule MockMalware { condition: true }',
  sigma_rule: 'title: Mock Detection Rule (Example)',
  snort_suricata_rule: 'alert tcp any any -> any any (msg:"Mock Rule"; sid:1000001;)',
  cloud_resource_id: 'arn:aws:s3:::mock-bucket.example',
  azure_ad_object_id: '00000000-0000-0000-0000-000000000001',
  aws_account_id: '123456789012',
  container_image: 'registry.example.com/mock-image:latest',
  package_name: 'mock-malicious-package@1.0.0',
  other: 'custom-indicator-value-mock-001',
};

export const seedIocs: IndicatorOfCompromise[] = IOC_CATEGORIES.map((category, index) => ({
  id: seedId('ioc', index + 1),
  tenant: ADMIN_TENANT,
  created_at: '2026-01-15T09:00:00.000Z',
  updated_at: '2026-01-15T09:00:00.000Z',
  source: SEED_SOURCE,
  ioc_category: category,
  value: SAMPLE_VALUES[category] ?? `unknown-${category}-mock`,
  normalisedValue: (SAMPLE_VALUES[category] ?? `unknown-${category}-mock`).toLowerCase(),
  originalRawValue: SAMPLE_VALUES[category] ?? `unknown-${category}-mock`,
  confidence: 70 + (index % 30),
  severity: (index % 5) + 1,
  tlpMarking: TLP_MARKINGS[index % TLP_MARKINGS.length],
  expires_at: null,
  sourceAttribution: [{
    source_id: seedId('pis', 1),
    reportedConfidence: 70 + (index % 30),
    reportedSeverity: (index % 5) + 1,
    originalRawValue: SAMPLE_VALUES[category] ?? `unknown-${category}-mock`,
    first_seen_at: '2026-01-10T00:00:00.000Z',
    last_seen_at: '2026-01-15T00:00:00.000Z',
  }],
  first_seen_at: '2026-01-10T00:00:00.000Z',
  last_seen_at: '2026-01-15T00:00:00.000Z',
  active: true,
}));
