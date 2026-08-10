-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "confirmationSentAt" TIMESTAMP(3),
ADD COLUMN     "reminder1hSentAt" TIMESTAMP(3),
ADD COLUMN     "reminder24hSentAt" TIMESTAMP(3);
