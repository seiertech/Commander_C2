// @ts-nocheck
'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useMode } from '@/context/mode-context';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveFonts, primitiveTypeScale, primitiveLetterSpacing,
  primitiveSignal, primitiveSpacing, primitiveFontWeight, primitivePriority,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { resolveAllStrategies } from '../../../../../../packages/contracts/src/resolvers/case-strategy-resolver';
import { getNextStates } from '../../../../../../packages/contracts/src/entities/case-lifecycle';
import { LEGACY_STATUS_MAP } from '../../../../../../packages/contracts/src/entities/case';
import type { Case, CaseStatus, CaseStatusExtended, LegacyCaseStatus } from '../../../../../../packages/contracts/src/entities/case';
import type { SubAction, D3FENDTacticType, OutcomeClassification, Action as ActionRec } from '../../../../../../packages/contracts/src/entities/action';
import { thesisCases, thesisAssets, thesisActions, thesisSubActions, thesisRiskObjects, thesisEvidence, thesisStrategies, thesisEvents, thesisEmailCommunications, thesisGovernedCompose, thesisCaseTransitionAudits, thesisTeamsDecisionEvents } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Case Detail — Commander C2 (DS-1.0, Spec 06)
 *
 * Case-record master-detail layout (ServiceNow/Jira-style): a strong case
 * header, a main work column (lifecycle → actions/sub-actions → evidence & risk
 * → activity → communication), and a sticky right rail of case fields (details,
 * impact, people/escalation, strategy, related entities).
 *
 * All work-column and rail data is REAL seed data joined by case id (actions,
 * sub-actions, risk objects, evidence, activity events) plus resolver output
 * (SLA/routing/validation/closure/reopening). Sections with no data show a
 * compact inline empty-state. Communication has no entity yet — honest
 * placeholder. Derived helpers are labelled. No fabrication.
 *
 * Doctrine: no manual lifecycle/closure controls (Assertion 1); surface
 * attribution always shown (Assertion 10); System-First Tier 1 — fully usable
 * without AI; AI surfaced only as placement-comment markers.
 */

// ─── Canonical 12-state spine for the lifecycle pipeline ────────────────────
const LIFECYCLE_SPINE: CaseStatus[] = [
  'detected', 'bound', 'routed', 'prioritised', 'action_decomposed', 'in_progress',
  'pending_validation', 'validation_running', 'validated_pass', 'pending_closure_gates', 'closed_by_system',
];

const STATE_LABEL: Record<string, string> = {
  detected: 'Detected', bound: 'Bound', routed: 'Routed', prioritised: 'Prioritised',
  action_decomposed: 'Action Decomposed', in_progress: 'In Progress', pending_validation: 'Pending Validation',
  validation_running: 'Validation Running', validated_pass: 'Validated Pass', validated_fail: 'Validated Fail',
  pending_closure_gates: 'Pending Closure', closed_by_system: 'Closed', reopened_by_system: 'Reopened',
};

const STATE_ACTOR: Record<string, string> = {
  detected: 'detection-source', bound: 'binding-engine', routed: 'routing-engine', prioritised: 'prioritisation-engine',
  action_decomposed: 'system', in_progress: 'system', pending_validation: 'system',
  validation_running: 'validation-engine', validated_pass: 'validation-engine', pending_closure_gates: 'closure-engine',
  closed_by_system: 'closure-engine',
};

/** Resolve a case's canonical 12-state from its (possibly legacy) status. */
function canonicalStatus(status: CaseStatusExtended): CaseStatus {
  if (status in LEGACY_STATUS_MAP) return LEGACY_STATUS_MAP[status as LegacyCaseStatus];
  return status as CaseStatus;
}

const D3FEND_COLOR: Record<D3FENDTacticType, string> = {
  isolate: primitivePriority.p3.color,
  evict: primitiveSignal.critical,
  restore: primitiveSignal.success,
  harden: primitivePriority.p2.color,
  detect: primitivePriority.p1.color,
};

const OUTCOME_TONE: Record<OutcomeClassification, 'success' | 'warning' | 'critical' | 'muted'> = {
  successful: 'success', partial: 'warning', failed: 'critical', cancelled: 'muted', pending: 'muted',
};

const ACTION_TONE: Record<string, 'success' | 'warning' | 'muted'> = {
  completed: 'success', in_progress: 'warning', planned: 'muted', cancelled: 'muted',
};

const MS_PER_HOUR = 3_600_000;

type Tokens = ReturnType<typeof useMode>['tokens'];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { mode, tokens } = useMode();
  const router = useRouter();

  const caseRecord = thesisCases.find((c) => c.id === id) ?? thesisCases[0];
  const strategy = resolveAllStrategies(caseRecord, thesisStrategies);
  const p = primitivePriority[caseRecord.priority.toLowerCase() as keyof typeof primitivePriority];

  // Real joins by case id
  const actions = thesisActions.filter((a) => a.case_id === caseRecord.id);
  const subActionsByAction = (action_id: string) => thesisSubActions.filter((s) => s.action_id === actionId);
  const riskObjects = thesisRiskObjects.filter(
    (r) => r.affected_entity_id === caseRecord.id || (r.affected_entities ?? []).includes(caseRecord.id),
  );
  const evidence = thesisEvidence.filter((e) => e.case_id === caseRecord.id);
  const relatedAssets = thesisAssets.filter((a) => caseRecord.related_entities.includes(a.id));
  const relatedCases = thesisCases.filter(
    (c) => c.id !== caseRecord.id && c.related_entities.some((e) => caseRecord.related_entities.includes(e)),
  );

  // SLA countdown
  const ageHours = (Date.now() - new Date(caseRecord.created_at).getTime()) / MS_PER_HOUR;
  const slaHoursTarget = strategy.sla.status === 'resolved' ? strategy.sla.response_hours : caseRecord.sla.target_resolution_hours;
  const slaRemaining = (slaHoursTarget ?? 0) - ageHours;
  const slaBreached = caseRecord.sla.breached || slaRemaining <= 0;
  const slaPct = Math.max(0, Math.min(100, Math.round((ageHours / (slaHoursTarget || 1)) * 100)));
  const slaColor = slaBreached ? primitiveSignal.critical : slaRemaining <= (slaHoursTarget ?? 0) * 0.25 ? primitiveSignal.warning : primitiveSignal.success;

  const cur = canonicalStatus(caseRecord.status);
  const blast = caseRecord.blastRadiusScore ?? caseRecord.related_entities.length;
  const affected = caseRecord.affected_entity_count ?? caseRecord.related_entities.length;
  const crownJewel = relatedAssets.some((a) => (a as { criticality?: number }).criticality !== undefined && (a as { criticality?: number }).criticality! >= 5);
  const escalationPath = strategy.routing.status === 'resolved' && strategy.routing.escalation_path ? strategy.routing.escalation_path : ['SOM', 'CISO'];

  return (
    <div style={{ padding: componentTokens.contentPadding, display: 'flex', flexDirection: 'column', gap: componentTokens.gridGap }}>
      {/* Breadcrumb / back */}
      <button onClick={() => router.push('/cases')}
        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: tokens.text.muted, fontSize: primitiveTypeScale.caption, padding: 0 }}>
        ← Case Queue
      </button>

      {/* ── CASE HEADER ─────────────────────────────────────────────────── */}
      <header style={{ ...card(tokens), padding: componentTokens.cardPadding, borderLeft: `4px solid ${p.color}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: primitiveSpacing[3] }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[2], flexWrap: 'wrap' }}>
              <span style={{ color: p.color, fontWeight: primitiveFontWeight.bold, fontSize: primitiveTypeScale.body }}>{p.shape} {p.label}</span>
              <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.caption, color: tokens.text.muted }}>{caseRecord.case_ref}</span>
              <StatusBadge status={caseRecord.status} tokens={tokens} />
              <SurfacePill surface={caseRecord.surface_attribution} tokens={tokens} />
              <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{titleCase(caseRecord.case_type)}</span>
            </div>
            <h1 style={{ margin: `${primitiveSpacing[2]} 0 0`, fontSize: primitiveTypeScale.h2, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary, lineHeight: 1.2 }}>{caseRecord.title}</h1>
          </div>
          {/* SLA countdown block */}
          <div style={{ textAlign: 'right', whiteSpace: 'nowrap', minWidth: 150 }}>
            <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>SLA</span>
            <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.h2, fontWeight: primitiveFontWeight.bold, color: slaColor }}>
              {slaBreached ? 'BREACHED' : `${Math.max(0, Math.round(slaRemaining))}h`}
            </span>
            <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>of {slaHoursTarget}h target</span>
            <div style={{ height: 4, background: tokens.border.subtle, width: '100%', marginTop: 4 }}>
              <div style={{ height: '100%', width: `${slaPct}%`, background: slaColor }} />
            </div>
          </div>
        </div>
        {/* AI-PLACEMENT: AI-CASE-DETAIL-001 — Next best action recommendation */}
      </header>

      {/* ── MASTER-DETAIL: main work column + right rail ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: componentTokens.gridGap, alignItems: 'start' }}>

        {/* MAIN WORK COLUMN */}
        <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: componentTokens.gridGap }}>
          <LifecycleTab caseRecord={caseRecord} cur={cur} tokens={tokens} mode={mode} />
          <ActionsTab actions={actions} subActionsByAction={subActionsByAction} tokens={tokens} />
          <EvidenceTab caseRecord={caseRecord} riskObjects={riskObjects} evidence={evidence} tokens={tokens} />
          <AuditTab caseRecord={caseRecord} tokens={tokens} />
          <CommsTab caseRecord={caseRecord} tokens={tokens} />
        </main>

        {/* RIGHT RAIL — case metadata / fields */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: componentTokens.gridGap, position: 'sticky', top: primitiveSpacing[3] }}>
          {/* Details */}
          <RailPanel tokens={tokens} title="Details">
            <Field tokens={tokens} label="Owner" value={caseRecord.owner} />
            <Field tokens={tokens} label="Team" value={caseRecord.team} />
            <Field tokens={tokens} label="Case Type" value={titleCase(caseRecord.case_type)} />
            <Field tokens={tokens} label="Surface" value={caseRecord.surface_attribution === 'external_attack_surface' ? 'External Attack Surface' : 'Internal Attack Surface'} />
            <Field tokens={tokens} label="Created" value={new Date(caseRecord.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} />
            <Field tokens={tokens} label="Updated" value={new Date(caseRecord.updated_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} />
            <Field tokens={tokens} label="Source" value={caseRecord.source.source_system} mono />
            <Field tokens={tokens} label="Audit Ref" value={caseRecord.auditTrailRef} mono />
            <a href={`/operating-picture/${caseRecord.surface_attribution === 'external_attack_surface' ? 'external' : 'internal'}`} className="btn btn-sm" style={{ marginTop: primitiveSpacing[2] }}>Show in Operating Picture</a>
          </RailPanel>

          {/* Impact (COIM-G where present) */}
          <RailPanel tokens={tokens} title="Impact">
            <Field tokens={tokens} label="Blast Radius" value={String(blast)} accent={blast >= 50 ? primitiveSignal.critical : undefined} />
            <Field tokens={tokens} label="Affected Entities" value={String(affected)} />
            <Field tokens={tokens} label="Crown Jewel" value={crownJewel ? 'Yes' : 'No'} accent={crownJewel ? primitiveSignal.critical : undefined} />
            {caseRecord.confidenceAggregate !== undefined && <Field tokens={tokens} label="Confidence" value={`${caseRecord.confidenceAggregate}%`} />}
            {caseRecord.dwellTimeHours !== undefined && <Field tokens={tokens} label="Dwell" value={`${caseRecord.dwellTimeHours}h`} />}
          </RailPanel>

          {/* People / escalation */}
          <RailPanel tokens={tokens} title="People & Escalation">
            <Field tokens={tokens} label="Assigned" value={caseRecord.owner} />
            <div style={{ marginTop: primitiveSpacing[1] }}>
              <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, display: 'block' }}>Escalation Path</span>
              <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary }}>{caseRecord.owner} → {caseRecord.team} → {escalationPath.join(' → ')}</span>
            </div>
          </RailPanel>

          {/* Strategy summary (real resolver output) */}
          <RailPanel tokens={tokens} title="Strategy">
            <Field tokens={tokens} label="SLA" value={strategy.sla.status === 'resolved' ? `${strategy.sla.response_hours}h` : 'Unresolved'} />
            <Field tokens={tokens} label="Routing" value={strategy.routing.status === 'resolved' ? strategy.routing.team ?? '—' : 'Unresolved'} />
            <Field tokens={tokens} label="Validation" value={strategy.validation.status === 'resolved' ? `${strategy.validation.window_hours}h window` : 'Unresolved'} />
            <Field tokens={tokens} label="Closure Gates" value={strategy.closure_gates.status === 'resolved' ? `${strategy.closure_gates.gates?.length ?? 0} gates` : 'Unresolved'} />
            <Field tokens={tokens} label="Reopening" value={strategy.reopening.status === 'resolved' ? `${strategy.reopening.triggers?.length ?? 0} triggers` : 'Unresolved'} />
            <StrategyTab strategy={strategy} tokens={tokens} compact />
          </RailPanel>

          {/* Related entities */}
          <RailPanel tokens={tokens} title={`Related (${relatedAssets.length + relatedCases.length})`}>
            {relatedAssets.length === 0 && relatedCases.length === 0 ? (
              <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>No related entities.</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: primitiveSpacing[1] }}>
                {relatedAssets.map((a) => (
                  <span key={a.id} style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary }}>
                    <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>asset</span> {(a as { name?: string }).name ?? a.id}
                  </span>
                ))}
                {relatedCases.map((rc) => (
                  <span key={rc.id} onClick={() => router.push(`/cases/${rc.id}`)} style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary, cursor: 'pointer', textDecoration: 'underline' }}>
                    <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>case</span> {rc.case_ref}
                  </span>
                ))}
              </div>
            )}
          </RailPanel>
        </aside>
      </div>
    </div>
  );
}

// ─── TAB 1: Lifecycle pipeline ──────────────────────────────────────────────

function LifecycleTab({ caseRecord, cur, tokens, mode }: { caseRecord: Case; cur: CaseStatus; tokens: Tokens; mode: string }) {
  const curIdx = LIFECYCLE_SPINE.indexOf(cur);
  const nextStates = getNextStates(cur);

  // Synthesised completed-state timestamps spread between created and updated.
  const t0 = new Date(caseRecord.created_at).getTime();
  const t1 = new Date(caseRecord.updated_at).getTime();
  const stampFor = (idx: number) => {
    if (curIdx <= 0) return caseRecord.created_at;
    const frac = idx / Math.max(1, curIdx);
    return new Date(t0 + (t1 - t0) * frac).toISOString();
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: componentTokens.gridGap }}>
      <Panel tokens={tokens} title="12-State Closed-Loop Lifecycle" subtitle={`Current state: ${STATE_LABEL[cur]}`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
          {LIFECYCLE_SPINE.map((state, i) => {
            const done = i < curIdx;
            const current = i === curIdx;
            const border = current ? primitiveSignal.info : done ? primitiveSignal.success : tokens.border.subtle;
            const color = current ? primitiveSignal.info : done ? tokens.text.secondary : tokens.text.muted;
            return (
              <div key={state} style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[2] }}>
                <div style={{
                  minWidth: 132, padding: `${primitiveSpacing[2]} ${primitiveSpacing[2]}`,
                  border: `2px solid ${border}`, background: tokens.surface.primary,
                  boxShadow: current && mode === 'mission' ? '0 0 8px rgba(59,130,246,0.35)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[1] }}>
                    <span style={{ fontSize: primitiveTypeScale.micro, color: done ? primitiveSignal.success : current ? primitiveSignal.info : tokens.border.default }}>{done ? '✓' : current ? '◆' : '○'}</span>
                    <span style={{ fontSize: primitiveTypeScale.micro, fontWeight: current ? primitiveFontWeight.bold : primitiveFontWeight.normal, color, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{STATE_LABEL[state]}</span>
                  </div>
                  {(done || current) && (
                    <div style={{ marginTop: 4, fontSize: primitiveTypeScale.micro, color: tokens.text.muted, fontFamily: primitiveFonts.mono }}>
                      {new Date(stampFor(i)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      <div>{STATE_ACTOR[state]}</div>
                    </div>
                  )}
                </div>
                {i < LIFECYCLE_SPINE.length - 1 && <span style={{ color: tokens.border.default }}>→</span>}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel tokens={tokens} title="Allowed Next States" subtitle="System-owned — no manual transition controls (Assertion 1)">
        <div style={{ display: 'flex', gap: primitiveSpacing[2], flexWrap: 'wrap' }}>
          {nextStates.length ? nextStates.map((s) => (
            <span key={s} style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary, padding: `${primitiveSpacing[1]} ${primitiveSpacing[3]}`, border: `1px solid ${tokens.border.default}` }}>
              {STATE_LABEL[s]} <span style={{ color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>· {STATE_ACTOR[s] ?? 'system'}</span>
            </span>
          )) : <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted }}>Terminal state — no onward transitions.</span>}
        </div>
      </Panel>
    </section>
  );
}

// ─── TAB 2: Actions & sub-actions ───────────────────────────────────────────

function ActionsTab({ actions, subActionsByAction, tokens }: { actions: ActionRec[]; subActionsByAction: (id: string) => SubAction[]; tokens: Tokens }) {
  if (actions.length === 0) {
    return <Panel tokens={tokens} title="Actions & Sub-Actions" subtitle="None"><Empty tokens={tokens} text="No actions decomposed for this case yet (precondition: action_decomposed)." /></Panel>;
  }
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: componentTokens.gridGap }}>
      {actions.map((a) => {
        const subs = subActionsByAction(a.id);
        return (
          <Panel key={a.id} tokens={tokens} title={a.title} subtitle={a.description}
            headerRight={<Badge tone={ACTION_TONE[a.status] ?? 'muted'} tokens={tokens} label={titleCase(a.status)} />}>
            <div style={{ display: 'flex', gap: primitiveSpacing[4], flexWrap: 'wrap', marginBottom: primitiveSpacing[3] }}>
              <Mini tokens={tokens} label="Owner" value={a.owner} />
              <Mini tokens={tokens} label="Est. effort" value={`${a.estimated_effort_hours}h`} />
              <Mini tokens={tokens} label="Actual" value={`${a.actual_effort_hours}h`} />
              <Mini tokens={tokens} label="Approval" value={a.approvalRef} mono />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: primitiveSpacing[2] }}>
              {subs.sort((x, y) => x.sequence_order - y.sequence_order).map((s) => (
                <div key={s.id} style={{ border: `1px solid ${tokens.border.subtle}`, padding: primitiveSpacing[3], background: tokens.surface.primary }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[2] }}>
                      <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>#{s.sequence_order}</span>
                      <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.primary, fontWeight: primitiveFontWeight.medium }}>{s.executionMethod}</span>
                      <span style={{ fontSize: primitiveTypeScale.micro, padding: '1px 6px', background: D3FEND_COLOR[s.tactic_type], color: '#fff', textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{s.tactic_type}</span>
                    </div>
                    <Badge tone={OUTCOME_TONE[s.outcomeClassification]} tokens={tokens} label={titleCase(s.outcomeClassification)} />
                  </div>
                  <div style={{ display: 'flex', gap: primitiveSpacing[4], flexWrap: 'wrap', marginTop: primitiveSpacing[2] }}>
                    <Mini tokens={tokens} label="Target" value={`${s.targetEntity}`} mono />
                    <Mini tokens={tokens} label="Owner" value={s.owner} />
                    <Mini tokens={tokens} label="Est / Actual" value={`${s.estimated_effort_hours}h / ${s.actual_effort_hours}h`} />
                  </div>
                  {s.countermeasures.length > 0 && (
                    <div style={{ marginTop: primitiveSpacing[2], display: 'flex', gap: primitiveSpacing[1], flexWrap: 'wrap' }}>
                      {s.countermeasures.map((cm) => (
                        <span key={cm.technique_id} title={cm.technique_name}
                          style={{ fontSize: primitiveTypeScale.micro, fontFamily: primitiveFonts.mono, color: tokens.text.secondary, border: `1px solid ${tokens.border.subtle}`, padding: '1px 5px' }}>
                          {cm.technique_id} · {cm.technique_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        );
      })}
    </section>
  );
}

// ─── TAB 3: Evidence & risk objects ─────────────────────────────────────────

function EvidenceTab({ caseRecord, riskObjects, evidence, tokens }: {
  caseRecord: Case;
  riskObjects: import('../../../../../../packages/contracts/src/entities/risk-object').RiskObject[];
  evidence: import('../../../../../../packages/contracts/src/entities/evidence').Evidence[];
  tokens: Tokens;
}) {
  const freshTone: Record<string, 'success' | 'warning' | 'critical' | 'muted'> = { fresh: 'success', aging: 'warning', stale: 'warning', expired: 'critical' };
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: componentTokens.gridGap }}>
      {/* COIM-G aggregates on the case */}
      <Panel tokens={tokens} title="COIM-G Case Aggregates" subtitle="Computed from bound risk objects">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: primitiveSpacing[3] }}>
          <Mini tokens={tokens} label="Blast Radius" value={caseRecord.blastRadiusScore !== undefined ? String(caseRecord.blastRadiusScore) : '—'} />
          <Mini tokens={tokens} label="Affected" value={caseRecord.affected_entity_count !== undefined ? String(caseRecord.affected_entity_count) : '—'} />
          <Mini tokens={tokens} label="Dwell (h)" value={caseRecord.dwellTimeHours !== undefined ? String(caseRecord.dwellTimeHours) : '—'} />
          <Mini tokens={tokens} label="Confidence" value={caseRecord.confidenceAggregate !== undefined ? `${caseRecord.confidenceAggregate}%` : '—'} />
          <Mini tokens={tokens} label="ATT&CK" value={caseRecord.attacks?.length ? `${caseRecord.attacks.length} technique(s)` : '—'} />
        </div>
        {caseRecord.attacks?.length ? (
          <div style={{ marginTop: primitiveSpacing[3], display: 'flex', gap: primitiveSpacing[1], flexWrap: 'wrap' }}>
            {caseRecord.attacks.map((t) => (
              <span key={t.technique} style={{ fontSize: primitiveTypeScale.micro, fontFamily: primitiveFonts.mono, color: tokens.text.secondary, border: `1px solid ${tokens.border.subtle}`, padding: '1px 6px' }}>
                {t.technique} · {t.tactic}
              </span>
            ))}
          </div>
        ) : null}
        {caseRecord.findingClassBreakdown && (
          <div style={{ marginTop: primitiveSpacing[2], fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>
            Finding classes: {Object.entries(caseRecord.findingClassBreakdown).map(([k, v]) => `${k} ×${v}`).join(', ')}
          </div>
        )}
      </Panel>

      {/* AI-PLACEMENT: AI-CASE-DETAIL-002 — Evidence gap explanation */}

      {/* Bound risk objects */}
      <Panel tokens={tokens} title="Bound Risk Objects" subtitle={`${riskObjects.length} bound`}>
        {riskObjects.length === 0 ? <Empty tokens={tokens} text="No risk objects bound to this case." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: primitiveSpacing[3] }}>
            {riskObjects.map((r) => {
              const sc = r.source_classification;
              return (
                <div key={r.id} style={{ border: `1px solid ${tokens.border.subtle}`, padding: primitiveSpacing[3], background: tokens.surface.primary }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
                    <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.primary, fontWeight: primitiveFontWeight.medium }}>{titleCase(r.type)}</span>
                    <Badge tone={r.treatment_state === 'open' ? 'warning' : 'success'} tokens={tokens} label={titleCase(r.treatment_state)} />
                  </div>
                  <p style={{ margin: `${primitiveSpacing[2]} 0`, fontSize: primitiveTypeScale.caption, color: tokens.text.secondary, lineHeight: 1.43 }}>{r.justification}</p>
                  {sc && (
                    <div style={{ display: 'flex', gap: primitiveSpacing[4], flexWrap: 'wrap', marginTop: primitiveSpacing[2] }}>
                      <Mini tokens={tokens} label="Finding class" value={titleCase(sc.finding_class)} />
                      <Mini tokens={tokens} label="Severity" value={`${sc.source_severity.severity_level} (${sc.source_severity.severity_id})`} />
                      <Mini tokens={tokens} label="Confidence" value={`${sc.source_confidence.confidence_level} (${sc.source_confidence.confidence_score}%)`} />
                      <Mini tokens={tokens} label="Source" value={`${sc.source_product.vendor} ${sc.source_product.name}`} />
                      <Mini tokens={tokens} label="Connector" value={`Class ${sc.source_product.connector_class}`} />
                    </div>
                  )}
                  {sc?.attacks && sc.attacks.length > 0 && (
                    <div style={{ marginTop: primitiveSpacing[2], display: 'flex', gap: primitiveSpacing[1], flexWrap: 'wrap' }}>
                      {sc.attacks.map((t) => (
                        <span key={t.technique} style={{ fontSize: primitiveTypeScale.micro, fontFamily: primitiveFonts.mono, color: tokens.text.secondary, border: `1px solid ${tokens.border.subtle}`, padding: '1px 5px' }}>{t.technique} · {t.technique_name}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Evidence artefacts */}
      <Panel tokens={tokens} title="Evidence Pack" subtitle={`${evidence.length} artefact(s) — freshness indicates collection recency`}>
        {evidence.length === 0 ? <Empty tokens={tokens} text="No evidence artefacts bound to this case." /> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Type', 'Source', 'Collected By', 'Confidence', 'Collected', 'Freshness'].map((h) => <Th key={h} tokens={tokens}>{h}</Th>)}</tr></thead>
            <tbody>
              {evidence.map((e) => (
                <tr key={e.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <Td tokens={tokens}>{titleCase(e.evidence_type)}</Td>
                  <Td tokens={tokens}><span style={{ fontFamily: primitiveFonts.mono }}>{e.source.source_system}</span></Td>
                  <Td tokens={tokens}><span className="badge bg-secondary">{e.evidenceSource}</span></Td>
                  <Td tokens={tokens}>{e.confidence}%</Td>
                  <Td tokens={tokens}>{new Date(e.collected_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</Td>
                  <Td tokens={tokens}><Badge tone={freshTone[e.freshnessStatus] ?? 'muted'} tokens={tokens} label={titleCase(e.freshnessStatus)} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </section>
  );
}

// ─── TAB 4: Communication (email + Teams — explicitly mocked) ───────────────

// ─── TAB 4: Communication — placeholder (no email/Teams entity exists yet) ──

function CommsTab({ caseRecord, tokens }: { caseRecord: Case; tokens: Tokens }) {
  const emails = thesisEmailCommunications.filter((e) => e.case_ref === caseRecord.id);
  const drafts = thesisGovernedCompose.filter((d) => d.case_ref === caseRecord.id);
  const teamsDecs = thesisTeamsDecisionEvents.filter((t) => t.case_id === caseRecord.id);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: componentTokens.gridGap }}>
      {/* Email Communication Thread (UC-201) */}
      <Panel tokens={tokens} title="Email Communication Thread" subtitle={`${emails.length} email(s) bound to this case`}>
        {emails.length === 0 ? (
          <Empty tokens={tokens} text="No email communications bound to this case in seed data." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: primitiveSpacing[2] }}>
            {emails.map((e) => (
              <div key={e.id} style={{ border: `1px solid ${tokens.border.subtle}`, padding: primitiveSpacing[3], background: tokens.surface.primary }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
                  <span style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.medium, color: tokens.text.primary }}>{e.subject}</span>
                  <Badge tone={e.status === 'bound' ? 'success' : e.status === 'pending_binding' ? 'warning' : 'muted'} tokens={tokens} label={titleCase(e.status)} />
                </div>
                <div style={{ display: 'flex', gap: primitiveSpacing[4], flexWrap: 'wrap', marginTop: primitiveSpacing[2] }}>
                  <Mini tokens={tokens} label="Direction" value={titleCase(e.direction)} />
                  <Mini tokens={tokens} label="From" value={e.sender_address} />
                  <Mini tokens={tokens} label="Confidence" value={`${Math.round(e.bindingConfidence * 100)}%`} />
                  <Mini tokens={tokens} label="Received" value={new Date(e.received_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })} />
                </div>
                <p style={{ margin: `${primitiveSpacing[2]} 0 0`, fontSize: primitiveTypeScale.micro, color: tokens.text.muted, lineHeight: 1.4 }}>{e.bodyPreview}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Teams / Command Bridge Integration (UC-201) */}
      <Panel tokens={tokens} title="Teams / Command Bridge" subtitle={`${teamsDecs.length} decision event(s)`}>
        {teamsDecs.length === 0 ? (
          <Empty tokens={tokens} text="No Teams decision events bound to this case." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: primitiveSpacing[2] }}>
            {teamsDecs.map((t) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: primitiveSpacing[2], border: `1px solid ${tokens.border.subtle}`, background: tokens.surface.primary }}>
                <div>
                  <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.primary }}>{titleCase(t.requestType)}</span>
                  <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{t.requestType} · {t.respondedBy ?? 'pending'}</span>
                </div>
                <Badge tone={t.decision === 'approved' || t.decision === 'confirmed' ? 'success' : t.decision === 'denied' ? 'critical' : 'warning'} tokens={tokens} label={t.decision ? titleCase(t.decision) : 'Pending'} />
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Outbound Draft & Approval Chain (UC-202) */}
      <Panel tokens={tokens} title="Outbound Draft & Approval Chain" subtitle={`${drafts.length} governed draft(s)`}>
        {drafts.length === 0 ? (
          <Empty tokens={tokens} text="No governed outbound drafts for this case." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: primitiveSpacing[2] }}>
            {drafts.map((d) => (
              <div key={d.id} style={{ border: `1px solid ${tokens.border.subtle}`, padding: primitiveSpacing[3], background: tokens.surface.primary }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
                  <span style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.medium, color: tokens.text.primary }}>{d.draftSubject}</span>
                  <Badge tone={d.approvalStatus === 'approved' ? 'success' : d.approvalStatus === 'rejected' ? 'critical' : 'warning'} tokens={tokens} label={titleCase(d.approvalStatus)} />
                </div>
                <div style={{ display: 'flex', gap: primitiveSpacing[4], flexWrap: 'wrap', marginTop: primitiveSpacing[2] }}>
                  <Mini tokens={tokens} label="Channel" value={titleCase(d.channel)} />
                  <Mini tokens={tokens} label="Approver" value={d.approverRef} />
                  <Mini tokens={tokens} label="Recipients" value={d.recipients.join(', ')} />
                  <Mini tokens={tokens} label="Expires" value={new Date(d.expires_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}

// ─── TAB 5: Strategy bindings ───────────────────────────────────────────────

function StrategyTab({ strategy, tokens, compact }: { strategy: ReturnType<typeof resolveAllStrategies>; tokens: Tokens; compact?: boolean }) {
  // In the right rail we already show a summary; compact mode renders only the
  // gate/trigger detail lists that the summary fields don't capture.
  if (compact) {
    return (
      <div style={{ marginTop: primitiveSpacing[2], display: 'flex', flexDirection: 'column', gap: primitiveSpacing[1] }}>
        {strategy.closure_gates.status === 'resolved' && strategy.closure_gates.gates && strategy.closure_gates.gates.length > 0 && (
          <div>
            <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, display: 'block' }}>Closure Gates</span>
            <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.secondary }}>{strategy.closure_gates.gates.map(titleCase).join(', ')}</span>
          </div>
        )}
        {strategy.reopening.status === 'resolved' && strategy.reopening.triggers && strategy.reopening.triggers.length > 0 && (
          <div>
            <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, display: 'block' }}>Reopening Triggers</span>
            <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.secondary }}>{strategy.reopening.triggers.map(titleCase).join(', ')}</span>
          </div>
        )}
      </div>
    );
  }
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: componentTokens.gridGap }}>
      <Panel tokens={tokens} title="SLA Strategy" subtitle="Resolved from SLA surface">
        {strategy.sla.status === 'resolved' ? (
          <div style={{ display: 'flex', gap: primitiveSpacing[4], flexWrap: 'wrap' }}>
            <Mini tokens={tokens} label="Response" value={`${strategy.sla.response_hours}h`} />
            <Mini tokens={tokens} label="Escalation cadence" value={strategy.sla.escalation_cadence_minutes !== null ? `${strategy.sla.escalation_cadence_minutes} min` : '—'} />
            <Mini tokens={tokens} label="Policy" value={strategy.sla.source_policy?.id ?? '—'} mono />
          </div>
        ) : <Unresolved tokens={tokens} />}
      </Panel>

      <Panel tokens={tokens} title="Routing Strategy" subtitle="Resolved from routing surface">
        {strategy.routing.status === 'resolved' ? (
          <div style={{ display: 'flex', gap: primitiveSpacing[4], flexWrap: 'wrap' }}>
            <Mini tokens={tokens} label="Team" value={strategy.routing.team ?? '—'} />
            <Mini tokens={tokens} label="Escalation" value={(strategy.routing.escalation_path ?? []).join(' → ') || '—'} />
            <Mini tokens={tokens} label="Policy" value={strategy.routing.source_policy?.id ?? '—'} mono />
          </div>
        ) : <Unresolved tokens={tokens} />}
      </Panel>

      <Panel tokens={tokens} title="Prioritisation Weights" subtitle="Resolved from prioritisation-weight surface">
        {strategy.priority.status === 'resolved' && strategy.priority.weights ? (
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            {Object.entries(strategy.priority.weights).map(([k, v]) => <Mini key={k} tokens={tokens} label={titleCase(k)} value={String(v)} />)}
          </div>
        ) : <Unresolved tokens={tokens} />}
      </Panel>

      <Panel tokens={tokens} title="Validation Window" subtitle="Resolved from validation-window surface">
        {strategy.validation.status === 'resolved' ? (
          <div style={{ display: 'flex', gap: primitiveSpacing[4], flexWrap: 'wrap' }}>
            <Mini tokens={tokens} label="Window" value={`${strategy.validation.window_hours}h`} />
            <Mini tokens={tokens} label="Freshness" value={`${strategy.validation.freshnessHours}h`} />
          </div>
        ) : <Unresolved tokens={tokens} />}
      </Panel>

      {/* AI-PLACEMENT: AI-CASE-DETAIL-003 — Closure gate explanation */}
      <Panel tokens={tokens} title="Closure Gates" subtitle="All gates must pass for system closure">
        {strategy.closure_gates.status === 'resolved' && strategy.closure_gates.gates ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: primitiveSpacing[1] }}>
            {strategy.closure_gates.gates.map((g) => (
              <div key={g} style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[2] }}>
                <span style={{ width: 8, height: 8, background: tokens.text.muted, display: 'inline-block' }} />
                <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary }}>{titleCase(g)}</span>
              </div>
            ))}
          </div>
        ) : <Unresolved tokens={tokens} />}
      </Panel>

      <Panel tokens={tokens} title="Reopening Triggers" subtitle="Armed conditions that reopen a closed case">
        {strategy.reopening.status === 'resolved' && strategy.reopening.triggers ? (
          <div style={{ display: 'flex', gap: primitiveSpacing[2], flexWrap: 'wrap' }}>
            {strategy.reopening.triggers.map((t) => (
              <span key={t} style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary, border: `1px solid ${tokens.border.default}`, padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}` }}>{titleCase(t)} <span style={{ color: tokens.status.success, fontSize: primitiveTypeScale.micro }}>· armed</span></span>
            ))}
          </div>
        ) : <Unresolved tokens={tokens} />}
      </Panel>
    </section>
  );
}

// ─── TAB 6: Activity timeline (REAL seed-events for this case) ──────────────

function AuditTab({ caseRecord, tokens }: { caseRecord: Case; tokens: Tokens }) {
  // Real activity events from seed-events.ts that reference this case, newest first.
  const sevColor: Record<string, string> = {
    critical: tokens.status.critical, warning: tokens.status.warning,
    info: tokens.status.info, success: tokens.status.success, neutral: tokens.text.muted,
  };
  const events = thesisEvents
    .filter((e) => e.entity_type === 'case' && e.entity_ref === caseRecord.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: componentTokens.gridGap }}>
      <Panel tokens={tokens} title="Activity Timeline" subtitle={`${events.length} real event(s) from seed-events for this case`}>
        {events.length === 0 ? (
          <Empty tokens={tokens} text="No activity events reference this case in seed-events." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {events.map((e, i) => (
              <div key={e.id} style={{ display: 'flex', gap: primitiveSpacing[3], padding: `${primitiveSpacing[2]} 0`, borderBottom: i < events.length - 1 ? `1px solid ${tokens.border.subtle}` : 'none', alignItems: 'baseline' }}>
                <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.muted, minWidth: 130, whiteSpace: 'nowrap' }}>
                  {new Date(e.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: sevColor[e.severity], display: 'inline-block', flexShrink: 0, alignSelf: 'center' }} />
                <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.primary, flex: 1 }}>{e.message}</span>
                <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, fontFamily: primitiveFonts.mono }}>{e.severity}</span>
              </div>
            ))}
          </div>
        )}
        <p style={{ margin: `${primitiveSpacing[3]} 0 0`, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>Audit ref: {caseRecord.auditTrailRef}</p>
      </Panel>
      {/* Structured Lifecycle Audit Trail (UC-206) */}
      <Panel tokens={tokens} title="Structured Lifecycle Audit Trail" subtitle={`${thesisCaseTransitionAudits.filter((t) => t.case_ref === caseRecord.id).length} structured transition(s) for this case`}>
        {(() => {
          const transitions = thesisCaseTransitionAudits.filter((t) => t.case_ref === caseRecord.id);
          if (transitions.length === 0) return <Empty tokens={tokens} text="No structured transition audits for this case in seed data." />;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: primitiveSpacing[2] }}>
              {transitions.map((t) => (
                <div key={t.id} style={{ display: 'flex', gap: primitiveSpacing[3], padding: primitiveSpacing[2], border: `1px solid ${tokens.border.subtle}`, background: tokens.surface.primary, alignItems: 'center' }}>
                  <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.muted, minWidth: 130, whiteSpace: 'nowrap' }}>{new Date(t.transitioned_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary }}>{titleCase(t.from_state)} → {titleCase(t.to_state)}</span>
                  <span style={{ fontSize: primitiveTypeScale.micro, padding: '1px 6px', border: `1px solid ${tokens.border.default}`, color: tokens.text.muted }}>{t.triggeredBy}</span>
                  <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, flex: 1 }}>{t.reason}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </Panel>
    </section>
  );
}

// ─── Shared helpers ─────────────────────────────────────────────────────────

function titleCase(s: string): string {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

const card = (tokens: Tokens): React.CSSProperties => ({
  background: tokens.surface.elevated,
  border: `1px solid ${tokens.border.subtle}`,
  borderRadius: componentTokens.cardRadius,
});

function Panel({ tokens, title, subtitle, headerRight, children }: { tokens: Tokens; title: string; subtitle?: string; headerRight?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ ...card(tokens), padding: componentTokens.cardPadding }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: primitiveSpacing[3], marginBottom: componentTokens.cardHeaderMargin }}>
        <div>
          <h3 style={{ margin: 0, fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{title}</h3>
          {subtitle && <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{subtitle}</span>}
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function Mini({ tokens, label, value, mono }: { tokens: Tokens; label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{label}</span>
      <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary, fontFamily: mono ? primitiveFonts.mono : primitiveFonts.body }}>{value}</span>
    </div>
  );
}

function Badge({ tokens, label, tone }: { tokens: Tokens; label: string; tone: 'success' | 'warning' | 'critical' | 'muted' }) {
  const bg = tone === 'success' ? tokens.status.success : tone === 'warning' ? tokens.status.warning : tone === 'critical' ? tokens.status.critical : tokens.text.muted;
  return <span style={{ fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.medium, padding: `2px ${primitiveSpacing[2]}`, background: bg, color: '#fff', whiteSpace: 'nowrap' }}>{label}</span>;
}

function Th({ tokens, children }: { tokens: Tokens; children: React.ReactNode }) {
  return <th style={{ textAlign: 'left', padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.secondary, fontSize: primitiveTypeScale.micro, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, whiteSpace: 'nowrap' }}>{children}</th>;
}

function Td({ tokens, children }: { tokens: Tokens; children: React.ReactNode }) {
  return <td style={{ padding: `${primitiveSpacing[2]}`, color: tokens.text.secondary }}>{children}</td>;
}

function SurfacePill({ surface, tokens }: { surface: string; tokens: Tokens }) {
  const external = surface === 'external_attack_surface';
  return <span style={{ fontSize: primitiveTypeScale.micro, padding: '1px 6px', border: `1px solid ${external ? primitiveSignal.info : tokens.border.default}`, color: external ? primitiveSignal.info : tokens.text.muted }}>{external ? 'External' : 'Internal'}</span>;
}

function Empty({ tokens, text }: { tokens: Tokens; text: string }) {
  return <p style={{ margin: 0, fontSize: primitiveTypeScale.caption, color: tokens.text.muted }}>{text}</p>;
}

function Unresolved({ tokens }: { tokens: Tokens }) {
  return <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted }}>Unresolved — no matching strategy policy.</span>;
}

// ─── Right-rail helpers ─────────────────────────────────────────────────────

function RailPanel({ tokens, title, children }: { tokens: Tokens; title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...card(tokens), padding: componentTokens.cardPadding }}>
      <h4 style={{ margin: `0 0 ${primitiveSpacing[2]}`, fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: primitiveSpacing[2] }}>{children}</div>
    </div>
  );
}

function Field({ tokens, label, value, accent, mono }: { tokens: Tokens; label: string; value: string; accent?: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: primitiveSpacing[2] }}>
      <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: primitiveTypeScale.caption, color: accent ?? tokens.text.primary, fontWeight: primitiveFontWeight.medium, fontFamily: mono ? primitiveFonts.mono : primitiveFonts.body, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={value}>{value}</span>
    </div>
  );
}

function StatusBadge({ status, tokens }: { status: string; tokens: Tokens }) {
  const label =
    status === 'closed' || status === 'closed_by_system' ? 'Closed'
    : status === 'awaiting-validation' || status === 'pending_validation' || status === 'validation_running' ? 'Awaiting Validation'
    : status === 'awaiting-closure' || status === 'pending_closure_gates' ? 'Awaiting Closure'
    : status === 'in-progress' || status === 'in_progress' ? 'In Progress'
    : status === 'open' || status === 'detected' ? 'Open'
    : titleCase(status);
  const tone: string =
    label === 'Closed' ? tokens.text.muted
    : label === 'Awaiting Validation' || label === 'Awaiting Closure' ? tokens.status.warning
    : label === 'In Progress' ? tokens.status.info
    : tokens.status.neutral;
  return <span style={{ fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.medium, padding: `2px ${primitiveSpacing[2]}`, border: `1px solid ${tone}`, color: tone, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, whiteSpace: 'nowrap' }}>{label}</span>;
}
