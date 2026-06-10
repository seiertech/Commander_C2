/**
 * Mock Connectors — Commander SDR (Unit 38, Connector Layer)
 *
 * Source: Spec #61 Universal Security Signal Connector Contract.
 * Builds on Unit 4 (Connector Layer Foundation) contracts and resolvers.
 *
 * Provides deterministic, repeatable mock connectors for all four connector
 * classes (A/B/C/D) to support local-first development. No live vendor calls,
 * no credentials — synthetic data only (security-and-testing doctrine).
 *
 * Class taxonomy (Spec #61):
 *   A — SOC Telemetry        (SIEM, XDR, NDR)
 *   B — Operational Verdict  (email security, endpoint adherence, web filtering, identity policy, DLP)
 *   C — Configuration State  (intended state of controls, assets, identities, policies)
 *   D — Threat Intelligence  (CVE, KEV, IOC streams)
 */

import type { Connector } from '../../contracts/src/entities/connector';
import { SEED_TENANT, seedId } from '../../contracts/src/fixtures/seed-tenant';

/** Deterministic timestamp base for repeatable mock connectors. */
const MOCK_EPOCH = '2026-01-15T09:00:00.000Z';

function mockConnector(
  index: number,
  name: string,
  classes: Connector['classes'],
  sourceType: string,
  tier: Connector['tier'] = 'core',
): Connector {
  const id = seedId('mock-connector', index);
  return {
    id,
    entityType: 'connector',
    tenant: SEED_TENANT,
    createdAt: MOCK_EPOCH,
    updatedAt: MOCK_EPOCH,
    source: {
      connectorId: id,
      importRunId: `mock-run-${String(index).padStart(4, '0')}`,
      sourceSystem: sourceType,
      sourceTimestamp: MOCK_EPOCH,
    },
    name,
    classes,
    sourceType,
    tier,
    state: 'active',
    lastRunAt: MOCK_EPOCH,
    lastRunStatus: 'success',
    mappingPackVersion: '1.0.0',
  };
}

/** Mock Class A connectors — SOC Telemetry (SIEM, XDR, NDR). */
export const MOCK_CLASS_A_CONNECTORS: Connector[] = [
  mockConnector(1, 'Mock SIEM (Splunk-style)', ['A'], 'mock-siem'),
  mockConnector(2, 'Mock XDR (CrowdStrike-style)', ['A', 'B'], 'mock-xdr'),
  mockConnector(3, 'Mock NDR (Darktrace-style)', ['A'], 'mock-ndr', 'extended'),
];

/** Mock Class B connectors — Operational Verdict. */
export const MOCK_CLASS_B_CONNECTORS: Connector[] = [
  mockConnector(4, 'Mock Email Security (Proofpoint-style)', ['B'], 'mock-email-security'),
  mockConnector(5, 'Mock Endpoint Adherence (Intune-style)', ['B', 'C'], 'mock-endpoint-adherence'),
  mockConnector(6, 'Mock Web Filtering (Zscaler-style)', ['B'], 'mock-web-filtering', 'extended'),
  mockConnector(7, 'Mock Identity Policy (Okta-style)', ['B'], 'mock-identity-policy'),
  mockConnector(8, 'Mock DLP (Forcepoint-style)', ['B'], 'mock-dlp', 'extended'),
];

/** Mock Class C connectors — Configuration State. */
export const MOCK_CLASS_C_CONNECTORS: Connector[] = [
  mockConnector(9, 'Mock Cloud Config (AWS Config-style)', ['C'], 'mock-cloud-config'),
  mockConnector(10, 'Mock Identity Config (Entra-style)', ['C'], 'mock-identity-config'),
  mockConnector(11, 'Mock Policy Config (Commander-baseline)', ['C'], 'mock-policy-config'),
];

/** Mock Class D connectors — Threat Intelligence (CVE, KEV, IOC). */
export const MOCK_CLASS_D_CONNECTORS: Connector[] = [
  mockConnector(12, 'Mock CVE Feed (NVD-style)', ['D'], 'mock-cve-feed'),
  mockConnector(13, 'Mock KEV Feed (CISA-style)', ['D'], 'mock-kev-feed'),
  mockConnector(14, 'Mock IOC Feed (Recorded Future-style)', ['D'], 'mock-ioc-feed', 'extended'),
];

/** All mock connectors across all four classes. */
export const ALL_MOCK_CONNECTORS: Connector[] = [
  ...MOCK_CLASS_A_CONNECTORS,
  ...MOCK_CLASS_B_CONNECTORS,
  ...MOCK_CLASS_C_CONNECTORS,
  ...MOCK_CLASS_D_CONNECTORS,
];

/** Look up mock connectors that declare a given class. */
export function mockConnectorsForClass(cls: Connector['classes'][number]): Connector[] {
  return ALL_MOCK_CONNECTORS.filter((c) => c.classes.includes(cls));
}
