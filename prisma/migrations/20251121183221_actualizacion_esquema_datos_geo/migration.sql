-- CreateTable
CREATE TABLE "MetricConfig" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "valueSelector" TEXT NOT NULL,
    "aggregation" TEXT NOT NULL DEFAULT 'none',
    "windowSize" INTEGER NOT NULL DEFAULT 50,
    "chartType" TEXT NOT NULL DEFAULT 'line',
    "showStats" BOOLEAN NOT NULL DEFAULT true,
    "unit" TEXT,
    "decimals" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetricConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetricConfig_datasetId_createdAt_idx" ON "MetricConfig"("datasetId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MetricConfig_datasetId_name_key" ON "MetricConfig"("datasetId", "name");

-- AddForeignKey
ALTER TABLE "MetricConfig" ADD CONSTRAINT "MetricConfig_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
