/**
 * Universal Primitive Components — Commander SDR
 * 
 * Pure presentation components that encode the design system contract.
 * These are the foundation for all future pages.
 * 
 * Rules:
 * - Typed props, zero business logic
 * - Live-ready: accept data via props
 * - Work in light and dark mode
 * - Follow design-system-contract.md
 */

export { Card } from './Card';
export type { CardProps } from './Card';

export { Button } from './Button';
export type { ButtonProps, ButtonVariant } from './Button';

export { Badge } from './Badge';
export type { BadgeProps, BadgeColor } from './Badge';

export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps, StatusValue } from './StatusBadge';

export { DataTable } from './DataTable';
export type { DataTableProps, DataTableColumn } from './DataTable';

export { PageSection } from './PageSection';
export type { PageSectionProps } from './PageSection';
