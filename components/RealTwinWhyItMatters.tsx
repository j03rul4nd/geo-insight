import React from 'react';

export function RealTwinWhyItMatters() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-10 relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* Section divider line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] h-[1px] bg-gradient-to-r from-transparent via-[#252525] to-transparent" />
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#0a0a0a] to-[#000000]" />
      </div>
      
      <div className="relative z-10 max-w-[1200px] mx-auto w-full">
        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 border-b border-[#1a1a1a] pb-4 sm:pb-6">
            <h2 className="text-[11px] sm:text-xs font-mono text-[#666666] uppercase tracking-[0.2em] font-medium">
              Why It Matters
            </h2>
            <span className="text-[10px] sm:text-[11px] tracking-[0.15em] text-[#4a4a4a] uppercase font-mono">
              / Operational context
            </span>
          </div>
          
          {/* Content */}
          <div className="space-y-6 sm:space-y-8 max-w-4xl">
            <p className="text-[15px] sm:text-base lg:text-[17px] text-[#b8b8b8] leading-[1.7] tracking-[-0.015em] font-light">
              Traditional GIS stacks capture static state, while MQTT streams capture live behavior. They rarely converge into a single operational surface that decision‑makers can trust in real time.
            </p>
            <p className="text-[15px] sm:text-base lg:text-[17px] text-[#b8b8b8] leading-[1.7] tracking-[-0.015em] font-light">
              By binding telemetry to geospatial context under explicit rules, RealTwin exposes a shared, live picture of the system. Operations, engineering, and field teams reason from the same ground truth instead of fragmented dashboards, screenshots, and log traces.
            </p>
          </div>
          
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1a1a1a] border border-[#1a1a1a]/50 shadow-2xl">
            <div className="bg-[#0a0a0a] p-6 sm:p-7 lg:p-9 transition-all duration-500 hover:bg-[#111111] group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <p className="text-[11px] text-[#555555] font-mono mb-4 tracking-[0.12em] uppercase">
                  Decision latency
                </p>
                <p className="text-base sm:text-lg text-[#d4d4d4] font-light tracking-[-0.01em]">
                  Reduced
                </p>
              </div>
            </div>
            <div className="bg-[#0a0a0a] p-6 sm:p-7 lg:p-9 transition-all duration-500 hover:bg-[#111111] group relative overflow-hidden border-l-0 sm:border-l border-[#1a1a1a]/50">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <p className="text-[11px] text-[#555555] font-mono mb-4 tracking-[0.12em] uppercase">
                  Incident detection
                </p>
                <p className="text-base sm:text-lg text-[#d4d4d4] font-light tracking-[-0.01em]">
                  Visual &amp; rules‑driven
                </p>
              </div>
            </div>
            <div className="bg-[#0a0a0a] p-6 sm:p-7 lg:p-9 transition-all duration-500 hover:bg-[#111111] group relative overflow-hidden border-l-0 sm:border-l border-[#1a1a1a]/50">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <p className="text-[11px] text-[#555555] font-mono mb-4 tracking-[0.12em] uppercase">
                  Cross‑team alignment
                </p>
                <p className="text-base sm:text-lg text-[#d4d4d4] font-light tracking-[-0.01em]">
                  Single live map
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RealTwinWhyItMatters;