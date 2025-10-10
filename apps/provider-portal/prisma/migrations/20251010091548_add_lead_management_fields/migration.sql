-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClassificationType" AS ENUM ('EMPLOYEE_REFERRAL', 'DUPLICATE', 'INVALID_CONTACT', 'OUT_OF_SERVICE_AREA', 'SPAM');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "disputeStatus" "DisputeStatus" DEFAULT 'NONE',
ADD COLUMN     "disputeReason" TEXT,
ADD COLUMN     "disputeResolvedAt" TIMESTAMP(3),
ADD COLUMN     "disputeResolvedBy" TEXT,
ADD COLUMN     "classificationType" "ClassificationType",
ADD COLUMN     "classificationReason" TEXT,
ADD COLUMN     "classifiedAt" TIMESTAMP(3),
ADD COLUMN     "classifiedBy" TEXT,
ADD COLUMN     "qualityScore" INTEGER,
ADD COLUMN     "qualityNotes" TEXT,
ADD COLUMN     "qualityScoredAt" TIMESTAMP(3),
ADD COLUMN     "qualityScoredBy" TEXT;

-- CreateIndex
CREATE INDEX "Lead_orgId_disputeStatus_idx" ON "Lead"("orgId", "disputeStatus");

