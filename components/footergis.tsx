"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useFooterTranslation } from "../hooks/useLanguage";

export function Footer() {
  const { t, language, isClient } = useFooterTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const footerRef = useRef<HTMLElement>(null);
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const rightSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    
    // Animación inicial simplificada
    if (isClient) {
      const elements = [leftSectionRef.current, rightSectionRef.current];
      elements.forEach((el, index) => {
        if (el) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
          setTimeout(() => {
            el.style.transition = 'all 0.8s ease-out';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, index * 150 + 200);
        }
      });
    }
  }, [isClient, language]); // Re-animar cuando cambie el idioma

  return (
    <footer ref={footerRef} className="bg-black border-t border-zinc-900 relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-24">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16 lg:mb-20 pb-12 lg:pb-16 border-b border-zinc-900">
          {/* Left Section */}
          <div ref={leftSectionRef}>
            <div className="text-white text-xs font-semibold tracking-[0.15em] uppercase mb-4">
              {t.brandName}
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-md tracking-tight">
              {t.description}
            </p>
          </div>

          {/* Right Section */}
          <div ref={rightSectionRef} className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
            {/* Connect */}
            <div className="flex flex-col gap-3">
              <div className="text-zinc-600 text-[11px] uppercase tracking-[0.15em] font-semibold mb-2">
                {t.connectTitle}
              </div>
              <a 
                href="https://www.linkedin.com/in/joel-benitez-iiot-industry/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 text-sm tracking-tight hover:text-white transition-colors duration-300"
              >
                {t.linkedIn}
              </a>
              <a 
                href="https://joelbenitez.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 text-sm tracking-tight hover:text-white transition-colors duration-300"
              >
                {t.founderSite}
              </a>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-3">
              <div className="text-zinc-600 text-[11px] uppercase tracking-[0.15em] font-semibold mb-2">
                {t.statusTitle}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-zinc-500 text-sm tracking-tight">{t.statusText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="text-zinc-600 text-xs tracking-tight">
            © {new Date().getFullYear()} {t.copyright}
          </div>
          <div className="flex gap-8">
            <Link 
              href="/terms-privacy" 
              className="text-zinc-500 text-xs tracking-tight hover:text-white transition-colors duration-300"
            >
              {t.privacy}
            </Link>
            <Link 
              href="/terms-conditions" 
              className="text-zinc-500 text-xs tracking-tight hover:text-white transition-colors duration-300"
            >
              {t.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}