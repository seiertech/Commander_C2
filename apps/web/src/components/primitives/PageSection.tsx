/**
 * PageSection — Universal Primitive Component
 * 
 * Helper for card grid layouts using Tabler's row row-deck row-cards convention.
 * Enforces equal-height card rows per design system contract.
 */

import type { ReactNode } from 'react';

export interface PageSectionProps {
  /** Section content (typically cards in columns) */
  children: ReactNode;
  /** Optional section label (rendered as subheader) */
  label?: string;
  /** Additional CSS classes for the row */
  className?: string;
}

export function PageSection({ children, label, className = '' }: PageSectionProps) {
  return (
    <>
      {label && <div className="subheader">{label}</div>}
      <div className={`row row-deck row-cards ${className}`.trim()}>
        {children}
      </div>
    </>
  );
}
