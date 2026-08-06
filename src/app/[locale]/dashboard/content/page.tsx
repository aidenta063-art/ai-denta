import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SECTIONS = [
  {
    href: "/dashboard/content/hero",
    title: "Homepage Hero",
    description:
      "Eyebrow, title, and subtitle shown at the top of the homepage.",
  },
  {
    href: "/dashboard/content/pricing",
    title: "Pricing",
    description:
      "Names, descriptions, price, and duration for the free and paid consultations.",
  },
  {
    href: "/dashboard/content/services",
    title: "Services",
    description: "The services list shown on the homepage.",
  },
  {
    href: "/dashboard/content/media",
    title: "Media Library",
    description: "Upload and manage images and videos.",
  },
  {
    href: "/dashboard/content/free-booking-intro",
    title: "Free Booking Intro Video",
    description: "The video shown before the free-consultation form.",
  },
  {
    href: "/dashboard/content/free-pdf",
    title: "Free Guide (PDF)",
    description: "The downloadable PDF linked from the site menu.",
  },
  {
    href: "/dashboard/content/intake-form",
    title: "Booking Form Questions",
    description:
      "The steps and questions in the qualification form used by both booking flows.",
  },
] as const;

export default async function ContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-foreground">Site Content</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} locale={locale}>
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
