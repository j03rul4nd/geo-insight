"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronUp, Activity, Layers, AlarmCheck, Radar, Shield, FileCode, Globe } from "lucide-react"

interface PricingCardClientProps {
    authCheck: any,
    isSubscribed: boolean,
    createSubscription: () => void,
    createCustomerPortal: () => void,
    backLink: string
}

export default function PricingCardClient({ 
    authCheck, 
    isSubscribed, 
    createSubscription, 
    createCustomerPortal,
    backLink
}: PricingCardClientProps) {
    const [showAllFeatures, setShowAllFeatures] = useState(false)

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
            {/* Header */}
            <header className="w-full border-b border-neutral-900/80 bg-neutral-950/95 backdrop-blur">
                <div className="mx-auto max-w-6xl flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-sm bg-neutral-950 border border-neutral-700/80 flex items-center justify-center shadow-[0_0_0_1px_rgba(0,0,0,0.9)]">
                            <span className="text-xs tracking-tight font-semibold text-neutral-50">RT</span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-xs tracking-tight font-medium text-neutral-200 uppercase">Realtwin</span>
                            <span className="text-[0.65rem] tracking-tight text-neutral-500">Operational Geospatial Layer</span>
                        </div>
                    </div>
                    <a 
                        href={backLink}
                        className="text-xs text-neutral-400 hover:text-neutral-100 transition-colors tracking-tight"
                    >
                        ← Back to Home
                    </a>
                </div>
            </header>

            <main className="flex-1 py-10 sm:py-14 lg:py-20 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    {/* Badge */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center space-x-2 rounded-full border border-neutral-800/80 bg-neutral-950/80 px-3 py-1 shadow-[0_0_0_1px_rgba(0,0,0,0.9)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]"></span>
                            <span className="text-[0.7rem] sm:text-xs tracking-tight text-neutral-400">Early Access · Operational Pricing</span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-12 space-y-4">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-50">
                            Early Access Pricing
                        </h1>
                        <p className="text-base sm:text-lg text-neutral-300/90 max-w-2xl mx-auto">
                            Fixed capacity tiers for teams running continuous operations. Scale from pilot deployments to enterprise infrastructure monitoring.
                        </p>
                    </div>

                    {/* Pricing Card */}
                    <div className="max-w-4xl mx-auto rounded-xl border border-neutral-800/90 bg-neutral-950/95 shadow-[0_0_0_1px_rgba(0,0,0,1)] overflow-hidden">
                        {/* Header */}
                        <div className="border-b border-neutral-900/80 bg-gradient-to-r from-emerald-500/5 to-emerald-400/5 px-4 sm:px-6 py-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs tracking-tight text-emerald-300 uppercase font-medium">Enterprise Operations</span>
                                {isSubscribed && (
                                    <div className="bg-emerald-400/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full border border-emerald-400/30">
                                        Active
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 sm:p-8">
                            {/* Plan Details */}
                            <div className="mb-8">
                                <div className="flex items-baseline justify-center mb-2">
                                    <span className="text-5xl font-semibold tracking-tight text-neutral-50">$4,999</span>
                                    <span className="text-xl text-neutral-400 ml-2">/month</span>
                                </div>
                                <p className="text-center text-sm text-neutral-400 tracking-tight">
                                    Base tier · Scales with throughput requirements
                                </p>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/80 shadow-[0_0_0_1px_rgba(0,0,0,0.9)] mb-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-900/80">
                                    <div className="px-4 py-3.5">
                                        <p className="text-[0.65rem] tracking-tight text-neutral-500 uppercase">Message Throughput</p>
                                        <p className="mt-1 text-sm text-neutral-100 font-medium">50M msg/day</p>
                                        <p className="mt-0.5 text-xs text-neutral-500">Burst capacity included</p>
                                    </div>
                                    <div className="px-4 py-3.5">
                                        <p className="text-[0.65rem] tracking-tight text-neutral-500 uppercase">Broker Connections</p>
                                        <p className="mt-1 text-sm text-neutral-100 font-medium">Up to 5 brokers</p>
                                        <p className="mt-0.5 text-xs text-neutral-500">Multi-cloud topology</p>
                                    </div>
                                    <div className="px-4 py-3.5">
                                        <p className="text-[0.65rem] tracking-tight text-neutral-500 uppercase">Data Retention</p>
                                        <p className="mt-1 text-sm text-neutral-100 font-medium">90 days live</p>
                                        <p className="mt-0.5 text-xs text-neutral-500">Archive on request</p>
                                    </div>
                                </div>
                            </div>

                            {/* Core Capabilities */}
                            <div className="space-y-3 mb-8">
                                <div className="flex items-start space-x-3 p-3 rounded-lg border border-neutral-800/60 bg-neutral-950/60">
                                    <Activity className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-100">Real-Time Geospatial Stream Processing</p>
                                        <p className="text-xs text-neutral-400 mt-0.5">Sub-second MQTT ingest to 3D map rendering with asset reconciliation</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 p-3 rounded-lg border border-neutral-800/60 bg-neutral-950/60">
                                    <Layers className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-100">Configurable Layer & Filter Rules</p>
                                        <p className="text-xs text-neutral-400 mt-0.5">Define data contracts, hierarchies, and operational regions with schemas</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 p-3 rounded-lg border border-neutral-800/60 bg-neutral-950/60">
                                    <AlarmCheck className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-100">Automated Visual Alerting</p>
                                        <p className="text-xs text-neutral-400 mt-0.5">Encode thresholds and escalation states for instant incident detection</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 p-3 rounded-lg border border-neutral-800/60 bg-neutral-950/60">
                                    <Radar className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-100">Unified Operational View</p>
                                        <p className="text-xs text-neutral-400 mt-0.5">Single source of truth for operations, engineering, and field teams</p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="mb-6">
                                {authCheck.isAuthenticated ? (
                                    isSubscribed ? (
                                        <button 
                                            onClick={createCustomerPortal}
                                            className="w-full inline-flex items-center justify-center rounded-md border border-neutral-700/80 bg-neutral-950/60 hover:bg-neutral-900 text-sm font-medium tracking-tight text-neutral-100 px-4 py-3 transition-colors"
                                        >
                                            Manage Subscription
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={createSubscription}
                                            className="w-full inline-flex items-center justify-center rounded-md bg-emerald-400 hover:bg-emerald-300 text-neutral-950 text-sm font-medium tracking-tight px-4 py-3 transition-colors"
                                        >
                                            Request Early Access
                                        </button>
                                    )
                                ) : (
                                    <a 
                                        href="/sign-in?redirect_url=/pricing"
                                        className="w-full inline-flex items-center justify-center rounded-md bg-neutral-50 hover:bg-neutral-200 text-neutral-950 text-sm font-medium tracking-tight px-4 py-3 transition-colors"
                                    >
                                        Sign In to Access
                                    </a>
                                )}
                            </div>

                            <div className="flex items-center justify-center space-x-2 text-xs text-neutral-500 mb-6">
                                <Shield className="w-4 h-4 text-emerald-400/80" strokeWidth={1.5} />
                                <p>Priority evaluation for 24/7 operations · High-consequence systems</p>
                            </div>

                            {/* Expandable Details */}
                            <div className="border-t border-neutral-900/80 pt-6">
                                <button
                                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                                    className="flex items-center justify-between w-full text-neutral-300 hover:text-neutral-100 transition-colors"
                                >
                                    <span className="text-sm font-medium tracking-tight">
                                        {showAllFeatures ? 'Hide detailed specifications' : 'View detailed specifications'}
                                    </span>
                                    {showAllFeatures ? <ChevronUp className="w-4 h-4" strokeWidth={1.5} /> : <ChevronDown className="w-4 h-4" strokeWidth={1.5} />}
                                </button>

                                {showAllFeatures && (
                                    <div className="mt-6 space-y-6 animate-in slide-in-from-top duration-300">
                                        {/* Platform Access */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-semibold text-neutral-100 tracking-tight uppercase text-neutral-500">Platform Access</h4>
                                            <div className="space-y-2 ml-2">
                                                <div className="flex items-start space-x-2 text-sm">
                                                    <span className="mt-1 h-1 w-4 bg-neutral-600 rounded"></span>
                                                    <span className="text-neutral-300">Dedicated deployment environment with isolated data plane</span>
                                                </div>
                                                <div className="flex items-start space-x-2 text-sm">
                                                    <span className="mt-1 h-1 w-4 bg-neutral-600 rounded"></span>
                                                    <span className="text-neutral-300">SSO integration (SAML 2.0 / OIDC) with role-based access control</span>
                                                </div>
                                                <div className="flex items-start space-x-2 text-sm">
                                                    <span className="mt-1 h-1 w-4 bg-neutral-600 rounded"></span>
                                                    <span className="text-neutral-300">API access for programmatic layer configuration and queries</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Integration & Deployment */}
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <FileCode className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                                                <h4 className="text-sm font-semibold text-neutral-100 tracking-tight uppercase text-neutral-500">Integration & Deployment</h4>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                <div className="rounded-md border border-neutral-800/80 bg-neutral-950/80 px-3 py-2.5">
                                                    <p className="text-[0.65rem] tracking-tight text-neutral-500 uppercase">Onboarding</p>
                                                    <p className="mt-1 text-sm text-neutral-100">2-week guided setup</p>
                                                    <p className="mt-0.5 text-xs text-neutral-400">Schema design & broker config</p>
                                                </div>
                                                <div className="rounded-md border border-neutral-800/80 bg-neutral-950/80 px-3 py-2.5">
                                                    <p className="text-[0.65rem] tracking-tight text-neutral-500 uppercase">Support SLA</p>
                                                    <p className="mt-1 text-sm text-neutral-100">4-hour response</p>
                                                    <p className="mt-0.5 text-xs text-neutral-400">Critical incidents prioritized</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compliance & Security */}
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Globe className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                                                <h4 className="text-sm font-semibold text-neutral-100 tracking-tight uppercase text-neutral-500">Compliance & Security</h4>
                                            </div>
                                            <div className="bg-gradient-to-r from-emerald-500/5 to-emerald-400/5 border border-emerald-500/20 rounded-lg p-4">
                                                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                                                    <div className="text-center">
                                                        <p className="text-neutral-100 font-medium">Data residency</p>
                                                        <p className="text-neutral-400">Region-specific hosting</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-neutral-100 font-medium">Audit logs</p>
                                                        <p className="text-neutral-400">Full activity tracking</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-neutral-100 font-medium">Encryption</p>
                                                        <p className="text-neutral-400">At-rest & in-transit</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Usage Notes */}
                                        <div className="text-xs text-neutral-500 space-y-2 border-t border-neutral-900/80 pt-4">
                                            <p>* Message throughput scales with additional capacity tiers. Contact for custom requirements beyond 50M/day.</p>
                                            <p>* Early access prioritizes teams with continuous operations, safety-critical systems, or regulatory requirements.</p>
                                            <p>* No marketing sequences—coordination strictly for evaluation, deployment, and operational updates.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-neutral-900/80 bg-neutral-950">
                <div className="mx-auto max-w-6xl flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-2">
                        <span className="text-[0.7rem] text-neutral-600 tracking-tight">
                            © RealTwin · Internal evaluation only
                        </span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-3 text-[0.7rem] text-neutral-600">
                        <div className="flex items-center space-x-1">
                            <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>Data residency on request</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}