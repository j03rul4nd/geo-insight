"use client";

import React from "react";
export function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-24">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16 lg:mb-20 pb-12 lg:pb-16 border-b border-zinc-900">
          {/* Left Section */}
          <div>
            <div className="text-white text-xs font-semibold tracking-[0.15em] uppercase mb-4">
              GIS Insight
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-md tracking-tight">
              Real-time operational visibility for distributed systems. 
              Connecting MQTT streams to live 3D maps.
            </p>
          </div>

          {/* Right Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
            {/* Connect */}
            <div className="flex flex-col gap-3">
              <div className="text-zinc-600 text-[11px] uppercase tracking-[0.15em] font-semibold mb-2">
                Connect
              </div>
              <a 
                href="https://www.linkedin.com/in/joel-benitez-iiot-industry/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 text-sm tracking-tight hover:text-white transition-colors duration-300"
              >
                LinkedIn
              </a>
              <a 
                href="https://joelbenitez.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 text-sm tracking-tight hover:text-white transition-colors duration-300"
              >
                Founder's Site
              </a>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-3">
              <div className="text-zinc-600 text-[11px] uppercase tracking-[0.15em] font-semibold mb-2">
                Status
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-zinc-500 text-sm tracking-tight">Early Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="text-zinc-600 text-xs tracking-tight">
            © {new Date().getFullYear()} GIS Insight. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a 
              href="#" 
              className="text-zinc-500 text-xs tracking-tight hover:text-white transition-colors duration-300"
              onClick={(e) => e.preventDefault()}
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="text-zinc-500 text-xs tracking-tight hover:text-white transition-colors duration-300"
              onClick={(e) => e.preventDefault()}
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}