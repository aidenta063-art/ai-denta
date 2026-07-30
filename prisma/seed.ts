import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.ts";
import { ConsultationKind, Role } from "../src/generated/prisma/enums.ts";
import { generateSlots } from "../src/services/booking/slot-generation.ts";

async function main() {
  if (process.env.NODE_ENV !== "production") {
    const devAdminEmail = process.env.DEV_ADMIN_EMAIL;
    const devAdminPassword = process.env.DEV_ADMIN_PASSWORD;

    if (devAdminEmail && devAdminPassword) {
      await prisma.user.upsert({
        where: { email: devAdminEmail },
        update: {},
        create: {
          email: devAdminEmail,
          name: "Dev Admin",
          role: Role.ADMIN,
          passwordHash: await bcrypt.hash(devAdminPassword, 12),
        },
      });

      console.log(`Dev admin ready -> email: ${devAdminEmail}`);
    } else {
      console.log(
        "Skipping dev admin creation — set DEV_ADMIN_EMAIL and DEV_ADMIN_PASSWORD in .env to enable it.",
      );
    }
  }

  await prisma.consultationType.upsert({
    where: { kind: ConsultationKind.FREE },
    update: {},
    create: {
      kind: ConsultationKind.FREE,
      nameEn: "Free Consultation",
      nameAr: "استشارة مجانية",
      descriptionEn: "A quick, no-cost consultation call.",
      descriptionAr: "مكالمة استشارة سريعة بدون أي تكلفة.",
      priceCents: null,
      durationMinutes: 20,
    },
  });

  await prisma.consultationType.upsert({
    where: { kind: ConsultationKind.PAID },
    update: {},
    create: {
      kind: ConsultationKind.PAID,
      nameEn: "Paid Consultation",
      nameAr: "استشارة مدفوعة",
      descriptionEn: "An in-depth strategy session.",
      descriptionAr: "جلسة استراتيجية مفصلة.",
      priceCents: 50000,
      durationMinutes: 45,
    },
  });

  // Default working hours: Sunday–Thursday, 10:00–18:00, 30-minute slots.
  const workdays = [0, 1, 2, 3, 4];
  for (const weekday of workdays) {
    const existing = await prisma.workingHoursRule.findFirst({
      where: { weekday },
    });
    if (existing) continue;

    await prisma.workingHoursRule.create({
      data: {
        weekday,
        startTime: "10:00",
        endTime: "18:00",
        slotLengthMinutes: 30,
      },
    });
  }

  const { created } = await generateSlots();
  console.log(`Generated ${created} new slot(s).`);

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
