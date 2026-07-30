"use client";

import { useTransition } from "react";
import { User, LayoutDashboard, UserRoundCog, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { logoutAction, switchAccountAction } from "@/actions/auth/logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({
  locale,
  name,
  isStaff,
}: {
  locale: Locale;
  name: string;
  isStaff: boolean;
}) {
  const tNav = useTranslations("Nav");
  const [, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={tNav("account")}
        title={tNav("account")}
        className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        <User className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{tNav("greeting", { name })}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isStaff && (
            <DropdownMenuItem render={<Link href="/dashboard" locale={locale} />}>
              <LayoutDashboard /> {tNav("adminPanel")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => startTransition(() => switchAccountAction(locale))}
          >
            <UserRoundCog /> {tNav("switchAccount")}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => startTransition(() => logoutAction(locale))}
          >
            <LogOut /> {tNav("logout")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
