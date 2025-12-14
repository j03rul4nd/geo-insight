"use client";
import React from 'react';
import { useCapabilitiesTranslation } from "../hooks/useLanguage";
import { useState, useEffect, useRef } from "react";

interface Feature {
  number: string;
  text: string;
}

export function Capabilities() {
  const { t, language, isClient } = useCapabilitiesTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    
    // Animación inicial simplificada
    if (isClient) {
      const elements = [headerRef.current, cardsRef.current];
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
  }, [isClient, language]); // Re-animar cuando cambie el idioma

  return (
    <section 
      ref={sectionRef}
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-10 relative overflow-hidden"
    >
      {/* Section divider line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] h-px bg-gradient-to-r from-transparent via-[#1a1a1a] to-transparent" />
      
      {/* Background with smooth transition */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#050505] to-black" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto w-full">
        <div className="space-y-8 sm:space-y-10 lg:space-y-12">
          {/* Header */}
          <div 
            ref={headerRef}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 border-b border-[#1a1a1a] pb-4 sm:pb-6"
          >
            <h2 className="text-[10px] sm:text-[11px] font-semibold text-[#505050] uppercase tracking-[0.15em]">
              {t.title}
            </h2>
            <span className="text-[10px] sm:text-[11px] tracking-[0.15em] text-[#404040] uppercase font-mono">
              {t.subtitle}
            </span>
          </div>

          {/* Cards Grid */}
          <div 
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-[#1a1a1a] border border-[#1a1a1a] overflow-hidden"
          >
            {t.features.map((feature: Feature, index: number) => (
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