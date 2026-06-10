/**
 * Mock Tenant Admin Configuration — Commander C2 (Unit 22 v1)
 *
 * App-level MOCK configuration for the Tenant Admin Surface v1. There is no
 * canonical tenant-admin-config entity in packages/contracts, so this is an
 * app-scoped mock (synthetic, no real credentials — security-and-testing
 * doctrine). It backs the display + local configuration flows only; NOTHING
 * here is enforced end-to-end at runtime (no auth/entitlement runtime exists yet).
 *
 * Every capability carries an explicit `enforcement` status so the surface can
 * render live-vs-not-live honestly. Deferred enforcement is recorded formally in
 * DECISIONS.md (DEC-unit22-tenant-admin-v1-deferrals) and the ARCH-DEBT register
 * (ARCH-DEBT-047..050 + existing ARCH-DEBT-019) — never in prose/comments only.
 */

/** Enforcement status for a Tenant Admin capability. */
export type EnforcementStatus = 'configured-mock' | 'not-live';

/** A deferred-enforcement owner reference (where the follow-up is recorded). */
export interface DeferralRef {
  /** Human-readable owner of the follow-up. */
  owner: string;
  /** The recorded reference id (ARCH-DEBT / DECISIONS / unit). */
  ref: string;
}

export interface TenantProfile {
  tenantId: string;
  tenantName: string;
  residency: 'UK' | 'US' | 'EU';
  environment: string;
  status: 'active' | 'trial' | 'suspended';
}

export interface TenantUser {
  id: string;
  displayName: string;
  email: string;
  roles: string[];
  authorityOverlays: string[];
  authStrength: 'password-only' | 'mfa-enabled' | 'phishing-resistant-mfa';
  status: 'active' | 'invited' | 'suspended';
}

export interface TenantRole {
  id: string;
  name: string;
  description: string;
  /** Count of permission scopes attached (Spec #50 visibility inputs). */
  scopeCount: number;
}

export interface AuthorityOverlayConfig {
  name: string;
  description: string;
  grantModel: string;
}

export interface MfaPolicy {
  required: boolean;
  minimumStrength: 'mfa-enabled' | 'phishing-resistant-mfa';
  gracePeriodDays: number;
}

export interface SsoConfig {
  /** Whether SSO has been configured in the mock (NOT a live provider connection). */
  configured: boolean;
  protocol: 'SAML 2.0' | 'OIDC';
  idpName: string;
  /** Readiness only — no live provider call is made (Phase-2 / owner constraint). */
  readiness: 'not-configured' | 'configured-not-verified' | 'verified';
}

export interface TenantConnectorSetting {
  connectorId: string;
  name: string;
  classes: string[];
  state: 'active' | 'paused' | 'error';
  /** Whether tenant-admin mutation (add/configure/pause/decommission) is enforced. */
  mutationEnforced: false;
}

/** The full mock tenant-admin configuration. */
export const MOCK_TENANT_PROFILE: TenantProfile = {
  tenantId: 'tenant-001-acme-corp',
  tenantName: 'Acme Corporation (Demo)',
  residency: 'UK',
  environment: 'production',
  status: 'active',
};

export const MOCK_TENANT_USERS: TenantUser[] = [
  { id: 'tu-001', displayName: 'Johann de Winnaar', email: 'johann.ciso@acme-demo.example', roles: ['CISO'], authorityOverlays: ['Administrative', 'Reporting'], authStrength: 'phishing-resistant-mfa', status: 'active' },
  { id: 'tu-002', displayName: 'Security Operations Manager', email: 'som@acme-demo.example', roles: ['SOM'], authorityOverlays: ['Approval'], authStrength: 'mfa-enabled', status: 'active' },
  { id: 'tu-003', displayName: 'Carlos Identity-Analyst', email: 'carlos.identity@acme-demo.example', roles: ['Identity/Access Specialist'], authorityOverlays: ['Internal Risk (scoped)'], authStrength: 'mfa-enabled', status: 'active' },
  { id: 'tu-004', displayName: 'Jack Tenant-Admin', email: 'jack.admin@acme-demo.example', roles: ['Tenant Admin'], authorityOverlays: ['Administrative'], authStrength: 'mfa-enabled', status: 'active' },
  { id: 'tu-005', displayName: 'Irene Adherence-Analyst', email: 'irene.adherence@acme-demo.example', roles: ['Risk/Adherence/Audit'], authorityOverlays: ['Reporting'], authStrength: 'password-only', status: 'invited' },
];

export const MOCK_TENANT_ROLES: TenantRole[] = [
  { id: 'tr-001', name: 'CISO', description: 'Programme-level executive view', scopeCount: 8 },
  { id: 'tr-002', name: 'SOM', description: 'Case engine workload, routing, escalation', scopeCount: 6 },
  { id: 'tr-003', name: 'Security Analyst', description: 'Cross-domain investigator across four streams', scopeCount: 5 },
  { id: 'tr-004', name: 'Identity/Access Specialist', description: 'Identity-graph operations, privileged access', scopeCount: 5 },
  { id: 'tr-005', name: 'Tenant Admin', description: 'Tenant administration within entitlement boundaries', scopeCount: 4 },
  { id: 'tr-006', name: 'Risk/Adherence/Audit', description: 'Evidence, attestation, audit-of-access reporting', scopeCount: 3 },
];

export const MOCK_AUTHORITY_OVERLAYS: AuthorityOverlayConfig[] = [
  { name: 'Administrative', description: 'Tenant administration and configuration', grantModel: 'persistent (role-attached)' },
  { name: 'Investigation', description: 'Evidence-pack generation and investigation support', grantModel: 'per-investigation (time-bounded)' },
  { name: 'Approval', description: 'Approve case closure, push, baseline change', grantModel: 'persistent (role-attached)' },
  { name: 'Reporting', description: 'Board-grade and audit reporting', grantModel: 'persistent (role-attached)' },
  { name: 'Internal Risk', description: 'Per-identity behavioural / Internal Operating Picture unlock (DEC-sec-c2-internal-cop-rbac)', grantModel: 'per-investigation / persistent / scoped' },
];

export const MOCK_MFA_POLICY: MfaPolicy = {
  required: true,
  minimumStrength: 'mfa-enabled',
  gracePeriodDays: 7,
};

export const MOCK_SSO_CONFIG: SsoConfig = {
  configured: true,
  protocol: 'SAML 2.0',
  idpName: 'Mock IdP (Entra-style)',
  readiness: 'configured-not-verified',
};

export const MOCK_TENANT_CONNECTOR_SETTINGS: TenantConnectorSetting[] = [
  { connectorId: 'mock-connector-0001', name: 'Mock SIEM (Splunk-style)', classes: ['A'], state: 'active', mutationEnforced: false },
  { connectorId: 'mock-connector-0002', name: 'Mock XDR (CrowdStrike-style)', classes: ['A', 'B'], state: 'active', mutationEnforced: false },
  { connectorId: 'mock-connector-0009', name: 'Mock Cloud Config (AWS Config-style)', classes: ['C'], state: 'active', mutationEnforced: false },
  { connectorId: 'mock-connector-0012', name: 'Mock CVE Feed (NVD-style)', classes: ['D'], state: 'paused', mutationEnforced: false },
];

/**
 * Capability enforcement ledger — the single source of truth the surface renders
 * its live/not-live badges from. Every not-live capability names where its
 * follow-up is recorded (ARCH-DEBT / DECISIONS / unit). No hidden deferrals.
 */
export interface CapabilityStatus {
  capability: string;
  builtNow: string;
  enforcement: EnforcementStatus;
  notLiveYet: string;
  owner: DeferralRef;
}

export const TENANT_ADMIN_CAPABILITY_LEDGER: CapabilityStatus[] = [
  {
    capability: 'Tenant Profile',
    builtNow: 'Displays tenant id, name, residency, environment, status from mock config.',
    enforcement: 'configured-mock',
    notLiveYet: 'No tenant-record persistence or mutation; residency not enforced at query layer.',
    owner: { owner: 'Unit 22 follow-on (auth/entitlement runtime)', ref: 'ARCH-DEBT-047' },
  },
  {
    capability: 'Users',
    builtNow: 'Lists tenant users with roles, overlays, auth strength, status (mock).',
    enforcement: 'not-live',
    notLiveYet: 'No user CRUD, no invitation flow, no identity-provider sync — requires auth/entitlement runtime.',
    owner: { owner: 'spec 19-rbac-entitlement-feature-flags', ref: 'ARCH-DEBT-047' },
  },
  {
    capability: 'Roles',
    builtNow: 'Lists roles with description and scope counts (mock).',
    enforcement: 'not-live',
    notLiveYet: 'No role authoring, no permission-scope binding, no runtime RBAC enforcement (backend-authoritative per Spec #50).',
    owner: { owner: 'spec 19-rbac-entitlement-feature-flags', ref: 'ARCH-DEBT-047' },
  },
  {
    capability: 'Authority Overlays',
    builtNow: 'Lists the five authority overlays and grant models (mock), incl. Internal Risk per DEC-sec-c2-internal-cop-rbac.',
    enforcement: 'not-live',
    notLiveYet: 'No grant lifecycle (issue/expire/revoke), no audit-of-access pipeline — overlay enforcement is backend-authoritative and not yet built.',
    owner: { owner: 'DEC-sec-c2-internal-cop-rbac + auth runtime', ref: 'ARCH-DEBT-048' },
  },
  {
    capability: 'MFA Policy',
    builtNow: 'Displays MFA requirement, minimum strength, grace period (mock).',
    enforcement: 'not-live',
    notLiveYet: 'No enforcement at authentication time; no identity-provider integration.',
    owner: { owner: 'Unit 22 follow-on (auth/entitlement runtime)', ref: 'ARCH-DEBT-047' },
  },
  {
    capability: 'SSO Readiness / Configuration',
    builtNow: 'Displays SSO protocol, IdP name and readiness state; local configuration form (mock).',
    enforcement: 'not-live',
    notLiveYet: 'No live SSO provider calls, no SAML/OIDC handshake, no verification — explicitly out of scope (owner constraint; Phase-2 gated).',
    owner: { owner: 'DEC-unit22-tenant-admin-v1-deferrals', ref: 'ARCH-DEBT-049' },
  },
  {
    capability: 'Connector Settings',
    builtNow: 'Lists tenant connectors with class/state from mock connectors (Unit 38).',
    enforcement: 'not-live',
    notLiveYet: 'No connector mutation (add/configure/pause/decommission) enforced; real connector integration is Phase-2 gated.',
    owner: { owner: 'spec 16-connector-framework + Unit 39 (Phase 2)', ref: 'ARCH-DEBT-050' },
  },
  {
    capability: 'Tenant Security Posture',
    builtNow: 'Aggregate posture summary derived from mock connector health + MFA coverage.',
    enforcement: 'configured-mock',
    notLiveYet: 'Aggregates mock data only; no live posture computation.',
    owner: { owner: 'Unit 16b (Aggregate/Posture) + data-point-to-metric mapping', ref: 'DEC-command-centre-split-16a-16b' },
  },
  {
    capability: 'Internal Risk jurisdictional gate',
    builtNow: 'Surfaced as a tenant control with explicit aggregate-only-default + jurisdiction acknowledgement requirement (display).',
    enforcement: 'not-live',
    notLiveYet: 'No runtime onboarding gate that blocks internal_risk.ingestion_enabled until jurisdictional acknowledgement — pre-existing runtime enforcement gap.',
    owner: { owner: 'existing debt (Insider Risk jurisdictional gate)', ref: 'ARCH-DEBT-019' },
  },
];
