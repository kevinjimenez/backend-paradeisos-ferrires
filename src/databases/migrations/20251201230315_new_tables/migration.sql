-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('dni', 'passport');

-- CreateEnum
CREATE TYPE "FerryStatus" AS ENUM ('active', 'maintenance', 'retired');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('scheduled', 'boarding', 'in_transit', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'partial_refund');

-- CreateEnum
CREATE TYPE "SeatHoldsStatus" AS ENUM ('held', 'confirmed', 'expired', 'released');

-- CreateEnum
CREATE TYPE "TicketsTripType" AS ENUM ('one_way', 'round_trip');

-- CreateEnum
CREATE TYPE "TicketsStatus" AS ENUM ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'refunded', 'expired');

-- CreateTable
CREATE TABLE "islands" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "islands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ports" (
    "id" TEXT NOT NULL,
    "islands_id" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "address" VARCHAR(255),
    "contact_phone" VARCHAR(20),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "opening_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closing_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "origin_port_id" TEXT NOT NULL,
    "destination_port_id" TEXT NOT NULL,
    "distance_km" DECIMAL(6,2),
    "duration_minutes" INTEGER NOT NULL,
    "base_price_resident" DECIMAL(10,2) NOT NULL,
    "base_price_national" DECIMAL(10,2) NOT NULL,
    "base_price_foreign" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ferries" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "register_code" VARCHAR(30) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "operator_name" VARCHAR(100) NOT NULL,
    "operator_phone" VARCHAR(20),
    "operator_email" VARCHAR(255),
    "year_built" INTEGER,
    "amenities" JSONB NOT NULL DEFAULT '{}',
    "status" "FerryStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ferries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "routes_id" TEXT,
    "ferries_id" TEXT,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "total_capacity" INTEGER NOT NULL,
    "available_seats" INTEGER NOT NULL,
    "cancellation_reason" TEXT,
    "notes" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "document_number" VARCHAR(50) NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passengers" (
    "id" TEXT NOT NULL,
    "tickets_id" TEXT,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "document_number" VARCHAR(50) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "checked_in_outbound" BOOLEAN NOT NULL DEFAULT false,
    "checked_in_return" BOOLEAN NOT NULL DEFAULT false,
    "checked_in_outbound_at" TIMESTAMP(3),
    "checked_in_return_at" TIMESTAMP(3),
    "document_type" "DocumentType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "tickets_id" TEXT,
    "payment_provider" VARCHAR(50) NOT NULL,
    "provider_transaction_id" VARCHAR(255),
    "provider_payment_intent" VARCHAR(255),
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "error_code" VARCHAR(50),
    "error_message" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "paid_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "refunded_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "refund_amount" DECIMAL(10,2),
    "refund_text" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "payment_method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_holds" (
    "id" TEXT NOT NULL,
    "users_id" TEXT,
    "schedules_id" TEXT,
    "quantity" INTEGER NOT NULL,
    "status" "SeatHoldsStatus" NOT NULL DEFAULT 'held',
    "held_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seat_holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "users_Id" TEXT,
    "return_schedules_id" TEXT,
    "outbound_schedules_id" TEXT,
    "ticket_code" VARCHAR(20) NOT NULL,
    "trip_type" "TicketsTripType" NOT NULL,
    "total_passengers" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxes" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "service_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "qr_code" TEXT,
    "cancellation_reason" TEXT,
    "status" "TicketsStatus" NOT NULL DEFAULT 'pending',
    "booking_expires_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "outbound_hold_id" TEXT,
    "return_hold_id" TEXT,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "islands_code_key" ON "islands"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ports_code_key" ON "ports"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ferries_register_code_key" ON "ferries"("register_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticket_code_key" ON "tickets"("ticket_code");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_outbound_hold_id_key" ON "tickets"("outbound_hold_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_return_hold_id_key" ON "tickets"("return_hold_id");

-- AddForeignKey
ALTER TABLE "ports" ADD CONSTRAINT "ports_islands_id_fkey" FOREIGN KEY ("islands_id") REFERENCES "islands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_origin_port_id_fkey" FOREIGN KEY ("origin_port_id") REFERENCES "ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_destination_port_id_fkey" FOREIGN KEY ("destination_port_id") REFERENCES "ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_routes_id_fkey" FOREIGN KEY ("routes_id") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_ferries_id_fkey" FOREIGN KEY ("ferries_id") REFERENCES "ferries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_tickets_id_fkey" FOREIGN KEY ("tickets_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tickets_id_fkey" FOREIGN KEY ("tickets_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_holds" ADD CONSTRAINT "seat_holds_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_holds" ADD CONSTRAINT "seat_holds_schedules_id_fkey" FOREIGN KEY ("schedules_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_users_Id_fkey" FOREIGN KEY ("users_Id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_return_schedules_id_fkey" FOREIGN KEY ("return_schedules_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_outbound_schedules_id_fkey" FOREIGN KEY ("outbound_schedules_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_outbound_hold_id_fkey" FOREIGN KEY ("outbound_hold_id") REFERENCES "seat_holds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_return_hold_id_fkey" FOREIGN KEY ("return_hold_id") REFERENCES "seat_holds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
