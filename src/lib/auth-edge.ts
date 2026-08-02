import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/** Edge-safe session check for proxy.ts — decodes the session JWT
 * cookie only, no Prisma/bcrypt in the bundle. Do not use this for
 * anything that needs real provider sign-in; use `auth` from
 * `@/lib/auth` everywhere outside middleware. */
export const { auth: edgeAuth } = NextAuth(authConfig);
