-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('DAILY', 'WEEKDAYS', 'WEEKENDS', 'CUSTOM');

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "scheduleType" "ScheduleType" NOT NULL,
    "monday" BOOLEAN NOT NULL DEFAULT false,
    "tuesday" BOOLEAN NOT NULL DEFAULT false,
    "wednesday" BOOLEAN NOT NULL DEFAULT false,
    "thursday" BOOLEAN NOT NULL DEFAULT false,
    "friday" BOOLEAN NOT NULL DEFAULT false,
    "saturday" BOOLEAN NOT NULL DEFAULT false,
    "sunday" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Schedule_journeyId_idx" ON "Schedule"("journeyId");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
