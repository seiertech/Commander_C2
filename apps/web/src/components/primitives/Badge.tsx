/**
 * Badge — Universal Primitive Component
 * 
 * Basic badge wrapper with Tabler classes.
 * For semantic status/severity badges, use StatusBadge instead.
 */

import type { ReactNode } from 'react';

export type BadgeColor = 
  | 'red' 
  | 'orange' 
  | 'yellow' 
  | 'green' 
  | 'azure' 
  | 'blue' 
  | 'purple'
  | 'secondary'
  | 'secondary-lt';

export interface BadgeProps {
  /** Badge colour (maps to Tabler bg-* classes) */
  color?: BadgeColor;
  /** Badge content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function Badge({ color = 'secondary', children, className = '' }: BadgeProps) {
  const colorClass = `bg-${color}`;
  
  return (
    <span className={`badge ${colorClass} ${className}`.trim()}>
      {children}
    </span>
  );
}
