import Navbar from "./_components/navbar";
import Aurora from '@/components/aurora';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// Lista de idiomas soportados
export const locales = ['en', 'es', 'pt', 'ja', 'fr', 'de'] as const;
type Locale = typeof locales[number];

// Traducciones para metadata - GIS Insight
const metadataTranslations = {
  en: {
    title: "GIS Insight - Industrial Digital Twin Platform | Real-Time MQTT Visualization",
    description: "Connect MQTT telemetry streams to live 3D geospatial maps. Industrial digital twin platform for NOCs, control rooms, utilities, and distributed systems. Real-time operational visibility.",
    ogTitle: "GIS Insight - Real-Time Industrial Digital Twin Platform",
    ogDescription: "Visualize your infrastructure in real-time. Connect billions of MQTT signals from sensors, PLCs, and edge devices on live geospatial maps.",
    keywords: "digital twin, MQTT visualization, industrial IoT, geospatial platform, real-time monitoring, NOC software, control room systems, industrial telemetry, IoT platform, SCADA visualization"
  },
  es: {
    title: "GIS Insight - Plataforma de Gemelo Digital Industrial | Visualización MQTT en Tiempo Real",
    description: "Conecta flujos de telemetría MQTT a mapas geoespaciales 3D en vivo. Plataforma de gemelo digital industrial para NOCs, salas de control, servicios públicos y sistemas distribuidos.",
    ogTitle: "GIS Insight - Plataforma de Gemelo Digital en Tiempo Real",
    ogDescription: "Visualiza tu infraestructura en tiempo real. Conecta miles de millones de señales MQTT desde sensores, PLCs y dispositivos edge en mapas geoespaciales en vivo.",
    keywords: "gemelo digital, visualización MQTT, IoT industrial, plataforma geoespacial, monitoreo tiempo real, software NOC, sistemas sala control, telemetría industrial, plataforma IoT"
  },
  pt: {
    title: "GIS Insight - Plataforma de Gêmeo Digital Industrial | Visualização MQTT em Tempo Real",
    description: "Conecte fluxos de telemetria MQTT a mapas geoespaciais 3D ao vivo. Plataforma de gêmeo digital industrial para NOCs, salas de controle, utilidades e sistemas distribuídos.",
    ogTitle: "GIS Insight - Plataforma de Gêmeo Digital em Tempo Real",
    ogDescription: "Visualize sua infraestrutura em tempo real. Conecte bilhões de sinais MQTT de sensores, PLCs e dispositivos edge em mapas geoespaciais ao vivo.",
    keywords: "gêmeo digital, visualização MQTT, IoT industrial, plataforma geoespacial, monitoramento tempo real, software NOC, sistemas sala controle, telemetria industrial"
  },
  ja: {
    title: "GIS Insight - 産業デジタルツインプラットフォーム | リアルタイムMQTT可視化",
    description: "MQTTテレメトリストリームをライブ3D地理空間マップに接続。NOC、制御室、公共事業、分散システム向けの産業デジタルツインプラットフォーム。",
    ogTitle: "GIS Insight - リアルタイム産業デジタルツインプラットフォーム",
    ogDescription: "インフラストラクチャをリアルタイムで可視化。センサー、PLC、エッジデバイスからの数十億のMQTT信号をライブ地理空間マップに接続。",
    keywords: "デジタルツイン, MQTT可視化, 産業IoT, 地理空間プラットフォーム, リアルタイム監視, NOCソフトウェア, 制御室システム, 産業テレメトリ"
  },
  fr: {
    title: "GIS Insight - Plateforme de Jumeau Numérique Industriel | Visualisation MQTT en Temps Réel",
    description: "Connectez les flux de télémétrie MQTT aux cartes géospatiales 3D en direct. Plateforme de jumeau numérique industriel pour NOC, salles de contrôle, services publics et systèmes distribués.",
    ogTitle: "GIS Insight - Plateforme de Jumeau Numérique en Temps Réel",
    ogDescription: "Visualisez votre infrastructure en temps réel. Connectez des milliards de signaux MQTT depuis capteurs, PLCs et dispositifs edge sur des cartes géospatiales en direct.",
    keywords: "jumeau numérique, visualisation MQTT, IoT industriel, plateforme géospatiale, surveillance temps réel, logiciel NOC, systèmes salle contrôle, télémétrie industrielle"
  },
  de: {
    title: "GIS Insight - Industrielle Digital Twin Plattform | Echtzeit-MQTT-Visualisierung",
    description: "Verbinden Sie MQTT-Telemetrieströme mit Live-3D-Geodatenkarten. Industrielle Digital-Twin-Plattform für NOCs, Kontrollräume, Versorgungsunternehmen und verteilte Systeme.",
    ogTitle: "GIS Insight - Echtzeit-Industrial Digital Twin Plattform",
    ogDescription: "Visualisieren Sie Ihre Infrastruktur in Echtzeit. Verbinden Sie Milliarden von MQTT-Signalen von Sensoren, PLCs und Edge-Geräten auf Live-Geodatenkarten.",
    keywords: "Digital Twin, MQTT-Visualisierung, Industrielles IoT, Geospatiale Plattform, Echtzeit-Überwachung, NOC-Software, Kontrollraum-Systeme, Industrielle Telemetrie"
  }
};

// Generar metadata para cada página
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const localeTyped = locale as Locale;
  const translations = metadataTranslations[localeTyped] || metadataTranslations.en;
  const baseUrl = 'https://gisinsight.io';
  const currentUrl = localeTyped === 'en' ? baseUrl : `${baseUrl}/${localeTyped}`;

  // Mapeo de locales a códigos de Open Graph
  const ogLocaleMap = {
    en: 'en_US',
    es: 'es_ES',
    pt: 'pt_BR',
    ja: 'ja_JP',
    fr: 'fr_FR',
    de: 'de_DE'
  };

  return {
    title: {
      default: translations.title,
      template: `%s | GIS Insight`
    },
    description: translations.description,
    
    keywords: translations.keywords,

    authors: [{ name: "GIS Insight" }],
    creator: "GIS Insight",
    publisher: "GIS Insight",

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
      locale: ogLocaleMap[localeTyped] || 'en_US',
      url: currentUrl,
      siteName: 'GIS Insight',
      title: translations.ogTitle,
      description: translations.ogDescription,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'GIS Insight - Industrial Digital Twin Platform',
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: translations.ogTitle,
      description: translations.ogDescription,
      images: [`${baseUrl}/twitter-image.jpg`],
      creator: '@gisinsight',
    },

    alternates: {
      canonical: currentUrl,
      languages: {
        'x-default': `${baseUrl}`,
        'en-US': `${baseUrl}`,
        'es-ES': `${baseUrl}/es`,
        'pt-BR': `${baseUrl}/pt`,
        'ja-JP': `${baseUrl}/ja`,
        'fr-FR': `${baseUrl}/fr`,
        'de-DE': `${baseUrl}/de`,
      },
    },

    // Schema.org structured data para SEO técnico
    other: {
      'application-name': 'GIS Insight',
      'msapplication-TileColor': '#06b6d4',
      'theme-color': '#0f172a',
    },
  };
}

// Generar rutas estáticas para cada idioma
export function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

// Layout component
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Verificar que el idioma es válido
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return (
    <>
      {/* Aurora como fondo fijo con colores tech/industrial */}
      <div className="fixed inset-0 -z-10">
        <Aurora
          colorStops={["#06b6d4", "#3b82f6", "#8b5cf6"]} // Cyan, Blue, Purple
          blend={0.4}
          amplitude={0.8}
          speed={0.3}
        />
      </div>
      
      {/* Overlay gradient para efecto depth */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/80"></div>
      
      {/* Grid pattern overlay para efecto tech */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Contenido principal */}
      <div className="relative z-10">
        <Navbar initialLocale={locale as Locale} />
        {children}
      </div>
    </>
  );
}