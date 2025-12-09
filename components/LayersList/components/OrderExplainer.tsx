/**
 * OrderExplainer - Componente educativo sobre el sistema de orden de layers
 */

'use client';

import React from 'react';
import { Info, X } from 'lucide-react';
import { OrderExplainerProps } from '../types';

export const OrderExplainer: React.FC<OrderExplainerProps> = ({ 
  visible, 
  onClose 
}) => {
  if (!visible) return null;

  return (
    <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 hover:bg-blue-500/20 rounded transition-colors"
        title="Close"
      >
        <X size={14} className="text-blue-400" />
      </button>

      <div className="flex items-start gap-3">
        <Info size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 pr-6">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">
            Understanding Layer Order (Z-Index)
          </h4>
          
          <div className="text-xs text-gray-300 space-y-3">
            {/* Concepto principal */}
            <p>
              <strong className="text-blue-300">Higher numbers = Higher priority</strong> 
              {' '}— Layers with higher order numbers render on top of layers with lower numbers.
            </p>

            {/* Ejemplo visual */}
            <div className="bg-[#27272a] rounded-lg p-3 space-y-2 font-mono text-[11px]">
              <div className="text-gray-400 mb-2 font-sans">Visual Example:</div>
              
              <div className="flex items-center gap-2">
                <span className="text-blue-400 w-16">Order 2:</span>
                <span className="text-red-400">🔴 Full Trains</span>
                <span className="text-gray-500 ml-auto">← Renders on top</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-blue-400 w-16">Order 1:</span>
                <span className="text-yellow-400">🟡 Express</span>
                <span className="text-gray-500 ml-auto">← Middle layer</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-blue-400 w-16">Order 0:</span>
                <span className="text-gray-400">⚪ All Trains</span>
                <span className="text-gray-500 ml-auto">← Base layer</span>
              </div>
            </div>

            {/* Caso de uso */}
            <div className="bg-[#27272a] rounded-lg p-3">
              <div className="text-yellow-400 font-semibold mb-1 font-sans">Example Use Case:</div>
              <p className="text-gray-300">
                If a train is both <strong>Express</strong> (order 1) and <strong>Full</strong> (order 2), 
                it will display with the <span className="text-red-400">red color</span> from 
                the "Full Trains" layer because order 2 takes priority over order 1.
              </p>
            </div>

            {/* Tips */}
            <div className="space-y-1 text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Use <strong>order 0</strong> for base/background layers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Use <strong>higher orders</strong> for specific conditions or highlights</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Gap numbers (0, 10, 20...) to leave room for future layers</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            Got it, hide this
          </button>
        </div>
      </div>
    </div>
  );
};