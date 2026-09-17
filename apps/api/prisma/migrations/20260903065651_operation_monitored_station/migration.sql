-- CreateTable
CREATE TABLE "OperationsMonitoredStation" (
    "id" TEXT NOT NULL,
    "eva" INTEGER NOT NULL,
    "ds100" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationsMonitoredStation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OperationsMonitoredStation_eva_key" ON "OperationsMonitoredStation"("eva");

-- CreateIndex
CREATE INDEX "OperationsMonitoredStation_isEnabled_idx" ON "OperationsMonitoredStation"("isEnabled");

-- CreateIndex
CREATE INDEX "OperationsMonitoredStation_name_idx" ON "OperationsMonitoredStation"("name");
