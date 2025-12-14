// app/[locale]/blog/page.tsx
import { HubSpotBlogService } from '@/lib/hubspot';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

const hubspot = new HubSpotBlogService();

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

// Función para extraer el slug final de la URL completa
function extractSlug(fullSlug: string, locale: string): string {
  let cleanSlug = fullSlug;
  
  if (cleanSlug.startsWith(`${locale}/blog/`)) {
    cleanSlug = cleanSlug.replace(`${locale}/blog/`, '');
  } else if (cleanSlug.startsWith('blog/')) {
    cleanSlug = cleanSlug.replace('blog/', '');
  }
  
  return cleanSlug;
}

// Metadatos para SEO multiidioma
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: 'Blog - Industrial IoT & Digital Twin Insights | GIS Insight',
      description: 'Latest insights on MQTT telemetry, real-time geospatial visualization, digital twin platforms, and industrial IoT operations. Expert guidance for NOCs, control rooms, and distributed systems.'
    },
    es: {
      title: 'Blog - Insights de IoT Industrial y Gemelo Digital | GIS Insight',
      description: 'Últimas ideas sobre telemetría MQTT, visualización geoespacial en tiempo real, plataformas de gemelo digital y operaciones IoT industriales. Orientación experta para NOCs, salas de control y sistemas distribuidos.'
    },
    fr: {
      title: 'Blog - Perspectives IoT Industriel et Jumeau Numérique | GIS Insight',
      description: 'Dernières perspectives sur la télémétrie MQTT, la visualisation géospatiale en temps réel, les plateformes de jumeau numérique et les opérations IoT industrielles.'
    },
    pt: {
      title: 'Blog - Insights de IoT Industrial e Gêmeo Digital | GIS Insight',
      description: 'Últimas ideias sobre telemetria MQTT, visualização geoespacial em tempo real, plataformas de gêmeo digital e operações IoT industriais.'
    },
    ja: {
      title: 'ブログ - 産業IoTとデジタルツインの洞察 | GIS Insight',
      description: 'MQTTテレメトリ、リアルタイム地理空間可視化、デジタルツインプラットフォーム、産業IoT運用に関する最新の洞察。'
    },
    de: {
      title: 'Blog - Industrielle IoT & Digital Twin Einblicke | GIS Insight',
      description: 'Neueste Einblicke in MQTT-Telemetrie, Echtzeit-Geospatial-Visualisierung, Digital-Twin-Plattformen und industrielle IoT-Operationen.'
    }
  };

  const currentSeo = seoData[locale as keyof typeof seoData] || seoData.en;
  
  return {
    title: currentSeo.title,
    description: currentSeo.description,
    openGraph: {
      title: currentSeo.title,
      description: currentSeo.description,
      type: 'website',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: currentSeo.title,
      description: currentSeo.description,
    },
    alternates: {
      languages: {
        'en': '/en/blog',
        'es': '/es/blog',
        'fr': '/fr/blog',
        'pt': '/pt/blog',
        'ja': '/ja/blog',
        'de': '/de/blog',
        'x-default': '/en/blog',
      },
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  
  // Textos localizados para la interfaz
  const texts = {
    en: {
      title: 'Insights & Updates',
      subtitle: 'Real-time operational intelligence for distributed systems',
      noPosts: 'No posts found for this language.',
      readMore: 'Read more',
      dateFormat: 'en-US',
      categories: {
        mqtt: 'MQTT',
        iot: 'Industrial IoT',
        digital_twin: 'Digital Twin',
        geospatial: 'Geospatial'
      }
    },
    es: {
      title: 'Insights y Actualizaciones',
      subtitle: 'Inteligencia operacional en tiempo real para sistemas distribuidos',
      noPosts: 'No se encontraron artículos para este idioma.',
      readMore: 'Leer más',
      dateFormat: 'es-ES',
      categories: {
        mqtt: 'MQTT',
        iot: 'IoT Industrial',
        digital_twin: 'Gemelo Digital',
        geospatial: 'Geoespacial'
      }
    },
    fr: {
      title: 'Perspectives et Mises à Jour',
      subtitle: 'Intelligence opérationnelle en temps réel pour systèmes distribués',
      noPosts: 'Aucun article trouvé pour cette langue.',
      readMore: 'Lire la suite',
      dateFormat: 'fr-FR',
      categories: {
        mqtt: 'MQTT',
        iot: 'IoT Industriel',
        digital_twin: 'Jumeau Numérique',
        geospatial: 'Géospatial'
      }
    },
    pt: {
      title: 'Insights e Atualizações',
      subtitle: 'Inteligência operacional em tempo real para sistemas distribuídos',
      noPosts: 'Nenhum artigo encontrado para este idioma.',
      readMore: 'Ler mais',
      dateFormat: 'pt-BR',
      categories: {
        mqtt: 'MQTT',
        iot: 'IoT Industrial',
        digital_twin: 'Gêmeo Digital',
        geospatial: 'Geoespacial'
      }
    },
    ja: {
      title: 'インサイトと最新情報',
      subtitle: '分散システムのリアルタイム運用インテリジェンス',
      noPosts: 'この言語の記事が見つかりません。',
      readMore: '続きを読む',
      dateFormat: 'ja-JP',
      categories: {
        mqtt: 'MQTT',
        iot: '産業IoT',
        digital_twin: 'デジタルツイン',
        geospatial: '地理空間'
      }
    },
    de: {
      title: 'Einblicke & Updates',
      subtitle: 'Echtzeit-Betriebsintelligenz für verteilte Systeme',
      noPosts: 'Keine Beiträge für diese Sprache gefunden.',
      readMore: 'Weiterlesen',
      dateFormat: 'de-DE',
      categories: {
        mqtt: 'MQTT',
        iot: 'Industrielles IoT',
        digital_twin: 'Digital Twin',
        geospatial: 'Geospatial'
      }
    }
  };

  const currentTexts = texts[locale as keyof typeof texts] || texts.en;
  
  // Obtener posts filtrados por idioma
  const posts = await hubspot.getPostsByLanguage(locale);
  
  if (!posts.length) {
    return (
        <div className="min-h-screen ">
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {currentTexts.title}
              </h1>
              <p className="text-xl text-gray-400 mb-12">{currentTexts.subtitle}</p>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                <p className="text-gray-300">{currentTexts.noPosts}</p>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="border-b border-white/10 ">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
              {currentTexts.title}
            </h1>
            <p className="text-xl text-gray-300 font-light tracking-wide">
              {currentTexts.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {posts.map((post) => {
            const cleanSlug = extractSlug(post.slug, locale);
            
            return (
              <article 
                key={post.id} 
                className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden hover:border-cyan-400/40 transition-all duration-500 hover:scale-[1.03] hover:shadow-cyan-500/20"
              >
                {/* Gradient overlay animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:via-blue-500/10 group-hover:to-purple-500/10 transition-all duration-700 pointer-events-none"></div>
                
                {/* Featured Image with tech overlay */}
                {post.featuredImage && (
                  <div className="relative overflow-hidden">
                    <img 
                      src={post.featuredImage}
                      alt={post.name}
                      className="w-full h-56 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                    />
                    {/* Tech grid overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>
                )}
                
                <div className="relative p-8 z-10">
                  {/* Title with gradient effect */}
                  <h2 className="text-2xl font-bold mb-4 leading-tight">
                    <Link
                      href={`/${locale}/blog/${cleanSlug}`}
                      className="text-white hover:text-transparent hover:bg-gradient-to-r hover:from-cyan-400 hover:to-blue-400 hover:bg-clip-text transition-all duration-300"
                    >
                      {post.name}
                    </Link>
                  </h2>
                  
                  {/* Description */}
                  {post.metaDescription && (
                    <p className="text-gray-400 mb-6 leading-relaxed text-base font-light line-clamp-3">
                      {post.metaDescription}
                    </p>
                  )}
                  
                  {/* Footer with enhanced styling */}
                  <div className="flex justify-between items-center bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/10 group-hover:border-cyan-400/30 transition-all duration-300">
                    <time className="text-sm text-cyan-400/80 font-medium tracking-wide flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(post.publishDate).toLocaleDateString(currentTexts.dateFormat, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                    
                    <Link
                      href={`/${locale}/blog/${cleanSlug}`}
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm tracking-wide transition-all duration-300 hover:gap-3 group-hover:translate-x-1"
                    >
                      {currentTexts.readMore}
                      <svg 
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
                
                {/* Top accent line with gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"></div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}