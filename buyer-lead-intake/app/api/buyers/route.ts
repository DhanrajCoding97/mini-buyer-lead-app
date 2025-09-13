import { NextRequest, NextResponse } from "next/server";
import {db} from '@/lib/db';
import { buyers,insertBuyerSchema } from "@/drizzle/schema";

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