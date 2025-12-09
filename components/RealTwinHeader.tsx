import React from 'react';
import { ShieldQuestion, ArrowRight } from 'lucide-react';

export function RealTwinHeader() {
  return (
    <header className="w-full border-b border-neutral-900/80 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto max-w-6xl flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-sm bg-neutral-950 border border-neutral-700/80 flex items-center justify-center shadow-[0_0_0_1px_rgba(0,0,0,0.9)]">
            <span className="text-xs tracking-tight font-semibold text-neutral-50">RT</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs tracking-tight font-medium text-neutral-200 uppercase">Realtwin</span>
            <span className="text-[0.65rem] tracking-tight text-neutral-500">Operational Geospatial Layer</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="hidden sm:inline-flex items-center space-x-2 rounded-md border border-neutral-700/80 bg-neutral-950/60 hover:bg-neutral-900 text-xs font-medium tracking-tight text-neutral-100 px-3 py-1.5 transition-colors">
            <ShieldQuestion className="w-4 h-4" strokeWidth={1.5} />
            <span>Security Briefing</span>
          </button>
          <button className="inline-flex items-center space-x-2 rounded-md border border-emerald-400/40 bg-emerald-400/10 hover:bg-emerald-400/20 text-xs font-medium tracking-tight text-emerald-100 px-3 py-1.5 transition-colors">
            <span>Request Early Access</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}