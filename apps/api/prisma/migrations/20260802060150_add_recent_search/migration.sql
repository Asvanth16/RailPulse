-- CreateEnum
CREATE TYPE "SearchType" AS ENUM ('STATION', 'JOURNEY');

-- CreateTable
CREATE TABLE "RecentSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "searchType" "SearchType" NOT NULL,
    "query" TEXT,
    "fromStationEva" INTEGER,
    "fromStationName" TEXT,
    "toStationEva" INTEGER,
    "toStationName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecentSearch_userId_idx" ON "RecentSearch"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecentSearch_userId_searchType_query_key" ON "RecentSearch"("userId", "searchType", "query");

-- CreateIndex
CREATE UNIQUE INDEX "RecentSearch_userId_searchType_fromStationEva_toStationEva_key" ON "RecentSearch"("userId", "searchType", "fromStationEva", "toStationEva");

-- AddForeignKey
ALTER TABLE "RecentSearch" ADD CONSTRAINT "RecentSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
