import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { edgeAuth } from "@/lib/auth-edge";

const intlMiddleware = createMiddleware(routing);

// Prefix match against the pathname with its locale segment stripped —
// covers both the page itself and any sub-paths. /ebook (landing),
// /booking/free, and /booking/paid (intro/slot-picker/intake form) are
// intentionally public — the qualification form can be filled out
// anonymously, and login is only required to actually submit it (gated
// in the form's own submit handler + the server action).
const PROTECTED_PREFIXES = ["/ebook/order", "/free-pdf"];

function isProtectedPath(pathWithoutLocale: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) =>
      pathWithoutLocale === prefix ||
      pathWithoutLocale.startsWith(`${prefix}/`),
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
