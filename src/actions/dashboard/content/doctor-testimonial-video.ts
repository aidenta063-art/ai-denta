"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  setDoctorTestimonialVideo,
  clearDoctorTestimonialVideo,
  CMS_TAGS,
} from "@/services/content/cms.service";

async function revalidateHomepage(locale: Locale) {
  updateTag(CMS_TAGS.doctorTestimonialVideo);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/doctor-testimonial-video`);
}

export async function setDoctorTestimonialVideoAction(
  locale: Locale,
  mediaId: string,
) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);
  await setDoctorTestimonialVideo(mediaId, session.user.id);
  await revalidateHomepage(locale);
}

export async function clearDoctorTestimonialVideoAction(locale: Locale) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await clearDoctorTestimonialVideo();
  await revalidateHomepage(locale);
}
