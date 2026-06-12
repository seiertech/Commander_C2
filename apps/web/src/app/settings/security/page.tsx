'use client';

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveLetterSpacing, primitiveFontWeight, primitiveFonts } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisAuthSessions, thesisBreakGlass, thesisRbacPolicies, thesisTenantConfigs, thesisConnectors, thesisRules, thesisFeatureRegistry, thesisAssets, thesisCases, thesisStrategies, thesisMissions, thesisPostures } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { useMode } from '@/context/mode-context';

/**
 * Security Settings — Platform Security & Hardening (Spec 35)
 *
 * Source: Thesis Platform Security and Hardening
 * Data: auth-session.ts, break-glass-request.ts, rbac-policy.ts + seed fixtures
 * Use Cases: UC-151 (break-glass), UC-148 (auth), UC-152 (RBAC)
 * Route: /settings/security | Boundary: tenant-admin
 *
 * Displays break-glass requests, active sessions, RBAC policy summary.
 */

export default function SettingsSecurityPage() {
  const { mode, tokens } = useMode();
  const activeSessions = thesisAuthSessions.filter((s) => s.status === 'active');
  const pendingBreakGlass = thesisBreakGlass.filter((r) => r.status === 'pending');
  const activeRbacPolicies = thesisRbacPolicies.filter((p) => p.active);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="badge bg-green-lt">{status}</span>;
      case 'approved': return <span className="badge bg-green-lt">{status}</span>;
      case 'pending': return <span className="badge bg-yellow-lt">{status}</span>;
      case 'expired': return <span className="badge bg-secondary">{status}</span>;
      case 'revoked': return <span className="badge bg-red-lt">{status}</span>;
      case 'denied': return <span className="badge bg-red-lt">{status}</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <PageContainer
      pretitle="Settings › Security"
      title="Platform Security"
      headerActions={<span className="badge bg-blue-lt">{activeSessions.length} active sessions</span>}
    >
      {/* KPI Strip */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Active Sessions</div>
              <div className="h1 mb-0">{activeSessions.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Pending Break-Glass</div>
              <div className="h1 mb-0">{pendingBreakGlass.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">RBAC Policies</div>
              <div className="h1 mb-0">{activeRbacPolicies.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">MFA Verified</div>
              <div className="h1 mb-0">{thesisAuthSessions.filter((s) => s.mfaVerified).length}/{thesisAuthSessions.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Break-Glass Requests */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Break-Glass Requests</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Requestor</th>
                  <th>Scope</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {thesisBreakGlass.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{r.request_id}</td>
                    <td>{r.requestorId}</td>
                    <td><span className="badge bg-azure-lt">{r.scope}</span></td>
                    <td className="text-truncate" style={{ maxWidth: 220 }}>{r.reason}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{new Date(r.expires_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Sessions</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>MFA</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {thesisAuthSessions.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{s.user_id}</td>
                    <td className="text-muted">{s.ip_address}</td>
                    <td>{s.mfaVerified ? <span className="badge bg-green-lt">Verified</span> : <span className="badge bg-red-lt">No MFA</span>}</td>
                    <td>{statusBadge(s.status)}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{new Date(s.created_at).toLocaleString()}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{new Date(s.expires_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RBAC Policy Summary */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">RBAC Policy Summary</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Scope</th>
                  <th>Permissions</th>
                  <th>Condition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {thesisRbacPolicies.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{p.role}</td>
                    <td><span className="badge bg-azure-lt">{p.resourceScope}</span></td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{p.permissions.length} permissions</td>
                    <td className="text-muted">{p.condition ?? '—'}</td>
                    <td>{p.active ? <span className="badge bg-green-lt">Active</span> : <span className="badge bg-secondary">Inactive</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI-PLACEMENT: AICAP — Security posture recommendation engine */}
      {/* AI-PLACEMENT: AICAP — Break-glass risk assessment advisor */}

      <div className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
        Security configuration (session policy, break-glass approval, RBAC edit) is read-only in Phase 1.
      </div>
    
      {/* Configuration Context — Sweep 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Tenant Configs</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisTenantConfigs.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>RBAC Policies</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisRbacPolicies.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Connectors</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisConnectors.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Rules</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisRules.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Assets</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisAssets.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Cases</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisCases.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Strategies</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisStrategies.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Missions</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisMissions.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Postures</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisPostures.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Features</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisFeatureRegistry.length}</span></div>
      </div>
    </PageContainer>
  );
}
