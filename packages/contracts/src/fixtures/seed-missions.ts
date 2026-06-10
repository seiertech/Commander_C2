/**
 * Seed Missions — Commander SDR Test Fixtures
 *
 * Synthetic mission data for strategic security initiatives.
 * Source: Master Technical Specification §Mission Control
 *
 * 3 missions: active zero-trust transformation, active supply-chain hardening,
 * draft cloud-migration-security.
 */

import type { Mission } from '../entities/mission';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const MISSION_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-mission-engine' };

export const seedMissions: Mission[] = [
  {
    id: seedId('mission', 1),
    entityType: 'mission',
    tenant: SEED_TENANT,
    createdAt: '2026-01-05T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: MISSION_SOURCE,
    name: 'Zero Trust Transformation',
    description: 'Implement zero trust architecture across all network segments, enforcing least-privilege access and continuous verification for all identity and device interactions.',
    status: 'active',
    priority: 1,
    objectives: [
      { id: 'obj-1-1', description: 'Deploy identity-aware proxy for all internal applications', status: 'in_progress', targetDate: '2026-03-31T00:00:00.000Z', evidenceRefs: ['case-0005', 'case-0007'] },
      { id: 'obj-1-2', description: 'Eliminate legacy VPN access for 90% of workforce', status: 'in_progress', targetDate: '2026-06-30T00:00:00.000Z', evidenceRefs: [] },
      { id: 'obj-1-3', description: 'Achieve continuous device posture assessment coverage > 95%', status: 'not_started', targetDate: '2026-09-30T00:00:00.000Z', evidenceRefs: [] },
    ],
    impactDomains: ['identity', 'network', 'endpoint', 'application'],
    owner: 'CISO',
    startDate: '2026-01-01T00:00:00.000Z',
    targetDate: '2026-12-31T00:00:00.000Z',
    progressPercent: 25,
    alignedCases: ['case-0005', 'case-0007', 'case-0012'],
    kpiMetrics: [
      { name: 'Applications behind proxy', target: 100, current: 35, unit: '%' },
      { name: 'VPN dependency reduction', target: 90, current: 20, unit: '%' },
      { name: 'Device posture coverage', target: 95, current: 68, unit: '%' },
    ],
    criticality: 1,
    scope: 'enterprise-wide',
    bindingRules: [{ ruleType: 'tag_match', pattern: 'zero-trust', autoApply: true }],
    p0Policy: 'immediate-escalation',
    routingProfile: 'executive-oversight',
    reviewedAt: '2026-01-18T06:00:00.000Z',
    reviewedBy: 'CISO',
  },
  {
    id: seedId('mission', 2),
    entityType: 'mission',
    tenant: SEED_TENANT,
    createdAt: '2026-01-08T00:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: MISSION_SOURCE,
    name: 'Supply Chain Hardening',
    description: 'Reduce exposure from third-party software dependencies and vendor integrations through continuous SBOM analysis, vendor risk scoring, and automated dependency patching.',
    status: 'active',
    priority: 2,
    objectives: [
      { id: 'obj-2-1', description: 'Achieve SBOM coverage for all production applications', status: 'completed', targetDate: '2026-02-28T00:00:00.000Z', evidenceRefs: ['case-0003'] },
      { id: 'obj-2-2', description: 'Reduce critical dependency vulnerabilities to < 5 open', status: 'in_progress', targetDate: '2026-04-30T00:00:00.000Z', evidenceRefs: ['case-0001', 'case-0004'] },
      { id: 'obj-2-3', description: 'Vendor risk assessment for all Tier 1 suppliers', status: 'not_started', targetDate: '2026-06-30T00:00:00.000Z', evidenceRefs: [] },
    ],
    impactDomains: ['vulnerability', 'application', 'configuration'],
    owner: 'Security Architect',
    startDate: '2026-01-08T00:00:00.000Z',
    targetDate: '2026-06-30T00:00:00.000Z',
    progressPercent: 45,
    alignedCases: ['case-0001', 'case-0003', 'case-0004'],
    kpiMetrics: [
      { name: 'SBOM coverage', target: 100, current: 100, unit: '%' },
      { name: 'Critical dependency vulns', target: 5, current: 8, unit: 'count' },
      { name: 'Vendor risk assessments', target: 12, current: 3, unit: 'count' },
    ],
    criticality: 2,
    scope: 'supply-chain',
    bindingRules: [{ ruleType: 'service_group', pattern: 'third-party-services', autoApply: true }],
    p0Policy: null,
    routingProfile: 'security-architect-review',
    reviewedAt: '2026-01-18T06:00:00.000Z',
    reviewedBy: 'Security Architect',
  },
  {
    id: seedId('mission', 3),
    entityType: 'mission',
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
    source: MISSION_SOURCE,
    name: 'Cloud Migration Security',
    description: 'Ensure security posture is maintained during the multi-cloud migration programme. Cover identity federation, data classification, workload isolation, and monitoring coverage.',
    status: 'draft',
    priority: 3,
    objectives: [
      { id: 'obj-3-1', description: 'Define cloud security baseline for all target environments', status: 'not_started', targetDate: '2026-03-31T00:00:00.000Z', evidenceRefs: [] },
      { id: 'obj-3-2', description: 'Extend CSPM coverage to all cloud accounts', status: 'not_started', targetDate: '2026-05-31T00:00:00.000Z', evidenceRefs: [] },
      { id: 'obj-3-3', description: 'Validate data classification controls in cloud storage', status: 'not_started', targetDate: '2026-07-31T00:00:00.000Z', evidenceRefs: [] },
    ],
    impactDomains: ['cloud', 'identity', 'configuration', 'coverage'],
    owner: 'Cloud Security Manager',
    startDate: '2026-02-01T00:00:00.000Z',
    targetDate: '2026-09-30T00:00:00.000Z',
    progressPercent: 0,
    alignedCases: [],
    kpiMetrics: [
      { name: 'Cloud security baseline defined', target: 1, current: 0, unit: 'count' },
      { name: 'CSPM account coverage', target: 100, current: 0, unit: '%' },
      { name: 'Data classification controls validated', target: 100, current: 0, unit: '%' },
    ],
    criticality: 3,
    scope: 'cloud-infrastructure',
    bindingRules: [{ ruleType: 'dependency', pattern: 'cloud-*', autoApply: false }],
    p0Policy: null,
    routingProfile: null,
    reviewedAt: null,
    reviewedBy: null,
  },
];
