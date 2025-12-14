"use client";

import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Home, Globe, ChevronDown } from "lucide-react";
import { useHeaderPrivacyTranslation } from "../hooks/useLanguage";
import { languageNames, Language } from "../lib/i18n";

export function HeaderTermsPrivacy() {
  const { t, isClient, language, changeLanguage } = useHeaderPrivacyTranslation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-selector')) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Loading state
  if (!isClient) {
    return (
      <div 
        className="border-b border-white/20 relative overflow-hidden" 
        style={{
          background: 'rgba(128, 128, 128, 0.3)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)'
        }}
      >
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 41%, rgba(255, 255, 255, 0) 57%, rgba(255, 255, 255, 0.1) 100%)',
            padding: '1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude'
          }}
        />
        <div className="max-w-4xl mx-auto px-8 py-10">
          <div className="h-9 w-48 bg-white/10 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-white/5 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const LanguageSelector = () => (
    <div className="relative language-selector">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowLanguageMenu(!showLanguageMenu);
        }}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium tracking-tight text-white/90 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all duration-300"
        aria-label="Select language"
      >
        <Globe size={16} className="opacity-70" />
        <span>{languageNames[language]}</span>
        <ChevronDown 
          size={14} 
          className={`opacity-70 transition-transform duration-300 ${showLanguageMenu ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {showLanguageMenu && (
        <div 
          className="absolute top-full right-0 mt-2 w-48 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
            WebkitBackdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                        inset 0 -1px 0 0 rgba(255, 255, 255, 0.1),
                        0 8px 32px 0 rgba(0, 0, 0, 0.37)`
          }}
        >
          <div className="p-2">
            {Object.entries(languageNames).map(([code, name]) => (
              <button
                key={code}
                onClick={(e) => {
                  e.stopPropagation();
                  changeLanguage(code as Language);
                  setShowLanguageMenu(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs font-medium rounded-lg transition-all duration-200 ${
                  language === code 
                    ? 'bg-white/[0.15] text-white' 
                    : 'text-white/85 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div 
      className="relative z-50 border-b border-white/20 z-10 border-b border-white/20" 
      style={{
        background: 'rgba(128, 128, 128, 0.3)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)'
      }}
    >
      {/* Gradient border para header */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 41%, rgba(255, 255, 255, 0) 57%, rgba(255, 255, 255, 0.1) 100%)',
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
        {/* Single row layout - todo en una línea */}
        <div className="flex items-center justify-between gap-6">
          {/* Left: Home button */}
          <Link href="/" className="group flex-shrink-0" aria-label="Volver al inicio">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg blur-md group-hover:blur-lg transition-all duration-300"></div>
              <div 
                className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105 border border-white/20"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)'
                }}
              >
                <Home size={20} className="text-white/90 group-hover:text-white transition-colors" />
              </div>
            </div>
          </Link>

          {/* Center: Title section */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-slate-100 truncate font-sans">
              {t.title}
            </h1>
            <p className="text-[0.65rem] sm:text-xs font-mono text-slate-500 tracking-wide uppercase mt-0.5">
              {t.lastUpdated}
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <LanguageSelector />
            
            <div className="w-px h-6 bg-white/[0.18]"></div>
            
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 rounded-lg ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  );
}