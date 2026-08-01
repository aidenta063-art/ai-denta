"use client";

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Appointments", Icon: CalendarDays },
  { href: "/dashboard/reports", label: "Reports", Icon: BarChart3 },
  { href: "/dashboard/users", label: "Users", Icon: Users },
  { href: "/dashboard/payments", label: "Payments", Icon: CreditCard },
  { href: "/dashboard/ebook-orders", label: "Ebook Orders", Icon: BookOpen },
  { href: "/dashboard/content", label: "Content", Icon: FileText },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
] as const;

export function DashboardSidebar({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <aside className="dark hidden w-64 shrink-0 flex-col border-e border-sidebar-border bg-sidebar sm:flex print:hidden">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
        <Link href="/" locale={locale} className="flex items-center gap-2.5">
          <Image src="/logo-mark.png" alt="" width={140} height={140} className="size-7" />
          <span className="text-lg font-bold text-sidebar-foreground">
            Ai Denta
          </span>
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive =
            href === "/dashboard" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              locale={locale}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-black/20"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
