import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listTeamMembers } from "@/services/team/team-member.service";
import { getTeamSectionContent } from "@/services/content/cms.service";
import { teamSectionContentSchema } from "@/lib/validation/cms.schema";
import { deleteTeamMemberAction } from "@/actions/dashboard/team/manage-team-member";
import { TeamSectionForm } from "@/components/dashboard/team-section-form";
import { TeamMemberForm } from "@/components/dashboard/team-member-form";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [members, section, tEn, tAr] = await Promise.all([
    listTeamMembers(),
    getTeamSectionContent(),
    getTranslations({ locale: "en", namespace: "HomePage.team" }),
    getTranslations({ locale: "ar", namespace: "HomePage.team" }),
  ]);
  const removeAction = deleteTeamMemberAction.bind(null, locale);

  const enParsed = section ? teamSectionContentSchema.safeParse(section.contentEn) : null;
  const arParsed = section ? teamSectionContentSchema.safeParse(section.contentAr) : null;

  const sectionDefaults = {
    titleEn: enParsed?.success ? enParsed.data.title : tEn("title"),
    subtitleEn: enParsed?.success ? enParsed.data.subtitle : tEn("subtitle"),
    titleAr: arParsed?.success ? arParsed.data.title : tAr("title"),
    subtitleAr: arParsed?.success ? arParsed.data.subtitle : tAr("subtitle"),
    isActive: section?.isActive ?? true,
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-foreground">
        Meet the Team
      </h1>
      <p className="text-sm text-muted-foreground">
        A homepage section showing team photos, separate from the &quot;Our
        Doctors&quot; page. Shown near the bottom of the homepage once it has
        at least one team member.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Section title &amp; visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamSectionForm locale={locale} defaults={sectionDefaults} />
        </CardContent>
      </Card>

      {members.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No team members yet — the section won&apos;t show on the homepage
          until you add one below.
        </p>
      )}

      {members.map((member) => (
        <Card key={member.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {member.nameEn}
              {!member.isActive && (
                <span className="ms-2 text-xs font-normal text-muted-foreground">
                  (inactive)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <TeamMemberForm
              locale={locale}
              member={{
                id: member.id,
                nameEn: member.nameEn,
                nameAr: member.nameAr,
                positionEn: member.positionEn,
                positionAr: member.positionAr,
                sortOrder: member.sortOrder,
                photoMediaId: member.photoMediaId,
                photoUrl: member.photoMedia?.url ?? null,
              }}
            />
            <form action={removeAction.bind(null, member.id)}>
              <Button size="sm" variant="destructive" type="submit">
                Delete
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a team member</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamMemberForm locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
