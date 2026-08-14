import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listConsultationTypes } from "@/services/content/cms.service";
import { PricingForm } from "@/components/dashboard/pricing-form";

export default async function PricingContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const consultationTypes = await listConsultationTypes();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Pricing</h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/content" locale={locale} />}
        >
          Back to content
        </Button>
      </div>

      {consultationTypes.map((ct) => (
        <Card key={ct.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {ct.kind === "FREE" ? "Free Consultation" : "Paid Consultation"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PricingForm
              locale={locale}
              kind={ct.kind}
              defaults={{
                nameEn: ct.nameEn,
                nameAr: ct.nameAr,
                descriptionEn: ct.descriptionEn ?? "",
                descriptionAr: ct.descriptionAr ?? "",
                priceCents: ct.priceCents,
                durationMinutes: ct.durationMinutes,
                discountEnabled: ct.discountEnabled,
                discountType: ct.discountType,
                discountValue: ct.discountValue,
              }}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
