-- CreateEnum
CREATE TYPE "EbookOrderStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "EbookOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "status" "EbookOrderStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "manuallyMarkedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EbookOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EbookOrder_userId_idx" ON "EbookOrder"("userId");

-- CreateIndex
CREATE INDEX "EbookOrder_status_idx" ON "EbookOrder"("status");

-- AddForeignKey
ALTER TABLE "EbookOrder" ADD CONSTRAINT "EbookOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EbookOrder" ADD CONSTRAINT "EbookOrder_manuallyMarkedByUserId_fkey" FOREIGN KEY ("manuallyMarkedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
