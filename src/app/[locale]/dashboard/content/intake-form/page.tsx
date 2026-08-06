import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import { getIntakeFormSteps } from "@/services/content/intake-form.service";
import { IntakeFormBuilder } from "@/components/dashboard/intake-form-builder";

export default async function IntakeFormContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const steps = await getIntakeFormSteps();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          Booking Form Questions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Steps and questions shown in the qualification form, after name /
          phone / email, on both the free and paid booking flows.
        </p>
      </div>

      <IntakeFormBuilder locale={locale} initialSteps={steps} />
    </div>
  );
}
