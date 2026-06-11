'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisEvents, thesisCases } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Platform — Audit & Logs
 *
 * Source: Thesis (Audit Trail — Foundational, BLOCKED)
 * Data: audit-event.ts + seed-events (activity events)
 * Route: /platform/audit | Nav Group: Platform
 *
 * Displays: activity event timeline from seed-events fixture.
 * Note: Full audit-event entity (AuditEvent) exists but seed-events uses a
 * simplified SeedEvent shape. Renders what exists.
 */

export default function PlatformAuditPage() {
  const { tokens } = useMode();
  const events = [...thesisEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const criticalCount = events.filter((e) => e.severity === 'critical').length;
  const warningCount = events.filter((e) => e.severity === 'warning').length;
  const infoCount = events.filter((e) => e.severity === 'info' || e.severity === 'neutral').length;

  return (
    <PageContainer
      pretitle="Platform › Audit & Logs"
      title="Audit Trail"
      headerActions={<span className="badge bg-blue-lt">{events.length} events</span>}
    >
      {/* KPI Tiles */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Total Events</div>
              <div className="h1 mb-0">{events.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Critical</div>
              <div className="h1 mb-0" style={{ color: primitiveSignal.critical }}>{criticalCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Warning</div>
              <div className="h1 mb-0" style={{ color: primitiveSignal.warning }}>{warningCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Info / Neutral</div>
              <div className="h1 mb-0">{infoCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Timeline */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Activity Timeline</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Severity</th>
                  <th>Message</th>
                  <th>Entity</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 30).map((e) => (
                  <tr key={e.id}>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption, whiteSpace: 'nowrap' }}>
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                      <SeverityBadge severity={e.severity} />
                    </td>
                    <td style={{ fontSize: primitiveTypeScale.body }}>{e.message}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{e.entity_ref}</td>
                    <td><span className="badge bg-secondary">{e.entity_type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {events.length > 30 && (
            <div className="card-footer text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
              Showing 30 of {events.length} events
            </div>
          )}
        </div>
      </div>
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{casesCount} Cases</span>
        </div>
      </section>
    </PageContainer>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: 'bg-red',
    warning: 'bg-orange',
    info: 'bg-blue-lt',
    success: 'bg-green-lt',
    neutral: 'bg-secondary',
  };
  return <span className={`badge ${map[severity] || 'bg-secondary'}`}>{severity}</span>;
}
