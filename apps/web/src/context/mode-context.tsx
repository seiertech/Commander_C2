'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getSemanticTokens, type WorkspaceMode } from '../../../../packages/ui/src/tokens/semantic';

/**
 * Workspace Mode Context — Commander SDR
 *
 * Standard/Mission mode system per DS-1.0 §9.
 * - Standard (Light): management, configuration, reporting
 * - Mission (HUD/Dark): monitoring, analysis, live ops
 * - Shell chrome is ALWAYS navy/dark regardless of mode (DS-1.0 §3)
 * - Mode toggle is functional, not cosmetic (DS-1.0 §0)
 * - State persisted per user in localStorage
 *
 * Source: DESIGN_SYSTEM.md §9, §3
 *
 * Hydration strategy:
 * - Server and first client render always use mode='standard'.
 * - After mount, useEffect reads localStorage and updates if stored value differs.
 * - This ensures server HTML and initial client HTML are identical, eliminating
 *   the hydration mismatch caused by localStorage being unavailable on the server.
 * - ThemeRoot observes mode changes and updates data-bs-theme on <html> after mount.
 */

interface ModeContextValue {
  mode: WorkspaceMode;
  toggleMode: () => void;
  tokens: ReturnType<typeof getSemanticTokens>;
}

const ModeContext = createContext<ModeContextValue | null>(null);

const STORAGE_KEY = 'commander-sdr.workspace-mode';

export function ModeProvider({ children }: { children: ReactNode }) {
  // Default: standard. Server and first client render must agree.
  const [mode, setMode] = useState<WorkspaceMode>('standard');
  const [mounted, setMounted] = useState(false);

  // Step 1: mark as mounted (no-op on server)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Step 2: after mount, sync from localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'mission' || stored === 'standard') {
        setMode(stored);
      }
    } catch {
      // localStorage unavailable — keep default (standard)
    }
  }, [mounted]);

  function toggleMode() {
    setMode((prev) => {
      const next = prev === 'standard' ? 'mission' : 'standard';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // localStorage unavailable — state still updates in memory
      }
      return next;
    });
  }

  const tokens = getSemanticTokens(mode);

  return (
    <ModeContext.Provider value={{ mode, toggleMode, tokens }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within ModeProvider');
  return ctx;
}
