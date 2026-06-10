/**
 * Architecture Classification Entity — Commander C2
 *
 * Governed by:
 *   - TOGAF 10: 4 architecture domains (Business, Data, Application, Technology)
 *   - Zachman Framework 3.0: 6 aspects × 6 perspectives
 *
 * Purpose: Classify any architectural artefact within both TOGAF and Zachman
 * taxonomies simultaneously. Enables dual-lens architecture governance.
 *
 * Standards adherence:
 *   - TOGAF domain names exact per Open Group specification
 *   - Zachman aspect/perspective names exact per Zachman International
 */

import type { CommonFields } from './common';

// ─── TOGAF 10 Architecture Domains ──────────────────────────────────────────

export type TogafDomain =
  | 'Business'
  | 'Data'
  | 'Application'
  | 'Technology';

// ─── Zachman Aspects (Columns) ───────────────────────────────────────────────

export type ZachmanAspect =
  | 'What'
  | 'How'
  | 'Where'
  | 'Who'
  | 'When'
  | 'Why';

// ─── Zachman Perspectives (Rows) ─────────────────────────────────────────────

export type ZachmanPerspective =
  | 'Executive'
  | 'Business Management'
  | 'Architect'
  | 'Engineer'
  | 'Technician'
  | 'Enterprise';

// ─── Classification Status ───────────────────────────────────────────────────

export type ClassificationStatus = 'active' | 'deprecated' | 'draft' | 'under_review';

// ─── Architecture Classification Entity ──────────────────────────────────────

export interface ArchitectureClassification extends CommonFields {
  entityType: 'architecture-classification';

  /** Unique classification identifier */
  classificationId: string;

  // ─── Artefact reference ────────────────────────────────────────────
  /** Name of the artefact being classified */
  artefactName: string;
  /** Type of artefact (e.g. "service", "data-store", "process", "capability") */
  artefactType: string;
  /** Description of the artefact */
  artefactDescription: string;

  // ─── TOGAF 10 classification ───────────────────────────────────────
  /** Primary TOGAF domain */
  togafDomain: TogafDomain;
  /** Optional secondary TOGAF domain (for cross-cutting artefacts) */
  togafSecondaryDomain: TogafDomain | null;
  /** TOGAF ADM phase where this artefact is primarily managed */
  togafAdmPhase: string;

  // ─── Zachman Framework classification ──────────────────────────────
  /** Primary Zachman aspect (column) */
  zachmanAspect: ZachmanAspect;
  /** Primary Zachman perspective (row) */
  zachmanPerspective: ZachmanPerspective;
  /** Optional secondary Zachman aspect for multi-concern artefacts */
  zachmanSecondaryAspect: ZachmanAspect | null;
  /** Optional secondary Zachman perspective */
  zachmanSecondaryPerspective: ZachmanPerspective | null;

  // ─── Governance ────────────────────────────────────────────────────
  /** Who owns this classification */
  classifiedBy: string;
  /** When classified */
  classificationDate: string;
  /** Current status */
  status: ClassificationStatus;
  /** Tags for cross-referencing */
  tags: string[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ArchitectureClassificationValidation {
  valid: boolean;
  errors: string[];
}

const TOGAF_DOMAINS: TogafDomain[] = ['Business', 'Data', 'Application', 'Technology'];
const ZACHMAN_ASPECTS: ZachmanAspect[] = ['What', 'How', 'Where', 'Who', 'When', 'Why'];
const ZACHMAN_PERSPECTIVES: ZachmanPerspective[] = [
  'Executive', 'Business Management', 'Architect', 'Engineer', 'Technician', 'Enterprise',
];
const CLASSIFICATION_STATUSES: ClassificationStatus[] = ['active', 'deprecated', 'draft', 'under_review'];

export function validateArchitectureClassification(
  c: ArchitectureClassification,
): ArchitectureClassificationValidation {
  const errors: string[] = [];

  if (!c.id || c.id.trim() === '') errors.push('id: required');
  if (!c.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!c.classificationId || c.classificationId.trim() === '') errors.push('classificationId: required');
  if (!c.artefactName || c.artefactName.trim() === '') errors.push('artefactName: required');
  if (!c.artefactType || c.artefactType.trim() === '') errors.push('artefactType: required');
  if (!c.artefactDescription || c.artefactDescription.trim() === '') errors.push('artefactDescription: required');

  // TOGAF validation
  if (!TOGAF_DOMAINS.includes(c.togafDomain)) {
    errors.push('togafDomain: must be Business | Data | Application | Technology');
  }
  if (c.togafSecondaryDomain !== null && !TOGAF_DOMAINS.includes(c.togafSecondaryDomain)) {
    errors.push('togafSecondaryDomain: must be null or Business | Data | Application | Technology');
  }
  if (!c.togafAdmPhase || c.togafAdmPhase.trim() === '') errors.push('togafAdmPhase: required');

  // Zachman validation
  if (!ZACHMAN_ASPECTS.includes(c.zachmanAspect)) {
    errors.push('zachmanAspect: must be What | How | Where | Who | When | Why');
  }
  if (!ZACHMAN_PERSPECTIVES.includes(c.zachmanPerspective)) {
    errors.push('zachmanPerspective: must be Executive | Business Management | Architect | Engineer | Technician | Enterprise');
  }
  if (c.zachmanSecondaryAspect !== null && !ZACHMAN_ASPECTS.includes(c.zachmanSecondaryAspect)) {
    errors.push('zachmanSecondaryAspect: must be null or valid ZachmanAspect');
  }
  if (c.zachmanSecondaryPerspective !== null && !ZACHMAN_PERSPECTIVES.includes(c.zachmanSecondaryPerspective)) {
    errors.push('zachmanSecondaryPerspective: must be null or valid ZachmanPerspective');
  }

  // Governance
  if (!c.classifiedBy || c.classifiedBy.trim() === '') errors.push('classifiedBy: required');
  if (!c.classificationDate || c.classificationDate.trim() === '') errors.push('classificationDate: required');
  if (!CLASSIFICATION_STATUSES.includes(c.status)) {
    errors.push('status: must be active | deprecated | draft | under_review');
  }
  if (!Array.isArray(c.tags)) errors.push('tags: must be array');

  return { valid: errors.length === 0, errors };
}
