import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSocialLinks } from "@/services/content/integrations.service";
import type { Locale } from "@/i18n/routing";

// Shown if an admin hasn't set a link yet in Dashboard > Settings, so the
// footer never ships empty on a fresh deploy.
const DEFAULT_FACEBOOK_URL =
  "https://www.facebook.com/share/192iYAbhQ3/?mibextid=wwXIfr";
const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/ai_denta.agency";

export async function MarketingFooter({ locale }: { locale: Locale }) {
  const [tFooter, socialLinks] = await Promise.all([
    getTranslations("Footer"),
    getSocialLinks(),
  ]);

  const SOCIAL_LINKS = [
    {
      label: "Instagram",
      href: socialLinks.instagramUrl ?? DEFAULT_INSTAGRAM_URL,
    },
    {
      label: "Facebook",
      href: socialLinks.facebookUrl ?? DEFAULT_FACEBOOK_URL,
    },
    socialLinks.tiktokUrl && { label: "TikTok", href: socialLinks.tiktokUrl },
    socialLinks.youtubeUrl && {
      label: "YouTube",
      href: socialLinks.youtubeUrl,
    },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <footer className="bg-[#251037] px-6 py-12 text-white/70">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Image
            src="/logo.png"
            alt="Ai Denta"
            width={300}
            height={140}
            className="h-8 w-auto"
          />
          <p className="mt-2 max-w-xs text-sm">{tFooter("tagline")}</p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <a
            href="mailto:Support@ai-denta.com"
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <Mail className="size-4" /> Support@ai-denta.com
          </a>
          <a
            href="tel:+201097308908"
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <Phone className="size-4" /> 01097308908
          </a>
        </div>

        <div className="flex gap-4 text-sm">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50">
        <span>Ai Denta — {tFooter("rights")}</span>
        <Link
          href="/return-policy"
          locale={locale}
          className="transition-colors hover:text-white"
        >
          {tFooter("returnPolicy")}
        </Link>
      </div>
    </footer>
  );
}
