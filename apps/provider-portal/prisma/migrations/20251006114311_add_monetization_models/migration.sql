-- CreateEnum
CREATE TYPE "public"."IncidentSeverity" AS ENUM ('P1', 'P2', 'P3');

-- CreateEnum
CREATE TYPE "public"."IncidentStatus" AS ENUM ('OPEN', 'ACK', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."InvoiceLineType" AS ENUM ('subscription', 'usage', 'addon', 'one_time');

-- CreateEnum
CREATE TYPE "public"."BillingCadence" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "public"."OverrideType" AS ENUM ('FREE', 'DISCOUNT', 'CUSTOM_AMOUNT');

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "lastRetryAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'succeeded',
ADD COLUMN     "stripeChargeId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "renewsAt" TIMESTAMP(3),
    "priceCents" INTEGER NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UsageMeter" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "meter" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageMeter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AddonPurchase" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundedAt" TIMESTAMP(3),
    "meta" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "AddonPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FederationKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "FederationKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Incident" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "severity" "public"."IncidentSeverity" NOT NULL,
    "status" "public"."IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assigneeUserId" TEXT,
    "slaResponseDeadline" TIMESTAMP(3),
    "slaResolveDeadline" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lineType" "public"."InvoiceLineType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceCents" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "orgId" TEXT,
    "audience" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PricePlan" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanPrice" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "unitAmountCents" INTEGER NOT NULL,
    "cadence" "public"."BillingCadence" NOT NULL DEFAULT 'MONTHLY',
    "trialDays" INTEGER DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "stripePriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Offer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentOff" INTEGER,
    "amountOffCents" INTEGER,
    "duration" TEXT,
    "durationMonths" INTEGER,
    "appliesToPlanId" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "percentOff" INTEGER,
    "amountOffCents" INTEGER,
    "duration" TEXT,
    "durationMonths" INTEGER,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "maxRedemptions" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantPriceOverride" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "planId" TEXT,
    "priceId" TEXT,
    "type" "public"."OverrideType" NOT NULL DEFAULT 'DISCOUNT',
    "percentOff" INTEGER,
    "amountOffCents" INTEGER,
    "priceCents" INTEGER,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantPriceOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GlobalMonetizationConfig" (
    "id" TEXT NOT NULL,
    "defaultPlanId" TEXT,
    "defaultPriceId" TEXT,
    "defaultTrialDays" INTEGER DEFAULT 0,
    "publicOnboarding" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalMonetizationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OnboardingInvite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT,
    "planId" TEXT,
    "priceId" TEXT,
    "offerId" TEXT,
    "couponId" TEXT,
    "trialDays" INTEGER DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_orgId_entityType_entityId_createdAt_idx" ON "public"."Activity"("orgId", "entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_orgId_createdAt_idx" ON "public"."Activity"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "Subscription_orgId_status_idx" ON "public"."Subscription"("orgId", "status");

-- CreateIndex
CREATE INDEX "Subscription_status_renewsAt_idx" ON "public"."Subscription"("status", "renewsAt");

-- CreateIndex
CREATE INDEX "UsageMeter_orgId_meter_windowStart_idx" ON "public"."UsageMeter"("orgId", "meter", "windowStart");

-- CreateIndex
CREATE INDEX "UsageMeter_windowStart_windowEnd_idx" ON "public"."UsageMeter"("windowStart", "windowEnd");

-- CreateIndex
CREATE INDEX "AddonPurchase_orgId_sku_status_idx" ON "public"."AddonPurchase"("orgId", "sku", "status");

-- CreateIndex
CREATE INDEX "AddonPurchase_purchasedAt_idx" ON "public"."AddonPurchase"("purchasedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FederationKey_keyId_key" ON "public"."FederationKey"("keyId");

-- CreateIndex
CREATE INDEX "FederationKey_tenantId_scope_idx" ON "public"."FederationKey"("tenantId", "scope");

-- CreateIndex
CREATE INDEX "FederationKey_keyId_disabledAt_idx" ON "public"."FederationKey"("keyId", "disabledAt");

-- CreateIndex
CREATE INDEX "Incident_orgId_status_createdAt_idx" ON "public"."Incident"("orgId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Incident_orgId_severity_idx" ON "public"."Incident"("orgId", "severity");

-- CreateIndex
CREATE INDEX "InvoiceLine_invoiceId_idx" ON "public"."InvoiceLine"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceLine_sourceType_sourceId_idx" ON "public"."InvoiceLine"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "Notification_orgId_createdAt_idx" ON "public"."Notification"("orgId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PricePlan_key_key" ON "public"."PricePlan"("key");

-- CreateIndex
CREATE INDEX "PlanPrice_planId_active_idx" ON "public"."PlanPrice"("planId", "active");

-- CreateIndex
CREATE INDEX "PlanPrice_stripePriceId_idx" ON "public"."PlanPrice"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "public"."Coupon"("code");

-- CreateIndex
CREATE INDEX "TenantPriceOverride_orgId_idx" ON "public"."TenantPriceOverride"("orgId");

-- CreateIndex
CREATE INDEX "TenantPriceOverride_planId_idx" ON "public"."TenantPriceOverride"("planId");

-- CreateIndex
CREATE INDEX "TenantPriceOverride_priceId_idx" ON "public"."TenantPriceOverride"("priceId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingInvite_token_key" ON "public"."OnboardingInvite"("token");

-- CreateIndex
CREATE INDEX "OnboardingInvite_expiresAt_usedAt_idx" ON "public"."OnboardingInvite"("expiresAt", "usedAt");

-- CreateIndex
CREATE INDEX "Payment_orgId_status_idx" ON "public"."Payment"("orgId", "status");

-- CreateIndex
CREATE INDEX "Payment_stripePaymentIntentId_idx" ON "public"."Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_stripeChargeId_idx" ON "public"."Payment"("stripeChargeId");

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsageMeter" ADD CONSTRAINT "UsageMeter_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AddonPurchase" ADD CONSTRAINT "AddonPurchase_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanPrice" ADD CONSTRAINT "PlanPrice_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."PricePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Offer" ADD CONSTRAINT "Offer_appliesToPlanId_fkey" FOREIGN KEY ("appliesToPlanId") REFERENCES "public"."PricePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantPriceOverride" ADD CONSTRAINT "TenantPriceOverride_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantPriceOverride" ADD CONSTRAINT "TenantPriceOverride_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."PricePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantPriceOverride" ADD CONSTRAINT "TenantPriceOverride_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "public"."PlanPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GlobalMonetizationConfig" ADD CONSTRAINT "GlobalMonetizationConfig_defaultPlanId_fkey" FOREIGN KEY ("defaultPlanId") REFERENCES "public"."PricePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GlobalMonetizationConfig" ADD CONSTRAINT "GlobalMonetizationConfig_defaultPriceId_fkey" FOREIGN KEY ("defaultPriceId") REFERENCES "public"."PlanPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingInvite" ADD CONSTRAINT "OnboardingInvite_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."PricePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingInvite" ADD CONSTRAINT "OnboardingInvite_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "public"."PlanPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingInvite" ADD CONSTRAINT "OnboardingInvite_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "public"."Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingInvite" ADD CONSTRAINT "OnboardingInvite_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "public"."Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
