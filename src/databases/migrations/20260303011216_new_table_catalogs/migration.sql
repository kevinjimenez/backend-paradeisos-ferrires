-- CreateTable
CREATE TABLE "catalogs" (
    "id" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalogs_code_key" ON "catalogs"("code");
