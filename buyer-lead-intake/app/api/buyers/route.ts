import { NextRequest, NextResponse } from "next/server";
import {db} from '@/lib/db';
import { buyers,insertBuyerSchema } from "@/drizzle/schema";
import { v4 as uuidv4 } from 'uuid';

//GET route - List all buyers
export async function GET() {
    try{
        const allBuyers = await db.select().from(buyers);
        return NextResponse.json(allBuyers);
    }
    catch(error) {
        return NextResponse.json({error: 'Failed to fetch buyers'}, {status: 500})
    }
}

//POST - Create new Buyer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validated = insertBuyerSchema.parse({
            ...body,
            ownerId: uuidv4()
        });

        const [newBuyer] = await db.insert(buyers).values(validated).returning();

        return NextResponse.json(newBuyer, {status: 201});
    } catch(error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({error: message}, {status: 400});
    }
}