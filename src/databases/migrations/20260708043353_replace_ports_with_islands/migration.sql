/*
  Warnings:

  - You are about to drop the column `base_price_foreign` on the `routes` table. All the data in the column will be lost.
  - You are about to drop the column `base_price_national` on the `routes` table. All the data in the column will be lost.
  - You are about to drop the column `base_price_resident` on the `routes` table. All the data in the column will be lost.
  - You are about to drop the column `destination_port_id` on the `routes` table. All the data in the column will be lost.
  - You are about to drop the column `origin_port_id` on the `routes` table. All the data in the column will be lost.
  - You are about to drop the `ports` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `base_price` to the `routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination_island_id` to the `routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin_island_id` to the `routes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ports" DROP CONSTRAINT "ports_island_id_fkey";

-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_destination_port_id_fkey";

-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_origin_port_id_fkey";

-- AlterTable
ALTER TABLE "routes" DROP COLUMN "base_price_foreign",
DROP COLUMN "base_price_national",
DROP COLUMN "base_price_resident",
DROP COLUMN "destination_port_id",
DROP COLUMN "origin_port_id",
ADD COLUMN     "base_price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "destination_island_id" TEXT NOT NULL,
ADD COLUMN     "origin_island_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "ports";

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_origin_island_id_fkey" FOREIGN KEY ("origin_island_id") REFERENCES "islands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_destination_island_id_fkey" FOREIGN KEY ("destination_island_id") REFERENCES "islands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
