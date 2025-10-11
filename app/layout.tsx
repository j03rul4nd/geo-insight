import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import { Providers } from './provider'; // ← NUEVO: Importar Providers

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Industrial Geospatial Intelligence | Real-Time Operations Platform",
    template: "%s | Industrial Geospatial"
  },
  description: "Transform chaotic industrial data into actionable insights. Reduce operational inefficiencies by 40% and achieve 99.9% uptime with real-time AI-powered geospatial analytics. Purpose-built for manufacturing, logistics, and smart cities.",
  
  keywords: [
    "industrial geospatial platform",
    "real-time operations monitoring",
    "manufacturing analytics",
    "logistics optimization",
    "smart cities platform",
    "industrial IoT dashboard",
    "sensor data visualization",
    "geospatial intelligence",
    "operational efficiency",
    "industrial AI analytics",
    "facility management software",
    "asset tracking platform",
    "predictive maintenance",
    "industrial operations SaaS",
    "real-time site monitoring"
  ],

  authors: [{ name: "Industrial Geospatial" }],
  creator: "Industrial Geospatial",
  publisher: "Industrial Geospatial",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    siteName: 'Industrial Geospatial',
    title: 'Industrial Geospatial Intelligence | Real-Time Operations Platform',
    description: 'Convert chaotic industrial data into crystal-clear insights. Reduce inefficiencies by 40% and boost uptime to 99.9% with AI-powered geospatial analytics.',
    images: [
      {
        url: 'https://yourdomain.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Industrial Geospatial - Real-Time Operations Intelligence',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Industrial Geospatial Intelligence | Real-Time Operations',
    description: 'Transform industrial chaos into actionable insights. 40% efficiency gain, 99.9% uptime. Purpose-built for operations teams.',
    images: ['https://yourdomain.com/twitter-image.jpg'],
    creator: '@yourhandle',
  },

  alternates: {
    canonical: 'https://yourdomain.com',
    languages: {
      'en-US': 'https://yourdomain.com/en',
      'es-ES': 'https://yourdomain.com/es',
      'de-DE': 'https://yourdomain.com/de',
      'fr-FR': 'https://yourdomain.com/fr',
    },
  },

  verification: {
    google: 'your-google-verification-code',
  },

  category: 'technology',
  classification: 'Industrial Software',

  metadataBase: new URL('https://yourdomain.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className="dark">
        <head>
          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" sizes="32x32" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          
          {/* Preload critical fonts for monospace data display */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body 
          className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen bg-[#0a0a0a] text-gray-100`}
          style={{
            // Optimized for multi-screen 24/7 operations environments
            fontFeatureSettings: '"tnum", "cv01"', // Tabular numbers for data consistency
          }}
        >
          {/* ← NUEVO: Envolver children con Providers */}
          <Providers>
            {children}
            {/* ← NUEVO: Toaster global para notificaciones */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
              }}
            />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}