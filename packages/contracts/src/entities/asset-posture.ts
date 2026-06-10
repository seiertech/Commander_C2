/**
 * Asset Classification & Security Posture — Commander C2 Thesis Layer 5 (§9)
 *
 * Governed by: NIST CSF 2.0 (ID.AM, PR, DE, RS, RC, GV), CTEM (exposure_type)
 * Purpose: Represent business significance separately from technical security state.
 * Per-asset posture with NIST CSF function breakdown.
 *
 * Entities: Asset_Classification, Asset_Security_Posture, Posture_Dimension
 * Naming: snake_case (thesis-literal)
 */

// ─── CTEM Exposure Type ──────────────────────────────────────────────────────

export const EXPOSURE_TYPES = ['external', 'internal', 'hybrid'] as const;
export type ExposureType = typeof EXPOSURE_TYPES[number];

// ─── Mission Impact ──────────────────────────────────────────────────────────

export const MISSION_IMPACTS = ['critical', 'high', 'medium', 'low'] as const;
export type MissionImpact = typeof MISSION_IMPACTS[number];

// ─── Asset_Classification Entity ─────────────────────────────────────────────

export interface AssetClassificationThesis {
  asset_classification_id: string;
  asset_id: string;
  business_service: string;
  business_capability: string;
  criticality: number;
  data_classification: string;
  exposure_type: ExposureType;
  regulatory_scope: string | null;
  mission_impact: MissionImpact;
  risk_weighting: number;
  standard_marker: string;
}

// ─── Posture Status ──────────────────────────────────────────────────────────

export const POSTURE_STATUSES = ['healthy', 'degraded', 'critical', 'unknown'] as const;
export type PostureStatus = typeof POSTURE_STATUSES[number];

export const PATCH_STATUSES = ['current', 'behind', 'critical_behind', 'unknown'] as const;
export type PatchStatus = typeof PATCH_STATUSES[number];

export const VULNERABILITY_EXPOSURES = ['none_known', 'low', 'medium', 'high', 'critical'] as const;
export type VulnerabilityExposure = typeof VULNERABILITY_EXPOSURES[number];

export const COVERAGE_LEVELS = ['full', 'partial', 'minimal', 'none'] as const;
export type CoverageLevel = typeof COVERAGE_LEVELS[number];

export const READINESS_LEVELS = ['ready', 'partial', 'not_ready'] as const;
export type ReadinessLevel = typeof READINESS_LEVELS[number];

export const GOVERNANCE_STATUSES = ['governed', 'partial', 'ungoverned'] as const;
export type GovernanceStatus = typeof GOVERNANCE_STATUSES[number];

// ─── Asset_Security_Posture Entity ───────────────────────────────────────────

export interface AssetSecurityPosture {
  posture_id: string;
  asset_id: string;
  posture_status: PostureStatus;
  posture_score: number;
  assessment_time: string;
  patch_status: PatchStatus;
  vulnerability_exposure: VulnerabilityExposure;
  monitoring_coverage: CoverageLevel;
  response_readiness: ReadinessLevel;
  recovery_readiness: ReadinessLevel;
  governance_status: GovernanceStatus;
  standard_marker: string;
}

// ─── NIST Function ───────────────────────────────────────────────────────────

export const NIST_FUNCTIONS = ['GV', 'ID', 'PR', 'DE', 'RS', 'RC'] as const;
export type NistFunction = typeof NIST_FUNCTIONS[number];

export const DIMENSION_STATES = ['optimal', 'adequate', 'degraded', 'failed', 'unknown'] as const;
export type DimensionState = typeof DIMENSION_STATES[number];

// ─── Posture_Dimension Entity ────────────────────────────────────────────────

export interface PostureDimension {
  posture_dimension_id: string;
  posture_id: string;
  nist_function: NistFunction;
  nist_category: string;
  dimension_name: string;
  dimension_state: DimensionState;
  dimension_score: number;
  evidence_source: string;
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface AssetClassificationThesisValidation { valid: boolean; errors: string[]; }
export interface AssetSecurityPostureValidation { valid: boolean; errors: string[]; }
export interface PostureDimensionValidation { valid: boolean; errors: string[]; }

export function validate_asset_classification_thesis(c: AssetClassificationThesis): AssetClassificationThesisValidation {
  const errors: string[] = [];
  if (!c.asset_classification_id) errors.push('asset_classification_id: required');
  if (!c.asset_id) errors.push('asset_id: required');
  if (!c.business_service) errors.push('business_service: required');
  if (!c.business_capability) errors.push('business_capability: required');
  if (typeof c.criticality !== 'number' || c.criticality < 1 || c.criticality > 5) errors.push('criticality: must be 1-5');
  if (!c.data_classification) errors.push('data_classification: required');
  if (!(EXPOSURE_TYPES as readonly string[]).includes(c.exposure_type)) errors.push('exposure_type: must be external | internal | hybrid');
  if (!(MISSION_IMPACTS as readonly string[]).includes(c.mission_impact)) errors.push('mission_impact: must be critical | high | medium | low');
  if (typeof c.risk_weighting !== 'number' || c.risk_weighting < 0 || c.risk_weighting > 10) errors.push('risk_weighting: must be 0-10');
  if (!c.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_asset_security_posture(p: AssetSecurityPosture): AssetSecurityPostureValidation {
  const errors: string[] = [];
  if (!p.posture_id) errors.push('posture_id: required');
  if (!p.asset_id) errors.push('asset_id: required');
  if (!(POSTURE_STATUSES as readonly string[]).includes(p.posture_status)) errors.push('posture_status: invalid');
  if (typeof p.posture_score !== 'number' || p.posture_score < 0 || p.posture_score > 100) errors.push('posture_score: must be 0-100');
  if (!p.assessment_time) errors.push('assessment_time: required');
  if (!(PATCH_STATUSES as readonly string[]).includes(p.patch_status)) errors.push('patch_status: invalid');
  if (!(VULNERABILITY_EXPOSURES as readonly string[]).includes(p.vulnerability_exposure)) errors.push('vulnerability_exposure: invalid');
  if (!(COVERAGE_LEVELS as readonly string[]).includes(p.monitoring_coverage)) errors.push('monitoring_coverage: invalid');
  if (!(READINESS_LEVELS as readonly string[]).includes(p.response_readiness)) errors.push('response_readiness: invalid');
  if (!(READINESS_LEVELS as readonly string[]).includes(p.recovery_readiness)) errors.push('recovery_readiness: invalid');
  if (!(GOVERNANCE_STATUSES as readonly string[]).includes(p.governance_status)) errors.push('governance_status: invalid');
  if (!p.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_posture_dimension(d: PostureDimension): PostureDimensionValidation {
  const errors: string[] = [];
  if (!d.posture_dimension_id) errors.push('posture_dimension_id: required');
  if (!d.posture_id) errors.push('posture_id: required');
  if (!(NIST_FUNCTIONS as readonly string[]).includes(d.nist_function)) errors.push('nist_function: must be GV | ID | PR | DE | RS | RC');
  if (!d.nist_category) errors.push('nist_category: required');
  if (!d.dimension_name) errors.push('dimension_name: required');
  if (!(DIMENSION_STATES as readonly string[]).includes(d.dimension_state)) errors.push('dimension_state: invalid');
  if (typeof d.dimension_score !== 'number' || d.dimension_score < 0 || d.dimension_score > 100) errors.push('dimension_score: must be 0-100');
  if (!d.evidence_source) errors.push('evidence_source: required');
  if (!d.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}
