'use client';

import type { Case } from '../../../../packages/contracts/src/entities/case';
import type { WorkspaceMode } from '../../../../packages/ui/src/tokens/semantic';
import { componentTokens } from '../../../../packages/ui/src/tokens/components';
import { primitiveFonts, primitiveTypeScale, primitiveLetterSpacing, primitiveSignal, primitiveSpacing, primitiveRadii, primitiveMotion } from '../../../../packages/ui/src/tokens/primitives';
import { primitivePriority } from '../../../../packages/ui/src/tokens/primitives';
import { resolveAllStrategies } from '../../../../packages/contracts/src/resolvers/case-strategy-resolver';
import { thesisStrategies } from '../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * ExpandableCaseRow — Commander C2 (Spec 06 My Cases)
 *
 * Expandable row for case list views. Collapsed shows single-line summary;
 * expanded shows routing rationale, metadata grid, and link to full detail.
 *
 * Doctrinal constraints:
 * - No manual case creation/edit/closure buttons (Assertion 1)
 * - Priority shown via shape + colour + label (never colour alone) (§14.1)
 * - Surface attribution visible on every row (Assertion 10)
 * - Keyboard accessible: Enter/Space toggles, Esc collapses
 * - ARIA: aria-expanded, aria-controls
 */

function relativeAge(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface ExpandableCaseRowProps {
  case: Case;
  expanded: boolean;
  onToggle: () => void;
  tokens: ReturnType<typeof import('../../../../packages/ui/src/tokens/semantic').getSemanticTokens>;
  mode: WorkspaceMode;
}

export function ExpandableCaseRow({ case: caseRecord, expanded, onToggle, tokens, mode }: ExpandableCaseRowProps) {
  const p = primitivePriority[caseRecord.priority.toLowerCase() as keyof typeof primitivePriority];
  const strategy = resolveAllStrategies(caseRecord, thesisStrategies);
  const slaHours = strategy.sla.status === 'resolved' ? strategy.sla.response_hours : caseRecord.sla.target_resolution_hours;
  const expandRegionId = `case-expand-${caseRecord.id}`;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    } else if (e.key === 'Escape' && expanded) {
      e.preventDefault();
      onToggle();
    }
  }

  return (
    <div style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
      {/* Collapsed row — single line summary */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={expandRegionId}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: primitiveSpacing[3],
          padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`,
          cursor: 'pointer',
          background: expanded ? tokens.surface.elevated : 'transparent',
          transition: `background ${primitiveMotion.standard} ${primitiveMotion.easeDefault}`,
          minHeight: componentTokens.tableRowHeight,
        }}
      >
        {/* Priority indicator: shape + colour + label */}
        <span style={{ color: p.color, fontWeight: 700, fontSize: primitiveTypeScale.body, minWidth: '48px', whiteSpace: 'nowrap' }}>
          {p.shape} {p.label}
        </span>

        {/* Case ref */}
        <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, fontFamily: primitiveFonts.mono, minWidth: '120px', whiteSpace: 'nowrap' }}>
          {caseRecord.case_ref}
        </span>

        {/* Title (truncated) */}
        <span style={{ flex: 1, fontSize: primitiveTypeScale.body, color: tokens.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {caseRecord.title}
        </span>

        {/* Owner */}
        <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary, minWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {caseRecord.owner}
        </span>

        {/* Team */}
        <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, minWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {caseRecord.team}
        </span>

        {/* SLA state */}
        <span style={{ fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono, color: caseRecord.sla.breached ? primitiveSignal.critical : tokens.text.secondary, minWidth: '60px', whiteSpace: 'nowrap' }}>
          {slaHours}h{caseRecord.sla.breached ? ' ⚠' : ''}
        </span>

        {/* Age (relative) */}
        <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, fontFamily: primitiveFonts.mono, minWidth: '60px', whiteSpace: 'nowrap' }}>
          {relativeAge(caseRecord.created_at)}
        </span>

        {/* Surface attribution chip */}
        <span style={{
          fontSize: primitiveTypeScale.micro,
          padding: '2px 6px',
          border: caseRecord.surface_attribution === 'external_attack_surface' ? `1px solid ${primitiveSignal.info}` : `1px solid ${tokens.border.default}`,
          color: caseRecord.surface_attribution === 'external_attack_surface' ? primitiveSignal.info : tokens.text.muted,
          whiteSpace: 'nowrap',
        }}>
          {caseRecord.surface_attribution === 'external_attack_surface' ? 'External' : 'Internal'}
        </span>

        {/* Status badge */}
        <span style={{
          fontSize: primitiveTypeScale.micro,
          color: tokens.text.muted,
          textTransform: 'uppercase',
          letterSpacing: primitiveLetterSpacing.eyebrow,
          minWidth: '80px',
          whiteSpace: 'nowrap',
        }}>
          {caseRecord.status}
        </span>
      </div>

      {/* Expanded region — in-place below collapsed */}
      <div
        id={expandRegionId}
        role="region"
        aria-labelledby={expandRegionId}
        style={{
          overflow: 'hidden',
          maxHeight: expanded ? '300px' : '0px',
          opacity: expanded ? 1 : 0,
          transition: `max-height ${primitiveMotion.standard} ${primitiveMotion.easeDefault}, opacity ${primitiveMotion.standard} ${primitiveMotion.easeDefault}`,
          background: tokens.surface.elevated,
          padding: expanded ? `${primitiveSpacing[3]} ${primitiveSpacing[5]}` : `0 ${primitiveSpacing[5]}`,
        }}
      >
        {/* Routing rationale */}
        <div style={{ marginBottom: primitiveSpacing[3] }}>
          <span style={{
            fontSize: primitiveTypeScale.micro,
            fontWeight: 600,
            color: tokens.text.muted,
            textTransform: 'uppercase',
            letterSpacing: primitiveLetterSpacing.eyebrow,
            display: 'block',
            marginBottom: primitiveSpacing[1],
          }}>
            Routing Rationale
          </span>
          <p style={{ margin: 0, fontSize: primitiveTypeScale.body, color: tokens.text.secondary, lineHeight: '1.43' }}>
            {caseRecord.routingRationale}
          </p>
        </div>

        {/* Key metadata grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: primitiveSpacing[3], marginBottom: primitiveSpacing[3] }}>
          <MetaItem label="Owner" value={caseRecord.owner} tokens={tokens} />
          <MetaItem label="Team" value={caseRecord.team} tokens={tokens} />
          <MetaItem label="Type" value={caseRecord.case_type} tokens={tokens} />
          <MetaItem label="Created" value={new Date(caseRecord.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} tokens={tokens} />
          <MetaItem label="SLA Target" value={`${slaHours}h${caseRecord.sla.breached ? ' (BREACHED)' : ''}`} tokens={tokens} breached={caseRecord.sla.breached} />
        </div>

        {/* Open full detail link */}
        <a
          href={`/cases/${caseRecord.id}`}
          style={{
            fontSize: primitiveTypeScale.body,
            color: tokens.action.primary,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Open full detail →
        </a>
      </div>
    </div>
  );
}

function MetaItem({ label, value, tokens, breached }: { label: string; value: string; tokens: any; breached?: boolean }) {
  return (
    <div>
      <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, display: 'block', marginBottom: '2px' }}>
        {label}
      </span>
      <span style={{ fontSize: primitiveTypeScale.caption, color: breached ? primitiveSignal.critical : tokens.text.primary, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}
