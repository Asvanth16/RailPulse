-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('DELAY', 'PLATFORM_CHANGE', 'CANCELLATION', 'DEPARTURE_REMINDER', 'ARRIVAL_REMINDER');

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trainNumber" TEXT,
    "journeyId" TEXT,
    "fromStationEva" INTEGER,
    "fromStationName" TEXT,
    "toStationEva" INTEGER,
    "toStationName" TEXT,
    "alertType" "AlertType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isTriggered" BOOLEAN NOT NULL DEFAULT false,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_userId_idx" ON "Alert"("userId");

-- CreateIndex
CREATE INDEX "Alert_journeyId_idx" ON "Alert"("journeyId");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
