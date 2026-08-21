-- AlterTable
ALTER TABLE "Train" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organizationId" TEXT;

-- CreateTable
CREATE TABLE "RailwayOrganization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RailwayOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RailwayOrganization_code_key" ON "RailwayOrganization"("code");

-- CreateIndex
CREATE INDEX "RailwayOrganization_name_idx" ON "RailwayOrganization"("name");

-- CreateIndex
CREATE INDEX "Train_organizationId_idx" ON "Train"("organizationId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "RailwayOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Train" ADD CONSTRAINT "Train_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "RailwayOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
