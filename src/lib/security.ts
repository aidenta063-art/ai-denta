/**
 * Route Handlers (unlike Server Actions) don't get Next.js's built-in
 * Origin-header CSRF check, so any POST handler that relies on the
 * session cookie for auth needs to verify it itself.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const requestOrigin = new URL(request.url).origin;
    return origin === requestOrigin;
  } catch {
    return false;
  }
}
