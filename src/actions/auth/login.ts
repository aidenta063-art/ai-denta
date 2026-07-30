"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { loginSchema } from "@/lib/validation/auth.schema";
import { checkActionRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import type { Locale } from "@/i18n/routing";

export type LoginState = {
  error?: "invalidInput" | "invalidCredentials" | "rateLimited";
};

export async function loginAction(
  locale: Locale,
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { allowed } = await checkActionRateLimit("login", {
    limit: 10,
    windowMs: 5 * 60_000,
  });
  if (!allowed) {
    return { error: "rateLimited" };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  // The actual credential check still happens inside signIn -> authorize();
  // this lookup only decides where to land the user afterwards.
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { role: true },
  });
  const isStaff = user?.role === Role.ADMIN || user?.role === Role.STAFF;
  const redirectTo = isStaff ? `/${locale}/dashboard` : `/${locale}`;

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      logger.warn({ email: parsed.data.email }, "Failed login attempt");
      return { error: "invalidCredentials" };
    }
    throw error;
  }

  return {};
}
