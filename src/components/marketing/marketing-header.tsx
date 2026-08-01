import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { HeaderShell } from "@/components/marketing/header-shell";
import { HeaderMenu } from "@/components/marketing/header-menu";
import type { Locale } from "@/i18n/routing";

export async function MarketingHeader({ locale }: { locale: Locale }) {
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

        <HeaderMenu
          locale={locale}
          session={
            session?.user
              ? { name: session.user.name ?? session.user.email ?? "", isStaff }
              : null
          }
        />
      </nav>
    </HeaderShell>
  );
}
