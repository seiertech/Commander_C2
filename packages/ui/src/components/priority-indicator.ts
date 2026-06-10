/**
 * Priority Indicator — Commander SDR
 *
 * Renders priority level (P0–P4) with colour, text AND shape
 * per v1.3 Requirement 24 (colour accessibility).
 *
 * P0 visual rule: P0/zero-day uses emergency styling consistently
 * per Spec #41 §P0 Zero-Day UI Rule.
 *
 * Source: Spec #11a, Spec #41
 */

import { colors } from '../tokens/colors';

export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export interface PriorityIndicatorProps {
  priority: PriorityLevel;
}

const priorityConfig: Record<PriorityLevel, { color: string; label: string; shape: string }> = {
  P0: { color: colors.priority.p0, label: 'P0 — CRITICAL', shape: '◆' },
  P1: { color: colors.priority.p1, label: 'P1 — HIGH', shape: '▲' },
  P2: { color: colors.priority.p2, label: 'P2 — MEDIUM', shape: '●' },
  P3: { color: colors.priority.p3, label: 'P3 — STANDARD', shape: '■' },
  P4: { color: colors.priority.p4, label: 'P4 — LOW', shape: '○' },
};

/**
 * Returns priority indicator configuration.
 * Includes colour, text label, and shape — never colour alone.
 */
export function getPriorityConfig(priority: PriorityLevel) {
  return priorityConfig[priority];
}

/**
 * Returns CSS styles for a priority indicator.
 */
export function getPriorityStyles(props: PriorityIndicatorProps) {
  const config = priorityConfig[props.priority];
  const isEmergency = props.priority === 'P0';

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.6875rem',
    fontWeight: '700',
    borderRadius: '2px',
    backgroundColor: isEmergency ? colors.intensity.emergency.background : 'transparent',
    border: `1px solid ${config.color}`,
    color: config.color,
    shape: config.shape,
    label: config.label,
    // P0 gets glow effect per emergency command visual intensity
    boxShadow: isEmergency ? `0 0 8px ${config.color}40` : 'none',
  };
}
