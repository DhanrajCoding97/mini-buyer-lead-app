import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';

// CSV Row Schema (extracted from your API route)
const csvRowSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
  bhk: z.enum(['1', '2', '3', '4', 'Studio']).optional().or(z.literal('')),
  purpose: z.enum(['Buy', 'Rent']),
  budgetMin: z.string().optional().or(z.literal('')),
  budgetMax: z.string().optional().or(z.literal('')),
  timeline: z.enum(['0-3m', '3-6m', '>6m', 'Exploring']),
  source: z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']),
  notes: z.string().max(1000).optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
  status: z.enum([
    'New',
    'Qualified',
    'Contacted',
    'Visited',
    'Negotiation',
    'Converted',
    'Dropped'
  ]).optional().or(z.literal(''))
});

export function validateCsvRow(row: any) {
  const errors: string[] = [];
  
  try {
    const parsed = csvRowSchema.parse(row);

    // Convert string numbers to integers
    let budgetMin: number | undefined;
    let budgetMax: number | undefined;
    
    if (parsed.budgetMin && parsed.budgetMin !== '') {
      budgetMin = parseInt(parsed.budgetMin);
      if (isNaN(budgetMin) || budgetMin < 0) {
        errors.push('budgetMin must be a valid positive number');
      }
    }
    
    if (parsed.budgetMax && parsed.budgetMax !== '') {
      budgetMax = parseInt(parsed.budgetMax);
      if (isNaN(budgetMax) || budgetMax < 0) {
        errors.push('budgetMax must be a valid positive number');
      }
    }
    
    // Validate budget range
    if (budgetMin && budgetMax && budgetMax < budgetMin) {
      errors.push('budgetMax must be greater than or equal to budgetMin');
    }
    
    // ✅ Validate BHK requirement (only Apartment/Villa)
    if (['Apartment', 'Villa'].includes(parsed.propertyType) && !parsed.bhk) {
      errors.push('bhk is required for Apartment and Villa properties');
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
        tags: parsed.tags ? parsed.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        status: parsed.status || 'New'
      }
    };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      return { valid: false, errors: fieldErrors, data: null };
    }
    return { valid: false, errors: ['Unknown validation error'], data: null };
  }
}

describe('CSV Row Validator', () => {
  it('should validate a correct row', () => {
    const validRow = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: '2',
      purpose: 'Buy',
      budgetMin: '5000000',
      budgetMax: '7000000',
      timeline: '0-3m',
      source: 'Website',
      notes: 'Looking for 2BHK',
      tags: 'urgent,family',
      status: 'New'
    };

    const result = validateCsvRow(validRow);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toBeDefined();
    expect(result.data?.budgetMin).toBe(5000000);
    expect(result.data?.budgetMax).toBe(7000000);
    expect(result.data?.tags).toEqual(['urgent', 'family']);
  });

  it('should reject invalid phone number', () => {
    const invalidRow = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '123', // Invalid phone
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: '2',
      purpose: 'Buy',
      budgetMin: '',
      budgetMax: '',
      timeline: '0-3m',
      source: 'Website',
      notes: '',
      tags: '',
      status: 'New'
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('phone: Phone must be 10-15 digits');
  });

  it('should require BHK for apartments', () => {
    const invalidRow = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: '', // Missing BHK
      purpose: 'Buy',
      budgetMin: '',
      budgetMax: '',
      timeline: '0-3m',
      source: 'Website',
      notes: '',
      tags: '',
      status: 'New'
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('bhk is required for Apartment and Villa properties');
  });

  it('should require BHK for villas', () => {
    const invalidRow = {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '9876543210',
      city: 'Mohali',
      propertyType: 'Villa',
      bhk: '', // Missing BHK
      purpose: 'Buy',
      budgetMin: '100000',
      budgetMax: '200000',
      timeline: '3-6m',
      source: 'Call',
      notes: '',
      tags: '',
      status: 'New'
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('bhk is required for Apartment and Villa properties');
  });

  it('should allow missing BHK for Plot/Office/Retail', () => {
    const validRow = {
      fullName: 'Plot User',
      email: 'plot@example.com',
      phone: '9876543210',
      city: 'Zirakpur',
      propertyType: 'Plot', // ✅ Not Apartment/Villa
      bhk: '', // Allowed
      purpose: 'Buy',
      budgetMin: '1000000',
      budgetMax: '2000000',
      timeline: 'Exploring',
      source: 'Referral',
      notes: '',
      tags: '',
      status: 'New'
    };

    const result = validateCsvRow(validRow);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate budget range', () => {
    const invalidRow = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      city: 'Chandigarh',
      propertyType: 'Plot',
      bhk: '',
      purpose: 'Buy',
      budgetMin: '7000000', // Higher than max
      budgetMax: '5000000',
      timeline: '0-3m',
      source: 'Website',
      notes: '',
      tags: '',
      status: 'New'
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('budgetMax must be greater than or equal to budgetMin');
  });

  it('should handle empty optional fields', () => {
    const validRow = {
      fullName: 'Jane Smith',
      email: '', // Empty email
      phone: '9876543210',
      city: 'Mohali',
      propertyType: 'Plot',
      bhk: '', // ✅ Allowed
      purpose: 'Buy',
      budgetMin: '',
      budgetMax: '',
      timeline: 'Exploring',
      source: 'Referral',
      notes: '',
      tags: '',
      status: ''
    };

    const result = validateCsvRow(validRow);
    expect(result.valid).toBe(true);
    expect(result.data?.email).toBeUndefined();
    expect(result.data?.status).toBe('New'); // Default
  });

  // --- Extra edge cases ---

  it('should reject invalid email format', () => {
    const invalidRow = {
      fullName: 'Test User',
      email: 'invalid-email',
      phone: '9876543210',
      city: 'Chandigarh',
      propertyType: 'Villa',
      bhk: '3',
      purpose: 'Buy',
      budgetMin: '100000',
      budgetMax: '200000',
      timeline: '3-6m',
      source: 'Call',
      notes: '',
      tags: '',
      status: 'New'
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('email'))).toBe(true);
  });

  it('should reject if budgetMin is greater than budgetMax', () => {
    const invalidRow = {
      fullName: 'Budget Error',
      email: '',
      phone: '9876543210',
      city: 'Mohali',
      propertyType: 'Apartment',
      bhk: '2',
      purpose: 'Buy',
      budgetMin: '200000',
      budgetMax: '100000', // Invalid range
      timeline: '0-3m',
      source: 'Walk-in',
      notes: '',
      tags: '',
      status: 'New'
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('budgetMax must be greater than or equal to budgetMin');
  });

  it('should reject missing required city', () => {
    const invalidRow = {
      fullName: 'No City',
      email: '',
      phone: '9876543210',
      city: '', // Missing city
      propertyType: 'Apartment',
      bhk: '2',
      purpose: 'Buy',
      budgetMin: '50000',
      budgetMax: '100000',
      timeline: 'Exploring',
      source: 'Referral',
      notes: '',
      tags: '',
      status: 'New'
    };

    const result = validateCsvRow(invalidRow);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('city'))).toBe(true);
  });
});
