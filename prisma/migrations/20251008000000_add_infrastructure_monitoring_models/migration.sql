-- CreateEnum
CREATE TYPE "InfrastructureService" AS ENUM ('VERCEL_KV', 'VERCEL_POSTGRES', 'VERCEL_PLATFORM', 'VERCEL_BUILD', 'VERCEL_FUNCTIONS', 'VERCEL_BANDWIDTH', 'VERCEL_EDGE_REQUESTS', 'VERCEL_ISR_READS', 'AI_OPENAI', 'AI_CREDITS');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('STORAGE_MB', 'STORAGE_GB', 'COMMANDS_PER_DAY', 'CONNECTIONS', 'LATENCY_MS', 'BANDWIDTH_GB', 'INVOCATIONS', 'BUILD_MINUTES', 'REQUEST_COUNT', 'COST_USD', 'USAGE_PERCENT');

-- CreateEnum
CREATE TYPE "RecommendationPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACKNOWLEDGED', 'IMPLEMENTED', 'DISMISSED');

-- CreateTable
CREATE TABLE "InfrastructureMetric" (
    "id" TEXT NOT NULL,
    "service" "InfrastructureService" NOT NULL,
    "metric" "MetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "InfrastructureMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfrastructureLimit" (
    "id" TEXT NOT NULL,
    "service" "InfrastructureService" NOT NULL,
    "metric" "MetricType" NOT NULL,
    "currentPlan" TEXT NOT NULL,
    "limitValue" DOUBLE PRECISION NOT NULL,
    "warningPercent" DOUBLE PRECISION NOT NULL DEFAULT 75,
    "criticalPercent" DOUBLE PRECISION NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfrastructureLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpgradeRecommendation" (
    "id" TEXT NOT NULL,
    "service" "InfrastructureService" NOT NULL,
    "currentPlan" TEXT NOT NULL,
    "recommendedPlan" TEXT NOT NULL,
    "priority" "RecommendationPriority" NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "currentUsage" DOUBLE PRECISION,
    "usagePercent" DOUBLE PRECISION,
    "currentCost" DOUBLE PRECISION,
    "upgradeCost" DOUBLE PRECISION,
    "revenueImpact" DOUBLE PRECISION,
    "roi" DOUBLE PRECISION,
    "estimatedCostUsd" DOUBLE PRECISION,
    "estimatedSavings" DOUBLE PRECISION,
    "roiMonths" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "implementedAt" TIMESTAMP(3),

    CONSTRAINT "UpgradeRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InfrastructureMetric_service_metric_timestamp_idx" ON "InfrastructureMetric"("service", "metric", "timestamp");

-- CreateIndex
CREATE INDEX "InfrastructureMetric_timestamp_idx" ON "InfrastructureMetric"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "InfrastructureLimit_service_metric_currentPlan_key" ON "InfrastructureLimit"("service", "metric", "currentPlan");

-- CreateIndex
CREATE INDEX "UpgradeRecommendation_service_status_idx" ON "UpgradeRecommendation"("service", "status");

-- CreateIndex
CREATE INDEX "UpgradeRecommendation_priority_status_idx" ON "UpgradeRecommendation"("priority", "status");

