import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buyers } from '@/drizzle/schema';

export async function GET() {
  try {
    const result = await db.select().from(buyers).limit(1);
    return NextResponse.json({ success: true, count: result.length });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message });
    }
    return NextResponse.json({ error: String(error) });
  }
}
