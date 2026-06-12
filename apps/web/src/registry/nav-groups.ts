/**
 * Navigation Groups — Commander C2 Operational App
 *
 * UIAA-THESIS-AUDIT §6 restructure:
 *   19 → 18 groups (5 renames, 2 new, 4 merged → 1)
 *
 * Source: docs/00_authority/UIAA-THESIS-AUDIT.md §6
 * Convention: "adherence" not "compliance" throughout.
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

/**
 * 18 sidebar navigation groups — UIAA-THESIS-AUDIT §6.4 structure
 *
 * Changes from v11 baseline:
 *   RENAMED: Exposure Management → Exposure & CTEM
 *   RENAMED: Mission Control → Mission & Strategy
 *   RENAMED: Governance → Governance & Adherence
 *   RENAMED: Controls → Controls & Frameworks
 *   MERGED:  Team Pulse + Domain Pulse + System Pulse + Tool Health → Operational Health
 *   NEW:     Intelligence (7 items)
 *   NEW:     Risk Management (3 items)
 */
export const OPERATIONAL_NAV_GROUPS: NavGroup[] = [
  // ─── Group 1 — Command Centre ─────────────────────────────────────────────
  {
    id: 'command-centre',
    label: 'Command Centre',
    subItems: [
      { label: 'CISO Dashboard', path: '/ciso', status: 'BUILD' },
      { label: 'Operating Picture (Internal)', path: '/operating-picture/internal', status: 'BUILD' },
      { label: 'Operating Picture (External)', path: '/operating-picture/external', status: 'BUILD' },
    ],
  },
  // ─── Group 2 — Case Management ────────────────────────────────────────────
  {
    id: 'case-management',
    label: 'Case Management',
    subItems: [
      { label: 'My Cases', path: '/cases/my', status: 'BUILD' },
      { label: 'All Cases', path: '/cases', status: 'BUILD' },
      { label: 'P0 Zero-Day', path: '/war-room/p0', status: 'SCAFFOLD' },
      { label: 'Case Analytics', path: '/cases/analytics', status: 'BUILD' },
      { label: 'OODA Command Tempo', path: '/cases/tempo', status: 'PLANNED' },
    ],
  },
  // ─── Group 3 — Intelligence (NEW) ─────────────────────────────────────────
  {
    id: 'intelligence',
    label: 'Intelligence',
    badge: 'NEW',
    subItems: [
      { label: 'Signal Pipeline', path: '/intelligence/signals', status: 'PLANNED' },
      { label: 'IOC Lifecycle', path: '/intelligence/iocs', status: 'PLANNED' },
      { label: 'Threat Hunt Operations', path: '/intelligence/threat-hunts', status: 'PLANNED' },
      { label: 'Confidence Console', path: '/intelligence/confidence', status: 'PLANNED' },
      { label: 'Search', path: '/search', status: 'BUILD' },
      { label: 'Commander AI', path: '/commander-ai', status: 'BUILD' },
      { label: 'Defence Coverage', path: '/defence-coverage', status: 'PLANNED' },
    ],
  },
  // ─── Group 4 — Risk Management (NEW) ──────────────────────────────────────
  {
    id: 'risk-management',
    label: 'Risk Management',
    badge: 'NEW',
    subItems: [
      { label: 'Risk Register', path: '/risk-management', status: 'PLANNED' },
      { label: 'Risk Treatment Plans', path: '/risk-management/treatment', status: 'PLANNED' },
      { label: 'Risk Overview (SOM)', path: '/som/risk', status: 'SCAFFOLD' },
    ],
  },
  // ─── Group 5 — Vulnerability Management ───────────────────────────────────
  {
    id: 'vulnerability-management',
    label: 'Vulnerability Management',
    subItems: [
      { label: 'Overview', path: '/vulnerabilities', status: 'SCAFFOLD' },
      { label: 'KEV & Critical', path: '/vulnerabilities/kev', status: 'SCAFFOLD' },
      { label: 'Patch Intelligence', path: '/vulnerabilities/patches', status: 'SCAFFOLD' },
      { label: 'Code & Supply Chain', path: '/vulnerabilities/supply-chain', status: 'SCAFFOLD' },
      { label: 'SSVC Decision Flow', path: '/vulnerabilities/ssvc', status: 'PLANNED' },
    ],
  },
  // ─── Group 6 — Exposure & CTEM (RENAMED from "Exposure Management") ──────
  {
    id: 'exposure-ctem',
    label: 'Exposure & CTEM',
    subItems: [
      { label: 'Attack Surface', path: '/exposure', status: 'SCAFFOLD' },
      { label: 'CTEM Lifecycle', path: '/exposure/ctem', status: 'PLANNED' },
      { label: 'Blast Zones', path: '/exposure/blast-zones', status: 'SCAFFOLD' },
      { label: 'Coverage Gaps', path: '/exposure/coverage-gaps', status: 'SCAFFOLD' },
    ],
  },
  // ─── Group 7 — Identity & Access ──────────────────────────────────────────
  {
    id: 'identity-access',
    label: 'Identity & Access',
    subItems: [
      { label: 'Identity Overview', path: '/identity', status: 'SCAFFOLD' },
      { label: 'Privileged Access', path: '/identity/privileged', status: 'SCAFFOLD' },
      { label: 'Access Drift', path: '/identity/drift', status: 'SCAFFOLD' },
    ],
  },
  // ─── Group 8 — Architecture ───────────────────────────────────────────────
  {
    id: 'architecture',
    label: 'Architecture',
    subItems: [
      { label: 'Architecture Overview', path: '/architecture', status: 'SCAFFOLD' },
      { label: 'Architecture Drift', path: '/architecture/drift', status: 'SCAFFOLD' },
      { label: 'Dependency Map', path: '/architecture/dependencies', status: 'SCAFFOLD' },
      { label: 'Inverse Discovery', path: '/architecture/inverse-discovery', status: 'PLANNED' },
    ],
  },
  // ─── Group 9 — Assets ─────────────────────────────────────────────────────
  {
    id: 'assets',
    label: 'Assets',
    subItems: [
      { label: 'Inventory', path: '/assets', status: 'SCAFFOLD' },
      { label: 'Ownership', path: '/assets/ownership', status: 'SCAFFOLD' },
      { label: 'Classification', path: '/assets/classification', status: 'SCAFFOLD' },
    ],
  },
  // ─── Group 10 — Mission & Strategy (RENAMED from "Mission Control") ───────
  {
    id: 'mission-strategy',
    label: 'Mission & Strategy',
    subItems: [
      { label: 'Mission Overview', path: '/mission/overview', status: 'SCAFFOLD' },
      { label: 'Mission Objectives', path: '/mission/objectives', status: 'SCAFFOLD' },
      { label: 'Mission Impact', path: '/mission/impact', status: 'SCAFFOLD' },
      { label: 'Posture', path: '/posture', status: 'BUILD' },
      { label: 'Posture Accountability', path: '/posture/accountability', status: 'PLANNED' },
      { label: 'Strategy Centre', path: '/strategy/centre', status: 'BUILD' },
      { label: 'Strategy Simulation', path: '/strategy/simulation', status: 'BUILD' },
      { label: 'Direction Boards', path: '/strategy/direction-boards', status: 'PLANNED' },
    ],
  },
  // ─── Group 11 — Governance & Adherence (RENAMED from "Governance") ────────
  {
    id: 'governance-adherence',
    label: 'Governance & Adherence',
    subItems: [
      { label: 'Adherence Overview', path: '/governance', status: 'SCAFFOLD' },
      { label: 'Policies & Standards', path: '/governance/policies', status: 'SCAFFOLD' },
      { label: 'Decisions', path: '/governance/decisions', status: 'SCAFFOLD' },
      { label: 'Exceptions', path: '/governance/exceptions', status: 'SCAFFOLD' },
      { label: 'Adherence Evidence', path: '/governance/adherence-evidence', status: 'PLANNED' },
      { label: 'Push Governance', path: '/governance/push-governance', status: 'PLANNED' },
    ],
  },
  // ─── Group 12 — Controls & Frameworks (RENAMED from "Controls") ───────────
  {
    id: 'controls-frameworks',
    label: 'Controls & Frameworks',
    subItems: [
      { label: 'Control Coverage', path: '/controls', status: 'SCAFFOLD' },
      { label: 'Control Strength', path: '/controls/strength', status: 'SCAFFOLD' },
      { label: 'Framework Mapping', path: '/controls/frameworks', status: 'SCAFFOLD' },
    ],
  },
  // ─── Group 13 — Coverage ──────────────────────────────────────────────────
  {
    id: 'coverage',
    label: 'Coverage',
    subItems: [
      { label: 'Coverage Overview', path: '/coverage', status: 'PLANNED' },
      { label: 'Scanner Coverage', path: '/coverage/scanners', status: 'PLANNED' },
      { label: 'Telemetry Coverage', path: '/coverage/telemetry', status: 'PLANNED' },
    ],
  },
  // ─── Group 14 — Operational Health (MERGED: Team Pulse + Domain Pulse + System Pulse + Tool Health) ─
  {
    id: 'operational-health',
    label: 'Operational Health',
    subItems: [
      { label: 'Tool Health', path: '/tool-health', status: 'SCAFFOLD' },
      { label: 'Connectors', path: '/tool-health/connectors', status: 'SCAFFOLD' },
      { label: 'Source Freshness', path: '/tool-health/freshness', status: 'SCAFFOLD' },
      { label: 'Workload', path: '/team-pulse/workload', status: 'BUILD' },
      { label: 'SLA Pressure', path: '/team-pulse/sla', status: 'BUILD' },
      { label: 'Escalation Queue', path: '/team-pulse/escalation', status: 'BUILD' },
      { label: 'Domain Overview', path: '/domain-pulse', status: 'BUILD' },
      { label: 'Failed Validation', path: '/domain-pulse/failed-validation', status: 'BUILD' },
      { label: 'Closure Blockers', path: '/domain-pulse/closure-blockers', status: 'BUILD' },
      { label: 'Engine Health', path: '/system-pulse/engine', status: 'BUILD' },
      { label: 'Queue Backlog', path: '/system-pulse/queues', status: 'BUILD' },
      { label: 'Data Freshness', path: '/system-pulse/freshness', status: 'BUILD' },
    ],
  },
  // ─── Group 15 — Platform ──────────────────────────────────────────────────
  {
    id: 'platform',
    label: 'Platform',
    badge: 'BUILD',
    status: 'BUILD',
    subItems: [
      { label: 'Platform Overview', path: '/platform', status: 'BUILD' },
      { label: 'Connectors & Data Sources', path: '/platform/connectors', status: 'SCAFFOLD' },
      { label: 'Data Quality', path: '/platform/data-quality', status: 'BUILD' },
      { label: 'Rule Engine', path: '/platform/rules', status: 'BUILD' },
      { label: 'Rule Validation', path: '/platform/rules/validation', status: 'BUILD' },
      { label: 'Rule Simulation', path: '/platform/rules/simulation', status: 'BUILD' },
      { label: 'Model Management', path: '/platform/models', status: 'BUILD' },
      { label: 'Tool Intelligence', path: '/platform/tool-intelligence', status: 'PLANNED' },
      { label: 'Automation', path: '/platform/automation', status: 'BUILD' },
      { label: 'Feature Availability', path: '/platform/features', status: 'BUILD' },
      { label: 'Audit & Logs', path: '/platform/audit', status: 'SCAFFOLD' },
    ],
  },
  // ─── Group 16 — Reporting ─────────────────────────────────────────────────
  {
    id: 'reporting',
    label: 'Reporting',
    subItems: [
      { label: 'Reports', path: '/reporting', status: 'BUILD' },
      { label: 'Exports', path: '/reporting/exports', status: 'BUILD' },
      { label: 'CISO Pack', path: '/reporting/ciso-pack', status: 'BUILD' },
    ],
  },
  // ─── Group 17 — Security Operations Management ────────────────────────────
  {
    id: 'som',
    label: 'Security Operations Management',
    subItems: [
      { label: 'CISO Dashboard', path: '/som/ciso', status: 'SCAFFOLD' },
      { label: 'Security Operations Manager', path: '/som/security-operations', status: 'SCAFFOLD' },
      { label: 'Architecture Manager', path: '/som/architecture', status: 'SCAFFOLD' },
      { label: 'Cloud Security Manager', path: '/som/cloud-security', status: 'SCAFFOLD' },
      { label: 'Operational Maturity', path: '/operational-maturity', status: 'PLANNED' },
    ],
  },
  // ─── Group 18 — Fusion Map ────────────────────────────────────────────────
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
  // ─── Group 19 — Tenant Admin ──────────────────────────────────────────────
  {
    id: 'tenant-admin',
    label: 'Tenant Admin',
    subItems: [
      { label: 'Overview', path: '/settings/tenant', status: 'SCAFFOLD' },
      { label: 'Users & Access', path: '/settings/users-rbac', status: 'SCAFFOLD' },
      { label: 'Baseline Configuration', path: '/settings/baselines', status: 'SCAFFOLD' },
      { label: 'Rules & Models', path: '/settings/rules', status: 'SCAFFOLD' },
      { label: 'AI Configuration', path: '/settings/commander-ai', status: 'SCAFFOLD' },
      { label: 'Audit & Export', path: '/settings/audit-export', status: 'SCAFFOLD' },
    ],
  },
];

/** Tenant Admin sidebar items */
export const TENANT_ADMIN_NAV_ITEMS = [
  { label: 'Overview', path: '/settings/tenant', status: 'SCAFFOLD' as BuildStatus },
  { label: 'Baseline Configuration', path: '/settings/baselines', status: 'SCAFFOLD' as BuildStatus },
  { label: 'Users & Access', path: '/settings/users-rbac', status: 'SCAFFOLD' as BuildStatus },
  { label: 'Rules & Models', path: '/settings/rules', status: 'SCAFFOLD' as BuildStatus },
  { label: 'AI Configuration', path: '/settings/commander-ai', status: 'SCAFFOLD' as BuildStatus },
  { label: 'Audit', path: '/settings/audit-export', status: 'SCAFFOLD' as BuildStatus },
] as const;

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
