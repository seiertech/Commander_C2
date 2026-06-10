'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useMode } from '@/context/mode-context';
import { seedCases } from '../../../../../../packages/contracts/src/fixtures/seed-cases';
import { seedEvents } from '../../../../../../packages/contracts/src/fixtures/seed-events';
import { seedActions, seedSubActions } from '../../../../../../packages/contracts/src/fixtures/seed-actions';
import { seedRiskObjects } from '../../../../../../packages/contracts/src/fixtures/seed-risk-objects';
import { seedEvidence } from '../../../../../../packages/contracts/src/fixtures/seed-evidence';
import { seedStrategies } from '../../../../../../packages/contracts/src/fixtures/seed-strategies';
import { resolveAllStrategies } from '../../../../../../packages/contracts/src/resolvers/case-strategy-resolver';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveBrand, primitiveFonts, primitiveTypeScale, primitiveLetterSpacing,
  primitiveSignal, primitiveSpacing, primitiveFontWeight, primitivePriority, primitiveData,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { seedNotifications } from '../../../../../../packages/contracts/src/fixtures/seed-notifications';
import { seedCaseFollows } from '../../../../../../packages/contracts/src/fixtures/seed-case-follows';
import { seedDecisionRecords } from '../../../../../../packages/contracts/src/fixtures/seed-decision-records';
import { PageContainer } from '@/components/page-container';
import { CaseCard } from '@/components/case-card';
import type { Case } from '../../../../../../packages/contracts/src/entities/case';
import type { ApexOptions } from 'apexcharts';
import { slaState, riskScore, isClosed, PRIORITIES } from '../case-metrics';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * My Cases — Analyst Workspace (Commander C2, Spec 06)
 *
 * One-page representation of EVERYTHING real that constitutes an analyst's
 * caseload. Leads with real data: workload KPIs, a prioritised rich-card
 * worklist, caseload analytics computed from the analyst's own cases, the
 * linked work artefacts (actions, risk objects, evidence) that exist, and a
 * merged real activity stream from seed-events. Unbuilt capabilities (approvals,
 * notifications, follow) appear only as a small honest footer — never faked.
 *
 * "Assigned to me" is a real owner filter; ordering is a DERIVED focus heuristic
 * (SLA risk → priority → age), clearly labelled. System-First Tier 1.
 */

const CURRENT_USER = 'Alice Security-Analyst';
const MS_PER_HOUR = 3_600_000;

const STATUS_LABEL: Record<string, string> = {
  'open': 'Open', 'detected': 'Detected', 'in-progress': 'In Progress',
  'awaiting-validation': 'Awaiting Validation', 'awaiting-closure': 'Awaiting Closure',
  'closed': 'Closed', 'reopened': 'Reopened',
};

const SEV_COLOR: Record<string, (t: Tokens) => string> = {
  critical: (t) => t.status.critical, warning: (t) => t.status.warning,
  info: (t) => t.status.info, success: (t) => t.status.success, neutral: (t) => t.text.muted,
};

type Tokens = ReturnType<typeof useMode>['tokens'];

function titleCase(s: string): string {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function slaRisk(c: Case, now: number): number {
  const s = slaState(c, now);
  return s.tone === 'critical' ? 3 : s.tone === 'warning' ? 2 : 1;
}

export default function MyCasesPage() {
  const { mode, tokens } = useMode();
  const router = useRouter();
  const now = useMemo(() => Math.max(...seedCases.map((c) => new Date(c.updatedAt).getTime())), []);

  // ── Real caseload ──
  const myCases = useMemo(() => seedCases.filter((c) => c.owner === CURRENT_USER), []);
  const open = myCases.filter((c) => !isClosed(c));
  const myIds = useMemo(() => new Set(myCases.map((c) => c.id)), [myCases]);

  // Focus-ordered worklist (DERIVED ordering)
  const worklist = useMemo(() => [...open].sort((a, b) => {
    const r = slaRisk(b, now) - slaRisk(a, now);
    if (r !== 0) return r;
    const p = PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority);
    if (p !== 0) return p;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }), [open, now]);

  // ── Linked real work artefacts across her cases ──
  const myActions = seedActions.filter((a) => myIds.has(a.caseId));
  const mySubActions = seedSubActions.filter((s) => myIds.has(s.caseId));
  const myRiskObjects = seedRiskObjects.filter((r) => myIds.has(r.affectedEntityId) || (r.affectedEntities ?? []).some((e) => myIds.has(e)));
  const myEvidence = seedEvidence.filter((e) => myIds.has(e.caseId));

  // ── KPIs (real) ──
  const slaAtRisk = open.filter((c) => slaState(c, now).tone !== 'success').length;
  const breached = myCases.filter((c) => c.sla.breached).length;
  const p1plus = open.filter((c) => c.priority === 'P0' || c.priority === 'P1').length;
  const awaitingVal = open.filter((c) => c.status === 'awaiting-validation' || c.status === 'pending_validation').length;
  const avgRisk = open.length ? Math.round(open.reduce((a, c) => a + riskScore(c, now), 0) / open.length) : 0;

  // ── Activity stream (real seed-events for her cases) ──
  const myEvents = useMemo(() => seedEvents
    .filter((e) => e.entityType === 'case' && myIds.has(e.entityRef))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [myIds]);

  // ── Caseload analytics (real) ──
  const byType: Record<string, number> = {};
  open.forEach((c) => { byType[c.caseType] = (byType[c.caseType] || 0) + 1; });
  const byPriority = PRIORITIES.map((p) => open.filter((c) => c.priority === p).length);
  const byStatus: Record<string, number> = {};
  open.forEach((c) => { const l = STATUS_LABEL[c.status] ?? c.status; byStatus[l] = (byStatus[l] || 0) + 1; });

  const axis = { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro };
  const chartBase: Partial<ApexOptions> = {
    chart: { toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    grid: { borderColor: tokens.border.subtle, strokeDashArray: 3 },
    dataLabels: { enabled: false },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
    legend: { labels: { colors: tokens.text.secondary }, fontSize: primitiveTypeScale.micro, position: 'bottom' },
  };
  const priorityOpts: ApexOptions = {
    ...chartBase, chart: { ...chartBase.chart, type: 'bar' },
    colors: PRIORITIES.map((p) => primitivePriority[p.toLowerCase() as keyof typeof primitivePriority].color),
    plotOptions: { bar: { distributed: true, columnWidth: '55%', borderRadius: 0 } },
    xaxis: { categories: [...PRIORITIES], labels: { style: axis } }, yaxis: { labels: { style: axis } },
    legend: { show: false },
  };
  const typeLabels = Object.keys(byType);
  const typeOpts: ApexOptions = {
    ...chartBase, chart: { ...chartBase.chart, type: 'donut' },
    labels: typeLabels.map(titleCase), colors: primitiveData ? Object.values(primitiveData) : undefined,
    plotOptions: { pie: { donut: { size: '64%', labels: { show: true, total: { show: true, label: 'Open', color: tokens.text.muted } } } } },
  };
  const statusLabels = Object.keys(byStatus);
  const statusOpts: ApexOptions = {
    ...chartBase, chart: { ...chartBase.chart, type: 'bar' },
    colors: [primitiveData[1]],
    plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 0 } },
    xaxis: { categories: statusLabels, labels: { style: axis } }, yaxis: { labels: { style: axis } },
    legend: { show: false },
  };

  return (
    <PageContainer
      pretitle="Cases › My Workspace"
      title="My Cases"
      headerActions={<span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted }}>{CURRENT_USER} · {open.length} open</span>}
    >
      {/* AI-PLACEMENT: AI-MY-CASES-001 — Daily briefing narrative */}

      {/* KPI strip (real) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: primitiveSpacing[2], marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Open" value={String(open.length)} />
        <Kpi tokens={tokens} label="P0 / P1" value={String(p1plus)} accent={p1plus ? primitiveSignal.warning : undefined} />
        <Kpi tokens={tokens} label="SLA Breached" value={String(breached)} accent={breached ? primitiveSignal.critical : undefined} />
        <Kpi tokens={tokens} label="SLA At Risk" value={String(slaAtRisk)} accent={slaAtRisk ? primitiveSignal.warning : undefined} />
        <Kpi tokens={tokens} label="Awaiting Validation" value={String(awaitingVal)} />
        <Kpi tokens={tokens} label="Avg Risk ⓓ" value={String(avgRisk)} />
      </section>

      {/* Main grid: worklist (left) + activity (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: componentTokens.gridGap, alignItems: 'start' }}>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: componentTokens.gridGap }}>

          {/* Worklist — prioritised rich cards (real) */}
          <Section tokens={tokens} title="My Worklist" subtitle={`${worklist.length} open · focus order: SLA risk → priority → age (ⓓ derived)`}>
            {worklist.length === 0 ? (
              <p style={{ margin: 0, fontSize: primitiveTypeScale.caption, color: tokens.text.muted }}>No open cases assigned to {CURRENT_USER}.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: primitiveSpacing[3] }}>
                {worklist.map((c) => <CaseCard key={c.id} caseRecord={c} now={now} />)}
              </div>
            )}
          </Section>

          {/* Caseload analytics (real, from her cases) */}
          <Section tokens={tokens} title="My Caseload" subtitle="Computed from your open cases">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: componentTokens.gridGap }}>
              <MiniChart tokens={tokens} title="By Priority">
                <Chart type="bar" height={180} options={priorityOpts} series={[{ name: 'Cases', data: byPriority }]} />
              </MiniChart>
              <MiniChart tokens={tokens} title="By Type">
                {typeLabels.length ? <Chart type="donut" height={180} options={typeOpts} series={Object.values(byType)} /> : <Empty tokens={tokens} />}
              </MiniChart>
              <MiniChart tokens={tokens} title="By Status">
                {statusLabels.length ? <Chart type="bar" height={180} options={statusOpts} series={[{ name: 'Cases', data: Object.values(byStatus) }]} /> : <Empty tokens={tokens} />}
              </MiniChart>
            </div>
          </Section>

          {/* Linked work artefacts (real) */}
          <Section tokens={tokens} title="Linked Work" subtitle="Actions, risk objects and evidence bound to your cases">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: primitiveSpacing[2], marginBottom: primitiveSpacing[3] }}>
              <Stat tokens={tokens} label="Actions" value={myActions.length} />
              <Stat tokens={tokens} label="Sub-Actions" value={mySubActions.length} />
              <Stat tokens={tokens} label="Risk Objects" value={myRiskObjects.length} />
              <Stat tokens={tokens} label="Evidence" value={myEvidence.length} />
            </div>
            {myActions.length === 0 && myRiskObjects.length === 0 && myEvidence.length === 0 ? (
              <p style={{ margin: 0, fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>No actions, risk objects or evidence are bound to your cases in the current seed data.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: primitiveSpacing[2] }}>
                {myRiskObjects.map((r) => (
                  <Artefact key={r.id} tokens={tokens} kind="Risk Object" title={titleCase(r.type)} detail={r.justification}
                    onClick={() => router.push(`/cases/${typeof r.affectedEntityId === 'string' && r.affectedEntityId.startsWith('case') ? r.affectedEntityId : ''}`)} />
                ))}
                {myActions.map((a) => (
                  <Artefact key={a.id} tokens={tokens} kind="Action" title={a.title} detail={`${titleCase(a.status)} · ${a.actualEffortHours}/${a.estimatedEffortHours}h · ${a.owner}`}
                    onClick={() => router.push(`/cases/${a.caseId}`)} />
                ))}
                {myEvidence.map((e) => (
                  <Artefact key={e.id} tokens={tokens} kind="Evidence" title={titleCase(e.evidenceType)} detail={`${e.confidence}% confidence · ${titleCase(e.freshnessStatus)} · ${e.source.sourceSystem}`}
                    onClick={() => router.push(`/cases/${e.caseId}`)} />
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Activity stream (real seed-events) */}
        <aside style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.subtle}`, padding: componentTokens.cardPadding, position: 'sticky', top: primitiveSpacing[3] }}>
          <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>My Activity</span>
          <div style={{ marginTop: primitiveSpacing[3], display: 'flex', flexDirection: 'column', gap: primitiveSpacing[2], maxHeight: 560, overflowY: 'auto' }}>
            {myEvents.length === 0 ? <Empty tokens={tokens} /> : myEvents.map((e) => (
              <div key={e.id} onClick={() => router.push(`/cases/${e.entityRef}`)} style={{ display: 'flex', gap: primitiveSpacing[2], cursor: 'pointer', paddingBottom: primitiveSpacing[2], borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: SEV_COLOR[e.severity](tokens), display: 'inline-block', marginTop: 5, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.secondary, lineHeight: 1.4 }}>{e.message}</div>
                  <div style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, fontFamily: primitiveFonts.mono }}>{new Date(e.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · {e.entityRef}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Real data: Approvals, Notifications, Followed Cases (UC-202, UC-203, UC-204) */}
      <section style={{ marginTop: componentTokens.gridGap, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: primitiveSpacing[2] }}>
        {/* Approvals & Decisions */}
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.subtle}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, marginBottom: primitiveSpacing[2] }}>Approvals & Decisions</span>
          {seedDecisionRecords.slice(0, 3).map((d) => (
            <div key={d.id} style={{ padding: `${primitiveSpacing[1]} 0`, borderBottom: `1px solid ${tokens.border.subtle}` }}>
              <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.primary }}>{d.rationale.slice(0, 60)}…</span>
              <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, fontFamily: primitiveFonts.mono }}>{d.decisionType} · {new Date(d.decidedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.subtle}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, marginBottom: primitiveSpacing[2] }}>Notifications ({seedNotifications.filter((n) => !n.read).length} unread)</span>
          {seedNotifications.slice(0, 4).map((n) => (
            <div key={n.id} style={{ padding: `${primitiveSpacing[1]} 0`, borderBottom: `1px solid ${tokens.border.subtle}`, opacity: n.read ? 0.6 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[1] }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: n.severity === 'critical' ? tokens.status.critical : n.severity === 'warning' ? tokens.status.warning : tokens.status.info, display: 'inline-block' }} />
                <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.primary, fontWeight: n.read ? primitiveFontWeight.normal : primitiveFontWeight.medium }}>{n.title}</span>
              </div>
              <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{n.message.slice(0, 70)}…</span>
            </div>
          ))}
        </div>

        {/* Followed Cases */}
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.subtle}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, marginBottom: primitiveSpacing[2] }}>Followed Cases ({seedCaseFollows.filter((f) => !f.unfollowedAt).length} active)</span>
          {seedCaseFollows.filter((f) => !f.unfollowedAt).map((f) => (
            <div key={f.id} style={{ padding: `${primitiveSpacing[1]} 0`, borderBottom: `1px solid ${tokens.border.subtle}`, cursor: 'pointer' }} onClick={() => router.push(`/cases/${f.caseRef}`)}>
              <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.primary, fontFamily: primitiveFonts.mono }}>{f.caseRef}</span>
              <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>Notify: {f.notifyOn.join(', ')}</span>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}

// ── helpers ──

function Section({ tokens, title, subtitle, children }: { tokens: Tokens; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.subtle}`, padding: componentTokens.cardPadding }}>
      <div style={{ marginBottom: componentTokens.cardHeaderMargin }}>
        <h3 style={{ margin: 0, fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{title}</h3>
        {subtitle && <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: Tokens; label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.subtle}`, padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: accent ?? tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span>
    </div>
  );
}

function MiniChart({ tokens, title, children }: { tokens: Tokens; title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${tokens.border.subtle}`, padding: primitiveSpacing[2], background: tokens.surface.primary }}>
      <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{title}</span>
      {children}
    </div>
  );
}

function Stat({ tokens, label, value }: { tokens: Tokens; label: string; value: number }) {
  return (
    <div style={{ border: `1px solid ${tokens.border.subtle}`, padding: primitiveSpacing[2], background: tokens.surface.primary, textAlign: 'center' }}>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.h3, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: value > 0 ? tokens.text.primary : tokens.text.muted }}>{value}</span>
      <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
    </div>
  );
}

function Artefact({ tokens, kind, title, detail, onClick }: { tokens: Tokens; kind: string; title: string; detail: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', gap: primitiveSpacing[2], alignItems: 'baseline', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, border: `1px solid ${tokens.border.subtle}`, background: tokens.surface.primary, cursor: onClick ? 'pointer' : 'default' }}>
      <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, minWidth: 96, whiteSpace: 'nowrap' }}>{kind}</span>
      <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.primary, fontWeight: primitiveFontWeight.medium, whiteSpace: 'nowrap' }}>{title}</span>
      <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{detail}</span>
    </div>
  );
}

function Empty({ tokens }: { tokens: Tokens }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100, color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>No data</div>;
}
