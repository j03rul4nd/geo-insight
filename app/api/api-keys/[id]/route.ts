/**
 * API KEY DETAIL ENDPOINT
 * 
 * DELETE - OBJETIVO:
 * Revocar (eliminar) una API key existente.
 * 
 * MISIÓN:
 * - Validar ownership (apiKey.userId match)
 * - Eliminar ApiKey de DB
 * - Crear ActivityLog: action="api_key.revoked"
 * - Cualquier request futura con esa key será rechazada
 * 
 * PATCH - OBJETIVO (opcional):
 * Actualizar configuración de la key (rate limit, activar/desactivar).
 * 
 * PATCH - MISIÓN:
 * - Validar ownership
 * - Permitir actualizar:
 *   · name (renombrar)
 *   · isActive (true/false para desactivar temporalmente)
 *   · rateLimit (ajustar límite)
 * - NO permitir cambiar: key, prefix, userId
 * 
 * USADO POR:
 * - Botón "Revoke" en /settings/integrations
 * - Toggle "Active/Inactive" en tabla de API keys
 * - Modal de confirmación "Are you sure? This cannot be undone"
 * 
 * PRISMA MODELS:
 * - ApiKey
 * - ActivityLog
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * API KEY DETAIL ENDPOINT
 * 
 * DELETE /api/api-keys/[id]
 * Revocar (eliminar) una API key existente
 * 
 * PATCH /api/api-keys/[id]
 * Actualizar configuración de la key (name, isActive, rateLimit)
 */

// DELETE - Revocar API Key
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verificar que la API key existe y pertenece al usuario
    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        name: true,
        prefix: true,
      },
    })

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    if (apiKey.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this API key' },
        { status: 403 }
      )
    }

    // Eliminar la API key y crear log de actividad en una transacción
    await prisma.$transaction([
      prisma.apiKey.delete({
        where: { id },
      }),
      prisma.activityLog.create({
        data: {
          userId,
          action: 'api_key.revoked',
          resource: 'ApiKey',
          resourceId: id,
          metadata: {
            apiKeyName: apiKey.name,
            apiKeyPrefix: apiKey.prefix,
            revokedAt: new Date().toISOString(),
          },
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
          userAgent: req.headers.get('user-agent') || undefined,
        },
      }),
    ])

    return NextResponse.json(
      {
        success: true,
        message: 'API key revoked successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error revoking API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar configuración de API Key
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()

    // Validar que solo se permiten ciertos campos
    const allowedFields = ['name', 'isActive', 'rateLimit']
    const providedFields = Object.keys(body)
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field))

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}. Only ${allowedFields.join(', ')} can be updated` },
        { status: 400 }
      )
    }

    // Validaciones específicas
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string' },
        { status: 400 }
      )
    }

    if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      )
    }

    if (body.rateLimit !== undefined) {
      if (typeof body.rateLimit !== 'number' || body.rateLimit < 1 || body.rateLimit > 10000) {
        return NextResponse.json(
          { error: 'rateLimit must be a number between 1 and 10000' },
          { status: 400 }
        )
      }
    }

    // Verificar ownership
    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        name: true,
        isActive: true,
        rateLimit: true,
      },
    })

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    if (apiKey.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this API key' },
        { status: 403 }
      )
    }

    // Preparar datos de actualización
    const updateData: {
      name?: string
      isActive?: boolean
      rateLimit?: number
      updatedAt: Date
    } = {
      updatedAt: new Date(),
    }

    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.rateLimit !== undefined) updateData.rateLimit = body.rateLimit

    // Actualizar API key y crear log de actividad
    const [updatedApiKey] = await prisma.$transaction([
      prisma.apiKey.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          prefix: true,
          isActive: true,
          rateLimit: true,
          lastUsedAt: true,
          expiresAt: true,
          usageCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.activityLog.create({
        data: {
          userId,
          action: 'api_key.updated',
          resource: 'ApiKey',
          resourceId: id,
          metadata: {
            changes: body,
            previousValues: {
              name: apiKey.name,
              isActive: apiKey.isActive,
              rateLimit: apiKey.rateLimit,
            },
          },
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
          userAgent: req.headers.get('user-agent') || undefined,
        },
      }),
    ])

    return NextResponse.json(
      {
        success: true,
        apiKey: updatedApiKey,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}