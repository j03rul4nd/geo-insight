"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignOutButton, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Menu, X, Home, DollarSign, LayoutDashboard, Globe, ChevronDown, BookOpen } from "lucide-react";
import { useNavTranslation } from "@/hooks/useLanguage";
import { languageNames, Language } from "@/lib/i18n";

// Tipos para los componentes de navegación
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

// Prop para recibir el idioma inicial desde la URL
interface NavbarProps {
  initialLocale?: Language;
}

const Navbar = ({ initialLocale }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  // Hook que recibe el idioma inicial
  const { t, language, changeLanguage, isClient } = useNavTranslation(initialLocale);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-selector')) {
        setShowLanguageMenu(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Función para generar la URL del blog con el idioma correcto
  const getBlogUrl = () => {
    return `/${language}/blog`;
  };

  const NavLink = ({ href, children, icon: Icon }: NavLinkProps) => (
    <Link
      href={href}
      className="group relative flex items-center gap-2 px-3 py-2 text-xs font-medium tracking-tight transition-all duration-300 text-white/90 hover:text-white rounded-lg hover:bg-white/[0.08]"
    >
      {Icon && <Icon size={16} className="opacity-80 group-hover:opacity-100 transition-opacity" />}
      {children}
    </Link>
  );

  const MobileNavLink = ({ href, children, icon: Icon }: MobileNavLinkProps) => (
    <Link
      href={href}
      className="flex items-center gap-3 px-6 py-3.5 text-sm font-medium tracking-tight text-white/90 hover:text-white transition-all duration-300 hover:bg-white/[0.08] rounded-lg mx-2"
      onClick={() => setIsOpen(false)}
    >
      {Icon && <Icon size={18} className="opacity-80" />}
      {children}
    </Link>
  );

  const LanguageSelector = () => (
    <div className="relative language-selector">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowLanguageMenu(!showLanguageMenu);
        }}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium tracking-tight text-white/90 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all duration-300"
        aria-label={t.language}
      >
        <Globe size={16} className="opacity-70" />
        <span className="hidden sm:inline">{languageNames[language]}</span>
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

  const MobileLanguageSelector = () => (
    <div className="px-6 py-3">
      <span className="text-[0.65rem] font-medium text-white/50 uppercase tracking-wider mb-2 block">
        {t.language}
      </span>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(languageNames).map(([code, name]) => (
          <button
            key={code}
            onClick={() => {
              changeLanguage(code as Language);
              setIsOpen(false);
            }}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
              language === code 
                ? 'bg-white/[0.15] text-white' 
                : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );

  // Loading state
  if (!isClient) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="relative overflow-visible"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px) saturate(1.6) brightness(1.15)',
              WebkitBackdropFilter: 'blur(12px) saturate(1.6) brightness(1.15)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '16px',
              boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                          inset 0 -1px 0 0 rgba(255, 255, 255, 0.1),
                          0 4px 24px 0 rgba(0, 0, 0, 0.25)`
            }}
          >
            <div className="relative flex items-center justify-between h-16 px-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative">
                  <div 
                    className="relative w-7 h-7 rounded-lg flex items-center justify-center border border-white/20"
                    style={{ background: 'rgba(255, 255, 255, 0.15)' }}
                  >
                    <img src="/favicon.png" className="w-4 h-4" alt="GIS Insight" />
                  </div>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs tracking-tight font-medium text-white uppercase">
                    GIS Insight
                  </span>
                  <span className="text-[0.65rem] tracking-tight text-white/50">
                    Digital Twin Platform
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out
      ${isScrolled ? 'py-2' : 'py-4'}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="relative transition-all duration-500 ease-out overflow-visible"
          style={{
            background: isScrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.08)',
            backdropFilter: isScrolled ? 'blur(16px) saturate(1.8) brightness(1.2)' : 'blur(12px) saturate(1.6) brightness(1.15)',
            WebkitBackdropFilter: isScrolled ? 'blur(16px) saturate(1.8) brightness(1.2)' : 'blur(12px) saturate(1.6) brightness(1.15)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '16px',
            boxShadow: isScrolled 
              ? `inset 0 1px 0 0 rgba(255, 255, 255, 0.25),
                 inset 0 -1px 0 0 rgba(255, 255, 255, 0.15),
                 0 8px 32px 0 rgba(0, 0, 0, 0.37),
                 0 2px 16px 0 rgba(0, 0, 0, 0.2)`
              : `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                 inset 0 -1px 0 0 rgba(255, 255, 255, 0.1),
                 0 4px 24px 0 rgba(0, 0, 0, 0.25)`
          }}
        >
          <div className="relative flex items-center justify-between h-16 px-6">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg blur-md group-hover:blur-lg transition-all duration-300"></div>
                <div 
                  className="relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105 border border-white/20"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <img
                    src="/favicon.png"
                    className="w-4 h-4"
                    alt="GIS Insight"
                  />
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs tracking-tight font-medium text-white uppercase">
                  GIS Insight
                </span>
                <span className="text-[0.65rem] tracking-tight text-white/50">
                  Digital Twin Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/" icon={Home}>{t.home}</NavLink>
              <NavLink href="/pricing" icon={DollarSign}>{t.pricing}</NavLink>
              <NavLink href="/dashboard" icon={LayoutDashboard}>{t.dashboard}</NavLink>
              <NavLink href={getBlogUrl()} icon={BookOpen}>{t.blog}</NavLink>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSelector />
              
              <div className="w-px h-6 bg-white/[0.18]"></div>
              
              <div className="flex items-center gap-3">
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 text-xs font-medium text-white rounded-lg transition-all duration-300 hover:bg-white/[0.15] tracking-tight"
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {t.signIn}
                  </Link>
                </SignedOut>
                
                <SignedIn>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 rounded-lg ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300"
                      }
                    }}
                  />
                </SignedIn>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/[0.08] transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`
          md:hidden transition-all duration-300 ease-out overflow-hidden
          ${isOpen ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'}
        `}>
          <div 
            className="overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px) saturate(1.8) brightness(1.2)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.8) brightness(1.2)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '16px',
              boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.25),
                          inset 0 -1px 0 0 rgba(255, 255, 255, 0.15),
                          0 8px 32px 0 rgba(0, 0, 0, 0.37)`
            }}
          >
            <div className="py-2">
              <MobileNavLink href="/" icon={Home}>{t.home}</MobileNavLink>
              <MobileNavLink href="/pricing" icon={DollarSign}>{t.pricing}</MobileNavLink>
              <MobileNavLink href="/dashboard" icon={LayoutDashboard}>{t.dashboard}</MobileNavLink>
              <MobileNavLink href={getBlogUrl()} icon={BookOpen}>{t.blog}</MobileNavLink>
              
              <div className="h-px bg-white/[0.15] my-2 mx-4"></div>
              
              <MobileLanguageSelector />

              <div className="px-6 py-3">
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="block w-full px-4 py-2.5 text-center text-xs font-medium text-white rounded-lg transition-all duration-300 hover:bg-white/[0.15] tracking-tight"
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {t.signIn}
                  </Link>
                </SignedOut>
                
                <SignedIn>
                  <SignOutButton>
                    <button 
                      className="block w-full px-4 py-2.5 text-center text-xs font-medium text-white/85 hover:text-white rounded-lg transition-all duration-300 tracking-tight"
                      onClick={() => setIsOpen(false)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                      }}
                    >
                      {t.signOut}
                    </button>
                  </SignOutButton>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;