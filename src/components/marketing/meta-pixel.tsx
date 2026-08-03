"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

// Mirrors the write-side check in the settings action (integrations.ts).
// pixelId is interpolated directly into an executable <Script> below, so
// re-validating its shape here is defense in depth against that value
// ever reaching this component some other way than the validated action.
const PIXEL_ID_PATTERN = /^\d{10,20}$/;

/** Loads the Meta Pixel base snippet only when an admin has configured a
 * Pixel ID (see dashboard/settings), and re-fires PageView on every
 * client-side route change since Next.js navigations don't reload the
 * page for Meta's own snippet to catch. */
export function MetaPixel({ pixelId: rawPixelId }: { pixelId: string | null }) {
  const pathname = usePathname();
  const pixelId =
    rawPixelId && PIXEL_ID_PATTERN.test(rawPixelId) ? rawPixelId : null;

  useEffect(() => {
    if (!pixelId) return;
    window.fbq?.("track", "PageView");
  }, [pathname, pixelId]);

  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- Meta's pixel fallback requires a plain <img>, not next/image */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
