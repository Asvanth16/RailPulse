-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "monitorStationEva" INTEGER,
ADD COLUMN     "monitorStationName" TEXT;

-- CreateIndex
CREATE INDEX "Alert_monitorStationEva_idx" ON "Alert"("monitorStationEva");
