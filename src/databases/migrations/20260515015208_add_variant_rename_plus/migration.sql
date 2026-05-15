-- DropIndex
DROP INDEX "fares_name_key";

-- AlterTable: cast name from enum to varchar, add variant
ALTER TABLE "fares"
  ALTER COLUMN "name" TYPE VARCHAR(50) USING "name"::TEXT::VARCHAR(50),
  ADD COLUMN "variant" TEXT NOT NULL DEFAULT 'primary';

-- CreateIndex
CREATE UNIQUE INDEX "fares_name_key" ON "fares"("name");

-- DropEnum
DROP TYPE "FareType";
