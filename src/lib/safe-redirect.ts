/** Only ever follow an internal, root-relative path after auth — never an
 * absolute URL or protocol-relative one (`//evil.com`), which would be an
 * open-redirect vector for a "next" param coming straight from the URL. */
export function isSafeRedirectPath(path: string | undefined | null): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}
