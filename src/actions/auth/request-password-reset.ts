"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { requestPasswordResetSchema } from "@/lib/validation/auth.schema";
import { checkActionRateLimit } from "@/lib/rate-limit";
import type { Locale } from "@/i18n/routing";

export type RequestPasswordResetState = {
  error?: "invalidInput" | "rateLimited";
  success?: boolean;
};

const RESET_TOKEN_TTL_MINUTES = 30;

export async function requestPasswordResetAction(
  locale: Locale,
  _prevState: RequestPasswordResetState,
  formData: FormData,
): Promise<RequestPasswordResetState> {
  const { allowed } = await checkActionRateLimit("request-password-reset", {
    limit: 5,
    windowMs: 60 * 60_000,
  });
  if (!allowed) {
    return { error: "rateLimited" };
  }

  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always report success even if the account doesn't exist, so this
  // endpoint can't be used to enumerate registered emails.
  if (!user) {
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/${locale}/reset-password/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your Ai Denta password",
    text: `Reset your password: ${resetUrl}\nThis link expires in ${RESET_TOKEN_TTL_MINUTES} minutes.`,
  });

  return { success: true };
}
