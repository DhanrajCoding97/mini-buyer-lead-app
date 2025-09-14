'use server';

import { db } from '@/lib/db';
import { buyers, buyerHistory, insertBuyerSchema } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

export async function createBuyer(prevState: any, formData: FormData) {
  const rawData = {
    fullName: formData.get('fullName') as string,
    email: (formData.get('email') as string) || undefined,
    phone: formData.get('phone') as string,
    city: formData.get('city') as string,
    propertyType: formData.get('propertyType') as string,
    bhk: formData.get('bhk') as string, // Keep as string initially
    purpose: formData.get('purpose') as string,
    budgetMin: formData.get('budgetMin') ? Number(formData.get('budgetMin')) : undefined,
    budgetMax: formData.get('budgetMax') ? Number(formData.get('budgetMax')) : undefined,
    timeline: formData.get('timeline') as string,
    source: formData.get('source') as string,
    notes: (formData.get('notes') as string) || undefined,
    tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t) : [],
  };

  console.log('Raw form data:', {
    propertyType: rawData.propertyType,
    bhk: rawData.bhk
  });

  // Clean up empty strings and handle conditional BHK
  const data = {
    ...rawData,
    email: rawData.email === '' ? undefined : rawData.email,
    notes: rawData.notes === '' ? undefined : rawData.notes,
    // Handle BHK based on property type
    bhk: (() => {
      // If property type requires BHK and BHK is empty, keep it as empty string for validation error
      if (['Apartment', 'Villa'].includes(rawData.propertyType) && rawData.bhk === '') {
        return rawData.bhk; // This will cause validation to fail with proper error
      }
      // If property type doesn't require BHK or BHK has value, handle normally
      return rawData.bhk === '' ? undefined : rawData.bhk;
    })()
  };

  console.log('After cleanup:', {
    propertyType: data.propertyType,
    bhk: data.bhk
  });

  try {
    const clientSchema = insertBuyerSchema.omit({ 
      ownerId: true, 
      status: true, 
      createdAt: true, 
      updatedAt: true 
    });
    const validated = clientSchema.parse(data);

    const [newBuyer] = await db.insert(buyers).values({
      ...validated,
      ownerId: uuidv4(),
    }).returning();

    await db.insert(buyerHistory).values({
      buyerId: newBuyer.id,
      changedBy: uuidv4(),
      diff: { action: 'created', data: validated },
    });

    revalidatePath('/buyers');
    return { success: true, buyerId: newBuyer.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach(issue => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      return { errors: fieldErrors };
    }
    
    return { error: 'Failed to create buyer' };
  }
}