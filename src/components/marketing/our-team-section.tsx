import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { getTeamSectionContent } from "@/services/content/cms.service";
import { teamSectionContentSchema } from "@/lib/validation/cms.schema";
import { localized } from "@/lib/i18n-content";
import { listActiveTeamMembers } from "@/services/team/team-member.service";
import type { Locale } from "@/i18n/routing";

export async function OurTeamSection({ locale }: { locale: Locale }) {
  const [t, section, members] = await Promise.all([
    getTranslations("HomePage.team"),
    getTeamSectionContent(),
    listActiveTeamMembers(),
  ]);

  if (section?.isActive === false) return null;
  if (members.length === 0) return null;

  const parsed = section
    ? teamSectionContentSchema.safeParse(
        localized(locale, section.contentEn, section.contentAr),
      )
    : null;
  const content = parsed?.success
    ? parsed.data
    : { title: t("title"), subtitle: t("subtitle") };

  return (
    <section className="bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mb-12 flex flex-col items-center gap-3 text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="max-w-2xl text-muted-foreground">{content.subtitle}</p>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {members.map((member, i) => (
            <ScrollReveal
              key={member.id}
              delay={i * 0.05}
              className="flex flex-col items-center gap-3 text-center"
            >
              {member.photoMedia?.url ? (
                <Image
                  src={member.photoMedia.url}
                  alt=""
                  width={160}
                  height={160}
                  className="size-28 rounded-full border border-border object-cover sm:size-32"
                />
              ) : (
                <div className="flex size-28 items-center justify-center rounded-full border border-border bg-muted text-2xl font-semibold text-muted-foreground sm:size-32">
                  {localized(locale, member.nameEn, member.nameAr).charAt(0)}
                </div>
              )}
              <p className="font-medium text-card-foreground">
                {localized(locale, member.nameEn, member.nameAr)}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
