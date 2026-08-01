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
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur-sm print:hidden">
      <span className="font-semibold text-card-foreground sm:hidden">
        Ai Denta
      </span>
      <span className="hidden text-sm text-muted-foreground sm:block" />
      <form action={logoutWithLocale} className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-foreground">{userName}</span>
        </div>
        <Button type="submit" variant="outline" size="sm">
          Logout
        </Button>
      </form>
    </header>
  );
}
