/**
 * Seed Observables — Commander C2 Test Fixtures
 *
 * Synthetic observable data conforming to canonical entity shape.
 * Source: COIM v1.0 §4.5; 03_REUSABLE_OBJECT_CATALOGUE.md §2.5
 * Build unit: COIM-D (Observable Entity)
 *
 * Eight seed observables covering all 8 observable types:
 * 1. IP address (malicious C2 server — bound to case-0001 risk objects)
 * 2. Domain (phishing domain — bound to case-0001)
 * 3. Hash (malware SHA-256 — bound to case-0001)
 * 4. URL (exploit kit landing page — bound to case-0002)
 * 5. Email (spear-phishing sender — bound to case-0002)
 * 6. Certificate (expired/revoked TLS cert — bound to case-0003)
 * 7. Process (suspicious process name — bound to case-0001)
 * 8. File (malicious file path — bound to case-0002)
 *
 * All tenant-scoped, deterministic IDs, source provenance.
 * Reputation scores vary: some enriched, some not yet scored.
 */

import type { Observable, ObservableRiskObjectBinding } from '../entities/observable';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

export const seedObservables: Observable[] = [
  {
    id: seedId('observable', 1),
    entity_type: 'observable',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:00:00.000Z',
    updated_at: '2026-01-18T06:00:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-observable-001', source_system: 'threat-intel-connector' },
    observable_type: 'ip',
    value: '198.51.100.42',
    firstSeen: '2026-01-17T14:30:00.000Z',
    lastSeen: '2026-01-18T05:55:00.000Z',
    reputation: 15,
  },
  {
    id: seedId('observable', 2),
    entity_type: 'observable',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:01:00.000Z',
    updated_at: '2026-01-18T06:01:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-observable-002', source_system: 'threat-intel-connector' },
    observable_type: 'domain',
    value: 'malicious-phish.example.net',
    firstSeen: '2026-01-16T09:00:00.000Z',
    lastSeen: '2026-01-18T05:50:00.000Z',
    reputation: 8,
  },
  {
    id: seedId('observable', 3),
    entity_type: 'observable',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:02:00.000Z',
    updated_at: '2026-01-18T06:02:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-observable-003', source_system: 'edr-connector' },
    observable_type: 'hash',
    value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    firstSeen: '2026-01-18T04:20:00.000Z',
    lastSeen: '2026-01-18T04:20:00.000Z',
    reputation: 5,
  },
  {
    id: seedId('observable', 4),
    entity_type: 'observable',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:03:00.000Z',
    updated_at: '2026-01-18T06:03:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-observable-004', source_system: 'web-proxy-connector' },
    observable_type: 'url',
    value: 'https://exploit-kit.example.com/landing/payload.js',
    firstSeen: '2026-01-17T22:15:00.000Z',
    lastSeen: '2026-01-18T01:30:00.000Z',
    reputation: 3,
  },
  {
    id: seedId('observable', 5),
    entity_type: 'observable',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:04:00.000Z',
    updated_at: '2026-01-18T06:04:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-observable-005', source_system: 'email-gateway-connector' },
    observable_type: 'email',
    value: 'attacker@spear-phish.example.org',
    firstSeen: '2026-01-15T11:00:00.000Z',
    lastSeen: '2026-01-18T03:45:00.000Z',
    reputation: 10,
  },
  {
    id: seedId('observable', 6),
    entity_type: 'observable',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:05:00.000Z',
    updated_at: '2026-01-18T06:05:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-observable-006', source_system: 'config-state-connector' },
    observable_type: 'certificate',
    value: 'CN=expired.internal.acme.corp,O=Acme Corp,serial=0A:1B:2C:3D',
    firstSeen: '2026-01-10T08:00:00.000Z',
    lastSeen: '2026-01-18T06:00:00.000Z',
    reputation: undefined,
  },
  {
    id: seedId('observable', 7),
    entity_type: 'observable',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:06:00.000Z',
    updated_at: '2026-01-18T06:06:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-observable-007', source_system: 'edr-connector' },
    observable_type: 'process',
    value: 'svchost-update.exe',
    firstSeen: '2026-01-18T03:10:00.000Z',
    lastSeen: '2026-01-18T05:45:00.000Z',
    reputation: 12,
  },
  {
    id: seedId('observable', 8),
    entity_type: 'observable',
    tenant: SEED_TENANT,
    created_at: '2026-01-18T06:07:00.000Z',
    updated_at: '2026-01-18T06:07:00.000Z',
    source: { ...SEED_SOURCE, import_run_id: 'run-observable-008', source_system: 'edr-connector' },
    observable_type: 'file',
    value: 'C:\\Windows\\Temp\\payload_dropper.dll',
    firstSeen: '2026-01-18T03:12:00.000Z',
    lastSeen: '2026-01-18T03:12:00.000Z',
    reputation: 2,
  },
];

/**
 * Seed observable-to-risk-object bindings.
 * Demonstrates many-to-many deduplication: one observable bound to multiple risk objects.
 */
export const seedObservableBindings: ObservableRiskObjectBinding[] = [
  {
    observableId: seedId('observable', 1),
    risk_object_id: seedId('risk-object', 1),
    bound_at: '2026-01-18T06:00:00.000Z',
  },
  {
    observableId: seedId('observable', 1),
    risk_object_id: seedId('risk-object', 3),
    bound_at: '2026-01-18T06:00:00.000Z',
  },
  {
    observableId: seedId('observable', 2),
    risk_object_id: seedId('risk-object', 1),
    bound_at: '2026-01-18T06:01:00.000Z',
  },
  {
    observableId: seedId('observable', 3),
    risk_object_id: seedId('risk-object', 3),
    bound_at: '2026-01-18T06:02:00.000Z',
  },
  {
    observableId: seedId('observable', 4),
    risk_object_id: seedId('risk-object', 2),
    bound_at: '2026-01-18T06:03:00.000Z',
  },
  {
    observableId: seedId('observable', 5),
    risk_object_id: seedId('risk-object', 2),
    bound_at: '2026-01-18T06:04:00.000Z',
  },
  {
    observableId: seedId('observable', 6),
    risk_object_id: seedId('risk-object', 3),
    bound_at: '2026-01-18T06:05:00.000Z',
  },
  {
    observableId: seedId('observable', 7),
    risk_object_id: seedId('risk-object', 1),
    bound_at: '2026-01-18T06:06:00.000Z',
  },
  {
    observableId: seedId('observable', 8),
    risk_object_id: seedId('risk-object', 2),
    bound_at: '2026-01-18T06:07:00.000Z',
  },
];
