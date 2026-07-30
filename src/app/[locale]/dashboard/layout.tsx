import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { routing } from "@/i18n/routing";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  return (
    <DirectionProvider direction="ltr">
      <div dir="ltr" className="flex min-h-full flex-1">
        <DashboardSidebar locale={locale} />
        <div className="flex flex-1 flex-col bg-background">
          <DashboardTopbar
            locale={locale}
            userName={session.user.name ?? session.user.email ?? ""}
          />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </DirectionProvider>
  );
}
