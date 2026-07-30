import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { CmsSectionType, ConsultationKind } from "@/generated/prisma/enums";
import type { HeroFormInput, PricingFormInput, ServiceFormInput } from "@/lib/validation/cms.schema";

const HERO_SLUG = "home-hero";

export async function getHeroContent() {
  return prisma.cmsSection.findUnique({ where: { slug: HERO_SLUG } });
}

export async function saveHeroContent(input: HeroFormInput, updatedById: string) {
  const contentEn = {
    eyebrow: input.eyebrowEn,
    title: input.titleEn,
    subtitle: input.subtitleEn,
  };
  const contentAr = {
    eyebrow: input.eyebrowAr,
    title: input.titleAr,
    subtitle: input.subtitleAr,
  };

  await prisma.cmsSection.upsert({
    where: { slug: HERO_SLUG },
    update: { contentEn, contentAr, updatedById },
    create: {
      slug: HERO_SLUG,
      type: CmsSectionType.HERO,
      contentEn,
      contentAr,
      updatedById,
    },
  });
}

export async function listConsultationTypes() {
  return prisma.consultationType.findMany({ orderBy: { kind: "asc" } });
}

export async function updateConsultationTypePricing(
  kind: ConsultationKind,
  input: PricingFormInput,
) {
  await prisma.consultationType.update({
    where: { kind },
    data: {
      nameEn: input.nameEn,
      nameAr: input.nameAr,
      descriptionEn: input.descriptionEn || null,
      descriptionAr: input.descriptionAr || null,
      priceCents:
        kind === ConsultationKind.PAID
          ? Math.round((input.priceEgp ?? 0) * 100)
          : null,
      durationMinutes: input.durationMinutes,
    },
  });
}

export async function listServices() {
  return prisma.service.findMany({ orderBy: { sortOrder: "asc" } });
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || crypto.randomUUID().slice(0, 8)
  );
}

export async function createService(input: ServiceFormInput) {
  const baseSlug = slugify(input.nameEn);
  let slug = baseSlug;
  let attempt = 1;
  while (await prisma.service.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${attempt++}`;
  }

  return prisma.service.create({
    data: {
      slug,
      nameEn: input.nameEn,
      nameAr: input.nameAr,
      descriptionEn: input.descriptionEn || null,
      descriptionAr: input.descriptionAr || null,
      sortOrder: input.sortOrder,
    },
  });
}

export async function updateService(id: string, input: ServiceFormInput) {
  await prisma.service.update({
    where: { id },
    data: {
      nameEn: input.nameEn,
      nameAr: input.nameAr,
      descriptionEn: input.descriptionEn || null,
      descriptionAr: input.descriptionAr || null,
      sortOrder: input.sortOrder,
    },
  });
}

export async function deleteService(id: string) {
  await prisma.service.delete({ where: { id } });
}

const HOME_VIDEOS_SLUG = "home-videos";

export async function getHomeVideoMedia() {
  const section = await prisma.cmsSection.findUnique({
    where: { slug: HOME_VIDEOS_SLUG },
    include: { media: { include: { media: true }, orderBy: { sortOrder: "asc" } } },
  });
  return section?.media.map((join) => join.media) ?? [];
}

export async function getHomeVideoMediaIds() {
  const media = await getHomeVideoMedia();
  return new Set(media.map((m) => m.id));
}

async function ensureHomeVideosSection(updatedById: string) {
  return prisma.cmsSection.upsert({
    where: { slug: HOME_VIDEOS_SLUG },
    update: {},
    create: {
      slug: HOME_VIDEOS_SLUG,
      type: CmsSectionType.GALLERY,
      contentEn: {},
      contentAr: {},
      updatedById,
    },
  });
}

export async function attachVideoToHomepage(mediaId: string, updatedById: string) {
  const section = await ensureHomeVideosSection(updatedById);
  const existing = await prisma.cmsSectionMedia.findUnique({
    where: { cmsSectionId_mediaId: { cmsSectionId: section.id, mediaId } },
  });
  if (existing) return;

  const count = await prisma.cmsSectionMedia.count({
    where: { cmsSectionId: section.id },
  });
  await prisma.cmsSectionMedia.create({
    data: { cmsSectionId: section.id, mediaId, sortOrder: count },
  });
}

export async function detachVideoFromHomepage(mediaId: string) {
  const section = await prisma.cmsSection.findUnique({
    where: { slug: HOME_VIDEOS_SLUG },
  });
  if (!section) return;

  await prisma.cmsSectionMedia.deleteMany({
    where: { cmsSectionId: section.id, mediaId },
  });
}
