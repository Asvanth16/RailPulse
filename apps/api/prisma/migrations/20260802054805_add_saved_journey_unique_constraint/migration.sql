/*
  Warnings:

  - A unique constraint covering the columns `[userId,fromStationEva,toStationEva]` on the table `SavedJourney` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SavedJourney_userId_fromStationEva_toStationEva_key" ON "SavedJourney"("userId", "fromStationEva", "toStationEva");
