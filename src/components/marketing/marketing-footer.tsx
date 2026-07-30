import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/ai_denta.agency" },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/192iYAbhQ3/?mibextid=wwXIfr",
  },
];

export async function MarketingFooter() {
  const tFooter = await getTranslations("Footer");

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

      <div className="mx-auto mt-8 max-w-5xl border-t border-white/10 pt-6 text-xs text-white/50">
        Ai Denta — {tFooter("rights")}
      </div>
    </footer>
  );
}
