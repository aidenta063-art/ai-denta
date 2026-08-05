-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "locationEn" TEXT NOT NULL,
    "locationAr" TEXT NOT NULL,
    "storyEn" TEXT NOT NULL,
    "storyAr" TEXT NOT NULL,
    "services" JSONB NOT NULL,
    "photoMediaId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Doctor_isActive_idx" ON "Doctor"("isActive");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_photoMediaId_fkey" FOREIGN KEY ("photoMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
