'use client'
import { SignedIn } from "@clerk/nextjs";
import { useState, useCallback, useEffect, ReactNode, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  CheckCircle, 
  FileText, 
  AlertCircle
} from 'lucide-react'
import { extractTextFromPDF } from '@/lib/pdfUtils'
import PromptUsageDisplay, { PromptUsageDisplayRef } from '@/components/PromptUsageDisplay'
import { usePromptUsage } from '@/hooks/usePromptUsage'

// Tipos específicos para los elementos de formato
type FormattedElement = ReactNode;

export default function DashboardContent() {

    const router = useRouter()
    const searchParams = useSearchParams()
    const { forceRefresh } = usePromptUsage()
    const promptUsageRef = useRef<PromptUsageDisplayRef>(null)

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [summary, setSummary] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)

    useEffect(() => {
        const isPaymentSuccess = searchParams?.get('payment') === 'success';
                                
        if (isPaymentSuccess) {
            setShowPaymentSuccess(true)
            router.replace('/dashboard')
            
            const timer = setTimeout(() => {
            setShowPaymentSuccess(false)
            }, 5000)
            
            return () => clearTimeout(timer)
        }
    }, [searchParams, router])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('')
        
        if (!e.target.files?.[0]) return
        
        setSelectedFile(e.target.files[0])
    }

    //TODO: handleAnalyze function
    const handleAnalyze = useCallback(async () => {
        if (!selectedFile) {
            setError('Please select a file before analyzing.')
            return
        }

        setIsLoading(true)
        setError('')
        setSummary('')

        try {
            
            const text = await extractTextFromPDF(selectedFile);
          
             
            const response = await fetch('/api/analyzed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ text: text.substring(0, 10000)})
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
              /*** 
             */
            //setSummary(text)
            setSummary(data.summary || 'No summary was generated.')
            
            // Pequeño delay para asegurar que la base de datos se haya actualizado
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Actualizar el componente de uso de prompts después de un análisis exitoso
            // Usar forceRefresh para asegurar que se actualice inmediatamente
            await Promise.all([
                forceRefresh(),
                promptUsageRef.current?.refresh()
            ])
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze PDF.')
        } finally {
            setIsLoading(false)
        }
    }, [selectedFile, forceRefresh])


    const formatSummaryContent = (text: string): FormattedElement[] => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const elements: FormattedElement[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Títulos H1
    if (trimmedLine.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-3xl font-bold mt-8 mb-6 bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
          {trimmedLine.replace(/^# /, '')}
        </h1>
      );
      continue;
    }
    
    // Títulos H2
    if (trimmedLine.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-2xl font-semibold mt-7 mb-4 text-purple-200 border-b border-purple-400/30 pb-2">
          {trimmedLine.replace(/^## /, '')}
        </h2>
      );
      continue;
    }
    
    // Títulos H3
    if (trimmedLine.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-xl font-medium mt-6 mb-3 text-purple-300">
          {trimmedLine.replace(/^### /, '')}
        </h3>
      );
      continue;
    }
    
    // Títulos H4, H5, H6
    if (trimmedLine.startsWith('#### ')) {
      elements.push(
        <h4 key={i} className="text-lg font-medium mt-5 mb-2 text-purple-400">
          {trimmedLine.replace(/^#### /, '')}
        </h4>
      );
      continue;
    }
    
    // Listas con bullets (-)
    if (trimmedLine.startsWith('- ')) {
      const listItems = [trimmedLine];
      let j = i + 1;
      
      // Buscar elementos consecutivos de lista
      while (j < lines.length && lines[j].trim().startsWith('- ')) {
        listItems.push(lines[j].trim());
        j++;
      }
      
      elements.push(
        <ul key={i} className="mb-4 space-y-2 ml-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-gray-200 leading-relaxed hover:text-white transition-colors flex items-start">
              <span className="text-purple-300 mr-3 mt-1">•</span>
              <span>{formatInlineText(item.replace(/^- /, ''))}</span>
            </li>
          ))}
        </ul>
      );
      
      i = j - 1; // Ajustar el índice
      continue;
    }
    
    // Listas numeradas
    if (/^\d+\.\s/.test(trimmedLine)) {
      const listItems = [trimmedLine];
      let j = i + 1;
      
      // Buscar elementos consecutivos de lista numerada
      while (j < lines.length && /^\d+\.\s/.test(lines[j].trim())) {
        listItems.push(lines[j].trim());
        j++;
      }
      
      elements.push(
        <ol key={i} className="mb-4 space-y-2 ml-4 counter-reset-none">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-gray-200 leading-relaxed hover:text-white transition-colors flex items-start">
              <span className="text-purple-300 mr-3 mt-1 font-medium">{idx + 1}.</span>
              <span>{formatInlineText(item.replace(/^\d+\.\s/, ''))}</span>
            </li>
          ))}
        </ol>
      );
      
      i = j - 1;
      continue;
    }
    
    // Citas/Blockquotes
    if (trimmedLine.startsWith('> ')) {
      const quoteLines = [trimmedLine];
      let j = i + 1;
      
      // Buscar líneas consecutivas de cita
      while (j < lines.length && lines[j].trim().startsWith('> ')) {
        quoteLines.push(lines[j].trim());
        j++;
      }
      
      const quoteText = quoteLines.map(line => line.replace(/^> /, '')).join(' ');
      
      elements.push(
        <blockquote key={i} className="mb-4 pl-4 border-l-4 border-purple-400/60 bg-purple-900/20 py-3 rounded-r-lg">
          <p className="text-purple-100 italic leading-relaxed">
            {formatInlineText(quoteText)}
          </p>
        </blockquote>
      );
      
      i = j - 1;
      continue;
    }
    
    // Código en bloque (```)
    if (trimmedLine.startsWith('```')) {
      const codeLines = [];
      let j = i + 1;
      
      // Buscar el cierre del bloque de código
      while (j < lines.length && !lines[j].trim().startsWith('```')) {
        codeLines.push(lines[j]);
        j++;
      }
      
      const language = trimmedLine.replace('```', '') || 'text';
      
      elements.push(
        <div key={i} className="mb-4 rounded-lg overflow-hidden border border-gray-600">
          <div className="bg-gray-700 px-4 py-2 text-sm text-gray-300 border-b border-gray-600">
            {language}
          </div>
          <pre className="bg-gray-800/80 p-4 overflow-x-auto">
            <code className="text-green-300 text-sm font-mono whitespace-pre">
              {codeLines.join('\n')}
            </code>
          </pre>
        </div>
      );
      
      i = j; // Saltar el cierre ```
      continue;
    }
    
    // Separadores horizontales
    if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
      elements.push(
        <hr key={i} className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
      );
      continue;
    }
    
    // Párrafos normales (por defecto)
    if (trimmedLine.length > 0) {
      elements.push(
        <p key={i} className="mb-4 text-gray-200 leading-relaxed hover:text-white transition-colors first-letter:text-lg first-letter:font-medium">
          {formatInlineText(trimmedLine)}
        </p>
      );
    }
  }
  
  return elements;
};

// Función auxiliar para formatear texto inline (negritas, cursivas, enlaces, etc.)
const formatInlineText = (text: string): (string | ReactNode)[] => {
  const elements: (string | ReactNode)[] = [];
  const currentText = text;
  let keyCounter = 0;
  
  // Tipos para los patrones inline
  interface InlinePattern {
    regex: RegExp;
    render: (match: string, text: string, url?: string) => ReactNode;
  }
  
  // Procesar elementos inline en orden de prioridad
  const inlinePatterns: InlinePattern[] = [
    // Enlaces [texto](url)
    {
      regex: /\[([^\]]+)\]\(([^)]+)\)/g,
      render: (match: string, linkText: string, url?: string) => (
        <a 
          key={keyCounter++} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-purple-300 hover:text-purple-200 underline underline-offset-2 hover:underline-offset-4 transition-all"
        >
          {linkText}
        </a>
      )
    },
    // Texto en negrita **texto**
    {
      regex: /\*\*([^*]+)\*\*/g,
      render: (match: string, text: string) => (
        <strong key={keyCounter++} className="font-semibold text-white">
          {text}
        </strong>
      )
    },
    // Texto en cursiva *texto*
    {
      regex: /\*([^*]+)\*/g,
      render: (match: string, text: string) => (
        <em key={keyCounter++} className="italic text-purple-100">
          {text}
        </em>
      )
    },
    // Código inline `código`
    {
      regex: /`([^`]+)`/g,
      render: (match: string, code: string) => (
        <code key={keyCounter++} className="bg-gray-700/60 text-green-300 px-2 py-1 rounded text-sm font-mono">
          {code}
        </code>
      )
    },
    // Texto tachado ~~texto~~
    {
      regex: /~~([^~]+)~~/g,
      render: (match: string, text: string) => (
        <del key={keyCounter++} className="line-through text-gray-400">
          {text}
        </del>
      )
    }
  ];
  
  // Dividir el texto y aplicar estilos
  let parts: (string | ReactNode)[] = [currentText];
  
  inlinePatterns.forEach(pattern => {
    const newParts: (string | ReactNode)[] = [];
    
    parts.forEach(part => {
      if (typeof part === 'string') {
        const matches = Array.from(part.matchAll(pattern.regex));
        if (matches.length === 0) {
          newParts.push(part);
          return;
        }
        
        let lastIndex = 0;
        matches.forEach(match => {
          // Agregar texto antes del match
          if (match.index !== undefined && match.index > lastIndex) {
            newParts.push(part.substring(lastIndex, match.index));
          }
          
          // Agregar el elemento renderizado
          newParts.push(pattern.render(match[0], match[1], match[2]));
          
          lastIndex = (match.index || 0) + match[0].length;
        });
        
        // Agregar texto después del último match
        if (lastIndex < part.length) {
          newParts.push(part.substring(lastIndex));
        }
      } else {
        newParts.push(part);
      }
    });
    
    parts = newParts;
  });
  
  return parts.filter(part => part !== '');
};
    



  return (
    <div className="p-4">
      {/* Add your dashboard content here */}

        <div className='min-h-[300vh] space-y-10 max-w-4xl mx-auto'>
            {showPaymentSuccess && (
                <div className='bg-green-500/10 max-w-xl mx-auto my-8 border border-green-500/20 rounded-xl p-4 text-green-400'>
                    <div className='flex items-center justify-center'>
                        <CheckCircle className='h-5 w-5 mr-4' />
                        <p>Payment successfull! Your subscription is now active!</p>
                    </div>
                </div>
            )}

            {/* Prompt Usage Display */}
            <SignedIn>
              <div className='p-6 rounded-2xl border border-purple-300/10 bg-black/30 shadow-[0_4px_20px_-10px] shadow-purple-200/30'>
                  <PromptUsageDisplay ref={promptUsageRef} />
              </div>
            </SignedIn>

            {/* File upload and analysis section */}
            <div className='p-10 space-y-8 rounded-2xl border border-purple-300/10 bg-black/30 shadow-[0_4px_20px_-10px] shadow-purple-200/30'>
                
                {/* File input for PDF selection */}
                <div className="relative">
                        <div className="my-2 ml-2 flex items-center text-xs text-gray-500">
                            <FileText className="h-3.5 w-3.5 mr-1.5" />
                            <span>Supported format: PDF</span>
                        </div>
                        <div className="border border-gray-700 rounded-xl p-1 bg-black/40 hover:border-purple-200/20 transition-colors">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf"
                                className="block w-full text-gray-300 file:mr-4 file:py-3 file:px-6 
                                        file:rounded-lg file:border-0 file:text-sm file:font-medium
                                        file:bg-purple-200/20 file:text-purple-200 hover:file:bg-purple-200/20 transition-all
                                        focus:outline-none cursor-pointer"
                            />
                        </div>
                </div>

                {/* Analyze button - disabled when no file selected or during loading */}
                <button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || isLoading}
                    className="group relative inline-flex items-center justify-center w-full gap-2 rounded-xl bg-black px-4 py-4
                                text-white transition-all hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF1E56] via-[#FF00FF] to-[#00FFFF]
                                opacity-70 blur-sm transition-all group-hover:opacity-100 disabled:opacity-40" />
                    <span className="absolute inset-0.5 rounded-xl bg-black/50" />
                    <span className="relative font-medium">
                        {isLoading ? 'Processing...' : 'Analyze Document'}
                    </span>
                </button>
            </div>

            {/* Error message - only shown when there's an error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                        <div>
                            <p className="font-medium mb-1">Error analyzing document</p>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary results - only shown when there's a summary */}
            {summary && (
                <div className="bg-black/20 shadow-[0_4px_20px_-10px] shadow-purple-200/30 rounded-2xl p-8 border border-[#2A2A35]">
                    {/* Summary header */}
                    <div className="flex items-center mb-6">
                        <div className="mr-3 p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                            <FileText className="h-6 w-6 text-purple-400" />
                        </div>
                    </div>
                    
                    {/* Formatted summary content */}
                    <div className="max-w-none px-6 py-5 rounded-xl bg-[#0f0f13] border border-[#2A2A35]">
                        {formatSummaryContent(summary)}
                    </div>
                </div>
            )}

            
        </div>


    </div>
  );
}