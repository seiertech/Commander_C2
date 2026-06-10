/**
 * Card — Universal Primitive Component
 * 
 * Wraps Tabler card structure with typed slots for header, body, and actions.
 * Enforces design system contract: square corners, Tabler classes, no custom styling.
 */

import type { ReactNode } from 'react';

export interface CardProps {
  /** Card title (rendered in card-header) */
  title?: string;
  /** Optional actions (rendered in card-actions within header) */
  actions?: ReactNode;
  /** Card body content */
  children: ReactNode;
  /** Additional CSS classes for the card wrapper */
  className?: string;
}

export function Card({ title, actions, children, className = '' }: CardProps) {
  const hasHeader = title || actions;

  return (
    <div className={`card ${className}`.trim()}>
      {hasHeader && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}
