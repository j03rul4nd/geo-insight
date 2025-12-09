import { Radar } from "lucide-react"
import Link from "next/link"

export function Herosectionv0() {
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
      </div>
      {/*  relative z-10 flex-1 flex flex-col justify-center px-6 pt-32 pb-24 max-w-7xl mx-auto w-full */}
        <div className="relative z-10 flex-1 flex flex-col  max-w-7xl mx-auto w-full  items-center text-center max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Status badge - floating pill style */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-neutral-700/50 bg-neutral-900/80 backdrop-blur-md px-4 py-2 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
            <span className="text-xs tracking-widest uppercase text-neutral-300">Industrial Digital Twin Platform</span>
        </div>

        {/* Headline - large bold centered */}
        <div className="mt-8 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-medium tracking-tight text-white leading-[1.1]">
            See Your Infrastructure.
            <br />
            <span className="text-emerald-400">In Real Time.</span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            TwinGIS connects billions of MQTT signals from your sensors, PLCs, and edge devices—rendered live on
            geospatial maps. One platform. Every asset. Total operational clarity.
            </p>
        </div>

        {/* CTA buttons - white primary, dark secondary */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
            href="#early-access"
            className="inline-flex items-center justify-center rounded-full bg-white text-neutral-950 text-sm font-medium tracking-tight px-8 py-3.5 hover:bg-neutral-200 transition-colors shadow-lg"
            >
            Request Early Access
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
            </Link>
            <button className="inline-flex items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 backdrop-blur-sm text-sm text-neutral-300 px-8 py-3.5 hover:bg-neutral-800 hover:text-white transition-colors">
            Watch Platform Demo
            </button>
        </div>

        {/* Feature pills - horizontal row */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
            <div className="flex items-center space-x-2 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm px-4 py-2">
            <svg
                className="h-4 w-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
            </svg>
            <span className="text-sm text-neutral-400">Real-time 3D map rendering</span>
            </div>
            <div className="flex items-center space-x-2 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm px-4 py-2">
            <svg
                className="h-4 w-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z"
                />
            </svg>
            <span className="text-sm text-neutral-400">MQTT live ingestion</span>
            </div>
            <div className="flex items-center space-x-2 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm px-4 py-2">
            <svg
                className="h-4 w-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3"
                />
            </svg>
            <span className="text-sm text-neutral-400">Conditional layers & asset rules</span>
            </div>
        </div>

        {/* Status bar */}
        <div className="mt-14 flex items-center gap-6 text-xs text-neutral-500 tracking-wide uppercase">
            <div className="flex items-center gap-2">
            <Radar className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.5} />
            <span>System Online</span>
            </div>
            <div>
            <span className="text-neutral-600">LAT</span> <span className="text-neutral-400 font-mono">40.7128°</span>
            </div>
            <div>
            <span className="text-neutral-600">LNG</span> <span className="text-neutral-400 font-mono">-74.0060°</span>
            </div>
            <div>
            <span className="text-neutral-600">MQTT</span> <span className="text-emerald-400">CONNECTED</span>
            </div>
        </div>
        </div>
    </section>
  )
}
