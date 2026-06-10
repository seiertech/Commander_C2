/**
 * Relationship State Machine — Pure Function (C7)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 7.3
 *
 * Records a stateful transition for an IOC_Relationship,
 * appending { previousState, newState, changedAt, reason } to stateHistory.
 * Validates that the target state is a member of IOC_RELATIONSHIP_STATES.
 */

import type { IocRelationship } from '../contracts/src/entities/ioc-relationship';
import type { IocRelationshipState, RelationshipStateTransition } from '../contracts/src/entities/intelligence-common';
import { IOC_RELATIONSHIP_STATES } from '../contracts/src/entities/intelligence-common';

export interface TransitionResult {
  success: boolean;
  relationship: IocRelationship;
  error?: string;
}

/**
 * Transition an IOC_Relationship to a new state.
 *
 * - Validates target state membership
 * - Appends transition record to stateHistory
 * - Updates relationshipState and lastUpdatedAt
 * - Pure: returns a new relationship object (no mutation)
 */
export function transitionRelationship(
  relationship: IocRelationship,
  newState: IocRelationshipState,
  changedAt: string,
  reason: string,
): TransitionResult {
  // Validate target state membership
  if (!IOC_RELATIONSHIP_STATES.includes(newState)) {
    return {
      success: false,
      relationship,
      error: `Invalid target state: "${newState}". Must be one of: ${IOC_RELATIONSHIP_STATES.join(', ')}`,
    };
  }

  const transition: RelationshipStateTransition = {
    previousState: relationship.relationshipState,
    newState,
    changedAt,
    reason,
  };

  const updated: IocRelationship = {
    ...relationship,
    relationshipState: newState,
    lastUpdatedAt: changedAt,
    stateHistory: [...relationship.stateHistory, transition],
  };

  return { success: true, relationship: updated };
}
