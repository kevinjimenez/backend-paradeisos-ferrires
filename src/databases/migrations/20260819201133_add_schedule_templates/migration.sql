-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "schedule_template_id" TEXT;

-- CreateTable
CREATE TABLE "schedule_templates" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "ferry_id" TEXT NOT NULL,
    "departure_hour" INTEGER NOT NULL,
    "departure_minute" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "schedule_templates" ADD CONSTRAINT "schedule_templates_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_templates" ADD CONSTRAINT "schedule_templates_ferry_id_fkey" FOREIGN KEY ("ferry_id") REFERENCES "ferries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_schedule_template_id_fkey" FOREIGN KEY ("schedule_template_id") REFERENCES "schedule_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
