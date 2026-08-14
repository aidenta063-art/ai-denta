-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable
ALTER TABLE "ConsultationType" ADD COLUMN     "discountEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
ADD COLUMN     "discountValue" INTEGER NOT NULL DEFAULT 0;
