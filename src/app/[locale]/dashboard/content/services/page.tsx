import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listServices } from "@/services/content/cms.service";
import { deleteServiceAction } from "@/actions/dashboard/content/services";
import { ServiceForm } from "@/components/dashboard/service-form";

export default async function ServicesContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const services = await listServices();
  const removeAction = deleteServiceAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Services</h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/content" locale={locale} />}
        >
          Back to content
        </Button>
      </div>

      {services.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No services yet — the homepage is showing its built-in defaults
          until you add one below.
        </p>
      )}

      {services.map((service) => (
        <Card key={service.id}>
          <CardHeader>
            <CardTitle className="text-base">{service.nameEn}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ServiceForm locale={locale} service={service} />
            <form action={removeAction.bind(null, service.id)}>
              <Button size="sm" variant="destructive" type="submit">
                Delete
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a service</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
