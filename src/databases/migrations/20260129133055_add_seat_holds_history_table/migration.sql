-- CreateTable
CREATE TABLE "seat_holds_history" (
    "id" TEXT NOT NULL,
    "outbound_seat_hold_id" TEXT,
    "return_seat_hold_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seat_holds_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seat_holds_history_outbound_seat_hold_id_idx" ON "seat_holds_history"("outbound_seat_hold_id");

-- CreateIndex
CREATE INDEX "seat_holds_history_return_seat_hold_id_idx" ON "seat_holds_history"("return_seat_hold_id");

-- CreateIndex
CREATE INDEX "seat_holds_history_created_at_idx" ON "seat_holds_history"("created_at");

-- AddForeignKey
ALTER TABLE "seat_holds_history" ADD CONSTRAINT "seat_holds_history_outbound_seat_hold_id_fkey" FOREIGN KEY ("outbound_seat_hold_id") REFERENCES "seat_holds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_holds_history" ADD CONSTRAINT "seat_holds_history_return_seat_hold_id_fkey" FOREIGN KEY ("return_seat_hold_id") REFERENCES "seat_holds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
