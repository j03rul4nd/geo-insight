import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  console.log('🔵 [CLERK_WEBHOOK] Webhook endpoint hit')

  const SIGNING_SECRET = process.env.WEBHOOK_SECRET

  if (!SIGNING_SECRET) {
    console.error('❌ [CLERK_WEBHOOK] SIGNING_SECRET not found')
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)
  console.log('✅ [CLERK_WEBHOOK] Svix Webhook instance created')

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  console.log('🔵 [CLERK_WEBHOOK] Headers received:', { 
    svix_id: !!svix_id, 
    svix_timestamp: !!svix_timestamp, 
    svix_signature: !!svix_signature 
  })

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ [CLERK_WEBHOOK] Missing Svix headers')
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)
  console.log('🔵 [CLERK_WEBHOOK] Payload received, length:', body.length)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
    console.log('✅ [CLERK_WEBHOOK] Webhook verified successfully')
  } catch (err) {
    console.error('❌ [CLERK_WEBHOOK] Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  console.log('🔵 [CLERK_WEBHOOK] Event type:', evt.type)

  // Handle user creation
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    try {
      console.log('🟡 [USER_CREATED] Processing new user:', id)
      
      const fullName = `${first_name || ''} ${last_name || ''}`.trim()
      const email = email_addresses[0].email_address

      // 1. Crear customer en Stripe
      console.log('🔵 [USER_CREATED] Creating Stripe customer...')
      const customer = await stripe.customers.create({
        email,
        name: fullName || undefined,
        metadata: {
          clerkUserId: id
        }
      })
      console.log('✅ [USER_CREATED] Stripe customer created:', customer.id)

      // 2. Crear usuario en Prisma con límites FREE tier por defecto
      console.log('🔵 [USER_CREATED] Creating user in database...')
      await prisma.user.create({
        data: {
          id,
          email,
          name: fullName || null,
          stripeCustomerId: customer.id,
          
          // Límites FREE tier por defecto
          monthlyDatasetsLimit: 1,
          currentDatasetsUsage: 0,
          monthlyAIInsightsLimit: 3,
          currentAIInsightsUsage: 0,
          dailyDataPointsLimit: 100,
          currentDataPointsUsage: 0,
          
          // Fechas de reset iniciales
          lastAIReset: new Date(),
          lastDataPointsReset: new Date(),
          
          // Preferencias por defecto
          timezone: 'Europe/Madrid',
          notificationsEmail: true,
          notificationsSlack: false,
        }
      })

      console.log(`✅ [USER_CREATED] User ${id} inserted into database with FREE tier limits:`)
      console.log('   - Datasets: 1 mensual')
      console.log('   - AI Insights: 3 mensuales')
      console.log('   - Data Points: 100 diarios')
      console.log('   - Stripe Customer ID:', customer.id)
      
    } catch (error) {
      console.error('❌ [USER_CREATED] Error saving user to database:', error)
      return new Response('Error saving user', { status: 500 })
    }
  }

  // Handle user updates
  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data

    try {
      console.log('🟡 [USER_UPDATED] Processing user update:', id)
      
      const fullName = `${first_name || ''} ${last_name || ''}`.trim()
      const email = email_addresses[0].email_address

      await prisma.user.update({
        where: { id },
        data: {
          email,
          name: fullName || null,
        }
      })

      console.log(`✅ [USER_UPDATED] User ${id} updated in database`)
      
    } catch (error) {
      console.error('❌ [USER_UPDATED] Error updating user:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  // Handle user deletion
  if (evt.type === 'user.deleted') {
    const { id } = evt.data

    try {
      console.log('🟡 [USER_DELETED] Processing user deletion:', id)
      
      // Buscar el usuario para obtener su Stripe customer ID
      const user = await prisma.user.findUnique({
        where: { id },
        select: { stripeCustomerId: true }
      })

      // Eliminar customer de Stripe si existe
      if (user?.stripeCustomerId) {
        console.log('🔵 [USER_DELETED] Deleting Stripe customer:', user.stripeCustomerId)
        try {
          await stripe.customers.del(user.stripeCustomerId)
          console.log('✅ [USER_DELETED] Stripe customer deleted')
        } catch (stripeError) {
          console.error('⚠️ [USER_DELETED] Error deleting Stripe customer:', stripeError)
          // Continuar con la eliminación del usuario aunque falle Stripe
        }
      }

      // Eliminar usuario de Prisma (cascade eliminará todo lo relacionado)
      await prisma.user.delete({
        where: { id }
      })

      console.log(`✅ [USER_DELETED] User ${id} deleted from database`)
      console.log('   - All related data (datasets, insights, alerts) cascade deleted')
      
    } catch (error) {
      console.error('❌ [USER_DELETED] Error deleting user:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  console.log('✅ [CLERK_WEBHOOK] Webhook processing complete')
  return new Response('Webhook received', { status: 200 })
}