-- Free and paid consultations now have independent question sets, so
-- the old single shared row (id = 'singleton') no longer makes sense.
-- Clear it out — admins re-enter their edits per flow going forward.
DELETE FROM "IntakeFormConfig";

-- AlterTable
ALTER TABLE "IntakeFormConfig" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "IntakeFormConfig" ADD COLUMN "kind" "ConsultationKind" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "IntakeFormConfig_kind_key" ON "IntakeFormConfig"("kind");
