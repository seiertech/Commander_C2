/**
 * Seed Identity Intelligence — Commander C2 Test Fixtures
 *
 * Synthetic identity intelligence records for engine surfaces.
 * 4 records covering access anomaly, privilege escalation, dormant account and impossible travel.
 * Source: Spec #59 Intelligence Layer Architecture §Internal Behavioural Stream
 */

import type { IdentityIntelligence } from '../entities/identity-intelligence-engine';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, source_system: 'commander-engine-layer' };

export const seedIdentityIntelligence: IdentityIntelligence[] = [
  {
    id: seedId('id-intel', 1),
    entity_type: 'identity-intelligence',
    tenant: SEED_TENANT,
    created_at: '2026-01-15T09:30:00.000Z',
    updated_at: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-identity-001',
    identityRef: 'identity-0001',
    signalType: 'access_anomaly',
    risk_score: 72,
    confidence: 0.85,
    detected_at: '2026-01-15T09:30:00.000Z',
    context: { sourceIp: '198.51.100.42', resource: 'finance-sharepoint', timeOfDay: '03:14 UTC' },
    baselineBehaviour: 'User accesses finance resources during business hours (08:00-18:00 UTC) from corporate IP range',
    observedBehaviour: 'Access to finance-sharepoint at 03:14 UTC from external IP 198.51.100.42',
    recommendedAction: 'Require step-up MFA and notify user manager for verification',
  },
  {
    id: seedId('id-intel', 2),
    entity_type: 'identity-intelligence',
    tenant: SEED_TENANT,
    created_at: '2026-01-16T11:00:00.000Z',
    updated_at: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-identity-001',
    identityRef: 'identity-0003',
    signalType: 'privilege_escalation',
    risk_score: 91,
    confidence: 0.95,
    detected_at: '2026-01-16T11:00:00.000Z',
    context: { previousRole: 'Viewer', newRole: 'Global Admin', changedBy: 'svc-automation-001' },
    baselineBehaviour: 'Service account maintains Viewer role with no elevation history',
    observedBehaviour: 'Elevation to Global Admin via svc-automation-001 without change ticket',
    recommendedAction: 'Immediately revoke Global Admin and investigate automation pipeline credentials',
  },
  {
    id: seedId('id-intel', 3),
    entity_type: 'identity-intelligence',
    tenant: SEED_TENANT,
    created_at: '2026-01-14T06:00:00.000Z',
    updated_at: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-identity-001',
    identityRef: 'identity-0005',
    signalType: 'dormant_account',
    risk_score: 45,
    confidence: 0.99,
    detected_at: '2026-01-14T06:00:00.000Z',
    context: { lastLoginDays: '187', account_type: 'user', department: 'marketing' },
    baselineBehaviour: 'Active accounts authenticate at least once every 30 days',
    observedBehaviour: 'No authentication event for 187 days; account retains access to marketing assets',
    recommendedAction: 'Disable account and initiate offboarding review with HR',
  },
  {
    id: seedId('id-intel', 4),
    entity_type: 'identity-intelligence',
    tenant: SEED_TENANT,
    created_at: '2026-01-17T15:45:00.000Z',
    updated_at: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    engine_id: 'engine-identity-001',
    identityRef: 'identity-0002',
    signalType: 'impossible_travel',
    risk_score: 88,
    confidence: 0.78,
    detected_at: '2026-01-17T15:45:00.000Z',
    context: { locationA: 'London, UK', locationB: 'Tokyo, JP', timeDeltaMinutes: '47' },
    baselineBehaviour: 'User authenticates from single geographic region per session window',
    observedBehaviour: 'Authentication from London then Tokyo within 47 minutes — physically impossible travel',
    recommendedAction: 'Terminate active sessions and force credential reset',
  },
];
