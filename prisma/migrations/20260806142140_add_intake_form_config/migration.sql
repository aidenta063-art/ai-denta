-- CreateTable
CREATE TABLE "IntakeFormConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "steps" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "IntakeFormConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IntakeFormConfig" ADD CONSTRAINT "IntakeFormConfig_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
