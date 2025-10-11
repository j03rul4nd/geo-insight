/**
 * AI INSIGHTS ENDPOINT
 * 
 * GET - OBJETIVO:
 * Listar todos los insights generados por AI para mostrar en /insights page.
 * 
 * GET - MISIÓN:
 * - Consultar Insight WHERE userId = currentUser
 * - Filtros opcionales:
 *   · datasetId (insights de un dataset específico)
 *   · type (anomaly, prediction, optimization, pattern)
 *   · severity (info, warning, critical)
 *   · isResolved (true/false)
 * - Ordenar por createdAt DESC (más recientes primero)
 * - Incluir datos del dataset relacionado (name)
 * - Paginación: page, limit (default 20)
 * 
 * POST - OBJETIVO:
 * Disparar análisis AI sobre un dataset específico.
 * 
 * POST - MISIÓN:
 * - Validar currentAIInsightsUsage < monthlyAIInsightsLimit (o -1 si Pro)
 * - Body params:
 *   · datasetId (OBLIGATORIO)
 *   · type (anomaly | prediction | optimization)
 *   · timeRange (1h, 24h, 7d, 30d)
 * - Consultar DataPoints del dataset en el timeRange especificado
 * - Preparar contexto para Gemini API:
 *   · Agregaciones: avg, min, max, stddev por sensorType
 *   · Timeline de valores
 *   · Thresholds configurados en Dataset.alertThresholds
 * - Llamar a Gemini 2.0 Flash con prompt estructurado:
 *   "Analiza estos datos industriales y detecta anomalías, patrones o
 *    predicciones. Contexto: [datos]. Responde en JSON: {title, summary,
 *    severity, affectedArea, recommendations}"
 * - Parsear respuesta de Gemini
 * - Crear Insight en DB con:
 *   · title, summary, details, recommendations
 *   · severity calculado por AI
 *   · affectedArea (coords si AI las identifica)
 *   · modelUsed="gemini-2.0-flash-exp"
 *   · confidence (si AI lo devuelve)
 * - Incrementar User.currentAIInsightsUsage += 1
 * - Si severity="critical": crear Alert + Notification
 * - Crear ActivityLog: action="insight.generated"
 * 
 * USADO POR:
 * - Botón "Run AI Analysis" en /datasets/[id]
 * - /insights page (lista histórica)
 * - Auto-trigger periódico (cron job futuro)
 * 
 * LÍMITES:
 * - FREE: 3 análisis/mes
 * - PRO: Ilimitado
 * 
 * PRISMA MODELS:
 * - User (currentAIInsightsUsage, monthlyAIInsightsLimit)
 * - Dataset (para validar ownership y obtener alertThresholds)
 * - DataPoint (aggregate queries para contexto)
 * - Insight (crear registro con resultado de AI)
 * - Alert (si severity=critical)
 * - Notification (notificar al usuario)
 * - ActivityLog
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Configuración de límites para evitar costos excesivos
const CONFIG = {
  MAX_DATAPOINTS_PER_ANALYSIS: 5000, // Límite de puntos a analizar
  MIN_COOLDOWN_SECONDS: 60, // Mínimo 1 minuto entre análisis del mismo dataset
  GEMINI_MAX_TOKENS: 2000, // Tokens máximos en respuesta
  ANALYSIS_TIMEOUT_MS: 25000, // 25s (antes del timeout de Vercel)
  GEMINI_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
};

/**
 * GET - Listar insights generados
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Validar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Parsear query params
    const searchParams = req.nextUrl.searchParams;
    const datasetId = searchParams.get("datasetId");
    const type = searchParams.get("type");
    const severity = searchParams.get("severity");
    const isResolved = searchParams.get("isResolved");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    // 3. Construir filtros
    const whereClause: any = {
      userId: userId,
    };

    if (datasetId) whereClause.datasetId = datasetId;
    if (type) whereClause.type = type;
    if (severity) whereClause.severity = severity;
    if (isResolved !== null && isResolved !== undefined) {
      whereClause.isResolved = isResolved === "true";
    }

    // 4. Obtener total para paginación
    const totalInsights = await prisma.insight.count({
      where: whereClause,
    });

    // 5. Obtener insights
    const skip = (page - 1) * limit;
    const insights = await prisma.insight.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      orderBy: { createdAt: "desc" },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // 6. Formatear respuesta
    const formattedInsights = insights.map((insight) => ({
      id: insight.id,
      type: insight.type,
      severity: insight.severity,
      title: insight.title,
      summary: insight.summary,
      details: insight.details,
      recommendations: insight.recommendations,
      affectedArea: insight.affectedArea,
      metricsDelta: insight.metricsDelta,
      isResolved: insight.isResolved,
      resolvedAt: insight.resolvedAt?.toISOString() || null,
      dataset: {
        id: insight.dataset.id,
        name: insight.dataset.name,
        status: insight.dataset.status,
      },
      ai: {
        model: insight.modelUsed,
        confidence: insight.confidence,
        processingTime: insight.processingTimeMs,
        tokensUsed: insight.tokensUsed,
      },
      createdAt: insight.createdAt.toISOString(),
    }));

    const totalPages = Math.ceil(totalInsights / limit);

    return NextResponse.json({
      success: true,
      data: {
        insights: formattedInsights,
        pagination: {
          total: totalInsights,
          page: page,
          limit: limit,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });

  } catch (error) {
    console.error("❌ Error obteniendo insights:", error);
    return NextResponse.json(
      { 
        error: "Error al obtener insights",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Generar nuevo análisis AI
 * 
 * OPTIMIZADO para evitar costos excesivos en Vercel
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Validar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Parsear body
    const body = await req.json().catch(() => ({}));
    const { datasetId, type = "anomaly", timeRange = "24h" } = body;

    if (!datasetId) {
      return NextResponse.json(
        { error: "datasetId es requerido" },
        { status: 400 }
      );
    }

    // Validar type
    const validTypes = ["anomaly", "prediction", "optimization", "pattern"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type debe ser uno de: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // 3. Obtener usuario y validar límites
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentAIInsightsUsage: true,
        monthlyAIInsightsLimit: true,
        lastAIReset: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Validar límite de análisis (a menos que sea Pro = -1)
    if (
      user.monthlyAIInsightsLimit !== -1 &&
      user.currentAIInsightsUsage >= user.monthlyAIInsightsLimit
    ) {
      return NextResponse.json(
        { 
          error: "Límite de análisis AI alcanzado",
          message: `Has alcanzado tu límite mensual de ${user.monthlyAIInsightsLimit} análisis AI.`,
          limit: user.monthlyAIInsightsLimit,
          used: user.currentAIInsightsUsage,
          upgradeUrl: "/pricing"
        },
        { status: 429 }
      );
    }

    // 4. Validar ownership del dataset y cooldown
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
      include: {
        insights: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            createdAt: true,
          },
        },
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset no encontrado o sin acceso" },
        { status: 404 }
      );
    }

    // COOLDOWN: Evitar análisis múltiples muy rápidos
    const lastAnalysis = dataset.insights[0];
    if (lastAnalysis) {
      const secondsSinceLastAnalysis = 
        (Date.now() - lastAnalysis.createdAt.getTime()) / 1000;
      
      if (secondsSinceLastAnalysis < CONFIG.MIN_COOLDOWN_SECONDS) {
        const waitTime = Math.ceil(CONFIG.MIN_COOLDOWN_SECONDS - secondsSinceLastAnalysis);
        return NextResponse.json(
          { 
            error: "Análisis demasiado frecuente",
            message: `Por favor espera ${waitTime} segundos antes del próximo análisis`,
            retryAfter: waitTime,
          },
          { status: 429 }
        );
      }
    }

    // 5. Calcular time range
    const now = new Date();
    let fromDate: Date;
    
    switch (timeRange) {
      case "1h":
        fromDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // 6. OPTIMIZACIÓN: Obtener sample de DataPoints (no todos)
    const totalDataPoints = await prisma.dataPoint.count({
      where: {
        datasetId: datasetId,
        timestamp: { gte: fromDate },
      },
    });

    if (totalDataPoints === 0) {
      return NextResponse.json(
        { error: "No hay datos suficientes en el rango seleccionado para analizar" },
        { status: 400 }
      );
    }

    // Calcular step para sampling
    const step = Math.max(
      1,
      Math.ceil(totalDataPoints / CONFIG.MAX_DATAPOINTS_PER_ANALYSIS)
    );

    // Query con sampling (tomar 1 de cada N)
    const dataPoints = await prisma.$queryRaw<Array<{
      value: number;
      unit: string | null;
      sensorType: string | null;
      sensorId: string | null;
      timestamp: Date;
      x: number;
      y: number;
      z: number | null;
    }>>`
      WITH numbered AS (
        SELECT 
          value, unit, "sensorType", "sensorId", timestamp, x, y, z,
          ROW_NUMBER() OVER (ORDER BY timestamp) as rn
        FROM "DataPoint"
        WHERE "datasetId" = ${datasetId}
          AND timestamp >= ${fromDate}
      )
      SELECT value, unit, "sensorType", "sensorId", timestamp, x, y, z
      FROM numbered
      WHERE MOD(rn - 1, ${step}) = 0
      ORDER BY timestamp DESC
      LIMIT ${CONFIG.MAX_DATAPOINTS_PER_ANALYSIS}
    `;

    // 7. Calcular agregaciones
    const aggregations = await prisma.$queryRaw<Array<{
      sensorType: string;
      avg: number;
      min: number;
      max: number;
      count: bigint;
    }>>`
      SELECT 
        "sensorType",
        AVG(value)::float as avg,
        MIN(value)::float as min,
        MAX(value)::float as max,
        COUNT(*)::bigint as count
      FROM "DataPoint"
      WHERE "datasetId" = ${datasetId}
        AND timestamp >= ${fromDate}
        AND "sensorType" IS NOT NULL
      GROUP BY "sensorType"
    `;

    // 8. Preparar contexto para Gemini (COMPACTO)
    const context = {
      datasetName: dataset.name,
      timeRange: timeRange,
      totalPoints: totalDataPoints,
      sampledPoints: dataPoints.length,
      sensors: aggregations.map(agg => ({
        type: agg.sensorType,
        avg: Math.round(agg.avg * 100) / 100,
        min: Math.round(agg.min * 100) / 100,
        max: Math.round(agg.max * 100) / 100,
        count: Number(agg.count),
      })),
      alertThresholds: dataset.alertThresholds || {},
      recentValues: dataPoints.slice(0, 50).map(dp => ({
        sensor: dp.sensorType,
        value: Math.round(dp.value * 100) / 100,
        time: dp.timestamp.toISOString(),
      })),
    };

    // 9. Preparar prompt según el tipo de análisis
    let analysisPrompt = "";
    
    switch (type) {
      case "anomaly":
        analysisPrompt = "Detecta anomalías, patrones inusuales o valores fuera de rango en los datos.";
        break;
      case "prediction":
        analysisPrompt = "Analiza tendencias y predice comportamientos futuros basándote en los datos históricos.";
        break;
      case "optimization":
        analysisPrompt = "Identifica oportunidades de optimización y eficiencia en el sistema.";
        break;
      case "pattern":
        analysisPrompt = "Identifica patrones recurrentes, correlaciones y comportamientos sistemáticos.";
        break;
    }

    // 10. Validar API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key no configurada" },
        { status: 500 }
      );
    }

    // 11. Llamar a Gemini API con timeout
    const aiStartTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.ANALYSIS_TIMEOUT_MS);

    try {
      const response = await fetch(
        `${CONFIG.GEMINI_ENDPOINT}?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Eres un experto en análisis de datos industriales IoT.

TAREA: ${analysisPrompt}

CONTEXTO DEL DATASET:
${JSON.stringify(context, null, 2)}

IMPORTANTE: Responde SOLO con un JSON válido (sin markdown, sin \`\`\`json) con esta estructura exacta:
{
  "title": "Título descriptivo del insight (max 80 caracteres)",
  "summary": "Resumen ejecutivo en 1-2 oraciones (max 200 caracteres)",
  "details": "Análisis detallado del hallazgo, incluyendo datos específicos y contexto",
  "recommendations": "Recomendaciones accionables y específicas para el usuario",
  "severity": "info|warning|critical",
  "confidence": 0.85,
  "affectedArea": {"sensor": "id_del_sensor", "coords": {"x": 0, "y": 0, "z": 0}},
  "metricsDelta": {"metric": "nombre_metrica", "change": "+15%", "value": 75.5}
}

REGLAS:
- severity debe ser "critical" solo si hay un problema urgente que requiere acción inmediata
- confidence debe ser un número entre 0 y 1
- affectedArea debe incluir coordenadas si detectas patrones espaciales
- metricsDelta debe mostrar cambios significativos en métricas clave
- Sé específico con números, porcentajes y ubicaciones
- NO incluyas markdown en el JSON, solo texto plano`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: CONFIG.GEMINI_MAX_TOKENS,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const aiProcessingTime = Date.now() - aiStartTime;

      // 12. Validar respuesta de Gemini
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error de Gemini API:", errorData);
        
        return NextResponse.json(
          {
            error: "Error al comunicarse con el servicio de AI",
            message: errorData.error?.message || `AI service error: ${response.statusText}`,
            details: errorData,
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      // 13. Validar estructura de respuesta
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Respuesta inválida de Gemini:", data);
        return NextResponse.json(
          { error: "Respuesta inválida del servicio de AI" },
          { status: 500 }
        );
      }

      const aiText = data.candidates[0].content.parts[0].text;

      // 14. Parsear respuesta JSON
      let aiData;
      try {
        // Limpiar markdown si viene envuelto
        const cleanText = aiText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        
        aiData = JSON.parse(cleanText);
      } catch (parseError) {
        console.error("Error parseando respuesta de AI:", aiText);
        return NextResponse.json(
          {
            error: "Error procesando respuesta de AI",
            message: "La AI no devolvió un formato válido",
            rawResponse: aiText.substring(0, 500),
          },
          { status: 500 }
        );
      }

      // 15. Validar campos requeridos
      if (!aiData.title || !aiData.summary || !aiData.severity) {
        console.error("Respuesta de AI incompleta:", aiData);
        return NextResponse.json(
          {
            error: "Respuesta de AI incompleta",
            message: "Faltan campos requeridos en la respuesta",
          },
          { status: 500 }
        );
      }

      // 16. Crear Insight en DB con transacción
      const [insight] = await prisma.$transaction([
        prisma.insight.create({
          data: {
            userId: userId,
            datasetId: datasetId,
            type: type,
            severity: aiData.severity || "info",
            title: aiData.title.substring(0, 255), // Limitar longitud
            summary: aiData.summary,
            details: aiData.details || null,
            recommendations: aiData.recommendations || null,
            affectedArea: aiData.affectedArea || null,
            metricsDelta: aiData.metricsDelta || null,
            modelUsed: "gemini-2.0-flash-exp",
            confidence: aiData.confidence || null,
            processingTimeMs: Date.now() - startTime,
            tokensUsed: data.usageMetadata?.totalTokenCount || null,
          },
        }),
        // 17. Incrementar contador de uso (SOLO si todo fue exitoso)
        prisma.user.update({
          where: { id: userId },
          data: {
            currentAIInsightsUsage: { increment: 1 },
          },
        }),
      ]);

      // 18. Si severity=critical: crear Alert y Notification
      if (aiData.severity === "critical") {
        await Promise.all([
          // Crear alerta
          prisma.alert.create({
            data: {
              datasetId: datasetId,
              name: aiData.title.substring(0, 255),
              condition: `AI Detection: ${type}`,
              thresholdValue: 0,
              currentValue: 0,
              status: "active",
              severity: "critical",
              message: aiData.summary,
            },
          }),
          // Crear notificación
          prisma.notification.create({
            data: {
              userId: userId,
              type: "error",
              title: "🚨 Insight Crítico Detectado",
              message: aiData.summary,
              relatedType: "insight",
              relatedId: insight.id,
              actionUrl: `/insights/${insight.id}`,
            },
          }),
        ]);
      }

      // 19. Log de actividad
      await prisma.activityLog.create({
        data: {
          userId: userId,
          action: "insight.generated",
          resource: "Insight",
          resourceId: insight.id,
          metadata: {
            datasetId: datasetId,
            type: type,
            severity: aiData.severity,
            processingTime: Date.now() - startTime,
            tokensUsed: insight.tokensUsed,
          },
        },
      });

      // 20. Respuesta exitosa
      return NextResponse.json({
        success: true,
        data: {
          insight: {
            id: insight.id,
            type: insight.type,
            severity: insight.severity,
            title: insight.title,
            summary: insight.summary,
            details: insight.details,
            recommendations: insight.recommendations,
            affectedArea: insight.affectedArea,
            metricsDelta: insight.metricsDelta,
            confidence: insight.confidence,
            createdAt: insight.createdAt.toISOString(),
          },
          usage: {
            used: user.currentAIInsightsUsage + 1,
            limit: user.monthlyAIInsightsLimit,
            remaining: user.monthlyAIInsightsLimit === -1 
              ? "unlimited" 
              : user.monthlyAIInsightsLimit - user.currentAIInsightsUsage - 1,
          },
          performance: {
            totalTime: Date.now() - startTime,
            aiProcessingTime: aiProcessingTime,
            dataPointsAnalyzed: dataPoints.length,
            tokensUsed: insight.tokensUsed,
          },
        },
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            error: "Timeout del análisis AI",
            message: "El análisis tardó demasiado tiempo. Intenta con un rango de tiempo menor.",
          },
          { status: 504 }
        );
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error("❌ Error generando insight:", error);
    
    // Si falla, NO incrementar uso
    return NextResponse.json(
      { 
        error: "Error generando análisis AI",
        message: error instanceof Error ? error.message : "Error desconocido",
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}