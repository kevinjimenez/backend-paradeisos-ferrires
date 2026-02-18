/*
  Warnings:

  - You are about to drop the column `user_id` on the `seat_holds` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "seat_holds" DROP CONSTRAINT "seat_holds_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_user_id_fkey";

-- AlterTable
ALTER TABLE "seat_holds" DROP COLUMN "user_id",
ADD COLUMN     "contact_id" TEXT;

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "user_id",
ADD COLUMN     "contacts_id" TEXT;

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "document_number" VARCHAR(50) NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contacts_email_key" ON "contacts"("email");

-- AddForeignKey
ALTER TABLE "seat_holds" ADD CONSTRAINT "seat_holds_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_contacts_id_fkey" FOREIGN KEY ("contacts_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
