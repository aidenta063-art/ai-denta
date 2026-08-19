import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Mail, User as UserIcon, BookOpen, Download } from "lucide-react";
import { routing } from "@/i18n/routing";
import { redirect } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listUserEbookOrders } from "@/services/ebook/ebook.service";
import { EbookOrderStatus } from "@/generated/prisma/enums";
import { ProfileEditForm } from "@/components/account/profile-edit-form";

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

  const [user, ebookOrders] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    listUserEbookOrders(session.user.id),
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

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
            <Mail className="size-4 shrink-0 text-primary" />
            <span className="truncate text-sm text-foreground">{user.email}</span>
          </div>

          <div className="mt-4 border-t border-border pt-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {t("editTitle")}
            </h2>
            <ProfileEditForm
              locale={locale}
              name={user.name ?? ""}
              phone={user.phone ?? ""}
            />
          </div>
        </div>

        {ebookOrders.length > 0 && (
          <div className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              {t("ebookOrdersTitle")}
            </h2>
            <div className="flex flex-col gap-3">
              {ebookOrders.map((order) => {
                const isPaid = order.status === EbookOrderStatus.PAID;
                const formattedPrice = new Intl.NumberFormat(
                  locale === "ar" ? "ar-EG" : "en-US",
                  { style: "currency", currency: order.currency },
                ).format(order.amountCents / 100);

                return (
                  <div
                    key={order.id}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="size-4 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">
                          Patient Flow
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formattedPrice}
                        </p>
                      </div>
                    </div>
                    {isPaid ? (
                      <Button
                        size="sm"
                        className="h-9 gap-1.5 bg-[#7E00C9] hover:bg-[#7E00C9]/90"
                        render={<a href={`/api/ebook/download/${order.id}`} />}
                      >
                        <Download className="size-3.5" />
                        {t("download")}
                      </Button>
                    ) : (
                      <BookingStatusPill
                        status={order.status}
                        label={t(`ebookStatus.${order.status}`)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
