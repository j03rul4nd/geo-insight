import { Eye, EyeOff } from 'lucide-react';

interface RawMessage {
  id: string;
  timestamp: Date | string;
  [key: string]: any;
}

interface RawMessagePreviewProps {
  rawMessages: RawMessage[];
  selectedMessageIndex: number;
  onSelectMessage: (index: number) => void;
  showRawPreview: boolean;
  onTogglePreview: () => void;
}

export default function RawMessagePreview({
  rawMessages,
  selectedMessageIndex,
  onSelectMessage,
  showRawPreview,
  onTogglePreview
}: RawMessagePreviewProps) {
  const sampleMessage = rawMessages[selectedMessageIndex];

  return (
    <div className="bg-[#27272a] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-100">Mensaje de ejemplo</h3>
        <div className="flex items-center gap-2">
          <select 
            value={selectedMessageIndex}
            onChange={(e) => onSelectMessage(Number(e.target.value))}
            className="bg-[#18181b] text-xs px-2 py-1 rounded border border-[#3f3f46]"
          >
            {rawMessages.slice(0, 10).map((_, i) => (
              <option key={i} value={i}>Mensaje #{i + 1}</option>
            ))}
          </select>
          <button 
            onClick={onTogglePreview}
            className="p-1 hover:bg-[#3f3f46] rounded"
          >
            {showRawPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
    {showRawPreview && (
        <div className="bg-[#18181b] rounded p-3 border border-[#3f3f46]">
          <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
            {JSON.stringify(sampleMessage?.metadata?.originalPayload || sampleMessage, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}