import { prisma } from "@/lib/prisma";
import { CmsSectionType } from "@/generated/prisma/enums";

const INTEGRATIONS_SLUG = "integrations";

type IntegrationsContent = { metaPixelId?: string };

export async function getMetaPixelId(): Promise<string | null> {
  const section = await prisma.cmsSection.findUnique({
    where: { slug: INTEGRATIONS_SLUG },
  });
  const content = section?.contentEn as IntegrationsContent | undefined;
  return content?.metaPixelId?.trim() || null;
}

export async function saveMetaPixelId(pixelId: string | null, updatedById: string) {
  const content: IntegrationsContent = { metaPixelId: pixelId ?? undefined };

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
