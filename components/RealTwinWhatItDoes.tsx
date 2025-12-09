import React from 'react';

export function RealTwinWhatItDoes() {
  return (
    <section aria-labelledby="what-it-does" className="relative min-h-screen flex flex-col">
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

     <div className="container relative min-h-screen flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-24 max-w-7xl mx-auto w-full">
        <div className="flex items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
            <h2 id="what-it-does" className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-neutral-100">
            What It Does
            </h2>
            <span className="text-[0.65rem] sm:text-xs tracking-widest text-neutral-500 uppercase whitespace-nowrap mt-1 sm:mt-0">System capabilities</span>
        </div>
        <ul className="space-y-6 sm:space-y-8 text-base sm:text-lg lg:text-xl text-neutral-300 leading-relaxed">
            <li className="flex items-start space-x-3 sm:space-x-4">
            <span className="mt-2 h-1 w-6 sm:w-8 bg-neutral-600 rounded flex-shrink-0"></span>
            <span className="flex-1">Streams MQTT topics into a time‑aligned, queryable 3D geospatial surface backed by a coherent asset model.</span>
            </li>
            <li className="flex items-start space-x-3 sm:space-x-4">
            <span className="mt-2 h-1 w-6 sm:w-8 bg-neutral-600 rounded flex-shrink-0"></span>
            <span className="flex-1">Maps payload fields, metadata, and identities into assets, hierarchies, and operational regions with explicit schemas.</span>
            </li>
            <li className="flex items-start space-x-3 sm:space-x-4">
            <span className="mt-2 h-1 w-6 sm:w-8 bg-neutral-600 rounded flex-shrink-0"></span>
            <span className="flex-1">Applies deterministic rules to highlight anomalies, degraded states, and safety‑critical events directly on the map view.</span>
            </li>
        </ul>
     </div>
    </section>
  );
}