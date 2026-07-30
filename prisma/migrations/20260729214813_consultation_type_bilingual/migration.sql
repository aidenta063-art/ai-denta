-- Add bilingual columns
ALTER TABLE "ConsultationType" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "ConsultationType" ADD COLUMN "nameAr" TEXT;
ALTER TABLE "ConsultationType" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "ConsultationType" ADD COLUMN "descriptionAr" TEXT;

-- Backfill: English columns from the old single-language data, Arabic
-- columns with the known seed translations for the two existing rows.
UPDATE "ConsultationType" SET
  "nameEn" = "name",
  "descriptionEn" = "description";

UPDATE "ConsultationType" SET
  "nameAr" = 'استشارة مجانية',
  "descriptionAr" = 'مكالمة استشارة سريعة بدون أي تكلفة.'
WHERE "kind" = 'FREE';

UPDATE "ConsultationType" SET
  "nameAr" = 'استشارة مدفوعة',
  "descriptionAr" = 'جلسة استراتيجية مفصلة.'
WHERE "kind" = 'PAID';

-- Enforce required columns
ALTER TABLE "ConsultationType" ALTER COLUMN "nameEn" SET NOT NULL;
ALTER TABLE "ConsultationType" ALTER COLUMN "nameAr" SET NOT NULL;

-- Drop old single-language columns
ALTER TABLE "ConsultationType" DROP COLUMN "name";
ALTER TABLE "ConsultationType" DROP COLUMN "description";
