-- CreateEnum
CREATE TYPE "FareType" AS ENUM ('light', 'basic', 'premium');

-- AlterTable
ALTER TABLE "passengers" ADD COLUMN     "fare_id" TEXT;

-- CreateTable
CREATE TABLE "fares" (
    "id" TEXT NOT NULL,
    "name" "FareType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fare_extras" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fare_extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger_extras" (
    "id" TEXT NOT NULL,
    "passenger_id" TEXT NOT NULL,
    "extra_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passenger_extras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fares_name_key" ON "fares"("name");

-- CreateIndex
CREATE UNIQUE INDEX "fare_extras_code_key" ON "fare_extras"("code");

-- CreateIndex
CREATE INDEX "passenger_extras_passenger_id_idx" ON "passenger_extras"("passenger_id");

-- AddForeignKey
ALTER TABLE "passenger_extras" ADD CONSTRAINT "passenger_extras_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passengers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_extras" ADD CONSTRAINT "passenger_extras_extra_id_fkey" FOREIGN KEY ("extra_id") REFERENCES "fare_extras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_fare_id_fkey" FOREIGN KEY ("fare_id") REFERENCES "fares"("id") ON DELETE SET NULL ON UPDATE CASCADE;
