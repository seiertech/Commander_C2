'use client';

import { useMode } from '@/context/mode-context';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveFonts, primitiveTypeScale, primitiveLetterSpacing,
  primitiveSignal, primitiveSpacing, primitiveGlow, primitiveHud, primitiveFontWeight, primitivePriority,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { resolveAllStrategies } from '../../../../../../packages/contracts/src/resolvers/case-strategy-resolver';
import { thesisCases, thesisActions, thesisSubActions, thesisStrategies, thesisWarRooms, thesisTeamsDecisionEvents } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * P0 Zero-Day War Room — Commander C2 (DS-1.0, Spec 06 / Spec 24)
 *
 * Emergency Command surface — legitimately forces Mission/HUD chrome (DS-1.0
 * §9.3). Renders ONLY real data: P0 cases from thesisCases, their resolved
 * strategies, the real Action/Sub-Action board (seed-actions), and War Room
 * membership/communication data (seed-war-rooms).
 */

const MS_PER_HOUR = 3_600_000;

const HUD = {
  bg: primitiveHud.bg0, panel: primitiveHud.bg2, elevated: primitiveHud.bg3,
  text: primitiveHud.text0, textSecondary: primitiveHud.text1, textMuted: primitiveHud.text2,
  line: primitiveHud.line2, lineSubtle: primitiveHud.line,
};

function titleCase(s: string): string {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function P0WarRoomPage() {
  useMode(); // consumed; this surface forces Mission chrome per DS-1.0 §9.3.

  const now = Math.max(...thesisCases.map((c) => new Date(c.updated_at).getTime()));
  const p0Cases = thesisCases.filter((c) => c.priority === 'P0');
  const p0Ids = new Set(p0Cases.map((c) => c.id));
  const boundSubActions = thesisSubActions.filter((s) => p0Ids.has(s.case_id));

  return (
    <div style={{ background: HUD.bg, minHeight: '100%', color: HUD.text }}>
      <div className="container-xl" style={{ paddingTop: componentTokens.contentPadding, paddingBottom: componentTokens.contentPadding }}>

        {/* Emergency banner */}
        <div style={{
          padding: `${primitiveSpacing[3]} ${componentTokens.contentPadding}`,
          background: 'rgba(217,45,32,0.15)', border: `2px solid ${primitiveSignal.critical}`,
          marginBottom: componentTokens.gridGap, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: primitiveSpacing[3], boxShadow: `0 0 ${primitiveGlow.radius} rgba(217,45,32,${primitiveGlow.intensity})`,
        }} role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[3] }}>
            <span style={{ color: primitiveSignal.critical, fontWeight: primitiveFontWeight.bold, fontSize: primitiveTypeScale.h2, fontFamily: primitiveFonts.display }}>◆ EMERGENCY COMMAND</span>
            <span style={{ fontSize: primitiveTypeScale.body }}>P0 Zero-Day active — {p0Cases.length} case{p0Cases.length !== 1 ? 's' : ''}</span>
          </div>
          <span style={{ fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>War Room · ACTIVATED</span>
        </div>

        {/* AI-PLACEMENT: AI-WAR-ROOM-001 — Commander AI orientation briefing */}
        {/* AI-PLACEMENT: AI-WAR-ROOM-002 — Exploit deep-dive analysis */}

        {/* Bound P0 cases — REAL data + resolved strategies */}
        {p0Cases.map((c) => {
          const strat = resolveAllStrategies(c, thesisStrategies);
          const slaHours = strat.sla.status === 'resolved' ? strat.sla.response_hours : c.sla.target_resolution_hours;
          const ageHours = (now - new Date(c.created_at).getTime()) / MS_PER_HOUR;
          const remaining = (slaHours ?? 0) - ageHours;
          const breached = c.sla.breached || remaining <= 0;
          return (
            <div key={c.id} style={{
              padding: componentTokens.cardPadding, background: HUD.elevated,
              border: `1px solid ${primitiveSignal.critical}`, marginBottom: componentTokens.gridGap,
              boxShadow: `0 0 ${primitiveGlow.radius} rgba(217,45,32,${primitiveGlow.intensity})`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[2] }}>
                    <span style={{ color: primitiveSignal.critical, fontWeight: primitiveFontWeight.bold }}>{primitivePriority.p0.shape} {primitivePriority.p0.label}</span>
                    <span style={{ color: HUD.textSecondary, fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono }}>{c.case_ref}</span>
                    <span style={{ fontSize: primitiveTypeScale.micro, padding: '1px 6px', border: `1px solid ${primitiveSignal.info}`, color: primitiveSignal.info }}>{c.surface_attribution === 'external_attack_surface' ? 'External' : 'Internal'}</span>
                  </div>
                  <h2 style={{ margin: `${primitiveSpacing[2]} 0 0`, fontSize: primitiveTypeScale.h3, fontWeight: primitiveFontWeight.bold, color: HUD.text }}>{c.title}</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>SLA</span>
                  <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.h3, fontWeight: primitiveFontWeight.bold, color: breached ? primitiveSignal.critical : primitiveSignal.warning }}>{breached ? 'BREACHED' : `${Math.round(remaining)}h left`}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginTop: primitiveSpacing[3] }}>
                <Field label="Owner" value={c.owner} />
                <Field label="Team" value={c.team} />
                <Field label="SLA target" value={slaHours !== null ? `${slaHours}h` : '—'} alert />
                <Field label="Status" value={titleCase(c.status)} />
              </div>

              {strat.routing.status === 'resolved' && (
                <div style={{ marginTop: primitiveSpacing[2], fontSize: primitiveTypeScale.micro, color: HUD.textMuted }}>
                  Escalation: {(strat.routing.escalation_path ?? []).join(' → ') || '—'}
                </div>
              )}

              <div style={{ marginTop: primitiveSpacing[3], padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, background: HUD.panel, border: `1px solid ${HUD.lineSubtle}` }}>
                <span style={{ fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Routing Rationale</span>
                <p style={{ margin: `${primitiveSpacing[1]} 0 0`, fontSize: primitiveTypeScale.caption, color: HUD.textSecondary, lineHeight: 1.43 }}>{c.routingRationale}</p>
              </div>
            </div>
          );
        })}

        {p0Cases.length === 0 && (
          <div style={{ padding: componentTokens.cardPadding, background: HUD.panel, border: `1px solid ${HUD.line}`, textAlign: 'center', marginBottom: componentTokens.gridGap }}>
            <p style={{ color: HUD.textMuted, fontSize: primitiveTypeScale.body }}>No active P0 conditions. War Room is clear.</p>
          </div>
        )}

        {/* Sub-action board — REAL data (bound to P0 cases) */}
        <Panel title={`Sub-Action Board (${boundSubActions.length})`} subtitle="Real remediation steps across bound P0 cases (seed-actions)">
          {boundSubActions.length === 0 ? (
            <p style={{ margin: 0, color: HUD.textMuted, fontSize: primitiveTypeScale.caption }}>No sub-actions on bound P0 cases.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead><tr>{['#', 'Method', 'D3FEND', 'Owner', 'Outcome', 'Effort'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, borderBottom: `1px solid ${HUD.line}`, color: HUD.textMuted, fontSize: primitiveTypeScale.micro, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {boundSubActions.sort((a, b) => a.sequence_order - b.sequence_order).map((s) => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${HUD.lineSubtle}` }}>
                    <td style={{ padding: primitiveSpacing[2], fontFamily: primitiveFonts.mono, color: HUD.textMuted }}>{s.sequence_order}</td>
                    <td style={{ padding: primitiveSpacing[2], color: HUD.text }}>{s.executionMethod}</td>
                    <td style={{ padding: primitiveSpacing[2] }}><span style={{ fontSize: primitiveTypeScale.micro, padding: '1px 6px', background: primitiveSignal.info, color: '#fff', textTransform: 'uppercase' }}>{s.tactic_type}</span></td>
                    <td style={{ padding: primitiveSpacing[2], color: HUD.textSecondary }}>{s.owner}</td>
                    <td style={{ padding: primitiveSpacing[2], color: HUD.textSecondary }}>{titleCase(s.outcomeClassification)}</td>
                    <td style={{ padding: primitiveSpacing[2], fontFamily: primitiveFonts.mono, color: HUD.textMuted }}>{s.actual_effort_hours}/{s.estimated_effort_hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        {/* War Room Membership — REAL data from seed-war-rooms.ts (UC-200) */}
        {thesisWarRooms.filter((wr) => wr.status === 'activated').map((wr) => (
          <Panel key={wr.id} title={`War Room Membership — ${wr.warRoomRef}`} subtitle={`${wr.membership.length} members · Status: ${wr.status}`}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead><tr>{['User', 'Role', 'Joined', 'Acknowledged'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, borderBottom: `1px solid ${HUD.line}`, color: HUD.textMuted, fontSize: primitiveTypeScale.micro, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {wr.membership.map((m) => (
                  <tr key={m.user_id} style={{ borderBottom: `1px solid ${HUD.lineSubtle}` }}>
                    <td style={{ padding: primitiveSpacing[2], color: HUD.text }}>{m.user_id}</td>
                    <td style={{ padding: primitiveSpacing[2] }}><span style={{ fontSize: primitiveTypeScale.micro, padding: '1px 6px', background: m.role === 'senior_owner' ? primitiveSignal.critical : primitiveSignal.info, color: '#fff', textTransform: 'uppercase' }}>{m.role}</span></td>
                    <td style={{ padding: primitiveSpacing[2], fontFamily: primitiveFonts.mono, color: HUD.textMuted, fontSize: primitiveTypeScale.micro }}>{new Date(m.joined_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td style={{ padding: primitiveSpacing[2], fontFamily: primitiveFonts.mono, color: HUD.textMuted, fontSize: primitiveTypeScale.micro }}>{m.acknowledged_at ? new Date(m.acknowledged_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        ))}

        {/* Decision Log — REAL data from seed-teams-decision-events.ts (UC-200) */}
        <Panel title="Decision Log" subtitle="Teams decision events bound to War Room cases">
          {thesisTeamsDecisionEvents.length === 0 ? (
            <p style={{ margin: 0, color: HUD.textMuted, fontSize: primitiveTypeScale.caption }}>No decision events recorded.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead><tr>{['Case', 'Type', 'Decision', 'Responded By', 'Time'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, borderBottom: `1px solid ${HUD.line}`, color: HUD.textMuted, fontSize: primitiveTypeScale.micro, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {thesisTeamsDecisionEvents.slice(0, 5).map((d) => (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${HUD.lineSubtle}` }}>
                    <td style={{ padding: primitiveSpacing[2], color: HUD.text, fontFamily: primitiveFonts.mono }}>{d.case_id}</td>
                    <td style={{ padding: primitiveSpacing[2] }}><span style={{ fontSize: primitiveTypeScale.micro, padding: '1px 6px', border: `1px solid ${HUD.line}`, color: HUD.textSecondary }}>{d.requestType}</span></td>
                    <td style={{ padding: primitiveSpacing[2] }}><span style={{ fontSize: primitiveTypeScale.micro, padding: '1px 6px', background: d.decision === 'approved' || d.decision === 'confirmed' ? primitiveSignal.success : d.decision === 'denied' ? primitiveSignal.critical : primitiveSignal.warning, color: '#fff', textTransform: 'uppercase' }}>{d.decision ?? 'pending'}</span></td>
                    <td style={{ padding: primitiveSpacing[2], color: HUD.textSecondary }}>{d.respondedBy ?? '—'}</td>
                    <td style={{ padding: primitiveSpacing[2], fontFamily: primitiveFonts.mono, color: HUD.textMuted, fontSize: primitiveTypeScale.micro }}>{d.respondedAt ? new Date(d.respondedAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        {/* Communication Cadence — REAL data from seed-war-rooms.ts (UC-200) */}
        {thesisWarRooms.filter((wr) => wr.status === 'activated').map((wr) => (
          <Panel key={`comm-${wr.id}`} title="Communication Cadence & Bridge Posts" subtitle={`Subscribers: ${wr.subscribers.length} · Cadence profile active`}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: primitiveSpacing[3], marginBottom: primitiveSpacing[3] }}>
              <div><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Activated</span><span style={{ fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono, color: HUD.text }}>{wr.communication_cadence.activatedCadenceMinutes}min</span></div>
              <div><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Monitoring</span><span style={{ fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono, color: HUD.text }}>{wr.communication_cadence.monitoringCadenceMinutes}min</span></div>
              <div><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Winding Down</span><span style={{ fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono, color: HUD.text }}>{wr.communication_cadence.windingDownCadenceMinutes}min</span></div>
              <div><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Exec Update</span><span style={{ fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono, color: HUD.text }}>{wr.communication_cadence.execUpdateCadenceMinutes}min</span></div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead><tr>{['Subscriber', 'Channels', 'Cadence'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, borderBottom: `1px solid ${HUD.line}`, color: HUD.textMuted, fontSize: primitiveTypeScale.micro, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {wr.subscribers.map((s) => (
                  <tr key={s.user_id} style={{ borderBottom: `1px solid ${HUD.lineSubtle}` }}>
                    <td style={{ padding: primitiveSpacing[2], color: HUD.text }}>{s.user_id}</td>
                    <td style={{ padding: primitiveSpacing[2], color: HUD.textSecondary }}>{s.channels.join(', ')}</td>
                    <td style={{ padding: primitiveSpacing[2] }}><span style={{ fontSize: primitiveTypeScale.micro, padding: '1px 6px', border: `1px solid ${HUD.line}`, color: HUD.textSecondary }}>{s.cadence}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: componentTokens.cardPadding, background: HUD.elevated, border: `1px solid ${HUD.line}`, marginBottom: componentTokens.gridGap }}>
      <div style={{ marginBottom: componentTokens.cardHeaderMargin }}>
        <h3 style={{ margin: 0, fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: HUD.text, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{title}</h3>
        {subtitle && <span style={{ fontSize: primitiveTypeScale.micro, color: HUD.textMuted }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <span style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: alert ? primitiveSignal.critical : HUD.text, fontFamily: primitiveFonts.mono }}>{value}</span>
    </div>
  );
}
