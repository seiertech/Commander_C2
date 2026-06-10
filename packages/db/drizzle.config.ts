/**
 * Drizzle Kit Configuration — Commander SDR
 *
 * Local-first development. No live database provisioned.
 * Connection string uses local Postgres for development only.
 * Future AWS option: Aurora PostgreSQL (recorded in DECISIONS.md).
 */

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Local development only — no real credentials
    url: process.env.DATABASE_URL ?? 'postgresql://commander:commander@localhost:5432/commander_sdr',
  },
});
