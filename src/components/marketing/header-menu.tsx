"use client";

import { useState, useTransition } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useTranslations } from "next-intl";
import {
  Menu,
  X,
  Home,
  Info,
  CalendarDays,
  Sparkles,
  Gift,
  BookOpen,
  FileText,
  LogIn,
  UserRound,
  LayoutDashboard,
  UserRoundCog,
  LogOut,
  Languages,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogClose,
} from "@/components/ui/dialog";
import { logoutAction, switchAccountAction } from "@/actions/auth/logout";

const NAV_LINKS = [
  { key: "home", href: "/", Icon: Home, scrollId: undefined },
  { key: "aboutUs", href: "/#about", Icon: Info, scrollId: "about" },
  { key: "booking", href: "/booking", Icon: CalendarDays, scrollId: undefined },
  { key: "bookingPaid", href: "/booking/paid", Icon: Sparkles, scrollId: undefined },
  { key: "bookingFree", href: "/booking/free", Icon: Gift, scrollId: undefined },
  { key: "ourBook", href: "/ebook", Icon: BookOpen, scrollId: undefined },
  { key: "freeGuide", href: "/free-pdf", Icon: FileText, scrollId: undefined },
] as const;

export function HeaderMenu({
  locale,
  session,
}: {
  locale: Locale;
  session: { name: string; isStaff: boolean } | null;
}) {
  const tNav = useTranslations("Nav");
  const pathname = usePathname();
  const otherLocale = locale === "ar" ? "en" : "ar";
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    scrollId?: string,
  ) {
    if (scrollId && pathname === "/") {
      e.preventDefault();
      document.getElementById(scrollId)?.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label={tNav("menu")}
        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/90 transition-colors hover:bg-white/10 hover:text-white sm:size-11"
      >
        <Menu className="size-5" />
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className="fixed inset-y-0 end-0 z-50 flex w-full max-w-xs flex-col gap-1 overflow-y-auto bg-[#251037] p-5 text-white shadow-2xl outline-none data-open:animate-in data-open:slide-in-from-end data-closed:animate-out data-closed:slide-out-to-end"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-bold tracking-tight">Ai denta</span>
            <DialogClose
              aria-label={tNav("close")}
              className="flex size-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" />
            </DialogClose>
          </div>

          <Link
            href="/"
            locale={otherLocale}
            className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Languages className="size-4" />
            {otherLocale === "ar" ? "العربية" : "English"}
          </Link>

          <nav className="flex flex-col gap-1 border-t border-white/10 pt-3">
            {NAV_LINKS.map(({ key, href, Icon, scrollId }) => (
              <Link
                key={key}
                href={href}
                locale={locale}
                onClick={(e) => handleNavClick(e, scrollId)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium text-white/90 transition-colors hover:bg-white/10"
              >
                <Icon className="size-4.5 shrink-0" />
                {tNav(key)}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex flex-col gap-1 border-t border-white/10 pt-3">
            {session ? (
              <>
                <p className="px-3 pb-1 text-sm text-white/50">
                  {tNav("greeting", { name: session.name })}
                </p>
                <Link
                  href="/account"
                  locale={locale}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium text-white/90 transition-colors hover:bg-white/10"
                >
                  <UserRound className="size-4.5 shrink-0" />
                  {tNav("myAccount")}
                </Link>
                {session.isStaff && (
                  <Link
                    href="/dashboard"
                    locale={locale}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium text-white/90 transition-colors hover:bg-white/10"
                  >
                    <LayoutDashboard className="size-4.5 shrink-0" />
                    {tNav("adminPanel")}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    startTransition(() => switchAccountAction(locale));
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-start text-base font-medium text-white/90 transition-colors hover:bg-white/10"
                >
                  <UserRoundCog className="size-4.5 shrink-0" />
                  {tNav("switchAccount")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    startTransition(() => logoutAction(locale));
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-start text-base font-medium text-red-300 transition-colors hover:bg-white/10"
                >
                  <LogOut className="size-4.5 shrink-0" />
                  {tNav("logout")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                locale={locale}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-[#7E00C9] px-3 py-2.5 text-base font-medium text-white transition-colors hover:bg-[#7E00C9]/90"
              >
                <LogIn className="size-4.5 shrink-0" />
                {tNav("account")}
              </Link>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
