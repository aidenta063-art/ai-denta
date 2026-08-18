-- CreateTable
CREATE TABLE "EbookSettings" (
    "id" TEXT NOT NULL DEFAULT 'patient-flow',
    "priceCents" INTEGER NOT NULL DEFAULT 49900,
    "currency" TEXT NOT NULL DEFAULT 'EGP',

    CONSTRAINT "EbookSettings_pkey" PRIMARY KEY ("id")
);
