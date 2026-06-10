'use client';

import { useState } from 'react';
import type { Case } from '../../../../packages/contracts/src/entities/case';
import { useMode } from '@/context/mode-context';
import { componentTokens } from '../../../../packages/ui/src/tokens/components';
import { ExpandableCaseRow } from './expandable-case-row';

/**
 * CaseList — Commander SDR (Spec 06 My Cases)
 *
 * Scrollable list of expandable case rows.
 * Manages expand state internally — single or multi-expand mode.
 *
 * Source: Spec 06 Case Management, expandable list pattern.
 */

interface CaseListProps {
  cases: Case[];
  /** Allow multiple rows expanded simultaneously. Default: false (accordion). */
  multiExpand?: boolean;
}

export function CaseList({ cases, multiExpand = false }: CaseListProps) {
  const { mode, tokens } = useMode();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function handleToggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiExpand) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div
      style={{
        maxHeight: 'calc(100vh - 240px)',
        overflowY: 'auto',
        border: `1px solid ${tokens.border.subtle}`,
        background: tokens.surface.secondary,
      }}
    >
      {cases.map((c) => (
        <ExpandableCaseRow
          key={c.id}
          case={c}
          expanded={expandedIds.has(c.id)}
          onToggle={() => handleToggle(c.id)}
          tokens={tokens}
          mode={mode}
        />
      ))}
    </div>
  );
}
