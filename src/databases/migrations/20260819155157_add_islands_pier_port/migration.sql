/*
  Warnings:

  - Added the required column `pier_name` to the `islands` table without a default value. This is not possible if the table is not empty.
  - Added the required column `port_address` to the `islands` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "islands" ADD COLUMN     "pier_name" VARCHAR(150) NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "port_address" VARCHAR(200) NOT NULL DEFAULT 'PENDING';

-- Drop temporary defaults; existing rows get real values via `npm run db:seed`
ALTER TABLE "islands" ALTER COLUMN "pier_name" DROP DEFAULT,
ALTER COLUMN "port_address" DROP DEFAULT;
