-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('natural_person', 'juridical_person');

-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'ruc';

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "contact_type" "ContactType" NOT NULL DEFAULT 'natural_person',
ADD COLUMN     "country" VARCHAR(100) NOT NULL DEFAULT 'EC',
ADD COLUMN     "legal_name" VARCHAR(100),
ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "passengers" ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "country" VARCHAR(100);
