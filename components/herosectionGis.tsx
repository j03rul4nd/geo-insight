"use client"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useHeroTranslation } from "../hooks/useLanguage";
import { useState, useEffect, useRef } from "react";

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { t, language, isClient } = useHeroTranslation();
  
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setIsLoaded(true);
    
    // Animación inicial simplificada para el ejemplo
    if (isClient) {
      const elements = [titleRef.current, subtitleRef.current, ctaRef.current, featuresRef.current];
      elements.forEach((el, index) => {
        if (el) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(30px)';
          setTimeout(() => {
            el.style.transition = 'all 0.8s ease-out';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, index * 200 + 300);
        }
      });
    }
  }, [isClient, language]);

  const scrollToForm = () => {
    const formSection = document.getElementById('formJoinBeta');
    if (formSection) {
      formSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section ref={heroRef} className="relative h-screen flex flex-col">
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
          <p className="text-white/50 text-sm tracking-[0.2em] uppercase mb-6">
            {t.eyebrow}
          </p>

          {/* Main Headline */}
          <h1 ref={titleRef} className="text-white text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] tracking-tight mb-8">
            <span className="block">{t.headline1}</span>
            <span className="block">{t.headline2}</span>
            <span className="block text-white/40">{t.headline3}</span>
          </h1>

          {/* Subheadline */}
          <p ref={subtitleRef} className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
            {t.subheadline}
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-wrap items-center gap-4">
            <Button 
              size="lg" 
              onClick={scrollToForm}
              className="bg-white text-black hover:bg-white/90 text-sm px-8 h-12 font-medium group"
            >
              {t.ctaPrimary}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-white/70 hover:text-white hover:bg-white/5 text-sm px-8 h-12"
            >
              {t.ctaSecondary}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}