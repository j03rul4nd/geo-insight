/**

API KEYS ENDPOINT

GET - OBJETIVO:
Listar todas las API keys del usuario para mostrar en /settings/integrations.

GET - MISIÓN:


Consultar ApiKey WHERE userId = currentUser




Ordenar por createdAt DESC




NO devolver el key completo (solo prefix para identificar)




Incluir: name, prefix, isActive, lastUsedAt, expiresAt




Mostrar usageCount vs rateLimit



POST - OBJETIVO:
Generar nueva API key para integraciones externas.

POST - MISIÓN:


Body params:


· name (ej: "Production Integration")
· rateLimit (requests/hora, default 1000)
· expiresAt (opcional, default null = no expira)


Generar key aleatoria: "sk_live_" + random(32 chars)




Hash del key con SHA-256 para almacenar en DB




Guardar prefix (primeros 12 chars) para mostrar en UI




Crear ApiKey en DB




Crear ActivityLog: action="api_key.created"




⚠️ CRÍTICO: Devolver el key completo SOLO en esta response


El usuario debe copiarlo ahora, no se volverá a mostrar

SEGURIDAD:


El key completo NUNCA se almacena en DB (solo hash)




Si usuario pierde el key, debe generar uno nuevo




Rate limit se aplica en middleware de API routes



USADO POR:


/settings/integrations page




Botón "Generate API Key"




Modal de "Your new API key" (mostrar una sola vez)



CASO DE USO:
Usuario quiere enviar datos desde su propio backend:
POST https://yourapp.com/api/datasets/{id}/data
Authorization: Bearer sk_live_abc123...

PRISMA MODELS:


ApiKey (key=hash, prefix, name, isActive, rateLimit, usageCount)




User (para ownership)




ActivityLog
*/

import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

/**
 * API KEYS ENDPOINT
 * 
 * GET /api/api-keys
 * Listar todas las API keys del usuario
 * 
 * POST /api/api-keys
 * Generar nueva API key para integraciones externas
 */

// GET - Listar API Keys del usuario
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Consultar todas las API keys del usuario
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        prefix: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        rateLimit: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
        // NO incluir 'key' (hash) por seguridad
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(
      {
        success: true,
        apiKeys,
        count: apiKeys.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Generar nueva API Key
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Validar body params
    const { name, rateLimit = 1000, expiresAt } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (typeof rateLimit !== 'number' || rateLimit < 1 || rateLimit > 10000) {
      return NextResponse.json(
        { error: 'rateLimit must be a number between 1 and 10000' },
        { status: 400 }
      )
    }

    if (expiresAt !== undefined && expiresAt !== null) {
      const expiryDate = new Date(expiresAt)
      if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
        return NextResponse.json(
          { error: 'expiresAt must be a valid future date' },
          { status: 400 }
        )
      }
    }

    // Generar API key aleatoria: "sk_live_" + 32 caracteres aleatorios
    const randomBytes = crypto.randomBytes(24) // 24 bytes = 32 chars en base64url
    const randomString = randomBytes.toString('base64url').slice(0, 32)
    const apiKeyPlain = `sk_live_${randomString}`

    // Hash del key con SHA-256 para almacenar en DB
    const keyHash = crypto
      .createHash('sha256')
      .update(apiKeyPlain)
      .digest('hex')

    // Guardar prefix (primeros 12 chars) para mostrar en UI
    const prefix = apiKeyPlain.slice(0, 12) // "sk_live_abc1"

    // Crear API key y log de actividad en transacción
    const [newApiKey] = await prisma.$transaction([
      prisma.apiKey.create({
        data: {
          userId,
          name: name.trim(),
          key: keyHash,
          prefix,
          rateLimit,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          isActive: true,
          usageCount: 0,
        },
        select: {
          id: true,
          name: true,
          prefix: true,
          isActive: true,
          rateLimit: true,
          expiresAt: true,
          createdAt: true,
        },
      }),
      prisma.activityLog.create({
        data: {
          userId,
          action: 'api_key.created',
          resource: 'ApiKey',
          resourceId: undefined, // Se asignará después
          metadata: {
            apiKeyName: name.trim(),
            apiKeyPrefix: prefix,
            rateLimit,
            expiresAt: expiresAt || null,
          },
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
          userAgent: req.headers.get('user-agent') || undefined,
        },
      }),
    ])

    // ⚠️ CRÍTICO: Actualizar el ActivityLog con el resourceId correcto
    await prisma.activityLog.updateMany({
      where: {
        userId,
        action: 'api_key.created',
        resourceId: null,
        createdAt: {
          gte: new Date(Date.now() - 5000), // Últimos 5 segundos
        },
      },
      data: {
        resourceId: newApiKey.id,
      },
    })

    // ⚠️ CRÍTICO: Devolver el key completo SOLO en esta response
    // El usuario debe copiarlo ahora, no se volverá a mostrar
    return NextResponse.json(
      {
        success: true,
        message: 'API key created successfully. Please save it securely - you will not be able to see it again.',
        apiKey: {
          ...newApiKey,
          key: apiKeyPlain, // ⚠️ ÚNICA VEZ que se devuelve el key completo
        },
        warning: 'This is the only time the full API key will be displayed. Store it securely.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}