-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "backupCodesHash" TEXT,
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastFailedLogin" TIMESTAMP(3),
ADD COLUMN     "lastPasswordChange" TIMESTAMP(3),
ADD COLUMN     "lastSuccessfulLogin" TIMESTAMP(3),
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpSecret" TEXT;

-- CreateTable
CREATE TABLE "public"."UserRecoveryCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedFrom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRecoveryCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSecurityQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answerHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSecurityQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserBreakglassAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "encryptedEmail" TEXT NOT NULL,
    "encryptedPasswordHash" TEXT NOT NULL,
    "encryptionIV" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivatedAt" TIMESTAMP(3),
    "activationCount" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "canAutoActivate" BOOLEAN NOT NULL DEFAULT true,
    "minDelayMinutes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserBreakglassAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserDeviceFingerprint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "trustScore" INTEGER NOT NULL DEFAULT 0,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loginCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "UserDeviceFingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserLoginHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "method" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "deviceFingerprint" TEXT,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "riskFactors" TEXT,
    "country" TEXT,
    "city" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BreakglassActivationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskFactors" TEXT NOT NULL,
    "delayMinutes" INTEGER NOT NULL,
    "verificationSteps" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "notifiedAdmins" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BreakglassActivationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecoveryRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "verificationToken" TEXT NOT NULL,
    "verificationCode" TEXT,
    "codeExpiresAt" TIMESTAMP(3),
    "codeAttempts" INTEGER NOT NULL DEFAULT 0,
    "riskScore" INTEGER NOT NULL,
    "delayUntil" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "RecoveryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRecoveryCode_userId_idx" ON "public"."UserRecoveryCode"("userId");

-- CreateIndex
CREATE INDEX "UserRecoveryCode_usedAt_idx" ON "public"."UserRecoveryCode"("usedAt");

-- CreateIndex
CREATE INDEX "UserSecurityQuestion_userId_idx" ON "public"."UserSecurityQuestion"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBreakglassAccount_userId_key" ON "public"."UserBreakglassAccount"("userId");

-- CreateIndex
CREATE INDEX "UserBreakglassAccount_orgId_idx" ON "public"."UserBreakglassAccount"("orgId");

-- CreateIndex
CREATE INDEX "UserBreakglassAccount_userId_idx" ON "public"."UserBreakglassAccount"("userId");

-- CreateIndex
CREATE INDEX "UserDeviceFingerprint_userId_idx" ON "public"."UserDeviceFingerprint"("userId");

-- CreateIndex
CREATE INDEX "UserDeviceFingerprint_fingerprint_idx" ON "public"."UserDeviceFingerprint"("fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "UserDeviceFingerprint_userId_fingerprint_key" ON "public"."UserDeviceFingerprint"("userId", "fingerprint");

-- CreateIndex
CREATE INDEX "UserLoginHistory_userId_timestamp_idx" ON "public"."UserLoginHistory"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "UserLoginHistory_success_idx" ON "public"."UserLoginHistory"("success");

-- CreateIndex
CREATE INDEX "UserLoginHistory_riskScore_idx" ON "public"."UserLoginHistory"("riskScore");

-- CreateIndex
CREATE INDEX "BreakglassActivationLog_userId_timestamp_idx" ON "public"."BreakglassActivationLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "BreakglassActivationLog_orgId_timestamp_idx" ON "public"."BreakglassActivationLog"("orgId", "timestamp");

-- CreateIndex
CREATE INDEX "BreakglassActivationLog_riskScore_idx" ON "public"."BreakglassActivationLog"("riskScore");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryRequest_verificationToken_key" ON "public"."RecoveryRequest"("verificationToken");

-- CreateIndex
CREATE INDEX "RecoveryRequest_userId_idx" ON "public"."RecoveryRequest"("userId");

-- CreateIndex
CREATE INDEX "RecoveryRequest_verificationToken_idx" ON "public"."RecoveryRequest"("verificationToken");

-- CreateIndex
CREATE INDEX "RecoveryRequest_status_delayUntil_idx" ON "public"."RecoveryRequest"("status", "delayUntil");

-- AddForeignKey
ALTER TABLE "public"."UserRecoveryCode" ADD CONSTRAINT "UserRecoveryCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSecurityQuestion" ADD CONSTRAINT "UserSecurityQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBreakglassAccount" ADD CONSTRAINT "UserBreakglassAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserDeviceFingerprint" ADD CONSTRAINT "UserDeviceFingerprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLoginHistory" ADD CONSTRAINT "UserLoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
