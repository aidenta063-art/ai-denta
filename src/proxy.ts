import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { edgeAuth } from "@/lib/auth-edge";

const intlMiddleware = createMiddleware(routing);

// Prefix match against the pathname with its locale segment stripped —
// covers both the page itself and any sub-paths (e.g. /booking/paid/[slotId]).
// /ebook itself (the landing page) is intentionally public — only placing
// an order (/ebook/order) requires login.
const PROTECTED_PREFIXES = [
  "/booking/free",
  "/booking/paid",
  "/ebook/order",
  "/free-pdf",
];

function isProtectedPath(pathWithoutLocale: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) =>
      pathWithoutLocale === prefix || pathWithoutLocale.startsWith(`${prefix}/`),
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(/^\/(en|ar)((?:\/.*)?)$/);

  if (localeMatch) {
    const [, locale, rest] = localeMatch;
    const pathWithoutLocale = rest || "/";

    if (isProtectedPath(pathWithoutLocale)) {
      const session = await edgeAuth();
      if (!session?.user) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/login`;
        url.search = `?next=${encodeURIComponent(pathname)}`;
        return NextResponse.redirect(url);
      }
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
