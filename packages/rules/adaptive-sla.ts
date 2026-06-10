/**
 * Adaptive SLA Engine — Commander SDR CMEP-1.0
 *
 * Multi-factor SLA: baseSLA × surfaceModifier × domainModifiers.
 * Cap from sla-modifier strategy. Pure function.
 *
 * The adaptive SLA composes all active modifiers multiplicatively,
 * then clamps to the configured minimum floor.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** SLA modifier with multiplier and active state */
export interface ActiveSlaModifier {
  name: string;
  multiplier: number;
  active: boolean;
}

/** Adaptive SLA configuration from strategy */
export interface AdaptiveSlaConfig {
  /** Minimum SLA hours — hard floor */
  minimumSlaHours: number;
  /** Maximum multiplier cap (prevents excessive relaxation) */
  maxMultiplier: number;
}

/** Default adaptive SLA configuration */
export const DEFAULT_ADAPTIVE_SLA_CONFIG: AdaptiveSlaConfig = {
  minimumSlaHours: 1,
  maxMultiplier: 3.0,
};

/** Input for adaptive SLA computation */
export interface AdaptiveSlaInput {
  /** Base SLA hours from SLA strategy (per priority level) */
  baseSlaHours: number;
  /** Surface modifier (e.g. internet-facing vs internal) — multiplier */
  surfaceModifier: number;
  /** Domain-specific modifiers from the domain profile */
  domainModifiers: ActiveSlaModifier[];
}

/** Result of adaptive SLA computation */
export interface AdaptiveSlaResult {
  /** Final computed SLA hours */
  computedSlaHours: number;
  /** Original base SLA hours */
  baseSlaHours: number;
  /** Effective composite multiplier applied */
  effectiveMultiplier: number;
  /** Whether the minimum floor was applied */
  floorApplied: boolean;
  /** Whether the cap was applied */
  capApplied: boolean;
  /** Breakdown of active modifiers that contributed */
  activeModifiers: string[];
}

// ─── Core Function ───────────────────────────────────────────────────────────

/**
 * Compute adaptive SLA from base × surface × domain modifiers.
 *
 * @param input - Base SLA, surface modifier, and domain modifiers
 * @param config - SLA modifier configuration (floor, cap)
 * @returns AdaptiveSlaResult with final SLA hours and breakdown
 */
export function computeAdaptiveSla(
  input: AdaptiveSlaInput,
  config: AdaptiveSlaConfig = DEFAULT_ADAPTIVE_SLA_CONFIG,
): AdaptiveSlaResult {
  // Start with surface modifier
  let compositeMultiplier = input.surfaceModifier;
  const activeModifiers: string[] = [];

  if (input.surfaceModifier !== 1.0) {
    activeModifiers.push(`surface(×${input.surfaceModifier})`);
  }

  // Compose domain modifiers (only active ones)
  for (const modifier of input.domainModifiers) {
    if (modifier.active) {
      compositeMultiplier *= modifier.multiplier;
      activeModifiers.push(`${modifier.name}(×${modifier.multiplier})`);
    }
  }

  // Apply cap (prevent excessive relaxation)
  let capApplied = false;
  if (compositeMultiplier > config.maxMultiplier) {
    compositeMultiplier = config.maxMultiplier;
    capApplied = true;
  }

  // Prevent negative multipliers
  if (compositeMultiplier < 0) {
    compositeMultiplier = 0;
  }

  // Compute final SLA
  let computedSlaHours = input.baseSlaHours * compositeMultiplier;

  // Apply floor
  let floorApplied = false;
  if (computedSlaHours < config.minimumSlaHours) {
    computedSlaHours = config.minimumSlaHours;
    floorApplied = true;
  }

  return {
    computedSlaHours,
    baseSlaHours: input.baseSlaHours,
    effectiveMultiplier: compositeMultiplier,
    floorApplied,
    capApplied,
    activeModifiers,
  };
}
