import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

// ============================================
// COMPONENT: MetadataViewer
// Recursive component to display any metadata structure
// ============================================

interface MetadataViewerProps {
  data: any;
  level?: number;
  parentKey?: string;
}

const MetadataViewer: React.FC<MetadataViewerProps> = ({ 
  data, 
  level = 0,
  parentKey = 'root'
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Toggle expansion of a key
  const toggleKey = (key: string) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Get type badge color
  const getTypeBadge = (value: any): { label: string; color: string } => {
    if (value === null) return { label: 'null', color: 'bg-gray-600' };
    if (value === undefined) return { label: 'undef', color: 'bg-gray-600' };
    if (typeof value === 'boolean') return { label: 'bool', color: 'bg-purple-600' };
    if (typeof value === 'number') return { label: 'num', color: 'bg-blue-600' };
    if (typeof value === 'string') return { label: 'str', color: 'bg-green-600' };
    if (Array.isArray(value)) return { label: 'arr', color: 'bg-orange-600' };
    if (typeof value === 'object') return { label: 'obj', color: 'bg-yellow-600' };
    return { label: 'any', color: 'bg-gray-600' };
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
      // Truncate long strings
      return value.length > 50 ? `"${value.substring(0, 50)}..."` : `"${value}"`;
    }
    return String(value);
  };

  // Check if value is expandable (object or array)
  const isExpandable = (value: any): boolean => {
    return (typeof value === 'object' && value !== null) || Array.isArray(value);
  };

  // Get item count for arrays/objects
  const getItemCount = (value: any): number => {
    if (Array.isArray(value)) return value.length;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length;
    return 0;
  };

  // Render a single row
  const renderRow = (key: string, value: any, uniqueKey: string) => {
    const isExpanded = expandedKeys.has(uniqueKey);
    const canExpand = isExpandable(value);
    const typeBadge = getTypeBadge(value);
    const itemCount = getItemCount(value);
    const indent = level * 12;

    return (
      <div key={uniqueKey}>
        {/* Row Header */}
        <div
          className={`flex items-center py-1 px-2 hover:bg-[#3f3f46] rounded transition-colors ${
            canExpand ? 'cursor-pointer' : ''
          }`}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => canExpand && toggleKey(uniqueKey)}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-4 h-4 flex items-center justify-center mr-2">
            {canExpand && (
              isExpanded ? (
                <ChevronDown size={14} className="text-gray-400" />
              ) : (
                <ChevronRight size={14} className="text-gray-400" />
              )
            )}
          </div>

          {/* Key */}
          <span className="text-gray-300 font-medium mr-2 min-w-[100px]">
            {key}:
          </span>

          {/* Type Badge */}
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeBadge.color} text-white mr-2`}>
            {typeBadge.label}
          </span>

          {/* Value or Item Count */}
          {canExpand ? (
            <span className="text-gray-400 text-xs">
              {itemCount} {Array.isArray(value) ? 'items' : 'props'}
            </span>
          ) : (
            <span className="text-white text-xs flex-1 truncate">
              {formatValue(value)}
            </span>
          )}
        </div>

        {/* Nested Content */}
        {canExpand && isExpanded && (
          <div className="mt-1">
            {Array.isArray(value) ? (
              // Render array items
              value.map((item, index) => 
                renderRow(`[${index}]`, item, `${uniqueKey}.${index}`)
              )
            ) : (
              // Render object properties
              Object.entries(value).map(([nestedKey, nestedValue]) =>
                renderRow(nestedKey, nestedValue, `${uniqueKey}.${nestedKey}`)
              )
            )}
          </div>
        )}
      </div>
    );
  };

  // Handle null or undefined data
  if (data === null || data === undefined) {
    return (
      <div className="text-xs text-gray-400 italic p-2">
        No metadata available
      </div>
    );
  }

  // Handle primitive values
  if (!isExpandable(data)) {
    return (
      <div className="text-xs p-2">
        <span className="text-white">{formatValue(data)}</span>
      </div>
    );
  }

  // Render root level
  return (
    <div className="text-xs">
      {Array.isArray(data) ? (
        // Root is array
        data.map((item, index) => 
          renderRow(`[${index}]`, item, `${parentKey}.${index}`)
        )
      ) : (
        // Root is object
        Object.entries(data).map(([key, value]) =>
          renderRow(key, value, `${parentKey}.${key}`)
        )
      )}
    </div>
  );
};

export default MetadataViewer;