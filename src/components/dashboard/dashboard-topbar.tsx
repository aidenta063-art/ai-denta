import { logoutAction } from "@/actions/auth/logout";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";

export function DashboardTopbar({
  locale,
  userName,
}: {
  locale: Locale;
  userName: string;
}) {
  const logoutWithLocale = logoutAction.bind(null, locale);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <span className="font-semibold text-card-foreground sm:hidden">
        Ai Denta
      </span>
      <span className="hidden text-sm text-muted-foreground sm:block" />
      <form action={logoutWithLocale} className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{userName}</span>
        <Button type="submit" variant="outline" size="sm">
          Logout
        </Button>
      </form>
    </header>
  );
}
