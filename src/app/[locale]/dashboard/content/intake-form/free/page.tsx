import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireRole } from "@/lib/authz";
import { Role, ConsultationKind } from "@/generated/prisma/enums";
import { getIntakeFormSteps } from "@/services/content/intake-form.service";
import { IntakeFormBuilder } from "@/components/dashboard/intake-form-builder";

export default async function FreeIntakeFormContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const steps = await getIntakeFormSteps(ConsultationKind.FREE);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          Free Booking Form Questions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Steps and questions shown in the qualification form, after name /
          phone / email, on the free consultation booking flow.
        </p>
      </div>

      <IntakeFormBuilder
        locale={locale}
        kind={ConsultationKind.FREE}
        initialSteps={steps}
      />
    </div>
  );
}
