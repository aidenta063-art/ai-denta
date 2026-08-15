-- CreateTable
CREATE TABLE "ComparisonRow" (
    "id" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "freeValueEn" TEXT NOT NULL,
    "freeValueAr" TEXT NOT NULL,
    "paidValueEn" TEXT NOT NULL,
    "paidValueAr" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ComparisonRow_pkey" PRIMARY KEY ("id")
);
