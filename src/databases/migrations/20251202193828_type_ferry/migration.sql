-- CreateEnum
CREATE TYPE "FerryType" AS ENUM ('normal', 'premium', 'fast');

-- AlterTable
ALTER TABLE "ferries" ADD COLUMN     "type" "FerryType" NOT NULL DEFAULT 'normal';
