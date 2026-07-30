import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Role } from "@/generated/prisma/enums";

/**
 * Guards a Server Component/Action to the given roles. Redirects to the
 * locale-aware login page (unauthenticated) or homepage (wrong role) rather
 * than throwing, since these are called from page/layout render paths.
 */
export async function requireRole(allowedRoles: Role[], locale: Locale) {
  const session = await auth();

  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  if (!allowedRoles.includes(session!.user.role)) {
    redirect({ href: "/", locale });
  }

  return session!;
}
