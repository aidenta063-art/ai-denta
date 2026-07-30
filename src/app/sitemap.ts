import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const PUBLIC_PATHS = ["", "/booking", "/booking/free", "/booking/paid", "/login", "/register"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";

  return routing.locales.flatMap((locale) =>
    PUBLIC_PATHS.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.6,
    })),
  );
}
