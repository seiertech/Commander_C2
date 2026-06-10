'use client';

import type { ReactNode } from 'react';

/**
 * PageContainer — Commander C2 (DS-1.0 Tabler reskin)
 *
 * THE single source of truth for page-level spacing and nav alignment.
 *
 * Every operational page must render its content through this component so the
 * page-header breadcrumb and body align with the top-nav above (which is
 * positioned by Shell). Alignment is guaranteed by construction:
 *
 *   page-wrapper
 *     page-header > container-xl > row > col   ← breadcrumb (matches top-nav)
 *     page-body   > container-xl               ← body content
 *
 * The container-xl gutter here matches the header's container-xl gutter, and
 * Shell applies scrollbar-gutter:stable to both <header> and <main> so their
 * inner widths are identical. Result: nav, breadcrumb and content share one
 * left edge on every page, at every viewport width.
 *
 * Do NOT add per-page horizontal padding — let this component own it.
 */

interface PageContainerProps {
  /** Small uppercase eyebrow above the title, e.g. "Cases › Queue". */
  pretitle?: string;
  /** Page H1/H2 title. */
  title?: string;
  /** Optional right-aligned header content (status pill, actions, etc). */
  headerActions?: ReactNode;
  /** Page body content. Rendered inside page-body > container-xl. */
  children: ReactNode;
}

export function PageContainer({ pretitle, title, headerActions, children }: PageContainerProps) {
  const hasHeader = Boolean(pretitle || title || headerActions);

  return (
    <div className="page-wrapper">
      {hasHeader && (
        <div className="page-header d-print-none">
          <div className="container-xl">
            <div className="row g-2 align-items-center">
              <div className="col">
                {pretitle && <div className="page-pretitle">{pretitle}</div>}
                {title && <h2 className="page-title">{title}</h2>}
              </div>
              {headerActions && (
                <div className="col-auto ms-auto d-print-none">{headerActions}</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="page-body">
        <div className="container-xl">{children}</div>
      </div>
    </div>
  );
}
