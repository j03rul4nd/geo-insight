"use client";
import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  organization: string;
  context: string;
}

export function EarlyAccessCTA() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    organization: '',
    context: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="absolute inset-0 opacity-30">
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
        <div className="space-y-6 lg:pt-8">
          <div className="inline-block">
            <span className="text-xs font-mono text-zinc-600 tracking-wider">EARLY ACCESS</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight">
            Join the beta cohort
          </h1>
          
          <div className="space-y-4 text-zinc-400 text-lg leading-relaxed">
            <p>
              Intended for teams operating live MQTT streams where map-level visibility 
              affects operations: NOCs, control rooms, fleet, utilities, industrial systems.
            </p>
            <p>
              If you need real-time spatial awareness from existing MQTT infrastructure 
              and are willing to trial a pre-launch tool, leave your details below.
            </p>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="space-y-6 lg:pt-8">
          
          {/* Name */}
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full bg-transparent border-b border-zinc-800 px-0 py-3 text-white placeholder-zinc-700 focus:border-zinc-600 focus:outline-none transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full bg-transparent border-b border-zinc-800 px-0 py-3 text-white placeholder-zinc-700 focus:border-zinc-600 focus:outline-none transition"
            />
          </div>

          {/* Organization */}
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">
              Organization
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="Enter your organization"
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
            {loading ? 'SENDING...' : submitted ? 'SUBMITTED' : 'GET EARLY ACCESS'}
          </button>

          {/* Privacy note */}
          <p className="text-xs text-zinc-600 leading-relaxed pt-2">
            Submissions are reviewed manually. Used only to evaluate fit and coordinate contact.
          </p>

        </div>

      </div>
    </div>
  );
}