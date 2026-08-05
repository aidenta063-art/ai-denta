import { unstable_cache as nextCache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { DoctorFormInput } from "@/lib/validation/doctor.schema";

const CACHE_SECONDS = 60;
export const DOCTOR_TAGS = {
  active: "doctors:active",
} as const;

export const listActiveDoctors = nextCache(
  async () =>
    prisma.doctor.findMany({
      where: { isActive: true },
      include: { photoMedia: true },
      orderBy: { sortOrder: "asc" },
    }),
  ["doctors-active"],
  { tags: [DOCTOR_TAGS.active], revalidate: CACHE_SECONDS },
);

/** Admin listing — includes inactive doctors, no cache (always fresh in the dashboard). */
export async function listDoctors() {
  return prisma.doctor.findMany({
    include: { photoMedia: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createDoctor(input: DoctorFormInput) {
  return prisma.doctor.create({ data: input });
}

export async function updateDoctor(id: string, input: DoctorFormInput) {
  await prisma.doctor.update({ where: { id }, data: input });
}

export async function deleteDoctor(id: string) {
  await prisma.doctor.delete({ where: { id } });
}

export async function setDoctorPhoto(id: string, mediaId: string) {
  await prisma.doctor.update({ where: { id }, data: { photoMediaId: mediaId } });
}

export async function clearDoctorPhoto(id: string) {
  await prisma.doctor.update({ where: { id }, data: { photoMediaId: null } });
}
