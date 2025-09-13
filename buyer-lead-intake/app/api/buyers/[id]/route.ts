import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buyers, insertBuyerSchema } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

//Get route to fetch single buyer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const [buyer] = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, params.id))
      .limit(1);

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }
    return NextResponse.json(buyer);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buyer' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();

    const validated = insertBuyerSchema.partial().parse(body);

    const [updatedBuyer] = await db
      .update(buyers)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(buyers.id, params.id))
      .returning();

    if (!updatedBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }
    return NextResponse.json(updatedBuyer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const [deletedBuyer] = await db
      .delete(buyers)
      .where(eq(buyers.id, params.id))
      .returning();

    if (!deletedBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Buyer deleted successfully',
      deletedBuyer, // Return the deleted buyer data
    });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    return NextResponse.json(
      { error: 'Failed to delete buyer' },
      { status: 500 },
    );
  }
}
