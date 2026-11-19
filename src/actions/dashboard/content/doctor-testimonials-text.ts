"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  saveDoctorTestimonialsContent,
  CMS_TAGS,
} from "@/services/content/cms.service";
import { doctorTestimonialsFormSchema } from "@/lib/validation/cms.schema";

export type DoctorTestimonialsTextActionState = {
  error?: "invalidInput";
  success?: boolean;
};

export async function saveDoctorTestimonialsTextAction(
  locale: Locale,
  _prevState: DoctorTestimonialsTextActionState,
  formData: FormData,
): Promise<DoctorTestimonialsTextActionState> {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = doctorTestimonialsFormSchema.safeParse({
    eyebrowEn: formData.get("eyebrowEn"),
    titleEn: formData.get("titleEn"),
    subtitleEn: formData.get("subtitleEn"),
    eyebrowAr: formData.get("eyebrowAr"),
    titleAr: formData.get("titleAr"),
    subtitleAr: formData.get("subtitleAr"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await saveDoctorTestimonialsContent(parsed.data, session.user.id);
  updateTag(CMS_TAGS.doctorTestimonialVideo);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/doctor-testimonial-video`);
  return { success: true };
}
