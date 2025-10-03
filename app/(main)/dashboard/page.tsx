import { Suspense } from 'react'
import DashboardContent from "./_components/DashboardContentGis"
import AuthRequiredPopup from "@/components/AuthRequiredPopup"
import { Toaster } from 'sonner';

// Componente de loading opcional
function DashboardLoading() {
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  )
}

export default function Dashboard() {   
  return (     
    <div className="font-sans p-4">       
      <Toaster position="top-right" />
      
      {/* Popup de autenticación requerida */}
      <AuthRequiredPopup showDelay={1500} />
      
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />     
      </Suspense>
    </div>   
  ) 
}