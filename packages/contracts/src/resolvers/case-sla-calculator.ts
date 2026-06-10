/**
 * Case SLA Calculator — Commander SDR
 *
 * Consumes SLA Strategy from Spec 43 to determine per-case SLA windows.
 * NEVER hardcodes SLA hours. Returns 'unresolved' if strategy data is missing.
 *
 * Source: Spec #32 §Strategy Surfaces (SLA Strategy)
 * Doctrinal constraint: Strategy-layer consumption (constraint #9)
 */

import type { StrategyPolicy } from '../entities/strategy';
import type { Case } from '../entities/case';

export interface SlaResolution {
  status: 'resolved' | 'unresolved';
  responseHours: number | null;
  escalationCadenceMinutes: number | null;
  sourcePolicy: { id: string; version: string } | null;
  reason: string;
}

/**
 * Resolve SLA window for a case by reading from the SLA Strategy policy.
 * Maps case priority to the SLA profile defined in strategy configuration.
 */
export function resolveSla(
  caseRecord: Pick<Case, 'priority' | 'caseType'>,
  strategies: StrategyPolicy[],
): SlaResolution {
  const slaPolicy = strategies.find(
    (s) => s.surfaceType === 'sla' && s.status === 'active',
  );

  if (!slaPolicy) {
    return { status: 'unresolved', responseHours: null, escalationCadenceMinutes: null, sourcePolicy: null, reason: 'No active SLA strategy policy found' };
  }

  const config = slaPolicy.configuration as { profiles?: Array<{ name: string; responseHours: number; escalationCadenceMinutes: number }> };
  if (!config.profiles || config.profiles.length === 0) {
    return { status: 'unresolved', responseHours: null, escalationCadenceMinutes: null, sourcePolicy: { id: slaPolicy.id, version: slaPolicy.policyVersion }, reason: 'SLA strategy has no profiles configured' };
  }

  // Map priority to profile name pattern
  const priorityProfileMap: Record<string, string> = {
    P0: 'P0-Critical',
    P1: 'P1-High',
    P2: 'P2-Medium',
    P3: 'P3-Standard',
    P4: 'P3-Standard', // P4 falls back to P3 profile if no P4 exists
  };

  const profileName = priorityProfileMap[caseRecord.priority];
  const profile = config.profiles.find((p) => p.name === profileName);

  if (!profile) {
    return { status: 'unresolved', responseHours: null, escalationCadenceMinutes: null, sourcePolicy: { id: slaPolicy.id, version: slaPolicy.policyVersion }, reason: `No SLA profile found for priority ${caseRecord.priority} (expected profile: ${profileName})` };
  }

  return {
    status: 'resolved',
    responseHours: profile.responseHours,
    escalationCadenceMinutes: profile.escalationCadenceMinutes,
    sourcePolicy: { id: slaPolicy.id, version: slaPolicy.policyVersion },
    reason: `Resolved from SLA profile "${profile.name}"`,
  };
}
