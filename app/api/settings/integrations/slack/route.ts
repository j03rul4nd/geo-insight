/**
 * SLACK INTEGRATION ENDPOINT
 * 
 * POST - OBJETIVO:
 * Guardar y validar Slack webhook URL para notificaciones.
 * 
 * MISIÓN:
 * - Body params:
 *   · slackWebhookUrl (incoming webhook de Slack)
 * - Validar URL format: https://hooks.slack.com/services/...
 * - Hacer POST de prueba a Slack:
 *   · Mensaje: "✅ Slack integration configured successfully!"
 *   · Si falla: devolver error
 * - Si OK: actualizar User.slackWebhookUrl y notificationsSlack=true
 * - Crear ActivityLog: action="integration.slack_connected"
 * 
 * DELETE - OBJETIVO:
 * Desconectar integración de Slack.
 * 
 * DELETE - MISIÓN:
 * - Actualizar User:
 *   · slackWebhookUrl = null
 *   · notificationsSlack = false
 * - Crear ActivityLog: action="integration.slack_disconnected"
 * 
 * USADO POR:
 * - /settings/integrations page
 * - Botón "Connect Slack"
 * - Input de webhook URL + "Test Connection"
 * 
 * CASO DE USO:
 * Cuando Alert crítica se dispara → enviar mensaje a Slack:
 * "🚨 Critical Alert: Temperature exceeded 90°C in Zone 3B"
 * [View Dataset] button
 * 
 * PRISMA MODELS:
 * - User (slackWebhookUrl, notificationsSlack)
 * - ActivityLog
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { headers } from 'next/headers';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Constantes
const SLACK_WEBHOOK_REGEX = /^https:\/\/hooks\.slack\.com\/services\/[A-Z0-9]+\/[A-Z0-9]+\/[A-Za-z0-9]+$/;

const RATE_LIMIT = {
  MAX_REQUESTS: 10,
  WINDOW_MS: 60000, // 1 minuto
} as const;

// Types
interface RateLimitData {
  count: number;
  resetTime: number;
}

interface SlackTestRequest {
  slackWebhookUrl: string;
}

interface SlackTestResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface SlackMessageBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
}

interface SlackMessage {
  text: string;
  blocks?: SlackMessageBlock[];
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

interface SlackIntegrationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface SlackStatusResponse {
  success: boolean;
  connected?: boolean;
  webhookConfigured?: boolean;
  error?: string;
}

// Rate limiting en memoria
const rateLimitMap = new Map<string, RateLimitData>();

/**
 * Obtiene identificador del cliente para rate limiting
 */
async function getClientIdentifier(request: NextRequest): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

/**
 * Verifica el rate limit
 */
function checkRateLimit(clientId: string): RateLimitResult {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);

  // Limpiar entradas expiradas
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!clientData || clientData.resetTime < now) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT.WINDOW_MS,
    });
    return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - 1 };
  }

  if (clientData.count >= RATE_LIMIT.MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  clientData.count++;
  return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - clientData.count };
}

/**
 * Valida el formato de Slack webhook URL
 */
function validateSlackWebhookUrl(url: string): boolean {
  return SLACK_WEBHOOK_REGEX.test(url);
}

/**
 * Envía mensaje de prueba a Slack
 */
async function sendTestSlackMessage(webhookUrl: string): Promise<SlackTestResponse> {
  try {
    const slackMessage: SlackMessage = {
      text: '✅ Slack integration configured successfully!',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*✅ Slack Integration Configured!*\n\nYour workspace is now connected. You\'ll receive critical alerts and insights here.',
          },
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Slack API error: ${response.status} - ${errorText}`,
      };
    }

    // Slack responde con "ok" si el mensaje se envió correctamente
    const responseText = await response.text();
    if (responseText !== 'ok') {
      return {
        success: false,
        error: 'Unexpected response from Slack',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test message',
    };
  }
}

/**
 * Obtiene IP del request
 */
async function getIpAddress(request: NextRequest): Promise<string | null> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  
  return forwarded?.split(',')[0] || realIp || null;
}

/**
 * POST /api/integrations/slack
 * Conecta y valida integración de Slack
 */
export async function POST(request: NextRequest): Promise<NextResponse<SlackIntegrationResponse>> {
  try {
    // Autenticación con Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const clientId = await getClientIdentifier(request);
    const { allowed, remaining } = checkRateLimit(clientId);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Try again in a minute.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Parsear body
    let body: SlackTestRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validaciones
    if (!body.slackWebhookUrl || typeof body.slackWebhookUrl !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'slackWebhookUrl is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (!validateSlackWebhookUrl(body.slackWebhookUrl)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Slack webhook URL. Must be in format: https://hooks.slack.com/services/...',
        },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Enviar mensaje de prueba a Slack
    const testResult = await sendTestSlackMessage(body.slackWebhookUrl);

    if (!testResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: testResult.error || 'Failed to send test message to Slack',
        },
        { status: 400 }
      );
    }

    // Actualizar usuario con webhook URL
    await prisma.user.update({
      where: { id: userId },
      data: {
        slackWebhookUrl: body.slackWebhookUrl,
        notificationsSlack: true,
      },
    });

    // Crear log de actividad
    const activityMetadata: Prisma.JsonObject = {
      webhookConfigured: true,
      timestamp: new Date().toISOString(),
    };

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'integration.slack_connected',
        resource: 'Integration',
        resourceId: 'slack',
        metadata: activityMetadata,
        ipAddress: await getIpAddress(request),
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Slack integration configured successfully',
      },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT.MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Slack integration error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database error occurred',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/slack
 * Desconecta integración de Slack
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<SlackIntegrationResponse>> {
  try {
    // Autenticación con Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verificar que el usuario existe y tiene Slack configurado
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, slackWebhookUrl: true, notificationsSlack: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.slackWebhookUrl && !user.notificationsSlack) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slack integration is not configured',
        },
        { status: 400 }
      );
    }

    // Desconectar Slack
    await prisma.user.update({
      where: { id: userId },
      data: {
        slackWebhookUrl: null,
        notificationsSlack: false,
      },
    });

    // Crear log de actividad
    const activityMetadata: Prisma.JsonObject = {
      disconnectedAt: new Date().toISOString(),
    };

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'integration.slack_disconnected',
        resource: 'Integration',
        resourceId: 'slack',
        metadata: activityMetadata,
        ipAddress: await getIpAddress(request),
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Slack integration disconnected successfully',
    });
  } catch (error) {
    console.error('Slack disconnect error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database error occurred',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/slack
 * Obtiene estado de la integración de Slack
 */
export async function GET(request: NextRequest): Promise<NextResponse<SlackStatusResponse>> {
  try {
    // Autenticación con Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Obtener estado de la integración
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        notificationsSlack: true,
        slackWebhookUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      connected: user.notificationsSlack && !!user.slackWebhookUrl,
      webhookConfigured: !!user.slackWebhookUrl,
    });
  } catch (error) {
    console.error('Slack status error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database error occurred',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}