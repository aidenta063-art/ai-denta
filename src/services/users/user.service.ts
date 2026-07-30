import { prisma } from "@/lib/prisma";

export async function listUsers({ search }: { search?: string } = {}) {
  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      bookings: {
        select: { consultationType: { select: { kind: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { bookings: true } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    bookingCount: user._count.bookings,
    planType: user.bookings[0]?.consultationType.kind ?? null,
  }));
}

/**
 * Deletes a registered account. Their past bookings are preserved (this is
 * the same guest-booking model the public flows use — a booking never
 * requires a User row), just detached from the deleted account.
 */
export async function deleteUser(id: string) {
  await prisma.$transaction([
    prisma.booking.updateMany({ where: { userId: id }, data: { userId: null } }),
    prisma.user.delete({ where: { id } }),
  ]);
}
