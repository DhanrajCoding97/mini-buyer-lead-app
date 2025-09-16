-- First, update existing data to use valid enum values
UPDATE "buyers" SET "city" = 'Other' WHERE "city" IN ('Mumbai', 'Bangalore', 'Delhi', 'Chennai');

-- Convert city column to text temporarily
ALTER TABLE "buyers" ALTER COLUMN "city" SET DATA TYPE text;

-- Drop the old enum
DROP TYPE "public"."city";

-- Create the new enum with updated values
CREATE TYPE "public"."city" AS ENUM('Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other');

-- Convert back to the new enum type
ALTER TABLE "buyers" ALTER COLUMN "city" SET DATA TYPE "public"."city" USING "city"::"public"."city";