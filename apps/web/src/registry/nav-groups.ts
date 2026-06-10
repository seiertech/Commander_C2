/**
 * Navigation Groups — Commander SDR Operational App
 *
 * Two-level sidebar structure matching the v11 shell reference.
 * Source: docs/06_ui_build_reference/commander-sdr-shell-v11-admin-navigation.html
 *
 * 19 groups with sub-items. Status badges per build-mode visibility.
 * Per Spec #56: shell is reference only — routes are registry-driven.
 */

import type { BuildStatus } from './types';

export interface NavSubItem {
  label: string;
  path: string;
  status: BuildStatus;
}

export interface NavGroup {
  id: string;
  label: string;
  status?: BuildStatus;
  badge?: string;
  subItems: NavSubItem[];
}

/** Top navigation workspace tabs per v11 shell reference */
export const TOP_NAV_WORKSPACES = [
  { label: 'Command Centre', path: '/' },
  { label: 'Fusion Map', path: '/fusion-map' },
  { label: 'Vulnerabilities', path: '/vulnerabilities' },
  { label: 'Identity', path: '/identity' },
  { label: 'Architecture', path: '/architecture' },
] as const;

/** 19 sidebar navigation groups per v11 shell reference */
export const OPERATIONAL_NAV_GROUPS: NavGroup[] = [
  // Group 1 — Case Management [Source: v11 shell reference]
  {
    id: 'case-management',
    label: 'Case Management',
    subItems: [
      { label: 'My Cases', path: '/cases/my', status: 'BUILD' },
      { label: 'All Cases', path: '/cases', status: 'BUILD' },
      { label: 'P0 Zero-Day', path: '/war-room/p0', status: 'SCAFFOLD' },
      { label: 'Case Analytics', path: '/cases/analytics', status: 'BUILD' },
    ],
  },
  // Group 2 — Mission Control [Source: v11 shell reference]
  {
    id: 'mission-control',
    label: 'Mission Control',
    badge: 'SCAFFOLD',
    status: 'SCAFFOLD',
    subItems: [
      { label: 'Mission Overview', path: '/mission/overview', status: 'SCAFFOLD' },
      { label: 'Mission Objectives', path: '/mission/objectives', status: 'SCAFFOLD' },
      { label: 'Mission Impact', path: '/mission/impact', status: 'SCAFFOLD' },
    ],
  },
  // Group 3 — Fusion Map [Source: v11 shell reference]
  {
    id: 'fusion-map',
    label: 'Fusion Map',
    subItems: [
      { label: 'Relationship Graph', path: '/fusion-map', status: 'SCAFFOLD' },
      { label: 'Blast Radius', path: '/fusion-map/blast-radius', status: 'SCAFFOLD' },
      { label: 'Mission Overlay', path: '/fusion-map/mission', status: 'SCAFFOLD' },
      { label: 'P0 Overlay', path: '/fusion-map/p0', status: 'SCAFFOLD' },
    ],
  },
  // Group 4 — Vulnerability Management [Source: v11 shell reference]
  {
    id: 'vulnerability-management',
    label: 'Vulnerability Management',
    subItems: [
      { label: 'Overview', path: '/vulnerabilities', status: 'SCAFFOLD' },
      { label: 'KEV & Critical', path: '/vulnerabilities/kev', status: 'SCAFFOLD' },
      { label: 'Patch Intelligence', path: '/vulnerabilities/patches', status: 'SCAFFOLD' },
      { label: 'Code & Supply Chain', path: '/vulnerabilities/supply-chain', status: 'SCAFFOLD' },
    ],
  },
  // Group 5 — Exposure Management [Source: v11 shell reference]
  {
    id: 'exposure-management',
    label: 'Exposure Management',
    subItems: [
      { label: 'Attack Surface', path: '/exposure', status: 'SCAFFOLD' },
      { label: 'Blast Zones', path: '/exposure/blast-zones', status: 'SCAFFOLD' },
      { label: 'Coverage Gaps', path: '/exposure/coverage-gaps', status: 'SCAFFOLD' },
    ],
  },
  // Group 6 — Identity & Access [Source: v11 shell reference]
  {
    id: 'identity-access',
    label: 'Identity & Access',
    subItems: [
      { label: 'Identity Overview', path: '/identity', status: 'SCAFFOLD' },
      { label: 'Privileged Access', path: '/identity/privileged', status: 'SCAFFOLD' },
      { label: 'Access Drift', path: '/identity/drift', status: 'SCAFFOLD' },
    ],
  },
  // Group 7 — Architecture [Source: v11 shell reference]
  {
    id: 'architecture',
    label: 'Architecture',
    subItems: [
      { label: 'Architecture Overview', path: '/architecture', status: 'SCAFFOLD' },
      { label: 'Architecture Drift', path: '/architecture/drift', status: 'SCAFFOLD' },
      { label: 'Dependency Map', path: '/architecture/dependencies', status: 'SCAFFOLD' },
    ],
  },
  // Group 8 — Assets [Source: v11 shell reference]
  {
    id: 'assets',
    label: 'Assets',
    subItems: [
      { label: 'Inventory', path: '/assets', status: 'SCAFFOLD' },
      { label: 'Ownership', path: '/assets/ownership', status: 'SCAFFOLD' },
      { label: 'Classification', path: '/assets/classification', status: 'SCAFFOLD' },
    ],
  },
  // Group 9 — Controls [Source: v11 shell reference]
  {
    id: 'controls',
    label: 'Controls',
    badge: 'PLANNED',
    status: 'PLANNED',
    subItems: [
      { label: 'Control Coverage', path: '/controls', status: 'SCAFFOLD' },
      { label: 'Control Strength', path: '/controls/strength', status: 'SCAFFOLD' },
      { label: 'Framework Mapping', path: '/controls/frameworks', status: 'SCAFFOLD' },
    ],
  },
  // Group 10 — Coverage [Source: v11 shell reference]
  {
    id: 'coverage',
    label: 'Coverage',
    subItems: [
      { label: 'Coverage Overview', path: '/coverage', status: 'SCAFFOLD' },
      { label: 'Scanner Coverage', path: '/coverage/scanners', status: 'SCAFFOLD' },
      { label: 'Telemetry Coverage', path: '/coverage/telemetry', status: 'SCAFFOLD' },
    ],
  },
  // Group 11 — Tool Health [Source: v11 shell reference]
  {
    id: 'tool-health',
    label: 'Tool Health',
    subItems: [
      { label: 'Tool Health', path: '/tool-health', status: 'SCAFFOLD' },
      { label: 'Connectors', path: '/tool-health/connectors', status: 'SCAFFOLD' },
      { label: 'Source Freshness', path: '/tool-health/freshness', status: 'SCAFFOLD' },
    ],
  },
  // Group 12 — Team Pulse [Source: v11 shell reference]
  {
    id: 'team-pulse',
    label: 'Team Pulse',
    subItems: [
      { label: 'Workload', path: '/team-pulse/workload', status: 'BUILD' },
      { label: 'SLA Pressure', path: '/team-pulse/sla', status: 'BUILD' },
      { label: 'Escalation Queue', path: '/team-pulse/escalation', status: 'BUILD' },
    ],
  },
  // Group 13 — Domain Pulse [Source: v11 shell reference]
  {
    id: 'domain-pulse',
    label: 'Domain Pulse',
    subItems: [
      { label: 'Domain Overview', path: '/domain-pulse', status: 'BUILD' },
      { label: 'Failed Validation', path: '/domain-pulse/failed-validation', status: 'BUILD' },
      { label: 'Closure Blockers', path: '/domain-pulse/closure-blockers', status: 'BUILD' },
    ],
  },
  // Group 14 — System Pulse [Source: v11 shell reference]
  {
    id: 'system-pulse',
    label: 'System Pulse',
    subItems: [
      { label: 'Engine Health', path: '/system-pulse/engine', status: 'BUILD' },
      { label: 'Queue Backlog', path: '/system-pulse/queues', status: 'BUILD' },
      { label: 'Data Freshness', path: '/system-pulse/freshness', status: 'BUILD' },
    ],
  },
  // Group 15 — Platform [Source: v11 shell reference]
  {
    id: 'platform',
    label: 'Platform',
    badge: 'BUILD',
    status: 'BUILD',
    subItems: [
      { label: 'Platform Overview', path: '/platform', status: 'SCAFFOLD' },
      { label: 'Connectors & Data Sources', path: '/platform/connectors', status: 'SCAFFOLD' },
      { label: 'Data Quality', path: '/platform/data-quality', status: 'BUILD' },
      { label: 'Rule Engine', path: '/platform/rules', status: 'BUILD' },
      { label: 'Rule Validation', path: '/platform/rules/validation', status: 'BUILD' },
      { label: 'Rule Simulation', path: '/platform/rules/simulation', status: 'BUILD' },
      { label: 'Model Management', path: '/platform/models', status: 'BUILD' },
      { label: 'Commander AI', path: '/commander-ai', status: 'BUILD' },
      { label: 'Automation', path: '/platform/automation', status: 'BUILD' },
      { label: 'Feature Availability', path: '/platform/features', status: 'BUILD' },
      { label: 'Audit & Logs', path: '/platform/audit', status: 'SCAFFOLD' },
    ],
  },
  // Group 16 — Tenant Admin [Source: v11 shell reference]
  {
    id: 'tenant-admin',
    label: 'Tenant Admin',
    badge: 'ADMIN',
    subItems: [
      { label: 'Overview', path: '/settings/tenant', status: 'SCAFFOLD' },
      { label: 'Baseline Configuration', path: '/settings/baselines', status: 'SCAFFOLD' },
      { label: 'Users & Access', path: '/settings/users-rbac', status: 'SCAFFOLD' },
      { label: 'Rules & Models', path: '/settings/rules', status: 'SCAFFOLD' },
      { label: 'AI Configuration', path: '/settings/commander-ai', status: 'SCAFFOLD' },
      { label: 'Audit', path: '/settings/audit-export', status: 'SCAFFOLD' },
    ],
  },
  // Group 17 — Governance [Source: v11 shell reference]
  {
    id: 'governance',
    label: 'Governance',
    subItems: [
      { label: 'Compliance', path: '/governance', status: 'SCAFFOLD' },
      { label: 'Policies & Standards', path: '/governance/policies', status: 'SCAFFOLD' },
      { label: 'Exceptions', path: '/governance/exceptions', status: 'SCAFFOLD' },
    ],
  },
  // Group 18 — Reporting [Source: v11 shell reference]
  {
    id: 'reporting',
    label: 'Reporting',
    subItems: [
      { label: 'Reports', path: '/reporting', status: 'BUILD' },
      { label: 'Exports', path: '/reporting/exports', status: 'BUILD' },
      { label: 'CISO Pack', path: '/reporting/ciso-pack', status: 'BUILD' },
    ],
  },
  // Group 19 — SOM (Security Operations Management)
  {
    id: 'som',
    label: 'SOM',
    subItems: [
      { label: 'CISO Dashboard', path: '/som/ciso', status: 'SCAFFOLD' },
      { label: 'Security Operations Manager', path: '/som/security-operations', status: 'SCAFFOLD' },
      { label: 'Architecture Manager', path: '/som/architecture', status: 'SCAFFOLD' },
      { label: 'Risk Manager', path: '/som/risk', status: 'SCAFFOLD' },
      { label: 'Cloud Security Manager', path: '/som/cloud-security', status: 'SCAFFOLD' },
    ],
  },
];

/** Commercial Control Plane sidebar items per v3 shell reference */
export const CONTROL_PLANE_NAV_ITEMS = [
  { label: 'Command Overview', path: '/control-plane', status: 'SCAFFOLD' as BuildStatus },
  { label: 'Customers', path: '/control-plane/customers', status: 'SCAFFOLD' as BuildStatus },
  { label: 'Tenants', path: '/control-plane/tenants', status: 'SCAFFOLD' as BuildStatus },
  { label: 'Licences & Entitlements', path: '/control-plane/licences', status: 'SCAFFOLD' as BuildStatus },
  { label: 'Product & Feature Control', path: '/control-plane/features', status: 'SCAFFOLD' as BuildStatus },
  { label: 'AI & Model Control', path: '/control-plane/ai-models', status: 'SCAFFOLD' as BuildStatus, badge: 'NEW' },
  { label: 'Rule & Policy Packs', path: '/control-plane/rule-packs', status: 'SCAFFOLD' as BuildStatus, badge: 'NEW' },
  { label: 'Baseline Profile Management', path: '/control-plane/baselines', status: 'SCAFFOLD' as BuildStatus, badge: 'NEW' },
  { label: 'Deployment & Release', path: '/control-plane/deployment', status: 'SCAFFOLD' as BuildStatus },
  { label: 'Support Operations', path: '/control-plane/support', status: 'SCAFFOLD' as BuildStatus },
  { label: 'Billing / Usage Evidence', path: '/control-plane/billing', status: 'SCAFFOLD' as BuildStatus },
  { label: 'Operator Audit', path: '/control-plane/audit', status: 'SCAFFOLD' as BuildStatus },
] as const;

/** Commercial Control Plane top nav tabs per v3 shell reference */
export const CONTROL_PLANE_TOP_NAV = [
  { label: 'Command Overview', path: '/control-plane' },
  { label: 'Customers', path: '/control-plane/customers' },
  { label: 'Tenants', path: '/control-plane/tenants' },
  { label: 'Entitlements', path: '/control-plane/licences' },
  { label: 'Deployment', path: '/control-plane/deployment' },
] as const;
