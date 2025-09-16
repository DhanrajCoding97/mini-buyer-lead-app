import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq, like, or, asc, desc, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { buyers } from '@/drizzle/schema';
import Papa from 'papaparse';
import { parseEnumParam } from '@/helpers/enumHelper';
import { 
  cityEnum,
  propertyTypeEnum,
  statusEnum,
  timelineEnum
} from '@/drizzle/schema';

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error ? null : user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Get the same filters as the main buyers list
    const city = parseEnumParam(searchParams.get('city'), cityEnum.enumValues);
    const propertyType = parseEnumParam(
      searchParams.get('propertyType'),
      propertyTypeEnum.enumValues,
    );
    const status = parseEnumParam(
      searchParams.get('status'),
      statusEnum.enumValues,
    );
    const timeline = parseEnumParam(
      searchParams.get('timeline'),
      timelineEnum.enumValues,
    );
    const search = searchParams.get('search');
    const sortParam = searchParams.get('sort') || 'updatedDesc';

    // Build conditions array (same logic as main GET endpoint)
    const conditions = [];
    
    if (city) conditions.push(eq(buyers.city, city));
    if (propertyType) conditions.push(eq(buyers.propertyType, propertyType));
    if (status) conditions.push(eq(buyers.status, status));
    if (timeline) conditions.push(eq(buyers.timeline, timeline));
    if (search) {
      conditions.push(
        or(
          like(buyers.fullName, `%${search}%`),
          like(buyers.phone, `%${search}%`),
          like(buyers.email, `%${search}%`),
        )
      );
    }

    let query = db.select().from(buyers).$dynamic();
    
    // Apply all conditions together using AND
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    switch (sortParam) {
      case 'updatedAsc':
        query = query.orderBy(asc(buyers.updatedAt));
        break;
      case 'updatedDesc':
        query = query.orderBy(desc(buyers.updatedAt));
        break;
      case 'budgetAsc':
        query = query.orderBy(asc(buyers.budgetMin));
        break;
      case 'budgetDesc':
        query = query.orderBy(desc(buyers.budgetMax));
        break;
      case 'nameAsc':
        query = query.orderBy(asc(buyers.fullName));
        break;
      case 'nameDesc':
        query = query.orderBy(desc(buyers.fullName));
        break;
      default:
        query = query.orderBy(desc(buyers.updatedAt));
    }

    const results = await query;

    // Convert to CSV format (exact format as specified in assignment)
    const csvData = results.map(buyer => ({
      fullName: buyer.fullName,
      email: buyer.email || '',
      phone: buyer.phone,
      city: buyer.city,
      propertyType: buyer.propertyType,
      bhk: buyer.bhk || '',
      purpose: buyer.purpose,
      budgetMin: buyer.budgetMin || '',
      budgetMax: buyer.budgetMax || '',
      timeline: buyer.timeline,
      source: buyer.source,
      notes: buyer.notes || '',
      tags: buyer.tags ? buyer.tags.join(',') : '',
      status: buyer.status
    }));

    // Generate CSV
    const csv = Papa.unparse(csvData);
    
    // Return CSV with proper headers
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="buyer-leads-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}