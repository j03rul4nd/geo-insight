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
        <div className="min-h-screen text-neutral-100 antialiased">          
            <main className="flex-1 py-10 sm:py-14 lg:py-20 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
                    <a 
                        href={backLink}
                        className="glass-button rounded-full px-3 py-1 text-xs text-neutral-100 hover:text-white transition-colors tracking-tight relative overflow-hidden"
                        style={{
                            background: 'rgba(20, 20, 20, 0.7)',
                            backdropFilter: 'blur(40px)',
                            WebkitBackdropFilter: 'blur(40px)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        ← Back to Home
                    </a>
                </div>
                <div className="mx-auto max-w-6xl">
                    {/* Badge */}
                    <div className="flex justify-center mb-6">
                        <div 
                            className="inline-flex items-center space-x-2 rounded-full px-3 py-1 relative overflow-hidden"
                            style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_3px_rgba(16,185,129,0.4)]"></span>
                            <span className="text-[0.7rem] sm:text-xs tracking-tight text-white font-medium">Early Access · Operational Pricing</span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-12 space-y-4">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                            Early Access Pricing
                        </h1>
                        <p className="text-base sm:text-lg text-neutral-100 max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            Fixed capacity tiers for teams running continuous operations. Scale from pilot deployments to enterprise infrastructure monitoring.
                        </p>
                    </div>

                    {/* Pricing Card */}
                    <div 
                        className="max-w-4xl mx-auto rounded-[28px] overflow-hidden relative"
                        style={{
                            background: 'rgba(30, 30, 30, 0.6)',
                            backdropFilter: 'blur(60px)',
                            WebkitBackdropFilter: 'blur(60px)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)'
                        }}
                    >
                        {/* Gradient border effect */}
                        <div 
                            className="absolute inset-0 rounded-[28px] pointer-events-none"
                            style={{
                                padding: '1px',
                                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 41%, rgba(255, 255, 255, 0) 57%, rgba(255, 255, 255, 0.1) 100%)',
                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor',
                                maskComposite: 'exclude'
                            }}
                        ></div>
                        
                        {/* Header */}
                        <div 
                            className="border-b px-4 sm:px-6 py-3 relative"
                            style={{
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                background: 'linear-gradient(to right, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.08))'
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs tracking-tight text-emerald-300 uppercase font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Enterprise Operations</span>
                                {isSubscribed && (
                                    <div 
                                        className="text-emerald-200 text-xs px-2.5 py-1 rounded-full"
                                        style={{
                                            background: 'rgba(16, 185, 129, 0.25)',
                                            border: '1px solid rgba(16, 185, 129, 0.4)',
                                            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                                        }}
                                    >
                                        Active
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 sm:p-8">
                            {/* Plan Details */}
                            <div className="mb-8">
                                <div className="flex items-baseline justify-center mb-2">
                                    <span className="text-5xl font-semibold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">$95</span>
                                    <span className="text-xl text-neutral-200 ml-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">/month</span>
                                </div>
                                <p className="text-center text-sm text-neutral-200 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                                    Base tier · Scales with throughput requirements
                                </p>
                            </div>

                            {/* Key Metrics Grid */}
                            <div 
                                className="rounded-2xl mb-6 relative overflow-hidden"
                                style={{
                                    background: 'rgba(20, 20, 20, 0.5)',
                                    backdropFilter: 'blur(40px)',
                                    WebkitBackdropFilter: 'blur(40px)',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
                                }}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                    <div className="px-4 py-3.5">
                                        <p className="text-[0.65rem] tracking-tight text-neutral-400 uppercase font-medium">Message Throughput</p>
                                        <p className="mt-1 text-sm text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">50M msg/day</p>
                                        <p className="mt-0.5 text-xs text-neutral-300">Burst capacity included</p>
                                    </div>
                                    <div className="px-4 py-3.5">
                                        <p className="text-[0.65rem] tracking-tight text-neutral-400 uppercase font-medium">Broker Connections</p>
                                        <p className="mt-1 text-sm text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Up to 5 brokers</p>
                                        <p className="mt-0.5 text-xs text-neutral-300">Multi-cloud topology</p>
                                    </div>
                                    <div className="px-4 py-3.5">
                                        <p className="text-[0.65rem] tracking-tight text-neutral-400 uppercase font-medium">Data Retention</p>
                                        <p className="mt-1 text-sm text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">90 days live</p>
                                        <p className="mt-0.5 text-xs text-neutral-300">Archive on request</p>
                                    </div>
                                </div>
                            </div>

                            {/* Core Capabilities */}
                            <div className="space-y-3 mb-8">
                                <div 
                                    className="flex items-start space-x-3 p-3 rounded-xl relative overflow-hidden"
                                    style={{
                                        background: 'rgba(20, 20, 20, 0.5)',
                                        backdropFilter: 'blur(40px)',
                                        WebkitBackdropFilter: 'blur(40px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
                                    }}
                                >
                                    <Activity className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" strokeWidth={1.5} />
                                    <div>
                                        <p className="text-sm font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Real-Time Geospatial Stream Processing</p>
                                        <p className="text-xs text-neutral-300 mt-0.5">Sub-second MQTT ingest to 3D map rendering with asset reconciliation</p>
                                    </div>
                                </div>

                                <div 
                                    className="flex items-start space-x-3 p-3 rounded-xl relative overflow-hidden"
                                    style={{
                                        background: 'rgba(20, 20, 20, 0.5)',
                                        backdropFilter: 'blur(40px)',
                                        WebkitBackdropFilter: 'blur(40px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
                                    }}
                                >
                                    <Layers className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" strokeWidth={1.5} />
                                    <div>
                                        <p className="text-sm font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Configurable Layer & Filter Rules</p>
                                        <p className="text-xs text-neutral-300 mt-0.5">Define data contracts, hierarchies, and operational regions with schemas</p>
                                    </div>
                                </div>

                                <div 
                                    className="flex items-start space-x-3 p-3 rounded-xl relative overflow-hidden"
                                    style={{
                                        background: 'rgba(20, 20, 20, 0.5)',
                                        backdropFilter: 'blur(40px)',
                                        WebkitBackdropFilter: 'blur(40px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
                                    }}
                                >
                                    <AlarmCheck className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" strokeWidth={1.5} />
                                    <div>
                                        <p className="text-sm font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Automated Visual Alerting</p>
                                        <p className="text-xs text-neutral-300 mt-0.5">Encode thresholds and escalation states for instant incident detection</p>
                                    </div>
                                </div>

                                <div 
                                    className="flex items-start space-x-3 p-3 rounded-xl relative overflow-hidden"
                                    style={{
                                        background: 'rgba(20, 20, 20, 0.5)',
                                        backdropFilter: 'blur(40px)',
                                        WebkitBackdropFilter: 'blur(40px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
                                    }}
                                >
                                    <Radar className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" strokeWidth={1.5} />
                                    <div>
                                        <p className="text-sm font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Unified Operational View</p>
                                        <p className="text-xs text-neutral-300 mt-0.5">Single source of truth for operations, engineering, and field teams</p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="mb-6">
                                {authCheck.isAuthenticated ? (
                                    isSubscribed ? (
                                        <button 
                                            onClick={createCustomerPortal}
                                            className="w-full inline-flex items-center justify-center rounded-xl text-sm font-medium tracking-tight text-white px-4 py-3 transition-all relative overflow-hidden"
                                            style={{
                                                background: 'rgba(40, 40, 40, 0.6)',
                                                backdropFilter: 'blur(40px)',
                                                WebkitBackdropFilter: 'blur(40px)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(50, 50, 50, 0.7)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(40, 40, 40, 0.6)'}
                                        >
                                            Manage Subscription
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={createSubscription}
                                            className="w-full inline-flex items-center justify-center rounded-xl text-sm font-medium tracking-tight text-neutral-950 px-4 py-3 transition-all relative overflow-hidden"
                                            style={{
                                                background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
                                                backdropFilter: 'blur(40px)',
                                                WebkitBackdropFilter: 'blur(40px)',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                boxShadow: '0 8px 24px 0 rgba(16, 185, 129, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 32px 0 rgba(16, 185, 129, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.4)'}
                                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 8px 24px 0 rgba(16, 185, 129, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)'}
                                        >
                                            Request Early Access
                                        </button>
                                    )
                                ) : (
                                    <a 
                                        href="/sign-in?redirect_url=/pricing"
                                        className="w-full inline-flex items-center justify-center rounded-xl text-sm font-medium tracking-tight text-neutral-950 px-4 py-3 transition-all relative overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(180deg, rgba(250, 250, 250, 0.95) 0%, rgba(229, 229, 229, 0.95) 100%)',
                                            backdropFilter: 'blur(40px)',
                                            WebkitBackdropFilter: 'blur(40px)',
                                            border: '1px solid rgba(255, 255, 255, 0.4)',
                                            boxShadow: '0 8px 24px 0 rgba(255, 255, 255, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)'
                                        }}
                                    >
                                        Sign In to Access
                                    </a>
                                )}
                            </div>

                            <div className="flex items-center justify-center space-x-2 text-xs text-neutral-300 mb-6">
                                <Shield className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" strokeWidth={1.5} />
                                <p className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Priority evaluation for 24/7 operations · High-consequence systems</p>
                            </div>

                            {/* Expandable Details */}
                            <div className="border-t pt-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                <button
                                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                                    className="flex items-center justify-between w-full text-neutral-200 hover:text-white transition-colors"
                                >
                                    <span className="text-sm font-medium tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                                        {showAllFeatures ? 'Hide detailed specifications' : 'View detailed specifications'}
                                    </span>
                                    {showAllFeatures ? <ChevronUp className="w-4 h-4" strokeWidth={1.5} /> : <ChevronDown className="w-4 h-4" strokeWidth={1.5} />}
                                </button>

                                {showAllFeatures && (
                                    <div className="mt-6 space-y-6 animate-in slide-in-from-top duration-300">
                                        {/* Platform Access */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-semibold text-white tracking-tight uppercase text-neutral-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Platform Access</h4>
                                            <div className="space-y-2 ml-2">
                                                <div className="flex items-start space-x-2 text-sm">
                                                    <span className="mt-1 h-1 w-4 bg-emerald-400/60 rounded shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
                                                    <span className="text-neutral-200">Dedicated deployment environment with isolated data plane</span>
                                                </div>
                                                <div className="flex items-start space-x-2 text-sm">
                                                    <span className="mt-1 h-1 w-4 bg-emerald-400/60 rounded shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
                                                    <span className="text-neutral-200">SSO integration (SAML 2.0 / OIDC) with role-based access control</span>
                                                </div>
                                                <div className="flex items-start space-x-2 text-sm">
                                                    <span className="mt-1 h-1 w-4 bg-emerald-400/60 rounded shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
                                                    <span className="text-neutral-200">API access for programmatic layer configuration and queries</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Integration & Deployment */}
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <FileCode className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" strokeWidth={1.5} />
                                                <h4 className="text-sm font-semibold text-white tracking-tight uppercase text-neutral-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Integration & Deployment</h4>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                <div 
                                                    className="rounded-xl px-3 py-2.5 relative overflow-hidden"
                                                    style={{
                                                        background: 'rgba(20, 20, 20, 0.5)',
                                                        backdropFilter: 'blur(40px)',
                                                        WebkitBackdropFilter: 'blur(40px)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
                                                    }}
                                                >
                                                    <p className="text-[0.65rem] tracking-tight text-neutral-400 uppercase font-medium">Onboarding</p>
                                                    <p className="mt-1 text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">2-week guided setup</p>
                                                    <p className="mt-0.5 text-xs text-neutral-300">Schema design & broker config</p>
                                                </div>
                                                <div 
                                                    className="rounded-xl px-3 py-2.5 relative overflow-hidden"
                                                    style={{
                                                        background: 'rgba(20, 20, 20, 0.5)',
                                                        backdropFilter: 'blur(40px)',
                                                        WebkitBackdropFilter: 'blur(40px)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
                                                    }}
                                                >
                                                    <p className="text-[0.65rem] tracking-tight text-neutral-400 uppercase font-medium">Support SLA</p>
                                                    <p className="mt-1 text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">4-hour response</p>
                                                    <p className="mt-0.5 text-xs text-neutral-300">Critical incidents prioritized</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compliance & Security */}
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Globe className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" strokeWidth={1.5} />
                                                <h4 className="text-sm font-semibold text-white tracking-tight uppercase text-neutral-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Compliance & Security</h4>
                                            </div>
                                            <div 
                                                className="rounded-2xl p-4 relative overflow-hidden"
                                                style={{
                                                    background: 'linear-gradient(to right, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.08))',
                                                    backdropFilter: 'blur(40px)',
                                                    WebkitBackdropFilter: 'blur(40px)',
                                                    border: '1px solid rgba(16, 185, 129, 0.25)',
                                                    boxShadow: '0 4px 16px 0 rgba(16, 185, 129, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                                                    <div className="text-center">
                                                        <p className="text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Data residency</p>
                                                        <p className="text-neutral-200">Region-specific hosting</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Audit logs</p>
                                                        <p className="text-neutral-200">Full activity tracking</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Encryption</p>
                                                        <p className="text-neutral-200">At-rest & in-transit</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Usage Notes */}
                                        <div className="text-xs text-neutral-300 space-y-2 border-t pt-4" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
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
        </div>
    )
}