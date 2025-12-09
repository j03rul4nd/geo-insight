import React from 'react';

interface Feature {
  number: string;
  text: string;
}

export function Capabilities() {
  const features: Feature[] = [
    {
      number: "01",
      text: "Connects to MQTT brokers and ingests live telemetry streams"
    },
    {
      number: "02",
      text: "Displays asset positions and state changes on a 3D map in real time"
    },
    {
      number: "03",
      text: "Supports user-defined layers, rules, and conditional visualization logic"
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-10 relative overflow-hidden">      {/* Section divider line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] h-px bg-gradient-to-r from-transparent via-[#1a1a1a] to-transparent" />
      
      {/* Background with smooth transition */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#050505] to-black" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto w-full">
        <div className="space-y-8 sm:space-y-10 lg:space-y-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 border-b border-[#1a1a1a] pb-4 sm:pb-6">
            <h2 className="text-[10px] sm:text-[11px] font-semibold text-[#505050] uppercase tracking-[0.15em]">
              Capabilities
            </h2>
            <span className="text-[10px] sm:text-[11px] tracking-[0.15em] text-[#404040] uppercase font-mono">
              / Core features
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-[#1a1a1a] border border-[#1a1a1a] overflow-hidden">
            {features.map((feature: Feature, index: number) => (
              <div
                key={index}
                className="bg-black p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:bg-white/[0.02]"
              >
                <div className="relative">
                  <p className="text-xs text-[#404040] font-semibold mb-4 tracking-[0.1em] uppercase">
                    {feature.number}
                  </p>
                  <p className="text-base text-[#c0c0c0] leading-relaxed tracking-[-0.01em]">
                    {feature.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Capabilities;