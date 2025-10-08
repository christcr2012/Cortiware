-- CreateEnum
CREATE TYPE "InfrastructureService" AS ENUM ('VERCEL_KV', 'VERCEL_POSTGRES', 'VERCEL_PLATFORM', 'AI_OPENAI', 'AI_CREDITS');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('STORAGE_MB', 'STORAGE_GB', 'COMMANDS_PER_DAY', 'CONNECTIONS', 'LATENCY_MS', 'BANDWIDTH_GB', 'INVOCATIONS', 'BUILD_MINUTES', 'COST_USD', 'USAGE_PERCENT');

-- CreateEnum
CREATE TYPE "RecommendationPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'IMPLEMENTED', 'DISMISSED');

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
    "warnAt" DOUBLE PRECISION,
    "criticalAt" DOUBLE PRECISION,
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

