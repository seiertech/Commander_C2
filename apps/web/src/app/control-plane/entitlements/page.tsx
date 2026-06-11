'use client';

import { colors } from '../../../../../../packages/ui/src/tokens/colors';
import { typography } from '../../../../../../packages/ui/src/tokens/typography';
import { thesisEntitlements, thesisCustomers, thesisDeployments, thesisLicences, thesisTenantConfigs, thesisSupportOperations, thesisFeatureRegistry, thesisModels, thesisRules, thesisConnectors } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Commercial Control Plane — Entitlement Manifest Editor
 *
 * Source: Thesis Commander Internal Control Plane UI Surface
 * Use Case: UC-158 — Manage entitlement manifests
 * Boundary: control-plane (internal Seiertech application)
 * Data: entitlement-manifest.ts + seed-entitlements
 */
export default function ControlPlaneEntitlementsPage() {
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ color: colors.controlPlane.text, margin: '0 0 4px', fontSize: typography.fontSize.lg }}>
          Entitlement Manifests
        </h2>
        <p style={{ color: colors.controlPlane.muted, margin: 0, fontSize: typography.fontSize.sm }}>
          Manage module allocation, connector limits, and feature entitlements per tenant.
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: typography.fontSize.sm }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.controlPlane.line}` }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: colors.controlPlane.muted, textTransform: 'uppercase', fontSize: typography.fontSize.xs, letterSpacing: typography.letterSpacing.eyebrow }}>Tenant</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: colors.controlPlane.muted, textTransform: 'uppercase', fontSize: typography.fontSize.xs, letterSpacing: typography.letterSpacing.eyebrow }}>Manifest ID</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: colors.controlPlane.muted, textTransform: 'uppercase', fontSize: typography.fontSize.xs, letterSpacing: typography.letterSpacing.eyebrow }}>Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: colors.controlPlane.muted, textTransform: 'uppercase', fontSize: typography.fontSize.xs, letterSpacing: typography.letterSpacing.eyebrow }}>Tier</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', color: colors.controlPlane.muted, textTransform: 'uppercase', fontSize: typography.fontSize.xs, letterSpacing: typography.letterSpacing.eyebrow }}>Connectors</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', color: colors.controlPlane.muted, textTransform: 'uppercase', fontSize: typography.fontSize.xs, letterSpacing: typography.letterSpacing.eyebrow }}>AI</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', color: colors.controlPlane.muted, textTransform: 'uppercase', fontSize: typography.fontSize.xs, letterSpacing: typography.letterSpacing.eyebrow }}>Automation</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', color: colors.controlPlane.muted, textTransform: 'uppercase', fontSize: typography.fontSize.xs, letterSpacing: typography.letterSpacing.eyebrow }}>Fusion Map</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: colors.controlPlane.muted, textTransform: 'uppercase', fontSize: typography.fontSize.xs, letterSpacing: typography.letterSpacing.eyebrow }}>Modules</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: colors.controlPlane.muted, textTransform: 'uppercase', fontSize: typography.fontSize.xs, letterSpacing: typography.letterSpacing.eyebrow }}>Effective</th>
            </tr>
          </thead>
          <tbody>
            {thesisEntitlements.map((manifest) => (
              <tr key={manifest.id} style={{ borderBottom: `1px solid ${colors.controlPlane.line}` }}>
                <td style={{ padding: '10px 12px', color: colors.controlPlane.text, fontWeight: 600 }}>{manifest.tenant_id}</td>
                <td style={{ padding: '10px 12px', color: colors.controlPlane.muted, fontSize: typography.fontSize.xs, fontFamily: 'monospace' }}>{manifest.manifest_id}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: typography.fontSize.xs,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: manifest.status === 'active' ? 'rgba(47,179,68,0.15)' : manifest.status === 'trial' ? 'rgba(247,191,56,0.15)' : 'rgba(255,77,77,0.15)',
                    color: manifest.status === 'active' ? '#2fb344' : manifest.status === 'trial' ? '#f7bf38' : '#ff4d4d',
                  }}>{manifest.status}</span>
                </td>
                <td style={{ padding: '10px 12px', color: colors.controlPlane.text }}>{manifest.reportingTier}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: colors.controlPlane.text }}>{manifest.connectorLimit}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: manifest.aiEnabled ? '#2fb344' : colors.controlPlane.muted }}>{manifest.aiEnabled ? '✓' : '—'}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: manifest.automationEnabled ? '#2fb344' : colors.controlPlane.muted }}>{manifest.automationEnabled ? '✓' : '—'}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: manifest.fusionMapEnabled ? '#2fb344' : colors.controlPlane.muted }}>{manifest.fusionMapEnabled ? '✓' : '—'}</td>
                <td style={{ padding: '10px 12px', color: colors.controlPlane.muted, fontSize: typography.fontSize.xs }}>
                  {manifest.modules.filter((m) => m.enabled).map((m) => m.name).join(', ') || 'None'}
                </td>
                <td style={{ padding: '10px 12px', color: colors.controlPlane.muted, fontSize: typography.fontSize.xs }}>
                  {new Date(manifest.effective_from).toLocaleDateString()} — {new Date(manifest.effective_until).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px' }}>
        <h3 style={{ color: colors.controlPlane.text, margin: '0 0 8px', fontSize: typography.fontSize.base, textTransform: 'uppercase', letterSpacing: typography.letterSpacing.eyebrow }}>Module Detail</h3>
        {thesisEntitlements.map((manifest) => (
          <div key={manifest.id} style={{ border: `1px solid ${colors.controlPlane.line}`, background: colors.controlPlane.panel, padding: '14px', marginBottom: '10px' }}>
            <h4 style={{ color: colors.controlPlane.text, margin: '0 0 8px', fontSize: typography.fontSize.sm }}>{manifest.tenant_id} — Modules</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
              {manifest.modules.map((mod) => (
                <div key={mod.module_id} style={{ padding: '8px', border: `1px solid ${colors.controlPlane.line}`, background: mod.enabled ? 'rgba(47,179,68,0.05)' : 'transparent' }}>
                  <div style={{ color: colors.controlPlane.text, fontWeight: 600, fontSize: typography.fontSize.xs }}>{mod.name}</div>
                  <div style={{ color: colors.controlPlane.muted, fontSize: typography.fontSize.xs }}>
                    {mod.category} • {mod.enabled ? 'Enabled' : 'Disabled'}{mod.limit ? ` • Limit: ${mod.limit}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
