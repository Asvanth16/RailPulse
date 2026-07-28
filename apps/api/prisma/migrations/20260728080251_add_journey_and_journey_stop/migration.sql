-- CreateEnum
CREATE TYPE "JourneyStatus" AS ENUM ('SCHEDULED', 'BOARDING', 'DEPARTED', 'DELAYED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Journey" (
    "id" TEXT NOT NULL,
    "journeyNumber" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "status" "JourneyStatus" NOT NULL DEFAULT 'SCHEDULED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyStop" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "arrivalTime" TIMESTAMP(3),
    "departureTime" TIMESTAMP(3),
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyStop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Journey_journeyNumber_key" ON "Journey"("journeyNumber");

-- CreateIndex
CREATE INDEX "Journey_trainId_idx" ON "Journey"("trainId");

-- CreateIndex
CREATE INDEX "JourneyStop_journeyId_idx" ON "JourneyStop"("journeyId");

-- CreateIndex
CREATE INDEX "JourneyStop_stationId_idx" ON "JourneyStop"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyStop_journeyId_sequence_key" ON "JourneyStop"("journeyId", "sequence");

-- CreateIndex
CREATE INDEX "Station_city_idx" ON "Station"("city");

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyStop" ADD CONSTRAINT "JourneyStop_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyStop" ADD CONSTRAINT "JourneyStop_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
