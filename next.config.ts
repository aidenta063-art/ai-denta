import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  // Disallow framing entirely — the app has no legitimate embed use case,
  // so blocking it outright is safer than X-Frame-Options: SAMEORIGIN.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // HSTS only matters over HTTPS (which is all Vercel serves in
  // production); harmless to send in dev since browsers ignore it on http.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
    // All uploaded photos are already hosted on R2 (free egress). Without
    // this, Next still proxies every one of them through Vercel's
    // /_next/image function on every page view to resize/re-encode it —
    // that's Vercel bandwidth and Image Optimization quota being spent on
    // bytes that didn't need to touch Vercel at all. Disabling it serves
    // the original file straight from R2, so images behave exactly like
    // videos already do (plain <video src> — browser fetches R2 directly).
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
