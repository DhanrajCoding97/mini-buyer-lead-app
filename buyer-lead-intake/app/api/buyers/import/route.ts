// // import { NextRequest, NextResponse } from 'next/server';
// // import { db } from '@/lib/db';
// // import { createClient } from '@/lib/supabase/server';
// // import { buyers, buyerHistory } from '@/drizzle/schema';
// // import Papa from 'papaparse';
// // import { z } from 'zod';

// // async function getCurrentUser() {
// //   const supabase = await createClient();
// //   const { data: { user }, error } = await supabase.auth.getUser();
// //   return error ? null : user;
// // }

// // // CSV Row Schema - matches the exact format from assignment
// // const csvRowSchema = z.object({
// //   fullName: z.string().min(2).max(80),
// //   email: z.string().email().optional().or(z.literal('')),
// //   phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
// //   city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
// //   propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
// //   bhk: z.enum(['1', '2', '3', '4', 'Studio']).optional().or(z.literal('')),
// //   purpose: z.enum(['Buy', 'Rent']),
// //   budgetMin: z.string().optional().or(z.literal('')),
// //   budgetMax: z.string().optional().or(z.literal('')),
// //   timeline: z.enum(['0-3m', '3-6m', '>6m', 'Exploring']),
// //   source: z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']),
// //   notes: z.string().max(1000).optional().or(z.literal('')),
// //   tags: z.string().optional().or(z.literal('')), // Will be split by comma
// //   status: z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']).optional().or(z.literal(''))
// // });

// // type CsvRow = z.infer<typeof csvRowSchema>;

// // type ValidatedCsvRow = {
// //   fullName: string;
// //   email?: string;
// //   phone: string;
// //   city: string;
// //   propertyType: string;
// //   bhk?: string;
// //   purpose: string;
// //   budgetMin?: number;
// //   budgetMax?: number;
// //   timeline: string;
// //   source: string;
// //   notes?: string;
// //   tags: string[];
// //   status: string;
// // };

// // // function validateCsvRow(row: CsvRow, rowIndex: number) {
// // //   const errors: string[] = [];
  
// // //   try {
// // //     // Parse and validate basic fields
// // //     const parsed = csvRowSchema.parse(row);
    
// // //     // Convert string numbers to integers
// // //     let budgetMin: number | undefined;
// // //     let budgetMax: number | undefined;
    
// // //     if (parsed.budgetMin && parsed.budgetMin !== '') {
// // //       budgetMin = parseInt(parsed.budgetMin);
// // //       if (isNaN(budgetMin) || budgetMin < 0) {
// // //         errors.push('budgetMin must be a valid positive number');
// // //       }
// // //     }
    
// // //     if (parsed.budgetMax && parsed.budgetMax !== '') {
// // //       budgetMax = parseInt(parsed.budgetMax);
// // //       if (isNaN(budgetMax) || budgetMax < 0) {
// // //         errors.push('budgetMax must be a valid positive number');
// // //       }
// // //     }
    
// // //     // Validate budget range
// // //     if (budgetMin && budgetMax && budgetMax < budgetMin) {
// // //       errors.push('budgetMax must be greater than or equal to budgetMin');
// // //     }
    
// // //     // Validate BHK requirement
// // //     if (['Apartment', 'Villa'].includes(parsed.propertyType) && !parsed.bhk) {
// // //       errors.push('bhk is required for Apartment and Villa properties');
// // //     }
    
// // //     // Parse tags
// // //     const tags = parsed.tags ? parsed.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    
// // //     if (errors.length > 0) {
// // //       return { valid: false, errors, data: null };
// // //     }
    
// // //     // Return valid data in the format expected by the database
// // //     return {
// // //       valid: true,
// // //       errors: [],
// // //       data: {
// // //         fullName: parsed.fullName,
// // //         email: parsed.email || undefined,
// // //         phone: parsed.phone,
// // //         city: parsed.city,
// // //         propertyType: parsed.propertyType,
// // //         bhk: parsed.bhk || undefined,
// // //         purpose: parsed.purpose,
// // //         budgetMin,
// // //         budgetMax,
// // //         timeline: parsed.timeline,
// // //         source: parsed.source,
// // //         notes: parsed.notes || undefined,
// // //         tags,
// // //         status: parsed.status || 'New'
// // //       }
// // //     };
    
// // //   } catch (error) {
// // //     if (error instanceof z.ZodError) {
// // //       const fieldErrors = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
// // //       return { valid: false, errors: fieldErrors, data: null };
// // //     }
// // //     return { valid: false, errors: ['Unknown validation error'], data: null };
// // //   }
// // // }
// // function validateCsvRow(row: CsvRow, rowIndex: number): {
// //   valid: boolean;
// //   errors: string[];
// //   data: ValidatedCsvRow | null;
// // 	} {
// //   const errors: string[] = [];
  
// //   try {
// //     const parsed = csvRowSchema.parse(row);
  
// //     let budgetMin: number | undefined;
// //     let budgetMax: number | undefined;

// //     if (parsed.budgetMin && parsed.budgetMin !== '') {
// //     budgetMin = parseInt(parsed.budgetMin);
// //     if (isNaN(budgetMin) || budgetMin < 0) {
// //        errors.push('budgetMin must be a valid positive number');
// //       }
// //     }
  
// //     if (parsed.budgetMax && parsed.budgetMax !== '') {
// //       budgetMax = parseInt(parsed.budgetMax);
// //       if (isNaN(budgetMax) || budgetMax < 0) {
// //         errors.push('budgetMax must be a valid positive number');
// //       }
// //     }
  
// //     if (budgetMin && budgetMax && budgetMax < budgetMin) {
// //       errors.push('budgetMax must be greater than or equal to budgetMin');
// //     }
  
// //     if (['Apartment', 'Villa'].includes(parsed.propertyType) && !parsed.bhk) {
// //       errors.push('bhk is required for Apartment and Villa properties');
// //     }
  
// //     const tags = parsed.tags
// //     	? parsed.tags.split(',').map(t => t.trim()).filter(t => t)
// //     	: [];
  
// //     if (errors.length > 0) {
// //       return { valid: false, errors, data: null };
// //     }
  
// //     return {
// //       valid: true,
// //       errors: [],
// //       data: {
// //         fullName: parsed.fullName,
// //         email: parsed.email || undefined,
// //         phone: parsed.phone,
// //         city: parsed.city,
// //         propertyType: parsed.propertyType,
// //         bhk: parsed.bhk || undefined,
// //         purpose: parsed.purpose,
// //         budgetMin,
// //         budgetMax,
// //         timeline: parsed.timeline,
// //         source: parsed.source,
// //         notes: parsed.notes || undefined,
// //         tags,
// //          status: parsed.status || 'New'
// //       }
// //     };
// //   } catch (error) {
// //       if (error instanceof z.ZodError) {
// //         const fieldErrors = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
// //         return { valid: false, errors: fieldErrors, data: null };
// //       }
// //       return { valid: false, errors: ['Unknown validation error'], data: null };
// //     }
// //   }

// // export async function POST(request: NextRequest) {
// //   try {
// //     const user = await getCurrentUser();
// //     if (!user) {
// //       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// //     }

// //     const formData = await request.formData();
// //     const file = formData.get('file') as File;
    
// //     if (!file) {
// //       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
// //     }
    
// //     if (!file.name.endsWith('.csv')) {
// //       return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
// //     }

// //     const text = await file.text();
    
// //     // Parse CSV
// //     const parsed = Papa.parse(text, {
// //       header: true,
// //       skipEmptyLines: true,
// //       transformHeader: (header) => header.trim()
// //     });

// //     if (parsed.errors.length > 0) {
// //       return NextResponse.json({ 
// //         error: 'CSV parsing failed', 
// //         details: parsed.errors 
// //       }, { status: 400 });
// //     }

// //     // Check row limit
// //     if (parsed.data.length > 200) {
// //       return NextResponse.json({ 
// //         error: 'Maximum 200 rows allowed' 
// //       }, { status: 400 });
// //     }

// //     // Validate each row
// //     const results: {
// // 			total: number;
// // 			valid: number;
// // 			invalid: number;
// // 			errors: Array<{ row: number; errors: string[] }>;
// // 			validData: ValidatedCsvRow[];
// // 		} = {
// // 			total: parsed.data.length,
// // 			valid: 0,
// // 			invalid: 0,
// // 			errors: [],
// // 			validData: []
// // 		};
		
// // 		parsed.data.forEach((row, index) => {
// // 			const typedRow = row as CsvRow; // assert the type here
// // 			const validation = validateCsvRow(typedRow, index + 1);
		
// // 			if (validation.valid && validation.data) {
// // 				results.valid++;
// // 				results.validData.push({
// // 					...validation.data,
// // 					ownerId: user.id
// // 				});
// // 			} else {
// // 				results.invalid++;
// // 				results.errors.push({
// // 					row: index + 2,
// // 					errors: validation.errors
// // 				});
// // 			}
// // 		});

// //     // If there are valid rows, insert them in a transaction
// //     if (results.validData.length > 0) {
// //       await db.transaction(async (tx) => {
// //         // Insert all valid buyers
// //         const insertedBuyers = await tx.insert(buyers).values(results.validData).returning();
        
// //         // Create history entries for each
// //         const historyEntries = insertedBuyers.map(buyer => ({
// //           buyerId: buyer.id,
// //           changedBy: user.id,
// //           diff: {
// //             action: 'imported',
// //             changes: buyer,
// //             user: user.email || 'Unknown'
// //           }
// //         }));
        
// //         await tx.insert(buyerHistory).values(historyEntries);
// //       });
// //     }

// //     return NextResponse.json({
// //       message: `Import completed. ${results.valid} valid rows imported, ${results.invalid} rows had errors.`,
// //       results: {
// //         total: results.total,
// //         imported: results.valid,
// //         errors: results.invalid,
// //         errorDetails: results.errors
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Import error:', error);
// //     const message = error instanceof Error ? error.message : 'Unknown error';
// //     return NextResponse.json({ error: message }, { status: 500 });
// //   }
// // }

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// import { createClient } from '@/lib/supabase/server';
// import { buyers, buyerHistory } from '@/drizzle/schema';
// import Papa from 'papaparse';
// import { z } from 'zod';

// async function getCurrentUser() {
//   const supabase = await createClient();
//   const { data: { user }, error } = await supabase.auth.getUser();
//   return error ? null : user;
// }

// // CSV Row Schema - matches the exact format from assignment
// const csvRowSchema = z.object({
//   fullName: z.string().min(2).max(80),
//   email: z.string().email().optional().or(z.literal('')),
//   phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
//   city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
//   propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
//   bhk: z.enum(['1', '2', '3', '4', 'Studio']).optional().or(z.literal('')),
//   purpose: z.enum(['Buy', 'Rent']),
//   budgetMin: z.string().optional().or(z.literal('')),
//   budgetMax: z.string().optional().or(z.literal('')),
//   timeline: z.enum(['0-3m', '3-6m', '>6m', 'Exploring']),
//   source: z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']),
//   notes: z.string().max(1000).optional().or(z.literal('')),
//   tags: z.string().optional().or(z.literal('')), // Will be split by comma
//   status: z.enum([
//     'New',
//     'Qualified',
//     'Contacted',
//     'Visited',
//     'Negotiation',
//     'Converted',
//     'Dropped'
//   ]).optional().or(z.literal(''))
// });

// type CsvRow = z.infer<typeof csvRowSchema>;

// type ValidatedCsvRow = {
//   fullName: string;
//   email?: string;
//   phone: string;
//   city: string;
//   propertyType: string;
//   bhk?: string;
//   purpose: string;
//   budgetMin?: number;
//   budgetMax?: number;
//   timeline: string;
//   source: string;
//   notes?: string;
//   tags: string[];
//   status: string;
// };

// // ✅ Extend to include ownerId for DB inserts
// type ValidatedCsvRowWithOwner = ValidatedCsvRow & {
//   ownerId: string;
// };

// function validateCsvRow(row: CsvRow, rowIndex: number): {
//   valid: boolean;
//   errors: string[];
//   data: ValidatedCsvRow | null;
// } {
//   const errors: string[] = [];

//   try {
//     const parsed = csvRowSchema.parse(row);

//     let budgetMin: number | undefined;
//     let budgetMax: number | undefined;

//     if (parsed.budgetMin && parsed.budgetMin !== '') {
//       budgetMin = parseInt(parsed.budgetMin);
//       if (isNaN(budgetMin) || budgetMin < 0) {
//         errors.push('budgetMin must be a valid positive number');
//       }
//     }

//     if (parsed.budgetMax && parsed.budgetMax !== '') {
//       budgetMax = parseInt(parsed.budgetMax);
//       if (isNaN(budgetMax) || budgetMax < 0) {
//         errors.push('budgetMax must be a valid positive number');
//       }
//     }

//     if (budgetMin && budgetMax && budgetMax < budgetMin) {
//       errors.push('budgetMax must be greater than or equal to budgetMin');
//     }

//     if (['Apartment', 'Villa'].includes(parsed.propertyType) && !parsed.bhk) {
//       errors.push('bhk is required for Apartment and Villa properties');
//     }

//     const tags = parsed.tags
//       ? parsed.tags.split(',').map(t => t.trim()).filter(t => t)
//       : [];

//     if (errors.length > 0) {
//       return { valid: false, errors, data: null };
//     }

//     return {
//       valid: true,
//       errors: [],
//       data: {
//         fullName: parsed.fullName,
//         email: parsed.email || undefined,
//         phone: parsed.phone,
//         city: parsed.city,
//         propertyType: parsed.propertyType,
//         bhk: parsed.bhk || undefined,
//         purpose: parsed.purpose,
//         budgetMin,
//         budgetMax,
//         timeline: parsed.timeline,
//         source: parsed.source,
//         notes: parsed.notes || undefined,
//         tags,
//         status: parsed.status || 'New'
//       }
//     };
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       const fieldErrors = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
//       return { valid: false, errors: fieldErrors, data: null };
//     }
//     return { valid: false, errors: ['Unknown validation error'], data: null };
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = await getCurrentUser();
//     if (!user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const formData = await request.formData();
//     const file = formData.get('file') as File;

//     if (!file) {
//       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
//     }

//     if (!file.name.endsWith('.csv')) {
//       return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
//     }

//     const text = await file.text();

//     // Parse CSV
//     const parsed = Papa.parse(text, {
//       header: true,
//       skipEmptyLines: true,
//       transformHeader: (header) => header.trim()
//     });

//     if (parsed.errors.length > 0) {
//       return NextResponse.json({
//         error: 'CSV parsing failed',
//         details: parsed.errors
//       }, { status: 400 });
//     }

//     // Check row limit
//     if (parsed.data.length > 200) {
//       return NextResponse.json({
//         error: 'Maximum 200 rows allowed'
//       }, { status: 400 });
//     }

//     // Validate each row
//     const results: {
//       total: number;
//       valid: number;
//       invalid: number;
//       errors: Array<{ row: number; errors: string[] }>;
//       validData: ValidatedCsvRowWithOwner[];
//     } = {
//       total: parsed.data.length,
//       valid: 0,
//       invalid: 0,
//       errors: [],
//       validData: []
//     };

//     parsed.data.forEach((row, index) => {
//       const typedRow = row as CsvRow;
//       const validation = validateCsvRow(typedRow, index + 1);

//       if (validation.valid && validation.data) {
//         results.valid++;
//         results.validData.push({
//           ...validation.data,
//           ownerId: user.id
//         });
//       } else {
//         results.invalid++;
//         results.errors.push({
//           row: index + 2,
//           errors: validation.errors
//         });
//       }
//     });

//     // Insert valid rows
//     if (results.validData.length > 0) {
//       await db.transaction(async (tx) => {
//         // ✅ Works now because type matches buyers schema
//         const insertedBuyers = await tx.insert(buyers).values(results.validData).returning();

//         const historyEntries = insertedBuyers.map((buyer) => ({
//           buyerId: buyer.id,
//           changedBy: user.id,
//           diff: {
//             action: 'imported',
//             changes: buyer,
//             user: user.email || 'Unknown'
//           }
//         }));

//         await tx.insert(buyerHistory).values(historyEntries);
//       });
//     }

//     return NextResponse.json({
//       message: `Import completed. ${results.valid} valid rows imported, ${results.invalid} rows had errors.`,
//       results: {
//         total: results.total,
//         imported: results.valid,
//         errors: results.invalid,
//         errorDetails: results.errors
//       }
//     });

//   } catch (error) {
//     console.error('Import error:', error);
//     const message = error instanceof Error ? error.message : 'Unknown error';
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }

// /app/api/import/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { buyers, buyerHistory, insertBuyerSchema } from '@/drizzle/schema';
import { z } from 'zod';
import Papa from 'papaparse';

// Import InsertBuyer type from your schema
export type InsertBuyer = z.infer<typeof insertBuyerSchema>;

// CSV schema to validate raw CSV rows
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
  status: z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']).optional().or(z.literal('')),
});

type CsvRow = z.infer<typeof csvRowSchema>;

// ✅ Same as InsertBuyer
// type ValidatedCsvRowWithOwner = InsertBuyer;

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error ? null : user;
}

// Validate and convert CSV row to InsertBuyer
function validateCsvRow(row: CsvRow): {
  valid: boolean;
  errors: string[];
  data: Omit<InsertBuyer, 'ownerId'> | null;
} {
  const errors: string[] = [];

  try {
    const parsed = csvRowSchema.parse(row);

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

    if (budgetMin && budgetMax && budgetMax < budgetMin) {
      errors.push('budgetMax must be greater than or equal to budgetMin');
    }

    if (['Apartment', 'Villa'].includes(parsed.propertyType) && !parsed.bhk) {
      errors.push('bhk is required for Apartment and Villa properties');
    }

    const tags = parsed.tags
      ? parsed.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

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
        tags,
        status: parsed.status || 'New',
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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
    }

    const text = await file.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json({
        error: 'CSV parsing failed',
        details: parsed.errors
      }, { status: 400 });
    }

    if (parsed.data.length > 200) {
      return NextResponse.json({ error: 'Maximum 200 rows allowed' }, { status: 400 });
    }

    // ✅ Results object
    const results: {
      total: number;
      valid: number;
      invalid: number;
      errors: Array<{ row: number; errors: string[] }>;
      validData: InsertBuyer[];
    } = {
      total: parsed.data.length,
      valid: 0,
      invalid: 0,
      errors: [],
      validData: []
    };

    parsed.data.forEach((row, index) => {
      const typedRow = row as CsvRow;
      const validation = validateCsvRow(typedRow);

      if (validation.valid && validation.data) {
        results.valid++;
        results.validData.push({
          ...validation.data,
          ownerId: user.id, // ✅ added
        });
      } else {
        results.invalid++;
        results.errors.push({
          row: index + 2, // Excel-style row number
          errors: validation.errors
        });
      }
    });

    if (results.validData.length > 0) {
      await db.transaction(async (tx) => {
        const insertedBuyers = await tx.insert(buyers).values(results.validData as InsertBuyer[]).returning();

        const historyEntries = insertedBuyers.map((buyer) => ({
          buyerId: buyer.id,
          changedBy: user.id,
          diff: {
            action: 'imported',
            changes: buyer,
            user: user.email || 'Unknown',
          }
        }));

        await tx.insert(buyerHistory).values(historyEntries);
      });
    }

    return NextResponse.json({
      message: `Import completed. ${results.valid} valid rows imported, ${results.invalid} rows had errors.`,
      results: {
        total: results.total,
        imported: results.valid,
        errors: results.invalid,
        errorDetails: results.errors
      }
    });

  } catch (error) {
    console.error('Import error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
