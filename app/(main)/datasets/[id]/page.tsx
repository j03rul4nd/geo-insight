// app/datasets/[id]/page.tsx
import DatasetViewer from './_components/DatasetViewer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DatasetPage({ params }: PageProps) {
  // ✅ CRÍTICO: Await params antes de acceder a sus propiedades
  const resolvedParams = await params;
  
  console.log('🔍 Page params (resolved):', resolvedParams);
  console.log('🔍 Dataset ID:', resolvedParams.id);
  
  return <DatasetViewer datasetId={resolvedParams.id} />;
}