-- AlterTable
ALTER TABLE "EbookOrder" ADD COLUMN     "provider" "PaymentProviderName" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "providerPayload" JSONB,
ADD COLUMN     "providerRefId" TEXT;

-- CreateIndex
CREATE INDEX "EbookOrder_provider_providerRefId_idx" ON "EbookOrder"("provider", "providerRefId");
