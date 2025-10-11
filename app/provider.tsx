/**
 * providers.tsx
 * 
 * Configura todos los providers necesarios para la aplicación:
 * - QueryClientProvider: React Query para gestión de estado del servidor
 * - Configuración de staleTime, cacheTime, retry logic
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Crear QueryClient una sola vez por cliente
  // No usar useMemo aquí porque puede causar problemas con Fast Refresh
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Datos considerados "frescos" por 5 minutos
            staleTime: 5 * 60 * 1000,
            // Mantener en cache por 10 minutos
            gcTime: 10 * 60 * 1000, // antes era cacheTime en v4
            // Refetch automático cuando la ventana recupera el foco
            refetchOnWindowFocus: true,
            // Refetch automático cuando se reconecta la red
            refetchOnReconnect: true,
            // No refetch automático al montar si los datos son frescos
            refetchOnMount: false,
            // Reintentos en caso de error
            retry: 1,
            // Delay entre reintentos (exponencial)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Reintentos para mutaciones (más conservador)
            retry: 0,
            // Callback global de error para mutaciones
            onError: (error) => {
              console.error('Mutation error:', error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          />
      )}
    </QueryClientProvider>
  );
}