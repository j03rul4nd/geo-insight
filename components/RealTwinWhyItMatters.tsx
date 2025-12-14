"use client";
import React from 'react';
import { useRealTwinWhyItMattersTranslation } from "../hooks/useLanguage";
import { useState, useEffect, useRef } from "react";

export function RealTwinWhyItMatters() {
  const { t, language, isClient } = useRealTwinWhyItMattersTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    
    // Animación inicial simplificada
    if (isClient) {
      const elements = [headerRef.current, contentRef.current, cardsRef.current];
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
          <div 
            ref={headerRef}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 border-b border-[#1a1a1a] pb-4 sm:pb-6"
          >
            <h2 className="text-[11px] sm:text-xs font-mono text-[#666666] uppercase tracking-[0.2em] font-medium">
              {t.title}
            </h2>
            <span className="text-[10px] sm:text-[11px] tracking-[0.15em] text-[#4a4a4a] uppercase font-mono">
              {t.subtitle}
            </span>
          </div>
          
          {/* Content */}
          <div 
            ref={contentRef}
            className="space-y-6 sm:space-y-8 max-w-4xl"
          >
            <p className="text-[15px] sm:text-base lg:text-[17px] text-[#b8b8b8] leading-[1.7] tracking-[-0.015em] font-light">
              {t.paragraph1}
            </p>
            <p className="text-[15px] sm:text-base lg:text-[17px] text-[#b8b8b8] leading-[1.7] tracking-[-0.015em] font-light">
              {t.paragraph2}
            </p>
          </div>
          
          {/* Cards Grid */}
          <div 
            ref={cardsRef}
            className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1a1a1a] border border-[#1a1a1a]/50 shadow-2xl"
          >
            {t.cards.map((card, index) => (
              <div 
                key={index}
                className={`bg-[#0a0a0a] p-6 sm:p-7 lg:p-9 transition-all duration-500 hover:bg-[#111111] group relative overflow-hidden ${
                  index > 0 ? 'border-l-0 sm:border-l border-[#1a1a1a]/50' : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <p className="text-[11px] text-[#555555] font-mono mb-4 tracking-[0.12em] uppercase">
                    {card.label}
                  </p>
                  <p className="text-base sm:text-lg text-[#d4d4d4] font-light tracking-[-0.01em]">
                    {card.value}
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

export default RealTwinWhyItMatters;