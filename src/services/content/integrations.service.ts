import { prisma } from "@/lib/prisma";
import { CmsSectionType } from "@/generated/prisma/enums";

const INTEGRATIONS_SLUG = "integrations";

type IntegrationsContent = {
  metaPixelId?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
};

async function getIntegrationsContent(): Promise<IntegrationsContent> {
  const section = await prisma.cmsSection.findUnique({
    where: { slug: INTEGRATIONS_SLUG },
  });
  return (section?.contentEn as IntegrationsContent | undefined) ?? {};
}

async function saveIntegrationsContent(
  patch: Partial<IntegrationsContent>,
  updatedById: string,
) {
  const content: IntegrationsContent = {
    ...(await getIntegrationsContent()),
    ...patch,
  };

  await prisma.cmsSection.upsert({
    where: { slug: INTEGRATIONS_SLUG },
    update: { contentEn: content, updatedById },
    create: {
      slug: INTEGRATIONS_SLUG,
      type: CmsSectionType.CUSTOM,
      contentEn: content,
      contentAr: {},
      updatedById,
    },
  });
}

export async function getMetaPixelId(): Promise<string | null> {
  const content = await getIntegrationsContent();
  return content.metaPixelId?.trim() || null;
}

export async function saveMetaPixelId(pixelId: string | null, updatedById: string) {
  await saveIntegrationsContent({ metaPixelId: pixelId ?? undefined }, updatedById);
}

export type SocialLinks = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
};

export async function getSocialLinks(): Promise<SocialLinks> {
  const content = await getIntegrationsContent();
  return {
    facebookUrl: content.facebookUrl?.trim() || null,
    instagramUrl: content.instagramUrl?.trim() || null,
    tiktokUrl: content.tiktokUrl?.trim() || null,
    youtubeUrl: content.youtubeUrl?.trim() || null,
  };
}

export async function saveSocialLinks(links: SocialLinks, updatedById: string) {
  await saveIntegrationsContent(
    {
      facebookUrl: links.facebookUrl ?? undefined,
      instagramUrl: links.instagramUrl ?? undefined,
      tiktokUrl: links.tiktokUrl ?? undefined,
      youtubeUrl: links.youtubeUrl ?? undefined,
    },
    updatedById,
  );
}
