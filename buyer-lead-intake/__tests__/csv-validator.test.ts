import { validateCsvRow } from "@/app/csv-validator";

describe("CSV Row Validator", () => {
  // ✅ Valid row
  it("should validate a correct row", () => {
    const validRow = {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "2",
      purpose: "Buy",
      budgetMin: "5000000",
      budgetMax: "7000000",
      timeline: "0-3m",
      source: "Website",
      notes: "Looking for 2BHK",
      tags: "urgent,family",
      status: "New",
    };

    const result = validateCsvRow(validRow);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data?.budgetMin).toBe(5000000);
    expect(result.data?.budgetMax).toBe(7000000);
    expect(result.data?.tags).toEqual(["urgent", "family"]);
  });

  // ✅ Invalid phone
  it("should reject invalid phone number", () => {
    const invalidRow = {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "123",
      city: "Mohali",
      propertyType: "Villa",
      bhk: "3",
      purpose: "Rent",
      budgetMin: "100000",
      budgetMax: "200000",
      timeline: "3-6m",
      source: "Referral",
      notes: "",
      tags: "",
      status: "New",
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("phone: Phone must be 10-15 digits");
  });

  // ✅ BHK requirement
  it("should require BHK for Apartment", () => {
    const invalidRow = {
      fullName: "Test User",
      email: "test@example.com",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "",
      purpose: "Buy",
      budgetMin: "",
      budgetMax: "",
      timeline: "0-3m",
      source: "Website",
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "bhk is required for Apartment and Villa properties"
    );
  });

  it("should require BHK for Villa", () => {
    const invalidRow = {
      fullName: "Villa User",
      email: "villa@example.com",
      phone: "9876543210",
      city: "Mohali",
      propertyType: "Villa",
      bhk: "",
      purpose: "Buy",
      budgetMin: "100000",
      budgetMax: "200000",
      timeline: "3-6m",
      source: "Call",
      notes: "",
      tags: "",
      status: "New",
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "bhk is required for Apartment and Villa properties"
    );
  });

  it("should allow missing BHK for Plot/Office/Retail", () => {
    const validRow = {
      fullName: "Plot User",
      email: "plot@example.com",
      phone: "9876543210",
      city: "Zirakpur",
      propertyType: "Plot",
      bhk: "",
      purpose: "Buy",
      budgetMin: "1000000",
      budgetMax: "2000000",
      timeline: "Exploring",
      source: "Referral",
      notes: "",
      tags: "",
      status: "New",
    };

    const result = validateCsvRow(validRow);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // ✅ Budget validations
  it("should reject if budgetMax < budgetMin", () => {
    const invalidRow = {
      fullName: "Budget Error",
      email: "",
      phone: "9876543210",
      city: "Mohali",
      propertyType: "Apartment",
      bhk: "2",
      purpose: "Buy",
      budgetMin: "200000",
      budgetMax: "100000",
      timeline: "0-3m",
      source: "Walk-in",
      notes: "",
      tags: "",
      status: "New",
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "budgetMax must be greater than or equal to budgetMin"
    );
  });

  it("should reject invalid budget numbers", () => {
    const invalidRow = {
      fullName: "Budget Invalid",
      email: "",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Plot",
      bhk: "",
      purpose: "Buy",
      budgetMin: "abc",
      budgetMax: "-500",
      timeline: "0-3m",
      source: "Website",
      notes: "",
      tags: "",
      status: "New",
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("budgetMin must be a valid positive number");
    expect(result.errors).toContain("budgetMax must be a valid positive number");
  });

  // ✅ Email validation
  it("should reject invalid email format", () => {
    const invalidRow = {
      fullName: "Email Test",
      email: "not-an-email",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Villa",
      bhk: "3",
      purpose: "Buy",
      budgetMin: "100000",
      budgetMax: "200000",
      timeline: "3-6m",
      source: "Call",
      notes: "",
      tags: "",
      status: "New",
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("email"))).toBe(true);
  });

  // ✅ Missing required city
  it("should reject missing city", () => {
    const invalidRow = {
      fullName: "No City",
      email: "",
      phone: "9876543210",
      city: "", // Missing
      propertyType: "Apartment",
      bhk: "2",
      purpose: "Buy",
      budgetMin: "50000",
      budgetMax: "100000",
      timeline: "Exploring",
      source: "Referral",
      notes: "",
      tags: "",
      status: "New",
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("city"))).toBe(true);
  });

  // ✅ Handle empty optional fields
  it("should handle empty optional fields and default status", () => {
    const validRow = {
      fullName: "Jane Smith",
      email: "", // Empty email
      phone: "9876543210",
      city: "Mohali",
      propertyType: "Plot",
      bhk: "",
      purpose: "Buy",
      budgetMin: "",
      budgetMax: "",
      timeline: "Exploring",
      source: "Referral",
      notes: "",
      tags: "",
      status: "",
    };

    const result = validateCsvRow(validRow);
    expect(result.valid).toBe(true);
    expect(result.data?.email).toBeUndefined();
    expect(result.data?.status).toBe("New"); // Default
  });
});
