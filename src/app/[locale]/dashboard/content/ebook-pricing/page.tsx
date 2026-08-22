import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEbookPricing } from "@/services/ebook/ebook.service";
import { EbookPriceForm } from "@/components/dashboard/ebook-price-form";

export default async function EbookPricingContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const { priceCents, discountEnabled, discountType, discountValue } =
    await getEbookPricing();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Ebook Pricing
        </h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/content" locale={locale} />}
        >
          Back to content
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Patient Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <EbookPriceForm
            locale={locale}
            priceEgp={priceCents / 100}
            discountEnabled={discountEnabled}
            discountType={discountType}
            discountValue={discountValue}
          />
        </CardContent>
      </Card>
    </div>
  );
}
