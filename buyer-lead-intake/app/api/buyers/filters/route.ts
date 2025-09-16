import { NextRequest, NextResponse } from 'next/server';
import { cityEnum, propertyTypeEnum, statusEnum, timelineEnum } from '@/drizzle/schema';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    cities: cityEnum.enumValues,
    propertyTypes: propertyTypeEnum.enumValues,
    statuses: statusEnum.enumValues,
    timelines: timelineEnum.enumValues,
  });
}