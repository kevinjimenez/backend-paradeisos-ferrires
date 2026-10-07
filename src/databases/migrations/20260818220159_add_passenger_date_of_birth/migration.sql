/*
  Warnings:

  - Added the required column `date_of_birth` to the `passengers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "passengers" ADD COLUMN     "date_of_birth" DATE NOT NULL;
