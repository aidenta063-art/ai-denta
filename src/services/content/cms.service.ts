import crypto from "node:crypto";
import { unstable_cache as nextCache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CmsSectionType, ConsultationKind } from "@/generated/prisma/enums";
import type {
  HeroFormInput,
  PricingFormInput,
  ServiceFormInput,
  ComparisonRowFormInput,
  ComparisonHeaderFormInput,
  BookingPaidThankYouFormInput,
} from "@/lib/validation/cms.schema";

const HERO_SLUG = "home-hero";
const COMPARISON_HEADER_SLUG = "comparison-header";
const BOOKING_PAID_THANKYOU_SLUG = "booking-paid-thankyou";

// This CMS content changes rarely (admin-edited) but is read on every
// marketing page load. unstable_cache keeps it out of Postgres across
// requests for CACHE_SECONDS at a time; every admin action that touches
// a tag below calls revalidateTag(...) so edits still show up
// immediately instead of waiting out the window.
const CACHE_SECONDS = 60;
export const CMS_TAGS = {
  heroContent: "cms:hero-content",
  heroVideo: "cms:hero-video",
  homeVideos: "cms:home-videos",
  services: "cms:services",
  comparisonRows: "cms:comparison-rows",
  comparisonHeader: "cms:comparison-header",
  freeBookingIntro: "cms:free-booking-intro",
  freePdf: "cms:free-pdf",
  bookingPaidThankYou: "cms:booking-paid-thankyou",
} as const;

export const getHeroContent = nextCache(
  async () => prisma.cmsSection.findUnique({ where: { slug: HERO_SLUG } }),
  ["cms-hero-content"],
  { tags: [CMS_TAGS.heroContent], revalidate: CACHE_SECONDS },
);

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

export const getHeroVideo = nextCache(
  async () => {
    const section = await prisma.cmsSection.findUnique({
      where: { slug: HERO_SLUG },
      include: {
        media: { include: { media: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });
    return section?.media[0]?.media ?? null;
  },
  ["cms-hero-video"],
  { tags: [CMS_TAGS.heroVideo], revalidate: CACHE_SECONDS },
);

async function ensureHeroSection(updatedById: string) {
  return prisma.cmsSection.upsert({
    where: { slug: HERO_SLUG },
    update: {},
    create: {
      slug: HERO_SLUG,
      type: CmsSectionType.HERO,
      contentEn: {},
      contentAr: {},
      updatedById,
    },
  });
}

export async function setHeroVideo(mediaId: string, updatedById: string) {
  const section = await ensureHeroSection(updatedById);
  await prisma.cmsSectionMedia.deleteMany({ where: { cmsSectionId: section.id } });
  await prisma.cmsSectionMedia.create({
    data: { cmsSectionId: section.id, mediaId, sortOrder: 0 },
  });
}

export async function clearHeroVideo() {
  const section = await prisma.cmsSection.findUnique({ where: { slug: HERO_SLUG } });
  if (!section) return;
  await prisma.cmsSectionMedia.deleteMany({ where: { cmsSectionId: section.id } });
}

export async function listConsultationTypes() {
  return prisma.consultationType.findMany({ orderBy: { kind: "asc" } });
}

/** The paid consultation must always stay bookable — only the free one can
 * ever be hidden — so this is forced true for PAID regardless of what the
 * form submitted, as a backend guarantee independent of the dashboard UI. */
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
      discountEnabled: kind === ConsultationKind.PAID && input.discountEnabled,
      discountType: input.discountType,
      discountValue:
        kind === ConsultationKind.PAID
          ? input.discountType === "FIXED"
            ? Math.round(input.discountValue * 100)
            : Math.round(input.discountValue)
          : 0,
      isActive: kind === ConsultationKind.PAID ? true : input.isActive,
    },
  });
}

/** Whether the free consultation option should be shown/bookable anywhere
 * on the site. Defaults to true if the row is somehow missing. */
export async function isFreeConsultationActive() {
  const freeType = await prisma.consultationType.findUnique({
    where: { kind: ConsultationKind.FREE },
    select: { isActive: true },
  });
  return freeType?.isActive ?? true;
}

export const listServices = nextCache(
  async () => prisma.service.findMany({ orderBy: { sortOrder: "asc" } }),
  ["cms-services"],
  { tags: [CMS_TAGS.services], revalidate: CACHE_SECONDS },
);

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

export const getComparisonHeaderContent = nextCache(
  async () =>
    prisma.cmsSection.findUnique({ where: { slug: COMPARISON_HEADER_SLUG } }),
  ["cms-comparison-header"],
  { tags: [CMS_TAGS.comparisonHeader], revalidate: CACHE_SECONDS },
);

export async function saveComparisonHeaderContent(
  input: ComparisonHeaderFormInput,
  updatedById: string,
) {
  const contentEn = {
    eyebrow: input.eyebrowEn,
    title: input.titleEn,
    subtitle: input.subtitleEn,
    featureLabel: input.featureLabelEn,
    freeName: input.freeNameEn,
    paidName: input.paidNameEn,
    mostPopular: input.mostPopularEn,
  };
  const contentAr = {
    eyebrow: input.eyebrowAr,
    title: input.titleAr,
    subtitle: input.subtitleAr,
    featureLabel: input.featureLabelAr,
    freeName: input.freeNameAr,
    paidName: input.paidNameAr,
    mostPopular: input.mostPopularAr,
  };

  await prisma.cmsSection.upsert({
    where: { slug: COMPARISON_HEADER_SLUG },
    update: { contentEn, contentAr, updatedById },
    create: {
      slug: COMPARISON_HEADER_SLUG,
      type: CmsSectionType.CUSTOM,
      contentEn,
      contentAr,
      updatedById,
    },
  });
}

export const listComparisonRows = nextCache(
  async () => prisma.comparisonRow.findMany({ orderBy: { sortOrder: "asc" } }),
  ["cms-comparison-rows"],
  { tags: [CMS_TAGS.comparisonRows], revalidate: CACHE_SECONDS },
);

export async function createComparisonRow(input: ComparisonRowFormInput) {
  return prisma.comparisonRow.create({ data: input });
}

export async function updateComparisonRow(
  id: string,
  input: ComparisonRowFormInput,
) {
  await prisma.comparisonRow.update({ where: { id }, data: input });
}

export async function deleteComparisonRow(id: string) {
  await prisma.comparisonRow.delete({ where: { id } });
}

const HOME_VIDEOS_SLUG = "home-videos";

export const getHomeVideoMedia = nextCache(
  async () => {
    const section = await prisma.cmsSection.findUnique({
      where: { slug: HOME_VIDEOS_SLUG },
      include: { media: { include: { media: true }, orderBy: { sortOrder: "asc" } } },
    });
    return section?.media.map((join) => join.media) ?? [];
  },
  ["cms-home-videos"],
  { tags: [CMS_TAGS.homeVideos], revalidate: CACHE_SECONDS },
);

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

const FREE_BOOKING_INTRO_SLUG = "free-booking-intro";

export const getFreeBookingIntroVideo = nextCache(
  async () => {
    const section = await prisma.cmsSection.findUnique({
      where: { slug: FREE_BOOKING_INTRO_SLUG },
      include: {
        media: { include: { media: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });
    return section?.media[0]?.media ?? null;
  },
  ["cms-free-booking-intro"],
  { tags: [CMS_TAGS.freeBookingIntro], revalidate: CACHE_SECONDS },
);

async function ensureFreeBookingIntroSection(updatedById: string) {
  return prisma.cmsSection.upsert({
    where: { slug: FREE_BOOKING_INTRO_SLUG },
    update: {},
    create: {
      slug: FREE_BOOKING_INTRO_SLUG,
      type: CmsSectionType.CUSTOM,
      contentEn: {},
      contentAr: {},
      updatedById,
    },
  });
}

export async function setFreeBookingIntroVideo(mediaId: string, updatedById: string) {
  const section = await ensureFreeBookingIntroSection(updatedById);
  await prisma.cmsSectionMedia.deleteMany({ where: { cmsSectionId: section.id } });
  await prisma.cmsSectionMedia.create({
    data: { cmsSectionId: section.id, mediaId, sortOrder: 0 },
  });
}

export async function clearFreeBookingIntroVideo() {
  const section = await prisma.cmsSection.findUnique({
    where: { slug: FREE_BOOKING_INTRO_SLUG },
  });
  if (!section) return;
  await prisma.cmsSectionMedia.deleteMany({ where: { cmsSectionId: section.id } });
}

const FREE_PDF_SLUG = "free-pdf";

export const getFreePdf = nextCache(
  async () => {
    const section = await prisma.cmsSection.findUnique({
      where: { slug: FREE_PDF_SLUG },
      include: {
        media: { include: { media: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });
    return section?.media[0]?.media ?? null;
  },
  ["cms-free-pdf"],
  { tags: [CMS_TAGS.freePdf], revalidate: CACHE_SECONDS },
);

async function ensureFreePdfSection(updatedById: string) {
  return prisma.cmsSection.upsert({
    where: { slug: FREE_PDF_SLUG },
    update: {},
    create: {
      slug: FREE_PDF_SLUG,
      type: CmsSectionType.CUSTOM,
      contentEn: {},
      contentAr: {},
      updatedById,
    },
  });
}

export async function setFreePdf(mediaId: string, updatedById: string) {
  const section = await ensureFreePdfSection(updatedById);
  await prisma.cmsSectionMedia.deleteMany({ where: { cmsSectionId: section.id } });
  await prisma.cmsSectionMedia.create({
    data: { cmsSectionId: section.id, mediaId, sortOrder: 0 },
  });
}

export async function clearFreePdf() {
  const section = await prisma.cmsSection.findUnique({ where: { slug: FREE_PDF_SLUG } });
  if (!section) return;
  await prisma.cmsSectionMedia.deleteMany({ where: { cmsSectionId: section.id } });
}

export const getBookingPaidThankYouContent = nextCache(
  async () =>
    prisma.cmsSection.findUnique({ where: { slug: BOOKING_PAID_THANKYOU_SLUG } }),
  ["cms-booking-paid-thankyou"],
  { tags: [CMS_TAGS.bookingPaidThankYou], revalidate: CACHE_SECONDS },
);

export async function saveBookingPaidThankYouContent(
  input: BookingPaidThankYouFormInput,
  updatedById: string,
) {
  const contentEn = {
    pendingTitle: input.pendingTitleEn,
    pendingDescription: input.pendingDescriptionEn,
    confirmedTitle: input.confirmedTitleEn,
    confirmedDescription: input.confirmedDescriptionEn,
    consultationLabel: input.consultationLabelEn,
    dateLabel: input.dateLabelEn,
    priceLabel: input.priceLabelEn,
    backHome: input.backHomeEn,
    upsell: {
      badge: input.upsellBadgeEn,
      title: input.upsellTitleEn,
      description: input.upsellDescriptionEn,
      bonus: input.upsellBonusEn,
      cta: input.upsellCtaEn,
    },
  };
  const contentAr = {
    pendingTitle: input.pendingTitleAr,
    pendingDescription: input.pendingDescriptionAr,
    confirmedTitle: input.confirmedTitleAr,
    confirmedDescription: input.confirmedDescriptionAr,
    consultationLabel: input.consultationLabelAr,
    dateLabel: input.dateLabelAr,
    priceLabel: input.priceLabelAr,
    backHome: input.backHomeAr,
    upsell: {
      badge: input.upsellBadgeAr,
      title: input.upsellTitleAr,
      description: input.upsellDescriptionAr,
      bonus: input.upsellBonusAr,
      cta: input.upsellCtaAr,
    },
  };

  await prisma.cmsSection.upsert({
    where: { slug: BOOKING_PAID_THANKYOU_SLUG },
    update: { contentEn, contentAr, updatedById },
    create: {
      slug: BOOKING_PAID_THANKYOU_SLUG,
      type: CmsSectionType.CUSTOM,
      contentEn,
      contentAr,
      updatedById,
    },
  });
}
