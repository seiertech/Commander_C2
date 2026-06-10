/**
 * Seed Pre-Warned Classifications — Commander C2 Test Fixtures
 *
 * 4 classification records representing combined signal analysis from Units 24-28.
 * Source: Spec #17 Closed-Loop Control Architecture
 */

import type { PreWarnedClassification } from '../entities/pre-warned-classification';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, source_system: 'commander-pre-warned-engine' };

export const seedPreWarnedClassifications: PreWarnedClassification[] = [
  {
    id: seedId('pwc', 1), entity_type: 'pre-warned-classification', tenant: SEED_TENANT,
    created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: ENGINE_SOURCE,
    classification_id: 'PWC-2026-001',
    triggerSources: [seedId('drift', 2), seedId('vuln-corr', 1), seedId('exposure-comp', 1)],
    classificationLevel: 'critical',
    confidence: 92,
    affectedEntityRefs: ['asset-0001', 'asset-0002', seedId('case', 1)],
    computed_at: '2026-01-18T06:00:00.000Z',
    acknowledged_at: '2026-01-18T06:15:00.000Z',
    recommendedActions: ['Escalate to War Room', 'Initiate emergency patching', 'Isolate affected segment'],
    status: 'acknowledged',
  },
  {
    id: seedId('pwc', 2), entity_type: 'pre-warned-classification', tenant: SEED_TENANT,
    created_at: '2026-01-18T04:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: ENGINE_SOURCE,
    classification_id: 'PWC-2026-002',
    triggerSources: [seedId('identity-intel', 1), seedId('identity-intel', 2)],
    classificationLevel: 'elevated',
    confidence: 78,
    affectedEntityRefs: ['identity-0003', 'identity-0005'],
    computed_at: '2026-01-18T04:00:00.000Z',
    acknowledged_at: null,
    recommendedActions: ['Review privileged access grants', 'Force MFA re-enrolment', 'Monitor for lateral movement'],
    status: 'active',
  },
  {
    id: seedId('pwc', 3), entity_type: 'pre-warned-classification', tenant: SEED_TENANT,
    created_at: '2026-01-17T12:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: ENGINE_SOURCE,
    classification_id: 'PWC-2026-003',
    triggerSources: [seedId('arch-intel', 3), seedId('exposure-comp', 3)],
    classificationLevel: 'pre_warned',
    confidence: 65,
    affectedEntityRefs: [seedId('arch', 4), 'asset-0003'],
    computed_at: '2026-01-17T12:00:00.000Z',
    acknowledged_at: '2026-01-17T14:00:00.000Z',
    recommendedActions: ['Assess cloud configuration drift', 'Review dependency chain'],
    status: 'resolved',
  },
  {
    id: seedId('pwc', 4), entity_type: 'pre-warned-classification', tenant: SEED_TENANT,
    created_at: '2026-01-18T05:30:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: ENGINE_SOURCE,
    classification_id: 'PWC-2026-004',
    triggerSources: [seedId('drift', 1), seedId('vuln-corr', 2), seedId('identity-intel', 4), seedId('arch-intel', 1)],
    classificationLevel: 'imminent',
    confidence: 96,
    affectedEntityRefs: ['asset-0001', 'identity-0001', seedId('arch', 1), seedId('case', 1)],
    computed_at: '2026-01-18T05:30:00.000Z',
    acknowledged_at: null,
    recommendedActions: ['Activate War Room immediately', 'Block lateral movement paths', 'Engage incident response', 'Notify CISO'],
    status: 'active',
  },
];
