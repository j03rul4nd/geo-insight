import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {Headertermsuse} from "@/components/headerTerminosdeuso"
import {ContentTermsUse} from "@/components/contentTermsUse"

export default function TermsOfService() {
  return (
    <div className="relative min-h-screen bg-black/40 backdrop-blur-sm font-mono">
      {/* Header */}
      <Headertermsuse />

      {/* Content */}
      <ContentTermsUse />
    </div>
  );
}