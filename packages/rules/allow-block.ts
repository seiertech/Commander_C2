/**
 * Allow/Block Evaluator — Pure Function (C6)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 23.1, 23.2, 23.3, 23.4; DEC-allowblock-block-wins
 *
 * Given a candidate platform IOC and a tenant's allow/block list,
 * returns a decision: suppress (allow), force_malicious (block), or proceed.
 *
 * Block-over-allow precedence is binding (DEC-allowblock-block-wins):
 * an allow entry MUST NOT override a matching block entry.
 */

import type { IocCategory } from '../contracts/src/entities/intelligence-common';
import type { TenantIocAllowBlockEntry } from '../contracts/src/entities/tenant-ioc-allowblock-entry';

// ─── Decision Types ──────────────────────────────────────────────────────────

export interface AllowBlockSuppressDecision {
  decision: 'suppress';
  /** Reference to the allow-list entry that caused suppression */
  suppressionReference: string;
}

export interface AllowBlockForceDecision {
  decision: 'force_malicious';
  /** Reference to the block-list entry */
  blockReference: string;
}

export interface AllowBlockProceedDecision {
  decision: 'proceed';
}

export type AllowBlockDecision =
  | AllowBlockSuppressDecision
  | AllowBlockForceDecision
  | AllowBlockProceedDecision;

// ─── Evaluator ───────────────────────────────────────────────────────────────

/**
 * Evaluate an IOC against a tenant's allow/block list.
 *
 * Rules (DEC-allowblock-block-wins):
 * 1. If a block entry matches: return force_malicious (ignore platform confidence).
 * 2. If an allow entry matches (and no block): return suppress with reference.
 * 3. Otherwise: proceed with normal evaluation.
 *
 * Block always wins over allow — this is non-negotiable.
 */
export function evaluateAllowBlock(
  ioc_category: IocCategory,
  normalisedValue: string,
  entries: TenantIocAllowBlockEntry[],
  now: string,
): AllowBlockDecision {
  // Filter to matching entries (same category + value, not expired)
  const matching = entries.filter(entry => {
    if (entry.ioc_category !== ioc_category) return false;
    if (entry.value !== normalisedValue) return false;
    // Check expiry
    if (entry.expires_at !== null) {
      const expiryTime = new Date(entry.expires_at).getTime();
      const currentTime = new Date(now).getTime();
      if (expiryTime <= currentTime) return false;
    }
    return true;
  });

  // DEC-allowblock-block-wins: check block entries first
  const blockEntry = matching.find(e => e.listType === 'block');
  if (blockEntry) {
    return {
      decision: 'force_malicious',
      blockReference: blockEntry.id,
    };
  }

  // Then check allow entries
  const allowEntry = matching.find(e => e.listType === 'allow');
  if (allowEntry) {
    return {
      decision: 'suppress',
      suppressionReference: allowEntry.id,
    };
  }

  return { decision: 'proceed' };
}
