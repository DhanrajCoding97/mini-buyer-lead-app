import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buyers, insertBuyerSchema } from '@/drizzle/schema';
import { eq, like, or, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import {
  cityEnum,
  propertyTypeEnum,
  statusEnum,
  timelineEnum,
} from '@/drizzle/schema';
import { parseEnumParam } from '@/helpers/enumHelper';

export async function GET(request: NextRequest) {
  try {
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

    // Build base query with dynamic mode
    let query = db
      .select()
      .from(buyers)
      .orderBy(desc(buyers.updatedAt))
      .$dynamic();

    // Apply filters conditionally
    if (city) {
      query = query.where(eq(buyers.city, city));
    }
    if (propertyType) {
      query = query.where(eq(buyers.propertyType, propertyType));
    }
    if (status) {
      query = query.where(eq(buyers.status, status));
    }
    if (timeline) {
      query = query.where(eq(buyers.timeline, timeline));
    }
    if (search) {
      query = query.where(
        or(
          like(buyers.fullName, `%${search}%`),
          like(buyers.phone, `%${search}%`),
          like(buyers.email, `%${search}%`),
        ),
      );
    }

    // Execute query with pagination
    const results = await query.limit(pageSize).offset(offset);

    // Build count query with same filters
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(buyers)
      .$dynamic();

    // Apply same filters to count query
    if (city) {
      countQuery = countQuery.where(eq(buyers.city, city));
    }
    if (propertyType) {
      countQuery = countQuery.where(eq(buyers.propertyType, propertyType));
    }
    if (status) {
      countQuery = countQuery.where(eq(buyers.status, status));
    }
    if (timeline) {
      countQuery = countQuery.where(eq(buyers.timeline, timeline));
    }
    if (search) {
      countQuery = countQuery.where(
        or(
          like(buyers.fullName, `%${search}%`),
          like(buyers.phone, `%${search}%`),
          like(buyers.email, `%${search}%`),
        ),
      );
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

//POST - Create new Buyer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validated = insertBuyerSchema.parse({
      ...body,
      ownerId: uuidv4(),
    });

    const [newBuyer] = await db.insert(buyers).values(validated).returning();

    return NextResponse.json(newBuyer, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
