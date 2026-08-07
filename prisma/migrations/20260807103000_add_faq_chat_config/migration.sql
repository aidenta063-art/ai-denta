-- CreateTable
CREATE TABLE "FaqChatConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "questions" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "FaqChatConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FaqChatConfig" ADD CONSTRAINT "FaqChatConfig_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
