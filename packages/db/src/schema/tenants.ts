/**
 * Tenants Table — Commander SDR
 *
 * Every record in the system is tenant-scoped.
 * Tenant residency boundary is enforced per Master Technical Specification §11.2.
 *
 * Source: Spec #05 §7.2 Tenant Isolation Rules
 */

import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { dataResidencyEnum } from './common';

export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  /** Data residency region — honoured for all tenant data */
  residency: dataResidencyEnum('residency').notNull().default('uk'),
  /** Whether tenant is active */
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
