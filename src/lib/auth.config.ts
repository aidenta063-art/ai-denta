import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * The subset of the NextAuth config that's safe to run on the Edge
 * runtime (proxy.ts) — no Prisma, no bcrypt, no providers that touch the
 * database. Just enough to decode/verify an existing session JWT so
 * middleware can gate routes without a DB round trip. The full config in
 * auth.ts spreads this and adds the real providers + adapter for
 * everything else (route handlers, server components, actions).
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};
