'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

/**
 * Sidebar Collapse Context — Commander SDR
 *
 * Shared state for sidebar collapsed/expanded so that:
 * - Shell can adjust marginLeft dynamically
 * - TopBar brand zone can match sidebar width
 * - No black gap on collapse at any screen size
 *
 * State persisted in localStorage.
 *
 * Hydration strategy:
 * - Server and first client render always use collapsed=false (expanded).
 * - After mount, useEffect reads localStorage and updates if stored value differs.
 * - This ensures server HTML and initial client HTML are identical, eliminating
 *   the hydration mismatch caused by localStorage being unavailable on the server.
 */

interface SidebarContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const COLLAPSE_KEY = 'commander-sdr.sidebar.collapsed';

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Default: expanded (false). Server and first client render must agree.
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Step 1: mark as mounted (no-op on server)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Step 2: after mount, sync from localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = localStorage.getItem(COLLAPSE_KEY);
      if (stored !== null) {
        setCollapsed(stored === 'true');
      }
    } catch {
      // localStorage unavailable — keep default (expanded)
    }
  }, [mounted]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, String(next));
      } catch {
        // localStorage unavailable — state still updates in memory
      }
      return next;
    });
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarCollapsed(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebarCollapsed must be used within SidebarProvider');
  return ctx;
}
