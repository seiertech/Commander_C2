import { colors } from '../../../../../packages/ui/src/tokens/colors';
import { typography } from '../../../../../packages/ui/src/tokens/typography';
import { thesisEntitlements, thesisCustomers, thesisConnectors, thesisDeployments } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Commercial Control Plane — Operator Command Home
 *
 * Source: Thesis Commander Internal Control Plane UI Surface
 * Use Cases: UC-157 (operator command home), UC-160 (trial conversion metrics)
 * Boundary: control-plane (internal Seiertech application)
 *
 * NOTE: This page renders inside control-plane/layout.tsx, which provides the
 * Control Plane's own dark chrome AND its page-header.
 */
export default function ControlPlaneOverviewPage() {
  const totalCustomers = thesisCustomers.length;
  const activeTrials = thesisEntitlements.filter((e) => e.status === 'trial').length;
  const entitlementExceptions = thesisEntitlements.filter((e) => e.status === 'suspended' || e.status === 'expired').length;
  const activeConnectors = thesisConnectors.filter((c) => c.state === 'active').length;
  const totalConnectors = thesisConnectors.length;
  const deploymentRings = thesisDeployments.length;

  const kpis = [
    { label: 'Total Customers', value: totalCustomers },
    { label: 'Active Trials', value: activeTrials },
    { label: 'Entitlement Exceptions', value: entitlementExceptions },
    { label: 'Connector Health', value: `${active_connectors}/${totalConnectors}` },
    { label: 'Deployment Rings', value: deploymentRings },
  ];

  return (
    <div>
      {/* Operator Command KPI Section — UC-157, UC-160 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '18px' }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ border: `1px solid ${colors.controlPlane.line}`, background: colors.controlPlane.panel, padding: '14px', textAlign: 'center' }}>
            <div style={{ color: colors.controlPlane.muted, textTransform: 'uppercase', fontSize: typography.fontSize.xs, letterSpacing: typography.letterSpacing.eyebrow, marginBottom: '6px' }}>{kpi.label}</div>
            <div style={{ color: colors.controlPlane.text, fontSize: typography.fontSize.xl, fontWeight: 700 }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Existing info panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        <div style={{ border: `1px solid ${colors.controlPlane.line}`, background: colors.controlPlane.panel, padding: '18px', minHeight: '120px' }}>
          <h3 style={{ margin: '0 0 10px', color: colors.controlPlane.text, textTransform: 'uppercase', fontSize: typography.fontSize.base, letterSpacing: typography.letterSpacing.eyebrow }}>Commercial Authority</h3>
          <p style={{ color: colors.controlPlane.muted, margin: 0, lineHeight: typography.lineHeight.normal }}>Customers, tenants, licences, entitlements, module allocation and feature flags are controlled here.</p>
        </div>
        <div style={{ border: `1px solid ${colors.controlPlane.line}`, background: colors.controlPlane.panel, padding: '18px', minHeight: '120px' }}>
          <h3 style={{ margin: '0 0 10px', color: colors.controlPlane.text, textTransform: 'uppercase', fontSize: typography.fontSize.base, letterSpacing: typography.letterSpacing.eyebrow }}>Rule / Model Packs</h3>
          <p style={{ color: colors.controlPlane.muted, margin: 0, lineHeight: typography.lineHeight.normal }}>Platform rule packs, model packs and baseline profiles are owned and versioned here.</p>
        </div>
        <div style={{ border: `1px solid ${colors.controlPlane.line}`, background: colors.controlPlane.panel, padding: '18px', minHeight: '120px' }}>
          <h3 style={{ margin: '0 0 10px', color: colors.controlPlane.text, textTransform: 'uppercase', fontSize: typography.fontSize.base, letterSpacing: typography.letterSpacing.eyebrow }}>Deployment Rings</h3>
          <p style={{ color: colors.controlPlane.muted, margin: 0, lineHeight: typography.lineHeight.normal }}>Release eligibility, tenant versions, rollback state and support access are governed separately from tenant runtime.</p>
        </div>
      </div>
    </div>
  );
}
