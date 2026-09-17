-- CreateEnum
CREATE TYPE "OperationalHistoryType" AS ENUM ('DELAY_CHANGED', 'PLATFORM_CHANGED', 'CANCELLATION', 'STATUS_CHANGED');

-- CreateTable
CREATE TABLE "OperationalHistory" (
    "id" TEXT NOT NULL,
    "trainRunId" TEXT NOT NULL,
    "type" "OperationalHistoryType" NOT NULL,
    "previousValue" TEXT,
    "currentValue" TEXT,
    "message" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperationalHistory_trainRunId_idx" ON "OperationalHistory"("trainRunId");

-- CreateIndex
CREATE INDEX "OperationalHistory_occurredAt_idx" ON "OperationalHistory"("occurredAt");

-- CreateIndex
CREATE INDEX "OperationalHistory_trainRunId_occurredAt_idx" ON "OperationalHistory"("trainRunId", "occurredAt");

-- AddForeignKey
ALTER TABLE "OperationalHistory" ADD CONSTRAINT "OperationalHistory_trainRunId_fkey" FOREIGN KEY ("trainRunId") REFERENCES "TrainRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
