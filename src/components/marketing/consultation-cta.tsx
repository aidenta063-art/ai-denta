import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import type { Locale } from "@/i18n/routing";

export async function ConsultationCta({ locale }: { locale: Locale }) {
  const t = await getTranslations("HomePage.cta");

  return (
    <section className="px-6 py-20">
      <ScrollReveal className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#7E00C9] to-[#251037] px-8 py-14 text-center sm:px-16">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[#EDE3F5]/80">
          {t("subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="bg-white text-[#251037] hover:bg-white/90"
            render={<Link href="/booking/free" locale={locale} />}
          >
            {t("ctaFree")}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10"
            render={<Link href="/booking" locale={locale} />}
          >
            {t("ctaPaid")}
          </Button>
        </div>
      </ScrollReveal>
    </section>
  );
}
