/**
 * Direction Boards Engine — Commander C2 (Unit 34)
 * Source: Spec #58 Security OODA Loop Specification
 * Prioritises direction items, assesses impact, links to risk objects.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DirectionBoard {
  id: string;
  title: string;
  priority: number; // 1-5 (1 = highest)
  status: 'proposed' | 'active' | 'completed' | 'deferred';
  impactAreas: string[];
  linkedRiskObjects: string[];
  created_at: string;
}

export interface RiskObject {
  id: string;
  type: string;
  severity: number;
  surface: 'external' | 'internal';
}

export interface ImpactAssessment {
  board_id: string;
  impact_score: number; // 0-100
  factors: string[];
}

export interface LinkedReference {
  board_id: string;
  risk_object_id: string;
  linkType: 'mitigates' | 'monitors' | 'escalates';
  confidence: number; // 0-100
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Prioritise direction items by sorting boards by priority (ascending) then
 * status (active first, then proposed, then deferred, then completed).
 */
export function prioritiseDirectionItems(boards: DirectionBoard[]): DirectionBoard[] {
  const statusOrder: Record<string, number> = {
    active: 0,
    proposed: 1,
    deferred: 2,
    completed: 3,
  };

  return [...boards].sort((a, b) => {
    // Primary sort: priority (lower = higher priority)
    if (a.priority !== b.priority) return a.priority - b.priority;
    // Secondary sort: status ordering
    const statusA = statusOrder[a.status] ?? 9;
    const statusB = statusOrder[b.status] ?? 9;
    return statusA - statusB;
  });
}

/**
 * Assess the impact of a direction board based on its impact areas,
 * priority, and linked risk objects.
 */
export function assessImpact(board: DirectionBoard): ImpactAssessment {
  const factors: string[] = [];
  let impactScore = 0;

  // Priority contribution (P1 = 40pts, P2 = 30pts, etc.)
  const priorityContribution = Math.max(0, (6 - board.priority) * 10);
  impactScore += priorityContribution;
  if (board.priority <= 2) factors.push('high_priority');

  // Impact area breadth
  const areaContribution = Math.min(30, board.impactAreas.length * 10);
  impactScore += areaContribution;
  if (board.impactAreas.length >= 3) factors.push('broad_impact');

  // Linked risk objects indicate concrete risk association
  const riskContribution = Math.min(20, board.linkedRiskObjects.length * 5);
  impactScore += riskContribution;
  if (board.linkedRiskObjects.length > 0) factors.push('risk_linked');

  // Active status adds urgency
  if (board.status === 'active') {
    impactScore += 10;
    factors.push('active_board');
  }

  return {
    board_id: board.id,
    impact_score: Math.min(100, impactScore),
    factors,
  };
}

/**
 * Link a direction board to risk objects based on matching impact areas and risk types.
 * Returns linked references with confidence scores.
 */
export function linkToRiskObjects(
  board: DirectionBoard,
  riskObjects: RiskObject[],
): LinkedReference[] {
  const refs: LinkedReference[] = [];

  for (const risk of riskObjects) {
    // Determine link type based on board status and risk severity
    let linkType: LinkedReference['linkType'];
    if (board.status === 'active' && risk.severity >= 4) {
      linkType = 'escalates';
    } else if (board.status === 'active') {
      linkType = 'mitigates';
    } else {
      linkType = 'monitors';
    }

    // Confidence based on impact area overlap with risk type
    const areaMatch = board.impactAreas.includes(risk.type);
    const confidence = areaMatch ? 85 : 50;

    refs.push({
      board_id: board.id,
      risk_object_id: risk.id,
      linkType,
      confidence,
    });
  }

  return refs;
}
