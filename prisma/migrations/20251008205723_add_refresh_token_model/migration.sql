-- CreateEnum
CREATE TYPE "public"."ImportStatus" AS ENUM ('PENDING', 'ANALYZING', 'MAPPING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ImportEntityType" AS ENUM ('CUSTOMERS', 'JOBS', 'INVOICES', 'ESTIMATES', 'CONTACTS', 'ADDRESSES', 'NOTES');

-- AlterTable
ALTER TABLE "public"."UpgradeRecommendation" ADD COLUMN     "benefits" TEXT,
ADD COLUMN     "daysToLimit" INTEGER,
ADD COLUMN     "limitValue" DOUBLE PRECISION,
ADD COLUMN     "profitImpact" DOUBLE PRECISION,
ADD COLUMN     "projectedCost" DOUBLE PRECISION,
ADD COLUMN     "risks" TEXT;

-- CreateTable
CREATE TABLE "public"."ImportJob" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" "public"."ImportEntityType" NOT NULL,
    "status" "public"."ImportStatus" NOT NULL DEFAULT 'PENDING',
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "processedRecords" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "skipCount" INTEGER NOT NULL DEFAULT 0,
    "mappingId" TEXT,
    "sampleData" JSONB,
    "fieldMappings" JSONB,
    "transformRules" JSONB,
    "validationRules" JSONB,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImportMapping" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityType" "public"."ImportEntityType" NOT NULL,
    "sourceFormat" TEXT NOT NULL,
    "fieldMappings" JSONB NOT NULL,
    "transformRules" JSONB NOT NULL,
    "validationRules" JSONB NOT NULL,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImportError" (
    "id" TEXT NOT NULL,
    "importJobId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "fieldName" TEXT,
    "errorType" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportJob_orgId_status_createdAt_idx" ON "public"."ImportJob"("orgId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ImportJob_userId_createdAt_idx" ON "public"."ImportJob"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ImportMapping_orgId_entityType_idx" ON "public"."ImportMapping"("orgId", "entityType");

-- CreateIndex
CREATE INDEX "ImportMapping_orgId_isTemplate_idx" ON "public"."ImportMapping"("orgId", "isTemplate");

-- CreateIndex
CREATE INDEX "ImportError_importJobId_errorType_idx" ON "public"."ImportError"("importJobId", "errorType");

-- CreateIndex
CREATE INDEX "ImportError_importJobId_rowNumber_idx" ON "public"."ImportError"("importJobId", "rowNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_sessionId_key" ON "public"."RefreshToken"("sessionId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_sessionId_idx" ON "public"."RefreshToken"("sessionId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."ImportJob" ADD CONSTRAINT "ImportJob_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImportJob" ADD CONSTRAINT "ImportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImportJob" ADD CONSTRAINT "ImportJob_mappingId_fkey" FOREIGN KEY ("mappingId") REFERENCES "public"."ImportMapping"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImportMapping" ADD CONSTRAINT "ImportMapping_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImportError" ADD CONSTRAINT "ImportError_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "public"."ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
