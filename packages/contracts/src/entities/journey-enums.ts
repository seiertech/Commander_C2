/**
 * Journey Intelligence Enumerations — Commander C2
 *
 * Source: docs/00_authority/JOURNEY_INTELLIGENCE.md (JI-1.0) §5.1
 * Domain: D-47 Journey Intelligence
 * Build unit: Unit 51
 *
 * 6 canonical enumerations for the Journey Intelligence capability:
 * - OodaStage (4 values)
 * - DeliveryMode (5 values)
 * - JourneyStatus (5 values)
 * - JourneyOutcome (9 values)
 * - JourneyAnchorType (9 values)
 * - LifecycleCheckpoint (~35 values, grouped by OODA stage, max 50 per ARCH-JI-002)
 */

// ─── OODA Stage (JI-1.0 §5.1) ───────────────────────────────────────────────

/** The four OODA phases used for journey attribution. */
export const OODA_STAGES = ['observe', 'orient', 'decide', 'act'] as const;
export type OodaStage = typeof OODA_STAGES[number];

/** Human-readable labels for OODA stages. */
export const OODA_STAGE_LABELS: Record<OodaStage, string> = {
  observe: 'Observe',
  orient: 'Orient',
  decide: 'Decide',
  act: 'Act',
};

// ─── Delivery Mode (JI-1.0 §5.1) ────────────────────────────────────────────

/**
 * Five-level delivery mode taxonomy.
 * Progression: Manual → System Driven → AI Enhanced → Human Confirmed Automation → Autonomous.
 */
export const DELIVERY_MODES = [
  'manual',
  'system_driven',
  'ai_enhanced',
  'human_confirmed_automation',
  'autonomous',
] as const;
export type DeliveryMode = typeof DELIVERY_MODES[number];

/** Human-readable labels for delivery modes. */
export const DELIVERY_MODE_LABELS: Record<DeliveryMode, string> = {
  manual: 'Manual',
  system_driven: 'System Driven',
  ai_enhanced: 'AI Enhanced',
  human_confirmed_automation: 'Human Confirmed Automation',
  autonomous: 'Autonomous',
};

// ─── Journey Status (JI-1.0 §5.1) ───────────────────────────────────────────

/**
 * Journey lifecycle status.
 * Terminal statuses: completed, abandoned.
 * Non-terminal: active, stalled, reworking.
 */
export const JOURNEY_STATUSES = [
  'active',
  'completed',
  'stalled',
  'abandoned',
  'reworking',
] as const;
export type JourneyStatus = typeof JOURNEY_STATUSES[number];

/** Terminal journey statuses — once reached, journey is closed. */
export const TERMINAL_STATUSES: JourneyStatus[] = ['completed', 'abandoned'];

// ─── Journey Outcome (JI-1.0 §5.1) ──────────────────────────────────────────

/**
 * How a journey ended. Independent of status.
 * pending = journey still active, outcome not yet determined.
 * All other values are terminal — immutable once set (ARCH-JI-008).
 */
export const JOURNEY_OUTCOMES = [
  'successful',
  'partially_successful',
  'failed',
  'accepted_risk',
  'cancelled',
  'abandoned',
  'merged',
  'superseded',
  'pending',
] as const;
export type JourneyOutcome = typeof JOURNEY_OUTCOMES[number];

/** Terminal outcomes — once set, outcome is immutable. */
export const TERMINAL_OUTCOMES: JourneyOutcome[] = [
  'successful',
  'partially_successful',
  'failed',
  'accepted_risk',
  'cancelled',
  'abandoned',
  'merged',
  'superseded',
];

// ─── Journey Anchor Type (JI-1.0 §5.1) ──────────────────────────────────────

/**
 * What entity anchors a journey. Determines journeyId derivation pattern.
 * Pattern: journey-{anchorType}-{anchorId}
 */
export const JOURNEY_ANCHOR_TYPES = [
  'case',
  'finding',
  'ioc_match',
  'mission',
  'strategy_policy',
  'inbound_signal',
  'push_action',
  'war_room',
  'exposure_programme',
] as const;
export type JourneyAnchorType = typeof JOURNEY_ANCHOR_TYPES[number];

// ─── Lifecycle Checkpoint (JI-1.0 §5.1) ─────────────────────────────────────

/**
 * Lifecycle checkpoints grouped by OODA stage.
 * Bounded at 50 values maximum (ARCH-JI-002).
 * Current count: 34 values.
 */
export const LIFECYCLE_CHECKPOINTS = {
  observe: [
    'signal_received',
    'signal_normalised',
    'signal_enriched',
    'coverage_assessed',
    'connector_pulled',
  ],
  orient: [
    'context_established',
    'drift_detected',
    'risk_scored',
    'blast_computed',
    'classification_assigned',
    'anomaly_detected',
    'correlation_completed',
    'entity_resolved',
  ],
  decide: [
    'case_created',
    'case_bound',
    'case_routed',
    'case_prioritised',
    'action_decomposed',
    'approval_requested',
    'approval_granted',
    'approval_denied',
    'escalation_triggered',
  ],
  act: [
    'action_started',
    'action_dispatched',
    'action_accepted',
    'action_executed',
    'action_failed',
    'action_retried',
    'human_rescue_initiated',
    'recovery_completed',
    'validation_started',
    'validation_passed',
    'validation_failed',
    'journey_completed',
    'journey_abandoned',
    'journey_reopened',
  ],
} as const;

/** Flat array of all lifecycle checkpoints. */
export const ALL_LIFECYCLE_CHECKPOINTS = [
  ...LIFECYCLE_CHECKPOINTS.observe,
  ...LIFECYCLE_CHECKPOINTS.orient,
  ...LIFECYCLE_CHECKPOINTS.decide,
  ...LIFECYCLE_CHECKPOINTS.act,
] as const;

export type LifecycleCheckpoint = typeof ALL_LIFECYCLE_CHECKPOINTS[number];

/** Total checkpoint count (for ARCH-JI-002 conformance verification). */
export const LIFECYCLE_CHECKPOINT_COUNT = ALL_LIFECYCLE_CHECKPOINTS.length;

/**
 * Lookup which OODA stage a checkpoint belongs to.
 * Used by the Lifecycle Checkpoint Resolver engine.
 */
export function getStageForCheckpoint(checkpoint: LifecycleCheckpoint): OodaStage {
  if ((LIFECYCLE_CHECKPOINTS.observe as readonly string[]).includes(checkpoint)) return 'observe';
  if ((LIFECYCLE_CHECKPOINTS.orient as readonly string[]).includes(checkpoint)) return 'orient';
  if ((LIFECYCLE_CHECKPOINTS.decide as readonly string[]).includes(checkpoint)) return 'decide';
  return 'act';
}
