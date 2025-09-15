// import {
//   pgTable,
//   uuid,
//   varchar,
//   text,
//   integer,
//   timestamp,
//   jsonb,
//   pgEnum,
// } from 'drizzle-orm/pg-core';
// import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
// import { z } from 'zod';

// // ENUMS
// export const cityEnum = pgEnum('city', [
//   'Mumbai',
//   'Bangalore',
//   'Delhi',
//   'Chennai',
//   'Other',
// ]);
// export const propertyTypeEnum = pgEnum('property_type', [
//   'Apartment',
//   'Villa',
//   'Plot',
//   'Office',
//   'Retail',
// ]);
// export const bhkEnum = pgEnum('bhk', ['1', '2', '3', '4', 'Studio']);
// export const purposeEnum = pgEnum('purpose', ['Buy', 'Rent']);
// export const timelineEnum = pgEnum('timeline', [
//   '0-3m',
//   '3-6m',
//   '>6m',
//   'Exploring',
// ]);
// export const sourceEnum = pgEnum('source', [
//   'Website',
//   'Referral',
//   'Walk-in',
//   'Call',
//   'Other',
// ]);
// export const statusEnum = pgEnum('status', [
//   'New',
//   'Qualified',
//   'Contacted',
//   'Visited',
//   'Negotiation',
//   'Converted',
//   'Dropped',
// ]);

// // Buyers table
// export const buyers = pgTable('buyers', {
//   id: uuid('id').defaultRandom().primaryKey(),
//   fullName: varchar('full_name', { length: 80 }).notNull(),
//   email: varchar('email', { length: 255 }),
//   phone: varchar('phone', { length: 15 }).notNull(),
//   city: cityEnum('city').notNull(),
//   propertyType: propertyTypeEnum('property_type').notNull(),
//   bhk: bhkEnum('bhk'),
//   purpose: purposeEnum('purpose').notNull(),
//   budgetMin: integer('budget_min'),
//   budgetMax: integer('budget_max'),
//   timeline: timelineEnum('timeline').notNull(),
//   source: sourceEnum('source').notNull(),
//   status: statusEnum('status').notNull().default('New'),
//   notes: text('notes'),
//   tags: jsonb('tags').$type<string[]>().default([]),
//   ownerId: uuid('owner_id').notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
// });

// // Buyer history table
// export const buyerHistory = pgTable('buyer_history', {
//   id: uuid('id').defaultRandom().primaryKey(),
//   buyerId: uuid('buyer_id')
//     .notNull()
//     .references(() => buyers.id),
//   changedBy: uuid('changed_by').notNull(),
//   changedAt: timestamp('changed_at').defaultNow().notNull(),
//   diff: jsonb('diff').notNull(),
// });

// // Zod schemas for validation
// export const selectBuyerSchema = createSelectSchema(buyers); // Move this UP

// export const insertBuyerSchema = createInsertSchema(buyers, {
//   fullName: z.string().min(2).max(80),
//   email: z.email().optional().or(z.literal('')),
//   phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
//   budgetMin: z.number().positive().optional(),
//   budgetMax: z.number().positive().optional(),
//   notes: z.string().max(1000).optional(),
//   tags: z.array(z.string()).default([]),
// })
//   .refine(
//     (data) =>
//       !data.budgetMax || !data.budgetMin || data.budgetMax >= data.budgetMin,
//     {
//       message: 'Budget max must be >= budget min',
//       path: ['budgetMax'],
//     },
//   )
//   .refine(
//   (data) => {
//     const needsBhk = ['Apartment', 'Villa'].includes(data.propertyType);
//     return !needsBhk || data.bhk;
//   },
//   { message: 'BHK required for Apartment/Villa', path: ['bhk'] }
// )

// // Types - Now these can reference the schemas above
// export type Buyer = z.infer<typeof selectBuyerSchema>;
// export type InsertBuyer = z.infer<typeof insertBuyerSchema>;
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

// ENUMS - Updated to match assignment requirements
export const cityEnum = pgEnum('city', [
  'Chandigarh',
  'Mohali', 
  'Zirakpur',
  'Panchkula',
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
  email: varchar('email', { length: 255 }), // Optional as per requirements
  phone: varchar('phone', { length: 15 }).notNull(),
  city: cityEnum('city').notNull(),
  propertyType: propertyTypeEnum('property_type').notNull(),
  bhk: bhkEnum('bhk'), // Optional if non-residential
  purpose: purposeEnum('purpose').notNull(),
  budgetMin: integer('budget_min'), // Optional
  budgetMax: integer('budget_max'), // Optional
  timeline: timelineEnum('timeline').notNull(),
  source: sourceEnum('source').notNull(),
  status: statusEnum('status').notNull().default('New'),
  notes: text('notes'), // Optional, max 1000 chars handled in validation
  tags: jsonb('tags').$type<string[]>().default([]), // Optional string array
  ownerId: uuid('owner_id').notNull(), // References user id
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(), // Added for completeness
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
export const selectBuyerSchema = createSelectSchema(buyers);

export const insertBuyerSchema = createInsertSchema(buyers, {
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(80, "Full name must not exceed 80 characters"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  notes: z.string().max(1000, "Notes must not exceed 1000 characters").optional(),
  tags: z.array(z.string()).default([]),
})
.refine(
  (data) => {
    // Both budgets must be present to compare, and budgetMax >= budgetMin
    if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
      return data.budgetMax >= data.budgetMin;
    }
    return true;
  },
  {
    message: 'Budget max must be ≥ budget min',
    path: ['budgetMax'],
  }
)
.refine(
  (data) => {
    // BHK required for residential properties (Apartment, Villa)
    const needsBhk = ['Apartment', 'Villa'].includes(data.propertyType);
    return !needsBhk || data.bhk !== undefined;
  },
  { 
    message: 'BHK is required for Apartment/Villa', 
    path: ['bhk'] 
  }
);

// Create update schema (omits auto-generated fields)
export const updateBuyerSchema = insertBuyerSchema.partial().omit({
  id: true,
  createdAt: true,
});

// Types
export type Buyer = z.infer<typeof selectBuyerSchema>;
export type InsertBuyer = z.infer<typeof insertBuyerSchema>;
export type UpdateBuyer = z.infer<typeof updateBuyerSchema>;