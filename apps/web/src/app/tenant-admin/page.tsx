import { colors } from '../../../../../packages/ui/src/tokens/colors';
import { typography } from '../../../../../packages/ui/src/tokens/typography';
import {
  MOCK_TENANT_PROFILE,
  MOCK_TENANT_USERS,
  MOCK_TENANT_ROLES,
  MOCK_AUTHORITY_OVERLAYS,
  MOCK_MFA_POLICY,
  MOCK_SSO_CONFIG,
  MOCK_TENANT_CONNECTOR_SETTINGS,
  TENANT_ADMIN_CAPABILITY_LEDGER,
  type EnforcementStatus,
} from './mock-tenant-config';

/**
 * Tenant Admin Surface v1 — Unit 22 (second application boundary)
 *
 * Source: Spec #39 Commander Application Boundary; SDR Control Plane Spec v1.1; Spec #47 (Tenant Admin).
 * Visual language: Tenant Admin chrome (inherited, provisional per DEC-v1.3.2-tenant-admin-shell-pending-reference),
 * provided by tenant-admin/layout.tsx. Visual intensity ceiling Level 2 (controlled administrative console).
 *
 * SCOPE (Unit 22 v1 — owner-authorised display + mock-backed configuration):
 *   tenant profile · users · roles · authority overlays · MFA policy · SSO readiness/config ·
 *   connector settings · tenant security posture · local/mock configuration flows.
 *
 * EXPLICITLY NOT LIVE (owner constraints): live SSO provider calls, live vendor API calls,
 * live AWS resources, production billing/admin effects. No runtime enforcement of RBAC,
 * user mutation, MFA, SSO, or connector mutation (no auth/entitlement runtime exists yet).
 *
 * CRITICAL RULE COMPLIANCE: every capability displayed here carries an explicit enforcement
 * badge ('Configured (mock)' vs 'Not live'), and every not-live capability names where its
 * follow-up is recorded. The authoritative ledger is TENANT_ADMIN_CAPABILITY_LEDGER, and the
 * deferrals are recorded in DECISIONS.md (DEC-unit22-tenant-admin-v1-deferrals) and
 * ARCH-DEBT-047..050 (+ existing ARCH-DEBT-019). No hidden deferral in prose/comments only.
 *
 * Boundary: tenant-admin. Status: BUILD (v1).
 */

const ink = colors.operational.ink;
const muted = colors.operational.muted;

function EnforcementBadge({ status }: { status: EnforcementStatus }) {
  const isMock = status === 'configured-mock';
  return (
    <span
      data-enforcement={status}
      style={{
        fontSize: typography.fontSize.xs,
        padding: '2px 8px',
        borderRadius: '2px',
        whiteSpace: 'nowrap',
        background: isMock ? 'rgba(232,163,23,0.14)' : 'rgba(217,45,32,0.12)',
        color: isMock ? '#8a6400' : '#a3201a',
        border: `1px solid ${isMock ? 'rgba(232,163,23,0.5)' : 'rgba(217,45,32,0.45)'}`,
      }}
    >
      {isMock ? 'Configured (mock)' : 'Not live'}
    </span>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section data-section={id} style={{ border: `1px solid ${colors.operational.line ?? '#d7dee8'}`, background: '#fff', padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: typography.fontSize.md, color: ink, margin: '0 0 12px' }}>{title}</h2>
      {children}
    </section>
  );
}

export default function TenantAdminOverviewPage() {
  const p = MOCK_TENANT_PROFILE;

  return (
    <div>
      <header style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: typography.fontSize.h1, color: ink, margin: '0 0 4px' }}>Tenant Administration</h1>
        <p style={{ color: muted, fontSize: typography.fontSize.base, margin: 0 }}>
          Tenant Admin Surface v1 — display and local/mock configuration. Live enforcement is recorded as deferred
          (see Capability Status). Intensity ceiling Level 2.
        </p>
      </header>

      {/* Tenant Profile */}
      <Section id="tenant-profile" title="Tenant Profile">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <Field label="Tenant" value={p.tenantName} />
          <Field label="Tenant ID" value={p.tenantId} />
          <Field label="Residency" value={p.residency} />
          <Field label="Environment" value={p.environment} />
          <Field label="Status" value={p.status} />
        </div>
      </Section>

      {/* Users */}
      <Section id="users" title="Users">
        <Table head={['User', 'Email', 'Roles', 'Authority Overlays', 'Auth', 'Status']}
          rows={MOCK_TENANT_USERS.map((u) => [u.displayName, u.email, u.roles.join(', '), u.authorityOverlays.join(', '), u.authStrength, u.status])} />
      </Section>

      {/* Roles */}
      <Section id="roles" title="Roles">
        <Table head={['Role', 'Description', 'Scopes']}
          rows={MOCK_TENANT_ROLES.map((r) => [r.name, r.description, String(r.scopeCount)])} />
      </Section>

      {/* Authority Overlays */}
      <Section id="authority-overlays" title="Authority Overlays">
        <Table head={['Overlay', 'Description', 'Grant Model']}
          rows={MOCK_AUTHORITY_OVERLAYS.map((o) => [o.name, o.description, o.grantModel])} />
        <p style={{ color: muted, fontSize: typography.fontSize.xs, marginTop: '8px' }}>
          Internal Risk overlay enforcement is governed by DEC-sec-c2-internal-cop-rbac (aggregate-only default;
          per-identity tier gated; audit-of-access; jurisdiction-aware). Grant lifecycle is not yet enforced — see Capability Status.
        </p>
      </Section>

      {/* MFA Policy */}
      <Section id="mfa-policy" title="MFA Policy">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <Field label="MFA Required" value={MOCK_MFA_POLICY.required ? 'Yes' : 'No'} />
          <Field label="Minimum Strength" value={MOCK_MFA_POLICY.minimumStrength} />
          <Field label="Grace Period" value={`${MOCK_MFA_POLICY.gracePeriodDays} days`} />
        </div>
      </Section>

      {/* SSO Readiness / Configuration */}
      <Section id="sso" title="SSO Readiness / Configuration">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <Field label="Configured" value={MOCK_SSO_CONFIG.configured ? 'Yes (mock)' : 'No'} />
          <Field label="Protocol" value={MOCK_SSO_CONFIG.protocol} />
          <Field label="Identity Provider" value={MOCK_SSO_CONFIG.idpName} />
          <Field label="Readiness" value={MOCK_SSO_CONFIG.readiness} />
        </div>
        <p style={{ color: muted, fontSize: typography.fontSize.xs, marginTop: '8px' }}>
          No live SSO provider calls are made (owner constraint; Phase-2 gated). This is readiness/configuration only.
        </p>
      </Section>

      {/* Connector Settings */}
      <Section id="connector-settings" title="Connector Settings">
        <Table head={['Connector', 'Classes', 'State', 'Mutation']}
          rows={MOCK_TENANT_CONNECTOR_SETTINGS.map((c) => [c.name, c.classes.join('/'), c.state, c.mutationEnforced ? 'enforced' : 'not enforced'])} />
        <p style={{ color: muted, fontSize: typography.fontSize.xs, marginTop: '8px' }}>
          Connector add/configure/pause/decommission are not enforced; real connector integration is Phase-2 gated.
        </p>
      </Section>

      {/* Tenant Security Posture */}
      <Section id="security-posture" title="Tenant Security Posture">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <Field label="Connectors active" value={`${MOCK_TENANT_CONNECTOR_SETTINGS.filter((c) => c.state === 'active').length}/${MOCK_TENANT_CONNECTOR_SETTINGS.length}`} />
          <Field label="MFA coverage" value={`${MOCK_TENANT_USERS.filter((u) => u.authStrength !== 'password-only').length}/${MOCK_TENANT_USERS.length} users`} />
          <Field label="Residency" value={p.residency} />
        </div>
        <p style={{ color: muted, fontSize: typography.fontSize.xs, marginTop: '8px' }}>
          Aggregate over mock data only; live posture computation is owned by Unit 16b + the data-point-to-metric mapping.
        </p>
      </Section>

      {/* Capability Status — the explicit live/not-live ledger (critical-rule compliance) */}
      <Section id="capability-status" title="Capability Status — Built vs Not-Live (deferral ledger)">
        <p style={{ color: muted, fontSize: typography.fontSize.xs, margin: '0 0 12px' }}>
          Every capability above is display/mock in v1. The table below is the authoritative record of what is built now,
          what is not live yet, and which debt/decision/unit owns the follow-up. Source: TENANT_ADMIN_CAPABILITY_LEDGER;
          recorded in DECISIONS.md (DEC-unit22-tenant-admin-v1-deferrals) and ARCH-DEBT-047..050 (+ ARCH-DEBT-019).
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: typography.fontSize.xs }}>
            <thead>
              <tr>
                {['Capability', 'Enforcement', 'Built now', 'Not live yet', 'Owned by'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', borderBottom: `1px solid ${colors.operational.line ?? '#d7dee8'}`, padding: '6px', color: muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TENANT_ADMIN_CAPABILITY_LEDGER.map((c) => (
                <tr key={c.capability}>
                  <td style={{ padding: '6px', color: ink, verticalAlign: 'top' }}>{c.capability}</td>
                  <td style={{ padding: '6px', verticalAlign: 'top' }}><EnforcementBadge status={c.enforcement} /></td>
                  <td style={{ padding: '6px', color: muted, verticalAlign: 'top' }}>{c.builtNow}</td>
                  <td style={{ padding: '6px', color: muted, verticalAlign: 'top' }}>{c.notLiveYet}</td>
                  <td style={{ padding: '6px', color: ink, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{c.owner.ref}<br /><span style={{ color: muted }}>{c.owner.owner}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: typography.fontSize.xs, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: typography.fontSize.base, color: ink }}>{value}</div>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: typography.fontSize.sm }}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} style={{ textAlign: 'left', borderBottom: `1px solid ${colors.operational.line ?? '#d7dee8'}`, padding: '6px', color: muted, fontSize: typography.fontSize.xs }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} style={{ padding: '6px', color: ink, borderBottom: `1px solid ${colors.operational.line ?? '#eef2f7'}` }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
