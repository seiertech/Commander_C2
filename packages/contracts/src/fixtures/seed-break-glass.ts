/**
 * Seed Break-Glass Requests — Commander C2 (Spec 35)
 * 3 sample records for development/testing
 */

import type { BreakGlassRequest } from '../entities/break-glass-request';

export const seedBreakGlassRequests: BreakGlassRequest[] = [
  {
    id: 'bg-001',
    entityType: 'break-glass-request',
    tenant: { tenantId: 'tenant-seiertech-01', tenantName: 'Seiertech Demo' },
    source: { connectorId: 'system', importRunId: 'init-001', sourceSystem: 'commander-security', sourceTimestamp: '2025-01-15T09:00:00Z' },
    requestId: 'bg-req-001',
    requestorId: 'user-som-01',
    tenantId: 'tenant-seiertech-01',
    reason: 'P0 incident response — need elevated access to all case data for blast radius assessment',
    scope: 'all-cases-read',
    status: 'approved',
    approvedBy: 'user-admin-01',
    approvedAt: '2025-01-15T09:05:00Z',
    expiresAt: '2025-01-15T13:05:00Z',
    auditRef: 'audit-bg-001',
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-01-15T09:05:00Z',
  },
  {
    id: 'bg-002',
    entityType: 'break-glass-request',
    tenant: { tenantId: 'tenant-seiertech-01', tenantName: 'Seiertech Demo' },
    source: { connectorId: 'system', importRunId: 'init-001', sourceSystem: 'commander-security', sourceTimestamp: '2025-01-15T14:30:00Z' },
    requestId: 'bg-req-002',
    requestorId: 'user-analyst-01',
    tenantId: 'tenant-seiertech-01',
    reason: 'Investigate suspected credential compromise — need identity intelligence full access',
    scope: 'identity-intelligence-admin',
    status: 'pending',
    approvedBy: null,
    approvedAt: null,
    expiresAt: '2025-01-15T18:00:00Z',
    auditRef: 'audit-bg-002',
    createdAt: '2025-01-15T14:30:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
  },
  {
    id: 'bg-003',
    entityType: 'break-glass-request',
    tenant: { tenantId: 'tenant-seiertech-01', tenantName: 'Seiertech Demo' },
    source: { connectorId: 'system', importRunId: 'init-001', sourceSystem: 'commander-security', sourceTimestamp: '2025-01-10T07:55:00Z' },
    requestId: 'bg-req-003',
    requestorId: 'user-som-01',
    tenantId: 'tenant-seiertech-01',
    reason: 'Expired — was for quarterly audit review access',
    scope: 'audit-export-admin',
    status: 'expired',
    approvedBy: 'user-admin-01',
    approvedAt: '2025-01-10T08:00:00Z',
    expiresAt: '2025-01-10T16:00:00Z',
    auditRef: 'audit-bg-003',
    createdAt: '2025-01-10T07:55:00Z',
    updatedAt: '2025-01-10T16:00:00Z',
  },
];
