import { z } from "zod"
import { insertBuyerSchema, selectBuyerSchema } from "@/drizzle/schema"

export const newBuyerFormSchema = insertBuyerSchema.omit({
  id: true,
  updatedAt: true,
  createdAt: true,
  ownerId: true,
}).extend({
  email: z.string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal(""))
    .or(z.null())
    .transform(val => val === "" || val === null ? undefined : val),
  budgetMin: z.number().int().positive().optional().or(z.null()).transform(val => val === null ? undefined : val),
  budgetMax: z.number().int().positive().optional().or(z.null()).transform(val => val === null ? undefined : val),
  notes: z.string().max(1000).optional().or(z.null()).transform(val => val === null ? undefined : (val ?? "")),
  tags: z.array(z.string()).optional().default([]),
})
.refine(
  (data) => {
    const needsBhk = ['Apartment', 'Villa'].includes(data.propertyType);
    return !needsBhk || data.bhk !== undefined;
  },
  { 
    message: 'BHK is required for Apartment/Villa', 
    path: ['bhk'] 
  }
)

export type NewBuyerFormValues = z.infer<typeof newBuyerFormSchema>

export const buyerFormSchema = newBuyerFormSchema.safeExtend({
  id: z.string().uuid(),
  updatedAt: z.union([z.date(), z.string()]).optional().transform(val => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
})

export type BuyerFormValues = z.infer<typeof buyerFormSchema>

export type Buyer = z.infer<typeof selectBuyerSchema>
export type InsertBuyer = z.infer<typeof insertBuyerSchema>