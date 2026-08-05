"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  createDoctor,
  updateDoctor,
  deleteDoctor,
  DOCTOR_TAGS,
} from "@/services/doctors/doctor.service";
import { doctorFormSchema } from "@/lib/validation/doctor.schema";

export type DoctorActionState = {
  error?: "invalidInput";
};

async function revalidateDoctors(locale: Locale) {
  updateTag(DOCTOR_TAGS.active);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/doctors`);
}

function parseDoctorForm(formData: FormData) {
  const servicesRaw = formData.get("servicesJson");
  let services: unknown = [];
  try {
    services = servicesRaw ? JSON.parse(String(servicesRaw)) : [];
  } catch {
    services = null;
  }

  return doctorFormSchema.safeParse({
    nameEn: formData.get("nameEn"),
    nameAr: formData.get("nameAr"),
    locationEn: formData.get("locationEn"),
    locationAr: formData.get("locationAr"),
    storyEn: formData.get("storyEn"),
    storyAr: formData.get("storyAr"),
    services,
    sortOrder: formData.get("sortOrder"),
    photoMediaId: formData.get("photoMediaId"),
  });
}

export async function createDoctorAction(
  locale: Locale,
  _prevState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = parseDoctorForm(formData);
  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await createDoctor(parsed.data);
  await revalidateDoctors(locale);
  return {};
}

export async function updateDoctorAction(
  locale: Locale,
  doctorId: string,
  _prevState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = parseDoctorForm(formData);
  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await updateDoctor(doctorId, parsed.data);
  await revalidateDoctors(locale);
  return {};
}

export async function deleteDoctorAction(locale: Locale, doctorId: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await deleteDoctor(doctorId);
  await revalidateDoctors(locale);
}
