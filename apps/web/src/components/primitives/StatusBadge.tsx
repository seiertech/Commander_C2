/**
 * StatusBadge — Universal Primitive Component
 * 
 * Maps status/severity values to vivid semantic colours per design system contract.
 * Enforces the colour rules: Critical/P0 red, High/P1 orange, etc.
 */

import type { ReactNode } from 'react';
import { Badge, type BadgeColor } from './Badge';

export type StatusValue = 
  | 'critical' 
  | 'high' 
  | 'medium' 
  | 'low'
  | 'p0'
  | 'p1'
  | 'p2'
  | 'p3'
  | 'breached'
  | 'at-risk'
  | 'healthy'
  | 'resolved'
  | 'warning'
  | 'info';

export interface StatusBadgeProps {
  /** Status or severity value (maps to semantic colour) */
  status: StatusValue;
  /** Optional custom label (defaults to status value) */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Maps status values to Tabler badge colours per design system contract §9.
 * 
 * Mapping:
 * - Critical / Breached / P0 → red
 * - High / Warning / At Risk / P1 → orange
 * - Healthy / Pass / Resolved → green
 * - Informational / Medium / P2 → azure
 * - Low / P3 → secondary (muted)
 */
const statusColorMap: Record<StatusValue, BadgeColor> = {
  critical: 'red',
  p0: 'red',
  breached: 'red',
  high: 'orange',
  p1: 'orange',
  'at-risk': 'orange',
  warning: 'orange',
  healthy: 'green',
  resolved: 'green',
  medium: 'azure',
  p2: 'azure',
  info: 'azure',
  low: 'secondary',
  p3: 'secondary',
};

/**
 * Default labels for status values (can be overridden via children prop)
 */
const statusLabelMap: Record<StatusValue, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  p0: 'P0',
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
  breached: 'Breached',
  'at-risk': 'At Risk',
  healthy: 'Healthy',
  resolved: 'Resolved',
  warning: 'Warning',
  info: 'Info',
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const color = statusColorMap[status];
  const label = children ?? statusLabelMap[status];
  
  return (
    <Badge color={color} className={className}>
      {label}
    </Badge>
  );
}
