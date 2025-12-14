import { Loader2 } from 'lucide-react';

interface GlassLoaderProps {
  message?: string;
}

export const GlassLoader = ({ message = 'Loading datasets...' }: GlassLoaderProps) => {
  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="relative rounded-3xl overflow-hidden">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-[60px] backdrop-saturate-[180%]" />
        
        {/* Border gradient */}
        <div 
          className="absolute inset-0 rounded-3xl border border-white/20" 
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.03) 100%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px'
          }} 
        />
        
        {/* Content */}
        <div className="relative p-12 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
          <p className="text-white font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};