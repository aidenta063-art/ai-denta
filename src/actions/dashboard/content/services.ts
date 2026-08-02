"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  createService,
  updateService,
  deleteService,
  CMS_TAGS,
} from "@/services/content/cms.service";
import { serviceFormSchema } from "@/lib/validation/cms.schema";

export type ServiceActionState = {
  error?: "invalidInput";
};

async function revalidateHomepage(locale: Locale) {
  updateTag(CMS_TAGS.services);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/services`);
}

function parseServiceForm(formData: FormData) {
  return serviceFormSchema.safeParse({
    nameEn: formData.get("nameEn"),
    nameAr: formData.get("nameAr"),
    descriptionEn: formData.get("descriptionEn"),
    descriptionAr: formData.get("descriptionAr"),
    sortOrder: formData.get("sortOrder"),
  });
}

export async function createServiceAction(
  locale: Locale,
  _prevState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = parseServiceForm(formData);
  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await createService(parsed.data);
  await revalidateHomepage(locale);
  return {};
}

export async function updateServiceAction(
  locale: Locale,
  serviceId: string,
  _prevState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = parseServiceForm(formData);
  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await updateService(serviceId, parsed.data);
  await revalidateHomepage(locale);
  return {};
}

export async function deleteServiceAction(locale: Locale, serviceId: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await deleteService(serviceId);
  await revalidateHomepage(locale);
}
