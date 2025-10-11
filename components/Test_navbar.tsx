"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignOutButton, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Menu, X, Home, DollarSign, LayoutDashboard, Globe, ChevronDown, BookOpen, Map } from "lucide-react";
import { usePathname } from 'next/navigation';

// Language types
export const languageNames = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch'
};

export type Language = keyof typeof languageNames;

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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const pathname = usePathname();

  const getCurrentLocale = () => {
    if (pathname === '/' || !pathname.startsWith('/')) {
      return language;
    }
    const segments = pathname.split('/');
    const possibleLocale = segments[1];
    if (Object.keys(languageNames).includes(possibleLocale)) {
      return possibleLocale as Language;
    }
    return language;
  };

  const getLocalizedUrl = (path: string) => {
    const currentLocale = getCurrentLocale();
    if (pathname === '/') {
      return `/${currentLocale}${path}`;
    }
    return `/${currentLocale}${path}`;
  };

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

  const NavLink = ({ href, children, icon: Icon }: NavLinkProps) => (
    <Link
      href={href}
      className="group relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 text-white/90 hover:text-white rounded-lg hover:bg-white/[0.08]"
    >
      {Icon && <Icon size={16} className="opacity-80 group-hover:opacity-100 transition-opacity" />}
      {children}
    </Link>
  );

  const MobileNavLink = ({ href, children, icon: Icon }: MobileNavLinkProps) => (
    <Link
      href={href}
      className="flex items-center gap-3 px-6 py-3.5 text-base font-medium text-white/90 hover:text-white transition-all duration-300 hover:bg-white/[0.08] rounded-lg mx-2"
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
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all duration-300"
        aria-label="Select language"
      >
        <Globe size={16} className="opacity-80" />
        <span className="hidden sm:inline">{languageNames[language]}</span>
        <ChevronDown 
          size={14} 
          className={`opacity-80 transition-transform duration-300 ${showLanguageMenu ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {showLanguageMenu && (
        <div className="absolute top-full right-0 mt-2 w-48 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
            WebkitBackdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
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
                  setLanguage(code as Language);
                  setShowLanguageMenu(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-all duration-200 ${
                  language === code 
                    ? 'bg-white/[0.15] text-white font-medium' 
                    : 'text-white/90 hover:text-white hover:bg-white/[0.08]'
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
      <span className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 block">
        Language
      </span>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(languageNames).map(([code, name]) => (
          <button
            key={code}
            onClick={() => {
              setLanguage(code as Language);
              setIsOpen(false);
            }}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              language === code 
                ? 'bg-white/[0.15] text-white' 
                : 'text-white/80 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out
        ${isScrolled ? 'py-2' : 'py-4'}
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`
              relative transition-all duration-500 ease-out overflow-hidden
            `}
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
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                  <div 
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <Map className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-xl font-semibold text-white tracking-tight group-hover:text-white/90 transition-colors">
                  GIS Insight
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                <NavLink href="/" icon={Home}>Home</NavLink>
                <NavLink href="/pricing" icon={DollarSign}>Pricing</NavLink>
                <NavLink href="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                <NavLink href={getLocalizedUrl("/blog")} icon={BookOpen}>Blog</NavLink>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3">
                <LanguageSelector />
                
                <div className="w-px h-6 bg-white/[0.18]"></div>
                
                <div className="flex items-center gap-3">
                  <SignedOut>
                    <Link
                      href="/sign-in"
                      className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      Sign In
                    </Link>
                  </SignedOut>
                  
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/[0.08] transition-all duration-300"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
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
                <MobileNavLink href="/" icon={Home}>Home</MobileNavLink>
                <MobileNavLink href="/pricing" icon={DollarSign}>Pricing</MobileNavLink>
                <MobileNavLink href="/dashboard" icon={LayoutDashboard}>Dashboard</MobileNavLink>
                <MobileNavLink href={getLocalizedUrl("/blog")} icon={BookOpen}>Blog</MobileNavLink>
                
                <div className="h-px bg-white/[0.15] my-2 mx-4"></div>
                
                <MobileLanguageSelector />

                <div className="px-6 py-3">
                  <SignedOut>
                    <Link
                      href="/sign-in"
                      className="block w-full px-5 py-2.5 text-center text-sm font-medium text-white rounded-lg transition-all duration-300"
                      onClick={() => setIsOpen(false)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      Sign In
                    </Link>
                  </SignedOut>
                  
                  <SignedIn>
                    <SignOutButton>
                      <button 
                        className="block w-full px-5 py-2.5 text-center text-sm font-medium text-white/90 hover:text-white rounded-lg transition-all duration-300"
                        onClick={() => setIsOpen(false)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.15)'
                        }}
                      >
                        Sign Out
                      </button>
                    </SignOutButton>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;