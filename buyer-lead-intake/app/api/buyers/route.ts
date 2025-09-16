import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq, like, or, asc, desc, sql, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { 
  buyers, 
  insertBuyerSchema, 
  buyerHistory,
  cityEnum,
  propertyTypeEnum,
  statusEnum,
  timelineEnum
} from '@/drizzle/schema';
import { parseEnumParam } from '@/helpers/enumHelper';
import { createRateLimiter, getClientIdentifier } from '@/lib/rateLimiter';

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

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const offset = (page - 1) * pageSize;

    // Filters
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

    // Sorting
    const sortParam = searchParams.get('sort') || 'updatedDesc';

    // Build conditions array
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

    // Build base query
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

    // Execute query with pagination
    const results = await query.limit(pageSize).offset(offset);

    // Build count query with same conditions
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(buyers).$dynamic();
    
    // Apply same conditions to count query
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    
    const [{ count }] = await countQuery;

    return NextResponse.json({
      data: results,
      pagination: {
        page,
        pageSize,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / pageSize),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Create new Buyer
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting check using the new method
    const clientId = getClientIdentifier(request, user.id);
    const rateLimit = createRateLimiter.checkRateLimit(clientId);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimit.retryAfter
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString()
          }
        }
      );
    }

    const body = await request.json();

    const validated = insertBuyerSchema.parse({
      ...body,
      ownerId: user.id,
    });

    const [newBuyer] = await db.insert(buyers).values(validated).returning();

    // Create history entry
    await db.insert(buyerHistory).values({
      buyerId: newBuyer.id,
      changedBy: user.id,
      diff: { 
        action: 'created', 
        changes: validated,
        user: user.email || 'Unknown'
      },
    });

    // Add rate limit headers to successful response
    return NextResponse.json(newBuyer, { 
      status: 201,
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString()
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}