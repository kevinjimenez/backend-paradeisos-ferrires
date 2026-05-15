-- AlterTable
ALTER TABLE "fare_extras" ADD COLUMN     "features" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "fares" ADD COLUMN     "features" JSONB NOT NULL DEFAULT '[]';
