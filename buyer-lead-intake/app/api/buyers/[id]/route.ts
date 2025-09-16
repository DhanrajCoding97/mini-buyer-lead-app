import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buyers,buyerHistory, insertBuyerSchema } from '@/drizzle/schema';
import { createClient } from '@/lib/supabase/server';
import { eq } from 'drizzle-orm';

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error ? null : user;
}

//Get route to fetch single buyer
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {

    const { id } = await context.params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [buyer] = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, id))
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

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { id: string } },
// ) {
//   try {
//     const body = await request.json();

//     const validated = insertBuyerSchema.partial().parse(body);

//     const [updatedBuyer] = await db
//       .update(buyers)
//       .set({ ...validated, updatedAt: new Date() })
//       .where(eq(buyers.id, params.id))
//       .returning();

//     if (!updatedBuyer) {
//       return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
//     }
//     return NextResponse.json(updatedBuyer);
//   } catch (error) {
//     const message = error instanceof Error ? error.message : 'Unknown error';
//     return NextResponse.json({ error: message }, { status: 400 });
//   }
// }

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { updatedAt: clientUpdatedAt, ...updateData } = body;

    // Get current buyer for ownership and concurrency check
    const [currentBuyer] = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, id))
      .limit(1);

    if (!currentBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Check ownership - users can only edit their own leads
    if (currentBuyer.ownerId !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own leads' }, { status: 403 });
    }

    // Concurrency check
    if (clientUpdatedAt && new Date(clientUpdatedAt).getTime() !== currentBuyer.updatedAt.getTime()) {
      return NextResponse.json({ 
        error: 'Record changed, please refresh the page and try again',
        code: 'STALE_DATA' 
      }, { status: 409 });
    }

    const validated = insertBuyerSchema.partial().parse(updateData);

    // Track changes for history
    const changes: Record<string, { old: any, new: any }> = {};
    Object.keys(validated).forEach(key => {
      const newValue = validated[key as keyof typeof validated];
      const oldValue = currentBuyer[key as keyof typeof currentBuyer];
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    const [updatedBuyer] = await db
      .update(buyers)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(buyers.id, id))
      .returning();

    // Log changes in history
    if (Object.keys(changes).length > 0) {
      await db.insert(buyerHistory).values({
        buyerId: updatedBuyer.id,
        changedBy: user.id,
        diff: { 
          action: 'updated', 
          changes,
          user: user.email || 'Unknown'
        },
      });
    }

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } },
// ) {
//   try {
//     const [deletedBuyer] = await db
//       .delete(buyers)
//       .where(eq(buyers.id, params.id))
//       .returning();

//     if (!deletedBuyer) {
//       return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
//     }

//     return NextResponse.json({
//       message: 'Buyer deleted successfully',
//       deletedBuyer, // Return the deleted buyer data
//     });
//   } catch (error) {
//     console.error('Error deleting buyer:', error);
//     return NextResponse.json(
//       { error: 'Failed to delete buyer' },
//       { status: 500 },
//     );
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> },
// ) {
//   try {
//     const user = await getCurrentUser();
//     if (!user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const {id} = await context.params;

//     // Check ownership before deleting
//     const [currentBuyer] = await db
//       .select()
//       .from(buyers)
//       .where(eq(buyers.id, id))
//       .limit(1);

//     if (!currentBuyer) {
//       return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
//     }

//     if (currentBuyer.ownerId !== user.id) {
//       return NextResponse.json({ error: 'You can only delete your own leads' }, { status: 403 });
//     }

//     const [deletedBuyer] = await db
//       .delete(buyers)
//       .where(eq(buyers.id, id))
//       .returning();

//     return NextResponse.json({
//       message: 'Buyer deleted successfully',
//       deletedBuyer,
//     });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to delete buyer' }, { status: 500 });
//   }
// }
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // unwrap params (UUID string)
    const { id } = await context.params;
    const buyerId = id;

    if (!buyerId || typeof buyerId !== "string") {
      return NextResponse.json({ error: "Invalid buyer id" }, { status: 400 });
    }

    // Check ownership before deleting
    const [currentBuyer] = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, buyerId))
      .limit(1);

    if (!currentBuyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    if (currentBuyer.ownerId !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own leads" },
        { status: 403 }
      );
    }

    // --- 🔥 Manual cascade deletes ---
    // delete related buyer history
    await db.delete(buyerHistory).where(eq(buyerHistory.buyerId, buyerId));

    // if you have other dependent tables, do the same here
    // e.g. await db.delete(buyerNotes).where(eq(buyerNotes.buyerId, buyerId));

    // --- finally delete buyer ---
    const [deletedBuyer] = await db
      .delete(buyers)
      .where(eq(buyers.id, buyerId))
      .returning();

    return NextResponse.json({
      message: "Buyer deleted successfully",
      deletedBuyer,
    });
  } catch (error) {
    console.error("DELETE /buyers/[id] error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
