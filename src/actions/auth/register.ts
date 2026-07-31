"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/auth.schema";
import { checkActionRateLimit } from "@/lib/rate-limit";

export type RegisterActionState = {
  error?: "invalidInput" | "emailTaken" | "rateLimited";
  success?: boolean;
};

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const { allowed } = await checkActionRateLimit("register", {
    limit: 5,
    windowMs: 60 * 60_000,
  });
  if (!allowed) {
    return { error: "rateLimited" };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  const { name, email, password } = parsed.data;

  const [existing, passwordHash] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    bcrypt.hash(password, 12),
  ]);
  if (existing) {
    return { error: "emailTaken" };
  }

  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return { success: true };
}
