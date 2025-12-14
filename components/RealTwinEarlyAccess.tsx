"use client";
import React, { useState, useEffect, useRef } from "react";
import { useEarlyAccessCTATranslation } from "../hooks/useLanguage";

interface FormData {
  name: string;
  email: string;
  organization: string;
  context: string;
}

export function EarlyAccessCTA() {
  const { t, language, isClient } = useEarlyAccessCTATranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    organization: '',
    context: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    
    // Animación inicial simplificada
    if (isClient) {
      const elements = [leftColumnRef.current, rightColumnRef.current];
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

  const handleSubmit = async () => {
    if (!formData.email) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/send-early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el formulario');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', organization: '', context: '' });
      
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  type InputChange = React.ChangeEvent<HTMLInputElement>;

  const handleChange = (e: InputChange) => {
    setFormData({
      ...formData,
      [e.target.name as keyof FormData]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Grid pattern background with gradient opacity */}
      <div id="formJoinBeta" className="absolute inset-0 opacity-30">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)'
          }}
        />
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-start relative z-10">
        
        {/* Left Column - Description */}
        <div ref={leftColumnRef} className="space-y-6 lg:pt-8">
          <div className="inline-block">
            <span className="text-xs font-mono text-zinc-600 tracking-wider">
              {t.badge}
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight">
            {t.title}
          </h1>
          
          <div className="space-y-4 text-zinc-400 text-lg leading-relaxed">
            <p>{t.paragraph1}</p>
            <p>{t.paragraph2}</p>
          </div>
        </div>

        {/* Right Column - Form */}
        <div ref={rightColumnRef} className="space-y-6 lg:pt-8">
          
          {/* Name */}
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">
              {t.form.nameLabel}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t.form.namePlaceholder}
              className="w-full bg-transparent border-b border-zinc-800 px-0 py-3 text-white placeholder-zinc-700 focus:border-zinc-600 focus:outline-none transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">
              {t.form.emailLabel}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t.form.emailPlaceholder}
              className="w-full bg-transparent border-b border-zinc-800 px-0 py-3 text-white placeholder-zinc-700 focus:border-zinc-600 focus:outline-none transition"
            />
          </div>

          {/* Organization */}
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">
              {t.form.organizationLabel}
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder={t.form.organizationPlaceholder}
              className="w-full bg-transparent border-b border-zinc-800 px-0 py-3 text-white placeholder-zinc-700 focus:border-zinc-600 focus:outline-none transition"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-950/50 border border-red-900 text-red-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitted || loading || !formData.email}
            className="w-full bg-white hover:bg-zinc-100 text-black font-medium py-4 px-6 transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white mt-8"
          >
            {loading ? t.form.submitting : submitted ? t.form.submitted : t.form.submitButton}
          </button>

          {/* Privacy note */}
          <p className="text-xs text-zinc-600 leading-relaxed pt-2">
            {t.form.privacyNote}
          </p>

        </div>

      </div>
    </div>
  );
}