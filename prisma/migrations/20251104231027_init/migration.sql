-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "stripeCustomerId" TEXT,
    "monthlyDatasetsLimit" INTEGER NOT NULL DEFAULT 1,
    "currentDatasetsUsage" INTEGER NOT NULL DEFAULT 0,
    "monthlyAIInsightsLimit" INTEGER NOT NULL DEFAULT 3,
    "currentAIInsightsUsage" INTEGER NOT NULL DEFAULT 0,
    "dailyDataPointsLimit" INTEGER NOT NULL DEFAULT 100,
    "currentDataPointsUsage" INTEGER NOT NULL DEFAULT 0,
    "lastAIReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDataPointsReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Madrid',
    "notificationsEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificationsSlack" BOOLEAN NOT NULL DEFAULT false,
    "slackWebhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "stripeSubscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "interval" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("stripeSubscriptionId")
);

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT NOT NULL,
    "viewType" TEXT NOT NULL DEFAULT 'gis',
    "mqttBroker" TEXT,
    "mqttTopic" TEXT,
    "mqttUsername" TEXT,
    "mqttPassword" TEXT,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "apiEndpoint" TEXT,
    "boundingBox" JSONB,
    "totalDataPoints" INTEGER NOT NULL DEFAULT 0,
    "dataPointsToday" INTEGER NOT NULL DEFAULT 0,
    "lastDataReceived" TIMESTAMP(3),
    "avgUpdateFreq" INTEGER,
    "alertsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "alertThresholds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "maxDataPoints" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatasetMapping" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "valuePath" TEXT NOT NULL DEFAULT 'value',
    "xPath" TEXT DEFAULT 'x',
    "yPath" TEXT DEFAULT 'y',
    "zPath" TEXT DEFAULT 'z',
    "sensorIdPath" TEXT DEFAULT 'sensorId',
    "sensorTypePath" TEXT DEFAULT 'sensorType',
    "timestampPath" TEXT NOT NULL DEFAULT 'timestamp',
    "unitPath" TEXT DEFAULT 'unit',
    "metadata" JSONB,
    "transforms" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatasetMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorConfig" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "unit" TEXT,
    "location" JSONB,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensorConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataPoint" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "sensorId" TEXT NOT NULL,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "z" DOUBLE PRECISION,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "sensorConfigId" TEXT,

    CONSTRAINT "DataPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Layer" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "colorScheme" JSONB,
    "opacity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "pointSize" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "filterQuery" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Layer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "thresholdValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "mutedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "details" TEXT,
    "recommendations" TEXT,
    "affectedArea" JSONB,
    "metricsDelta" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "modelUsed" TEXT DEFAULT 'gemini-2.0-flash-exp',
    "confidence" DOUBLE PRECISION,
    "processingTimeMs" INTEGER,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "relatedType" TEXT,
    "relatedId" TEXT,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "rateLimit" INTEGER NOT NULL DEFAULT 1000,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_webhookUrl_key" ON "Dataset"("webhookUrl");

-- CreateIndex
CREATE INDEX "Dataset_userId_status_idx" ON "Dataset"("userId", "status");

-- CreateIndex
CREATE INDEX "Dataset_userId_createdAt_idx" ON "Dataset"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Dataset_viewType_idx" ON "Dataset"("viewType");

-- CreateIndex
CREATE UNIQUE INDEX "DatasetMapping_datasetId_key" ON "DatasetMapping"("datasetId");

-- CreateIndex
CREATE INDEX "DatasetMapping_datasetId_idx" ON "DatasetMapping"("datasetId");

-- CreateIndex
CREATE INDEX "SensorConfig_datasetId_idx" ON "SensorConfig"("datasetId");

-- CreateIndex
CREATE UNIQUE INDEX "SensorConfig_datasetId_sensorId_key" ON "SensorConfig"("datasetId", "sensorId");

-- CreateIndex
CREATE INDEX "DataPoint_datasetId_timestamp_idx" ON "DataPoint"("datasetId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "DataPoint_sensorId_timestamp_idx" ON "DataPoint"("sensorId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "DataPoint_datasetId_x_y_z_idx" ON "DataPoint"("datasetId", "x", "y", "z");

-- CreateIndex
CREATE INDEX "Layer_datasetId_order_idx" ON "Layer"("datasetId", "order");

-- CreateIndex
CREATE INDEX "Alert_datasetId_status_idx" ON "Alert"("datasetId", "status");

-- CreateIndex
CREATE INDEX "Alert_status_severity_idx" ON "Alert"("status", "severity");

-- CreateIndex
CREATE INDEX "Insight_userId_createdAt_idx" ON "Insight"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Insight_datasetId_severity_idx" ON "Insight"("datasetId", "severity");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_userId_isActive_idx" ON "ApiKey"("userId", "isActive");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ActivityLog_action_createdAt_idx" ON "ActivityLog"("action", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dataset" ADD CONSTRAINT "Dataset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetMapping" ADD CONSTRAINT "DatasetMapping_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataPoint" ADD CONSTRAINT "DataPoint_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Layer" ADD CONSTRAINT "Layer_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
