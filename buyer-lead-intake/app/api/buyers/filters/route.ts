import { NextRequest, NextResponse } from 'next/server';
import { cityEnum, propertyTypeEnum, statusEnum, timelineEnum } from '@/drizzle/schema';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    cities: cityEnum.enumValues,
    propertyTypes: propertyTypeEnum.enumValues,
    statuses: statusEnum.enumValues,
    timelines: timelineEnum.enumValues,
  });
}