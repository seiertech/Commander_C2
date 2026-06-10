/**
 * Button — Universal Primitive Component
 * 
 * Enforces Tabler button variants and design system contract.
 * Square corners enforced globally via globals.css.
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost-secondary';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /** Button variant (maps to Tabler btn classes) */
  variant?: ButtonVariant;
  /** Button content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  'ghost-secondary': 'btn-ghost-secondary',
};

export function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const variantClass = variantClassMap[variant];
  
  return (
    <button 
      className={`btn ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
