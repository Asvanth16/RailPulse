-- CreateEnum
CREATE TYPE "TrainRunStatus" AS ENUM ('SCHEDULED', 'BOARDING', 'DEPARTED', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "TrainRun" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "status" "TrainRunStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainRun_journeyId_idx" ON "TrainRun"("journeyId");

-- CreateIndex
CREATE INDEX "TrainRun_serviceDate_idx" ON "TrainRun"("serviceDate");

-- AddForeignKey
ALTER TABLE "TrainRun" ADD CONSTRAINT "TrainRun_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
