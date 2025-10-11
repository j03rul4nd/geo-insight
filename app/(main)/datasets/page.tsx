/**
 * app/(main)/datasets/page.tsx
 * 
 * Página principal del dashboard de datasets.
 * Muestra la lista de datasets y permite crear nuevos.
 */

import { Suspense } from 'react';
import DashboardContent from './_components/DashboardGis';
import AuthRequiredPopup from '@/components/AuthRequiredPopup';

// Componente de loading
function DashboardLoading() {
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DatasetsPage() {
  return (
    <div className="font-sans p-4">
      {/* Popup de autenticación requerida */}
      <AuthRequiredPopup showDelay={1500} />

      {/* Contenido principal con Suspense */}
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}