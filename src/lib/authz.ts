import { notFound } from "next/navigation";
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

/**
 * Guards a per-record page (booking/order confirmation, etc.) so only the
 * record's owner or staff can view it. Unauthenticated visitors go to
 * login (recoverable — e.g. a session that expired mid-flow); an
 * authenticated visitor who isn't the owner gets a 404 rather than a
 * redirect, so the response can't be used to confirm the record exists.
 * Records created before login was made mandatory have no `userId` and
 * so are only viewable by staff.
 */
export async function requireOwnerOrStaff(
  resourceUserId: string | null,
  staffRoles: Role[],
  locale: Locale,
) {
  const session = await auth();

  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  const isOwner =
    resourceUserId !== null && session!.user.id === resourceUserId;
  const isStaff = staffRoles.includes(session!.user.role);

  if (!isOwner && !isStaff) {
    notFound();
  }

  return session!;
}
