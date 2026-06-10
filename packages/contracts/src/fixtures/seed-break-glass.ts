/**
 * Seed Break-Glass Requests — Commander C2 (Spec 35)
 * 3 sample records for development/testing
 */

import type { BreakGlassRequest } from '../entities/break-glass-request';

export const seedBreakGlassRequests: BreakGlassRequest[] = [
  {
    id: 'bg-001',
    entity_type: 'break-glass-request',
    tenant: { tenant_id: 'tenant-seiertech-01', tenant_name: 'Seiertech Demo' },
    source: { connector_id: 'system', import_run_id: 'init-001', source_system: 'commander-security', source_timestamp: '2025-01-15T09:00:00Z' },
    request_id: 'bg-req-001',
    requestorId: 'user-som-01',
    tenant_id: 'tenant-seiertech-01',
    reason: 'P0 incident response — need elevated access to all case data for blast radius assessment',
    scope: 'all-cases-read',
    status: 'approved',
    approved_by: 'user-admin-01',
    approved_at: '2025-01-15T09:05:00Z',
    expires_at: '2025-01-15T13:05:00Z',
    audit_ref: 'audit-bg-001',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-01-15T09:05:00Z',
  },
  {
    id: 'bg-002',
    entity_type: 'break-glass-request',
    tenant: { tenant_id: 'tenant-seiertech-01', tenant_name: 'Seiertech Demo' },
    source: { connector_id: 'system', import_run_id: 'init-001', source_system: 'commander-security', source_timestamp: '2025-01-15T14:30:00Z' },
    request_id: 'bg-req-002',
    requestorId: 'user-analyst-01',
    tenant_id: 'tenant-seiertech-01',
    reason: 'Investigate suspected credential compromise — need identity intelligence full access',
    scope: 'identity-intelligence-admin',
    status: 'pending',
    approved_by: null,
    approved_at: null,
    expires_at: '2025-01-15T18:00:00Z',
    audit_ref: 'audit-bg-002',
    created_at: '2025-01-15T14:30:00Z',
    updated_at: '2025-01-15T14:30:00Z',
  },
  {
    id: 'bg-003',
    entity_type: 'break-glass-request',
    tenant: { tenant_id: 'tenant-seiertech-01', tenant_name: 'Seiertech Demo' },
    source: { connector_id: 'system', import_run_id: 'init-001', source_system: 'commander-security', source_timestamp: '2025-01-10T07:55:00Z' },
    request_id: 'bg-req-003',
    requestorId: 'user-som-01',
    tenant_id: 'tenant-seiertech-01',
    reason: 'Expired — was for quarterly audit review access',
    scope: 'audit-export-admin',
    status: 'expired',
    approved_by: 'user-admin-01',
    approved_at: '2025-01-10T08:00:00Z',
    expires_at: '2025-01-10T16:00:00Z',
    audit_ref: 'audit-bg-003',
    created_at: '2025-01-10T07:55:00Z',
    updated_at: '2025-01-10T16:00:00Z',
  },
];
