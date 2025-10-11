import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  console.log('🔵 [WEBHOOK] Iniciando procesamiento del webhook de Stripe')
  
  try {
    const body = await req.text()
    console.log('🔵 [WEBHOOK] Body recibido, longitud:', body.length)
    
    const headersList = await headers()
    const signature = headersList.get("Stripe-Signature") as string
    
    console.log('🔵 [WEBHOOK] Signature presente:', !!signature)
    console.log('🔵 [WEBHOOK] STRIPE_WEBHOOK_SECRET configurado:', !!process.env.STRIPE_WEBHOOK_SECRET)
    
    if (!signature) {
      console.error('❌ [WEBHOOK] No se encontró la firma de Stripe')
      return NextResponse.json(
        { error: 'No Stripe signature found' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ [WEBHOOK] STRIPE_WEBHOOK_SECRET no está configurado')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    console.log('🔵 [WEBHOOK] Intentando construir evento de Stripe...')
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log('✅ [WEBHOOK] Evento construido exitosamente')
    console.log('🔵 [WEBHOOK] Tipo de evento:', event.type)
    console.log('🔵 [WEBHOOK] ID del evento:', event.id)

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🟡 [WEBHOOK] Procesando checkout.session.completed')
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        console.log('✅ [WEBHOOK] checkout.session.completed procesado exitosamente')
        break

      case 'customer.subscription.updated':
        console.log('🟡 [WEBHOOK] Procesando customer.subscription.updated')
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        console.log('✅ [WEBHOOK] customer.subscription.updated procesado exitosamente')
        break

      case 'customer.subscription.deleted':
        console.log('🟡 [WEBHOOK] Procesando customer.subscription.deleted')
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        console.log('✅ [WEBHOOK] customer.subscription.deleted procesado exitosamente')
        break

      case 'invoice.payment_succeeded':
        console.log('🟡 [WEBHOOK] Procesando invoice.payment_succeeded')
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        console.log('✅ [WEBHOOK] invoice.payment_succeeded procesado exitosamente')
        break

      default:
        console.warn(`⚠️ [WEBHOOK] Tipo de evento no manejado: ${event.type}`)
    }

    console.log('✅ [WEBHOOK] Webhook procesado exitosamente')
    return NextResponse.json({ received: true }, { status: 200 })

  } catch (err) {
    const error = err as Error
    console.error('❌ [WEBHOOK] Error en el webhook de Stripe:')
    console.error('❌ [WEBHOOK] Mensaje de error:', error.message)
    console.error('❌ [WEBHOOK] Stack trace:', error.stack)
    
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('🔵 [CHECKOUT] Iniciando handleCheckoutCompleted')
  console.log('🔵 [CHECKOUT] Session ID:', session.id)
  console.log('🔵 [CHECKOUT] Customer ID:', session.customer)
  console.log('🔵 [CHECKOUT] Subscription ID:', session.subscription)

  if (!session.subscription || !session.customer) {
    console.warn('⚠️ [CHECKOUT] Falta subscription o customer en la sesión')
    return
  }

  try {
    console.log('🔵 [CHECKOUT] Obteniendo suscripción de Stripe...')
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )
    console.log('✅ [CHECKOUT] Suscripción obtenida:', subscription.id)

    console.log('🔵 [CHECKOUT] Actualizando usuario en la base de datos...')
    // Actualizar suscripción en la base de datos
    await prisma.user.update({
      where: { stripeCustomerId: session.customer as string },
      data: {
        subscription: {
          upsert: {
            create: mapSubscriptionData(subscription),
            update: mapSubscriptionData(subscription)
          }
        }
      }
    })
    console.log('✅ [CHECKOUT] Usuario actualizado en la base de datos')

    console.log('🔵 [CHECKOUT] Buscando usuario para actualizar límites...')
    // Obtener el usuario para actualizar sus límites
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: session.customer as string },
      select: { id: true }
    })

    if (user) {
      console.log('✅ [CHECKOUT] Usuario encontrado:', user.id)
      
      try {
        // Establecer límites PRO para el nuevo suscriptor
        await setPremiumLimits(user.id)
        console.log(`✅ [CHECKOUT] Límites PRO establecidos para el usuario ${user.id}:`)
        console.log('   - Datasets: Ilimitados')
        console.log('   - AI Insights: Ilimitados')
        console.log('   - Data Points: Ilimitados')
      } catch (error) {
        console.error(`❌ [CHECKOUT] Error estableciendo límites PRO para el usuario ${user.id}:`, error)
      }
    } else {
      console.warn('⚠️ [CHECKOUT] No se encontró el usuario con stripeCustomerId:', session.customer)
    }
  } catch (error) {
    console.error('❌ [CHECKOUT] Error en handleCheckoutCompleted:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔵 [SUBSCRIPTION_UPDATED] Iniciando handleSubscriptionUpdated')
  console.log('🔵 [SUBSCRIPTION_UPDATED] Subscription ID:', subscription.id)
  console.log('🔵 [SUBSCRIPTION_UPDATED] Status:', subscription.status)

  try {
    const firstItem = subscription.items.data[0]
    console.log('🔵 [SUBSCRIPTION_UPDATED] Plan ID:', firstItem.plan.id)
    console.log('🔵 [SUBSCRIPTION_UPDATED] Interval:', firstItem.plan.interval)

    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(firstItem.current_period_start * 1000),
        currentPeriodEnd: new Date(firstItem.current_period_end * 1000),
        interval: firstItem.plan.interval,
        planId: firstItem.plan.id
      }
    })
    console.log('✅ [SUBSCRIPTION_UPDATED] Suscripción actualizada en la base de datos')

    // Si la suscripción está activa, mantener los límites PRO
    if (subscription.status === 'active') {
      console.log('🔵 [SUBSCRIPTION_UPDATED] Suscripción activa, manteniendo límites PRO')
      
      // Buscar el usuario asociado a esta suscripción
      const subscriptionRecord = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
        select: { userId: true }
      })

      if (subscriptionRecord) {
        try {
          await setPremiumLimits(subscriptionRecord.userId)
          console.log(`✅ [SUBSCRIPTION_UPDATED] Límites PRO mantenidos para el usuario ${subscriptionRecord.userId}`)
        } catch (error) {
          console.error(`❌ [SUBSCRIPTION_UPDATED] Error manteniendo límites PRO:`, error)
        }
      }
    }
  } catch (error) {
    console.error('❌ [SUBSCRIPTION_UPDATED] Error actualizando suscripción:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('🔵 [SUBSCRIPTION_DELETED] Iniciando handleSubscriptionDeleted')
  console.log('🔵 [SUBSCRIPTION_DELETED] Subscription ID:', subscription.id)

  try {
    // Buscar el usuario antes de eliminar la suscripción para revertir a límites FREE
    const subscriptionRecord = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      select: { userId: true }
    })

    if (subscriptionRecord) {
      try {
        // Revertir a límites FREE del plan gratuito
        await setFreeTierLimits(subscriptionRecord.userId)
        console.log(`✅ [SUBSCRIPTION_DELETED] Límites revertidos a tier FREE para el usuario ${subscriptionRecord.userId}:`)
        console.log('   - Datasets: 1 mensual')
        console.log('   - AI Insights: 3 mensuales')
        console.log('   - Data Points: 100 diarios')
      } catch (error) {
        console.error(`❌ [SUBSCRIPTION_DELETED] Error revirtiendo límites para el usuario ${subscriptionRecord.userId}:`, error)
      }
    }

    await prisma.subscription.delete({
      where: { stripeSubscriptionId: subscription.id }
    })
    console.log('✅ [SUBSCRIPTION_DELETED] Suscripción eliminada de la base de datos')
  } catch (error) {
    console.error('❌ [SUBSCRIPTION_DELETED] Error eliminando suscripción:', error)
    throw error
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('🔵 [PAYMENT_SUCCESS] Iniciando handlePaymentSucceeded')
  console.log('🔵 [PAYMENT_SUCCESS] Invoice ID:', invoice.id)
  console.log('🔵 [PAYMENT_SUCCESS] Customer:', invoice.customer)

  let subscriptionId: string | null = null

  if ('subscription' in invoice && invoice.subscription) {
    subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : (invoice.subscription as Stripe.Subscription)?.id || null
  }

  console.log('🔵 [PAYMENT_SUCCESS] Subscription ID extraído:', subscriptionId)

  if (!subscriptionId) {
    console.warn('⚠️ [PAYMENT_SUCCESS] No se encontró subscription ID en la factura')
    return
  }

  try {
    console.log('🔵 [PAYMENT_SUCCESS] Obteniendo suscripción de Stripe...')
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const firstItem = subscription.items.data[0]

    console.log('🔵 [PAYMENT_SUCCESS] Actualizando períodos de suscripción...')
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id},
      data: {
        currentPeriodStart: new Date(firstItem.current_period_start * 1000),
        currentPeriodEnd: new Date(firstItem.current_period_end * 1000)
      }
    })
    console.log('✅ [PAYMENT_SUCCESS] Períodos de suscripción actualizados')

    console.log('🔵 [PAYMENT_SUCCESS] Buscando registro de suscripción...')
    // Obtener el usuario asociado a esta suscripción
    const subscriptionRecord = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      select: { userId: true }
    })

    if (subscriptionRecord) {
      console.log('✅ [PAYMENT_SUCCESS] Registro de suscripción encontrado, usuario:', subscriptionRecord.userId)
      
      try {
        // Renovar límites PRO en cada pago exitoso (reset mensual)
        await setPremiumLimits(subscriptionRecord.userId)
        console.log(`✅ [PAYMENT_SUCCESS] Límites PRO renovados para el usuario ${subscriptionRecord.userId} después del pago exitoso`)
      } catch (error) {
        console.error(`❌ [PAYMENT_SUCCESS] Error renovando límites PRO para el usuario ${subscriptionRecord.userId}:`, error)
      }
    } else {
      console.warn('⚠️ [PAYMENT_SUCCESS] No se encontró registro de suscripción para:', subscription.id)
    }
  } catch (error) {
    console.error('❌ [PAYMENT_SUCCESS] Error en handlePaymentSucceeded:', error)
    throw error
  }
}

function mapSubscriptionData(subscription: Stripe.Subscription) {
  console.log('🔵 [MAP_SUBSCRIPTION] Mapeando datos de suscripción:', subscription.id)
  
  const firstItem = subscription.items.data[0]
  
  const mappedData = {
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: new Date(firstItem.current_period_start * 1000),
    currentPeriodEnd: new Date(firstItem.current_period_end * 1000),
    interval: firstItem.plan.interval,
    planId: firstItem.plan.id
  }
  
  console.log('🔵 [MAP_SUBSCRIPTION] Datos mapeados:', JSON.stringify(mappedData, null, 2))
  
  return mappedData
}

// ============================================
// FUNCIONES DE GESTIÓN DE LÍMITES
// ============================================

/**
 * Establece límites PRO (ilimitados) para un usuario
 * - Datasets: -1 (ilimitados)
 * - AI Insights: -1 (ilimitados)
 * - Data Points: -1 (ilimitados)
 */
async function setPremiumLimits(userId: string) {
  console.log('🔵 [SET_PREMIUM] Estableciendo límites PRO para usuario:', userId)
  
  const now = new Date()
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      // Límites ilimitados para PRO
      monthlyDatasetsLimit: -1,
      monthlyAIInsightsLimit: -1,
      dailyDataPointsLimit: -1,
      
      // Resetear contadores actuales
      currentDatasetsUsage: 0,
      currentAIInsightsUsage: 0,
      currentDataPointsUsage: 0,
      
      // Actualizar fechas de reset
      lastAIReset: now,
      lastDataPointsReset: now,
    }
  })
  
  console.log('✅ [SET_PREMIUM] Límites PRO establecidos exitosamente')
}

/**
 * Revierte a límites FREE tier para un usuario
 * - Datasets: 1 mensual
 * - AI Insights: 3 mensuales
 * - Data Points: 100 diarios
 */
async function setFreeTierLimits(userId: string) {
  console.log('🔵 [SET_FREE] Revirtiendo a límites FREE para usuario:', userId)
  
  const now = new Date()
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      // Límites del plan FREE
      monthlyDatasetsLimit: 1,
      monthlyAIInsightsLimit: 3,
      dailyDataPointsLimit: 100,
      
      // Resetear contadores actuales
      currentDatasetsUsage: 0,
      currentAIInsightsUsage: 0,
      currentDataPointsUsage: 0,
      
      // Actualizar fechas de reset
      lastAIReset: now,
      lastDataPointsReset: now,
    }
  })
  
  console.log('✅ [SET_FREE] Límites FREE establecidos exitosamente')
}