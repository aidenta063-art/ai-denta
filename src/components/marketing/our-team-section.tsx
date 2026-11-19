import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { Eyebrow } from "@/components/marketing/eyebrow";
import {
  TeamMembersCarousel,
  type TeamMemberCardData,
} from "@/components/marketing/team-members-carousel";
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

  const cards: TeamMemberCardData[] = members.map((member) => ({
    id: member.id,
    name: localized(locale, member.nameEn, member.nameAr),
    position: localized(locale, member.positionEn, member.positionAr),
    photoUrl: member.photoMedia?.url ?? null,
  }));

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

        <ScrollReveal>
          <TeamMembersCarousel members={cards} />
        </ScrollReveal>
      </div>
    </section>
  );
}
