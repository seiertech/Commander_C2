'use client';

import { thesisCases, thesisEvents } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useMode } from '@/context/mode-context';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import {
  primitiveFonts, primitiveTypeScale, primitiveLetterSpacing,
  primitiveSignal, primitiveSpacing, primitiveFontWeight, primitivePriority, primitiveHud, primitiveGlow,
} from '../../../../../packages/ui/src/tokens/primitives';
import { PageContainer } from '@/components/page-container';
import { CaseCard } from '@/components/case-card';
import type { Case } from '../../../../../packages/contracts/src/entities/case';
import {
  FLOW_LANES, laneOf, isClosed, isNew, slaState, riskScore, ageLabel,
  momentum, PRIORITIES, type FlowLane,
} from './case-metrics';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Case Handling Dashboard — Commander C2 (Thesis §11 — Case & Remediation Workflow)
 *
 * Built to the governing mockup `case-handling-dashboard.png` (Mission/HUD dark)
 * and the thesis lifecycle model:
 *   KPI strip → Closed-Loop Lifecycle Pipeline (hero) → instrument gauges →
 *   flow board of rich cards → live activity feed.
 *
 * Use Case: UC-CASE-001 — View Case Queue
 * Use Case: UC-CASE-003 — View Case Analytics
 * Entities: Case (L7), Case_Management_Metric (L8), Case_Backlog_State (L8)
 * Standards: ITIL 4, OODA, CTEM
 *
 * ITIL stages: identified/logged/categorized/prioritized/assigned/resolved/closed
 * OODA states: observe/orient/decide/act
 * CTEM phases: scoping/discovery/prioritization/validation/mobilization
 */

// ── 7-stage display pipeline (named component, Spec 06 / MOCKUP_INDEX §4) ──
const PIPELINE: { label: string; lanes: FlowLane[] }[] = [
  { label: 'New', lanes: ['new'] },
  { label: 'Triage', lanes: ['triage'] },
  { label: 'Investigating', lanes: ['in_progress'] },
  { label: 'Awaiting Feedback', lanes: [] },          // comms-awaiting (derived below)
  { label: 'Actioning', lanes: [] },                  // active remediation (derived below)
  { label: 'Validation', lanes: ['validation'] },
  { label: 'Closure', lanes: ['closure', 'closed'] },
];

// Mission/HUD surface palette (this dashboard is Mission per the mockup)
const HUD = {
  bg: primitiveHud.bg0, panel: primitiveHud.bg2, elevated: primitiveHud.bg3,
  text: primitiveHud.text0, textSecondary: primitiveHud.text1, textMuted: primitiveHud.text2,
  line: primitiveHud.line2, lineSubtle: primitiveHud.line,
};

type View = 'board' | 'table';

const STATUS_LABEL: Record<string, string> = {
  'open': 'Open', 'detected': 'Detected', 'in-progress': 'In Progress', 'in_progress': 'In Progress',
  'awaiting-validation': 'Awaiting Validation', 'awaiting-closure': 'Awaiting Closure',
  'closed': 'Closed', 'reopened': 'Reopened',
};

const SEV_COLOR: Record<string, string> = {
  critical: primitiveSignal.critical, warning: primitiveSignal.warning,
  info: primitiveSignal.info, success: primitiveSignal.success, neutral: primitiveSignal.neutral,
};

function titleCase(s: string): string {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function CaseHandlingPage() {
  useMode(); // consumed; this surface forces Mission chrome per the mockup.
  const router = useRouter();
  const [view, setView] = useState<View>('board');
  const [fPriority, setFPriority] = useState('all');
  const [fType, setFType] = useState('all');
  const [fTeam, setFTeam] = useState('all');
  const [fOwner, setFOwner] = useState('all');
  const [fSurface, setFSurface] = useState('all');
  const [showClosed, setShowClosed] = useState(true);

  const now = useMemo(() => Math.max(...thesisCases.map((c) => new Date(c.updated_at).getTime())), []);

  const typeOptions = useMemo(() => Array.from(new Set(thesisCases.map((c) => c.case_type))).sort(), []);
  const teamOptions = useMemo(() => Array.from(new Set(thesisCases.map((c) => c.team))).sort(), []);
  const ownerOptions = useMemo(() => Array.from(new Set(thesisCases.map((c) => c.owner))).sort(), []);

  const filtered = useMemo(() => thesisCases.filter((c) => {
    if (fPriority !== 'all' && c.priority !== fPriority) return false;
    if (fType !== 'all' && c.case_type !== fType) return false;
    if (fTeam !== 'all' && c.team !== fTeam) return false;
    if (fOwner !== 'all' && c.owner !== fOwner) return false;
    if (fSurface !== 'all' && c.surface_attribution !== fSurface) return false;
    if (!showClosed && isClosed(c)) return false;
    return true;
  }), [fPriority, fType, fTeam, fOwner, fSurface, showClosed]);

  // ── Metrics ──
  const openCases = thesisCases.filter((c) => !isClosed(c));
  const closedCases = thesisCases.filter(isClosed);
  const newCount = thesisCases.filter(isNew).length;
  const slaAtRisk = openCases.filter((c) => slaState(c, now).tone !== 'success').length;
  const breached = thesisCases.filter((c) => c.sla.breached).length;
  const p0 = openCases.filter((c) => c.priority === 'P0').length;
  const p1 = openCases.filter((c) => c.priority === 'P1').length;
  const stalling = openCases.filter((c) => momentum(c, now) === 'stalling').length;
  const avgRisk = openCases.length ? Math.round(openCases.reduce((a, c) => a + riskScore(c, now), 0) / openCases.length) : 0;

  // Pipeline counts (map 12-state → 7 display stages)
  const pipelineCounts = PIPELINE.map((stage) => {
    if (stage.label === 'Awaiting Feedback') {
      return thesisCases.filter((c) => (c.priority === 'P0' || c.priority === 'P1') && (c.status === 'in_progress' || c.status === 'in-progress')).length;
    }
    if (stage.label === 'Actioning') {
      return thesisCases.filter((c) => c.status === 'action_decomposed' || c.status === 'prioritised').length;
    }
    return thesisCases.filter((c) => stage.lanes.includes(laneOf(c))).length;
  });
  const activeStageIdx = pipelineCounts.findIndex((n, i) => i > 0 && n > 0); // first non-New populated stage

  // Instrument gauges (signature). value/max with red→amber→green meaning.
  const triageVelocity = Math.round((closedCases.length / Math.max(1, thesisCases.length)) * 100);
  const slaPressure = Math.round((slaAtRisk / Math.max(1, openCases.length)) * 100);
  const gauges = [
    { label: 'SLA Pressure', value: slaPressure, max: 100, invert: true },   // high = bad
    { label: 'Risk Posture', value: avgRisk, max: 100, invert: true },        // high = bad
    { label: 'Triage Velocity', value: triageVelocity, max: 100, invert: false }, // high = good
  ];

  // Lane grouping for board
  const lanes = useMemo(() => {
    const g: Record<FlowLane, Case[]> = { new: [], triage: [], in_progress: [], validation: [], closure: [], closed: [] };
    filtered.forEach((c) => g[laneOf(c)].push(c));
    (Object.keys(g) as FlowLane[]).forEach((k) => g[k].sort((a, b) => riskScore(b, now) - riskScore(a, now)));
    return g;
  }, [filtered, now]);
  const visibleLanes = showClosed ? FLOW_LANES : FLOW_LANES.filter((l) => l.id !== 'closed');

  // Live activity feed — case-related events, newest first
  const caseEvents = useMemo(() => thesisEvents
    .filter((e) => e.entity_type === 'case')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 12), []);

  return (
    <div style={{ background: HUD.bg, minHeight: '100%', color: HUD.text }}>
      <div className="container-xl" style={{ paddingTop: componentTokens.contentPadding, paddingBottom: componentTokens.contentPadding }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: primitiveSpacing[3], marginBottom: componentTokens.gridGap }}>
          <div>
            <span style={{ fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.display }}>Cases › Handling</span>
            <h1 style={{ margin: '4px 0 0', fontSize: primitiveTypeScale.h1, fontWeight: primitiveFontWeight.bold, color: HUD.text, fontFamily: primitiveFonts.body }}>Case Handling</h1>
          </div>
          <Toggle value={view} onChange={setView} />
        </div>

        {/* AI-PLACEMENT: AI-CASE-QUEUE-001 — Focus order explanation */}

        {/* SECTION 1: KPI strip */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: primitiveSpacing[2], marginBottom: componentTokens.gridGap }}>
          <Kpi label="New" value={String(newCount)} accent={newCount ? primitiveSignal.warning : undefined} hint="act next" />
          <Kpi label="Open" value={String(openCases.length)} />
          <Kpi label="P0" value={String(p0)} accent={p0 ? primitiveSignal.critical : undefined} />
          <Kpi label="P1" value={String(p1)} accent={p1 ? primitiveSignal.warning : undefined} />
          <Kpi label="SLA Breached" value={String(breached)} accent={breached ? primitiveSignal.critical : undefined} />
          <Kpi label="SLA At Risk" value={String(slaAtRisk)} accent={slaAtRisk ? primitiveSignal.warning : undefined} />
          <Kpi label="Stalling" value={String(stalling)} accent={stalling ? primitiveSignal.warning : undefined} />
          <Kpi label="Closed" value={String(closedCases.length)} />
        </section>

        {/* SECTION 2: Closed-Loop Lifecycle Pipeline (HERO) */}
        <section style={{ background: HUD.elevated, border: `1px solid ${HUD.line}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
          <span style={{ fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Closed-Loop Lifecycle</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[1], overflowX: 'auto', marginTop: primitiveSpacing[3] }}>
            {PIPELINE.map((stage, i) => {
              const active = i === activeStageIdx;
              const count = pipelineCounts[i];
              const isNewStage = i === 0;
              return (
                <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[1] }}>
                  <div style={{
                    minWidth: 96, padding: `${primitiveSpacing[2]} ${primitiveSpacing[2]}`, textAlign: 'center',
                    border: `2px solid ${active ? primitiveSignal.info : isNewStage && count ? primitiveSignal.warning : HUD.lineSubtle}`,
                    background: HUD.panel,
                    boxShadow: (active || (isNewStage && count)) ? `0 0 ${primitiveGlow.radius} rgba(59,130,246,${primitiveGlow.intensity})` : 'none',
                  }}>
                    <div style={{ fontSize: primitiveTypeScale.h3, fontWeight: primitiveFontWeight.bold, fontFamily: primitiveFonts.mono, color: count ? HUD.text : HUD.textMuted }}>{count}</div>
                    <div style={{ fontSize: primitiveTypeScale.micro, color: active || (isNewStage && count) ? primitiveSignal.info : HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, whiteSpace: 'nowrap' }}>{stage.label}</div>
                  </div>
                  {i < PIPELINE.length - 1 && <span style={{ color: HUD.lineSubtle }}>→</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: Instrument gauges (signature) — DERIVED metrics */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: componentTokens.gridGap, marginBottom: primitiveSpacing[1] }}>
          {gauges.map((g) => <Gauge key={g.label} {...g} />)}
        </section>
        <p style={{ margin: `0 0 ${componentTokens.gridGap}`, fontSize: primitiveTypeScale.micro, color: HUD.textMuted }}>
          ⓓ Derived indicators — computed from case fields, not Spec 08 scoring contracts. Risk Posture & Triage Velocity are heuristics; SLA Pressure is from real SLA state.
        </p>

        {/* SECTION 4: Filters */}
        <section style={{ display: 'flex', gap: primitiveSpacing[2], flexWrap: 'wrap', marginBottom: componentTokens.gridGap, alignItems: 'flex-end' }}>
          <Filter label="Priority" value={fPriority} onChange={setFPriority} options={['all', ...PRIORITIES]} />
          <Filter label="Type" value={fType} onChange={setFType} options={['all', ...typeOptions]} render={(o) => o === 'all' ? 'All' : titleCase(o)} />
          <Filter label="Team" value={fTeam} onChange={setFTeam} options={['all', ...teamOptions]} />
          <Filter label="Owner" value={fOwner} onChange={setFOwner} options={['all', ...ownerOptions]} />
          <Filter label="Surface" value={fSurface} onChange={setFSurface} options={['all', 'internal_attack_surface', 'external_attack_surface']} render={(o) => o === 'all' ? 'All' : o === 'external_attack_surface' ? 'External' : 'Internal'} />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: primitiveSpacing[1], fontSize: primitiveTypeScale.caption, color: HUD.textSecondary, cursor: 'pointer', height: componentTokens.inputHeight }}>
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} /> Show closed
          </label>
        </section>

        {/* SECTION 5: Board / Table + activity feed */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: componentTokens.gridGap, alignItems: 'start' }}>
          <div style={{ minWidth: 0 }}>
            {view === 'board'
              ? <BoardView lanes={lanes} visibleLanes={visibleLanes} now={now} />
              : <TableView cases={filtered} now={now} router={router} />}
          </div>

          {/* Live activity feed */}
          <aside style={{ background: HUD.elevated, border: `1px solid ${HUD.line}`, padding: componentTokens.cardPadding, position: 'sticky', top: primitiveSpacing[3] }}>
            <span style={{ fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Live Activity</span>
            <div style={{ marginTop: primitiveSpacing[3], display: 'flex', flexDirection: 'column', gap: primitiveSpacing[2], maxHeight: 520, overflowY: 'auto' }}>
              {caseEvents.map((e) => (
                <div key={e.id} onClick={() => router.push(`/cases/${e.entity_ref}`)} style={{ display: 'flex', gap: primitiveSpacing[2], cursor: 'pointer', paddingBottom: primitiveSpacing[2], borderBottom: `1px solid ${HUD.lineSubtle}` }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: SEV_COLOR[e.severity], display: 'inline-block', marginTop: 5, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: primitiveTypeScale.micro, color: HUD.textSecondary, lineHeight: 1.4 }}>{e.message}</div>
                    <div style={{ fontSize: primitiveTypeScale.micro, color: HUD.textMuted, fontFamily: primitiveFonts.mono }}>{new Date(e.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {e.entity_ref}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ── Board ──
function BoardView({ lanes, visibleLanes, now }: { lanes: Record<FlowLane, Case[]>; visibleLanes: typeof FLOW_LANES; now: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleLanes.length}, minmax(210px, 1fr))`, gap: primitiveSpacing[2], alignItems: 'start', overflowX: 'auto' }}>
      {visibleLanes.map((lane) => {
        const cards = lanes[lane.id];
        const leads = lane.id === 'new';
        return (
          <div key={lane.id} style={{ display: 'flex', flexDirection: 'column', gap: primitiveSpacing[2], minWidth: 210 }}>
            <div style={{ background: HUD.panel, padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, borderBottom: `2px solid ${leads ? primitiveSignal.warning : HUD.line}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.bold, color: leads ? primitiveSignal.warning : HUD.text, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{lane.label}</span>
                <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: HUD.textMuted }}>{cards.length}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: primitiveSpacing[2] }}>
              {cards.map((c) => <CaseCard key={c.id} caseRecord={c} now={now} hud />)}
              {cards.length === 0 && <div style={{ padding: primitiveSpacing[3], border: `1px dashed ${HUD.lineSubtle}`, textAlign: 'center', color: HUD.textMuted, fontSize: primitiveTypeScale.micro }}>—</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Table ──
function TableView({ cases, now, router }: { cases: Case[]; now: number; router: ReturnType<typeof useRouter> }) {
  const sorted = [...cases].sort((a, b) => riskScore(b, now) - riskScore(a, now));
  return (
    <div style={{ background: HUD.elevated, border: `1px solid ${HUD.line}`, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
        <thead>
          <tr>{['Priority', 'Risk', 'Case Ref', 'Title', 'Type', 'Status', 'Owner', 'SLA', 'Age', 'Surface'].map((h) => (
            <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${HUD.line}`, color: HUD.textSecondary, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro, whiteSpace: 'nowrap' }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const pr = primitivePriority[c.priority.toLowerCase() as keyof typeof primitivePriority];
            const sla = slaState(c, now);
            const risk = riskScore(c, now);
            const toneColor = sla.tone === 'critical' ? primitiveSignal.critical : sla.tone === 'warning' ? primitiveSignal.warning : primitiveSignal.success;
            return (
              <tr key={c.id} onClick={() => router.push(`/cases/${c.id}`)} style={{ cursor: 'pointer', borderBottom: `1px solid ${HUD.lineSubtle}` }}>
                <td style={tdHud}><span style={{ color: pr.color, fontWeight: primitiveFontWeight.semibold }}>{pr.shape} {pr.label}</span></td>
                <td style={{ ...tdHud, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: risk >= 75 ? primitiveSignal.critical : risk >= 50 ? primitiveSignal.warning : HUD.textSecondary }}>{risk}</td>
                <td style={{ ...tdHud, fontFamily: primitiveFonts.mono }}>{c.case_ref}</td>
                <td style={{ ...tdHud, maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: HUD.text }} title={c.title}>{c.title}</td>
                <td style={tdHud}>{titleCase(c.case_type)}</td>
                <td style={{ ...tdHud, whiteSpace: 'nowrap' }}>{STATUS_LABEL[c.status] ?? c.status}</td>
                <td style={tdHud}>{c.owner}</td>
                <td style={tdHud}><span style={{ padding: `2px ${primitiveSpacing[2]}`, background: toneColor, color: '#fff', fontSize: primitiveTypeScale.micro, whiteSpace: 'nowrap' }}>{sla.label}</span></td>
                <td style={{ ...tdHud, fontFamily: primitiveFonts.mono, whiteSpace: 'nowrap' }}>{ageLabel(c, now)}</td>
                <td style={tdHud}><span style={{ fontSize: primitiveTypeScale.micro, padding: '1px 6px', border: `1px solid ${c.surface_attribution === 'external_attack_surface' ? primitiveSignal.info : HUD.lineSubtle}`, color: c.surface_attribution === 'external_attack_surface' ? primitiveSignal.info : HUD.textMuted }}>{c.surface_attribution === 'external_attack_surface' ? 'EXT' : 'INT'}</span></td>
              </tr>
            );
          })}
          {sorted.length === 0 && <tr><td colSpan={10} style={{ ...tdHud, textAlign: 'center', color: HUD.textMuted, padding: primitiveSpacing[6] }}>No cases match the current filters.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

const tdHud: React.CSSProperties = { padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: HUD.textSecondary, height: componentTokens.tableRowHeight };

// ── Instrument gauge (ApexCharts radialBar, Mission cluster styling) ──
function Gauge({ label, value, max, invert }: { label: string; value: number; max: number; invert: boolean }) {
  const pct = Math.round((value / max) * 100);
  // band: when invert, high pct = bad
  const score = invert ? 100 - pct : pct;
  const color = score >= 66 ? primitiveSignal.success : score >= 33 ? primitiveSignal.warning : primitiveSignal.critical;
  const meaning = score >= 66 ? 'Healthy' : score >= 33 ? 'Elevated' : 'Critical';
  const opts = {
    chart: { type: 'radialBar' as const, background: 'transparent', sparkline: { enabled: true } },
    theme: { mode: 'dark' as const },
    colors: [color],
    plotOptions: {
      radialBar: {
        startAngle: -135, endAngle: 135,
        hollow: { size: '58%' },
        track: { background: HUD.lineSubtle, strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: { show: true, offsetY: 6, color: HUD.text, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.h1, fontWeight: 700, formatter: () => String(value) },
        },
      },
    },
    stroke: { lineCap: 'round' as const },
  };
  return (
    <div style={{ background: HUD.elevated, border: `1px solid ${HUD.line}`, padding: componentTokens.cardPadding, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ alignSelf: 'flex-start', fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <div style={{ width: 150, height: 120 }}>
        <Chart type="radialBar" height={150} options={opts} series={[pct]} />
      </div>
      <span style={{ fontSize: primitiveTypeScale.micro, color, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{meaning}</span>
    </div>
  );
}

function Kpi({ label, value, accent, hint }: { label: string; value: string; accent?: string; hint?: string }) {
  return (
    <div style={{ background: HUD.elevated, border: `1px solid ${HUD.line}`, padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: accent ?? HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? HUD.text }}>{value}</span>
      {hint && <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: HUD.textMuted }}>{hint}</span>}
    </div>
  );
}

function Toggle({ value, onChange }: { value: View; onChange: (v: View) => void }) {
  return (
    <div style={{ display: 'inline-flex', border: `1px solid ${HUD.line}` }}>
      {(['board', 'table'] as View[]).map((v, i) => {
        const active = v === value;
        return (
          <button key={v} onClick={() => onChange(v)}
            style={{ padding: `${primitiveSpacing[1]} ${primitiveSpacing[3]}`, fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.medium, border: 'none', cursor: 'pointer', background: active ? primitiveSignal.info : 'transparent', color: active ? primitiveHud.bg0 : HUD.textSecondary, borderLeft: i === 0 ? 'none' : `1px solid ${HUD.lineSubtle}`, textTransform: 'capitalize' }}>{v}</button>
        );
      })}
    </div>
  );
}

function Filter({ label, value, onChange, options, render }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[]; render?: (o: string) => string }) {
  return (
    <label style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: primitiveTypeScale.micro, color: HUD.textMuted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ height: componentTokens.inputHeight, padding: `0 ${primitiveSpacing[2]}`, background: primitiveHud.bg1, color: HUD.text, border: `1px solid ${HUD.line}`, borderRadius: 0, fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.body }}>
        {options.map((o) => <option key={o} value={o} style={{ background: primitiveHud.bg1 }}>{o === 'all' ? 'All' : render ? render(o) : o}</option>)}
      </select>
    </label>
  );
}
