import React from "react"
import { prisma } from "@/lib/prisma"
import { getStripeSession, stripe } from "@/lib/stripe"
import { unstable_noStore } from "next/cache"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import Link from "next/link"
import { checkAuthenticationAndSubscription } from "@/lib/checkAuthSubscription"
// import PricingCardClient from "./PricingCardClient" // Componente cliente separado
import PricingCardClient from "./PricingCardClientGis" // Componente cliente separado

// Helper function to ensure valid URL format
function ensureValidUrl(url: string): string {
    // Si ya tiene protocolo, devolverla tal como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    // Si es localhost, usar http
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
        return `http://${url}`;
    }
    
    // Para todos los demás casos, usar https
    return `https://${url}`;
}

async function getData(userId: string | null) {
    unstable_noStore()

    if (!userId) return null

    const subscription = await prisma.subscription.findUnique({
        where: {
            userId: userId
        },
        select: {
            status: true,
            user: { select: { stripeCustomerId: true }}
        }
    })

    return subscription
}

export default async function Pricing() {
    // Check authentication status without redirecting
    const authCheck = await checkAuthenticationAndSubscription();
    
    // Get user data if authenticated
    const user = authCheck.isAuthenticated ? await currentUser() : null;
    
    // Get subscription data if authenticated
    const subscription = authCheck.isAuthenticated ? await getData(authCheck.userId) : null;
    
    const isSubscribed = subscription?.status === "active";
    

    async function createSubscription() {
        "use server"

        console.log("🚀 Starting createSubscription function")
        console.log("📊 authCheck:", JSON.stringify(authCheck, null, 2))

        if (!authCheck.userId) {
            console.log("❌ No userId found, redirecting to sign-in")
            return redirect('/sign-in?redirect_url=/pricing')
        }

        console.log("👤 User ID:", authCheck.userId)

        let databaseUser = await prisma.user.findUnique({
            where: {
                id: authCheck.userId
            },
            select: {
                stripeCustomerId: true
            }
        })

        console.log("🗄️ Database user:", JSON.stringify(databaseUser, null, 2))

        if (!databaseUser) {
            console.log("❌ DatabaseUser Not Found")
            throw new Error('DatabaseUser Not Found')
        }

        const email = user?.primaryEmailAddress?.emailAddress
        console.log("📧 User email:", email)
        
        if (!databaseUser.stripeCustomerId) {
            console.log("🔄 Creating new Stripe customer...")
            const customer = await stripe.customers.create({
                email: email
            })

            console.log("✅ Stripe customer created:", customer.id)

            databaseUser = await prisma.user.update({
                where: {
                    id: authCheck.userId
                },
                data: {
                    stripeCustomerId: customer.id
                },
                select: { stripeCustomerId: true }
            })

            console.log("📝 Updated database user:", JSON.stringify(databaseUser, null, 2))
        }

        if (!databaseUser.stripeCustomerId) {
            console.log("❌ Failed to set stripeCustomerId")
            throw new Error('Failed to set stripeCustomerId for the user')
        }

        // Log environment variables
        console.log("🔧 Environment variables:")
        console.log("  - NODE_ENV:", process.env.NODE_ENV)
        console.log("  - NEXT_PUBLIC_URL:", process.env.NEXT_PUBLIC_URL)
        console.log("  - PRODUCTION_URL:", process.env.PRODUCTION_URL)
        console.log("  - STRIPE_PRICE_ID:", process.env.STRIPE_PRICE_ID)

        // Use helper function to ensure valid URL
        const rawDomainUrl = process.env.NEXT_PUBLIC_URL || 
            (process.env.NODE_ENV === 'production' 
                ? process.env.PRODUCTION_URL 
                : 'localhost:3000')

        console.log("🌐 Raw domain URL:", rawDomainUrl)

        if (!rawDomainUrl) {
            console.log("❌ Missing domain URL configuration")
            throw new Error('Missing domain URL configuration')
        }

        const domainUrl = ensureValidUrl(rawDomainUrl)
        console.log("✅ Corrected domain URL:", domainUrl)

        // Validar que la URL sea válida
        try {
            const testUrl = new URL(domainUrl)
            console.log("✅ Domain URL is valid:", testUrl.toString())
        } catch (error) {
            console.log("❌ Invalid domain URL:", error)
            throw new Error(`Invalid domain URL: ${domainUrl}`)
        }

        const successUrl = `${domainUrl}/dashboard?payment=success`
        console.log("🎯 Success URL:", successUrl)

        // Validar que la success URL sea válida
        try {
            const testSuccessUrl = new URL(successUrl)
            console.log("✅ Success URL is valid:", testSuccessUrl.toString())
        } catch (error) {
            console.log("❌ Invalid success URL:", error)
            throw new Error(`Invalid success URL: ${successUrl}`)
        }

        console.log("💳 Creating Stripe session with parameters:")
        console.log("  - customerId:", databaseUser.stripeCustomerId)
        console.log("  - domainUrl:", domainUrl)
        console.log("  - priceId:", process.env.STRIPE_PRICE_ID)
        console.log("  - successUrl:", successUrl)

        try {
            const subscriptionUrl = await getStripeSession({
                customerId: databaseUser.stripeCustomerId,
                domainUrl: domainUrl,
                priceId: process.env.STRIPE_PRICE_ID as string,
                successUrl: successUrl
            })

            console.log("✅ Stripe session created successfully:", subscriptionUrl)
            console.log("🔄 Redirecting to Stripe...")
            
            return redirect(subscriptionUrl)
        } catch (error) {
            console.log("❌ Error creating Stripe session:")
            console.error(error)
            throw error
        }
    }

    async function createCustomerPortal(){
        "use server"

        console.log("🏪 Starting createCustomerPortal function")
        console.log("📊 authCheck:", JSON.stringify(authCheck, null, 2))

        if (!authCheck.userId) {
            console.log("❌ No userId found, redirecting to sign-in")
            return redirect('sign-in?redirect_url=/pricing')
        }

        // Use helper function for return URL as well
        const rawReturnUrl = process.env.NODE_ENV === 'production' 
            ? (process.env.PRODUCTION_URL || 'invoice-saas-1bmqr0p72-joel-links-projects.vercel.app')
            : 'localhost:3000'

        const returnUrl = ensureValidUrl(rawReturnUrl)
        console.log("🔙 Raw return URL:", rawReturnUrl)
        console.log("✅ Corrected return URL:", returnUrl)
        console.log("💳 Stripe Customer ID:", subscription?.user.stripeCustomerId)

        // Validar return URL
        try {
            const testReturnUrl = new URL(returnUrl.replace(/\/$/, ''))
            console.log("✅ Return URL is valid:", testReturnUrl.toString())
        } catch (error) {
            console.log("❌ Invalid return URL:", error)
            throw new Error(`Invalid return URL: ${returnUrl}`)
        }

        try {
            const customerPortalUrl = await stripe.billingPortal.sessions.create({
                customer: subscription?.user.stripeCustomerId as string,
                return_url: returnUrl.replace(/\/$/, '') // Remover trailing slash
            })

            console.log("✅ Customer portal created:", customerPortalUrl.url)
            return redirect(customerPortalUrl.url)
        } catch (error) {
            console.log("❌ Error creating customer portal:")
            console.error(error)
            throw error
        }
    }

    const backLink = authCheck.isAuthenticated ? '/dashboard' : '/';

    return (
        <div className="py-16 px-4 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <PricingCardClient
                    authCheck={authCheck}
                    isSubscribed={isSubscribed}
                    createSubscription={createSubscription}
                    createCustomerPortal={createCustomerPortal}
                    backLink={backLink}
                />
            </div>
        </div>
    )
}