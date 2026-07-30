import { User } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { HeaderShell } from "@/components/marketing/header-shell";
import { UserMenu } from "@/components/marketing/user-menu";
import type { Locale } from "@/i18n/routing";

export async function MarketingHeader({ locale }: { locale: Locale }) {
  const tNav = await getTranslations("Nav");
  const otherLocale = locale === "ar" ? "en" : "ar";
  const session = await auth();
  const isStaff =
    session?.user.role === Role.ADMIN || session?.user.role === Role.STAFF;

  return (
    <HeaderShell>
      <nav className="mx-auto flex h-24 max-w-6xl items-center justify-between px-6 sm:px-8">
        <Link href="/" locale={locale} className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="Ai Denta"
            width={300}
            height={140}
            priority
            className="h-8 w-auto sm:h-14 lg:h-16"
          />
        </Link>
        <div className="flex items-center gap-2 sm:gap-6">
          <Link
            href="/"
            locale={locale}
            className="hidden text-base font-medium tracking-wide text-white/80 transition-colors hover:text-white md:inline"
          >
            {tNav("home")}
          </Link>
          <Link
            href="/"
            locale={otherLocale}
            className="rounded-full border border-white/20 px-2.5 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
          >
            {otherLocale === "ar" ? "العربية" : "English"}
          </Link>
          <Button
            size="lg"
            className="bg-[#7E00C9] px-3 text-white hover:bg-[#7E00C9]/85 sm:px-6"
            render={<Link href="/booking" locale={locale} />}
          >
            {tNav("booking")}
          </Button>

          {session?.user ? (
            <UserMenu
              locale={locale}
              name={session.user.name ?? session.user.email ?? ""}
              isStaff={isStaff}
            />
          ) : (
            <Link
              href="/login"
              locale={locale}
              aria-label={tNav("account")}
              title={tNav("account")}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:size-11"
            >
              <User className="size-4 sm:size-5" />
            </Link>
          )}
        </div>
      </nav>
    </HeaderShell>
  );
}
