import React from 'react';
import { Shield, Database, Lock, FileText, AlertCircle } from 'lucide-react';
import {HeaderTermsPrivacy} from "@/components/headerTermsPrivacy"
import {ContentTermPrivacy } from "@/components/contentTermPrivacy"


export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black/40 backdrop-blur-sm font-mono">
      {/* Header */}
        <HeaderTermsPrivacy />

      {/* Content */}
       <ContentTermPrivacy />
    </div>
  );
}