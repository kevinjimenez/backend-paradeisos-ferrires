/*
  Warnings:

  - Added the required column `destination_port_id` to the `routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin_port_id` to the `routes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "bookings_status_expires_at_idx";

-- DropIndex
DROP INDEX "routes_status_idx";

-- DropIndex
DROP INDEX "schedules_status_idx";

-- DropIndex
DROP INDEX "tickets_ticket_number_qr_code_status_idx";

-- DropIndex
DROP INDEX "trips_departure_date_status_idx";

-- AlterTable
ALTER TABLE "booking_passengers" ADD COLUMN     "bookings_id" TEXT,
ADD COLUMN     "seats_id" TEXT;

-- AlterTable
ALTER TABLE "booking_vehicles" ADD COLUMN     "bookings_id" TEXT;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "trips_id" TEXT,
ADD COLUMN     "users_id" TEXT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "bookings_id" TEXT,
ADD COLUMN     "users_id" TEXT;

-- AlterTable
ALTER TABLE "routes" ADD COLUMN     "destination_port_id" TEXT NOT NULL,
ADD COLUMN     "origin_port_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "ferries_id" TEXT,
ADD COLUMN     "routes_id" TEXT;

-- AlterTable
ALTER TABLE "seat_configurations" ADD COLUMN     "ferries_id" TEXT;

-- AlterTable
ALTER TABLE "seats" ADD COLUMN     "seat_configurations_id" TEXT;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "bookings_id" TEXT;

-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "ferries_id" TEXT,
ADD COLUMN     "routes_id" TEXT,
ADD COLUMN     "schedules_id" TEXT;

-- CreateIndex
CREATE INDEX "booking_passengers_bookings_id_seats_id_idx" ON "booking_passengers"("bookings_id", "seats_id");

-- CreateIndex
CREATE INDEX "booking_vehicles_bookings_id_idx" ON "booking_vehicles"("bookings_id");

-- CreateIndex
CREATE INDEX "bookings_status_users_id_idx" ON "bookings"("status", "users_id");

-- CreateIndex
CREATE INDEX "bookings_trips_id_expires_at_idx" ON "bookings"("trips_id", "expires_at");

-- CreateIndex
CREATE INDEX "notifications_users_id_idx" ON "notifications"("users_id");

-- CreateIndex
CREATE INDEX "routes_status_origin_port_id_destination_port_id_idx" ON "routes"("status", "origin_port_id", "destination_port_id");

-- CreateIndex
CREATE INDEX "schedules_status_routes_id_ferries_id_idx" ON "schedules"("status", "routes_id", "ferries_id");

-- CreateIndex
CREATE INDEX "seat_configurations_ferries_id_idx" ON "seat_configurations"("ferries_id");

-- CreateIndex
CREATE INDEX "seats_seat_configurations_id_idx" ON "seats"("seat_configurations_id");

-- CreateIndex
CREATE INDEX "tickets_ticket_number_qr_code_idx" ON "tickets"("ticket_number", "qr_code");

-- CreateIndex
CREATE INDEX "tickets_bookings_id_status_idx" ON "tickets"("bookings_id", "status");

-- CreateIndex
CREATE INDEX "trips_departure_date_status_routes_id_idx" ON "trips"("departure_date", "status", "routes_id");

-- CreateIndex
CREATE INDEX "trips_ferries_id_schedules_id_idx" ON "trips"("ferries_id", "schedules_id");

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_origin_port_id_fkey" FOREIGN KEY ("origin_port_id") REFERENCES "ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_destination_port_id_fkey" FOREIGN KEY ("destination_port_id") REFERENCES "ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_routes_id_fkey" FOREIGN KEY ("routes_id") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_ferries_id_fkey" FOREIGN KEY ("ferries_id") REFERENCES "ferries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_ferries_id_fkey" FOREIGN KEY ("ferries_id") REFERENCES "ferries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_routes_id_fkey" FOREIGN KEY ("routes_id") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_schedules_id_fkey" FOREIGN KEY ("schedules_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_configurations" ADD CONSTRAINT "seat_configurations_ferries_id_fkey" FOREIGN KEY ("ferries_id") REFERENCES "ferries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_seat_configurations_id_fkey" FOREIGN KEY ("seat_configurations_id") REFERENCES "seat_configurations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_trips_id_fkey" FOREIGN KEY ("trips_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passengers" ADD CONSTRAINT "booking_passengers_seats_id_fkey" FOREIGN KEY ("seats_id") REFERENCES "seats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passengers" ADD CONSTRAINT "booking_passengers_bookings_id_fkey" FOREIGN KEY ("bookings_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_vehicles" ADD CONSTRAINT "booking_vehicles_bookings_id_fkey" FOREIGN KEY ("bookings_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_bookings_id_fkey" FOREIGN KEY ("bookings_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_bookings_id_fkey" FOREIGN KEY ("bookings_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
