import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CalendarClock, Mail, Phone, User as UserIcon } from "lucide-react";
import { routing } from "@/i18n/routing";
import { redirect, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { localized } from "@/lib/i18n-content";
import { formatSlotTimeRange } from "@/lib/timezone";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Account" });
  return { title: t("title") };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const t = await getTranslations("Account");

  const [user, bookings] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    prisma.booking.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { slot: true, consultationType: true },
    }),
  ]);

  const memberSince = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "long",
  }).format(user.createdAt);

  return (
    <PurpleGlowSection className="px-4 py-24 sm:py-28">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-start">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-secondary text-2xl font-semibold text-primary">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="size-7" />}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-foreground">
                {user.name ?? t("title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("memberSince", { date: memberSince })}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
              <Mail className="size-4 shrink-0 text-primary" />
              <span className="truncate text-sm text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
              <Phone className="size-4 shrink-0 text-primary" />
              <span className="text-sm text-foreground">
                {user.phone ?? t("noPhone")}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">
            {t("bookingsTitle")}
          </h2>

          {bookings.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-xl bg-secondary/50 px-6 py-10 text-center">
              <CalendarClock className="size-8 text-primary" />
              <p className="text-sm text-muted-foreground">{t("noBookings")}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  className="h-10 bg-[#7E00C9] hover:bg-[#7E00C9]/90"
                  render={<Link href="/booking/free" locale={locale} />}
                >
                  {t("bookFree")}
                </Button>
                <Button
                  variant="outline"
                  className="h-10"
                  render={<Link href="/booking" locale={locale} />}
                >
                  {t("bookPaid")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {localized(
                        locale,
                        booking.consultationType.nameEn,
                        booking.consultationType.nameAr,
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.slot
                        ? formatSlotTimeRange(
                            booking.slot.startAt,
                            booking.slot.endAt,
                            locale,
                            { dateStyle: "medium" },
                          )
                        : t("waitlist")}
                    </p>
                  </div>
                  <BookingStatusPill status={booking.status} label={t(`status.${booking.status}`)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PurpleGlowSection>
  );
}

const STATUS_DOT: Record<string, string> = {
  CONFIRMED: "bg-green-500",
  PENDING_PAYMENT: "bg-amber-500",
  CANCELLED: "bg-gray-400",
  EXPIRED: "bg-gray-400",
};

function BookingStatusPill({ status, label }: { status: string; label: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-0.5 text-xs font-medium text-foreground">
      <span className={`size-1.5 rounded-full ${STATUS_DOT[status] ?? "bg-gray-400"}`} />
      {label}
    </span>
  );
}
