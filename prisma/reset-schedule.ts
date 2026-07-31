import "dotenv/config";
import { prisma } from "../src/lib/prisma.ts";
import { resetBookingSchedule } from "../src/services/booking/reset-schedule.ts";

resetBookingSchedule()
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
