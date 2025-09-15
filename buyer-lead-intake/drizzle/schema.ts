import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ENUMS
export const cityEnum = pgEnum('city', [
  'Mumbai',
  'Bangalore',
  'Delhi',
  'Chennai',
  'Other',
]);
export const propertyTypeEnum = pgEnum('property_type', [
  'Apartment',
  'Villa',
  'Plot',
  'Office',
  'Retail',
]);
export const bhkEnum = pgEnum('bhk', ['1', '2', '3', '4', 'Studio']);
export const purposeEnum = pgEnum('purpose', ['Buy', 'Rent']);
export const timelineEnum = pgEnum('timeline', [
  '0-3m',
  '3-6m',
  '>6m',
  'Exploring',
]);
export const sourceEnum = pgEnum('source', [
  'Website',
  'Referral',
  'Walk-in',
  'Call',
  'Other',
]);
export const statusEnum = pgEnum('status', [
  'New',
  'Qualified',
  'Contacted',
  'Visited',
  'Negotiation',
  'Converted',
  'Dropped',
]);

// Buyers table
export const buyers = pgTable('buyers', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 80 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 15 }).notNull(),
  city: cityEnum('city').notNull(),
  propertyType: propertyTypeEnum('property_type').notNull(),
  bhk: bhkEnum('bhk'),
  purpose: purposeEnum('purpose').notNull(),
  budgetMin: integer('budget_min'),
  budgetMax: integer('budget_max'),
  timeline: timelineEnum('timeline').notNull(),
  source: sourceEnum('source').notNull(),
  status: statusEnum('status').notNull().default('New'),
  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>().default([]),
  ownerId: uuid('owner_id').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Buyer history table
export const buyerHistory = pgTable('buyer_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => buyers.id),
  changedBy: uuid('changed_by').notNull(),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
  diff: jsonb('diff').notNull(),
});

// Zod schemas for validation
export const selectBuyerSchema = createSelectSchema(buyers); // Move this UP

export const insertBuyerSchema = createInsertSchema(buyers, {
  fullName: z.string().min(2).max(80),
  email: z.email().optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
})
  .refine(
    (data) =>
      !data.budgetMax || !data.budgetMin || data.budgetMax >= data.budgetMin,
    {
      message: 'Budget max must be >= budget min',
      path: ['budgetMax'],
    },
  )
  .refine(
  (data) => {
    const needsBhk = ['Apartment', 'Villa'].includes(data.propertyType);
    return !needsBhk || data.bhk;
  },
  { message: 'BHK required for Apartment/Villa', path: ['bhk'] }
)

// Types - Now these can reference the schemas above
export type Buyer = z.infer<typeof selectBuyerSchema>;
export type InsertBuyer = z.infer<typeof insertBuyerSchema>;
