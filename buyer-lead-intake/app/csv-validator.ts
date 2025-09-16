import { z } from "zod";

// CSV Row Schema
const csvRowSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10-15 digits"),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional().or(z.literal("")),
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.string().optional().or(z.literal("")),
  budgetMax: z.string().optional().or(z.literal("")),
  timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
  source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
  notes: z.string().max(1000).optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  status: z
    .enum([
      "New",
      "Qualified",
      "Contacted",
      "Visited",
      "Negotiation",
      "Converted",
      "Dropped",
    ])
    .optional()
    .or(z.literal("")),
});

type CsvRow = z.infer<typeof csvRowSchema>;

export function validateCsvRow(row: unknown) {
  const errors: string[] = [];

  try {
    const parsed: CsvRow = csvRowSchema.parse(row);

    // Convert budgets to numbers
    let budgetMin: number | undefined;
    let budgetMax: number | undefined;

    if (parsed.budgetMin && parsed.budgetMin !== "") {
      budgetMin = parseInt(parsed.budgetMin);
      if (isNaN(budgetMin) || budgetMin < 0) {
        errors.push("budgetMin must be a valid positive number");
      }
    }

    if (parsed.budgetMax && parsed.budgetMax !== "") {
      budgetMax = parseInt(parsed.budgetMax);
      if (isNaN(budgetMax) || budgetMax < 0) {
        errors.push("budgetMax must be a valid positive number");
      }
    }

    // Budget range check
    if (budgetMin && budgetMax && budgetMax < budgetMin) {
      errors.push("budgetMax must be greater than or equal to budgetMin");
    }

    // BHK required for Apartment/Villa
    if (["Apartment", "Villa"].includes(parsed.propertyType) && !parsed.bhk) {
      errors.push("bhk is required for Apartment and Villa properties");
    }

    if (errors.length > 0) {
      return { valid: false, errors, data: null };
    }

    return {
      valid: true,
      errors: [],
      data: {
        fullName: parsed.fullName,
        email: parsed.email || undefined,
        phone: parsed.phone,
        city: parsed.city,
        propertyType: parsed.propertyType,
        bhk: parsed.bhk || undefined,
        purpose: parsed.purpose,
        budgetMin,
        budgetMax,
        timeline: parsed.timeline,
        source: parsed.source,
        notes: parsed.notes || undefined,
        tags: parsed.tags
          ? parsed.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        status: parsed.status || "New",
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.issues.map((err) => `${err.path.join(".")}: ${err.message}`),
        data: null,
      };
    }
    return { valid: false, errors: ["Unknown validation error"], data: null };
  }
}
