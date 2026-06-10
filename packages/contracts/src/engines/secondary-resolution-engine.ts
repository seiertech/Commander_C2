/**
 * Secondary Resolution Engine — Commander C2 (Spec 40)
 *
 * Source: Spec #40 Inverse Discovery Loop
 *
 * Provides secondary resolution methods when primary lookup fails: fuzzy
 * matching, identifier translation, and recent-change detection.
 *
 * Pure functions — no I/O.
 *
 * Domain: D-10 (Coverage / Tool Health)
 * Use Cases: UC-182 (attempt secondary resolution)
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MatchResult {
  matched: boolean;
  candidateKey: string | null;
  similarity: number;
  method: 'fuzzy' | 'exact';
}

export interface TranslationResult {
  translated: boolean;
  originalKey: string;
  translatedKey: string | null;
  mappingSource: string | null;
}

export interface ChangeCheckResult {
  recentChange: boolean;
  previousKey: string | null;
  changedAt: string | null;
  changeType: 'renamed' | 'merged' | 'split' | null;
}

export interface IdentifierMapping {
  fromKey: string;
  toKey: string;
  mappingSource: string;
}

export interface RecentChange {
  entityKey: string;
  previousKey: string;
  changedAt: string;
  changeType: 'renamed' | 'merged' | 'split';
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Attempt fuzzy match of a lookup key against candidate entity keys.
 * Uses simple Levenshtein-distance-based similarity.
 */
export function attemptFuzzyMatch(key: string, candidates: string[]): MatchResult {
  if (candidates.length === 0) {
    return { matched: false, candidateKey: null, similarity: 0, method: 'fuzzy' };
  }

  let bestCandidate: string | null = null;
  let bestSimilarity = 0;

  for (const candidate of candidates) {
    const sim = computeSimilarity(key.toLowerCase(), candidate.toLowerCase());
    if (sim > bestSimilarity) {
      bestSimilarity = sim;
      bestCandidate = candidate;
    }
  }

  const threshold = 0.75;
  return {
    matched: bestSimilarity >= threshold,
    candidateKey: bestSimilarity >= threshold ? bestCandidate : null,
    similarity: bestSimilarity,
    method: 'fuzzy',
  };
}

/**
 * Attempt identifier translation using known mappings.
 */
export function translateIdentifier(key: string, mappings: IdentifierMapping[]): TranslationResult {
  const mapping = mappings.find((m) => m.fromKey === key);
  if (mapping) {
    return {
      translated: true,
      originalKey: key,
      translatedKey: mapping.toKey,
      mappingSource: mapping.mappingSource,
    };
  }
  return { translated: false, originalKey: key, translatedKey: null, mappingSource: null };
}

/**
 * Check if the key was recently changed (renamed, merged, split).
 */
export function checkRecentChanges(key: string, changes: RecentChange[]): ChangeCheckResult {
  const match = changes.find((c) => c.previousKey === key);
  if (match) {
    return {
      recentChange: true,
      previousKey: match.previousKey,
      changedAt: match.changedAt,
      changeType: match.changeType,
    };
  }
  return { recentChange: false, previousKey: null, changedAt: null, changeType: null };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Simple character-level similarity (1 - normalised edit distance) */
function computeSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;

  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
    for (let j = 1; j <= b.length; j++) {
      if (i === 0) { matrix[i][j] = j; continue; }
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return 1 - matrix[a.length][b.length] / maxLen;
}
