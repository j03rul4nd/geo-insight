/**
 * INTEGRATIONS OVERVIEW ENDPOINT
 * 
 * GET - OBJETIVO:
 * Obtener estado de todas las integraciones configuradas del usuario.
 * 
 * MISIÓN:
 * - Consultar User WHERE id = currentUser
 * - Consultar ApiKey WHERE userId = currentUser AND isActive = true
 * - Consultar Dataset WHERE userId = currentUser AND source = "mqtt_stream"
 * - Devolver resumen de integraciones:
 *   
 *   · Slack:
 *     - connected (boolean)
 *     - webhookUrl (enmascarado: "https://hooks.slack.com/...xyz")
 *     - lastTestedAt (si guardas cuando se testeó)
 *   
 *   · MQTT Datasets:
 *     - count (número de datasets con MQTT configurado)
 *     - list (array con id, name, status de c/u)
 *   
 *   · API Keys:
 *     - count (número de keys activas)
 *     - list (array con id, name, prefix, lastUsedAt)
 *   
 *   · Webhooks:
 *     - count (datasets con source="webhook")
 *     - list (array con webhookUrl por dataset)
 * 
 * USADO POR:
 * - /settings/integrations page (vista general con cards)
 * - Dashboard de "Connected Services"
 * 
 * EJEMPLO RESPONSE:
 * {
 *   "slack": {
 *     "connected": true,
 *     "webhookUrl": "https://hooks.slack.com/...xyz",
 *     "enabled": true
 *   },
 *   "mqtt": {
 *     "count": 2,
 *     "datasets": [
 *       {
 *         "id": "ds_abc",
 *         "name": "Factory Floor A",
 *         "broker": "emqx.acme.com:1883",
 *         "status": "active"
 *       }
 *     ]
 *   },
 *   "apiKeys": {
 *     "count": 1,
 *     "keys": [
 *       {
 *         "id": "key_123",
 *         "name": "Production API",
 *         "prefix": "sk_live_abc...",
 *         "lastUsedAt": "2025-10-08T14:00:00Z"
 *       }
 *     ]
 *   },
 *   "webhooks": {
 *     "count": 1,
 *     "datasets": [
 *       {
 *         "id": "ds_xyz",
 *         "name": "Sensor Network",
 *         "webhookUrl": "https://yourapp.com/api/ingest/ds_xyz"
 *       }
 *     ]
 *   }
 * }
 * 
 * PRISMA MODELS:
 * - User (slackWebhookUrl, notificationsSlack)
 * - Dataset (WHERE source IN ["mqtt_stream", "webhook"])
 * - ApiKey (WHERE isActive=true)
 */
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Obtener todas las integraciones en paralelo
    const [user, mqttDatasets, webhookDatasets, apiKeys] = await Promise.all([
      // Usuario con configuración de Slack
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          slackWebhookUrl: true,
          notificationsSlack: true,
        },
      }),

      // Datasets MQTT
      prisma.dataset.findMany({
        where: {
          userId,
          source: "mqtt_stream",
        },
        select: {
          id: true,
          name: true,
          status: true,
          mqttBroker: true,
          mqttTopic: true,
          mqttUsername: true,
          lastDataReceived: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      // Datasets Webhook
      prisma.dataset.findMany({
        where: {
          userId,
          source: "webhook",
        },
        select: {
          id: true,
          name: true,
          status: true,
          webhookUrl: true,
          webhookSecret: true,
          lastDataReceived: true,
          totalDataPoints: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      // API Keys activas
      prisma.apiKey.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          prefix: true,
          lastUsedAt: true,
          rateLimit: true,
          usageCount: true,
          expiresAt: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 3. Preparar respuesta de Slack
    const slackConnected = !!(
      user.slackWebhookUrl && 
      user.slackWebhookUrl.startsWith('https://hooks.slack.com/services/')
    );

    const slack = {
      connected: slackConnected,
      enabled: user.notificationsSlack,
      webhookUrl: user.slackWebhookUrl
        ? maskWebhookUrl(user.slackWebhookUrl)
        : null,
      status: slackConnected 
        ? (user.notificationsSlack ? "active" : "configured") 
        : "disconnected",
    };

    // 4. Preparar respuesta de MQTT
    const mqtt = {
      count: mqttDatasets.length,
      datasets: mqttDatasets.map((dataset) => ({
        id: dataset.id,
        name: dataset.name,
        broker: dataset.mqttBroker || "Not configured",
        topic: dataset.mqttTopic || "Not configured",
        username: dataset.mqttUsername || null,
        status: dataset.status,
        lastDataReceived: dataset.lastDataReceived,
        isActive: dataset.status === "active",
        createdAt: dataset.createdAt,
      })),
      hasActive: mqttDatasets.some((d) => d.status === "active"),
    };

    // 5. Preparar respuesta de Webhooks
    const webhooks = {
      count: webhookDatasets.length,
      datasets: webhookDatasets.map((dataset) => ({
        id: dataset.id,
        name: dataset.name,
        webhookUrl: dataset.webhookUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/dataset/${dataset.id}`,
        hasSecret: !!dataset.webhookSecret,
        status: dataset.status,
        totalDataPoints: dataset.totalDataPoints,
        lastDataReceived: dataset.lastDataReceived,
        isActive: dataset.status === "active",
        createdAt: dataset.createdAt,
      })),
      hasActive: webhookDatasets.some((d) => d.status === "active"),
    };

    // 6. Preparar respuesta de API Keys
    const apiKeysData = {
      count: apiKeys.length,
      keys: apiKeys.map((key) => ({
        id: key.id,
        name: key.name,
        prefix: key.prefix,
        lastUsedAt: key.lastUsedAt,
        rateLimit: key.rateLimit,
        usageCount: key.usageCount,
        expiresAt: key.expiresAt,
        isExpired: key.expiresAt ? new Date(key.expiresAt) < new Date() : false,
        createdAt: key.createdAt,
      })),
      hasActive: apiKeys.length > 0,
    };

    // 7. Resumen general
    const summary = {
      totalIntegrations: [
        slackConnected ? 1 : 0,
        mqtt.count,
        webhooks.count,
        apiKeysData.count,
      ].reduce((a, b) => a + b, 0),
      activeIntegrations: [
        slack.status === "active" ? 1 : 0,
        mqtt.hasActive ? 1 : 0,
        webhooks.hasActive ? 1 : 0,
        apiKeysData.hasActive ? 1 : 0,
      ].reduce((a, b) => a + b, 0),
    };

    // 8. Respuesta completa
    return NextResponse.json({
      slack,
      mqtt,
      webhooks,
      apiKeys: apiKeysData,
      summary,
    });

  } catch (error) {
    console.error("[INTEGRATIONS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper: Enmascarar webhook URL
function maskWebhookUrl(url: string): string {
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    
    if (lastPart.length > 8) {
      const masked = lastPart.substring(0, 4) + '...' + lastPart.substring(lastPart.length - 4);
      parts[parts.length - 1] = masked;
      return parts.join('/');
    }
    
    return url.substring(0, 35) + '...';
  } catch {
    return url.substring(0, 35) + '...';
  }
}