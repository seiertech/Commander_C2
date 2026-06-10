// @ts-nocheck
'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMode } from '@/context/mode-context';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveFonts,
  primitiveTypeScale,
  primitiveLetterSpacing,
  primitiveSpacing,
  primitiveFontWeight,
  primitiveData,
  primitivePriority,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { PageContainer } from '@/components/page-container';
import type { WorkspaceMode } from '../../../../../../packages/ui/src/tokens/semantic';
import type { Case } from '../../../../../../packages/contracts/src/entities/case';
import type { ApexOptions } from 'apexcharts';
import { thesisCases, thesisActions } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Case Management Adherence Dashboard — Commander C2 (DS-1.0, Spec 06)
 *
 * MBA-level operating picture for SOM / Director / CISO. Every metric is
 * computed from populated canonical fixtures (thesisCases + thesisActions); there
 * is no mock/random data and no API dependency. The page is fully functional
 * WITHOUT AI (System-First Doctrine, Tier 1 — System Delivers); AI is additive
 * and marked by placement comments only.
 *
 * Time is anchored to the latest timestamp in the dataset (the operational
 * "now") so period windows are meaningful against the seeded estate.
 *
 * DS-1.0 §13: chart series reference token values only (no literal hex inline).
 * Mode-aware: chart theme + axis/text colours follow Standard/Mission tokens.
 *
 * Sections:
 *   1. KPI summary bar (open load, MTTR P1, SLA adherence, reopen, closed, velocity)
 *   2. Case volume & flow (opened vs closed area) + backlog trend (line)
 *   3. Priority distribution (donut) + priority over time (stacked bar)
 *   4. MTTR by priority — target vs actual (grouped horizontal bar)
 *   5. SLA adherence trend (line + 85% target annotation + band)
 *   6. Cases by type (horizontal bar)
 *   7. Cases by owner — workload (horizontal bar, overload highlighted)
 *   8. Ageing analysis (priority × age-bucket heatmap)
 *   9. Drill-down table (sortable, filterable, row → /cases/:id)
 */

// ─── Domain constants ───────────────────────────────────────────────────────

const CLOSED_STATES = new Set(['closed', 'closed_by_system']);
const REOPENED_STATES = new Set(['reopened', 'reopened_by_system']);
const PRIORITIES = ['P0', 'P1', 'P2', 'P3', 'P4'] as const;
const PRIORITY_COLORS: Record<string, string> = {
  P0: primitivePriority.p0.color,
  P1: primitivePriority.p1.color,
  P2: primitivePriority.p2.color,
  P3: primitivePriority.p3.color,
  P4: primitivePriority.p4.color,
};
const PRIORITY_SHAPE: Record<string, string> = {
  P0: primitivePriority.p0.shape,
  P1: primitivePriority.p1.shape,
  P2: primitivePriority.p2.shape,
  P3: primitivePriority.p3.shape,
  P4: primitivePriority.p4.shape,
};
const WORKLOAD_MAX = 15;
const SLA_TARGET_PCT = 85;
const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;

const AGE_BUCKETS = [
  { label: '0–7d', min: 0, max: 7 },
  { label: '7–14d', min: 7, max: 14 },
  { label: '14–30d', min: 14, max: 30 },
  { label: '30–60d', min: 30, max: 60 },
  { label: '60–90d', min: 60, max: 90 },
  { label: '90d+', min: 90, max: Infinity },
];

const RANGE_OPTIONS = [
  { label: '7D', days: 7 },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
  { label: 'All', days: null as number | null },
];

// ─── Pure helpers ───────────────────────────────────────────────────────────

const isClosed = (c: Case) => CLOSED_STATES.has(c.status);
const isReopened = (c: Case) => REOPENED_STATES.has(c.status);
const created = (c: Case) => new Date(c.created_at).getTime();
/** Closed cases have no explicit closedAt; updatedAt is the close timestamp. */
const closedAt = (c: Case) => (isClosed(c) ? new Date(c.updated_at).getTime() : null);

function statusLabel(status: string): string {
  if (CLOSED_STATES.has(status)) return 'Closed';
  if (status === 'awaiting-validation' || status === 'pending_validation' || status === 'validation_running') return 'Awaiting Validation';
  if (status === 'awaiting-closure' || status === 'pending_closure_gates') return 'Awaiting Closure';
  if (status === 'open' || status === 'detected') return 'Open';
  if (status === 'in-progress' || status === 'in_progress') return 'In Progress';
  return status.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function titleCase(s: string): string {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

/** Monday-anchored week start (ms). */
function weekStart(ms: number): number {
  const d = new Date(ms);
  const day = (d.getUTCDay() + 6) % 7; // 0 = Monday
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime() - day * MS_PER_DAY;
}

function weekLabel(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/** Performance-doctrine band colour for a 0–100 adherence value. */
function bandColor(pct: number, tokens: ReturnType<typeof useMode>['tokens']): string {
  if (pct >= 95) return tokens.status.success;
  if (pct >= 85) return tokens.status.warning;
  if (pct >= 60) return primitivePriority.p1.color; // amber/orange
  return tokens.status.critical;
}

/** SLA posture for a single case, used by the table. */
function slaPosture(c: Case, now: number): { label: string; tone: 'critical' | 'warning' | 'success' } {
  if (c.sla.breached) return { label: 'Breached', tone: 'critical' };
  const ageHours = (now - created(c)) / MS_PER_HOUR;
  const remaining = c.sla.target_resolution_hours - ageHours;
  if (!isClosed(c) && remaining <= 0) return { label: 'Overdue', tone: 'critical' };
  if (!isClosed(c) && remaining <= c.sla.target_resolution_hours * 0.25) return { label: 'At Risk', tone: 'warning' };
  return { label: isClosed(c) ? 'Met' : 'On Track', tone: 'success' };
}

type SortKey = 'case_ref' | 'priority' | 'case_type' | 'owner' | 'team' | 'age' | 'sla' | 'status';
type SortDir = 'asc' | 'desc';

// ─── Component ──────────────────────────────────────────────────────────────

export default function CaseAnalyticsPage() {
  const { mode, tokens } = useMode();
  const router = useRouter();

  const [rangeIdx, setRangeIdx] = useState(2); // default 30D
  const [fltPriority, setFltPriority] = useState<string>('all');
  const [fltType, setFltType] = useState<string>('all');
  const [fltTeam, setFltTeam] = useState<string>('all');
  const [fltStatus, setFltStatus] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Operational "now" = latest timestamp present in the dataset.
  const now = useMemo(
    () => Math.max(...thesisCases.map((c) => Math.max(created(c), new Date(c.updated_at).getTime()))),
    [],
  );

  const rangeDays = RANGE_OPTIONS[rangeIdx].days;
  const periodStart = rangeDays === null ? -Infinity : now - rangeDays * MS_PER_DAY;
  const priorStart = rangeDays === null ? -Infinity : now - 2 * rangeDays * MS_PER_DAY;

  // ─── Core metric model (memoised) ─────────────────────────────────────────
  const m = useMemo(() => {
    const all = thesisCases;
    const openCases = all.filter((c) => !isClosed(c));
    const closedCases = all.filter(isClosed);

    // Period-scoped opened / closed
    const openedInPeriod = all.filter((c) => created(c) >= periodStart);
    const closedInPeriod = closedCases.filter((c) => (closedAt(c) ?? 0) >= periodStart);
    const openedPrior = all.filter((c) => created(c) >= priorStart && created(c) < periodStart);
    const closedPrior = closedCases.filter((c) => {
      const t = closedAt(c) ?? 0;
      return t >= priorStart && t < periodStart;
    });

    // MTTR (hours) for a set of closed cases at a given priority
    const mttrFor = (set: Case[], priority?: string) => {
      const subset = set.filter((c) => isClosed(c) && (!priority || c.priority === priority));
      if (subset.length === 0) return null;
      const sum = subset.reduce((acc, c) => acc + ((closedAt(c)! - created(c)) / MS_PER_HOUR), 0);
      return sum / subset.length;
    };

    const mttrP1 = mttrFor(closedInPeriod, 'P1') ?? mttrFor(closedCases, 'P1');
    const mttrP1Prior = mttrFor(closedPrior, 'P1');

    // SLA adherence — closed within target (not breached)
    const slaAdherence = (set: Case[]) => {
      const c = set.filter(isClosed);
      if (c.length === 0) return null;
      const met = c.filter((x) => !x.sla.breached).length;
      return (met / c.length) * 100;
    };
    const adherencePeriod = slaAdherence(closedInPeriod) ?? slaAdherence(closedCases) ?? 100;
    const adherencePrior = slaAdherence(closedPrior);

    // Reopen rate
    const reopenRate = closedCases.length + all.filter(isReopened).length > 0
      ? (all.filter(isReopened).length / Math.max(1, closedCases.length + all.filter(isReopened).length)) * 100
      : 0;

    // Velocity = closed - opened in period (positive = backlog reducing)
    const velocity = closedInPeriod.length - openedInPeriod.length;
    const velocityPrior = closedPrior.length - openedPrior.length;

    // ── Weekly flow series (opened / closed / backlog) ──
    const weekSet = new Set<number>();
    all.forEach((c) => {
      weekSet.add(weekStart(created(c)));
      const ct = closedAt(c);
      if (ct) weekSet.add(weekStart(ct));
    });
    const weeks = Array.from(weekSet).sort((a, b) => a - b);
    const openedByWeek = weeks.map((w) => all.filter((c) => weekStart(created(c)) === w).length);
    const closedByWeek = weeks.map((w) => closedCases.filter((c) => closedAt(c) !== null && weekStart(closedAt(c)!) === w).length);
    // Running backlog at end of each week = cumulative opened up to week end − cumulative closed up to week end
    const backlogByWeek = weeks.map((w) => {
      const weekEnd = w + 7 * MS_PER_DAY;
      const openedToDate = all.filter((c) => created(c) < weekEnd).length;
      const closedToDate = closedCases.filter((c) => (closedAt(c) ?? Infinity) < weekEnd).length;
      return openedToDate - closedToDate;
    });

    // Priority-over-time stacked (per week, per priority — opened)
    const priorityByWeek = PRIORITIES.map((p) => ({
      name: p,
      data: weeks.map((w) => all.filter((c) => c.priority === p && weekStart(created(c)) === w).length),
    }));

    // ── Distribution counts (open cases) ──
    const priorityDist = PRIORITIES.map((p) => openCases.filter((c) => c.priority === p).length);

    const typeCounts: Record<string, number> = {};
    openCases.forEach((c) => { typeCounts[c.case_type] = (typeCounts[c.case_type] || 0) + 1; });
    const typeSorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

    const ownerCounts: Record<string, number> = {};
    openCases.forEach((c) => { ownerCounts[c.owner] = (ownerCounts[c.owner] || 0) + 1; });
    const ownerSorted = Object.entries(ownerCounts).sort((a, b) => b[1] - a[1]);

    // ── MTTR by priority: target (from SLA) vs actual ──
    const targetByPriority = PRIORITIES.map((p) => {
      const withSla = all.filter((c) => c.priority === p);
      if (withSla.length === 0) return 0;
      // Use the modal/representative SLA target for the priority
      return Math.round(withSla.reduce((a, c) => a + c.sla.target_resolution_hours, 0) / withSla.length);
    });
    const actualByPriority = PRIORITIES.map((p) => {
      const v = mttrFor(closedCases, p);
      return v === null ? 0 : Math.round(v);
    });

    // ── SLA adherence trend (per week, closed cases that week) ──
    const adherenceByWeek = weeks.map((w) => {
      const wk = closedCases.filter((c) => closedAt(c) !== null && weekStart(closedAt(c)!) === w);
      if (wk.length === 0) return null;
      const met = wk.filter((c) => !c.sla.breached).length;
      return Math.round((met / wk.length) * 100);
    });

    // ── Ageing heatmap: priority × age-bucket (open cases) ──
    const ageingSeries = PRIORITIES.map((p) => ({
      name: p,
      data: AGE_BUCKETS.map((b) => {
        const count = openCases.filter((c) => {
          if (c.priority !== p) return false;
          const age = (now - created(c)) / MS_PER_DAY;
          return age >= b.min && age < b.max;
        }).length;
        return { x: b.label, y: count };
      }),
    }));

    // ── Action throughput (uses thesisActions) ──
    const actionsCompleted = thesisActions.filter((a) => a.status === 'completed').length;
    const actionsInProgress = thesisActions.filter((a) => a.status === 'in_progress').length;

    return {
      open_cases: open_cases, closedCases, openedInPeriod, closedInPeriod,
      mttr_p1: mttr_p1, mttrP1Prior, adherencePeriod, adherencePrior, reopenRate,
      velocity, velocityPrior,
      weeks, openedByWeek, closedByWeek, backlogByWeek, priorityByWeek,
      priorityDist, typeSorted, ownerSorted,
      targetByPriority, actualByPriority, adherenceByWeek, ageingSeries,
      actionsCompleted, actionsInProgress,
    };
  }, [now, periodStart, priorStart]);

  // ─── Shared chart base (mode-aware) ───────────────────────────────────────
  const axisStyle = { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro };
  const base: Partial<ApexOptions> = {
    chart: { toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body, animations: { enabled: true } },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    grid: { borderColor: tokens.border.subtle, strokeDashArray: 3 },
    xaxis: { labels: { style: axisStyle }, axisBorder: { color: tokens.border.subtle }, axisTicks: { color: tokens.border.subtle } },
    yaxis: { labels: { style: axisStyle } },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
    legend: { labels: { colors: tokens.text.secondary }, fontSize: primitiveTypeScale.caption, markers: { strokeWidth: 0 } },
    dataLabels: { enabled: false },
  };

  // 2a. Volume flow — opened vs closed (area)
  const flowOpts: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: 'area', stacked: false },
    colors: [tokens.status.warning, tokens.status.success],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
    xaxis: { ...base.xaxis, categories: m.weeks.map(weekLabel) },
    legend: { ...base.legend, position: 'top' },
  };
  const flowSeries = [
    { name: 'Opened', data: m.openedByWeek },
    { name: 'Closed', data: m.closedByWeek },
  ];

  // 2b. Backlog trend (line)
  const backlogOpts: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: 'line' },
    colors: [primitiveData[1]],
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 3 },
    xaxis: { ...base.xaxis, categories: m.weeks.map(weekLabel) },
  };
  const backlogSeries = [{ name: 'Open backlog', data: m.backlogByWeek }];

  // 3a. Priority distribution (donut)
  const donutOpts: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: 'donut' },
    labels: [...PRIORITIES],
    colors: PRIORITIES.map((p) => PRIORITY_COLORS[p]),
    legend: { ...base.legend, position: 'bottom' },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            total: { show: true, label: 'Open', color: tokens.text.muted, fontSize: primitiveTypeScale.caption },
            value: { color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.kpiValue, fontWeight: 700 },
          },
        },
      },
    },
  };

  // 3b. Priority over time (stacked bar)
  const priorityTrendOpts: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: 'bar', stacked: true },
    colors: PRIORITIES.map((p) => PRIORITY_COLORS[p]),
    plotOptions: { bar: { columnWidth: '60%', borderRadius: 0 } },
    xaxis: { ...base.xaxis, categories: m.weeks.map(weekLabel) },
    legend: { ...base.legend, position: 'top' },
  };

  // 4. MTTR target vs actual (grouped horizontal bar)
  const mttrOpts: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: 'bar' },
    colors: [tokens.text.muted, primitiveData[3]],
    plotOptions: { bar: { horizontal: true, columnWidth: '70%', borderRadius: 0, dataLabels: { position: 'top' } } },
    xaxis: { ...base.xaxis, categories: [...PRIORITIES], title: { text: 'Hours', style: { color: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    legend: { ...base.legend, position: 'top' },
    dataLabels: {
      enabled: true,
      offsetX: 18,
      style: { fontSize: primitiveTypeScale.micro, colors: [tokens.text.secondary] },
      formatter: (v) => (v === 0 ? '' : `${v}h`),
    },
  };
  const mttrSeries = [
    { name: 'Target', data: m.targetByPriority },
    { name: 'Actual', data: m.actualByPriority },
  ];

  // 5. SLA adherence trend (line + target annotation + band)
  const adherenceTrendOpts: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: 'line' },
    colors: [primitiveData[1]],
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 4 },
    xaxis: { ...base.xaxis, categories: m.weeks.map(weekLabel) },
    yaxis: { ...base.yaxis, min: 0, max: 100, labels: { style: axisStyle, formatter: (v) => `${Math.round(v)}%` } },
    annotations: {
      yaxis: [
        { y: SLA_TARGET_PCT, y2: 100, fillColor: tokens.status.success, opacity: 0.06 },
        { y: 75, y2: SLA_TARGET_PCT, fillColor: tokens.status.warning, opacity: 0.06 },
        { y: 0, y2: 75, fillColor: tokens.status.critical, opacity: 0.06 },
        {
          y: SLA_TARGET_PCT,
          borderColor: tokens.status.warning,
          strokeDashArray: 4,
          label: {
            text: `Target ${SLA_TARGET_PCT}%`,
            style: { color: '#fff', background: tokens.status.warning, fontSize: primitiveTypeScale.micro },
          },
        },
      ],
    },
  };
  const adherenceTrendSeries = [{ name: 'SLA adherence', data: m.adherenceByWeek }];

  // 6. Cases by type (horizontal bar)
  const typeOpts: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: 'bar' },
    colors: [primitiveData[1]],
    plotOptions: { bar: { horizontal: true, barHeight: '64%', borderRadius: 0, distributed: false } },
    xaxis: { ...base.xaxis, categories: m.typeSorted.map(([t]) => titleCase(t)) },
    dataLabels: { enabled: true, style: { fontSize: primitiveTypeScale.micro, colors: ['#fff'] } },
  };
  const typeSeries = [{ name: 'Open cases', data: m.typeSorted.map(([, n]) => n) }];

  // 7. Cases by owner — workload (horizontal bar, overload highlighted)
  const ownerColors = m.ownerSorted.map(([, n]) =>
    n >= WORKLOAD_MAX ? tokens.status.critical : n >= WORKLOAD_MAX * 0.66 ? tokens.status.warning : primitiveData[5],
  );
  const ownerOpts: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: 'bar' },
    colors: ownerColors,
    plotOptions: { bar: { horizontal: true, barHeight: '64%', borderRadius: 0, distributed: true } },
    xaxis: { ...base.xaxis, categories: m.ownerSorted.map(([o]) => o) },
    legend: { show: false },
    dataLabels: { enabled: true, style: { fontSize: primitiveTypeScale.micro, colors: ['#fff'] } },
  };
  const ownerSeries = [{ name: 'Open cases', data: m.ownerSorted.map(([, n]) => n) }];

  // 8. Ageing heatmap (priority × age bucket)
  const ageingOpts: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: 'heatmap' },
    dataLabels: { enabled: true, style: { fontSize: primitiveTypeScale.micro, colors: [tokens.text.primary] } },
    colors: [primitiveData[1]],
    plotOptions: {
      heatmap: {
        radius: 0,
        enableShades: true,
        shadeIntensity: 0.6,
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: tokens.border.subtle, name: 'none' },
            { from: 1, to: 1, color: primitiveData[3], name: '1' },
            { from: 2, to: 3, color: tokens.status.warning, name: '2–3' },
            { from: 4, to: 99, color: tokens.status.critical, name: '4+' },
          ],
        },
      },
    },
  };

  // ─── Table: filter + sort ─────────────────────────────────────────────────
  const typeOptions = useMemo(() => Array.from(new Set(thesisCases.map((c) => c.case_type))).sort(), []);
  const teamOptions = useMemo(() => Array.from(new Set(thesisCases.map((c) => c.team))).sort(), []);
  const statusOptions = useMemo(() => Array.from(new Set(thesisCases.map((c) => statusLabel(c.status)))).sort(), []);

  const tableRows = useMemo(() => {
    const rows = m.open_cases.filter((c) => {
      if (fltPriority !== 'all' && c.priority !== fltPriority) return false;
      if (fltType !== 'all' && c.case_type !== fltType) return false;
      if (fltTeam !== 'all' && c.team !== fltTeam) return false;
      if (fltStatus !== 'all' && statusLabel(c.status) !== fltStatus) return false;
      return true;
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'case_ref': cmp = a.case_ref.localeCompare(b.case_ref); break;
        case 'priority': cmp = PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority); break;
        case 'case_type': cmp = a.case_type.localeCompare(b.case_type); break;
        case 'owner': cmp = a.owner.localeCompare(b.owner); break;
        case 'team': cmp = a.team.localeCompare(b.team); break;
        case 'age': cmp = created(a) - created(b); break; // older first when asc
        case 'sla': cmp = Number(b.sla.breached) - Number(a.sla.breached); break;
        case 'status': cmp = statusLabel(a.status).localeCompare(statusLabel(b.status)); break;
      }
      return cmp * dir;
    });
    return rows;
  }, [m.open_cases, fltPriority, fltType, fltTeam, fltStatus, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  // ─── KPI values ───────────────────────────────────────────────────────────
  const kpiOpen = m.open_cases.length;
  const kpiOpenPrior = thesisCases.filter((c) => !isClosed(c) && created(c) < periodStart).length;
  const mttrDelta = m.mttr_p1 !== null && m.mttrP1Prior !== null ? m.mttr_p1 - m.mttrP1Prior : null;
  const adherenceDelta = m.adherencePrior !== null ? m.adherencePeriod - m.adherencePrior : null;
  const velocityDelta = m.velocity - m.velocityPrior;

  const gap = componentTokens.gridGap;

  return (
    <PageContainer
      pretitle="Cases › Analytics"
      title="Case Management Adherence"
      headerActions={
        <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[2] }}>
          {/* AI-PLACEMENT: AI-CASE-ANALYTICS-001 — "Orient this page for me" button */}
          <RangeToggle rangeIdx={rangeIdx} setRangeIdx={setRangeIdx} tokens={tokens} />
        </div>
      }
    >
      {/* ── SECTION 1: KPI summary bar ──────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap }}>
        <KpiCard tokens={tokens} label="Open Cases" value={String(kpiOpen)}
          delta={kpiOpen - kpiOpenPrior} deltaGoodWhenNegative tokensMode={mode} />
        <KpiCard tokens={tokens} label="MTTR · P1" value={m.mttr_p1 !== null ? `${Math.round(m.mttr_p1)}h` : '—'}
          delta={mttrDelta !== null ? Math.round(mttrDelta) : null} deltaSuffix="h" deltaGoodWhenNegative tokensMode={mode} />
        <KpiGauge tokens={tokens} mode={mode} label="SLA Adherence" pct={Math.round(m.adherencePeriod)}
          delta={adherenceDelta !== null ? Math.round(adherenceDelta) : null} />
        <KpiCard tokens={tokens} label="Reopen Rate" value={`${m.reopenRate.toFixed(1)}%`}
          delta={null} tokensMode={mode} />
        <KpiCard tokens={tokens} label="Closed · Period" value={String(m.closedInPeriod.length)}
          delta={m.closedInPeriod.length - m.closedCases.filter((c) => { const t = closedAt(c) ?? 0; return t >= priorStart && t < periodStart; }).length}
          tokensMode={mode} />
        <KpiCard tokens={tokens} label="Velocity" value={(m.velocity >= 0 ? '+' : '') + m.velocity}
          delta={velocityDelta} tokensMode={mode} hint="closed − opened" />
      </section>

      {/* ── SECTION 2: Volume & flow + backlog ──────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap, marginTop: gap }}>
        <ChartCard tokens={tokens} title="Case Volume & Flow" subtitle="Opened vs closed per week — closed above opened means backlog reducing">
          <Chart type="area" height={260} options={flowOpts} series={flowSeries} />
        </ChartCard>
        <ChartCard tokens={tokens} title="Open Backlog Trend" subtitle="Total open cases at each week-end">
          <Chart type="line" height={260} options={backlogOpts} series={backlogSeries} />
        </ChartCard>
      </section>

      {/* ── SECTION 3: Priority distribution + trend ────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap, marginTop: gap }}>
        <ChartCard tokens={tokens} title="Priority Distribution" subtitle="Current open cases by priority">
          <Chart type="donut" height={280} options={donutOpts} series={m.priorityDist} />
        </ChartCard>
        <ChartCard tokens={tokens} title="Priority Over Time" subtitle="Cases opened per week by priority">
          <Chart type="bar" height={280} options={priorityTrendOpts} series={m.priorityByWeek} />
        </ChartCard>
      </section>

      {/* ── SECTION 4: MTTR by priority ─────────────────────────────────── */}
      <section style={{ marginTop: gap }}>
        {/* AI-PLACEMENT: AI-CASE-ANALYTICS-002 — "Explain why MTTR changed" per-metric */}
        <ChartCard tokens={tokens} title="MTTR by Priority — Target vs Actual" subtitle="Average resolution time (hours) against SLA target per priority">
          <Chart type="bar" height={300} options={mttrOpts} series={mttrSeries} />
        </ChartCard>
      </section>

      {/* ── SECTION 5: SLA adherence trend ──────────────────────────────── */}
      <section style={{ marginTop: gap }}>
        <ChartCard tokens={tokens} title="SLA Adherence Trend" subtitle="Weekly adherence with 85% target — green ≥85%, amber 75–85%, red <75%">
          <Chart type="line" height={280} options={adherenceTrendOpts} series={adherenceTrendSeries} />
        </ChartCard>
      </section>

      {/* ── SECTION 6 + 7: Type + Owner ─────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap, marginTop: gap }}>
        <ChartCard tokens={tokens} title="Cases by Type" subtitle="Open cases by case type (highest first)">
          <Chart type="bar" height={320} options={typeOpts} series={typeSeries} />
        </ChartCard>
        <ChartCard tokens={tokens} title="Workload by Owner" subtitle={`Open cases per owner — amber/red at or near ceiling (${WORKLOAD_MAX})`}>
          <Chart type="bar" height={320} options={ownerOpts} series={ownerSeries} />
        </ChartCard>
      </section>

      {/* ── SECTION 8: Ageing analysis ──────────────────────────────────── */}
      <section style={{ marginTop: gap }}>
        <ChartCard tokens={tokens} title="Ageing Analysis" subtitle="Open cases by priority × age bucket — darker means older / more urgent">
          <Chart type="heatmap" height={260} options={ageingOpts} series={m.ageingSeries} />
        </ChartCard>
      </section>

      {/* ── SECTION 9: Drill-down table ─────────────────────────────────── */}
      <section style={{ marginTop: gap }}>
        <div style={cardStyle(tokens)}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: primitiveSpacing[3], marginBottom: componentTokens.cardHeaderMargin }}>
            <div>
              <h3 style={cardTitleStyle(tokens)}>Open Case Worklist</h3>
              <span style={cardSubtitleStyle(tokens)}>{tableRows.length} of {m.open_cases.length} open cases — click a row to open the case</span>
            </div>
            <div style={{ display: 'flex', gap: primitiveSpacing[2], flexWrap: 'wrap' }}>
              <FilterSelect tokens={tokens} label="Priority" value={fltPriority} onChange={setFltPriority} options={['all', ...PRIORITIES]} />
              <FilterSelect tokens={tokens} label="Type" value={fltType} onChange={setFltType} options={['all', ...typeOptions]} render={(o) => o === 'all' ? 'All' : titleCase(o)} />
              <FilterSelect tokens={tokens} label="Team" value={fltTeam} onChange={setFltTeam} options={['all', ...teamOptions]} />
              <FilterSelect tokens={tokens} label="Status" value={fltStatus} onChange={setFltStatus} options={['all', ...statusOptions]} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead>
                <tr>
                  {([
                    ['case_ref', 'Case Ref'], ['priority', 'Priority'], ['case_type', 'Type'],
                    ['title', 'Title'], ['owner', 'Owner'], ['team', 'Team'],
                    ['age', 'Age'], ['sla', 'SLA'], ['status', 'Status'],
                  ] as [string, string][]).map(([key, label]) => {
                    const sortable = key !== 'title';
                    const active = sortKey === key;
                    return (
                      <th key={key}
                        onClick={sortable ? () => toggleSort(key as SortKey) : undefined}
                        style={{
                          textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`,
                          borderBottom: `2px solid ${tokens.border.default}`,
                          color: tokens.text.secondary, fontWeight: primitiveFontWeight.semibold,
                          textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow,
                          fontSize: primitiveTypeScale.micro, cursor: sortable ? 'pointer' : 'default',
                          whiteSpace: 'nowrap', userSelect: 'none',
                        }}>
                        {label}{active ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((c) => {
                  const posture = slaPosture(c, now);
                  const ageD = Math.floor((now - created(c)) / MS_PER_DAY);
                  const ageH = Math.floor((now - created(c)) / MS_PER_HOUR);
                  const toneColor = posture.tone === 'critical' ? tokens.status.critical : posture.tone === 'warning' ? tokens.status.warning : tokens.status.success;
                  return (
                    <tr key={c.id}
                      onClick={() => router.push(`/cases/${c.id}`)}
                      style={{ cursor: 'pointer', borderBottom: `1px solid ${tokens.border.subtle}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = tokens.surface.primary)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td style={tdStyle(tokens)}><span style={{ fontFamily: primitiveFonts.mono }}>{c.case_ref}</span></td>
                      <td style={tdStyle(tokens)}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: primitiveSpacing[1], color: PRIORITY_COLORS[c.priority], fontWeight: primitiveFontWeight.semibold }}>
                          <span aria-hidden>{PRIORITY_SHAPE[c.priority]}</span>{c.priority}
                        </span>
                      </td>
                      <td style={tdStyle(tokens)}>{titleCase(c.case_type)}</td>
                      <td style={{ ...tdStyle(tokens), maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: tokens.text.primary }} title={c.title}>{c.title}</td>
                      <td style={tdStyle(tokens)}>{c.owner}</td>
                      <td style={tdStyle(tokens)}>{c.team}</td>
                      <td style={{ ...tdStyle(tokens), fontFamily: primitiveFonts.mono, whiteSpace: 'nowrap' }}>{ageD >= 1 ? `${ageD}d` : `${ageH}h`}</td>
                      <td style={tdStyle(tokens)}>
                        <span style={{ display: 'inline-block', padding: `2px ${primitiveSpacing[2]}`, borderRadius: 0, background: toneColor, color: '#fff', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.medium, whiteSpace: 'nowrap' }}>{posture.label}</span>
                      </td>
                      <td style={{ ...tdStyle(tokens), whiteSpace: 'nowrap' }}>{statusLabel(c.status)}</td>
                    </tr>
                  );
                })}
                {tableRows.length === 0 && (
                  <tr><td colSpan={9} style={{ ...tdStyle(tokens), textAlign: 'center', color: tokens.text.muted, padding: primitiveSpacing[6] }}>No cases match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

// ─── Shared style builders ──────────────────────────────────────────────────

type Tokens = ReturnType<typeof useMode>['tokens'];

const cardStyle = (tokens: Tokens): React.CSSProperties => ({
  padding: componentTokens.cardPadding,
  background: tokens.surface.elevated,
  border: `1px solid ${tokens.border.subtle}`,
  borderRadius: componentTokens.cardRadius,
});

const cardTitleStyle = (tokens: Tokens): React.CSSProperties => ({
  margin: 0,
  fontSize: primitiveTypeScale.h4,
  fontWeight: primitiveFontWeight.semibold,
  color: tokens.text.primary,
  textTransform: 'uppercase',
  letterSpacing: primitiveLetterSpacing.eyebrow,
});

const cardSubtitleStyle = (tokens: Tokens): React.CSSProperties => ({
  fontSize: primitiveTypeScale.micro,
  color: tokens.text.muted,
});

const tdStyle = (tokens: Tokens): React.CSSProperties => ({
  padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`,
  color: tokens.text.secondary,
  height: componentTokens.tableRowHeight,
});

// ─── Reusable UI pieces ─────────────────────────────────────────────────────

function ChartCard({ tokens, title, subtitle, children }: { tokens: Tokens; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ ...cardStyle(tokens), display: 'flex', flexDirection: 'column', gap: primitiveSpacing[3] }}>
      <div>
        <h3 style={cardTitleStyle(tokens)}>{title}</h3>
        <span style={cardSubtitleStyle(tokens)}>{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

function KpiCard({
  tokens, label, value, delta, deltaSuffix = '', deltaGoodWhenNegative = false, tokensMode, hint,
}: {
  tokens: Tokens; label: string; value: string; delta: number | null;
  deltaSuffix?: string; deltaGoodWhenNegative?: boolean; tokensMode: WorkspaceMode; hint?: string;
}) {
  let arrow = '→';
  let color: string = tokens.text.muted;
  if (delta !== null && delta !== 0) {
    const positive = delta > 0;
    arrow = positive ? '↑' : '↓';
    const good = deltaGoodWhenNegative ? !positive : positive;
    color = good ? tokens.status.success : tokens.status.critical;
  }
  return (
    <div style={{ ...cardStyle(tokens), display: 'flex', flexDirection: 'column', gap: primitiveSpacing[1] }}>
      <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary, lineHeight: 1.1 }}>{value}</span>
      <span style={{ fontSize: primitiveTypeScale.micro, color, display: 'flex', alignItems: 'center', gap: 4 }}>
        {delta !== null ? <>{arrow} {Math.abs(delta)}{deltaSuffix} vs prior</> : <span style={{ color: tokens.text.muted }}>{hint ?? '—'}</span>}
      </span>
    </div>
  );
}

function KpiGauge({ tokens, mode, label, pct, delta }: { tokens: Tokens; mode: WorkspaceMode; label: string; pct: number; delta: number | null }) {
  const color = bandColor(pct, tokens);
  const opts: ApexOptions = {
    chart: { type: 'radialBar', background: 'transparent', sparkline: { enabled: true } },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    colors: [color],
    plotOptions: {
      radialBar: {
        hollow: { size: '58%' },
        track: { background: tokens.border.subtle },
        dataLabels: {
          name: { show: false },
          value: { show: true, offsetY: 6, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.large, fontWeight: 700, formatter: (v) => `${Math.round(Number(v))}%` },
        },
      },
    },
  };
  let arrow = '→';
  let dColor: string = tokens.text.muted;
  if (delta !== null && delta !== 0) { arrow = delta > 0 ? '↑' : '↓'; dColor = delta > 0 ? tokens.status.success : tokens.status.critical; }
  return (
    <div style={{ ...cardStyle(tokens), display: 'flex', flexDirection: 'column', gap: primitiveSpacing[1] }}>
      <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 78, height: 78, marginLeft: -6 }}>
          <Chart type="radialBar" height={86} options={opts} series={[pct]} />
        </div>
        <span style={{ fontSize: primitiveTypeScale.micro, color: dColor, display: 'flex', alignItems: 'center', gap: 4 }}>
          {delta !== null ? <>{arrow} {Math.abs(delta)}pp</> : <span style={{ color: tokens.text.muted }}>—</span>}
        </span>
      </div>
    </div>
  );
}

function RangeToggle({ rangeIdx, setRangeIdx, tokens }: { rangeIdx: number; setRangeIdx: (i: number) => void; tokens: Tokens }) {
  return (
    <div style={{ display: 'inline-flex', border: `1px solid ${tokens.border.default}`, borderRadius: 0, overflow: 'hidden' }}>
      {RANGE_OPTIONS.map((r, i) => {
        const active = i === rangeIdx;
        return (
          <button key={r.label} onClick={() => setRangeIdx(i)}
            style={{
              padding: `${primitiveSpacing[1]} ${primitiveSpacing[3]}`,
              fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.medium,
              border: 'none', cursor: 'pointer',
              background: active ? tokens.action.secondary : 'transparent',
              color: active ? tokens.surface.elevated : tokens.text.secondary,
              borderLeft: i === 0 ? 'none' : `1px solid ${tokens.border.subtle}`,
            }}>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function FilterSelect({ tokens, label, value, onChange, options, render }: {
  tokens: Tokens; label: string; value: string; onChange: (v: string) => void; options: readonly string[]; render?: (o: string) => string;
}) {
  return (
    <label style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{
          height: componentTokens.inputHeight, padding: `0 ${primitiveSpacing[2]}`,
          background: tokens.input.background, color: tokens.input.text,
          border: `1px solid ${tokens.input.border}`, borderRadius: 0,
          fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.body,
        }}>
        {options.map((o) => <option key={o} value={o}>{o === 'all' ? 'All' : render ? render(o) : o}</option>)}
      </select>
    </label>
  );
}
