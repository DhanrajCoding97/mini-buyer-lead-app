import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buyers, buyerHistory, insertBuyerSchema } from '@/drizzle/schema';
import { createClient } from '@/lib/supabase/server';
import { eq } from 'drizzle-orm';
import { updateRateLimiter, getClientIdentifier } from '@/lib/rateLimiter';
export type Buyer = typeof buyers.$inferSelect;  // what comes back from db
export type BuyerInsert = typeof buyers.$inferInsert; // for inserts
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting check
    const clientId = getClientIdentifier(request, user.id);
    const rateLimit = updateRateLimiter.checkRateLimit(clientId);

    console.log(`Rate limit status for ${clientId}:`, {
      allowed: rateLimit.allowed,
      remaining: rateLimit.remaining,
      retryAfter: rateLimit.retryAfter
    });

    if (!rateLimit.allowed) {
      console.log(`Rate limit status for ${clientId}:`, {
        allowed: rateLimit.allowed,
        remaining: rateLimit.remaining,
        retryAfter: rateLimit.retryAfter
      });
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfter?.toString() || "60",
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": Math.ceil(rateLimit.resetTime / 1000).toString(),
          },
        },
      );
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
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // Check ownership
    if (currentBuyer.ownerId !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own leads" },
        { status: 403 },
      );
    }

    // Concurrency check
    if (
      clientUpdatedAt &&
      new Date(clientUpdatedAt).getTime() !==
        currentBuyer.updatedAt.getTime()
    ) {
      return NextResponse.json(
        {
          error: "Record changed, please refresh the page and try again",
          code: "STALE_DATA",
        },
        { status: 409 },
      );
    }

    // Validate update data
    const validated = insertBuyerSchema.partial().parse(updateData);

    // Track changes for history
    type Buyer = typeof buyers.$inferSelect;
    const changes: Partial<
      Record<
        keyof Buyer,
        { old: Buyer[keyof Buyer]; new: Buyer[keyof Buyer] }
      >
    > = {};

    (Object.keys(validated) as (keyof Buyer)[]).forEach((key) => {
      const newValue = validated[key];
      if (newValue !== undefined) {
        const oldValue = currentBuyer[key];
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          changes[key] = { old: oldValue, new: newValue };
        }
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
          action: "updated",
          changes,
          user: user.email || "Unknown",
        },
      });
    }

    // Add rate limit headers to successful response
    return NextResponse.json(updatedBuyer, {
      headers: {
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": Math.ceil(rateLimit.resetTime / 1000).toString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}



// export async function PUT(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> },
// ) {
//   try {
//     const user = await getCurrentUser();
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Rate limiting check
//     const clientId = getClientIdentifier(request, user.id);
//     if (updateRateLimiter.isRateLimited(clientId)) {
//       const resetTime = updateRateLimiter.getResetTime(clientId);
//       const resetTimeSeconds = Math.ceil((resetTime - Date.now()) / 1000);

//       return NextResponse.json(
//         {
//           error: "Too many requests. Please try again later.",
//           retryAfter: resetTimeSeconds,
//         },
//         {
//           status: 429,
//           headers: {
//             "Retry-After": resetTimeSeconds.toString(),
//             "X-RateLimit-Limit": "10",
//             "X-RateLimit-Remaining": "0",
//             "X-RateLimit-Reset": resetTime.toString(),
//           },
//         },
//       );
//     }

//     const { id } = await context.params;
//     const body = await request.json();
//     const { updatedAt: clientUpdatedAt, ...updateData } = body;

//     // Get current buyer for ownership and concurrency check
//     const [currentBuyer] = await db
//       .select()
//       .from(buyers)
//       .where(eq(buyers.id, id))
//       .limit(1);

//     if (!currentBuyer) {
//       return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
//     }

//     // Check ownership
//     if (currentBuyer.ownerId !== user.id) {
//       return NextResponse.json(
//         { error: "You can only edit your own leads" },
//         { status: 403 },
//       );
//     }

//     // Concurrency check
//     if (
//       clientUpdatedAt &&
//       new Date(clientUpdatedAt).getTime() !==
//         currentBuyer.updatedAt.getTime()
//     ) {
//       return NextResponse.json(
//         {
//           error: "Record changed, please refresh the page and try again",
//           code: "STALE_DATA",
//         },
//         { status: 409 },
//       );
//     }

//     // Validate update data
//     const validated = insertBuyerSchema.partial().parse(updateData);

//     // Track changes for history
//     type Buyer = typeof buyers.$inferSelect;

//     const changes: Partial<
//       Record<
//         keyof Buyer,
//         { old: Buyer[keyof Buyer]; new: Buyer[keyof Buyer] }
//       >
//     > = {};

//     (Object.keys(validated) as (keyof Buyer)[]).forEach((key) => {
//       const newValue = validated[key];
//       if (newValue !== undefined) {
//         const oldValue = currentBuyer[key];
//         if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
//           changes[key] = { old: oldValue, new: newValue };
//         }
//       }
//     });

//     const [updatedBuyer] = await db
//       .update(buyers)
//       .set({ ...validated, updatedAt: new Date() })
//       .where(eq(buyers.id, id))
//       .returning();

//     // Log changes in history
//     if (Object.keys(changes).length > 0) {
//       await db.insert(buyerHistory).values({
//         buyerId: updatedBuyer.id,
//         changedBy: user.id,
//         diff: {
//           action: "updated",
//           changes,
//           user: user.email || "Unknown",
//         },
//       });
//     }

//     // Add rate limit headers to successful response
//     const remaining = updateRateLimiter.getRemainingRequests(clientId);
//     const resetTime = updateRateLimiter.getResetTime(clientId);

//     return NextResponse.json(updatedBuyer, {
//       headers: {
//         "X-RateLimit-Limit": "10",
//         "X-RateLimit-Remaining": remaining.toString(),
//         "X-RateLimit-Reset": resetTime.toString(),
//       },
//     });
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json({ error: message }, { status: 400 });
//   }
// }


//DELETE route to delete a buyer
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