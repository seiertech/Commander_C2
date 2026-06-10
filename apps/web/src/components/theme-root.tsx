'use client';

import { useEffect, useState } from 'react';
import { useMode } from '@/context/mode-context';

/**
 * ThemeRoot — Commander SDR (DS-1.0 Tabler integration)
 *
 * Applies data-bs-theme to <html> so Tabler's CSS variables switch between
 * light and dark palettes in sync with Commander's Standard/Mission mode.
 *
 * - standard → data-bs-theme="light"  (white header, light grey page bg)
 * - mission  → data-bs-theme="dark"   (dark header, dark page bg)
 *
 * Hydration strategy:
 * - layout.tsx sets data-bs-theme="light" on <html> as the SSR default.
 * - This component is a no-op on the server and on the first client render
 *   (mounted=false), so server HTML and initial client HTML are identical.
 * - After mount, useEffect reads the actual mode from context (which itself
 *   reads localStorage) and updates the attribute only if it differs.
 * - This eliminates the server/client mismatch entirely.
 */
export function ThemeRoot() {
  const { mode } = useMode();
  const [mounted, setMounted] = useState(false);

  // Mark as mounted after first client render — no-op on server
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only update the attribute after mount, when we know the real mode
  useEffect(() => {
    if (!mounted) return;
    const theme = mode === 'mission' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [mode, mounted]);

  return null;
}
