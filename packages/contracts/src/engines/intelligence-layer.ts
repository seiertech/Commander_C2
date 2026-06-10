// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Intelligence Layer — Commander C2 Four-Stream Integration (Unit 14)
 *
 * Source: Spec #59 Intelligence Layer Architecture (binding)
 * Also: Spec #60 (surface attribution), Spec #61 (connector classes), Spec #62 (verdicts)
 *
 * The Intelligence Layer sits between the connector classes (raw signal) and the
 * surface layer (integrated intelligence). It integrates four distinct streams,
 * composes them into the unified Estate Intelligence Picture (EIP), and produces
 * cross-stream correlations no single stream contains.
 *
 * Unit 14 Deliverables:
 * 1. Four intelligence streams (Spec #59 §3):
 *    - External Threat Intelligence    ← Class D connectors
 *    - External Attack Intelligence     ← Class A connectors
 *    - Internal Behavioural Intelligence ← Class B connectors
 *    - Posture Intelligence              ← Class C connectors + engines
 * 2. Estate Intelligence Picture (EIP) — unified integration surface (§5)
 * 3. Cross-stream correlations (§6):
 *    - Pre-Warned / Protected / Novel classification (§6.1)
 *    - Verdict disagreement detection (§6.2)
 *    - Inverse discovery (§6.3)
 *    - Behavioural anomaly detection (§6.4)
 *    - Threat relevance scoring (§6.5)
 *    - Silent defence aggregation (§6.6)
 *
 * Doctrinal Assertions:
 * - Assertion 9: Four streams (External Threat, External Attack, Internal
 *   Behavioural, Posture) remain DISTINCT — never a fifth stream, never merged,
 *   never stripped of stream→surface lineage.
 * - Assertion 10: Surface attribution preserved on relevant records.
 * - Assertion 11: Connector classes A/B/C/D only; verdicts preserve semantic disposition.
 *
 * Architectural rule (§2, §15): the layering is preserved — connectors below,
 * EIP above, surfaces consume from the EIP. This module is the EIP integration
 * locus; it does not store data and does not own the canonical model.
 */

import type { ConnectorClass, SurfaceAttribution } from '../entities/common';

// ─── The Four Streams (Spec #59 §3) ──────────────────────────────────────────

/**
 * The four intelligence streams. Exactly four — never a fifth (Doctrinal
 * Assertion 9). Each maps 1:1 to a connector class per Spec #59 §3 / §12.1.
 */
export type IntelligenceStream =
  | 'external_threat'
  | 'external_attack'
  | 'internal_behavioural'
  | 'posture';

/** The four streams as a constant array (canonical order per Spec #59 §3). */
export const INTELLIGENCE_STREAMS: IntelligenceStream[] = [
  'external_threat',
  'external_attack',
  'internal_behavioural',
  'posture',
];

/** Human-readable stream labels (Spec #59 §3 headings). */
export const STREAM_LABELS: Record<IntelligenceStream, string> = {
  external_threat: 'External Threat Intelligence',
  external_attack: 'External Attack Intelligence',
  internal_behavioural: 'Internal Behavioural Intelligence',
  posture: 'Posture Intelligence',
};

/**
 * Connector-class → stream mapping (Spec #59 §3 + §12.1 Stream Routing):
 * - Class D Threat Intelligence  → External Threat Intelligence
 * - Class A SOC Telemetry        → External Attack Intelligence
 * - Class B Operational Verdict  → Internal Behavioural Intelligence
 * - Class C Configuration State  → Posture Intelligence (via engines)
 */
export const CLASS_TO_STREAM: Record<ConnectorClass, IntelligenceStream> = {
  D: 'external_threat',
  A: 'external_attack',
  B: 'internal_behavioural',
  C: 'posture',
};

/** Which attack surface each stream principally informs (Spec #60 / §16). */
export const STREAM_SURFACE_AFFINITY: Record<IntelligenceStream, SurfaceAttribution | 'both'> = {
  external_threat: 'external_attack_surface',
  external_attack: 'external_attack_surface',
  internal_behavioural: 'internal_attack_surface',
  posture: 'both',
};

/**
 * Resolve which intelligence stream a connector class feeds.
 * Posture Intelligence is also produced internally by Commander's engines
 * (Spec #59 §3.4) — Class C provides its input data.
 */
export function resolveStreamForClass(connector_class: ConnectorClass): IntelligenceStream {
  return CLASS_TO_STREAM[connectorClass];
}

/**
 * Route a set of declared connector classes (multi-class declaration per
 * Spec #61) to the distinct streams they feed. Deduplicated; order follows the
 * canonical stream order.
 */
export function routeClassesToStreams(classes: ConnectorClass[]): IntelligenceStream[] {
  const streams = new Set<IntelligenceStream>();
  for (const c of classes) streams.add(CLASS_TO_STREAM[c]);
  return INTELLIGENCE_STREAMS.filter((s) => streams.has(s));
}

// ─── Stream signal envelope ───────────────────────────────────────────────────

/**
 * A normalised stream signal bound to a canonical entity (Spec #59 §4).
 * Every stream output binds to a canonical entity; an unresolved binding is
 * itself meaningful (drives Inverse Discovery, §6.3 / §12).
 */
export interface StreamSignal {
  /** Stream this signal belongs to (derived from its connector class). */
  stream: IntelligenceStream;
  /** Connector class that produced the raw signal. */
  connector_class: ConnectorClass;
  /** Source connector identifier. */
  source_connector_id: string;
  /** Canonical entity this signal binds to; null when the entity is unknown. */
  boundEntityId: string | null;
  /** Type of the bound entity (asset/identity/etc.); null when unknown. */
  boundEntityType: string | null;
  /** ISO 8601 timestamp the signal was observed at source. */
  observed_at: string;
  /** Surface attribution where the signal applies (Spec #60). */
  surface_attribution: SurfaceAttribution;
  /** Signal-specific payload (opaque to the layer; consumed by correlations). */
  payload: Record<string, unknown>;
}

// ─── Estate Intelligence Picture (Spec #59 §5) ───────────────────────────────

/** Per-stream rollup within the EIP. */
export interface StreamSummary {
  stream: IntelligenceStream;
  label: string;
  signalCount: number;
  boundEntityCount: number;
  unboundSignalCount: number;
  /** Most recent observedAt across this stream's signals (freshness). */
  lastSignalAt: string | null;
}

/**
 * The Estate Intelligence Picture — the unified integration surface joining all
 * four streams into a single assessment of the estate at a moment in time
 * (Spec #59 §5). It is an architectural layer queried by surfaces, not a
 * dashboard. This shape is the queryable composition the surfaces consume.
 */
export interface EstateIntelligencePicture {
  /** Per-stream summaries (always all four, in canonical order — Assertion 9). */
  streams: StreamSummary[];
  /** Total signals across all streams. */
  totalSignals: number;
  /** Distinct canonical entities referenced across all streams. */
  distinctEntityCount: number;
  /** Signals that failed canonical entity binding (inverse-discovery candidates). */
  unboundSignalCount: number;
  /** Composition timestamp. */
  composedAt: string;
}

/**
 * Compose the Estate Intelligence Picture from normalised stream signals.
 *
 * Always emits all four stream summaries (even when a stream has zero signals)
 * so stream→surface lineage is never lost (Doctrinal Assertion 9). Pure
 * function — composes a view, stores nothing.
 */
export function composeEstateIntelligencePicture(
  signals: StreamSignal[],
  composedAt: string,
): EstateIntelligencePicture {
  const distinctEntities = new Set<string>();
  let unboundTotal = 0;

  const streams: StreamSummary[] = INTELLIGENCE_STREAMS.map((stream) => {
    const streamSignals = signals.filter((s) => s.stream === stream);
    const boundEntities = new Set<string>();
    let unbound = 0;
    let lastSignalAt: string | null = null;

    for (const sig of streamSignals) {
      if (sig.boundEntityId) {
        boundEntities.add(sig.boundEntityId);
        distinctEntities.add(sig.boundEntityId);
      } else {
        unbound++;
      }
      if (lastSignalAt === null || Date.parse(sig.observed_at) > Date.parse(lastSignalAt)) {
        lastSignalAt = sig.observed_at;
      }
    }

    unboundTotal += unbound;

    return {
      stream,
      label: STREAM_LABELS[stream],
      signalCount: streamSignals.length,
      boundEntityCount: boundEntities.size,
      unboundSignalCount: unbound,
      lastSignalAt,
    };
  });

  return {
    streams,
    totalSignals: signals.length,
    distinctEntityCount: distinctEntities.size,
    unboundSignalCount: unboundTotal,
    composedAt,
  };
}

// ─── Cross-Stream Correlations (Spec #59 §6) ─────────────────────────────────

// §6.1 Pre-Warned / Protected / Novel classification ──────────────────────────

/** Pre-Warned classification outcomes (Spec #59 §6.1, Spec #71). */
export type PreWarnedClassification = 'pre_warned' | 'protected' | 'novel';

/** Commander's prior posture knowledge of an entity at case-open time. */
export interface PriorPostureKnowledge {
  /** Was there active drift on the entity at case-open time? */
  hadActiveDrift: boolean;
  /** Was there a known control gap or coverage deficit at case-open time? */
  hadControlGap: boolean;
  /** Was the entity considered fully protected at case-open time? */
  wasFullyProtected: boolean;
  /** Is posture knowledge of this entity sufficient to classify yet? */
  postureKnown: boolean;
}

export interface PreWarnedResult {
  classification: PreWarnedClassification;
  rationale: string;
}

/**
 * §6.1 — Join External Attack Intelligence with Posture Intelligence.
 *
 * When a SOC case binds to a Commander entity, look up Commander's prior
 * knowledge of that entity:
 * - active drift OR known control gap at case-open → pre_warned
 * - fully protected at case-open → protected
 * - posture not known well enough to determine → novel
 */
export function classifyPreWarned(prior: PriorPostureKnowledge): PreWarnedResult {
  if (!prior.postureKnown) {
    return {
      classification: 'novel',
      rationale: 'Posture knowledge insufficient at case-open time. Classification: novel.',
    };
  }

  if (prior.hadActiveDrift || prior.hadControlGap) {
    const reasons: string[] = [];
    if (prior.hadActiveDrift) reasons.push('active drift');
    if (prior.hadControlGap) reasons.push('known control gap');
    return {
      classification: 'pre_warned',
      rationale: `Commander knew of ${reasons.join(' and ')} on the entity at case-open time. Attack landed on a known-weak entity. Classification: pre_warned.`,
    };
  }

  if (prior.wasFullyProtected) {
    return {
      classification: 'protected',
      rationale: 'Entity was considered fully protected at case-open time. Classification: protected.',
    };
  }

  return {
    classification: 'novel',
    rationale: 'No prior drift, control gap, or protected determination. Classification: novel.',
  };
}

// §6.2 Verdict disagreement detection ─────────────────────────────────────────

/** A single tool's verdict on an entity at a point in time (Spec #62 disposition). */
export interface ToolVerdict {
  source_connector_id: string;
  /** Coarse polarity used for disagreement detection (not full disposition). */
  polarity: 'block' | 'allow' | 'restrict' | 'monitor';
  entity_id: string;
  issuedAt: string;
}

export interface VerdictDisagreementResult {
  entity_id: string;
  disagreement: boolean;
  polarities: string[];
  contributingTools: string[];
  rationale: string;
}

/**
 * §6.2 — Join multiple Internal Behavioural Intelligence sources.
 *
 * When tools produce contradictory verdicts on the same entity, the
 * disagreement is information. Disagreement = a block/restrict polarity coexists
 * with an allow polarity on the same entity. Drives Policy Effectiveness cases.
 */
export function detectVerdictDisagreement(verdicts: ToolVerdict[]): VerdictDisagreementResult {
  const entityId = verdicts[0]?.entity_id ?? '';
  const polarities = [...new Set(verdicts.map((v) => v.polarity))];
  const tools = [...new Set(verdicts.map((v) => v.source_connector_id))];

  const hasNegative = verdicts.some((v) => v.polarity === 'block' || v.polarity === 'restrict');
  const hasAllow = verdicts.some((v) => v.polarity === 'allow');
  const disagreement = hasNegative && hasAllow;

  return {
    entity_id,
    disagreement,
    polarities,
    contributingTools: tools,
    rationale: disagreement
      ? `Verdict disagreement on ${entity_id}: contradictory polarities [${polarities.join(', ')}] across tools [${tools.join(', ')}]. Candidate Policy Effectiveness case.`
      : `No disagreement on ${entity_id}: polarities [${polarities.join(', ')}] are consistent.`,
  };
}

// §6.3 / §12 Inverse discovery ────────────────────────────────────────────────

/** Auto-classified root cause for an unknown-entity reference (Spec #72). */
export type InverseDiscoveryRootCause =
  | 'discovery_gap'
  | 'staleness'
  | 'shadow_it'
  | 'naming_mismatch';

export interface InverseDiscoveryFinding {
  triggered: boolean;
  referencingStream: IntelligenceStream;
  source_connector_id: string;
  rootCause: InverseDiscoveryRootCause | null;
  rationale: string;
}

/**
 * §6.3 / §12 — Join External Attack / Internal Behavioural / External Threat
 * with the canonical estate model. Posture Intelligence is generated internally,
 * so it never triggers inverse discovery (§12).
 *
 * When a stream signal references an entity Commander doesn't know about
 * (boundEntityId === null), the lookup failure is itself a finding: a Coverage
 * Blindspot case with auto-classified root cause.
 *
 * @param rootCauseHint optional pre-classified root cause from the caller's
 *        heuristics; defaults to discovery_gap when omitted.
 */
export function evaluateInverseDiscovery(
  signal: StreamSignal,
  rootCauseHint?: InverseDiscoveryRootCause,
): InverseDiscoveryFinding {
  if (signal.stream === 'posture') {
    return {
      triggered: false,
      referencingStream: signal.stream,
      source_connector_id: signal.source_connector_id,
      rootCause: null,
      rationale: 'Posture Intelligence is generated internally against canonical entities; inverse discovery does not apply (Spec #59 §12).',
    };
  }

  if (signal.boundEntityId !== null) {
    return {
      triggered: false,
      referencingStream: signal.stream,
      source_connector_id: signal.source_connector_id,
      rootCause: null,
      rationale: `Signal bound to known entity ${signal.boundEntityId}. No inverse discovery.`,
    };
  }

  const rootCause = rootCauseHint ?? 'discovery_gap';
  return {
    triggered: true,
    referencingStream: signal.stream,
    source_connector_id: signal.source_connector_id,
    rootCause,
    rationale: `${STREAM_LABELS[signal.stream]} referenced an entity unknown to the canonical model. Coverage Blindspot finding; root cause auto-classified: ${rootCause}.`,
  };
}

// §6.4 Behavioural anomaly detection ──────────────────────────────────────────

/** An identity's verdict-density profile compared against a peer baseline. */
export interface BehaviouralProfile {
  identity_id: string;
  /** This identity's verdict density (events per window). */
  verdictDensity: number;
  /** Peer-group baseline mean verdict density. */
  peerBaselineMean: number;
  /** Peer-group standard deviation. */
  peerBaselineStdDev: number;
}

export interface BehaviouralAnomalyResult {
  identity_id: string;
  anomalous: boolean;
  /** Standard deviations from the peer mean (signed). */
  zScore: number;
  rationale: string;
}

/**
 * §6.4 — Join Internal Behavioural Intelligence with the identity model.
 *
 * Compare an identity's verdict pattern against peer-group baseline. Divergence
 * beyond `sensitivity` standard deviations is anomalous, driving Verdict Pattern
 * cases routed to Internal Risk. Sensitivity is caller-supplied (configurable
 * per Spec #59 §13) — no hardcoded threshold.
 */
export function detectBehaviouralAnomaly(
  profile: BehaviouralProfile,
  sensitivity: number,
): BehaviouralAnomalyResult {
  if (profile.peerBaselineStdDev <= 0) {
    const diverges = profile.verdictDensity !== profile.peerBaselineMean;
    return {
      identity_id: profile.identity_id,
      anomalous: diverges,
      zScore: diverges ? Number.POSITIVE_INFINITY : 0,
      rationale: diverges
        ? `Peer baseline has zero variance; identity ${profile.identity_id} density ${profile.verdictDensity} differs from uniform peer baseline ${profile.peerBaselineMean}. Flagged.`
        : `Peer baseline has zero variance; identity ${profile.identity_id} matches the uniform peer baseline. Not anomalous.`,
    };
  }

  const zScore = (profile.verdictDensity - profile.peerBaselineMean) / profile.peerBaselineStdDev;
  const anomalous = Math.abs(zScore) >= sensitivity;

  return {
    identity_id: profile.identity_id,
    anomalous,
    zScore,
    rationale: anomalous
      ? `Identity ${profile.identity_id} verdict density diverges ${zScore.toFixed(2)}σ from peer baseline (sensitivity ${sensitivity}σ). Candidate Verdict Pattern case (Internal Risk).`
      : `Identity ${profile.identity_id} within ${sensitivity}σ of peer baseline (${zScore.toFixed(2)}σ). Not anomalous.`,
  };
}

// §6.5 Threat relevance scoring ───────────────────────────────────────────────

/** An external threat scored against the estate's posture. */
export interface ThreatRelevanceInput {
  threatId: string;
  /** Does the estate run the technology the threat targets? */
  affectsEstateTechnology: boolean;
  /** Number of distinct estate entities the threat could affect. */
  estateMatchCount: number;
  /** Is the threat actively exploited in the wild (e.g. on KEV)? */
  knownExploited: boolean;
  /** Does the estate carry active drift/exposure the threat could leverage? */
  hasRelevantExposure: boolean;
}

export interface ThreatRelevanceResult {
  threatId: string;
  /** Relevance score 0-100; estate-irrelevant threats score 0 and are filtered. */
  relevanceScore: number;
  relevant: boolean;
  rationale: string;
}

/**
 * §6.5 — Join External Threat Intelligence with Posture Intelligence.
 *
 * Score a threat against the estate's actual technology, exposure state, and
 * drift. Estate-irrelevant threats score 0 (filtered out without bothering
 * analysts); relevant threats elevate priority.
 *
 * Scoring (bounded 0-100, additive contributions):
 * - targets estate technology: +40 (gate — without it, score is 0)
 * - each matched estate entity: +5 (capped at +30)
 * - actively exploited (KEV): +20
 * - relevant existing exposure/drift: +10
 */
export function scoreThreatRelevance(input: ThreatRelevanceInput): ThreatRelevanceResult {
  if (!input.affectsEstateTechnology) {
    return {
      threatId: input.threatId,
      relevanceScore: 0,
      relevant: false,
      rationale: `Threat ${input.threatId} does not target estate technology. Filtered (score 0).`,
    };
  }

  let score = 40;
  score += Math.min(30, Math.max(0, input.estateMatchCount) * 5);
  if (input.knownExploited) score += 20;
  if (input.hasRelevantExposure) score += 10;
  score = Math.min(100, score);

  return {
    threatId: input.threatId,
    relevanceScore: score,
    relevant: true,
    rationale: `Threat ${input.threatId} relevant (score ${score}): targets estate tech${input.knownExploited ? ', actively exploited' : ''}${input.hasRelevantExposure ? ', matches existing exposure' : ''}, ${input.estateMatchCount} estate match(es).`,
  };
}

// §6.6 Silent defence aggregation ─────────────────────────────────────────────

/** A single defensive action taken by the security stack (no specific finding). */
export interface DefensiveAction {
  source_connector_id: string;
  action: 'block' | 'quarantine' | 'coach' | 'override' | 'allow';
  occurredAt: string;
}

export interface SilentDefenceAggregate {
  totalActions: number;
  byAction: Record<string, number>;
  contributingTools: string[];
  windowStart: string | null;
  windowEnd: string | null;
  rationale: string;
}

/**
 * §6.6 — Join all Internal Behavioural Intelligence sources WITHOUT correlation
 * to specific findings. The aggregate picture of what the security stack did —
 * every block, quarantine, coach, override. Surfaced via Silent Defence
 * Reporting (Spec #73); generates no cases.
 */
export function aggregateSilentDefence(actions: DefensiveAction[]): SilentDefenceAggregate {
  const byAction: Record<string, number> = {};
  const tools = new Set<string>();
  let windowStart: string | null = null;
  let windowEnd: string | null = null;

  for (const a of actions) {
    byAction[a.action] = (byAction[a.action] ?? 0) + 1;
    tools.add(a.source_connector_id);
    if (windowStart === null || Date.parse(a.occurredAt) < Date.parse(windowStart)) windowStart = a.occurredAt;
    if (windowEnd === null || Date.parse(a.occurredAt) > Date.parse(windowEnd)) windowEnd = a.occurredAt;
  }

  return {
    totalActions: actions.length,
    byAction,
    contributingTools: [...tools],
    windowStart,
    windowEnd,
    rationale: `Silent defence: ${actions.length} action(s) across ${tools.size} tool(s). Aggregate-only — no cases generated (Spec #73).`,
  };
}
