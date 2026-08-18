import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
});

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
