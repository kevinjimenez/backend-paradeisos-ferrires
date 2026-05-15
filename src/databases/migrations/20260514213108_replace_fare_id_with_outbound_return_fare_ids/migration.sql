-- AlterTable passengers: replace fare_id with outbound_fare_id and return_fare_id
ALTER TABLE "passengers" RENAME COLUMN "fare_id" TO "outbound_fare_id";

ALTER TABLE "passengers" ADD COLUMN "return_fare_id" TEXT;

-- DropForeignKey (old unnamed constraint will be recreated with named relations)
ALTER TABLE "passengers" DROP CONSTRAINT IF EXISTS "passengers_fare_id_fkey";

-- AddForeignKey for outbound_fare
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_outbound_fare_id_fkey" FOREIGN KEY ("outbound_fare_id") REFERENCES "fares"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for return_fare
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_return_fare_id_fkey" FOREIGN KEY ("return_fare_id") REFERENCES "fares"("id") ON DELETE SET NULL ON UPDATE CASCADE;