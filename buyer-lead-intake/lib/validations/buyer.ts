// // import { z } from "zod"
// // export const buyerFormSchema = z.object({
// //   fullName: z.string().min(2, "Full name must be at least 2 characters").max(80),
// //   email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
// //   phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10-15 digits"),
// //   city: z.enum(["Mumbai", "Bangalore", "Delhi", "Chennai", "Other"]),
// //   propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
// //   bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),  
// //   purpose: z.enum(["Buy", "Rent"]),
// //   budgetMin: z.union([z.string().max(0), z.number().positive()])
// //   .transform((val) => (val === "" ? undefined : val)).optional(),
// //   budgetMax: z
// //   .union([z.string().max(0), z.number().positive()])
// //   .transform((val) => (val === "" ? undefined : val))
// //   .optional(),
// //   timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
// //   source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
// //   notes: z.string().max(1000).optional(),
// //   tags: z.string().optional(),
// // }).refine(
// //   (data) => !data.budgetMax || !data.budgetMin || data.budgetMax >= data.budgetMin,
// //   { message: "Budget max must be >= budget min", path: ["budgetMax"] }
// // ).refine(
// //   (data) => {
// //     const needsBhk = ["Apartment", "Villa"].includes(data.propertyType);
// //     return !needsBhk || data.bhk;  
// //   },
// //   { message: "BHK required for Apartment/Villa", path: ["bhk"] }
// // )

// // export type BuyerFormValues = z.infer<typeof buyerFormSchema>

import { z } from "zod"

export const buyerFormSchema = z.object({
  id: z.uuid(),
  fullName: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(80),
  email: z.string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")) 
    .transform(val => val === "" ? undefined : val),
  phone: z.string()
    .regex(/^\d{10,15}$/, "Phone must be 10–15 digits"),
  city: z.enum(["Mumbai", "Bangalore", "Delhi", "Chennai", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),  
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.preprocess(
    (val) => val === "" || val == null ? undefined : Number(val),
    z.number().int().positive().optional()
  ),
  budgetMax: z.preprocess(
    (val) => val === "" || val == null ? undefined : Number(val),
    z.number().int().positive().optional()
  ),
  timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
  source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
  status: z.enum([
    "New",
    "Qualified",
    "Contacted",
    "Visited",
    "Negotiation",
    "Converted",
    "Dropped",
  ]).default("New"),
  notes: z.string().max(1000).optional().transform(val => val ?? ""),
  // ✅ correct for DB: Supabase/Drizzle `string[]`
  tags: z.array(z.string()).optional().default([]),
  ownerId: z.string().uuid().optional(),
  updatedAt: z.date().optional(),
})
.refine(
  (data) => !data.budgetMax || !data.budgetMin || data.budgetMax >= data.budgetMin,
  { message: "Budget max must be ≥ budget min", path: ["budgetMax"] }
)
.refine(
  (data) => {
    const needsBhk = ["Apartment", "Villa"].includes(data.propertyType);
    return !needsBhk || data.bhk;  
  },
  { message: "BHK required for Apartment/Villa", path: ["bhk"] }
)

export type BuyerFormValues = z.infer<typeof buyerFormSchema>
// import { z } from "zod"

// export const buyerFormSchema = z.object({
//   fullName: z.string()
//     .min(2, "Full name must be at least 2 characters")
//     .max(80, "Full name must not exceed 80 characters"),
  
//   email: z.string()
//     .email("Please enter a valid email")
//     .optional()
//     .or(z.literal(""))
//     .transform(val => val === "" ? undefined : val),
  
//   phone: z.string()
//     .regex(/^\d{10,15}$/, "Phone must be 10–15 digits"),
  
//   city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  
//   propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  
//   bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),
  
//   purpose: z.enum(["Buy", "Rent"]),
  
//   budgetMin: z.preprocess(
//     (val) => {
//       if (val === "" || val == null || val === undefined) return undefined;
//       const num = Number(val);
//       return isNaN(num) ? undefined : num;
//     },
//     z.number().int().positive().optional()
//   ),
  
//   budgetMax: z.preprocess(
//     (val) => {
//       if (val === "" || val == null || val === undefined) return undefined;
//       const num = Number(val);
//       return isNaN(num) ? undefined : num;
//     },
//     z.number().int().positive().optional()
//   ),
  
//   timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
  
//   source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
  
//   status: z.enum([
//     "New",
//     "Qualified", 
//     "Contacted",
//     "Visited",
//     "Negotiation",
//     "Converted",
//     "Dropped"
//   ]).default("New"),
  
//   notes: z.string()
//     .max(1000, "Notes must not exceed 1000 characters")
//     .optional()
//     .transform(val => val === "" ? undefined : val),
  
//   tags: z.array(z.string()).default([]),
  
//   // These fields are optional for form usage
//   id: z.string().uuid().optional(),
//   ownerId: z.string().uuid().optional(),
//   updatedAt: z.date().optional(),
// })
// .refine(
//   (data) => {
//     if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
//       return data.budgetMax >= data.budgetMin;
//     }
//     return true;
//   },
//   { 
//     message: "Budget max must be ≥ budget min", 
//     path: ["budgetMax"] 
//   }
// )
// .refine(
//   (data) => {
//     // Handle undefined propertyType safely
//     if (!data.propertyType) return true;
//     const needsBhk = ["Apartment", "Villa"].includes(data.propertyType);
//     return !needsBhk || data.bhk !== undefined;
//   },
//   { 
//     message: "BHK is required for Apartment/Villa", 
//     path: ["bhk"] 
//   }
// );

// export type BuyerFormValues = z.infer<typeof buyerFormSchema>


// Form schema without ID for new entries
export const newBuyerFormSchema = buyerFormSchema.omit({ id: true, updatedAt: true });
export type NewBuyerFormValues = z.infer<typeof newBuyerFormSchema>;