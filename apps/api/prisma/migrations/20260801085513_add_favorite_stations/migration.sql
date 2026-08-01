-- CreateTable
CREATE TABLE "FavoriteStation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stationEva" INTEGER NOT NULL,
    "stationName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteStation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoriteStation_userId_idx" ON "FavoriteStation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteStation_userId_stationEva_key" ON "FavoriteStation"("userId", "stationEva");

-- AddForeignKey
ALTER TABLE "FavoriteStation" ADD CONSTRAINT "FavoriteStation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
