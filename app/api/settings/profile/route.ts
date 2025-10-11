/**
 * PROFILE SETTINGS ENDPOINT
 * 
 * PATCH - OBJETIVO:
 * Actualizar preferencias del usuario (timezone, notificaciones).
 * 
 * MISIÓN:
 * - Validar userId
 * - Permitir actualizar campos del User:
 *   · timezone (ej: "Europe/Madrid", "America/New_York")
 *   · notificationsEmail (boolean)
 *   · notificationsSlack (boolean)
 *   · slackWebhookUrl (si notificationsSlack=true)
 * - Validar timezone es válido (usar lista de IANA timezones)
 * - Si slackWebhookUrl cambia: hacer test ping a Slack
 * - Crear ActivityLog: action="profile.updated"
 * 
 * USADO POR:
 * - /settings/profile page
 * - Form de "Notification Preferences"
 * 
 * IMPACTO:
 * - timezone: afecta cómo se muestran timestamps en toda la UI
 * - notificationsEmail: si false, no enviar emails de alertas
 * - notificationsSlack: si true, enviar alertas críticas a Slack
 * 
 * PRISMA MODELS:
 * - User (timezone, notificationsEmail, notificationsSlack, slackWebhookUrl)
 * - ActivityLog
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación
const profileUpdateSchema = z.object({
  timezone: z.string().optional().refine(
    (tz) => {
      if (!tz) return true;
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid timezone" }
  ),
  notificationsEmail: z.boolean().optional(),
  notificationsSlack: z.boolean().optional(),
  slackWebhookUrl: z.string().url().optional().nullable(),
});

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

    // 2. Parsear y validar body
    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const {
      timezone,
      notificationsEmail,
      notificationsSlack,
      slackWebhookUrl,
    } = validation.data;

    // 3. Obtener usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        timezone: true,
        notificationsEmail: true,
        notificationsSlack: true,
        slackWebhookUrl: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 4. Validaciones adicionales
    if (notificationsSlack && !slackWebhookUrl && !currentUser.slackWebhookUrl) {
      return NextResponse.json(
        { error: "Slack webhook URL is required when Slack notifications are enabled" },
        { status: 400 }
      );
    }

    // 5. Test ping a Slack si webhook cambió
    if (slackWebhookUrl && slackWebhookUrl !== currentUser.slackWebhookUrl) {
      const slackTestResult = await testSlackWebhook(slackWebhookUrl);
      
      if (!slackTestResult.success) {
        return NextResponse.json(
          { 
            error: "Slack webhook test failed", 
            details: slackTestResult.error 
          },
          { status: 400 }
        );
      }
    }

    // 6. Preparar datos para actualizar
    const updateData: any = {};
    const changes: string[] = [];

    if (timezone !== undefined && timezone !== currentUser.timezone) {
      updateData.timezone = timezone;
      changes.push(`timezone: ${currentUser.timezone} → ${timezone}`);
    }

    if (notificationsEmail !== undefined && notificationsEmail !== currentUser.notificationsEmail) {
      updateData.notificationsEmail = notificationsEmail;
      changes.push(`email notifications: ${currentUser.notificationsEmail} → ${notificationsEmail}`);
    }

    if (notificationsSlack !== undefined && notificationsSlack !== currentUser.notificationsSlack) {
      updateData.notificationsSlack = notificationsSlack;
      changes.push(`slack notifications: ${currentUser.notificationsSlack} → ${notificationsSlack}`);
    }

    if (slackWebhookUrl !== undefined && slackWebhookUrl !== currentUser.slackWebhookUrl) {
      updateData.slackWebhookUrl = slackWebhookUrl;
      changes.push(`slack webhook: ${slackWebhookUrl ? 'updated' : 'removed'}`);
    }

    // Si no hay cambios
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No changes detected" },
        { status: 200 }
      );
    }

    // 7. Actualizar usuario y crear activity log en transacción
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
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
      }),
      prisma.activityLog.create({
        data: {
          userId,
          action: "profile.updated",
          resource: "User",
          resourceId: userId,
          metadata: {
            changes,
            fields: Object.keys(updateData),
          },
        },
      }),
    ]);

    // 8. Respuesta exitosa
    return NextResponse.json({
      message: "Profile updated successfully",
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        timezone: updatedUser.timezone,
        updatedAt: updatedUser.updatedAt,
      },
      notifications: {
        email: updatedUser.notificationsEmail,
        slack: {
          enabled: updatedUser.notificationsSlack,
          configured: !!updatedUser.slackWebhookUrl,
        },
      },
      changes,
    });

  } catch (error) {
    console.error("[PROFILE_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Obtener perfil actual
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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
        email: user.notificationsEmail,
        slack: {
          enabled: user.notificationsSlack,
          configured: !!user.slackWebhookUrl,
          webhookUrl: user.slackWebhookUrl 
            ? `${user.slackWebhookUrl.substring(0, 35)}...` 
            : null,
        },
      },
    });

  } catch (error) {
    console.error("[PROFILE_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper: Test Slack webhook
async function testSlackWebhook(webhookUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "🔔 Test notification from your telemetry platform",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Slack integration test successful!* ✅\n\nYour webhook is configured correctly. You'll receive critical alerts here.",
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Slack API returned ${response.status}: ${errorText}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[SLACK_TEST_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}