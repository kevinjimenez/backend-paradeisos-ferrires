/*
  Warnings:

  - A unique constraint covering the columns `[document_number]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "contacts_document_number_key" ON "contacts"("document_number");
