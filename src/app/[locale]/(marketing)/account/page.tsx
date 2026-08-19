import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Mail, User as UserIcon } from "lucide-react";
import { routing } from "@/i18n/routing";
import { redirect } from "@/i18n/navigation";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

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
      </div>
    </PurpleGlowSection>
  );
}
