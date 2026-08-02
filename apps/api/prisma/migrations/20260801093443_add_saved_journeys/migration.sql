-- CreateTable
CREATE TABLE "SavedJourney" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fromStationEva" INTEGER NOT NULL,
    "fromStationName" TEXT NOT NULL,
    "toStationEva" INTEGER NOT NULL,
    "toStationName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedJourney_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedJourney_userId_idx" ON "SavedJourney"("userId");

-- AddForeignKey
ALTER TABLE "SavedJourney" ADD CONSTRAINT "SavedJourney_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
