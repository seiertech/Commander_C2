/**
 * Compliance Enrichment-Evidence Mapper
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 19.1, 19.2, 19.3
 *
 * Pure mapper exposing CVE/KEV/IOC results as enrichment evidence for
 * ControlEvaluation via the existing evidence-binding model.
 * NEVER produces compliance state directly — compliance state is produced
 * only through ControlRequirement + ControlEvaluation evaluation (Req 19.3).
 */

/**
 * Intelligence enrichment evidence that can be consumed by the
 * ControlEvaluation evidence-binding model.
 */
export interface IntelligenceEnrichmentEvidence {
  /** Type of intelligence enrichment */
  enrichmentType: 'cve_presence' | 'kev_status' | 'ioc_match' | 'epss_score';
  /** Reference to the platform intelligence record */
  platformRecordId: string;
  /** Reference to the tenant evaluation (if applicable) */
  evaluationId?: string;
  /** Human-readable summary */
  summary: string;
  /** Timestamp when evidence was produced */
  producedAt: string;
  /** Enrichment metadata */
  metadata: Record<string, unknown>;
}

/**
 * Map a CVE/KEV result to enrichment evidence.
 * Does NOT create compliance state (Req 19.1).
 */
export function mapCveToEnrichmentEvidence(params: {
  cveId: string;
  platformRecordId: string;
  cisaKevStatus: boolean;
  cvssScore: number;
  producedAt: string;
}): IntelligenceEnrichmentEvidence {
  return {
    enrichmentType: params.cisaKevStatus ? 'kev_status' : 'cve_presence',
    platformRecordId: params.platformRecordId,
    summary: `CVE ${params.cveId} (CVSS ${params.cvssScore})${params.cisaKevStatus ? ' — CISA KEV listed' : ''}`,
    producedAt: params.producedAt,
    metadata: {
      cveId: params.cveId,
      cisaKevStatus: params.cisaKevStatus,
      cvssScore: params.cvssScore,
    },
  };
}

/**
 * Map an IOC match to enrichment evidence.
 * Does NOT create compliance state (Req 19.1).
 */
export function mapIocMatchToEnrichmentEvidence(params: {
  iocId: string;
  platformRecordId: string;
  evaluationId: string;
  matchConfidence: number;
  producedAt: string;
}): IntelligenceEnrichmentEvidence {
  return {
    enrichmentType: 'ioc_match',
    platformRecordId: params.platformRecordId,
    evaluationId: params.evaluationId,
    summary: `IOC match (confidence ${params.matchConfidence}%)`,
    producedAt: params.producedAt,
    metadata: {
      iocId: params.iocId,
      matchConfidence: params.matchConfidence,
    },
  };
}

/**
 * Verify that enrichment evidence NEVER directly produces compliance state.
 * This is the Phase 1 boundary assertion (Req 19.1, 19.3).
 */
export function assertNeverCreatesComplianceState(evidence: IntelligenceEnrichmentEvidence): boolean {
  // Enrichment evidence has no complianceVerdict, no compliance state field.
  // It's always just enrichment data for the ControlEvaluation to consume.
  return !('complianceVerdict' in evidence) && !('complianceState' in evidence);
}
