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

// The form always submits the photo field as the doctor's full desired
// state (an id, or "" meaning no photo) rather than a partial patch, so
// this always sets photoMediaId explicitly — passing `undefined` through
// to Prisma would mean "leave whatever was there," which would silently
// ignore an admin clicking "Remove photo".
export async function createDoctor(input: DoctorFormInput) {
  const { photoMediaId, ...rest } = input;
  return prisma.doctor.create({ data: { ...rest, photoMediaId: photoMediaId ?? null } });
}

export async function updateDoctor(id: string, input: DoctorFormInput) {
  const { photoMediaId, ...rest } = input;
  await prisma.doctor.update({
    where: { id },
    data: { ...rest, photoMediaId: photoMediaId ?? null },
  });
}

export async function deleteDoctor(id: string) {
  await prisma.doctor.delete({ where: { id } });
}
