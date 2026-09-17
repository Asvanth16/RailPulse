-- AlterTable
ALTER TABLE "OperationalHistory" ADD COLUMN     "stationEva" INTEGER;

-- CreateIndex
CREATE INDEX "OperationalHistory_stationEva_idx" ON "OperationalHistory"("stationEva");
