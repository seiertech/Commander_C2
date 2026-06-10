/**
 * Seed Direction Boards — Commander C2 Test Fixtures
 *
 * Synthetic direction board records for strategic decision surfaces.
 * 4 records covering strategic decision, priority change, blocker and risk acceptance.
 * Source: Spec #58 Security OODA Loop §Decide Phase
 */

import type { DirectionBoard } from '../entities/direction-board';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENGINE_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-engine-layer' };

export const seedDirectionBoards: DirectionBoard[] = [
  {
    id: seedId('dir-board', 1),
    entityType: 'direction-board',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    boardId: 'board-strat-001',
    title: 'Approve zero-trust network segmentation programme',
    category: 'strategic_decision',
    status: 'active',
    priority: 1,
    owner: 'ciso@acme-corp.example',
    dueDate: '2026-02-15T00:00:00.000Z',
    description: 'Approve and fund the transition from flat network to zero-trust micro-segmented architecture across all production environments',
    impactAssessment: 'Without segmentation, lateral movement paths remain open; 7 active attack paths identified in exposure engine',
    linkedCaseRefs: ['case-0001', 'case-0003'],
    linkedRiskObjectRefs: ['risk-obj-0001'],
    resolution: null,
  },
  {
    id: seedId('dir-board', 2),
    entityType: 'direction-board',
    tenant: SEED_TENANT,
    createdAt: '2026-01-12T14:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    boardId: 'board-priority-001',
    title: 'Elevate CVE-2026-0001 to P0 remediation',
    category: 'priority_change',
    status: 'resolved',
    priority: 1,
    owner: 'vuln-manager@acme-corp.example',
    dueDate: '2026-01-14T00:00:00.000Z',
    description: 'Escalate CVE-2026-0001 from standard patching cycle to P0 emergency remediation given active exploitation evidence',
    impactAssessment: 'Widespread estate exposure with confirmed active exploit; delay increases breach probability significantly',
    linkedCaseRefs: ['case-0002'],
    linkedRiskObjectRefs: ['risk-obj-0002'],
    resolution: 'Approved — emergency change window scheduled, patch deployed to all affected assets within 48 hours',
  },
  {
    id: seedId('dir-board', 3),
    entityType: 'direction-board',
    tenant: SEED_TENANT,
    createdAt: '2026-01-14T10:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    boardId: 'board-blocker-001',
    title: 'EDR deployment blocked by legacy OS incompatibility',
    category: 'blocker',
    status: 'active',
    priority: 2,
    owner: 'endpoint-lead@acme-corp.example',
    dueDate: '2026-02-01T00:00:00.000Z',
    description: 'EDR agent cannot be deployed to 15 legacy Windows Server 2012 R2 hosts — agent requires Server 2016 minimum',
    impactAssessment: 'Coverage gap persists for 15 hosts in privileged network segment until OS upgrade or alternative control deployed',
    linkedCaseRefs: [],
    linkedRiskObjectRefs: ['risk-obj-0003'],
    resolution: null,
  },
  {
    id: seedId('dir-board', 4),
    entityType: 'direction-board',
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T11:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    source: ENGINE_SOURCE,
    boardId: 'board-risk-accept-001',
    title: 'Accept residual risk for isolated lab environment CVEs',
    category: 'risk_acceptance',
    status: 'proposed',
    priority: 4,
    owner: 'ciso@acme-corp.example',
    dueDate: null,
    description: 'Formally accept residual risk for 3 unpatched CVEs on isolated lab hosts with no production connectivity and network-level containment',
    impactAssessment: 'Minimal impact — hosts are air-gapped from production; exploitation would not reach production assets',
    linkedCaseRefs: [],
    linkedRiskObjectRefs: ['risk-obj-0004'],
    resolution: null,
  },
];
