import type { NextConfig } from 'next';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig: NextConfig = {
  // Explicitly set the workspace root to the monorepo root (two levels up from
  // apps/web/) so Next.js does not infer it from a stray package-lock.json
  // higher in the tree. Without this, Windows path casing mismatch (C:\ vs c:\)
  // causes duplicate module resolution and breaks the App Router layout context.
  outputFileTracingRoot: resolve(__dirname, '../..'),

  // Skip type checking during build — handled separately in CI/dev.
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip ESLint during build — handled separately in CI/dev.
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Prevent pnpm symlink resolution from producing mixed-case module paths.
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
