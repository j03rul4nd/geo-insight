/**
 * DATASET EXPORT ENDPOINT
 * 
 * POST - OBJETIVO:
 * Generar archivo exportable (CSV/PDF) con los datos del dataset.
 * 
 * MISIÓN:
 * - Validar ownership
 * - Body params:
 *   · format ("csv" | "pdf")
 *   · timeRange ("24h" | "7d" | "30d" | "all")
 *   · includeInsights (boolean)
 *   · filters (opcional: sensorType, etc)
 * - FREE TIER: Limitar a últimos 100 puntos + CSV only
 * - PRO TIER: Ilimitado + PDF con branding custom
 * - Generar archivo:
 *   · CSV: usar PapaParse para formatear DataPoints
 *   · PDF: renderizar con jsPDF + incluir Recharts screenshots
 * - Subir a storage (Supabase Storage o S3)
 * - Devolver downloadUrl con expiry (1 hora)
 * - Crear ActivityLog: action="dataset.exported"
 * 
 * FORMATO CSV:
 * timestamp,x,y,z,value,unit,sensorId,sensorType
 * 2025-10-08T14:30:00Z,45.2,12.8,3.5,78.5,°C,S-042,temperature
 * 
 * FORMATO PDF:
 * - Header: Dataset name, date range, logo
 * - Section 1: Stats summary
 * - Section 2: Charts (timeline, distribution)
 * - Section 3: AI Insights (si includeInsights=true)
 * - Section 4: Raw data table (primeros 1000 puntos)
 * 
 * USADO POR:
 * - Botón "Export" en /datasets/[id]
 * - Export modal con opciones
 * 
 * PRISMA MODELS:
 * - Dataset
 * - DataPoint (filtered query)
 * - Insight (si includeInsights=true)
 * - User (para validar tier y limitar exports)
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ============================================
// TYPES
// ============================================

type ExportFormat = "csv" | "pdf";
type TimeRange = "24h" | "7d" | "30d" | "all";

interface ExportRequestBody {
  format: ExportFormat;
  timeRange: TimeRange;
  includeInsights?: boolean;
  filters?: {
    sensorType?: string;
    sensorId?: string;
    minValue?: number;
    maxValue?: number;
  };
}

interface DataPointExport {
  timestamp: string;
  x: number;
  y: number;
  z: number | null;
  value: number;
  unit: string | null;
  sensorId: string | null;
  sensorType: string | null;
}

// ============================================
// HELPER: Calculate time range
// ============================================

function getTimeRangeDate(range: TimeRange): Date | null {
  if (range === "all") return null;

  const now = new Date();
  const hours: Record<Exclude<TimeRange, "all">, number> = {
    "24h": 24,
    "7d": 168, // 7 * 24
    "30d": 720, // 30 * 24
  };

  return new Date(now.getTime() - hours[range] * 60 * 60 * 1000);
}

// ============================================
// HELPER: Generate CSV
// ============================================

function generateCSV(dataPoints: DataPointExport[]): string {
  const csv = Papa.unparse(dataPoints, {
    columns: ["timestamp", "x", "y", "z", "value", "unit", "sensorId", "sensorType"],
    header: true,
  });

  return csv;
}

// ============================================
// HELPER: Generate PDF
// ============================================

function generatePDF(
  dataset: any,
  dataPoints: DataPointExport[],
  insights: any[],
  includeInsights: boolean
): Buffer {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.text(dataset.name, 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Total Data Points: ${dataset.totalDataPoints}`, 20, yPosition);
  yPosition += 15;

  // Section 1: Stats Summary
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Statistics Summary", 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  const stats = [
    ["Metric", "Value"],
    ["Total Data Points", dataset.totalDataPoints.toString()],
    ["Data Points Today", dataset.dataPointsToday.toString()],
    ["Last Data Received", dataset.lastDataReceived ? new Date(dataset.lastDataReceived).toLocaleString() : "N/A"],
    ["Status", dataset.status],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [stats[0]],
    body: stats.slice(1),
    theme: "striped",
    headStyles: { fillColor: [66, 66, 66] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Section 2: AI Insights (if enabled)
  if (includeInsights && insights.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text("AI Insights", 20, yPosition);
    yPosition += 10;

    insights.slice(0, 5).forEach((insight) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`• ${insight.title}`, 25, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      const summaryLines = doc.splitTextToSize(insight.summary, 160);
      doc.text(summaryLines, 30, yPosition);
      yPosition += summaryLines.length * 5 + 5;

      doc.setTextColor(0);
    });

    yPosition += 10;
  }

  // Section 3: Raw Data Table
  if (yPosition > 200 || includeInsights) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.text("Raw Data", 20, yPosition);
  yPosition += 10;

  const tableData = dataPoints.slice(0, 1000).map((dp) => [
    new Date(dp.timestamp).toLocaleString(),
    dp.x.toFixed(2),
    dp.y.toFixed(2),
    dp.z?.toFixed(2) || "N/A",
    dp.value.toFixed(2),
    dp.unit || "",
    dp.sensorType || "",
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Timestamp", "X", "Y", "Z", "Value", "Unit", "Type"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 8 },
  });

  return Buffer.from(doc.output("arraybuffer"));
}

// ============================================
// HELPER: Upload to Supabase Storage (mock)
// ============================================

async function uploadToStorage(
  fileName: string,
  content: Buffer | string,
  contentType: string
): Promise<string> {
  // TODO: Implement actual Supabase Storage upload
  // For now, return a mock signed URL
  
  // Example with Supabase:
  // const { data, error } = await supabase.storage
  //   .from('exports')
  //   .upload(fileName, content, { contentType, upsert: true });
  
  // if (error) throw error;
  
  // const { data: signedUrl } = await supabase.storage
  //   .from('exports')
  //   .createSignedUrl(fileName, 3600); // 1 hour expiry
  
  // return signedUrl.signedUrl;

  // Mock implementation - replace with actual storage
  const mockUrl = `https://storage.example.com/exports/${fileName}?expires=3600`;
  return mockUrl;
}

// ============================================
// POST /api/datasets/[id]/export
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // 1. Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse body
    const body: ExportRequestBody = await request.json();
    const { format, timeRange, includeInsights = false, filters } = body;

    // Validate format
    if (!["csv", "pdf"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be 'csv' or 'pdf'" },
        { status: 400 }
      );
    }

    // Validate timeRange
    if (!["24h", "7d", "30d", "all"].includes(timeRange)) {
      return NextResponse.json(
        { error: "Invalid timeRange. Must be '24h', '7d', '30d', or 'all'" },
        { status: 400 }
      );
    }

    // 3. Get user and check tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isProTier = user.subscription?.status === "active";

    // 4. Get dataset and validate ownership
    const { id: datasetId } = await params;
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    if (dataset.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this dataset" },
        { status: 403 }
      );
    }

    // 5. FREE TIER limitations
    if (!isProTier) {
      if (format === "pdf") {
        return NextResponse.json(
          { error: "PDF export is only available for PRO users" },
          { status: 403 }
        );
      }
    }

    // 6. Build DataPoint query with filters
    const fromDate = getTimeRangeDate(timeRange);
    const whereClause: any = {
      datasetId: datasetId,
    };

    if (fromDate) {
      whereClause.timestamp = { gte: fromDate };
    }

    if (filters?.sensorType) {
      whereClause.sensorType = filters.sensorType;
    }

    if (filters?.sensorId) {
      whereClause.sensorId = filters.sensorId;
    }

    if (filters?.minValue !== undefined || filters?.maxValue !== undefined) {
      whereClause.value = {};
      if (filters.minValue !== undefined) {
        whereClause.value.gte = filters.minValue;
      }
      if (filters.maxValue !== undefined) {
        whereClause.value.lte = filters.maxValue;
      }
    }

    // Apply FREE tier limit (100 points max)
    const limitPoints = !isProTier ? 100 : undefined;

    const dataPoints = await prisma.dataPoint.findMany({
      where: whereClause,
      orderBy: { timestamp: "desc" },
      take: limitPoints,
      select: {
        timestamp: true,
        x: true,
        y: true,
        z: true,
        value: true,
        unit: true,
        sensorId: true,
        sensorType: true,
      },
    });

    // 7. Format data for export
    const exportData: DataPointExport[] = dataPoints.map((dp) => ({
      timestamp: dp.timestamp.toISOString(),
      x: dp.x,
      y: dp.y,
      z: dp.z,
      value: dp.value,
      unit: dp.unit,
      sensorId: dp.sensorId,
      sensorType: dp.sensorType,
    }));

    // 8. Get insights if requested (PRO only)
    let insights: any[] = [];
    if (includeInsights && isProTier) {
      insights = await prisma.insight.findMany({
        where: { datasetId: datasetId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          title: true,
          summary: true,
          severity: true,
          type: true,
          createdAt: true,
        },
      });
    }

    // 9. Generate file based on format
    let fileContent: Buffer | string;
    let contentType: string;
    let fileName: string;

    if (format === "csv") {
      fileContent = generateCSV(exportData);
      contentType = "text/csv";
      fileName = `${dataset.name.replace(/\s+/g, "_")}_${timeRange}_${Date.now()}.csv`;
    } else {
      // PDF
      fileContent = generatePDF(dataset, exportData, insights, includeInsights);
      contentType = "application/pdf";
      fileName = `${dataset.name.replace(/\s+/g, "_")}_${timeRange}_${Date.now()}.pdf`;
    }

    // 10. Upload to storage
    const downloadUrl = await uploadToStorage(fileName, fileContent, contentType);

    // 11. Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: "dataset.exported",
        resource: "Dataset",
        resourceId: datasetId,
        metadata: {
          format,
          timeRange,
          includeInsights,
          dataPointsCount: exportData.length,
          fileName,
        },
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        userAgent: request.headers.get("user-agent"),
      },
    });

    // 12. Return response
    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName,
      expiresIn: 3600, // 1 hour in seconds
      metadata: {
        format,
        timeRange,
        dataPointsExported: exportData.length,
        includeInsights: includeInsights && isProTier,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("[DATASET_EXPORT_ERROR]", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}