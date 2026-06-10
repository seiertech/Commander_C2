/**
 * Identity Intelligence Engine — Commander C2 (Unit 25)
 * Source: Spec #59 Intelligence Layer Architecture (Internal Behavioural stream)
 * Processes identity signals into intelligence — anomalies, risk scoring.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IdentitySignal {
  identityRef: string;
  signalType: string;
  timestamp: string;
  context: Record<string, string>;
}

export interface IdentityRiskScore {
  identityRef: string;
  riskScore: number;
  confidence: number;
  factors: string[];
}

export interface AnomalyDetection {
  detected: boolean;
  anomalyType: string | null;
  severity: number;
  description: string;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Assess identity risk from a set of signals.
 * High-risk signal types (privilege_escalation, impossible_travel, credential_exposure)
 * contribute more heavily to the risk score.
 */
export function assessIdentityRisk(signals: IdentitySignal[]): IdentityRiskScore {
  if (signals.length === 0) {
    return { identityRef: '', riskScore: 0, confidence: 0, factors: [] };
  }

  const identityRef = signals[0].identityRef;
  const highRiskSignals = new Set([
    'privilege_escalation',
    'impossible_travel',
    'credential_exposure',
  ]);

  const factors = signals.map((s) => s.signalType);
  const highCount = signals.filter((s) => highRiskSignals.has(s.signalType)).length;
  const riskScore = Math.min(100, highCount * 30 + signals.length * 10);
  const confidence = Math.min(100, 50 + signals.length * 10);

  return { identityRef, riskScore, confidence, factors };
}

/**
 * Detect anomalies by comparing observed behaviour against an established baseline.
 */
export function detectAnomalies(baseline: string, observed: string): AnomalyDetection {
  if (baseline === observed) {
    return {
      detected: false,
      anomalyType: null,
      severity: 0,
      description: 'Behaviour within baseline.',
    };
  }

  return {
    detected: true,
    anomalyType: 'behavioural_deviation',
    severity: 3,
    description: `Observed behaviour "${observed}" deviates from baseline "${baseline}".`,
  };
}

/**
 * Compute a baseline behaviour string from historical patterns.
 * Uses the median pattern (by sorted order) as the representative baseline.
 */
export function computeBaselineBehaviour(historicalPatterns: string[]): string {
  if (historicalPatterns.length === 0) return 'no_baseline';
  return (
    historicalPatterns.sort()[Math.floor(historicalPatterns.length / 2)] ?? 'median_pattern'
  );
}
