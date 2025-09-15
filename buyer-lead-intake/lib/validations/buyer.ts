import { z } from "zod"
export const buyerFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(80),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10-15 digits"),
  city: z.enum(["Mumbai", "Bangalore", "Delhi", "Chennai", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),  
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
  source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
  notes: z.string().max(1000).optional(),
  tags: z.string().optional(),
}).refine(
  (data) => !data.budgetMax || !data.budgetMin || data.budgetMax >= data.budgetMin,
  { message: "Budget max must be >= budget min", path: ["budgetMax"] }
).refine(
  (data) => {
    const needsBhk = ["Apartment", "Villa"].includes(data.propertyType);
    return !needsBhk || data.bhk;  
  },
  { message: "BHK required for Apartment/Villa", path: ["bhk"] }
)

export type BuyerFormValues = z.infer<typeof buyerFormSchema>
