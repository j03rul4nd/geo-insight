import { AlertCircle } from 'lucide-react';

interface WaitingForMQTTProps {
  onClose: () => void;
}

export default function WaitingForMQTT({ onClose }: WaitingForMQTTProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#18181b] rounded-lg shadow-xl max-w-md w-full p-6 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2 text-gray-100">Esperando datos MQTT</h2>
        <p className="text-gray-400 text-sm mb-4">
          Conectado al broker, pero no se han recibido mensajes aún.
        </p>
        <button 
          onClick={onClose} 
          className="px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded text-sm transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}