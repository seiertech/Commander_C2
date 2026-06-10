/**
 * Case Type Assignment Engine — Commander C2
 *
 * Source: Spec #08 Case Management, Spec #29 Universal Risk Object and Case Binding
 * Unit 7: Case type is assigned based on risk object type.
 *
 * All 12 canonical case types are reachable from the 8 risk object types.
 * Some risk object types map to multiple case types based on context.
 *
 * Mapping:
 *   coverage_blindspot → coverage | inverse-discovery-coverage-blindspot
 *   ooda_phase_degradation → ooda-tempo-degradation
 *   vulnerability_drift → vulnerability | drift
 *   configuration_drift → drift
 *   exposure_drift → exposure
 *   control_gap → tool-health | policy-effectiveness
 *   identity_risk → identity
 *   policy_gap → policy-effectiveness
 *
 * Additional case types reachable via signal context:
 *   threat-intelligence-estate-match → from TI signal correlation
 *   external-attack-correlation → from external attack signal
 *   verdict-pattern → from verdict pattern detection
 */

import type { RiskObjectType } from '../entities/risk-object';
import type { CaseType } from '../entities/case';

/** Context hints for disambiguating risk object → case type mapping */
export type AssignmentContext =
  | 'default'
  | 'inverse_discovery'
  | 'drift_primary'
  | 'vulnerability_primary'
  | 'tool_health'
  | 'policy_effectiveness'
  | 'threat_intelligence'
  | 'external_attack'
  | 'verdict_pattern';

/** Request to assign a case type */
export interface CaseTypeAssignmentRequest {
  /** Risk object type driving the case */
  riskObjectType: RiskObjectType;
  /** Context hint for disambiguation */
  context?: AssignmentContext;
}

/** Result of case type assignment */
export interface CaseTypeAssignmentResult {
  /** Whether assignment succeeded */
  success: boolean;
  /** The assigned case type */
  case_type: CaseType | null;
  /** Error message if failed */
  error: string | null;
}

/**
 * Primary mapping from risk object type to default case type.
 * Used when no context disambiguation is needed.
 */
export const DEFAULT_RISK_TO_CASE_MAP: Record<RiskObjectType, CaseType> = {
  'coverage_blindspot': 'coverage',
  'ooda_phase_degradation': 'ooda-tempo-degradation',
  'vulnerability_drift': 'vulnerability',
  'configuration_drift': 'drift',
  'exposure_drift': 'exposure',
  'control_gap': 'tool-health',
  'identity_risk': 'identity',
  'policy_gap': 'policy-effectiveness',
};

/**
 * Context-aware mapping overrides.
 * When a specific context is provided, it overrides the default mapping.
 */
const CONTEXT_OVERRIDES: Partial<Record<RiskObjectType, Partial<Record<AssignmentContext, CaseType>>>> = {
  'coverage_blindspot': {
    'inverse_discovery': 'inverse-discovery-coverage-blindspot',
  },
  'vulnerability_drift': {
    'drift_primary': 'drift',
    'vulnerability_primary': 'vulnerability',
  },
  'control_gap': {
    'tool_health': 'tool-health',
    'policy_effectiveness': 'policy-effectiveness',
  },
};

/**
 * Signal-context case types that are not directly mapped from risk objects
 * but are reachable via signal correlation context.
 */
export const SIGNAL_CONTEXT_CASE_TYPES: Record<string, CaseType> = {
  'threat_intelligence': 'threat-intelligence-estate-match',
  'external_attack': 'external-attack-correlation',
  'verdict_pattern': 'verdict-pattern',
};

/**
 * Assign a case type based on risk object type and optional context.
 *
 * Logic:
 * 1. If context is a signal-context type, return the signal-context case type
 * 2. If context override exists for the risk object type, use it
 * 3. Otherwise, use the default mapping
 */
export function assignCaseType(request: CaseTypeAssignmentRequest): CaseTypeAssignmentResult {
  const { riskObjectType, context = 'default' } = request;

  // Validate risk object type
  if (!DEFAULT_RISK_TO_CASE_MAP[riskObjectType]) {
    return {
      success: false,
      case_type: null,
      error: `Unknown risk object type '${riskObjectType}'.`,
    };
  }

  // 1. Check signal-context case types
  if (context !== 'default' && SIGNAL_CONTEXT_CASE_TYPES[context]) {
    return {
      success: true,
      case_type: SIGNAL_CONTEXT_CASE_TYPES[context],
      error: null,
    };
  }

  // 2. Check context overrides
  if (context !== 'default') {
    const overrides = CONTEXT_OVERRIDES[riskObjectType];
    if (overrides && overrides[context]) {
      return {
        success: true,
        case_type: overrides[context]!,
        error: null,
      };
    }
  }

  // 3. Default mapping
  return {
    success: true,
    case_type: DEFAULT_RISK_TO_CASE_MAP[riskObjectType],
    error: null,
  };
}

/**
 * Get all case types reachable from a given risk object type (across all contexts).
 */
export function getReachableCaseTypes(riskObjectType: RiskObjectType): CaseType[] {
  const types = new Set<CaseType>();

  // Default mapping
  const defaultType = DEFAULT_RISK_TO_CASE_MAP[riskObjectType];
  if (defaultType) types.add(defaultType);

  // Context overrides
  const overrides = CONTEXT_OVERRIDES[riskObjectType];
  if (overrides) {
    for (const caseType of Object.values(overrides)) {
      if (caseType) types.add(caseType);
    }
  }

  return Array.from(types);
}
