-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('PENDING', 'ATTENDED', 'NO_SHOW', 'CANCELLED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "meetingStatus" "MeetingStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "adminNote" TEXT;
