import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
// Tabler CSS — loaded first so Commander token overrides take precedence
import '@tabler/core/dist/css/tabler.min.css';
// Commander global overrides — loaded after Tabler, takes precedence
import './globals.css';
import { Shell } from '@/components/shell';
import { ModeProvider } from '@/context/mode-context';
import { SidebarProvider } from '@/context/sidebar-context';
import { ThemeRoot } from '@/components/theme-root';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Commander C2',
  description: 'Security Command and Control — Security Drift Response',
};

/**
 * Root Layout — Commander C2 Operational App (DS-1.0)
 *
 * Fonts declared inline (not imported from separate module) to avoid
 * next/font internal Set objects leaking across the RSC boundary.
 * Wraps in SidebarProvider for shared collapse state.
 * Wraps in ModeProvider for Standard/Mission mode system.
 * Wraps in Shell for persistent chrome.
 *
 * Source: DESIGN_SYSTEM.md §5, §6, §9
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} data-bs-theme="light">
      <body style={{ margin: 0, fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', lineHeight: '1.4285714286' }}>
        <SidebarProvider>
          <ModeProvider>
            {/* ThemeRoot syncs data-bs-theme on <html> with Standard/Mission mode */}
            <ThemeRoot />
            <Suspense>
              <Shell>
                {children}
              </Shell>
            </Suspense>
          </ModeProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
