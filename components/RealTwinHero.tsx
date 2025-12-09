// components/RealTwinHero.tsx
import React from 'react';
import { Activity, Layers, AlarmCheck, Radar } from 'lucide-react';

export function RealTwinHero() {
  return (
    <section className="relative min-h-screen flex flex-col">  
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            {/* <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url('/aerial-view-industrial-infrastructure-oil-refinery.png')`,
            }}
            /> */}
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]/40" />
         {/* <div className="absolute inset-0 bg-black" /> */}

        </div>

        <div className="relative z-10 flex-1 flex flex-col mx-auto w-full items-center text-left max-w-5xl px-6 sm:px-8 pt-24 sm:pt-32 pb-20 sm:pb-32">
        <div className="w-full space-y-6 sm:space-y-8">
        <div className="inline-flex items-center space-x-2 rounded-full border border-neutral-800/60 bg-neutral-950/60 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            <span className="text-[0.7rem] sm:text-xs tracking-wide text-neutral-400 uppercase font-medium">Internal tooling · Live operational geospatial substrate</span>
        </div>

        <div className="space-y-5 sm:space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Real-Time Asset Map
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-400 max-w-3xl leading-relaxed">
            A real-time GIS viewer that consumes MQTT telemetry, reconciles it with your asset model, and renders operational truth on a 3D geospatial surface for analysts, operators, and field teams.
            </p>
        </div>

        <div className="rounded-xl border border-neutral-800/60 bg-neutral-950/40 backdrop-blur-sm overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-800/60">
            <div className="px-6 py-5 sm:py-6">
                <p className="text-[0.65rem] tracking-widest text-neutral-500 uppercase font-semibold mb-2">Latency</p>
                <p className="text-lg sm:text-xl font-semibold text-white mb-1">Sub‑second ingest</p>
                <p className="text-sm text-neutral-500">MQTT to geospatial entity</p>
            </div>
            <div className="px-6 py-5 sm:py-6">
                <p className="text-[0.65rem] tracking-widest text-neutral-500 uppercase font-semibold mb-2">Coverage</p>
                <p className="text-lg sm:text-xl font-semibold text-white mb-1">Multi‑broker</p>
                <p className="text-sm text-neutral-500">Heterogeneous topic spaces</p>
            </div>
            <div className="px-6 py-5 sm:py-6">
                <p className="text-[0.65rem] tracking-widest text-neutral-500 uppercase font-semibold mb-2">Governance</p>
                <p className="text-lg sm:text-xl font-semibold text-white mb-1">Rules‑based layers</p>
                <p className="text-sm text-neutral-500">Deterministic visual logic</p>
            </div>
            </div>
        </div>

        <ul className="space-y-4 text-base text-neutral-400 max-w-3xl">
            <li className="flex items-start space-x-3">
            <Activity className="mt-0.5 w-5 h-5 text-neutral-600 flex-shrink-0" strokeWidth={1.5} />
            <span className="leading-relaxed">Attach one or more MQTT brokers, normalize topics, and expose a single operational map without per-team front-end work.</span>
            </li>
            <li className="flex items-start space-x-3">
            <Layers className="mt-0.5 w-5 h-5 text-neutral-600 flex-shrink-0" strokeWidth={1.5} />
            <span className="leading-relaxed">Define geospatial layers, filters, and data contracts that map telemetry fields to assets, geometry, and status.</span>
            </li>
            <li className="flex items-start space-x-3">
            <AlarmCheck className="mt-0.5 w-5 h-5 text-neutral-600 flex-shrink-0" strokeWidth={1.5} />
            <span className="leading-relaxed">Encode conditional styling, alerting thresholds, and escalation states so incidents surface visually without manual triage.</span>
            </li>
        </ul>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
            <a href="#early-access" className="inline-flex items-center justify-center rounded-lg bg-white text-black text-sm font-semibold tracking-tight px-6 py-3 hover:bg-neutral-200 transition-colors shadow-sm">
            Request Early Access
            </a>
            <div className="flex items-center space-x-2.5 text-sm text-neutral-500">
            <Radar className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={1.5} />
            <p className="leading-relaxed">Built for continuous operations, control centers, and incident response—not static map reports.</p>
            </div>
        </div>
        </div>
        </div>
    </section>
  );
}