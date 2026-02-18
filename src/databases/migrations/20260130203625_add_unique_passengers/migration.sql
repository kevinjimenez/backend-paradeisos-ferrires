/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `passengers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[document_number]` on the table `passengers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "passengers_email_key" ON "passengers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "passengers_document_number_key" ON "passengers"("document_number");
