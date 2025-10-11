/**
 * SETTINGS GENERAL ENDPOINT
 * 
 * GET - OBJETIVO:
 * Obtener toda la configuración del usuario en un solo endpoint.
 * Alternativa a llamar /profile e /integrations por separado.
 * 
 * MISIÓN:
 * - Consultar User WHERE id = currentUser
 * - Devolver configuración completa:
 *   · Profile: name, email, timezone
 *   · Notifications: notificationsEmail, notificationsSlack
 *   · Integrations: slackWebhookUrl (con status connected/disconnected)
 *   · API Keys: count de keys activas (no las keys en sí)
 * - Validar si integraciones están configuradas:
 *   · Slack: slackWebhookUrl existe y es válida
 *   · MQTT: al menos 1 dataset con source="mqtt_stream"
 * 
 * USADO POR:
 * - /settings page (carga inicial para poblar tabs)
 * - Settings dropdown en header
 * 
 * PRISMA MODELS:
 * - User (all settings fields)
 * - ApiKey (count WHERE isActive=true)
 * - Dataset (count WHERE source="mqtt_stream")
 */
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Verificar autenticación con Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Obtener usuario con relaciones necesarias
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        timezone: true,
        notificationsEmail: true,
        notificationsSlack: true,
        slackWebhookUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 3. Contar API Keys activas
    const activeApiKeysCount = await prisma.apiKey.count({
      where: {
        userId,
        isActive: true,
      },
    });

    // 4. Contar datasets MQTT (para validar integración)
    const mqttDatasetsCount = await prisma.dataset.count({
      where: {
        userId,
        source: "mqtt_stream",
      },
    });

    // 5. Validar estado de integraciones
    const isSlackConnected = !!(
      user.slackWebhookUrl && 
      user.slackWebhookUrl.startsWith('https://hooks.slack.com/services/')
    );

    const isMqttConfigured = mqttDatasetsCount > 0;

    // 6. Preparar respuesta estructurada
    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      notifications: {
        email: {
          enabled: user.notificationsEmail,
        },
        slack: {
          enabled: user.notificationsSlack,
          configured: isSlackConnected,
          webhookUrl: user.slackWebhookUrl 
            ? `${user.slackWebhookUrl.substring(0, 30)}...` // Ocultar URL completa
            : null,
        },
      },
      integrations: {
        slack: {
          connected: isSlackConnected,
          enabled: user.notificationsSlack,
        },
        mqtt: {
          configured: isMqttConfigured,
          datasetsCount: mqttDatasetsCount,
        },
        apiKeys: {
          activeCount: activeApiKeysCount,
        },
      },
    });

  } catch (error) {
    console.error("[SETTINGS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar configuración general
export async function PATCH(request: Request) {
  try {
    // 1. Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parsear body
    const body = await request.json();
    const {
      name,
      timezone,
      notificationsEmail,
      notificationsSlack,
      slackWebhookUrl,
    } = body;

    // 3. Validar datos
    if (timezone && !isValidTimezone(timezone)) {
      return NextResponse.json(
        { error: "Invalid timezone" },
        { status: 400 }
      );
    }

    if (slackWebhookUrl && !slackWebhookUrl.startsWith('https://hooks.slack.com/services/')) {
      return NextResponse.json(
        { error: "Invalid Slack webhook URL" },
        { status: 400 }
      );
    }

    // 4. Preparar datos para actualizar (solo campos presentes)
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (notificationsEmail !== undefined) updateData.notificationsEmail = notificationsEmail;
    if (notificationsSlack !== undefined) updateData.notificationsSlack = notificationsSlack;
    if (slackWebhookUrl !== undefined) updateData.slackWebhookUrl = slackWebhookUrl;

    // Si no hay campos para actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // 5. Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        timezone: true,
        notificationsEmail: true,
        notificationsSlack: true,
        slackWebhookUrl: true,
        updatedAt: true,
      },
    });

    // 6. Devolver respuesta
    return NextResponse.json({
      message: "Settings updated successfully",
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        timezone: updatedUser.timezone,
        updatedAt: updatedUser.updatedAt,
      },
      notifications: {
        email: {
          enabled: updatedUser.notificationsEmail,
        },
        slack: {
          enabled: updatedUser.notificationsSlack,
          configured: !!(updatedUser.slackWebhookUrl),
        },
      },
    });

  } catch (error) {
    console.error("[SETTINGS_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper: Validar timezone
function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}