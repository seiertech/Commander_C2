/**
 * Commander AI Core — Grounding & Refusal (Unit 40)
 *
 * Source: Spec #13 Commander AI Architecture and Grounding Rules
 *   (`docs/99_source_archive/baseline_v2_6_2/docs/02_child_specs/13_Commander_AI_Architecture_and_Grounding_Rules.md`).
 * Steering: `.kiro/steering/ai-grounding.md`.
 *
 * Commander AI is core from v1.1. This module is the deterministic grounding +
 * refusal core — the v1.1 "Deterministic Grounding Pipeline" (Feature Registry
 * `feat.commander.grounding_pipeline`). It performs NO live model inference and
 * NO external/vendor calls — those belong to the AWS/Bedrock evaluation lane
 * (Unit 41, Team-2 / Phase-2 gated). Every function here is pure and operates
 * ONLY over Commander-owned data supplied by the caller.
 *
 * Doctrinal guarantees (ai-grounding steering + AGENTS.md):
 *   - Grounded: outputs derive only from supplied Commander records; the core
 *     never fabricates estate facts. Ungrounded references are refused.
 *   - Refusal: the core refuses to (a) invent estate facts, (b) silently
 *     execute external writes, (c) bypass approval chains, (d) override
 *     baseline authority.
 *   - Traceable: every output carries the ids of the records it was grounded
 *     in, and produces a `commander-ai` audit execution record.
 */

import type { Case } from '../entities/case';
import type { RiskObject } from '../entities/risk-object';
import type { Asset } from '../entities/asset';
import type { Identity } from '../entities/identity';
import type { AuditEvent, AuditActor } from '../entities/audit-event';
import type { TenantContext } from '../entities/common';

// ─── Grounding Corpus ────────────────────────────────────────────────────────

/**
 * The Commander-owned data the AI is allowed to ground in. Supplied by the
 * caller — the core never fetches data itself (no I/O, no side effects).
 */
export interface GroundingCorpus {
  cases: Case[];
  riskObjects: RiskObject[];
  assets: Asset[];
  identities: Identity[];
}

/** A single grounded reference — an id the output is anchored to. */
export interface GroundingRef {
  entityType: 'case' | 'risk-object' | 'asset' | 'identity';
  entityId: string;
}

/** Result of attempting to ground a set of referenced ids against the corpus. */
export interface GroundingResult {
  grounded: boolean;
  /** References that exist in the corpus. */
  resolved: GroundingRef[];
  /** References that do NOT exist in the corpus (would be estate-fact invention). */
  unresolved: GroundingRef[];
}

/**
 * Ground a set of references against the corpus. If any reference cannot be
 * resolved to a real Commander record, grounding fails (the caller must refuse
 * rather than invent the missing fact).
 */
export function groundReferences(refs: GroundingRef[], corpus: GroundingCorpus): GroundingResult {
  const has = (ref: GroundingRef): boolean => {
    switch (ref.entityType) {
      case 'case': return corpus.cases.some((c) => c.id === ref.entityId);
      case 'risk-object': return corpus.riskObjects.some((r) => r.id === ref.entityId);
      case 'asset': return corpus.assets.some((a) => a.id === ref.entityId);
      case 'identity': return corpus.identities.some((i) => i.id === ref.entityId);
      default: return false;
    }
  };
  const resolved: GroundingRef[] = [];
  const unresolved: GroundingRef[] = [];
  for (const ref of refs) (has(ref) ? resolved : unresolved).push(ref);
  return { grounded: unresolved.length === 0, resolved, unresolved };
}

// ─── Refusal Framework ───────────────────────────────────────────────────────

/** The four refusal categories Commander AI must enforce (Spec #13). */
export type RefusalReason =
  | 'ungrounded-estate-fact'
  | 'external-write'
  | 'approval-bypass'
  | 'authority-override';

export const REFUSAL_REASONS: RefusalReason[] = [
  'ungrounded-estate-fact',
  'external-write',
  'approval-bypass',
  'authority-override',
];

/** Human-readable refusal explanations. */
export const REFUSAL_LABELS: Record<RefusalReason, string> = {
  'ungrounded-estate-fact': 'Refused: request would assert an estate fact not present in Commander data.',
  'external-write': 'Refused: Commander AI may not silently execute external writes.',
  'approval-bypass': 'Refused: Commander AI may not bypass approval chains.',
  'authority-override': 'Refused: Commander AI may not override baseline authority.',
};

/** An AI action request to be checked against the refusal framework. */
export interface AiActionRequest {
  /** What the action intends to do. */
  intent: 'draft' | 'explain' | 'summarize' | 'navigate' | 'execute-external' | 'override-authority' | 'bypass-approval';
  /** References the action depends on (checked for grounding). */
  references?: GroundingRef[];
}

/** Result of the refusal check. */
export interface RefusalCheck {
  allowed: boolean;
  reasons: RefusalReason[];
  rationale: string;
}

/**
 * Evaluate an AI action against the refusal framework. Returns allowed=false
 * with the specific reason(s) when the action breaches a doctrinal boundary.
 * Read-only intents (draft/explain/summarize/navigate) are allowed only when
 * all their references are grounded.
 */
export function checkRefusal(request: AiActionRequest, corpus: GroundingCorpus): RefusalCheck {
  const reasons: RefusalReason[] = [];

  // Action-type boundaries — these intents are always refused.
  if (request.intent === 'execute-external') reasons.push('external-write');
  if (request.intent === 'bypass-approval') reasons.push('approval-bypass');
  if (request.intent === 'override-authority') reasons.push('authority-override');

  // Grounding boundary — read-only intents must be fully grounded.
  const isReadOnly = request.intent === 'draft' || request.intent === 'explain' ||
    request.intent === 'summarize' || request.intent === 'navigate';
  if (isReadOnly && request.references && request.references.length > 0) {
    const g = groundReferences(request.references, corpus);
    if (!g.grounded) reasons.push('ungrounded-estate-fact');
  }

  const allowed = reasons.length === 0;
  return {
    allowed,
    reasons,
    rationale: allowed
      ? 'Allowed: action is read-only and fully grounded in Commander data.'
      : reasons.map((r) => REFUSAL_LABELS[r]).join(' '),
  };
}

// ─── Grounded Output (draft / explain / summarize / navigate) ────────────────

/** A grounded AI output. Refused outputs carry `refused: true` and a reason. */
export interface AiOutput {
  capability: 'draft' | 'explain' | 'summarize' | 'navigate';
  refused: boolean;
  refusalReasons: RefusalReason[];
  /** The output text — only populated when not refused. */
  text: string;
  /** Records the output is grounded in (traceability). */
  groundedIn: GroundingRef[];
}

function refusedOutput(capability: AiOutput['capability'], check: RefusalCheck): AiOutput {
  return { capability, refused: true, refusalReasons: check.reasons, text: '', groundedIn: [] };
}

/**
 * Draft a case summary — grounded strictly in the supplied case record.
 * Refuses if the case is not in the corpus (no invented cases).
 */
export function draftCaseSummary(caseId: string, corpus: GroundingCorpus): AiOutput {
  const ref: GroundingRef = { entityType: 'case', entityId: caseId };
  const check = checkRefusal({ intent: 'draft', references: [ref] }, corpus);
  if (!check.allowed) return refusedOutput('draft', check);
  const c = corpus.cases.find((x) => x.id === caseId)!;
  return {
    capability: 'draft',
    refused: false,
    refusalReasons: [],
    text: `${c.caseRef} (${c.priority}, ${c.status}): ${c.title}. Owner ${c.owner}, team ${c.team}. ` +
      `Surface: ${c.surfaceAttribution}. Routing rationale: ${c.routingRationale}`,
    groundedIn: [ref],
  };
}

/**
 * Explain a case's routing — grounded in the case's own recorded rationale
 * (never invented; the routing decision belongs to the routing engine).
 */
export function explainCaseRouting(caseId: string, corpus: GroundingCorpus): AiOutput {
  const ref: GroundingRef = { entityType: 'case', entityId: caseId };
  const check = checkRefusal({ intent: 'explain', references: [ref] }, corpus);
  if (!check.allowed) return refusedOutput('explain', check);
  const c = corpus.cases.find((x) => x.id === caseId)!;
  return {
    capability: 'explain',
    refused: false,
    refusalReasons: [],
    text: `${c.caseRef} was routed to ${c.team} (owner ${c.owner}). Recorded rationale: ${c.routingRationale}`,
    groundedIn: [ref],
  };
}

/**
 * Summarize risk-object treatment for an entity — grounded in supplied risk objects.
 */
export function summarizeRiskTreatment(riskObjectId: string, corpus: GroundingCorpus): AiOutput {
  const ref: GroundingRef = { entityType: 'risk-object', entityId: riskObjectId };
  const check = checkRefusal({ intent: 'summarize', references: [ref] }, corpus);
  if (!check.allowed) return refusedOutput('summarize', check);
  const r = corpus.riskObjects.find((x) => x.id === riskObjectId)!;
  return {
    capability: 'summarize',
    refused: false,
    refusalReasons: [],
    text: `Risk object ${r.id} (${r.type}) is ${r.treatmentState}. ${r.justification} Owner: ${r.owner}.`,
    groundedIn: [ref],
  };
}

/**
 * Navigation assistance — resolve a free-text-ish hint to grounded entity refs.
 * Only returns entities that actually exist (no invented navigation targets).
 */
export function navigateToEntity(query: string, corpus: GroundingCorpus): AiOutput {
  const q = query.trim().toLowerCase();
  const matches: GroundingRef[] = [];
  for (const c of corpus.cases) {
    if (c.caseRef.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)) {
      matches.push({ entityType: 'case', entityId: c.id });
    }
  }
  for (const a of corpus.assets) {
    if (a.name.toLowerCase().includes(q)) matches.push({ entityType: 'asset', entityId: a.id });
  }
  for (const i of corpus.identities) {
    if (i.displayName.toLowerCase().includes(q)) matches.push({ entityType: 'identity', entityId: i.id });
  }
  return {
    capability: 'navigate',
    refused: false,
    refusalReasons: [],
    text: matches.length > 0
      ? `Found ${matches.length} matching Commander record(s).`
      : 'No matching Commander records found.',
    groundedIn: matches,
  };
}

// ─── Execution Logging ───────────────────────────────────────────────────────

const COMMANDER_AI_ACTOR: AuditActor = {
  type: 'commander-ai',
  id: 'commander-ai-core',
  name: 'Commander AI',
};

/**
 * Produce an immutable `commander-ai` audit execution record for an AI output.
 * Every AI output — including refusals — is logged as a Commander execution
 * record (ai-grounding steering: outputs logged as Commander execution records).
 * Pure: shapes the record; the caller persists it.
 */
export function logAiExecution(
  output: AiOutput,
  tenant: TenantContext,
  at: string,
  auditId: string,
): AuditEvent {
  return {
    id: auditId,
    entityType: 'audit-event',
    tenant,
    createdAt: at,
    updatedAt: at,
    source: {
      connectorId: 'commander-ai-core',
      importRunId: `ai-${auditId}`,
      sourceSystem: 'commander-ai-core',
      sourceTimestamp: at,
    },
    actor: COMMANDER_AI_ACTOR,
    action: output.refused ? `ai-${output.capability}-refused` : `ai-${output.capability}`,
    entityRef: {
      entityType: output.groundedIn[0]?.entityType ?? 'none',
      entityId: output.groundedIn[0]?.entityId ?? 'none',
    },
    sourceSignal: null,
    priorState: null,
    newState: null,
    rationale: output.refused
      ? `Commander AI refused: ${output.refusalReasons.join(', ')}`
      : `Commander AI ${output.capability} grounded in ${output.groundedIn.length} record(s).`,
    immutable: true,
  };
}
