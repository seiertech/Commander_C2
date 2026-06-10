/**
 * Status Badge — Commander SDR
 *
 * Renders build status (LIVE, BUILD, SCAFFOLD, STUB, PLANNED)
 * with colour AND text label per v1.3 Requirement 24 (colour accessibility).
 *
 * Source: Spec #11a §4 Component Catalogue
 * Accessibility: Never relies on colour alone.
 */

import { colors } from '../tokens/colors';
import type { BuildStatus } from './types';

export interface StatusBadgeProps {
  status: BuildStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<BuildStatus, { color: string; label: string }> = {
  LIVE: { color: colors.status.live, label: 'LIVE' },
  BUILD: { color: colors.status.build, label: 'BUILD' },
  SCAFFOLD: { color: colors.status.scaffold, label: 'SCAFFOLD' },
  STUB: { color: colors.status.stub, label: 'STUB' },
  PLANNED: { color: colors.status.scaffold, label: 'PLANNED' },
};

/**
 * Returns CSS styles for a status badge.
 * Framework-agnostic — can be used with any rendering approach.
 */
export function getStatusBadgeStyles(props: StatusBadgeProps) {
  const config = statusConfig[props.status];
  const size = props.size ?? 'sm';

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: size === 'sm' ? '0.125rem 0.375rem' : '0.25rem 0.5rem',
    fontSize: size === 'sm' ? '0.625rem' : '0.6875rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    borderRadius: '2px',
    backgroundColor: config.color,
    color: '#ffffff',
    label: config.label,
  };
}
