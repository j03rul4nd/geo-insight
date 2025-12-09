import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-screen flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/aerial-view-industrial-infrastructure-oil-refinery.png')`,
          }}
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 pt-24 max-w-7xl mx-auto w-full">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <p className="text-white/50 text-sm tracking-[0.2em] uppercase mb-6">Industrial Digital Twin Platform</p>

          {/* Main Headline */}
          <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] tracking-tight mb-8">
            <span className="block">See Your</span>
            <span className="block">Infrastructure.</span>
            <span className="block text-white/40">In Real Time.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
            GIS Insight connects billions of MQTT signals from your sensors, PLCs, and edge devices rendered live on
            geospatial maps. One platform. Every asset. Total operational clarity.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 text-sm px-8 h-12 font-medium group">
              Request Early Access
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-white/70 hover:text-white hover:bg-white/5 text-sm px-8 h-12"
            >
              Watch Platform Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}