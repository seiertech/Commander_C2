/**
 * DataTable — Universal Primitive Component
 * 
 * Typed table wrapper with Tabler classes (table table-vcenter).
 * Handles empty state, loading state, and optional hover effect.
 */

import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  /** Column header label */
  header: string;
  /** Accessor function to get cell value from row data */
  accessor: (row: T) => ReactNode;
  /** Optional CSS class for header th */
  headerClassName?: string;
  /** Optional CSS class for body td */
  cellClassName?: string;
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data */
  data: T[];
  /** Optional: extract unique key from row (defaults to index) */
  getRowKey?: (row: T, index: number) => string | number;
  /** Optional: enable hover effect on rows */
  hover?: boolean;
  /** Optional: render inside a card (adds card-table class) */
  inCard?: boolean;
  /** Optional: loading state */
  loading?: boolean;
  /** Optional: empty state message */
  emptyMessage?: string;
  /** Additional CSS classes for table */
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey = (_, index) => index,
  hover = false,
  inCard = false,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps<T>) {
  const tableClasses = [
    'table',
    'table-vcenter',
    hover && 'table-hover',
    inCard && 'card-table',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (loading) {
    return (
      <div className="text-center text-muted py-4">
        <div className="spinner-border spinner-border-sm me-2" role="status" />
        Loading...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-muted py-4">
        {emptyMessage}
      </div>
    );
  }

  return (
    <table className={tableClasses}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index} className={column.headerClassName}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={getRowKey(row, rowIndex)}>
            {columns.map((column, colIndex) => (
              <td key={colIndex} className={column.cellClassName}>
                {column.accessor(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
